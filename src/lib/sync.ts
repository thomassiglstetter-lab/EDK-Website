import fs from "fs";
import path from "path";
import { syncNuLigaData, readCachedMatches, NuLigaData } from "@/lib/nuliga";
import { syncLeagueTable, getAllCachedLeagueTables, LeagueTableData } from "@/lib/tables";
import { getSiteData, setSiteData } from "@/lib/supabase";

const TEAMS_FILE = path.join(process.cwd(), "src", "data", "teams.json");
const SYNC_STATUS_FILE = path.join(process.cwd(), "src", "data", "sync_status.json");

export interface SyncStatus {
  lastSyncAttempt: string;
  lastSuccessfulSync: string;
  isSyncing: boolean;
  matchesCount: number;
  tablesSynced: number;
  error?: string | null;
  autoSyncEnabled: boolean;
  intervalMinutes: number;
}

// Default interval: 30 minutes
export const AUTO_SYNC_INTERVAL_MINUTES = 30;
export const AUTO_SYNC_THRESHOLD_MS = AUTO_SYNC_INTERVAL_MINUTES * 60 * 1000;

let inMemorySyncing = false;
let memorySyncStatus: SyncStatus | null = null;

export function getSyncStatus(): SyncStatus {
  if (memorySyncStatus) {
    return {
      ...memorySyncStatus,
      isSyncing: inMemorySyncing,
    };
  }

  try {
    if (fs.existsSync(SYNC_STATUS_FILE)) {
      const raw = fs.readFileSync(SYNC_STATUS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      memorySyncStatus = parsed;
      return {
        ...parsed,
        isSyncing: inMemorySyncing,
      };
    }
  } catch (err) {
    console.error("Error reading sync_status.json:", err);
  }

  const cachedMatches = readCachedMatches();
  const cachedTables = getAllCachedLeagueTables();

  return {
    lastSyncAttempt: cachedMatches.lastSynced || new Date().toISOString(),
    lastSuccessfulSync: cachedMatches.lastSynced || new Date().toISOString(),
    isSyncing: inMemorySyncing,
    matchesCount: cachedMatches.totalMatches || 0,
    tablesSynced: Object.keys(cachedTables).length,
    autoSyncEnabled: true,
    intervalMinutes: AUTO_SYNC_INTERVAL_MINUTES,
    error: null,
  };
}

export async function getSyncStatusAsync(): Promise<SyncStatus> {
  if (memorySyncStatus) {
    return {
      ...memorySyncStatus,
      isSyncing: inMemorySyncing,
    };
  }

  try {
    const fromDb = await getSiteData<SyncStatus | null>("sync_status", null);
    if (fromDb && typeof fromDb === "object") {
      memorySyncStatus = fromDb;
      return {
        ...fromDb,
        isSyncing: inMemorySyncing,
      };
    }
  } catch (err) {
    console.warn("Could not read sync_status from Supabase:", err);
  }

  return getSyncStatus();
}

export function saveSyncStatus(partial: Partial<SyncStatus>): SyncStatus {
  const current = getSyncStatus();
  const updated: SyncStatus = {
    ...current,
    ...partial,
    isSyncing: inMemorySyncing,
  };
  memorySyncStatus = updated;

  // Persist to Supabase asynchronously
  setSiteData("sync_status", updated).catch((err) =>
    console.error("Failed to save sync_status to Supabase:", err)
  );

  try {
    const dir = path.dirname(SYNC_STATUS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SYNC_STATUS_FILE, JSON.stringify(updated, null, 2), "utf-8");
  } catch {
    // Expected on read-only serverless filesystems
  }

  return updated;
}

/**
 * Performs a complete, synchronized fetch of all nuLiga data:
 * 1. Matches & Results (club 105665) -> src/data/matches.json
 * 2. Standings & Tables for all active teams with groupUrl -> src/data/tables.json
 * 3. Status updates -> src/data/sync_status.json
 */
export async function syncAllNuLigaData(force: boolean = false): Promise<{
  success: boolean;
  matchesCount: number;
  tablesCount: number;
  durationMs: number;
  error?: string;
}> {
  if (inMemorySyncing) {
    console.log("[nuLiga AutoSync] Sync already in progress, skipping concurrent call.");
    const current = getSyncStatus();
    return {
      success: true,
      matchesCount: current.matchesCount,
      tablesCount: current.tablesSynced,
      durationMs: 0,
    };
  }

  const startTime = Date.now();
  const status = getSyncStatus();

  // If not forced and recently synced within threshold, skip
  if (!force && status.lastSuccessfulSync) {
    const elapsed = Date.now() - new Date(status.lastSuccessfulSync).getTime();
    if (elapsed < AUTO_SYNC_THRESHOLD_MS) {
      console.log(`[nuLiga AutoSync] Data is fresh (${Math.round(elapsed / 60000)}m old, threshold: ${AUTO_SYNC_INTERVAL_MINUTES}m). Skipping sync.`);
      return {
        success: true,
        matchesCount: status.matchesCount,
        tablesCount: status.tablesSynced,
        durationMs: 0,
      };
    }
  }

  inMemorySyncing = true;
  saveSyncStatus({ lastSyncAttempt: new Date().toISOString() });

  try {
    console.log("[nuLiga AutoSync] Starting full automated sync (matches, results & tables)...");

    // 1. Sync matches & results
    const matchesData = await syncNuLigaData();
    const matchesCount = matchesData.matches.length;
    console.log(`[nuLiga AutoSync] Matches synced: ${matchesCount} games`);

    // 2. Sync league tables for all teams with valid nuLiga groupUrl
    let tablesCount = 0;
    try {
      let teams: Array<{ slug: string; name: string; groupUrl?: string }> = [];
      try {
        const fromDb = await getSiteData<any[]>("teams", []);
        if (Array.isArray(fromDb) && fromDb.length > 0) {
          teams = fromDb;
        }
      } catch {}

      if (teams.length === 0 && fs.existsSync(TEAMS_FILE)) {
        const teamsRaw = fs.readFileSync(TEAMS_FILE, "utf-8");
        teams = JSON.parse(teamsRaw);
      }

      const teamsWithUrls = teams.filter(
        (t) => t.groupUrl && t.groupUrl.startsWith("http") && t.groupUrl.includes("groupPage")
      );

      console.log(`[nuLiga AutoSync] Syncing tables for ${teamsWithUrls.length} teams...`);

        // Sync tables concurrently with timeout safety
        const tablePromises = teamsWithUrls.map(async (t) => {
          try {
            const res = await syncLeagueTable(t.slug, t.groupUrl!);
            if (res && res.rows && res.rows.length > 0) {
              return true;
            }
          } catch (e) {
            console.error(`[nuLiga AutoSync] Error syncing table for ${t.name}:`, e);
          }
          return false;
        });

        const results = await Promise.allSettled(tablePromises);
        tablesCount = results.filter((r) => r.status === "fulfilled" && r.value === true).length;
        console.log(`[nuLiga AutoSync] Successfully synced ${tablesCount} league tables.`);
      } catch (teamErr) {
        console.error("[nuLiga AutoSync] Error reading teams for table sync:", teamErr);
      }

    const durationMs = Date.now() - startTime;
    inMemorySyncing = false;
    saveSyncStatus({
      lastSuccessfulSync: new Date().toISOString(),
      matchesCount,
      tablesSynced: tablesCount,
      error: null,
      isSyncing: false,
    });

    console.log(`[nuLiga AutoSync] Completed full sync in ${durationMs}ms.`);
    return {
      success: true,
      matchesCount,
      tablesCount,
      durationMs,
    };
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    console.error("[nuLiga AutoSync] Full sync failed:", errorMsg);
    saveSyncStatus({ error: errorMsg });
    return {
      success: false,
      matchesCount: 0,
      tablesCount: 0,
      durationMs: Date.now() - startTime,
      error: errorMsg,
    };
  } finally {
    inMemorySyncing = false;
  }
}

/**
 * Checks if data is older than threshold, and triggers background sync if needed.
 * This is non-blocking (SWR pattern) so user requests are never delayed.
 */
export function triggerBackgroundSyncIfNeeded(): void {
  const status = getSyncStatus();
  if (inMemorySyncing) return;

  if (!status.lastSuccessfulSync) {
    syncAllNuLigaData().catch((e) => console.error("Initial background sync failed:", e));
    return;
  }

  const elapsed = Date.now() - new Date(status.lastSuccessfulSync).getTime();
  if (elapsed >= AUTO_SYNC_THRESHOLD_MS) {
    console.log(`[nuLiga AutoSync] Triggering background refresh (cache age: ${Math.round(elapsed / 60000)}m)...`);
    syncAllNuLigaData().catch((e) => console.error("Background auto-sync failed:", e));
  }
}

// Background scheduler singleton declaration
declare global {
  // eslint-disable-next-line no-var
  var __nuLigaAutoSyncInterval: NodeJS.Timeout | undefined;
}

/**
 * Starts a recurring background worker that synchronizes nuLiga data every 30 minutes.
 */
export function startAutoSyncWorker(): void {
  if (globalThis.__nuLigaAutoSyncInterval) {
    return;
  }

  console.log(`[nuLiga AutoSync] Background worker registered. Interval: ${AUTO_SYNC_INTERVAL_MINUTES} minutes.`);

  // Check on startup if sync is needed
  triggerBackgroundSyncIfNeeded();

  // Set recurring interval
  globalThis.__nuLigaAutoSyncInterval = setInterval(() => {
    console.log("[nuLiga AutoSync] Scheduled 30-minute interval triggered.");
    syncAllNuLigaData().catch((err) => console.error("[nuLiga AutoSync] Scheduled sync error:", err));
  }, AUTO_SYNC_THRESHOLD_MS);
}

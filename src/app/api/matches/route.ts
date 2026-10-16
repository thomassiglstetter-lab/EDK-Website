import { NextResponse } from "next/server";
import { getMatchesData, parseGermanDate } from "@/lib/nuliga";
import { syncAllNuLigaData, getSyncStatusAsync, AUTO_SYNC_THRESHOLD_MS } from "@/lib/sync";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceSync = searchParams.get("sync") === "true";

    // Check freshness: if older than threshold (30m) or empty, automatically sync now
    const currentStatus = await getSyncStatusAsync();
    const elapsed = currentStatus.lastSuccessfulSync
      ? Date.now() - new Date(currentStatus.lastSuccessfulSync).getTime()
      : Infinity;
    const isStale = elapsed >= AUTO_SYNC_THRESHOLD_MS || currentStatus.matchesCount === 0;

    if (forceSync || isStale) {
      try {
        await syncAllNuLigaData(true);
      } catch (syncErr) {
        console.error("Auto-sync error in /api/matches:", syncErr);
      }
    }

    const data = await getMatchesData();
    const syncStatus = await getSyncStatusAsync();

    // Separate into upcoming and results
    const results = data.matches.filter((m) => m.result !== null);
    
    // Sort results by date descending (most recent first)
    results.sort((a, b) => {
      const dateA = parseGermanDate(a.date, a.time);
      const dateB = parseGermanDate(b.date, b.time);
      return dateB.getTime() - dateA.getTime();
    });

    const upcoming = data.matches.filter((m) => m.result === null);
    // Sort upcoming by date ascending (closest next game first)
    upcoming.sort((a, b) => {
      const dateA = parseGermanDate(a.date, a.time);
      const dateB = parseGermanDate(b.date, b.time);
      return dateA.getTime() - dateB.getTime();
    });

    return NextResponse.json(
      {
        success: true,
        clubId: data.clubId,
        clubName: data.clubName,
        lastSynced: syncStatus.lastSuccessfulSync || data.lastSynced,
        nuLigaUrl: data.nuLigaUrl,
        halls: data.halls,
        totalMatches: data.totalMatches,
        upcomingCount: upcoming.length,
        resultsCount: results.length,
        upcoming,
        results,
        allMatches: data.matches,
        syncStatus,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/matches error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load matches" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const result = await syncAllNuLigaData(true);
    const syncStatus = await getSyncStatusAsync();
    return NextResponse.json({
      success: result.success,
      message: "nuLiga-Daten (Spiele, Ergebnisse & Tabellen) erfolgreich automatisch synchronisiert",
      totalMatches: result.matchesCount,
      tablesSynced: result.tablesCount,
      durationMs: result.durationMs,
      lastSynced: syncStatus.lastSuccessfulSync,
      syncStatus,
    });
  } catch (error) {
    console.error("POST /api/matches sync error:", error);
    return NextResponse.json(
      { success: false, error: "nuLiga sync failed" },
      { status: 500 }
    );
  }
}

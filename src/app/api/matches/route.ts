import { NextResponse } from "next/server";
import { readCachedMatches, parseGermanDate } from "@/lib/nuliga";
import { syncAllNuLigaData, triggerBackgroundSyncIfNeeded, getSyncStatus } from "@/lib/sync";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceSync = searchParams.get("sync") === "true";

    if (forceSync) {
      await syncAllNuLigaData(true);
    } else {
      // Non-blocking auto-refresh in background if cache is older than 30 minutes
      triggerBackgroundSyncIfNeeded();
    }

    const data = readCachedMatches();
    const syncStatus = getSyncStatus();

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

    return NextResponse.json({
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
    });
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
    const syncStatus = getSyncStatus();
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

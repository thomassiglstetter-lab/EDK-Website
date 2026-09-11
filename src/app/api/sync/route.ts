import { NextResponse } from "next/server";
import { syncAllNuLigaData, getSyncStatus } from "@/lib/sync";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const status = getSyncStatus();
    return NextResponse.json({
      success: true,
      status,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch sync status" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const result = await syncAllNuLigaData(true);
    const status = getSyncStatus();

    return NextResponse.json({
      success: result.success,
      message: result.success
        ? `Automatische Synchronisation abgeschlossen: ${result.matchesCount} Spiele & ${result.tablesCount} Tabellen aktualisiert.`
        : "Synchronisation fehlgeschlagen.",
      matchesCount: result.matchesCount,
      tablesCount: result.tablesCount,
      durationMs: result.durationMs,
      status,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Sync execution failed" },
      { status: 500 }
    );
  }
}

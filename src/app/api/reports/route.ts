import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

import { getSiteData, setSiteData } from "@/lib/supabase";

const DATA_FILE = path.join(process.cwd(), "src", "data", "reports.json");

export interface MatchReport {
  id: string;
  teamSlug: string;
  teamName: string;
  title: string;
  date: string;
  opponent: string;
  result?: string;
  isHome?: boolean;
  outcome?: "Sieg" | "Niederlage" | "Remis";
  excerpt: string;
  content: string;
  image?: string;
  author?: string;
  createdAt: string;
}

async function getReports(): Promise<MatchReport[]> {
  // 1. Try reading from Supabase site_data
  try {
    const fromDb = await getSiteData<MatchReport[]>("reports", []);
    if (Array.isArray(fromDb) && fromDb.length > 0) {
      return fromDb;
    }
  } catch (err) {
    console.warn("Could not read reports from Supabase, falling back to local file:", err);
  }

  // 2. Fallback to bundled src/data/reports.json
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading reports.json, falling back:", err);
    return [];
  }
}

async function saveReports(reports: MatchReport[]): Promise<boolean> {
  // 1. Save to Supabase (persistent on Vercel)
  const dbSaved = await setSiteData("reports", reports);

  // 2. Also try writing to local file if writable (local dev or backup)
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(reports, null, 2), "utf8");
  } catch {
    // Expected on Vercel serverless read-only filesystem
  }

  return dbSaved;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET: list all match reports or filter by ?team=slug
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const team = searchParams.get("team");

  const reports = await getReports();
  const filtered = team ? reports.filter((r) => r.teamSlug === team) : reports;

  return NextResponse.json(filtered, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

// POST: create new match report
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      teamSlug,
      teamName,
      title,
      date,
      opponent,
      result,
      isHome,
      outcome,
      excerpt,
      content,
      image,
      author,
    } = body;

    if (!teamSlug || !title || !opponent || !excerpt) {
      return NextResponse.json(
        { error: "Mannschaft, Titel, Gegner und Kurzbeschreibung sind erforderlich." },
        { status: 400 }
      );
    }

    const reports = await getReports();

    // Determine German date string if not provided
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const formattedDate = date || `${day}.${month}.${year}`;

    const newReport: MatchReport = {
      id: `rep-${Date.now()}`,
      teamSlug: teamSlug.trim(),
      teamName: teamName ? teamName.trim() : teamSlug,
      title: title.trim(),
      date: formattedDate,
      opponent: opponent.trim(),
      result: result ? result.trim() : undefined,
      isHome: isHome !== undefined ? Boolean(isHome) : true,
      outcome: outcome || "Sieg",
      excerpt: excerpt.trim(),
      content: content ? content.trim() : excerpt.trim(),
      image: image || undefined,
      author: author ? author.trim() : "Redaktion",
      createdAt: now.toISOString(),
    };

    reports.unshift(newReport);
    await saveReports(reports);

    return NextResponse.json(newReport, { status: 201 });
  } catch (err) {
    console.error("POST report error:", err);
    return NextResponse.json(
      { error: "Spielbericht konnte nicht erstellt werden." },
      { status: 500 }
    );
  }
}

// PUT: update existing match report
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      teamSlug,
      teamName,
      title,
      date,
      opponent,
      result,
      isHome,
      outcome,
      excerpt,
      content,
      image,
      author,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Berichts-ID fehlt." }, { status: 400 });
    }

    const reports = await getReports();
    const index = reports.findIndex((item) => item.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Spielbericht nicht gefunden." }, { status: 404 });
    }

    const updated: MatchReport = {
      ...reports[index],
      teamSlug: teamSlug !== undefined ? teamSlug.trim() : reports[index].teamSlug,
      teamName: teamName !== undefined ? teamName.trim() : reports[index].teamName,
      title: title !== undefined ? title.trim() : reports[index].title,
      date: date !== undefined ? date : reports[index].date,
      opponent: opponent !== undefined ? opponent.trim() : reports[index].opponent,
      result: result !== undefined ? result.trim() : reports[index].result,
      isHome: isHome !== undefined ? Boolean(isHome) : reports[index].isHome,
      outcome: outcome !== undefined ? outcome : reports[index].outcome,
      excerpt: excerpt !== undefined ? excerpt.trim() : reports[index].excerpt,
      content: content !== undefined ? content.trim() : reports[index].content,
      image: image !== undefined ? image : reports[index].image,
      author: author !== undefined ? author.trim() : reports[index].author,
    };

    reports[index] = updated;
    await saveReports(reports);

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT report error:", err);
    return NextResponse.json(
      { error: "Spielbericht konnte nicht aktualisiert werden." },
      { status: 500 }
    );
  }
}

// DELETE: remove match report
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Berichts-ID fehlt." }, { status: 400 });
    }

    const reports = await getReports();
    const filtered = reports.filter((item) => item.id !== id);

    if (filtered.length === reports.length) {
      return NextResponse.json({ error: "Spielbericht nicht gefunden." }, { status: 404 });
    }

    await saveReports(filtered);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (err) {
    console.error("DELETE report error:", err);
    return NextResponse.json(
      { error: "Spielbericht konnte nicht gelöscht werden." },
      { status: 500 }
    );
  }
}

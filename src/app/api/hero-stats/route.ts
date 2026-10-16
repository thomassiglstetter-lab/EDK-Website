import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getSiteData, setSiteData } from "@/lib/supabase";

const DATA_FILE = path.join(process.cwd(), "src", "data", "hero-stats.json");

export interface HeroStat {
  id: string;
  value: string;
  label: string;
  accent: "crimson" | "white" | "azure" | "gold" | "emerald";
  link?: string;
}

const DEFAULT_STATS: HeroStat[] = [
  {
    id: "teams",
    value: "20+",
    label: "Teams im Spielbetrieb",
    accent: "crimson",
    link: "#teams",
  },
  {
    id: "players",
    value: "350+",
    label: "Aktive Handballer",
    accent: "white",
    link: "/verein",
  },
  {
    id: "halls",
    value: "6",
    label: "Moderne Hallen",
    accent: "azure",
    link: "/hallen",
  },
];

async function getHeroStats(): Promise<HeroStat[]> {
  // 1. Try reading from Supabase site_data
  try {
    const fromDb = await getSiteData<HeroStat[]>("hero_stats", []);
    if (Array.isArray(fromDb) && fromDb.length > 0) {
      return fromDb;
    }
  } catch (err) {
    console.warn("Could not read hero_stats from Supabase, falling back to local file:", err);
  }

  // 2. Fallback to bundled src/data/hero-stats.json
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error("Error reading hero-stats.json:", err);
  }

  return DEFAULT_STATS;
}

async function saveHeroStats(stats: HeroStat[]): Promise<boolean> {
  // 1. Save to Supabase (persistent on Vercel)
  const dbSaved = await setSiteData("hero_stats", stats);

  // 2. Also try writing to local file if writable (local dev backup)
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(stats, null, 2), "utf8");
  } catch {
    // Expected on Vercel serverless read-only filesystem
  }

  return dbSaved;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET: list hero stats
export async function GET() {
  try {
    const stats = await getHeroStats();
    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    console.error("GET /api/hero-stats error:", err);
    return NextResponse.json(DEFAULT_STATS, { status: 500 });
  }
}

// PUT: update hero stats (expects array of 3 stats)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json({ error: "Ungültiges Format für Kacheln" }, { status: 400 });
    }

    const cleanedStats: HeroStat[] = body.map((item, idx) => ({
      id: item.id || `stat-${idx + 1}`,
      value: String(item.value || "").trim() || "0",
      label: String(item.label || "").trim() || "Information",
      accent: ["crimson", "white", "azure", "gold", "emerald"].includes(item.accent)
        ? item.accent
        : idx === 0
        ? "crimson"
        : idx === 1
        ? "white"
        : "azure",
      link: typeof item.link === "string" ? item.link.trim() : "",
    }));

    await saveHeroStats(cleanedStats);

    return NextResponse.json(cleanedStats);
  } catch (err) {
    console.error("PUT /api/hero-stats error:", err);
    return NextResponse.json({ error: "Fehler beim Speichern der Kacheln" }, { status: 500 });
  }
}

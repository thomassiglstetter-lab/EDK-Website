import fs from "fs";
import path from "path";

export interface LeagueTableRow {
  rank: number;
  team: string;
  matches: number;
  won: number;
  draw: number;
  lost: number;
  goals: string;
  diff: string;
  points: string;
  isOwnClub: boolean;
}

export interface LeagueTableData {
  url: string;
  lastUpdated: string;
  rows: LeagueTableRow[];
}

const TABLES_FILE = path.join(process.cwd(), "src", "data", "tables.json");

export function getCachedLeagueTable(slug: string): LeagueTableData | null {
  try {
    if (fs.existsSync(TABLES_FILE)) {
      const raw = fs.readFileSync(TABLES_FILE, "utf-8");
      const data = JSON.parse(raw) as Record<string, LeagueTableData>;
      return data[slug] || null;
    }
  } catch (err) {
    console.error("Error reading tables.json:", err);
  }
  return null;
}

export function getAllCachedLeagueTables(): Record<string, LeagueTableData> {
  try {
    if (fs.existsSync(TABLES_FILE)) {
      const raw = fs.readFileSync(TABLES_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading tables.json:", err);
  }
  return {};
}

export async function syncLeagueTable(slug: string, groupUrl: string): Promise<LeagueTableData | null> {
  if (!groupUrl || !groupUrl.startsWith("http")) {
    return null;
  }

  try {
    const res = await fetch(groupUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      console.warn(`nuLiga fetch failed (${res.status}) for ${groupUrl}`);
      return getCachedLeagueTable(slug);
    }

    const html = await res.text();
    const tableMatches = html.match(/<table[^>]*class=["']result-set["'][^>]*>([\s\S]*?)<\/table>/gi);
    if (!tableMatches || tableMatches.length === 0) {
      return getCachedLeagueTable(slug);
    }

    // Usually the first result-set table on groupPage is the standings table
    const tableHtml = tableMatches[0];
    const trMatches = tableHtml.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
    if (!trMatches || trMatches.length <= 1) {
      return getCachedLeagueTable(slug);
    }

    const rows: LeagueTableRow[] = [];

    for (let i = 1; i < trMatches.length; i++) {
      const tr = trMatches[i];
      const cellMatches = tr.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi);
      if (!cellMatches) continue;

      const cells = cellMatches.map((c) =>
        c.replace(/<[^>]+>/g, "").trim()
      );

      // In nuLiga groupPage, cells format is typically:
      // [empty, rank, team, matches, won, draw, lost, goals, diff, points]
      let rank = 0;
      let teamName = "";
      let matches = 0;
      let won = 0;
      let draw = 0;
      let lost = 0;
      let goals = "0:0";
      let diff = "0";
      let points = "0:0";

      const numericIdx = cells.findIndex((c) => /^\d+$/.test(c));
      if (numericIdx !== -1 && cells.length > numericIdx + 7) {
        rank = parseInt(cells[numericIdx], 10);
        teamName = cells[numericIdx + 1] || "";
        matches = parseInt(cells[numericIdx + 2], 10) || 0;
        won = parseInt(cells[numericIdx + 3], 10) || 0;
        draw = parseInt(cells[numericIdx + 4], 10) || 0;
        lost = parseInt(cells[numericIdx + 5], 10) || 0;
        goals = cells[numericIdx + 6] || "0:0";
        diff = cells[numericIdx + 7] || "0";
        points = cells[numericIdx + 8] || "0:0";
      }

      if (teamName) {
        const lower = teamName.toLowerCase();
        // ASV Dachau is a completely separate rival club and must NEVER be flagged as own club!
        const isOwnClub =
          !lower.includes("asv") &&
          (lower.includes("eintracht") || lower.includes("dachau-karlsfeld"));

        rows.push({
          rank: rank || rows.length + 1,
          team: teamName,
          matches,
          won,
          draw,
          lost,
          goals,
          diff,
          points,
          isOwnClub,
        });
      }
    }

    if (rows.length > 0) {
      const allTables = getAllCachedLeagueTables();
      const updatedEntry: LeagueTableData = {
        url: groupUrl,
        lastUpdated: new Date().toISOString(),
        rows,
      };
      allTables[slug] = updatedEntry;

      fs.writeFileSync(TABLES_FILE, JSON.stringify(allTables, null, 2), "utf-8");
      return updatedEntry;
    }
  } catch (err) {
    console.error(`Error syncing table for ${slug}:`, err);
  }

  return getCachedLeagueTable(slug);
}

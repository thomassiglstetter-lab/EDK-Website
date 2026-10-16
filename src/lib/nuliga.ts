import fs from "fs";
import path from "path";
import { getSiteData, setSiteData } from "@/lib/supabase";

export interface NuLigaMatch {
  id: string;
  matchNr: string;
  day: string;
  date: string;
  time: string;
  league: string;
  home: string;
  guest: string;
  isHome: boolean;
  category: string;
  hallName: string;
  hallNr: string;
  courtUrl: string | null;
  result: string | null;
  homeScore: number | null;
  guestScore: number | null;
  outcome: "win" | "loss" | "draw" | null;
}

export interface NuLigaHall {
  name: string;
  nr: string;
  url: string;
}

export interface NuLigaData {
  clubId: string;
  clubName: string;
  federation: string;
  lastSynced: string;
  nuLigaUrl: string;
  halls: NuLigaHall[];
  totalMatches: number;
  matches: NuLigaMatch[];
}

const DATA_FILE = path.join(process.cwd(), "src", "data", "matches.json");
const CLUB_ID = "105665";
const BASE_URL = "https://bhv-handball.liga.nu/cgi-bin/WebObjects/nuLigaHBDE.woa/wa";

let memoryCachedMatches: NuLigaData | null = null;

function cleanText(s: string): string {
  if (!s) return "";
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseGermanDate(dateStr: string, timeStr?: string): Date {
  const parts = dateStr.split(".");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    let hours = 0;
    let minutes = 0;
    if (timeStr) {
      const tMatch = timeStr.match(/(\d{2}):(\d{2})/);
      if (tMatch) {
        hours = parseInt(tMatch[1], 10);
        minutes = parseInt(tMatch[2], 10);
      }
    }
    return new Date(year, month, day, hours, minutes);
  }
  return new Date();
}

export function readCachedMatches(): NuLigaData {
  if (memoryCachedMatches && memoryCachedMatches.matches && memoryCachedMatches.matches.length > 0) {
    return memoryCachedMatches;
  }

  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.matches) && parsed.matches.length > 0) {
        memoryCachedMatches = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading matches cache:", err);
  }

  return {
    clubId: CLUB_ID,
    clubName: "Eintracht Dachau-Karlsfeld",
    federation: "BHV",
    lastSynced: new Date().toISOString(),
    nuLigaUrl: `${BASE_URL}/clubInfoDisplay?club=${CLUB_ID}`,
    halls: [],
    totalMatches: 0,
    matches: [],
  };
}

export async function getMatchesData(): Promise<NuLigaData> {
  if (memoryCachedMatches && memoryCachedMatches.matches && memoryCachedMatches.matches.length > 0) {
    return memoryCachedMatches;
  }

  try {
    const fromDb = await getSiteData<NuLigaData | null>("matches", null);
    if (fromDb && Array.isArray(fromDb.matches) && fromDb.matches.length > 0) {
      memoryCachedMatches = fromDb;
      return fromDb;
    }
  } catch (err) {
    console.warn("Could not read matches from Supabase:", err);
  }

  return readCachedMatches();
}

export async function syncNuLigaData(): Promise<NuLigaData> {
  const matches: NuLigaMatch[] = [];

  try {
    // 1. Fetch full championship season
    const seasonUrl = `${BASE_URL}/clubMeetings?club=${CLUB_ID}&searchType=0&searchTimeRange=13-7929`;
    const resSeason = await fetch(seasonUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
      cache: "no-store",
    });

    if (resSeason.ok) {
      const html = await resSeason.text();
      const tableMatch = html.match(/<table class="result-set"[^>]*>([\s\S]*?)<\/table>/);
      if (tableMatch) {
        let currentDay = "";
        let currentDate = "";
        const rows = tableMatch[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/g) || [];

        for (const row of rows) {
          const tds = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g) || [];
          if (tds.length < 7) continue;

          const isColspan2 = /colspan="?2"?/i.test(tds[0]!);
          let colIdx = 0;

          if (isColspan2) {
            const rawCol = cleanText(tds[0]!.replace(/<[^>]+>/g, " "));
            currentDay = rawCol || "Termin offen";
            currentDate = currentDay;
            colIdx = 1;
          } else {
            const dRaw = cleanText(tds[0]!.replace(/<[^>]+>/g, " "));
            const dtRaw = cleanText(tds[1]!.replace(/<[^>]+>/g, " "));
            if (dRaw) currentDay = dRaw;
            if (dtRaw) currentDate = dtRaw;
            colIdx = 2;
          }

          const timeTd = tds[colIdx];
          const timeRaw = timeTd ? cleanText(timeTd.replace(/<[^>]+>/g, " ")) : "";
          const timeMatch = timeRaw.match(/\d{2}:\d{2}/);
          const timeStr = timeMatch ? timeMatch[0] : (timeRaw.includes(":") ? timeRaw : "");

          // Hallen info
          const hallTd = tds[colIdx + 1];
          const hallNameMatch = hallTd ? hallTd.match(/title="([^"]+)"/) : null;
          const hallName = hallNameMatch ? cleanText(hallNameMatch[1]) : "";
          const hallNr = hallTd ? cleanText(hallTd.replace(/<[^>]+>/g, " ")) : "";

          const courtUrlMatch = hallTd ? hallTd.match(/href="([^"]+)"/) : null;
          const courtUrl = courtUrlMatch
            ? `https://bhv-handball.liga.nu${courtUrlMatch[1]}`.replace(/&amp;/g, "&")
            : null;

          const matchNr = tds[colIdx + 2] ? cleanText(tds[colIdx + 2]!.replace(/<[^>]+>/g, " ")) : "";
          const league = tds[colIdx + 3] ? cleanText(tds[colIdx + 3]!.replace(/<[^>]+>/g, " ")) : "";
          const home = tds[colIdx + 4] ? cleanText(tds[colIdx + 4]!.replace(/<[^>]+>/g, " ")) : "";
          const guest = tds[colIdx + 5] ? cleanText(tds[colIdx + 5]!.replace(/<[^>]+>/g, " ")) : "";

          let result: string | null = null;
          let homeScore: number | null = null;
          let guestScore: number | null = null;

          for (let i = colIdx + 6; i < tds.length; i++) {
            const txt = cleanText(tds[i]!.replace(/<[^>]+>/g, " "));
            const sm = txt.match(/^(\d+)\s*:\s*(\d+)$/);
            if (sm) {
              homeScore = parseInt(sm[1], 10);
              guestScore = parseInt(sm[2], 10);
              result = `${homeScore}:${guestScore}`;
              break;
            } else if (txt === "NG" || txt.toLowerCase().includes("nicht gewertet")) {
              result = "NG";
              break;
            }
          }

          const isHome = !home.includes("ASV") && (home.includes("Eintracht") || home.includes("Dachau-Karlsfeld"));
          const isGuest = !guest.includes("ASV") && (guest.includes("Eintracht") || guest.includes("Dachau-Karlsfeld"));

          let outcome: "win" | "loss" | "draw" | null = null;
          if (result && (isHome || isGuest)) {
            const eintrachtScore = isHome ? homeScore! : guestScore!;
            const oppScore = isHome ? guestScore! : homeScore!;
            if (eintrachtScore > oppScore) outcome = "win";
            else if (eintrachtScore < oppScore) outcome = "loss";
            else outcome = "draw";
          }

          let cat = "Jugend";
          const l = league.trim();
          if (l === "BZL M") {
            cat = "Herren 1";
          } else if (l === "BZK M") {
            cat = "Herren 2";
          } else if (l === "BOL F") {
            cat = "Damen 1";
          } else if (l === "BZK F") {
            cat = "Damen 2";
          } else if (l === "BL mB") {
            cat = "mB-Jugend";
          } else if (l === "BL mC") {
            cat = "mC-Jugend";
          } else if (l === "OL WC" || l === "OL wC") {
            cat = "wC-Jugend";
          } else if (l === "BL wB") {
            cat = "wB-Jugend";
          } else if (l === "BzK mD VR" || l === "BzK wD VR" || l.includes("mD") || l.includes("wD")) {
            cat = "D-Jugend";
          } else {
            const up = l.toUpperCase();
            if (up === "BZK M") cat = "Herren 2";
            else if (up === "BZL M") cat = "Herren 1";
            else if (up === "BZK F") cat = "Damen 2";
            else if (up === "BOL F") cat = "Damen 1";
            else if (up.includes("MC")) cat = "mC-Jugend";
            else if (up.includes("MB")) cat = "mB-Jugend";
            else if (up.includes("WC")) cat = "wC-Jugend";
            else if (up.includes("WB")) cat = "wB-Jugend";
            else if (up.includes("MD") || up.includes("WD")) cat = "D-Jugend";
          }

          matches.push({
            id: matchNr || `m-${matches.length}`,
            matchNr,
            day: currentDay,
            date: currentDate,
            time: timeStr,
            league,
            home,
            guest,
            isHome,
            category: cat,
            hallName,
            hallNr,
            courtUrl,
            result,
            homeScore,
            guestScore,
            outcome,
          });
        }
      }
    }

    // 2. Fetch Rückschau from clubInfoDisplay to catch any newly played games
    const infoUrl = `${BASE_URL}/clubInfoDisplay?club=${CLUB_ID}`;
    const resInfo = await fetch(infoUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
      cache: "no-store",
    });

    if (resInfo.ok) {
      const htmlInfo = await resInfo.text();
      if (htmlInfo.includes("Rückschau")) {
        const part = htmlInfo.split("Rückschau")[1].split("</table>")[0];
        const rRows = part.match(/<tr[^>]*>([\s\S]*?)<\/tr>/g) || [];
        for (const row of rRows) {
          const tds = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g) || [];
          if (tds.length < 8) continue;
          const rNr = cleanText(tds[4]!.replace(/<[^>]+>/g, " "));
          for (let i = 8; i < tds.length; i++) {
            const txt = cleanText(tds[i]!.replace(/<[^>]+>/g, " "));
            const sm = txt.match(/^(\d+)\s*:\s*(\d+)$/);
            if (sm) {
              const hS = parseInt(sm[1], 10);
              const gS = parseInt(sm[2], 10);
              const existing = matches.find((m) => m.matchNr === rNr);
              if (existing) {
                existing.result = `${hS}:${gS}`;
                existing.homeScore = hS;
                existing.guestScore = gS;
                const eScore = existing.isHome ? hS : gS;
                const oScore = existing.isHome ? gS : hS;
                if (eScore > oScore) existing.outcome = "win";
                else if (eScore < oScore) existing.outcome = "loss";
                else existing.outcome = "draw";
              }
              break;
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("nuLiga scraping error:", err);
  }

  // If nuLiga request failed or returned no matches, return existing cache
  if (matches.length === 0) {
    return readCachedMatches();
  }

  const halls: NuLigaHall[] = [
    {
      name: "Dachau, Sporthalle Berufschule",
      nr: "260060",
      url: "http://bhv-handball.liga.nu/cgi-bin/WebObjects/nuLigaHBDE.woa/wa/courtInfo?federation=BHV&location=4936",
    },
    {
      name: "Dachau, Dr. Josef Schwalber Realschule",
      nr: "260068",
      url: "http://bhv-handball.liga.nu/cgi-bin/WebObjects/nuLigaHBDE.woa/wa/courtInfo?federation=BHV&location=16006",
    },
    {
      name: "Dachau, Sporthalle Augustenfeld",
      nr: "260069",
      url: "http://bhv-handball.liga.nu/cgi-bin/WebObjects/nuLigaHBDE.woa/wa/courtInfo?federation=BHV&location=17707",
    },
    {
      name: "Karlsfeld, Sporthalle Mittelschule (MSK)",
      nr: "260180",
      url: "http://bhv-handball.liga.nu/cgi-bin/WebObjects/nuLigaHBDE.woa/wa/courtInfo?federation=BHV&location=5254",
    },
    {
      name: "Karlsfeld, Sporthalle Grundschule (GSK)",
      nr: "260181",
      url: "http://bhv-handball.liga.nu/cgi-bin/WebObjects/nuLigaHBDE.woa/wa/courtInfo?federation=BHV&location=43209",
    },
  ];

  const updatedData: NuLigaData = {
    clubId: CLUB_ID,
    clubName: "Eintracht Dachau-Karlsfeld",
    federation: "BHV",
    lastSynced: new Date().toISOString(),
    nuLigaUrl: `${BASE_URL}/clubInfoDisplay?club=${CLUB_ID}`,
    halls,
    totalMatches: matches.length,
    matches,
  };

  memoryCachedMatches = updatedData;

  // 1. Save to Supabase (persistent across Vercel deployments & serverless cold starts)
  try {
    await setSiteData("matches", updatedData);
  } catch (dbErr) {
    console.error("Failed to save matches to Supabase:", dbErr);
  }

  // 2. Also write to local file if writable
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(updatedData, null, 2), "utf-8");
  } catch {
    // Expected on read-only serverless filesystems
  }

  return updatedData;
}

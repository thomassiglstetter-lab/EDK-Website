"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ExternalLink,
  ArrowRight,
  Shield,
  Activity,
  MapPin,
  Trophy,
  CheckCircle2,
  XCircle,
  MinusCircle,
  ChevronRight,
} from "lucide-react";
import initialMatchesJson from "@/data/matches.json";
import teamsData from "@/data/teams.json";

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

export interface MatchesApiResponse {
  success: boolean;
  clubId: string;
  clubName: string;
  lastSynced: string;
  nuLigaUrl: string;
  totalMatches: number;
  upcomingCount: number;
  resultsCount?: number;
  upcoming: NuLigaMatch[];
  results?: NuLigaMatch[];
}

const CATEGORY_TO_SLUG: Record<string, string> = {
  "Herren 1": "herren-1",
  "Herren 2": "herren-2",
  "Herren 3": "herren-3",
  "Herren 4": "herren-4",
  "Damen 1": "damen-1",
  "Damen 2": "damen-2",
  "mB-Jugend": "m-b1",
  "mC-Jugend": "m-c1",
  "wC-Jugend": "w-c1",
  "wB-Jugend": "w-b1",
  "Minis": "minis",
};

// Helper to parse German date DD.MM.YYYY into Date object
function parseDateParts(dateStr: string, timeStr: string = "12:00"): Date {
  const parts = dateStr.split(".");
  if (parts.length === 3) {
    const [d, m, y] = parts.map(Number);
    const [h, min] = timeStr.includes(":") ? timeStr.split(":").map(Number) : [12, 0];
    return new Date(y, m - 1, d, h || 12, min || 0);
  }
  return new Date();
}

// ASV Dachau is a completely separate rival club and must NEVER be highlighted!
const isOurClub = (name: string) =>
  !name.includes("ASV") && (name.includes("Eintracht") || name.includes("Dachau-Karlsfeld"));

// Prepare initial state from bundled matches.json
const rawMatches = (initialMatchesJson.matches || []) as NuLigaMatch[];
const initialUpcoming = rawMatches.filter((m) => m.result === null);
const initialResults = rawMatches.filter((m) => m.result !== null);
initialResults.sort((a, b) => {
  const tA = parseDateParts(a.date, a.time).getTime();
  const tB = parseDateParts(b.date, b.time).getTime();
  return tB - tA;
});

const initialMatchesState: MatchesApiResponse = {
  success: true,
  clubId: initialMatchesJson.clubId || "105665",
  clubName: initialMatchesJson.clubName || "Eintracht Dachau-Karlsfeld",
  lastSynced: initialMatchesJson.lastSynced || "",
  nuLigaUrl: initialMatchesJson.nuLigaUrl || "",
  totalMatches: rawMatches.length,
  upcomingCount: initialUpcoming.length,
  resultsCount: initialResults.length,
  upcoming: initialUpcoming,
  results: initialResults,
};

export function ScheduleSection() {
  const [data, setData] = useState<MatchesApiResponse>(initialMatchesState);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTeams, setActiveTeams] = useState<any[]>(teamsData);
  const [activeTab, setActiveTab] = useState<"upcoming" | "results">("upcoming");
  const [resultsCategoryFilter, setResultsCategoryFilter] = useState<string>("Alle");

  useEffect(() => {
    const loadTeams = () => {
      fetch(`/api/teams?_t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      })
        .then((res) => res.json())
        .then((teams) => {
          if (Array.isArray(teams)) {
            setActiveTeams(teams);
          }
        })
        .catch(() => {});
    };
    loadTeams();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "teams_updated") loadTeams();
    };
    const handleTeamsUpdated = () => loadTeams();
    window.addEventListener("focus", loadTeams);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("teams_updated", handleTeamsUpdated);
    return () => {
      window.removeEventListener("focus", loadTeams);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("teams_updated", handleTeamsUpdated);
    };
  }, []);

  const validTeamSlugs = useMemo(
    () => new Set(activeTeams.map((t) => t.slug)),
    [activeTeams]
  );

  useEffect(() => {
    fetch(`/api/matches?_t=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
    })
      .then((res) => res.json())
      .then((json: MatchesApiResponse) => {
        if (json.success) {
          setData(json);
        }
      })
      .catch((err) => console.error("Error updating matches in background:", err))
      .finally(() => setLoading(false));
  }, []);

  // Filter for the upcoming weekend matches
  // Filter for the upcoming weekend matches based on current date
  const { weekendMatches, weekendTitle, weekendDateLabel } = useMemo(() => {
    if (!data || !data.upcoming || data.upcoming.length === 0) {
      return { weekendMatches: [], weekendTitle: "Spiele am kommenden Wochenende", weekendDateLabel: "" };
    }

    // Filter out entries with invalid date or "Termin offen"
    const validUpcoming = data.upcoming.filter(
      (m) => m.date && m.date !== "Termin offen" && m.day !== "Termin offen"
    );

    if (validUpcoming.length === 0) {
      return { weekendMatches: [], weekendTitle: "Spiele am kommenden Wochenende", weekendDateLabel: "" };
    }

    // Sort upcoming ascending by date and time
    const sortedUpcoming = [...validUpcoming].sort((a, b) => {
      const tA = parseDateParts(a.date, a.time).getTime();
      const tB = parseDateParts(b.date, b.time).getTime();
      return tA - tB;
    });

    const now = new Date();
    // Today at 00:00:00
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

    // Calculate this coming weekend window (Friday to Sunday, plus Monday for long weekends)
    const jsDay = now.getDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat
    let fri = new Date(todayStart);

    if (jsDay === 5) {
      // Today is Friday
      fri = new Date(todayStart);
    } else if (jsDay === 6) {
      // Saturday -> Friday was yesterday
      fri.setDate(todayStart.getDate() - 1);
    } else if (jsDay === 0) {
      // Sunday -> Friday was 2 days ago
      fri.setDate(todayStart.getDate() - 2);
    } else {
      // Monday (1) to Thursday (4) -> next Friday
      const daysUntilFri = 5 - jsDay;
      fri.setDate(todayStart.getDate() + daysUntilFri);
    }

    const sat = new Date(fri); sat.setDate(fri.getDate() + 1);
    const sun = new Date(fri); sun.setDate(fri.getDate() + 2);
    const mon = new Date(fri); mon.setDate(fri.getDate() + 3);

    const formatShort = (d: Date) =>
      `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;

    let weekendDatesSet = new Set([
      formatShort(fri),
      formatShort(sat),
      formatShort(sun),
      formatShort(mon),
    ]);

    let matchesForWeekend = sortedUpcoming.filter((m) =>
      weekendDatesSet.has(m.date)
    );

    let displayFri = fri;
    let displaySun = sun;

    // If there are no games this weekend, find the NEXT future weekend with games (never look into the past!)
    if (matchesForWeekend.length === 0) {
      const nextFutureMatch = sortedUpcoming.find((m) => {
        const dt = parseDateParts(m.date, m.time);
        return dt.getTime() >= todayStart.getTime();
      });

      if (nextFutureMatch) {
        const nextDt = parseDateParts(nextFutureMatch.date, nextFutureMatch.time);
        const nextDay = nextDt.getDay();
        let nextFri = new Date(nextDt.getFullYear(), nextDt.getMonth(), nextDt.getDate(), 0, 0, 0);

        if (nextDay === 5) {
          nextFri = new Date(nextDt.getFullYear(), nextDt.getMonth(), nextDt.getDate(), 0, 0, 0);
        } else if (nextDay === 6) {
          nextFri.setDate(nextDt.getDate() - 1);
        } else if (nextDay === 0) {
          nextFri.setDate(nextDt.getDate() - 2);
        } else {
          const dFri = 5 - nextDay;
          nextFri.setDate(nextDt.getDate() + dFri);
        }

        const nextSat = new Date(nextFri); nextSat.setDate(nextFri.getDate() + 1);
        const nextSun = new Date(nextFri); nextSun.setDate(nextFri.getDate() + 2);
        const nextMon = new Date(nextFri); nextMon.setDate(nextFri.getDate() + 3);

        weekendDatesSet = new Set([
          formatShort(nextFri),
          formatShort(nextSat),
          formatShort(nextSun),
          formatShort(nextMon),
        ]);

        matchesForWeekend = sortedUpcoming.filter((m) =>
          weekendDatesSet.has(m.date)
        );

        displayFri = nextFri;
        displaySun = nextSun;
      }
    }

    // Sort matches chronologically
    matchesForWeekend.sort((a, b) => {
      const tA = parseDateParts(a.date, a.time).getTime();
      const tB = parseDateParts(b.date, b.time).getTime();
      return tA - tB;
    });

    // Human readable date label
    const datesInMatches = Array.from(new Set(matchesForWeekend.map((m) => m.date)));
    let dateLabel = "";
    if (datesInMatches.length === 1) {
      const singleDate = parseDateParts(datesInMatches[0]);
      dateLabel = singleDate.toLocaleDateString("de-DE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } else if (datesInMatches.length > 1) {
      const d1 = parseDateParts(datesInMatches[0]);
      const d2 = parseDateParts(datesInMatches[datesInMatches.length - 1]);
      if (d1.getMonth() === d2.getMonth()) {
        dateLabel = `${d1.getDate()}. – ${d2.getDate()}. ${d2.toLocaleDateString("de-DE", { month: "long", year: "numeric" })}`;
      } else {
        dateLabel = `${d1.getDate()}. ${d1.toLocaleDateString("de-DE", { month: "short" })} – ${d2.getDate()}. ${d2.toLocaleDateString("de-DE", { month: "long", year: "numeric" })}`;
      }
    } else {
      const sat = new Date(displayFri); sat.setDate(displayFri.getDate() + 1);
      dateLabel = `${sat.getDate()}. – ${displaySun.getDate()}. ${displaySun.toLocaleDateString("de-DE", { month: "long", year: "numeric" })}`;
    }

    return {
      weekendMatches: matchesForWeekend,
      weekendTitle: "Spiele am kommenden Wochenende",
      weekendDateLabel: dateLabel,
    };
  }, [data]);

  // Categories in results
  const resultCategories = useMemo(() => {
    if (!data || !data.results) return ["Alle"];
    const cats = Array.from(new Set(data.results.map((r) => r.category).filter(Boolean)));
    return ["Alle", ...cats];
  }, [data]);

  const filteredResults = useMemo(() => {
    if (!data || !data.results) return [];
    if (resultsCategoryFilter === "Alle") return data.results;
    return data.results.filter((r) => r.category === resultsCategoryFilter);
  }, [data, resultsCategoryFilter]);

  const getOutcomeColor = (outcome: "win" | "loss" | "draw" | null) => {
    if (outcome === "win") return "#34D399";
    if (outcome === "loss") return "#F87171";
    if (outcome === "draw") return "#FACC15";
    return "#FFFFFF";
  };

  return (
    <section
      id="spielplan"
      style={{
        position: "relative",
        zIndex: 10,
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "60px 24px 80px 24px",
      }}
    >
      {/* Header Container */}
      <div style={{ marginBottom: "28px" }}>
        {/* Tab Switcher Pills */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            background: "rgba(15, 23, 42, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "14px",
            padding: "4px",
            marginBottom: "20px",
            gap: "4px",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("upcoming")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.88rem",
              fontWeight: 700,
              transition: "all 0.2s ease",
              background:
                activeTab === "upcoming"
                  ? "var(--color-primary, #0284c7)"
                  : "transparent",
              color: activeTab === "upcoming" ? "#FFFFFF" : "#94A3B8",
              boxShadow:
                activeTab === "upcoming"
                  ? "0 4px 12px rgba(2, 132, 199, 0.35)"
                  : "none",
            }}
          >
            <Calendar size={15} />
            <span>Kommende Spiele</span>
            <span
              style={{
                fontSize: "0.72rem",
                padding: "2px 7px",
                borderRadius: "999px",
                background:
                  activeTab === "upcoming"
                    ? "rgba(255, 255, 255, 0.25)"
                    : "rgba(255, 255, 255, 0.08)",
                color: "#FFFFFF",
              }}
            >
              {weekendMatches.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("results")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.88rem",
              fontWeight: 700,
              transition: "all 0.2s ease",
              background:
                activeTab === "results"
                  ? "var(--color-primary, #0284c7)"
                  : "transparent",
              color: activeTab === "results" ? "#FFFFFF" : "#94A3B8",
              boxShadow:
                activeTab === "results"
                  ? "0 4px 12px rgba(2, 132, 199, 0.35)"
                  : "none",
            }}
          >
            <Trophy size={15} />
            <span>Letzte Ergebnisse</span>
            <span
              style={{
                fontSize: "0.72rem",
                padding: "2px 7px",
                borderRadius: "999px",
                background:
                  activeTab === "results"
                    ? "rgba(255, 255, 255, 0.25)"
                    : "rgba(255, 255, 255, 0.08)",
                color: "#FFFFFF",
              }}
            >
              {data.results?.length || 0}
            </span>
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                fontWeight: 800,
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              {activeTab === "upcoming" ? weekendTitle : "Aktuelle Spielergebnisse"}
            </h2>
            {activeTab === "upcoming" && weekendDateLabel && (
              <p
                style={{
                  fontSize: "1rem",
                  color: "#94A3B8",
                  marginTop: "8px",
                  marginBottom: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Calendar size={16} style={{ color: "var(--color-azure-bright)" }} />
                <span>
                  <strong style={{ color: "#E2E8F0" }}>{weekendDateLabel}</strong>
                  {weekendMatches.length > 0 && (
                    <span style={{ color: "#64748B", marginLeft: "6px" }}>
                      ({weekendMatches.length} {weekendMatches.length === 1 ? "Spiel" : "Spiele"})
                    </span>
                  )}
                </span>
              </p>
            )}
            {activeTab === "results" && (
              <p
                style={{
                  fontSize: "0.95rem",
                  color: "#94A3B8",
                  marginTop: "8px",
                  marginBottom: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Trophy size={16} style={{ color: "var(--color-azure-bright)" }} />
                <span>
                  Ausgetragene Saisonspiele mit Endständen und Spielergebnissen aller Teams
                </span>
              </p>
            )}
          </div>

          {/* Quick link to all teams */}
          <Link
            href="#teams"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 18px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#E2E8F0",
              fontSize: "0.85rem",
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
            }}
          >
            <span>Alle Mannschaften & Tabellen</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Category Filters for Results Tab */}
        {activeTab === "results" && resultCategories.length > 1 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginTop: "20px",
            }}
          >
            {resultCategories.map((cat) => {
              const isSelected = resultsCategoryFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setResultsCategoryFilter(cat)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    border: isSelected
                      ? "1px solid var(--color-azure-bright, #38bdf8)"
                      : "1px solid rgba(255, 255, 255, 0.1)",
                    background: isSelected
                      ? "rgba(56, 189, 248, 0.15)"
                      : "rgba(255, 255, 255, 0.04)",
                    color: isSelected ? "#38bdf8" : "#94A3B8",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Match Display: Desktop Table + Mobile Cards */}
      {activeTab === "upcoming" ? (
        weekendMatches.length === 0 ? (
        <div
          style={{
            padding: "48px 32px",
            textAlign: "center",
            background: "rgba(15, 23, 42, 0.5)",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <Shield size={36} style={{ color: "#64748B", margin: "0 auto 16px auto" }} />
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "8px" }}>
            Spielfreies Wochenende
          </h3>
          <p style={{ fontSize: "0.9rem", color: "#94A3B8", maxWidth: "500px", margin: "0 auto 20px auto" }}>
            Am kommenden Wochenende tragen unsere Teams keine Ligaspiele aus. Alle weiteren Saisontermine
            findest du auf den jeweiligen Mannschaftsseiten.
          </p>
          <Link
            href="#teams"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "10px",
              background: "var(--color-primary)",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "0.88rem",
              textDecoration: "none",
            }}
          >
            <span>Zu den Teams</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div
            className="desktop-schedule-view"
            style={{
              background: "linear-gradient(145deg, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.5))",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              boxShadow: "0 14px 34px -10px rgba(0, 0, 0, 0.5)",
              overflow: "hidden",
            }}
          >
            <div style={{ overflowX: "auto", width: "100%" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                  minWidth: "760px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                      background: "rgba(255, 255, 255, 0.03)",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "#94A3B8",
                    }}
                  >
                    <th style={{ padding: "16px 20px" }}>Anwurf & Datum</th>
                    <th style={{ padding: "16px 16px" }}>Team & Liga</th>
                    <th style={{ padding: "16px 16px" }}>Begegnung (Heim vs. Gast)</th>
                    <th style={{ padding: "16px 16px", textAlign: "center" }}>Spielort</th>
                    <th style={{ padding: "16px 20px", textAlign: "right" }}>Mannschaft</th>
                  </tr>
                </thead>
                <tbody>
                  {weekendMatches.map((m, idx) => {
                    const isEintrachtHome = isOurClub(m.home);
                    const teamSlug = CATEGORY_TO_SLUG[m.category];
                    const isLast = idx === weekendMatches.length - 1;

                    return (
                      <tr
                        key={m.id || `${m.date}-${m.time}-${m.home}`}
                        style={{
                          borderBottom: isLast ? "none" : "1px solid rgba(255, 255, 255, 0.05)",
                          transition: "background-color 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        {/* Anwurf & Datum */}
                        <td style={{ padding: "18px 20px", whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Clock size={15} style={{ color: "var(--color-azure-bright)" }} />
                            <span
                              style={{
                                fontSize: "1rem",
                                fontWeight: 800,
                                color: "#FFFFFF",
                                fontVariantNumeric: "tabular-nums",
                              }}
                            >
                              {m.time} Uhr
                            </span>
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#94A3B8", marginTop: "4px" }}>
                            {m.day || "Sa"}, {m.date}
                          </div>
                        </td>

                        {/* Team & Liga */}
                        <td style={{ padding: "18px 16px", whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "3px 10px",
                                borderRadius: "6px",
                                background: "rgba(255, 255, 255, 0.08)",
                                color: "#FFFFFF",
                                fontWeight: 700,
                                fontSize: "0.82rem",
                                width: "fit-content",
                              }}
                            >
                              {m.category}
                            </span>
                            <span style={{ fontSize: "0.76rem", color: "#64748B", fontWeight: 500 }}>
                              {m.league}
                            </span>
                          </div>
                        </td>

                        {/* Begegnung (Heim vs. Gast) */}
                        <td style={{ padding: "18px 16px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              flexWrap: "wrap",
                              fontSize: "0.95rem",
                            }}
                          >
                            {/* Home */}
                            <span
                              style={{
                                fontWeight: isOurClub(m.home) ? 800 : 500,
                                color: isOurClub(m.home) ? "#FFFFFF" : "#CBD5E1",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              {isOurClub(m.home) && (
                                <span
                                  style={{
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    background: "var(--color-primary)",
                                    display: "inline-block",
                                    flexShrink: 0,
                                  }}
                                />
                              )}
                              {m.home}
                            </span>

                            <span style={{ color: "#64748B", fontSize: "0.8rem", fontWeight: 400 }}>
                              vs.
                            </span>

                            {/* Guest */}
                            <span
                              style={{
                                fontWeight: isOurClub(m.guest) ? 800 : 500,
                                color: isOurClub(m.guest) ? "#FFFFFF" : "#CBD5E1",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              {isOurClub(m.guest) && (
                                <span
                                  style={{
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    background: "var(--color-primary)",
                                    display: "inline-block",
                                    flexShrink: 0,
                                  }}
                                />
                              )}
                              {m.guest}
                            </span>
                          </div>
                        </td>

                        {/* Spielort (Heim / Auswärts) */}
                        <td style={{ padding: "18px 16px", textAlign: "center", whiteSpace: "nowrap" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "0.74rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                              background: isEintrachtHome
                                ? "rgba(230, 57, 70, 0.16)"
                                : "rgba(14, 165, 233, 0.16)",
                              color: isEintrachtHome ? "#FFA6BD" : "var(--color-azure-bright)",
                              border: `1px solid ${
                                isEintrachtHome ? "rgba(230, 57, 70, 0.3)" : "rgba(14, 165, 233, 0.3)"
                              }`,
                            }}
                          >
                            {isEintrachtHome ? "Heimspiel" : "Auswärts"}
                          </span>
                        </td>

                        {/* Aktion / Mannschaftsseite */}
                        <td style={{ padding: "18px 20px", textAlign: "right", whiteSpace: "nowrap" }}>
                          {teamSlug && validTeamSlugs.has(teamSlug) ? (
                            <Link
                              href={`/teams/${teamSlug}`}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "6px 12px",
                                borderRadius: "8px",
                                background: "rgba(255, 255, 255, 0.05)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                color: "#E2E8F0",
                                fontSize: "0.78rem",
                                fontWeight: 600,
                                textDecoration: "none",
                                transition: "all 0.15s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(14, 165, 233, 0.15)";
                                e.currentTarget.style.borderColor = "rgba(14, 165, 233, 0.3)";
                                e.currentTarget.style.color = "var(--color-azure-bright)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                                e.currentTarget.style.color = "#E2E8F0";
                              }}
                            >
                              <span>Teamseite</span>
                              <ArrowRight size={13} />
                            </Link>
                          ) : (
                            <span style={{ color: "#475569", fontSize: "0.78rem" }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Match Cards List (Native App-Style) */}
          <div className="mobile-schedule-view">
            {weekendMatches.map((m) => {
              const isEintrachtHome = isOurClub(m.home);
              const teamSlug = CATEGORY_TO_SLUG[m.category];

              return (
                <div
                  key={m.id || `${m.date}-${m.time}-${m.home}`}
                  style={{
                    background: "rgba(13, 17, 26, 0.88)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderLeft: `4px solid ${
                      isEintrachtHome ? "var(--color-primary)" : "var(--color-azure)"
                    }`,
                    borderRadius: "14px",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
                  }}
                >
                  {/* Top Bar: Anwurfzeit + Tag + Heim/Auswärts Badge */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          background: "rgba(255, 255, 255, 0.08)",
                          color: "#FFFFFF",
                          fontWeight: 800,
                          fontSize: "0.92rem",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        <Clock size={13} style={{ color: "var(--color-azure-bright)" }} />
                        {m.time} Uhr
                      </span>
                      <span style={{ fontSize: "0.8rem", color: "#94A3B8", fontWeight: 500 }}>
                        {m.day || "Sa"}, {m.date}
                      </span>
                    </div>

                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 9px",
                        borderRadius: "6px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        background: isEintrachtHome
                          ? "rgba(230, 57, 70, 0.16)"
                          : "rgba(14, 165, 233, 0.16)",
                        color: isEintrachtHome ? "#FFA6BD" : "var(--color-azure-bright)",
                        border: `1px solid ${
                          isEintrachtHome
                            ? "rgba(230, 57, 70, 0.3)"
                            : "rgba(14, 165, 233, 0.3)"
                        }`,
                      }}
                    >
                      {isEintrachtHome ? "Heimspiel" : "Auswärts"}
                    </span>
                  </div>

                  {/* Team Category & League */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "4px",
                        background: "rgba(255, 255, 255, 0.08)",
                        color: "#FFFFFF",
                        fontWeight: 700,
                        fontSize: "0.78rem",
                      }}
                    >
                      {m.category}
                    </span>
                    <span
                      style={{
                        fontSize: "0.76rem",
                        color: "#64748B",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {m.league}
                    </span>
                  </div>

                  {/* Matchup: Heim vs Gast Box */}
                  <div
                    style={{
                      background: "rgba(0, 0, 0, 0.28)",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "10px",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: isOurClub(m.home) ? 800 : 500,
                          color: isOurClub(m.home) ? "#FFFFFF" : "#CBD5E1",
                          fontSize: "0.95rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        {isOurClub(m.home) && (
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: "var(--color-primary)",
                              display: "inline-block",
                              flexShrink: 0,
                            }}
                          />
                        )}
                        {m.home}
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "#64748B", textTransform: "uppercase", fontWeight: 600 }}>
                        Heim
                      </span>
                    </div>

                    <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.06)" }} />

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "10px",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: isOurClub(m.guest) ? 800 : 500,
                          color: isOurClub(m.guest) ? "#FFFFFF" : "#CBD5E1",
                          fontSize: "0.95rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        {isOurClub(m.guest) && (
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: "var(--color-primary)",
                              display: "inline-block",
                              flexShrink: 0,
                            }}
                          />
                        )}
                        {m.guest}
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "#64748B", textTransform: "uppercase", fontWeight: 600 }}>
                        Gast
                      </span>
                    </div>
                  </div>

                  {/* Card Footer: Hall Location & Team Page Link */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                      marginTop: "2px",
                      flexWrap: "wrap",
                    }}
                  >
                    {m.hallName ? (
                      <span
                        style={{
                          fontSize: "0.76rem",
                          color: "#94A3B8",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          maxWidth: "60%",
                        }}
                      >
                        <MapPin size={12} style={{ color: "#64748B", flexShrink: 0 }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {m.hallName}
                        </span>
                      </span>
                    ) : <div />}

                    {teamSlug && validTeamSlugs.has(teamSlug) && (
                      <Link
                        href={`/teams/${teamSlug}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          background: "rgba(14, 165, 233, 0.12)",
                          border: "1px solid rgba(14, 165, 233, 0.25)",
                          color: "var(--color-azure-bright)",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          textDecoration: "none",
                          marginLeft: "auto",
                        }}
                      >
                        <span>Teamseite</span>
                        <ArrowRight size={13} />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )) : filteredResults.length === 0 ? (
        <div
          style={{
            padding: "48px 32px",
            textAlign: "center",
            background: "rgba(15, 23, 42, 0.5)",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <Trophy size={36} style={{ color: "#64748B", margin: "0 auto 16px auto" }} />
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "8px" }}>
            Keine Ergebnisse gefunden
          </h3>
          <p style={{ fontSize: "0.9rem", color: "#94A3B8", maxWidth: "500px", margin: "0 auto" }}>
            Für die ausgewählte Kategorie liegen aktuell noch keine ausgetragenen Spiele vor.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Results Table View */}
          <div
            className="desktop-schedule-view"
            style={{
              background: "linear-gradient(145deg, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.5))",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              boxShadow: "0 14px 34px -10px rgba(0, 0, 0, 0.5)",
              overflow: "hidden",
            }}
          >
            <div style={{ overflowX: "auto", width: "100%" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                  minWidth: "820px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                      background: "rgba(255, 255, 255, 0.03)",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "#94A3B8",
                    }}
                  >
                    <th style={{ padding: "16px 20px" }}>Ergebnis</th>
                    <th style={{ padding: "16px 16px" }}>Datum & Zeit</th>
                    <th style={{ padding: "16px 16px" }}>Team & Liga</th>
                    <th style={{ padding: "16px 16px" }}>Begegnung</th>
                    <th style={{ padding: "16px 16px", textAlign: "center" }}>Spielort</th>
                    <th style={{ padding: "16px 20px", textAlign: "right" }}>Mannschaft</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((m, idx) => {
                    const teamSlug = CATEGORY_TO_SLUG[m.category];
                    const isLast = idx === filteredResults.length - 1;
                    const isHomeOurClub = isOurClub(m.home);
                    const isGuestOurClub = isOurClub(m.guest);

                    return (
                      <tr
                        key={m.id || `result-${idx}`}
                        style={{
                          borderBottom: isLast ? "none" : "1px solid rgba(255, 255, 255, 0.05)",
                          transition: "background-color 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        {/* Result & Outcome */}
                        <td style={{ padding: "18px 20px", whiteSpace: "nowrap" }}>
                          <span
                            style={{
                              fontSize: "1.25rem",
                              fontWeight: 900,
                              color: getOutcomeColor(m.outcome),
                              fontVariantNumeric: "tabular-nums",
                              letterSpacing: "0.02em",
                            }}
                          >
                            {m.result || `${m.homeScore ?? "-"} : ${m.guestScore ?? "-"}`}
                          </span>
                        </td>

                        {/* Datum & Zeit */}
                        <td style={{ padding: "18px 16px", whiteSpace: "nowrap" }}>
                          <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#FFFFFF" }}>
                            {m.date}
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#94A3B8", marginTop: "2px" }}>
                            {m.day ? `${m.day}, ` : ""}{m.time ? `${m.time} Uhr` : ""}
                          </div>
                        </td>

                        {/* Team & Liga */}
                        <td style={{ padding: "18px 16px", whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "3px 10px",
                                borderRadius: "6px",
                                background: "rgba(255, 255, 255, 0.08)",
                                color: "#FFFFFF",
                                fontWeight: 700,
                                fontSize: "0.82rem",
                                width: "fit-content",
                              }}
                            >
                              {m.category}
                            </span>
                            <span style={{ fontSize: "0.76rem", color: "#64748B", fontWeight: 500 }}>
                              {m.league}
                            </span>
                          </div>
                        </td>

                        {/* Begegnung */}
                        <td style={{ padding: "18px 16px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              fontSize: "0.95rem",
                            }}
                          >
                            <span
                              style={{
                                fontWeight: isHomeOurClub ? 800 : 500,
                                color: isHomeOurClub ? "#FFFFFF" : "#CBD5E1",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              {isHomeOurClub && (
                                <span
                                  style={{
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    background: "var(--color-primary, #0ea5e9)",
                                    display: "inline-block",
                                  }}
                                />
                              )}
                              {m.home}
                            </span>
                            <span style={{ color: "#64748B", fontSize: "0.85rem", fontWeight: 600 }}>
                              vs.
                            </span>
                            <span
                              style={{
                                fontWeight: isGuestOurClub ? 800 : 500,
                                color: isGuestOurClub ? "#FFFFFF" : "#CBD5E1",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              {isGuestOurClub && (
                                <span
                                  style={{
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    background: "var(--color-primary, #0ea5e9)",
                                    display: "inline-block",
                                  }}
                                />
                              )}
                              {m.guest}
                            </span>
                          </div>
                        </td>

                        {/* Spielort */}
                        <td style={{ padding: "18px 16px", textAlign: "center", whiteSpace: "nowrap" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              background: m.isHome
                                ? "rgba(14, 165, 233, 0.15)"
                                : "rgba(148, 163, 184, 0.1)",
                              border: m.isHome
                                ? "1px solid rgba(14, 165, 233, 0.3)"
                                : "1px solid rgba(148, 163, 184, 0.2)",
                              color: m.isHome ? "#38BDF8" : "#94A3B8",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                            }}
                          >
                            {m.isHome ? "Heim" : "Auswärts"}
                          </span>
                        </td>

                        {/* Teamseite */}
                        <td style={{ padding: "18px 20px", textAlign: "right", whiteSpace: "nowrap" }}>
                          {teamSlug && validTeamSlugs.has(teamSlug) ? (
                            <Link
                              href={`/teams/${teamSlug}`}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "7px 14px",
                                borderRadius: "8px",
                                background: "rgba(14, 165, 233, 0.12)",
                                border: "1px solid rgba(14, 165, 233, 0.25)",
                                color: "var(--color-azure-bright, #38bdf8)",
                                fontSize: "0.82rem",
                                fontWeight: 600,
                                textDecoration: "none",
                                transition: "all 0.2s ease",
                              }}
                            >
                              <span>Teamseite</span>
                              <ChevronRight size={14} />
                            </Link>
                          ) : (
                            <span style={{ color: "#475569", fontSize: "0.8rem" }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Results Cards View */}
          <div className="mobile-schedule-view">
            {filteredResults.map((m, idx) => {
              const teamSlug = CATEGORY_TO_SLUG[m.category];
              const isHomeOurClub = isOurClub(m.home);
              const isGuestOurClub = isOurClub(m.guest);
              const outcomeBorderColor =
                m.outcome === "win"
                  ? "#10B981"
                  : m.outcome === "loss"
                  ? "#EF4444"
                  : m.outcome === "draw"
                  ? "#EAB308"
                  : "rgba(255, 255, 255, 0.15)";

              return (
                <div
                  key={m.id || `mob-res-${idx}`}
                  style={{
                    background: "linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.6))",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderLeft: `4px solid ${outcomeBorderColor}`,
                    borderRadius: "14px",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {/* Card Header: Category & Date */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          padding: "3px 9px",
                          borderRadius: "6px",
                          background: "rgba(255, 255, 255, 0.08)",
                          color: "#FFFFFF",
                          fontWeight: 700,
                          fontSize: "0.78rem",
                        }}
                      >
                        {m.category}
                      </span>
                      <span style={{ fontSize: "0.76rem", color: "#94A3B8" }}>
                        {m.date}
                      </span>
                    </div>
                  </div>

                  {/* Teams & Score Box */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      background: "rgba(0, 0, 0, 0.25)",
                      borderRadius: "10px",
                      gap: "10px",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                      <div
                        style={{
                          fontSize: "0.88rem",
                          fontWeight: isHomeOurClub ? 800 : 500,
                          color: isHomeOurClub ? "#FFFFFF" : "#CBD5E1",
                        }}
                      >
                        {m.home}
                      </div>
                      <div
                        style={{
                          fontSize: "0.88rem",
                          fontWeight: isGuestOurClub ? 800 : 500,
                          color: isGuestOurClub ? "#FFFFFF" : "#CBD5E1",
                        }}
                      >
                        {m.guest}
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: "1.35rem",
                        fontWeight: 900,
                        color: getOutcomeColor(m.outcome),
                        fontVariantNumeric: "tabular-nums",
                        textAlign: "right",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {m.result || `${m.homeScore ?? "-"} : ${m.guestScore ?? "-"}`}
                    </div>
                  </div>

                  {/* Card Footer: Spielort & Team Link */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                    }}
                  >
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "5px",
                        background: m.isHome ? "rgba(14, 165, 233, 0.12)" : "rgba(148, 163, 184, 0.1)",
                        color: m.isHome ? "#38BDF8" : "#94A3B8",
                        fontSize: "0.74rem",
                        fontWeight: 700,
                      }}
                    >
                      {m.isHome ? "Heimspiel" : "Auswärts"}
                    </span>

                    {teamSlug && validTeamSlugs.has(teamSlug) && (
                      <Link
                        href={`/teams/${teamSlug}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "5px 10px",
                          borderRadius: "6px",
                          background: "rgba(14, 165, 233, 0.12)",
                          border: "1px solid rgba(14, 165, 233, 0.25)",
                          color: "var(--color-azure-bright, #38bdf8)",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          textDecoration: "none",
                        }}
                      >
                        <span>Teamseite</span>
                        <ChevronRight size={13} />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Footer Note */}
      <div
        style={{
          marginTop: "24px",
          padding: "16px 22px",
          background: "rgba(15, 23, 42, 0.35)",
          border: "1px solid rgba(255, 255, 255, 0.07)",
          borderRadius: "12px",
          display: "flex",
          flexWrap: "wrap",
          gap: "14px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Activity size={16} style={{ color: "#10B981" }} />
          <span style={{ fontSize: "0.82rem", color: "#94A3B8" }}>
            Offizielle BHV nuLiga-Spieldaten • Alle Tabellen & Spielpläne direkt in den jeweiligen Mannschaftsseiten
          </span>
        </div>

        <a
          href="https://bhv-handball.liga.nu/cgi-bin/WebObjects/nuLigaHBDE.woa/wa/clubInfoDisplay?club=105665"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "#38BDF8",
            fontSize: "0.82rem",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          <span>nuLiga Vereinsseite</span>
          <ExternalLink size={13} />
        </a>
      </div>

      <style jsx>{`
        @media (min-width: 769px) {
          .mobile-schedule-view {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          .desktop-schedule-view {
            display: none !important;
          }
          .mobile-schedule-view {
            display: flex !important;
            flex-direction: column;
            gap: 14px;
          }
        }
      `}</style>
    </section>
  );
}

export default ScheduleSection;

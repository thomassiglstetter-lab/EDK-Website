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
} from "lucide-react";
import initialMatchesJson from "@/data/matches.json";

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

interface MatchesApiResponse {
  success: boolean;
  clubId: string;
  clubName: string;
  lastSynced: string;
  nuLigaUrl: string;
  totalMatches: number;
  upcomingCount: number;
  upcoming: NuLigaMatch[];
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

// Prepare initial state from bundled matches.json
const rawMatches = (initialMatchesJson.matches || []) as NuLigaMatch[];
const initialUpcoming = rawMatches.filter((m) => m.result === null);

const initialMatchesState: MatchesApiResponse = {
  success: true,
  clubId: initialMatchesJson.clubId || "105665",
  clubName: initialMatchesJson.clubName || "Eintracht Dachau-Karlsfeld",
  lastSynced: initialMatchesJson.lastSynced || "",
  nuLigaUrl: initialMatchesJson.nuLigaUrl || "",
  totalMatches: rawMatches.length,
  upcomingCount: initialUpcoming.length,
  upcoming: initialUpcoming,
};

export function ScheduleSection() {
  const [data, setData] = useState<MatchesApiResponse>(initialMatchesState);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/matches")
      .then((res) => res.json())
      .then((json: MatchesApiResponse) => {
        if (json.success && json.upcoming) {
          setData(json);
        }
      })
      .catch((err) => console.error("Error updating matches in background:", err))
      .finally(() => setLoading(false));
  }, []);

  // Filter for the upcoming weekend matches
  const { weekendMatches, weekendTitle, weekendDateLabel } = useMemo(() => {
    if (!data || !data.upcoming || data.upcoming.length === 0) {
      return { weekendMatches: [], weekendTitle: "Spiele am kommenden Wochenende", weekendDateLabel: "" };
    }

    // Sort upcoming ascending
    const sortedUpcoming = [...data.upcoming].sort((a, b) => {
      const tA = parseDateParts(a.date, a.time).getTime();
      const tB = parseDateParts(b.date, b.time).getTime();
      return tA - tB;
    });

    const firstMatch = sortedUpcoming[0];
    const firstDt = parseDateParts(firstMatch.date, firstMatch.time);

    // Calculate weekend window: Friday to Sunday of the next game's matchday
    const jsDay = firstDt.getDay();
    let fri = new Date(firstDt);

    if (jsDay === 5) {
      // Friday
      fri = new Date(firstDt);
    } else if (jsDay === 6) {
      // Saturday -> Friday was yesterday
      fri.setDate(firstDt.getDate() - 1);
    } else if (jsDay === 0) {
      // Sunday -> Friday was 2 days ago
      fri.setDate(firstDt.getDate() - 2);
    } else {
      // Monday (1) - Thursday (4) -> next Friday
      const daysUntilFri = 5 - jsDay;
      fri.setDate(firstDt.getDate() + daysUntilFri);
    }

    const sat = new Date(fri);
    sat.setDate(fri.getDate() + 1);

    const sun = new Date(fri);
    sun.setDate(fri.getDate() + 2);

    const formatShort = (d: Date) =>
      `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;

    const weekendDatesSet = new Set([
      formatShort(fri),
      formatShort(sat),
      formatShort(sun),
    ]);

    const matchesForWeekend = sortedUpcoming.filter((m) =>
      weekendDatesSet.has(m.date)
    );

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
      dateLabel = `${d1.getDate()}. – ${d2.getDate()}. ${d2.toLocaleDateString("de-DE", { month: "long", year: "numeric" })}`;
    } else {
      dateLabel = `${sat.getDate()}. – ${sun.getDate()}. ${sun.toLocaleDateString("de-DE", { month: "long", year: "numeric" })}`;
    }

    return {
      weekendMatches: matchesForWeekend,
      weekendTitle: "Spiele am kommenden Wochenende",
      weekendDateLabel: dateLabel,
    };
  }, [data]);

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
              {weekendTitle}
            </h2>
            {weekendDateLabel && (
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
      </div>

      {/* Match Display: Desktop Table + Mobile Cards */}
      {weekendMatches.length === 0 ? (
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
                    const isEintrachtHome = m.home.includes("Eintracht");
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
                                fontWeight: m.home.includes("Eintracht") ? 800 : 500,
                                color: m.home.includes("Eintracht") ? "#FFFFFF" : "#CBD5E1",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              {m.home.includes("Eintracht") && (
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
                                fontWeight: m.guest.includes("Eintracht") ? 800 : 500,
                                color: m.guest.includes("Eintracht") ? "#FFFFFF" : "#CBD5E1",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              {m.guest.includes("Eintracht") && (
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
                          {teamSlug ? (
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
              const isEintrachtHome = m.home.includes("Eintracht");
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
                          fontWeight: m.home.includes("Eintracht") ? 800 : 500,
                          color: m.home.includes("Eintracht") ? "#FFFFFF" : "#CBD5E1",
                          fontSize: "0.95rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        {m.home.includes("Eintracht") && (
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
                          fontWeight: m.guest.includes("Eintracht") ? 800 : 500,
                          color: m.guest.includes("Eintracht") ? "#FFFFFF" : "#CBD5E1",
                          fontSize: "0.95rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        {m.guest.includes("Eintracht") && (
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

                    {teamSlug && (
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

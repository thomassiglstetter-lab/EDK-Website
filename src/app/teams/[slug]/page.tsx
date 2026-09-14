import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  Shield,
  Instagram,
  Mail,
  Phone,
  ExternalLink,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Navigation,
  FileText,
  ChevronRight,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import fs from "fs/promises";
import path from "path";
import teamsData from "@/data/teams.json";
import hallsData from "@/data/halls.json";
import { getCachedLeagueTable, syncLeagueTable } from "@/lib/tables";
import { readCachedMatches, parseGermanDate } from "@/lib/nuliga";
import { triggerBackgroundSyncIfNeeded } from "@/lib/sync";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getMatchReports(teamSlug: string): Promise<any[]> {
  try {
    const filePath = path.join(process.cwd(), "src", "data", "reports.json");
    const tmpFilePath = path.join("/tmp", "reports.json");
    let raw = "";
    try {
      raw = await fs.readFile(tmpFilePath, "utf8");
    } catch {
      raw = await fs.readFile(filePath, "utf8");
    }
    const reports = JSON.parse(raw);
    return Array.isArray(reports) ? reports.filter((r: any) => r.teamSlug === teamSlug) : [];
  } catch {
    return [];
  }
}

async function getTeams(): Promise<any[]> {
  try {
    const filePath = path.join(process.cwd(), "src", "data", "teams.json");
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return teamsData;
  }
}

export function generateStaticParams() {
  return teamsData.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const teams = await getTeams();
  const team = teams.find((t: any) => t.slug === slug || t.id === slug);
  if (!team) return { title: "Mannschaft nicht gefunden" };
  return {
    title: `${team.name} | Eintracht Dachau-Karlsfeld Handball`,
    description: `Mannschaftsporträt, aktuelle nuLiga-Tabelle, Spielplan, Ergebnisse und Trainingszeiten der ${team.name} der Eintracht Dachau-Karlsfeld.`,
  };
}

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const teams = await getTeams();
  const team: any = teams.find((t: any) => t.slug === slug || t.id === slug);

  if (!team) {
    notFound();
  }

  const isCrimson = team.accentType === "crimson";
  const accentColor = isCrimson ? "var(--color-crimson)" : "var(--color-azure)";
  const accentBright = isCrimson ? "var(--color-crimson-bright)" : "var(--color-azure-bright)";
  const badgeBg = isCrimson ? "rgba(230, 57, 70, 0.12)" : "rgba(14, 165, 233, 0.12)";
  const badgeBorder = isCrimson ? "rgba(230, 57, 70, 0.3)" : "rgba(14, 165, 233, 0.3)";

  // Background nuLiga check (SWR non-blocking)
  triggerBackgroundSyncIfNeeded();

  // 1. League Table Data (auto-sync if not yet cached)
  let tableData = getCachedLeagueTable(team.slug);
  if (!tableData && team.groupUrl && team.groupUrl.startsWith("http") && team.groupUrl.includes("groupPage")) {
    tableData = await syncLeagueTable(team.slug, team.groupUrl);
  }

  // 2. Matches for this team (dynamically read from cache)
  const currentMatchesData = readCachedMatches();
  const rawMatches = (currentMatchesData.matches || []).filter((m: any) => {
    if (m.category === team.nuligaCategory) return true;
    if (m.category.toLowerCase() === team.name.toLowerCase()) return true;
    if (team.slug === "herren-1" && m.category === "Herren 1") return true;
    if (team.slug === "herren-2" && m.category === "Herren 2") return true;
    if (team.slug === "damen-1" && m.category === "Damen 1") return true;
    if (team.slug === "damen-2" && m.category === "Damen 2") return true;
    if (team.slug === "m-b1" && (m.category === "mB-Jugend" || m.category === "m-jugend")) return true;
    if (team.slug === "m-c1" && (m.category === "mC-Jugend" || m.category === "m-jugend")) return true;
    if (team.slug === "w-b1" && (m.category === "wB-Jugend" || m.category === "w-jugend")) return true;
    if (team.slug === "w-c1" && (m.category === "wC-Jugend" || m.category === "w-jugend")) return true;
    return false;
  });

  const results = rawMatches.filter((m: any) => m.result !== null);
  results.sort((a: any, b: any) => {
    const da = parseGermanDate(a.date, a.time);
    const db = parseGermanDate(b.date, b.time);
    return db.getTime() - da.getTime();
  });

  const upcoming = rawMatches.filter((m: any) => m.result === null);
  upcoming.sort((a: any, b: any) => {
    const da = parseGermanDate(a.date, a.time);
    const db = parseGermanDate(b.date, b.time);
    return da.getTime() - db.getTime();
  });

  // 3. Match reports for this team
  const teamReports = await getMatchReports(team.slug);

  // 4. Hall reference
  const primaryHall = hallsData.find((h) => h.id === team.hallId);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#080B10" }}>
      <Header />

      <main style={{ flex: 1, position: "relative", zIndex: 10, padding: "120px 24px 100px 24px", maxWidth: "1280px", margin: "0 auto", width: "100%" }}>
        {/* Back Link */}
        <div style={{ marginBottom: "28px" }}>
          <Link
            href="/#teams"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "#94A3B8",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: 600,
              padding: "8px 14px",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              transition: "all 0.2s ease",
            }}
          >
            <ArrowLeft size={16} />
            <span>Zurück zur Team-Übersicht</span>
          </Link>
        </div>

        {/* Hero Banner */}
        <div
          className="team-hero-banner"
          style={{
            position: "relative",
            padding: "40px 36px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 14, 22, 0.9) 100%)",
            border: `1px solid ${badgeBorder}`,
            borderTop: `4px solid ${accentColor}`,
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
            marginBottom: "24px",
            overflow: "hidden",
          }}
        >
          {/* Subtle Ambient Glow */}
          <div
            style={{
              position: "absolute",
              top: "-50px",
              right: "-50px",
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              background: isCrimson
                ? "radial-gradient(circle, rgba(230, 57, 70, 0.18) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(14, 165, 233, 0.18) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "24px" }}>
            <div style={{ maxWidth: "720px" }}>
              {/* Category & Badge */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "5px 12px",
                    borderRadius: "9999px",
                    background: badgeBg,
                    border: `1px solid ${badgeBorder}`,
                    color: accentBright,
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {isCrimson ? <Trophy size={13} /> : <Shield size={13} />}
                  <span>{team.category}</span>
                </span>

                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#CBD5E1",
                    fontSize: "0.78rem",
                    fontWeight: 500,
                  }}
                >
                  Saison 2026/27
                </span>
              </div>

              {/* Title & League */}
              <h1
                style={{
                  fontSize: "clamp(2.4rem, 4.5vw, 3.4rem)",
                  fontWeight: 800,
                  color: "#FFFFFF",
                  lineHeight: 1.1,
                  margin: "0 0 10px 0",
                  letterSpacing: "-0.02em",
                }}
              >
                {team.name}
              </h1>

              <div
                style={{
                  fontSize: "1.15rem",
                  color: accentBright,
                  fontWeight: 600,
                  marginBottom: "18px",
                }}
              >
                {team.league}
              </div>


            </div>

            {/* Actions & Social Media */}
            <div className="team-hero-actions" style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-end" }}>
              <Link
                href={`/teams/${team.slug}/spielberichte`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "9px 16px",
                  borderRadius: "10px",
                  background: isCrimson
                    ? "rgba(230, 57, 70, 0.15)"
                    : "rgba(14, 165, 233, 0.15)",
                  border: `1px solid ${badgeBorder}`,
                  color: accentBright,
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
              >
                <FileText size={15} />
                <span>Spielberichte ({teamReports.length})</span>
                <ChevronRight size={14} />
              </Link>

              {team.socialMedia?.instagram && (
                <a
                  href={team.socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "9px 16px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, rgba(225, 48, 108, 0.2) 0%, rgba(225, 48, 108, 0.08) 100%)",
                    border: "1px solid rgba(225, 48, 108, 0.35)",
                    color: "#FFFFFF",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Instagram size={16} color="#E1306C" />
                  <span>Instagram</span>
                  <ExternalLink size={13} color="#94A3B8" />
                </a>
              )}

              {team.groupUrl && (
                <a
                  href={team.groupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "9px 16px",
                    borderRadius: "10px",
                    background: "rgba(14, 165, 233, 0.12)",
                    border: "1px solid rgba(14, 165, 233, 0.3)",
                    color: "#38BDF8",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  <span>Offizielle nuLiga-Ligaseite</span>
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Mannschaftsbild (optional) & Training + Trainer-Kontakt */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: team.showImage !== false ? "repeat(auto-fit, minmax(320px, 1fr))" : "1fr",
            gap: "20px",
            marginBottom: "24px",
          }}
        >
          {/* Card 1: Mannschaftsbild (Miniatur-Version) */}
          {team.showImage !== false && (
            <div
              className="glass-panel"
              style={{
                padding: "20px",
                borderRadius: "16px",
                background: "rgba(13, 17, 26, 0.85)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "10px",
                      background: badgeBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: accentBright,
                    }}
                  >
                    <Users size={17} />
                  </div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>
                    Mannschaftsbild
                  </h3>
                </div>

                <span
                  style={{
                    fontSize: "0.74rem",
                    fontWeight: 600,
                    color: "#94A3B8",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  Kader 2026/27
                </span>
              </div>

              {/* Team Image Container */}
              <div
                style={{
                  position: "relative",
                  borderRadius: "12px",
                  overflow: "hidden",
                  aspectRatio: "16 / 9",
                  background: "rgba(0, 0, 0, 0.4)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 10px 24px -6px rgba(0, 0, 0, 0.5)",
                }}
              >
                <img
                  src={team.image || `/teams/${team.slug}.jpg`}
                  alt={`Mannschaftsbild ${team.name}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(8, 11, 16, 0.8) 0%, transparent 40%)",
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    left: "14px",
                    right: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    color: "#FFFFFF",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                  }}
                >
                  <span>{team.name}</span>
                  <span style={{ color: "#CBD5E1", fontSize: "0.72rem" }}>Eintracht Dachau-Karlsfeld</span>
                </div>
              </div>
            </div>
          )}

          {/* Card 2: Trainingstage & Trainer-Kontakt */}
          <div
            className="glass-panel"
            style={{
              padding: "20px",
              borderRadius: "16px",
              background: "rgba(13, 17, 26, 0.85)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {/* Header: Trainingszeiten */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "10px",
                    background: "rgba(14, 165, 233, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#38BDF8",
                  }}
                >
                  <Clock size={17} />
                </div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>
                  Trainingszeiten
                </h3>
              </div>

              <Link
                href="/hallen"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  color: "#38BDF8",
                  fontSize: "0.76rem",
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                <Navigation size={12} />
                <span>Hallen-Info</span>
              </Link>
            </div>

            {/* Trainingszeiten kompakt */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {team.trainingSchedule && team.trainingSchedule.length > 0 ? (
                team.trainingSchedule.map((ts: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      padding: "7px 12px",
                      borderRadius: "8px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontWeight: 700, color: "#FFFFFF", fontSize: "0.85rem" }}>
                        {ts.day}
                      </span>
                      <span
                        style={{
                          fontSize: "0.76rem",
                          fontWeight: 600,
                          color: accentBright,
                          background: badgeBg,
                          padding: "2px 7px",
                          borderRadius: "4px",
                          border: `1px solid ${badgeBorder}`,
                        }}
                      >
                        {ts.time}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#94A3B8", fontSize: "0.76rem" }}>
                      <MapPin size={11} color="#64748B" />
                      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "150px" }}>
                        {ts.hallName}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    padding: "7px 12px",
                    borderRadius: "8px",
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "#FFFFFF", fontSize: "0.85rem" }}>
                    {team.trainingTimes}
                  </span>
                  <span style={{ fontSize: "0.76rem", color: "#94A3B8" }}>
                    {team.trainingLocation}
                  </span>
                </div>
              )}
            </div>

            {/* Trennlinie */}
            <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.07)", margin: "2px 0" }} />

            {/* Trainer & Kontakt */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: accentBright,
                    marginBottom: "4px",
                  }}
                >
                  Trainer &amp; Ansprechpartner
                </div>

                {/* Multiple Coaches List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {((team.coaches && team.coaches.length > 0)
                    ? team.coaches
                    : [team.coachContact || { name: team.trainer }]
                  )
                    .filter((c: any) => c && c.name && c.name.trim().length > 0)
                    .map((coach: any, cIdx: number, arr: any[]) => (
                      <div
                        key={cIdx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "10px",
                          paddingBottom: cIdx < arr.length - 1 ? "8px" : "0",
                          borderBottom: cIdx < arr.length - 1 ? "1px solid rgba(255, 255, 255, 0.06)" : "none",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#FFFFFF" }}>
                            {coach.name}
                          </div>
                          <div style={{ fontSize: "0.74rem", color: "#94A3B8" }}>
                            {coach.role || `Trainer ${team.name}`}
                          </div>
                        </div>

                        {/* Direkte Telefon / Mail Buttons */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {coach.email && (
                            <a
                              href={`mailto:${coach.email}`}
                              title={`E-Mail: ${coach.email}`}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "30px",
                                height: "30px",
                                borderRadius: "8px",
                                background: "rgba(255, 255, 255, 0.05)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                color: accentBright,
                                textDecoration: "none",
                                transition: "all 0.2s ease",
                              }}
                            >
                              <Mail size={13} />
                            </a>
                          )}

                          {coach.phone && (
                            <a
                              href={`tel:${coach.phone}`}
                              title={`Telefon: ${coach.phone}`}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "30px",
                                height: "30px",
                                borderRadius: "8px",
                                background: "rgba(255, 255, 255, 0.05)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                color: accentBright,
                                textDecoration: "none",
                                transition: "all 0.2s ease",
                              }}
                            >
                              <Phone size={13} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Spielberichte der Mannschaft */}
        <div
          className="glass-panel"
          style={{
            padding: "32px 28px",
            borderRadius: "20px",
            background: "rgba(13, 17, 26, 0.9)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderTop: `3px solid ${accentColor}`,
            boxShadow: "0 14px 32px rgba(0, 0, 0, 0.5)",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  background: badgeBg,
                  border: `1px solid ${badgeBorder}`,
                  color: accentBright,
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "8px",
                }}
              >
                <FileText size={12} />
                <span>Exklusiv für diese Mannschaft</span>
              </div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>
                Spielberichte: {team.name}
              </h2>
            </div>

            <Link
              href={`/teams/${team.slug}/spielberichte`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#FFFFFF",
                fontSize: "0.85rem",
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              <span>Alle {teamReports.length} Spielberichte öffnen</span>
              <ChevronRight size={14} color={accentBright} />
            </Link>
          </div>

          {teamReports.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: teamReports.length > 1 ? "repeat(auto-fit, minmax(320px, 1fr))" : "1fr",
                gap: "18px",
              }}
            >
              {teamReports.slice(0, 2).map((rep: any) => {
                const isWin = rep.outcome === "Sieg";
                const isLoss = rep.outcome === "Niederlage";
                const oColor = isWin ? "#34D399" : isLoss ? "#F87171" : "#FBBF24";
                const oBg = isWin
                  ? "rgba(16, 185, 129, 0.14)"
                  : isLoss
                  ? "rgba(239, 68, 68, 0.14)"
                  : "rgba(245, 158, 11, 0.14)";
                const oBorder = isWin
                  ? "rgba(16, 185, 129, 0.3)"
                  : isLoss
                  ? "rgba(239, 68, 68, 0.3)"
                  : "rgba(245, 158, 11, 0.3)";

                return (
                  <Link
                    key={rep.id}
                    href={`/teams/${team.slug}/spielberichte`}
                    style={{
                      textDecoration: "none",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      padding: "20px 22px",
                      borderRadius: "14px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.07)",
                      borderLeft: `3px solid ${oColor}`,
                      transition: "transform 0.2s ease, background 0.2s ease, border-color 0.2s ease",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "10px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span
                            style={{
                              padding: "2px 7px",
                              borderRadius: "4px",
                              background: oBg,
                              border: `1px solid ${oBorder}`,
                              color: oColor,
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                            }}
                          >
                            {rep.outcome || "Spiel"}
                          </span>
                          <span style={{ fontSize: "0.76rem", color: "#64748B" }}>
                            vs. {rep.opponent}
                          </span>
                        </div>

                        {rep.result && (
                          <span
                            style={{
                              fontSize: "1rem",
                              fontWeight: 800,
                              color: "#FFFFFF",
                              fontFamily: "monospace",
                            }}
                          >
                            {rep.result}
                          </span>
                        )}
                      </div>

                      <h4
                        style={{
                          fontSize: "1.08rem",
                          fontWeight: 700,
                          color: "#FFFFFF",
                          lineHeight: 1.35,
                          marginBottom: "8px",
                        }}
                      >
                        {rep.title}
                      </h4>

                      <p
                        style={{
                          fontSize: "0.86rem",
                          lineHeight: 1.55,
                          color: "#94A3B8",
                          margin: 0,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {rep.excerpt}
                      </p>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingTop: "14px",
                        marginTop: "14px",
                        borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                      }}
                    >
                      <span style={{ fontSize: "0.74rem", color: "#64748B" }}>
                        {rep.date} {rep.author ? `• ${rep.author}` : ""}
                      </span>

                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          color: accentBright,
                        }}
                      >
                        <span>Vollständigen Bericht lesen</span>
                        <ChevronRight size={12} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                padding: "24px 20px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px dashed rgba(255, 255, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <FileText size={22} color="#64748B" />
                <div>
                  <div style={{ color: "#E2E8F0", fontSize: "0.9rem", fontWeight: 600 }}>
                    Noch keine Berichte für diese Saison hinterlegt
                  </div>
                  <div style={{ color: "#94A3B8", fontSize: "0.8rem" }}>
                    Spielberichte werden zeitnah nach den Spieltagen durch das Trainerteam veröffentlicht.
                  </div>
                </div>
              </div>

              <Link
                href={`/teams/${team.slug}/spielberichte`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: accentBright,
                  textDecoration: "none",
                }}
              >
                <span>Zur Spielberichte-Seite</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          )}
        </div>

        {/* Section 3: nuLiga Tabelle */}
        <div
          className="glass-panel"
          style={{
            padding: "32px 28px",
            borderRadius: "20px",
            background: "rgba(13, 17, 26, 0.9)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 14px 32px rgba(0, 0, 0, 0.5)",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  background: "rgba(16, 185, 129, 0.12)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  color: "#34D399",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "8px",
                }}
              >
                <Trophy size={12} />
                <span>nuLiga BHV • Aktuelle Tabelle</span>
              </div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>
                Tabelle: {team.league}
              </h2>
            </div>

            {team.groupUrl && (
              <a
                href={team.groupUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#94A3B8",
                  textDecoration: "none",
                  fontSize: "0.82rem",
                  fontWeight: 500,
                }}
              >
                <span>Tabelle auf nuLiga ansehen</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>

          {tableData && tableData.rows && tableData.rows.length > 0 ? (
            <div>
              <div
                className="mobile-table-hint"
                style={{
                  display: "none",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.74rem",
                  color: "#94A3B8",
                  marginBottom: "8px",
                  background: "rgba(255, 255, 255, 0.04)",
                  padding: "6px 12px",
                  borderRadius: "6px",
                }}
              >
                <span>← Tabelle seitlich wischen für alle Spalten (Spiele, Tore, Punkte) →</span>
              </div>
              <div
                className="touch-scroll-x"
                style={{
                  overflowX: "auto",
                  WebkitOverflowScrolling: "touch",
                  overscrollBehaviorX: "contain",
                  width: "100%",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    minWidth: "620px",
                    borderCollapse: "collapse",
                    textAlign: "left",
                    fontSize: "0.9rem",
                  }}
                >
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#94A3B8",
                      fontSize: "0.78rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    <th style={{ padding: "12px 10px", width: "50px", textAlign: "center" }}>Rang</th>
                    <th style={{ padding: "12px 14px" }}>Mannschaft</th>
                    <th style={{ padding: "12px 10px", textAlign: "center" }}>Spiele</th>
                    <th style={{ padding: "12px 10px", textAlign: "center" }}>S</th>
                    <th style={{ padding: "12px 10px", textAlign: "center" }}>U</th>
                    <th style={{ padding: "12px 10px", textAlign: "center" }}>N</th>
                    <th style={{ padding: "12px 12px", textAlign: "center" }}>Tore</th>
                    <th style={{ padding: "12px 10px", textAlign: "center" }}>+/-</th>
                    <th style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700 }}>Punkte</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.rows.map((row: any, idx: number) => {
                    const isOwn =
                      !row.team.toLowerCase().includes("asv") &&
                      (row.isOwnClub || row.team.includes(team.name) || row.team.includes("Eintracht"));
                    return (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                          background: isOwn
                            ? isCrimson
                              ? "rgba(230, 57, 70, 0.14)"
                              : "rgba(14, 165, 233, 0.14)"
                            : "transparent",
                          fontWeight: isOwn ? 700 : 400,
                          color: isOwn ? "#FFFFFF" : "#CBD5E1",
                        }}
                      >
                        <td style={{ padding: "12px 10px", textAlign: "center", color: isOwn ? accentBright : "#94A3B8", fontWeight: 700 }}>
                          {row.rank}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                            <span>{row.team}</span>
                          </span>
                        </td>
                        <td style={{ padding: "12px 10px", textAlign: "center" }}>{row.matches}</td>
                        <td style={{ padding: "12px 10px", textAlign: "center" }}>{row.won}</td>
                        <td style={{ padding: "12px 10px", textAlign: "center" }}>{row.draw}</td>
                        <td style={{ padding: "12px 10px", textAlign: "center" }}>{row.lost}</td>
                        <td style={{ padding: "12px 12px", textAlign: "center" }}>{row.goals}</td>
                        <td style={{ padding: "12px 10px", textAlign: "center" }}>{row.diff}</td>
                        <td
                          style={{
                            padding: "12px 14px",
                            textAlign: "right",
                            fontWeight: 700,
                            color: isOwn ? accentBright : "#FFFFFF",
                            fontSize: "0.95rem",
                          }}
                        >
                          {row.points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
            <div
              style={{
                padding: "36px 20px",
                textAlign: "center",
                color: "#94A3B8",
                background: "rgba(255, 255, 255, 0.02)",
                borderRadius: "12px",
              }}
            >
              <Trophy size={32} style={{ color: "#64748B", marginBottom: "10px" }} />
              <p style={{ margin: 0, fontSize: "0.92rem" }}>
                Die aktuelle Tabelle wird zu Saisonbeginn über nuLiga synchronisiert.
              </p>
            </div>
          )}
        </div>

        {/* Section 4: Nächste Spiele & Ergebnisse aus nuLiga */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "24px",
            marginBottom: "40px",
          }}
        >
          {/* Column A: Nächste Spiele */}
          <div
            className="glass-panel"
            style={{
              padding: "28px 24px",
              borderRadius: "18px",
              background: "rgba(13, 17, 26, 0.85)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: badgeBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: accentBright,
                  }}
                >
                  <Calendar size={18} />
                </div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>
                  Nächste Spiele
                </h3>
              </div>
              <span style={{ fontSize: "0.78rem", color: "#94A3B8", fontWeight: 600 }}>
                {upcoming.length} Termine
              </span>
            </div>

            {upcoming.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {upcoming.slice(0, 6).map((m: any) => (
                  <div
                    key={m.id}
                    style={{
                      padding: "14px 16px",
                      borderRadius: "10px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      borderLeft: m.isHome ? `3px solid ${accentColor}` : "3px solid #64748B",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem" }}>
                      <span style={{ color: accentBright, fontWeight: 700 }}>
                        {m.day}, {m.date} • {m.time} Uhr
                      </span>
                      <span
                        style={{
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: m.isHome ? badgeBg : "rgba(255, 255, 255, 0.05)",
                          color: m.isHome ? accentBright : "#94A3B8",
                          fontWeight: 600,
                          fontSize: "0.7rem",
                        }}
                      >
                        {m.isHome ? "Heim" : "Auswärts"}
                      </span>
                    </div>

                    <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#FFFFFF" }}>
                      {m.home} <span style={{ color: "#64748B", fontWeight: 400 }}>vs</span> {m.guest}
                    </div>

                    <div style={{ fontSize: "0.78rem", color: "#64748B" }}>
                      {m.league}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#94A3B8", fontSize: "0.9rem", margin: 0 }}>
                Aktuell sind keine weiteren Spiele terminiert.
              </p>
            )}
          </div>

          {/* Column B: Bisherige Ergebnisse */}
          <div
            className="glass-panel"
            style={{
              padding: "28px 24px",
              borderRadius: "18px",
              background: "rgba(13, 17, 26, 0.85)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "rgba(16, 185, 129, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#34D399",
                  }}
                >
                  <Trophy size={18} />
                </div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>
                  Ergebnisse
                </h3>
              </div>
              <span style={{ fontSize: "0.78rem", color: "#94A3B8", fontWeight: 600 }}>
                {results.length} Spiele
              </span>
            </div>

            {results.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {results.slice(0, 6).map((m: any) => (
                  <div
                    key={m.id}
                    style={{
                      padding: "14px 16px",
                      borderRadius: "10px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.76rem", color: "#64748B", marginBottom: "3px" }}>
                        {m.day}, {m.date} • {m.league}
                      </div>
                      <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "#FFFFFF" }}>
                        {m.home} vs {m.guest}
                      </div>
                    </div>

                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: "1.15rem",
                          fontWeight: 800,
                          color:
                            m.outcome === "win"
                              ? "#34D399"
                              : m.outcome === "loss"
                              ? "#F87171"
                              : "#FBBF24",
                        }}
                      >
                        {m.result}
                      </div>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          padding: "1px 6px",
                          borderRadius: "4px",
                          background:
                            m.outcome === "win"
                              ? "rgba(16, 185, 129, 0.16)"
                              : m.outcome === "loss"
                              ? "rgba(239, 68, 68, 0.16)"
                              : "rgba(245, 158, 11, 0.16)",
                          color:
                            m.outcome === "win"
                              ? "#34D399"
                              : m.outcome === "loss"
                              ? "#F87171"
                              : "#FBBF24",
                        }}
                      >
                        {m.outcome === "win" ? "Sieg" : m.outcome === "loss" ? "Niederlage" : "Remis"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#94A3B8", fontSize: "0.9rem", margin: 0 }}>
                Bisher liegen keine abgeschlossenen Spiele für die laufende Runde vor.
              </p>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .mobile-table-hint {
            display: flex !important;
          }
          .team-hero-banner {
            padding: 24px 18px !important;
          }
          .team-hero-actions {
            align-items: flex-start !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}

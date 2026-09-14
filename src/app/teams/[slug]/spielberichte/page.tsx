"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Trophy,
  Shield,
  Search,
  ChevronRight,
  Clock,
  X,
  Share2,
  Check,
  FileText,
  MapPin,
  ExternalLink,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import teamsData from "@/data/teams.json";

interface MatchReport {
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

export default function TeamSpielberichtePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const team = teamsData.find((t) => t.slug === slug || t.id === slug);
  if (!team) {
    notFound();
  }

  const isCrimson = team.accentType === "crimson";
  const accentColor = isCrimson ? "var(--color-crimson)" : "var(--color-azure)";
  const accentBright = isCrimson ? "var(--color-crimson-bright)" : "var(--color-azure-bright)";
  const badgeBg = isCrimson ? "rgba(230, 57, 70, 0.14)" : "rgba(14, 165, 233, 0.14)";
  const badgeBorder = isCrimson ? "rgba(230, 57, 70, 0.35)" : "rgba(14, 165, 233, 0.35)";

  const [reports, setReports] = useState<MatchReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOutcome, setFilterOutcome] = useState<string>("Alle");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [readingReport, setReadingReport] = useState<MatchReport | null>(null);

  useEffect(() => {
    fetch(`/api/reports?team=${slug}`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch reports");
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setReports(data);
        }
      })
      .catch((err) => {
        console.error("Error fetching team reports:", err);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const filteredReports = reports.filter((r) => {
    if (filterOutcome !== "Alle" && r.outcome !== filterOutcome) {
      return false;
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchOpponent = r.opponent.toLowerCase().includes(q);
      const matchContent = r.content?.toLowerCase().includes(q);
      const matchExcerpt = r.excerpt?.toLowerCase().includes(q);
      return matchTitle || matchOpponent || matchContent || matchExcerpt;
    }
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#080B10" }}>
      <Header />

      <main
        style={{
          flex: 1,
          position: "relative",
          zIndex: 10,
          padding: "120px 24px 100px 24px",
          maxWidth: "1280px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Navigation Breadcrumbs */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px", flexWrap: "wrap" }}>
          <Link
            href={`/teams/${team.slug}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "#94A3B8",
              textDecoration: "none",
              fontSize: "0.88rem",
              fontWeight: 600,
              padding: "8px 14px",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              transition: "all 0.2s ease",
            }}
          >
            <ArrowLeft size={16} />
            <span>Zurück zu {team.name}</span>
          </Link>

          <span style={{ color: "#475569" }}>•</span>

          <span style={{ color: "#CBD5E1", fontSize: "0.88rem", fontWeight: 500 }}>
            Spielberichte
          </span>
        </div>

        {/* Hero Header Banner */}
        <div
          style={{
            position: "relative",
            padding: "36px 32px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 14, 22, 0.92) 100%)",
            border: `1px solid ${badgeBorder}`,
            borderTop: `4px solid ${accentColor}`,
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
            marginBottom: "36px",
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

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "20px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 10px",
                    borderRadius: "9999px",
                    background: badgeBg,
                    border: `1px solid ${badgeBorder}`,
                    color: accentBright,
                    fontSize: "0.76rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  <FileText size={12} />
                  <span>Offizielle Spielberichte</span>
                </span>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    color: "#94A3B8",
                    fontSize: "0.76rem",
                    fontWeight: 500,
                  }}
                >
                  {team.league}
                </span>
              </div>

              <h1
                style={{
                  fontSize: "clamp(2rem, 3.8vw, 3rem)",
                  fontWeight: 800,
                  color: "#FFFFFF",
                  margin: "0 0 10px 0",
                  letterSpacing: "-0.02em",
                }}
              >
                Spielberichte: {team.name}
              </h1>

              <p style={{ color: "#94A3B8", fontSize: "0.95rem", margin: 0, maxWidth: "680px" }}>
                Detaillierte Nachberichte, Spieleranalysen, Halbzeitstände und Stimmen zu den Meisterschafts- und Pokalspielen unserer {team.name}.
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div
                style={{
                  padding: "10px 18px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  textAlign: "right",
                }}
              >
                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: accentBright, lineHeight: 1 }}>
                  {reports.length}
                </div>
                <div style={{ fontSize: "0.74rem", color: "#64748B", textTransform: "uppercase", fontWeight: 600, marginTop: "2px" }}>
                  Berichte erfasst
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "32px",
            padding: "16px 20px",
            borderRadius: "16px",
            background: "rgba(13, 17, 26, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          {/* Outcome Filter Pills */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#64748B", marginRight: "4px" }}>
              Ergebnis:
            </span>
            {["Alle", "Sieg", "Niederlage", "Remis"].map((item) => {
              const active = filterOutcome === item;
              return (
                <button
                  key={item}
                  onClick={() => setFilterOutcome(item)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: "8px",
                    border: active
                      ? `1px solid ${accentBright}`
                      : "1px solid rgba(255, 255, 255, 0.08)",
                    background: active ? accentBright : "rgba(255, 255, 255, 0.03)",
                    color: active ? "#07090D" : "#CBD5E1",
                    fontSize: "0.82rem",
                    fontWeight: active ? 700 : 500,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {item}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div style={{ position: "relative", minWidth: "260px", maxWidth: "360px", width: "100%" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#64748B",
              }}
            />
            <input
              type="text"
              placeholder="Gegner oder Text suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 14px 9px 38px",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#FFFFFF",
                fontSize: "0.86rem",
                outline: "none",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "#94A3B8",
                  cursor: "pointer",
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Reports Grid */}
        {loading ? (
          <div style={{ padding: "60px 0", textAlign: "center", color: "#94A3B8" }}>
            Spielberichte werden geladen...
          </div>
        ) : filteredReports.length === 0 ? (
          <div
            style={{
              padding: "60px 24px",
              textAlign: "center",
              borderRadius: "16px",
              background: "rgba(13, 17, 26, 0.6)",
              border: "1px dashed rgba(255, 255, 255, 0.1)",
            }}
          >
            <FileText size={40} style={{ color: "#475569", margin: "0 auto 16px auto" }} />
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "8px" }}>
              Keine Spielberichte gefunden
            </h3>
            <p style={{ color: "#94A3B8", fontSize: "0.9rem", maxWidth: "450px", margin: "0 auto" }}>
              {searchQuery || filterOutcome !== "Alle"
                ? "Für die gewählten Filter liegen keine Berichte vor. Setze die Filter zurück."
                : "Für diese Mannschaft wurden noch keine Spielberichte angelegt."}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
              gap: "24px",
            }}
          >
            {filteredReports.map((report) => {
              const isWin = report.outcome === "Sieg";
              const isLoss = report.outcome === "Niederlage";
              const outcomeColor = isWin ? "#34D399" : isLoss ? "#F87171" : "#FBBF24";
              const outcomeBg = isWin
                ? "rgba(16, 185, 129, 0.15)"
                : isLoss
                ? "rgba(239, 68, 68, 0.15)"
                : "rgba(245, 158, 11, 0.15)";
              const outcomeBorder = isWin
                ? "rgba(16, 185, 129, 0.35)"
                : isLoss
                ? "rgba(239, 68, 68, 0.35)"
                : "rgba(245, 158, 11, 0.35)";

              return (
                <article
                  key={report.id}
                  onClick={() => setReadingReport(report)}
                  style={{
                    borderRadius: "16px",
                    background: "rgba(13, 17, 26, 0.88)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderTop: `3px solid ${outcomeColor}`,
                    boxShadow: "0 10px 28px rgba(0, 0, 0, 0.45)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    cursor: "pointer",
                    transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.25s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 18px 36px rgba(0, 0, 0, 0.65)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.16)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "0 10px 28px rgba(0, 0, 0, 0.45)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                  }}
                >
                  {/* Optional Image */}
                  {report.image && (
                    <div style={{ height: "180px", width: "100%", overflow: "hidden", position: "relative" }}>
                      <img
                        src={report.image}
                        alt={report.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "linear-gradient(to bottom, transparent 50%, rgba(13, 17, 26, 0.95))",
                        }}
                      />
                    </div>
                  )}

                  <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      {/* Meta header: Date, Home/Away, Result badge */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span
                            style={{
                              padding: "3px 8px",
                              borderRadius: "6px",
                              background: outcomeBg,
                              border: `1px solid ${outcomeBorder}`,
                              color: outcomeColor,
                              fontSize: "0.74rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                            }}
                          >
                            {report.outcome || "Spiel"}
                          </span>
                          <span style={{ fontSize: "0.76rem", color: "#94A3B8" }}>
                            {report.isHome ? "Heimspiel" : "Auswärts"}
                          </span>
                        </div>

                        {report.result && (
                          <span
                            style={{
                              fontSize: "1.1rem",
                              fontWeight: 800,
                              color: "#FFFFFF",
                              fontFamily: "monospace",
                              background: "rgba(255, 255, 255, 0.06)",
                              padding: "2px 8px",
                              borderRadius: "6px",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            {report.result}
                          </span>
                        )}
                      </div>

                      {/* Opponent & Date */}
                      <div style={{ fontSize: "0.82rem", color: accentBright, fontWeight: 600, marginBottom: "8px" }}>
                        vs. {report.opponent} • {report.date}
                      </div>

                      {/* Title */}
                      <h3
                        style={{
                          fontSize: "1.2rem",
                          fontWeight: 700,
                          lineHeight: 1.35,
                          color: "#FFFFFF",
                          marginBottom: "12px",
                        }}
                      >
                        {report.title}
                      </h3>

                      {/* Excerpt */}
                      <p
                        style={{
                          fontSize: "0.88rem",
                          lineHeight: 1.6,
                          color: "#94A3B8",
                          marginBottom: "20px",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {report.excerpt}
                      </p>
                    </div>

                    {/* Footer with author and read button */}
                    <div
                      style={{
                        paddingTop: "14px",
                        borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontSize: "0.76rem", color: "#64748B" }}>
                        {report.author ? `Von ${report.author}` : "Redaktion"}
                      </span>

                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          color: accentBright,
                        }}
                      >
                        <span>Bericht lesen</span>
                        <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Reader Modal */}
      {readingReport && (
        <ReportReaderModal
          report={readingReport}
          accentColor={accentColor}
          accentBright={accentBright}
          onClose={() => setReadingReport(null)}
        />
      )}

      <Footer />
    </div>
  );
}

function ReportReaderModal({
  report,
  accentColor,
  accentBright,
  onClose,
}: {
  report: MatchReport;
  accentColor: string;
  accentBright: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const paragraphs = (report.content || report.excerpt)
    .split("\n\n")
    .filter((p) => p.trim().length > 0);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const isWin = report.outcome === "Sieg";
  const isLoss = report.outcome === "Niederlage";
  const outcomeColor = isWin ? "#34D399" : isLoss ? "#F87171" : "#FBBF24";

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(4, 7, 12, 0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(16px, 3vh, 36px) 16px",
        overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "800px",
          maxHeight: "min(90vh, 900px)",
          display: "flex",
          flexDirection: "column",
          background: "rgba(11, 15, 23, 0.98)",
          borderRadius: "22px",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderTop: `4px solid ${outcomeColor}`,
          boxShadow: "0 32px 80px rgba(0, 0, 0, 0.95)",
          overflow: "hidden",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            background: "rgba(13, 18, 28, 0.95)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                color: outcomeColor,
                textTransform: "uppercase",
              }}
            >
              {report.outcome} • {report.result || "Spielbericht"}
            </span>
            <span style={{ color: "#64748B" }}>|</span>
            <span style={{ fontSize: "0.8rem", color: "#CBD5E1" }}>
              vs. {report.opponent}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={handleCopy}
              title="Link teilen"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: copied ? "#34D399" : "#CBD5E1",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {copied ? <Check size={14} /> : <Share2 size={14} />}
              <span>{copied ? "Kopiert!" : "Teilen"}</span>
            </button>

            <button
              onClick={onClose}
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{ overflowY: "auto", padding: "32px 36px", flex: 1 }}>
          {report.image && (
            <div style={{ borderRadius: "14px", overflow: "hidden", marginBottom: "24px", maxHeight: "320px" }}>
              <img
                src={report.image}
                alt={report.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px", color: "#94A3B8", fontSize: "0.84rem" }}>
            <Calendar size={14} />
            <span>{report.date}</span>
            <span>•</span>
            <span>{report.isHome ? "Heimspiel in Karlsfeld/Dachau" : "Auswärtsspiel"}</span>
            {report.author && (
              <>
                <span>•</span>
                <span>Bericht von {report.author}</span>
              </>
            )}
          </div>

          <h2
            style={{
              fontSize: "clamp(1.5rem, 2.5vw, 1.9rem)",
              fontWeight: 800,
              lineHeight: 1.25,
              color: "#FFFFFF",
              marginBottom: "18px",
            }}
          >
            {report.title}
          </h2>

          <div
            style={{
              padding: "16px 20px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.03)",
              borderLeft: `4px solid ${accentColor}`,
              color: "#E2E8F0",
              fontSize: "0.98rem",
              lineHeight: 1.6,
              marginBottom: "24px",
              fontStyle: "italic",
            }}
          >
            {report.excerpt}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {paragraphs.map((p, idx) => (
              <p
                key={idx}
                style={{
                  fontSize: "1rem",
                  lineHeight: 1.75,
                  color: "#CBD5E1",
                  margin: 0,
                }}
              >
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

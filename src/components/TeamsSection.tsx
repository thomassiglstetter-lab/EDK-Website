"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, MapPin, Users, Trophy, Shield, ChevronRight, ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import teamsData from "@/data/teams.json";

export interface Team {
  id: string;
  slug: string;
  name: string;
  league: string;
  trainer: string;
  trainingTimes: string;
  trainingLocation: string;
  category: string;
  accentType: "crimson" | "azure";
  image?: string;
  showImage?: boolean;
  portrait?: string;
  goals?: string;
}

const categories = ["Alle", "Herren", "Damen", "Jugend männlich", "Jugend weiblich", "Kinderhandball"];

export default function TeamsSection() {
  const [activeCategory, setActiveCategory] = useState("Alle");
  const [teams, setTeams] = useState<Team[]>(teamsData as Team[]);
  const { ref: sectionRef, isRevealed } = useScrollReveal({ threshold: 0.1 });

  const loadTeams = () => {
    fetch(`/api/teams?_t=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTeams(data);
        }
      })
      .catch((err) => console.error("Error fetching teams:", err));
  };

  useEffect(() => {
    loadTeams();

    const handleFocus = () => loadTeams();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "teams_updated") loadTeams();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const filteredTeams =
    activeCategory === "Alle"
      ? teams
      : teams.filter((t) =>
          activeCategory === "Kinderhandball"
            ? t.category === "Kinderhandball" || t.category === "Minis"
            : t.category === activeCategory
        );

  return (
    <section
      id="teams"
      ref={sectionRef}
      className="reveal-container"
      style={{
        position: "relative",
        zIndex: 10,
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "80px 24px 100px 24px",
      }}
    >
      {/* Section Header */}
      <div
        className={`reveal-3d-header ${isRevealed ? "is-revealed" : ""}`}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "24px",
          marginBottom: "48px",
        }}
      >
        <div style={{ maxWidth: "640px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "var(--color-crimson-bright)",
              fontSize: "0.82rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "14px",
            }}
          >
            <Users size={15} />
            <span>Unsere Mannschaften ({teams.length})</span>
          </div>

          <h2
            style={{
              fontSize: "clamp(2.2rem, 3.8vw, 3rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              color: "#FFFFFF",
              letterSpacing: "-0.03em",
            }}
          >
            Teams &amp; Trainingszeiten.
          </h2>
          <p style={{ color: "#94A3B8", fontSize: "1rem", marginTop: "12px", lineHeight: 1.6 }}>
            Wähle eine Mannschaft aus, um Details wie Mannschaftsporträt, aktuelle Tabelle, Spielplan, Ergebnisse und Trainer-Kontakte zu sehen.
          </p>
        </div>

        {/* Category Tabs */}
        <div
          className="teams-category-tabs touch-scroll-x"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(13, 17, 26, 0.8)",
            padding: "4px",
            borderRadius: "var(--radius-full)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            overscrollBehaviorX: "contain",
            maxWidth: "100%",
          }}
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            const isCrimsonCat = cat === "Herren" || cat === "Jugend männlich";
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "var(--radius-full)",
                  border: "none",
                  background: isActive
                    ? cat === "Alle"
                      ? "linear-gradient(135deg, var(--color-crimson) 0%, var(--color-azure) 100%)"
                      : isCrimsonCat
                      ? "var(--color-crimson)"
                      : "var(--color-azure)"
                    : "transparent",
                  color: isActive ? "#FFFFFF" : "#CBD5E1",
                  fontFamily: "var(--font-display)",
                  fontSize: "0.8rem",
                  fontWeight: isActive ? 600 : 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {cat} {cat === "Alle" && `(${teams.length})`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Teams Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
          gap: "24px",
        }}
      >
        {filteredTeams.map((team, idx) => {
          const isCrimson = team.accentType === "crimson";
          const accentColor = isCrimson
            ? "var(--color-crimson)"
            : "var(--color-azure)";
          const accentBright = isCrimson
            ? "var(--color-crimson-bright)"
            : "var(--color-azure-bright)";
          const iconBg = isCrimson
            ? "rgba(143, 24, 56, 0.2)"
            : "rgba(72, 156, 216, 0.2)";
          const iconBorder = isCrimson
            ? "rgba(143, 24, 56, 0.5)"
            : "rgba(72, 156, 216, 0.5)";

          return (
            <div
              key={team.id || team.slug || team.name}
              className={`glass-panel reveal-3d-card ${isRevealed ? "is-revealed" : ""}`}
              style={{
                padding: "26px 24px",
                background: "rgba(12, 16, 24, 0.88)",
                borderTop: `3px solid ${accentColor}`,
                display: "flex",
                flexDirection: "column",
                gap: "18px",
                boxShadow: "0 10px 28px rgba(0, 0, 0, 0.5)",
                transitionDelay: `${idx * 0.05}s`,
                borderRadius: "16px",
              }}
            >
              {/* Team Header - Clickable */}
              <Link
                href={`/teams/${team.slug || team.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "12px",
                    background: iconBg,
                    border: `1px solid ${iconBorder}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: accentBright,
                    flexShrink: 0,
                  }}
                >
                  {isCrimson ? <Trophy size={22} /> : <Shield size={22} />}
                </div>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      color: "#FFFFFF",
                      lineHeight: 1.2,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>{team.name}</span>
                    <ArrowRight size={14} color={accentBright} style={{ opacity: 0.8 }} />
                  </h3>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: accentBright,
                      fontWeight: 500,
                      marginTop: "3px",
                    }}
                  >
                    {team.league}
                  </p>
                </div>
              </Link>

              {/* Miniature Team Image (if enabled) */}
              {team.showImage !== false && (team.image || team.slug) && (
                <Link
                  href={`/teams/${team.slug || team.id}`}
                  style={{
                    position: "relative",
                    borderRadius: "10px",
                    overflow: "hidden",
                    aspectRatio: "16 / 9",
                    background: "rgba(0, 0, 0, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    display: "block",
                    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.35)",
                    textDecoration: "none",
                  }}
                >
                  <img
                    src={team.image || `/teams/${team.slug}.jpg`}
                    alt={`Mannschaft ${team.name}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      transition: "transform 0.35s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(8, 11, 16, 0.75) 0%, transparent 45%)",
                      pointerEvents: "none",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "8px",
                      left: "12px",
                      right: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      color: "#FFFFFF",
                      fontSize: "0.74rem",
                      fontWeight: 600,
                      textShadow: "0 1px 4px rgba(0,0,0,0.9)",
                    }}
                  >
                    <span>Kader 2026/27</span>
                    <span style={{ color: accentBright, fontSize: "0.72rem" }}>Details &amp; Tabelle &rarr;</span>
                  </div>
                </Link>
              )}

              {/* Team Details Box */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "11px",
                  padding: "16px",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "0.86rem",
                    color: "#CBD5E1",
                  }}
                >
                  <Users size={14} color="#94A3B8" style={{ flexShrink: 0 }} />
                  <span>
                    <strong style={{ color: "#FFFFFF" }}>Trainer:</strong>{" "}
                    {team.trainer}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "0.86rem",
                    color: "#CBD5E1",
                  }}
                >
                  <Clock size={14} color="#94A3B8" style={{ flexShrink: 0 }} />
                  <span>{team.trainingTimes}</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "0.86rem",
                    color: "#CBD5E1",
                  }}
                >
                  <MapPin size={14} color="#94A3B8" style={{ flexShrink: 0 }} />
                  <span>{team.trainingLocation}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  marginTop: "auto",
                  paddingTop: "6px",
                }}
              >
                <Link
                  href={`/teams/${team.slug || team.id}`}
                  style={{
                    flex: 1,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "9px 14px",
                    borderRadius: "8px",
                    background: isCrimson
                      ? "linear-gradient(135deg, rgba(230, 57, 70, 0.25) 0%, rgba(185, 28, 28, 0.25) 100%)"
                      : "linear-gradient(135deg, rgba(14, 165, 233, 0.25) 0%, rgba(3, 105, 161, 0.25) 100%)",
                    border: isCrimson
                      ? "1px solid rgba(230, 57, 70, 0.45)"
                      : "1px solid rgba(14, 165, 233, 0.45)",
                    color: "#FFFFFF",
                    fontSize: "0.84rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    width: "100%",
                  }}
                >
                  <span>Zur Mannschaftsseite</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

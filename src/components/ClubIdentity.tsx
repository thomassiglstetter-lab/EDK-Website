"use client";

import React from "react";
import Link from "next/link";
import {
  Shield,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function ClubIdentity() {
  const { ref: sectionRef, isRevealed } = useScrollReveal({ threshold: 0.08 });

  return (
    <section
      ref={sectionRef}
      id="verein"
      className="reveal-container"
      style={{
        position: "relative",
        zIndex: 10,
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "80px 24px 100px 24px",
      }}
    >
      {/* Section Header (Fly-In) */}
      <div
        className={`reveal-3d-header ${isRevealed ? "is-revealed" : ""}`}
        style={{
          maxWidth: "760px",
          marginBottom: "56px",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--color-azure-bright)",
            fontSize: "0.82rem",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "14px",
            background: "rgba(14, 165, 233, 0.1)",
            padding: "6px 14px",
            borderRadius: "var(--radius-full)",
            border: "1px solid rgba(14, 165, 233, 0.25)",
          }}
        >
          <Shield size={15} />
          <span>Vereinsidentität &amp; Werte</span>
        </div>

        <h2
          style={{
            fontSize: "clamp(2.2rem, 4vw, 3.2rem)",
            fontWeight: 700,
            lineHeight: 1.15,
            color: "#FFFFFF",
            marginBottom: "18px",
            letterSpacing: "-0.03em",
          }}
        >
          Ein starkes Team. <br />
          Zwei traditionsreiche Wurzeln.
        </h2>

        <p
          style={{
            color: "#CBD5E1",
            fontSize: "clamp(1.02rem, 1.2vw, 1.12rem)",
            lineHeight: 1.65,
          }}
        >
          Die Eintracht Dachau-Karlsfeld bündelt die Handballabteilungen des{" "}
          <strong style={{ color: "#FFFFFF" }}>TSV Dachau 1865</strong> und des{" "}
          <strong style={{ color: "#FFFFFF" }}>TSV Eintracht Karlsfeld</strong>. Gemeinsam schaffen wir
          beste Rahmenbedingungen für Leistungssport, fundierte Jugendentwicklung und gelebten Zusammenhalt im Landkreis Dachau.
        </p>
      </div>

      {/* 3 Core Pillars with 3D Stagger Fly-In */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
          gap: "24px",
          marginBottom: "48px",
        }}
      >
        {/* Spalte 1: Unsere Werte (Crimson Accent) */}
        <div
          className={`glass-panel pillar-card reveal-3d-card ${isRevealed ? "is-revealed" : ""}`}
          style={{
            padding: "36px 30px",
            background: "rgba(13, 17, 26, 0.92)",
            borderTop: "3px solid var(--color-crimson)",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.5)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            transitionDelay: "0.1s",
          }}
        >
          <div>
            <div style={{ marginBottom: "18px" }}>
              <span
                style={{
                  fontSize: "0.74rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--color-crimson-bright)",
                  background: "rgba(143, 24, 56, 0.15)",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-full)",
                  border: "1px solid rgba(143, 24, 56, 0.3)",
                }}
              >
                Leitbild
              </span>
            </div>

            <h3
              style={{
                fontSize: "1.45rem",
                fontWeight: 700,
                color: "#FFFFFF",
                marginBottom: "12px",
                letterSpacing: "-0.01em",
              }}
            >
              Unsere Werte
            </h3>

            <p
              style={{
                color: "#CBD5E1",
                fontSize: "0.95rem",
                lineHeight: 1.6,
                marginBottom: "22px",
              }}
            >
              Respekt, Verantwortung und familiäres Miteinander: Bei uns steht die Gemeinschaft und das Fairplay im Zentrum unseres Handelns.
            </p>

            {/* 5 Core Values Preview */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
              {[
                { name: "Respekt & Toleranz", desc: "Achtung für Mitspieler, Schiris, Gegner & Fans" },
                { name: "Verantwortung", desc: "Vorbildfunktion für unsere Nachwuchssportler" },
                { name: "Familie & Offenheit", desc: "Freundliches Miteinander für alle Hintergründe" },
                { name: "Hilfsbereitschaft", desc: "Gemeinsam anpacken, niemand trägt Lasten allein" },
                { name: "Teamgeist & Fairplay", desc: "Keine Einzelkämpfer – gemeinsam auf der Platte" },
              ].map((val, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    fontSize: "0.86rem",
                  }}
                >
                  <CheckCircle2
                    size={15}
                    color="var(--color-crimson-bright)"
                    style={{ flexShrink: 0, marginTop: "3px" }}
                  />
                  <div>
                    <strong style={{ color: "#FFFFFF", fontWeight: 600 }}>{val.name}: </strong>
                    <span style={{ color: "#94A3B8" }}>{val.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/verein#werte"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 18px",
              borderRadius: "10px",
              background: "rgba(143, 24, 56, 0.16)",
              border: "1px solid rgba(143, 24, 56, 0.4)",
              color: "#FFA6BD",
              fontSize: "0.9rem",
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 0.25s ease",
              width: "100%",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-crimson)";
              e.currentTarget.style.color = "#FFFFFF";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(143, 24, 56, 0.16)";
              e.currentTarget.style.color = "#FFA6BD";
              e.currentTarget.style.transform = "none";
            }}
          >
            <span>Alle 5 Werte im Detail lesen</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Spalte 2: Historie & Entstehung (Azure Accent) */}
        <div
          className={`glass-panel pillar-card reveal-3d-card ${isRevealed ? "is-revealed" : ""}`}
          style={{
            padding: "36px 30px",
            background: "rgba(13, 17, 26, 0.92)",
            borderTop: "3px solid var(--color-azure)",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.5)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            transitionDelay: "0.22s",
          }}
        >
          <div>
            <div style={{ marginBottom: "18px" }}>
              <span
                style={{
                  fontSize: "0.74rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--color-azure-bright)",
                  background: "rgba(14, 165, 233, 0.15)",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-full)",
                  border: "1px solid rgba(14, 165, 233, 0.3)",
                }}
              >
                Entstehung
              </span>
            </div>

            <h3
              style={{
                fontSize: "1.45rem",
                fontWeight: 700,
                color: "#FFFFFF",
                marginBottom: "12px",
                letterSpacing: "-0.01em",
              }}
            >
              Kurze Historie
            </h3>

            <p
              style={{
                color: "#CBD5E1",
                fontSize: "0.95rem",
                lineHeight: 1.6,
                marginBottom: "22px",
              }}
            >
              Vom Jugend-Zusammenschluss zum gemeinsamen Aushängeschild: Wie aus zwei Nachbarvereinen die Eintracht Dachau-Karlsfeld wurde.
            </p>

            {/* Timeline Milestones */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "28px" }}>
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: "var(--color-azure-bright)",
                      marginTop: "5px",
                    }}
                  />
                  <div style={{ width: "2px", flexGrow: 1, background: "rgba(14, 165, 233, 0.25)", marginTop: "4px" }} />
                </div>
                <div>
                  <div style={{ fontSize: "0.76rem", color: "var(--color-azure-bright)", fontWeight: 700 }}>
                    2022 – 2023
                  </div>
                  <div style={{ color: "#FFFFFF", fontWeight: 600, fontSize: "0.88rem" }}>
                    Notspielgemeinschaft
                  </div>
                  <div style={{ color: "#94A3B8", fontSize: "0.82rem", lineHeight: 1.4 }}>
                    Kooperation im männlichen Jugendbereich mit gemeinsamen Teams.
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: "var(--color-azure-bright)",
                      marginTop: "5px",
                    }}
                  />
                  <div style={{ width: "2px", flexGrow: 1, background: "rgba(14, 165, 233, 0.25)", marginTop: "4px" }} />
                </div>
                <div>
                  <div style={{ fontSize: "0.76rem", color: "var(--color-azure-bright)", fontWeight: 700 }}>
                    Frühjahr 2023
                  </div>
                  <div style={{ color: "#FFFFFF", fontWeight: 600, fontSize: "0.88rem" }}>
                    Interessensbekundung
                  </div>
                  <div style={{ color: "#94A3B8", fontSize: "0.82rem", lineHeight: 1.4 }}>
                    Regelmäßige Treffen zur Ausarbeitung einer vollumfänglichen Spielgemeinschaft.
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: "#22C55E",
                      marginTop: "5px",
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: "0.76rem", color: "#4ADE80", fontWeight: 700 }}>
                    März 2023
                  </div>
                  <div style={{ color: "#FFFFFF", fontWeight: 600, fontSize: "0.88rem" }}>
                    Gründungsvertrag
                  </div>
                  <div style={{ color: "#94A3B8", fontSize: "0.82rem", lineHeight: 1.4 }}>
                    Unterzeichnung zur Gründung der Spielgemeinschaft Eintracht Dachau-Karlsfeld.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/verein#historie"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 18px",
              borderRadius: "10px",
              background: "rgba(14, 165, 233, 0.16)",
              border: "1px solid rgba(14, 165, 233, 0.4)",
              color: "var(--color-azure-bright)",
              fontSize: "0.9rem",
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 0.25s ease",
              width: "100%",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-azure)";
              e.currentTarget.style.color = "#FFFFFF";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(14, 165, 233, 0.16)";
              e.currentTarget.style.color = "var(--color-azure-bright)";
              e.currentTarget.style.transform = "none";
            }}
          >
            <span>Die ganze Geschichte lesen</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Spalte 3: Hallen & Standorte (Beibehalten) */}
        <div
          className={`glass-panel pillar-card reveal-3d-card ${isRevealed ? "is-revealed" : ""}`}
          style={{
            padding: "36px 30px",
            background: "rgba(13, 17, 26, 0.92)",
            borderTop: "3px solid rgba(255, 255, 255, 0.4)",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.5)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            transitionDelay: "0.34s",
          }}
        >
          <div>
            <div style={{ marginBottom: "18px" }}>
              <span
                style={{
                  fontSize: "0.74rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#CBD5E1",
                  background: "rgba(255, 255, 255, 0.08)",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-full)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                }}
              >
                5 Spielstätten
              </span>
            </div>

            <h3
              style={{
                fontSize: "1.45rem",
                fontWeight: 700,
                color: "#FFFFFF",
                marginBottom: "12px",
                letterSpacing: "-0.01em",
              }}
            >
              Hallen &amp; Standorte
            </h3>

            <p
              style={{
                color: "#CBD5E1",
                fontSize: "0.95rem",
                lineHeight: 1.6,
                marginBottom: "22px",
              }}
            >
              Zuhause in 5 Sportstätten im Landkreis Dachau &amp; Karlsfeld. Beste Bedingungen für Trainingsbetrieb und mitreißende Heimspieltage.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "rgba(143, 24, 56, 0.08)",
                  border: "1px solid rgba(143, 24, 56, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <MapPin size={15} color="var(--color-crimson-bright)" />
                  <span style={{ fontSize: "0.85rem", color: "#FFFFFF", fontWeight: 600 }}>Dachau (3 Hallen)</span>
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--color-crimson-bright)" }}>
                  Berufsschule, Realschule, Augustenfeld
                </span>
              </div>

              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "rgba(14, 165, 233, 0.08)",
                  border: "1px solid rgba(14, 165, 233, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <MapPin size={15} color="var(--color-azure-bright)" />
                  <span style={{ fontSize: "0.85rem", color: "#FFFFFF", fontWeight: 600 }}>Karlsfeld (2 Hallen)</span>
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--color-azure-bright)" }}>
                  Dreifachhalle MSK, Grundschule GSK
                </span>
              </div>

              <div
                style={{
                  fontSize: "0.78rem",
                  color: "#94A3B8",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  paddingLeft: "4px",
                  marginTop: "4px",
                }}
              >
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#F59E0B" }} />
                <span>Hinweis: Harzfreier Spielbetrieb in allen Hallen.</span>
              </div>
            </div>
          </div>

          <Link
            href="/hallen"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 18px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              color: "#FFFFFF",
              fontSize: "0.9rem",
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 0.25s ease",
              width: "100%",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-azure)";
              e.currentTarget.style.borderColor = "var(--color-azure)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.18)";
              e.currentTarget.style.transform = "none";
            }}
          >
            <span>Hallen &amp; Standorte anzeigen</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Bottom Sub-Banner: Stammvereine Info Link */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          padding: "20px 28px",
          borderRadius: "16px",
          background: "linear-gradient(90deg, rgba(143, 24, 56, 0.12) 0%, rgba(14, 165, 233, 0.12) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
            }}
          >
            <Layers size={18} />
          </div>
          <div>
            <div style={{ color: "#FFFFFF", fontWeight: 600, fontSize: "0.95rem" }}>
              Interessiert an der gesamten Vereinsgeschichte &amp; den Stammvereinen?
            </div>
            <div style={{ color: "var(--color-text-dim)", fontSize: "0.84rem" }}>
              Erfahre mehr über den TSV Dachau 1865, den TSV Eintracht Karlsfeld und unsere Vision.
            </div>
          </div>
        </div>

        <Link
          href="/verein"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "9px 18px",
            borderRadius: "var(--radius-full)",
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "#FFFFFF",
            textDecoration: "none",
            fontSize: "0.85rem",
            fontWeight: 600,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#FFFFFF";
            e.currentTarget.style.color = "#000000";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
            e.currentTarget.style.color = "#FFFFFF";
          }}
        >
          <span>Vereinsseite öffnen</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      <style jsx>{`
        @media (max-width: 560px) {
          :global(.pillar-card) {
            padding: 24px 18px !important;
          }
        }
      `}</style>
    </section>
  );
}

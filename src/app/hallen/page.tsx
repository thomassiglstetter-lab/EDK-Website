"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  ExternalLink,
  Phone,
  Info,
  ShieldAlert,
  Calendar,
  Navigation,
  Activity,
  CheckCircle2,
  Car,
} from "lucide-react";
import hallsData from "@/data/halls.json";
import Footer from "@/components/Footer";

export default function HallenPage() {
  const [selectedCity, setSelectedCity] = useState<"all" | "Dachau" | "Karlsfeld">("all");

  const filteredHalls = hallsData.filter((h) => {
    if (selectedCity === "all") return true;
    return h.city === selectedCity;
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#060911", color: "#E2E8F0" }}>
      <main
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "120px 24px 80px 24px",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Back Link */}
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--color-azure-bright)",
            textDecoration: "none",
            fontSize: "0.9rem",
            fontWeight: 600,
            marginBottom: "32px",
            transition: "all 0.2s ease",
          }}
        >
          <ArrowLeft size={16} />
          <span>Zurück zur Startseite</span>
        </Link>

        {/* Hero Header */}
        <div style={{ marginBottom: "48px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "9999px",
              background: "rgba(14, 165, 233, 0.12)",
              border: "1px solid rgba(14, 165, 233, 0.28)",
              color: "var(--color-azure-bright)",
              fontSize: "0.82rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "16px",
            }}
          >
            <MapPin size={14} />
            <span>Sportstätten & Hallen</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(2.4rem, 4vw, 3.4rem)",
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "-0.03em",
              marginBottom: "16px",
              lineHeight: 1.15,
            }}
          >
            Unsere Spielorte & Hallen
          </h1>

          <p
            style={{
              color: "#94A3B8",
              fontSize: "1.1rem",
              lineHeight: 1.6,
              maxWidth: "760px",
            }}
          >
            Die Eintracht Dachau-Karlsfeld trägt ihre Heimspiele und Trainingseinheiten in 5
            offiziellen Sportstätten der Stadt Dachau und der Gemeinde Karlsfeld aus.
            Hier findest du alle Anschriften, Routenplaner, Anfahrt und Hinweise für Gastmannschaften.
          </p>
        </div>

        {/* City Filter & Resin Alert Banner */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "36px",
            padding: "16px 20px",
            background: "rgba(15, 23, 42, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "16px",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", color: "#94A3B8", fontWeight: 600 }}>
              Standort:
            </span>
            {[
              { id: "all", label: `Alle Hallen (${hallsData.length})` },
              { id: "Dachau", label: "Dachau (3)" },
              { id: "Karlsfeld", label: "Karlsfeld (2)" },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCity(c.id as any)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "10px",
                  fontSize: "0.86rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  background:
                    selectedCity === c.id
                      ? "var(--color-azure)"
                      : "rgba(255, 255, 255, 0.06)",
                  color: selectedCity === c.id ? "#FFFFFF" : "#94A3B8",
                  transition: "all 0.2s ease",
                }}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "8px",
              background: "rgba(245, 158, 11, 0.12)",
              border: "1px solid rgba(245, 158, 11, 0.25)",
              color: "#FBBF24",
              fontSize: "0.82rem",
              fontWeight: 600,
            }}
          >
            <ShieldAlert size={16} />
            <span>Haftmittel (Harz) in allen 5 Hallen nicht erlaubt</span>
          </div>
        </div>

        {/* 5 Halls Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: "28px",
            marginBottom: "64px",
          }}
        >
          {filteredHalls.map((hall) => {
            const isDachau = hall.city === "Dachau";
            return (
              <div
                key={hall.id}
                className="glass-panel"
                style={{
                  padding: "30px",
                  background: "rgba(13, 17, 26, 0.85)",
                  borderRadius: "18px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderTop: `4px solid ${isDachau ? "var(--color-crimson)" : "var(--color-azure)"}`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
                  transition: "transform 0.2s ease",
                }}
              >
                <div>
                  {/* Top Badges */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "16px",
                    }}
                  >
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "6px",
                        fontSize: "0.76rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        background: isDachau ? "rgba(143, 24, 56, 0.25)" : "rgba(72, 156, 216, 0.25)",
                        color: isDachau ? "#FFA6BD" : "var(--color-azure-bright)",
                        border: `1px solid ${isDachau ? "rgba(143, 24, 56, 0.5)" : "rgba(72, 156, 216, 0.5)"}`,
                      }}
                    >
                      {hall.city}
                    </span>


                  </div>

                  {/* Hall Name */}
                  <h2
                    style={{
                      fontSize: "1.35rem",
                      fontWeight: 700,
                      color: "#FFFFFF",
                      marginBottom: "6px",
                      lineHeight: 1.25,
                    }}
                  >
                    {hall.name}
                  </h2>
                  <div style={{ fontSize: "0.82rem", color: "#64748B", marginBottom: "18px" }}>
                    {hall.fullName}
                  </div>

                  {/* Address & Details */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <MapPin size={17} color="var(--color-azure-bright)" style={{ marginTop: "2px", flexShrink: 0 }} />
                      <span style={{ fontSize: "0.92rem", color: "#E2E8F0", lineHeight: 1.4 }}>
                        {hall.fullAddress}
                      </span>
                    </div>

                    {hall.phone && (
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Phone size={16} color="#94A3B8" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: "0.88rem", color: "#CBD5E1" }}>
                          Telefon: {hall.phone}
                        </span>
                      </div>
                    )}

                    {hall.notes && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "8px",
                          padding: "11px 14px",
                          borderRadius: "10px",
                          background: "rgba(14, 165, 233, 0.06)",
                          border: "1px solid rgba(14, 165, 233, 0.18)",
                          fontSize: "0.84rem",
                          color: "#CBD5E1",
                        }}
                      >
                        <Info size={15} color="#38BDF8" style={{ marginTop: "2px", flexShrink: 0 }} />
                        <span>{hall.notes}</span>
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        background: "rgba(239, 68, 68, 0.08)",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                        fontSize: "0.8rem",
                        color: "#FCA5A5",
                        fontWeight: 500,
                      }}
                    >
                      <ShieldAlert size={15} style={{ flexShrink: 0 }} />
                      <span>Haftmittelverwendung (Harz): nicht erlaubt</span>
                    </div>
                  </div>
                </div>

                {/* Action Links */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                    paddingTop: "18px",
                    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <a
                    href={hall.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      background: "var(--color-azure)",
                      color: "#FFFFFF",
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      textDecoration: "none",
                      transition: "background 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#0284C7")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-azure)")}
                  >
                    <Navigation size={15} />
                    <span>Routenplaner</span>
                    <ExternalLink size={12} />
                  </a>

                  <a
                    href={hall.nuLigaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      color: "#CBD5E1",
                      fontSize: "0.88rem",
                      fontWeight: 500,
                      textDecoration: "none",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#FFFFFF";
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#CBD5E1";
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                    }}
                  >
                    <Calendar size={15} />
                    <span>Hallenspielplan</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Box: Guide for Visiting Teams and Referees */}
        <div
          className="glass-panel"
          style={{
            padding: "36px",
            background: "rgba(15, 23, 42, 0.7)",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            marginBottom: "80px",
          }}
        >
          <h3
            style={{
              fontSize: "1.3rem",
              fontWeight: 700,
              color: "#FFFFFF",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Info size={20} color="var(--color-azure-bright)" />
            <span>Hinweise für Gastmannschaften & Schiedsrichter</span>
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
              color: "#CBD5E1",
              fontSize: "0.92rem",
              lineHeight: 1.6,
            }}
          >
            <div>
              <strong style={{ color: "#FFFFFF", display: "block", marginBottom: "6px" }}>
                1. Strikte Haftmittelregelung
              </strong>
              In allen städtischen Hallen Dachaus sowie in den Sporthallen der Gemeinde Karlsfeld
              ist die Benutzung von Haftmitteln jeglicher Art (Harz, Wachs, Tree-Wax) ausnahmslos verboten.
            </div>

            <div>
              <strong style={{ color: "#FFFFFF", display: "block", marginBottom: "6px" }}>
                2. Parkplatz & Zufahrt Karlsfeld
              </strong>
              Bei Spielen in den Karlsfelder Sporthallen (Mittelschule MSK und Grundschule GSK)
              bitte den großen Parkplatz an der <strong>Sesamstraße 2</strong> (Zufahrt über die Bajuwarenstraße) nutzen.
            </div>

            <div>
              <strong style={{ color: "#FFFFFF", display: "block", marginBottom: "6px" }}>
                3. Öffentlicher Nahverkehr
              </strong>
              Alle Spielstätten sind über das MVV-Netz (S-Bahn S2 Dachau / Karlsfeld sowie Busverbindungen)
              hervorragend erreichbar.
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { MapPin, ExternalLink, Instagram, Lock, ArrowRight } from "lucide-react";
import hallsData from "@/data/halls.json";

export default function Footer() {
  return (
    <footer
      style={{
        position: "relative",
        zIndex: 10,
        backgroundColor: "#060911",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        padding: "80px 24px 32px 24px",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "48px",
          marginBottom: "60px",
        }}
      >
        {/* Col 1: Club Info */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
            <img
              src="/logo-dark.png"
              alt="Eintracht Dachau-Karlsfeld"
              style={{ width: "38px", height: "auto" }}
            />
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", color: "#fff" }}>
              EINTRACHT <br />
              <span style={{ fontSize: "0.72rem", color: "var(--color-text-dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Dachau - Karlsfeld
              </span>
            </div>
          </div>

          <p style={{ color: "var(--color-text-dim)", fontSize: "0.9rem", lineHeight: 1.6, maxWidth: "340px" }}>
            Handball-Spielgemeinschaft der Stammvereine TSV Dachau 1865 e.V. und TSV Eintracht Karlsfeld e.V.
          </p>

          <div style={{ marginTop: "22px" }}>
            <div
              style={{
                fontSize: "0.76rem",
                color: "#94A3B8",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "10px",
                fontWeight: 600,
              }}
            >
              Social Media
            </div>
            <a
              href="https://www.instagram.com/handballeintracht/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 16px",
                borderRadius: "var(--radius-full)",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#FFFFFF",
                textDecoration: "none",
                fontSize: "0.85rem",
                fontWeight: 500,
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)";
                e.currentTarget.style.borderColor = "transparent";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                e.currentTarget.style.transform = "none";
              }}
            >
              <Instagram size={16} />
              <span>@handballeintracht</span>
              <ExternalLink size={12} style={{ opacity: 0.7 }} />
            </a>
          </div>
        </div>

        {/* Col 2: Offizielle Spielorte & Hallen (nuLiga) */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h4 style={{ fontSize: "0.95rem", color: "#fff", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
              Spielorte & Hallen
            </h4>

          </div>
          
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.86rem", color: "var(--color-text-dim)", padding: 0, margin: 0 }}>
            {hallsData.map((hall) => (
              <li key={hall.id} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <MapPin
                  size={15}
                  color={hall.city === "Dachau" ? "var(--color-crimson-bright)" : "var(--color-azure-bright)"}
                  style={{ marginTop: "3px", flexShrink: 0 }}
                />
                <div style={{ lineHeight: 1.35 }}>
                  <a
                    href={hall.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#FFFFFF",
                      textDecoration: "none",
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-azure-bright)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#FFFFFF")}
                  >
                    <span>{hall.name}</span>
                    <ExternalLink size={10} style={{ opacity: 0.6 }} />
                  </a>
                  <div style={{ fontSize: "0.78rem", color: "#94A3B8" }}>
                    {hall.fullAddress}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: "16px" }}>
            <Link
              href="/hallen"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "8px",
                background: "rgba(14, 165, 233, 0.12)",
                border: "1px solid rgba(14, 165, 233, 0.3)",
                color: "var(--color-azure-bright)",
                fontSize: "0.82rem",
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--color-azure)";
                e.currentTarget.style.color = "#FFFFFF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(14, 165, 233, 0.12)";
                e.currentTarget.style.color = "var(--color-azure-bright)";
              }}
            >
              <span>Alle Hallendetails & Anfahrt ansehen</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{ marginTop: "10px", fontSize: "0.74rem", color: "#64748B" }}>
            Hinweis: Haftmittelverwendung (Harz) in allen Hallen nicht erlaubt.
          </div>
        </div>

        {/* Col 3: Quicklinks & Verbände */}
        <div>
          <h4 style={{ fontSize: "0.95rem", color: "#fff", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "18px" }}>
            Links & Verband
          </h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.88rem", padding: 0, margin: 0 }}>
            <li>
              <Link
                href="/verein"
                style={{ color: "#94A3B8", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", transition: "color 0.2s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
              >
                <span>Verein: Werte &amp; Historie</span>
                <ArrowRight size={13} />
              </Link>
            </li>
            <li>
              <Link
                href="/hallen"
                style={{ color: "#94A3B8", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", transition: "color 0.2s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
              >
                <span>Hallen- &amp; Anfahrtsübersicht</span>
                <ArrowRight size={13} />
              </Link>
            </li>
            <li>
              <a
                href="https://bhv-handball.liga.nu/cgi-bin/WebObjects/nuLigaHBDE.woa/wa/clubInfoDisplay?club=105665"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#94A3B8", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", transition: "color 0.2s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
              >
                <span>nuLiga Vereinsseite</span>
                <ExternalLink size={12} />
              </a>
            </li>
            <li>
              <a
                href="https://bhv-handball.liga.nu"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#94A3B8", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", transition: "color 0.2s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
              >
                <span>Bayerischer Handball-Verband</span>
                <ExternalLink size={12} />
              </a>
            </li>
            <li>
              <a
                href="https://www.tsvdachau1865.de/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#94A3B8", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", transition: "color 0.2s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
              >
                <span>TSV Dachau 1865 Hauptverein</span>
                <ExternalLink size={12} />
              </a>
            </li>
            <li>
              <a
                href="https://www.tsvek.de/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#94A3B8", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", transition: "color 0.2s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
              >
                <span>TSV Eintracht Karlsfeld Hauptverein</span>
                <ExternalLink size={12} />
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          paddingTop: "24px",
          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          fontSize: "0.78rem",
          color: "#94A3B8",
        }}
      >
        <div>
          © {new Date().getFullYear()} Eintracht Dachau-Karlsfeld. Alle Rechte vorbehalten.
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
          <a
            href="https://www.instagram.com/handballeintracht/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#94A3B8",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: 500,
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
          >
            <Instagram size={14} />
            <span>Instagram</span>
          </a>
          <Link
            href="/hallen"
            style={{ color: "#94A3B8", textDecoration: "none", transition: "color 0.2s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
          >
            Hallen &amp; Standorte
          </Link>
          <Link
            href="/impressum"
            style={{ color: "#94A3B8", textDecoration: "none", transition: "color 0.2s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
          >
            Impressum
          </Link>
          <Link
            href="/datenschutz"
            style={{ color: "#94A3B8", textDecoration: "none", transition: "color 0.2s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
          >
            Datenschutz
          </Link>
          <a
            href="/#kontakt"
            style={{ color: "#94A3B8", textDecoration: "none", transition: "color 0.2s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
          >
            Kontakt
          </a>
          <a
            href="/admin"
            title="Interner Vereinsbereich / Admin"
            style={{
              color: "#94A3B8",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
          >
            <Lock size={11} />
            <span>Intern</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

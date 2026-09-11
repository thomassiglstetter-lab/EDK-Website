import React from "react";
import Link from "next/link";
import { ArrowLeft, Mail, MapPin, Globe, Shield, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Impressum | Eintracht Dachau-Karlsfeld",
  description: "Impressum und rechtliche Angaben der Handball-Spielgemeinschaft Eintracht Dachau-Karlsfeld.",
};

export default function ImpressumPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #070A12 0%, #03060B 100%)",
        color: "#E2E8F0",
        padding: "120px 24px 80px 24px",
        position: "relative",
        zIndex: 10,
      }}
    >
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
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

        {/* Title */}
        <div style={{ marginBottom: "40px" }}>
          <h1
            style={{
              fontSize: "clamp(2.2rem, 4vw, 3rem)",
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
              marginBottom: "12px",
            }}
          >
            Impressum
          </h1>
          <p style={{ fontSize: "1.05rem", color: "#94A3B8" }}>
            Angaben gemäß § 5 TMG für die Handball-Spielgemeinschaft Eintracht Dachau-Karlsfeld
          </p>
        </div>

        {/* Card: Organisation & Stammvereine */}
        <div
          className="glass-panel"
          style={{
            padding: "32px",
            borderRadius: "var(--radius-md)",
            background: "rgba(15, 23, 42, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            marginBottom: "28px",
          }}
        >
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "16px" }}>
            Eintracht Dachau-Karlsfeld
          </h2>
          <p style={{ fontSize: "0.95rem", color: "#CBD5E1", lineHeight: 1.6, marginBottom: "20px" }}>
            Die Handball-Spielgemeinschaft Eintracht Dachau-Karlsfeld wird getragen von den beiden
            Stammvereinen:
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            <div
              style={{
                padding: "20px",
                borderRadius: "var(--radius-sm)",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "6px" }}>
                TSV Dachau 1865 e.V.
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#94A3B8", marginBottom: "12px" }}>
                Gröbmühlstraße 1, 85221 Dachau
              </p>
              <a
                href="https://www.tsvdachau1865.de/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "var(--color-crimson-bright)",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                <span>www.tsvdachau1865.de</span>
                <ExternalLink size={12} />
              </a>
            </div>

            <div
              style={{
                padding: "20px",
                borderRadius: "var(--radius-sm)",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "6px" }}>
                TSV Eintracht Karlsfeld e.V.
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#94A3B8", marginBottom: "12px" }}>
                Jahnstraße 15, 85757 Karlsfeld
              </p>
              <a
                href="https://www.tsvek.de/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "var(--color-azure-bright)",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                <span>www.tsvek.de</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* Card: Vertretung & Kontakt */}
        <div
          className="glass-panel"
          style={{
            padding: "32px",
            borderRadius: "var(--radius-md)",
            background: "rgba(15, 23, 42, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            marginBottom: "28px",
          }}
        >
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "16px" }}>
            Vertretungsberechtigte &amp; Kontakt
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "0.95rem" }}>
            <div>
              <strong style={{ color: "#FFFFFF" }}>Vorsitzender:</strong> Moritz Eder
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", color: "#CBD5E1" }}>
              <MapPin size={18} style={{ color: "var(--color-crimson)", flexShrink: 0, marginTop: "2px" }} />
              <div>
                Schleißheimerstr. 82A <br />
                85221 Dachau, Deutschland
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#CBD5E1" }}>
              <Mail size={18} style={{ color: "var(--color-azure)", flexShrink: 0 }} />
              <a
                href="mailto:team@handballeintracht.de"
                style={{ color: "var(--color-azure-bright)", textDecoration: "none", fontWeight: 500 }}
              >
                team@handballeintracht.de
              </a>
            </div>
          </div>

          <div
            style={{
              marginTop: "24px",
              paddingTop: "20px",
              borderTop: "1px solid rgba(255, 255, 255, 0.06)",
              fontSize: "0.88rem",
              color: "#94A3B8",
              lineHeight: 1.6,
            }}
          >
            Die bereitgestellten Informationen und Hinweise dienen der Vereinstätigkeit der
            Mitglieder des TSV Eintracht Karlsfeld und des TSV Dachau 1865.
          </div>
        </div>

        {/* Card: Haftungshinweis / Disclaimer */}
        <div
          className="glass-panel"
          style={{
            padding: "32px",
            borderRadius: "var(--radius-md)",
            background: "rgba(15, 23, 42, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            marginBottom: "28px",
          }}
        >
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "16px" }}>
            Haftung für Inhalte &amp; Links
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#CBD5E1", lineHeight: 1.7, marginBottom: "14px" }}>
            Wir haben auf unseren Seiten Links zu anderen Seiten im Internet gelegt.
          </p>
          <p style={{ fontSize: "0.9rem", color: "#CBD5E1", lineHeight: 1.7, marginBottom: "14px" }}>
            Mit Urteil vom 12. Mai 1998 - 312 O 85/98 - &bdquo;Haftung für Links&ldquo; hat das
            Landgericht (LG) Hamburg entschieden, dass man durch die Anbringung eines Links die
            Inhalte der gelinkten Seite ggf. mit zu verantworten hat. Dies kann – so das LG – nur
            dadurch verhindert werden, dass man sich ausdrücklich von diesen Inhalten distanziert.
          </p>
          <p style={{ fontSize: "0.9rem", color: "#94A3B8", lineHeight: 1.7 }}>
            Für alle diese Links gilt: Der TSV Eintracht Karlsfeld, der TSV Dachau 1865, die
            Eintracht Dachau-Karlsfeld sowie die Ersteller dieser Seiten erklären ausdrücklich, dass
            sie keinerlei Einfluss auf die Gestaltung und die Inhalte der gelinkten Seiten haben.
            Deshalb distanzieren wir uns hiermit ausdrücklich von allen Inhalten aller gelinkten
            Seiten auf unserer Homepage und machen uns diese Inhalte nicht zu Eigen. Diese Erklärung
            gilt für alle auf unserer Homepage angezeigten Links und für alle Inhalte der Seiten, zu
            denen die bei uns angemeldeten Banner und Links führen.
          </p>
        </div>

        {/* Link to Datenschutz */}
        <div
          style={{
            padding: "24px 32px",
            borderRadius: "var(--radius-md)",
            background: "rgba(14, 165, 233, 0.08)",
            border: "1px solid rgba(14, 165, 233, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Shield size={22} style={{ color: "var(--color-azure-bright)" }} />
            <div>
              <strong style={{ color: "#FFFFFF", display: "block" }}>Datenschutzerklärung</strong>
              <span style={{ fontSize: "0.85rem", color: "#94A3B8" }}>
                Hinweise zur Datenverarbeitung und den Richtlinien beider Stammvereine
              </span>
            </div>
          </div>
          <Link
            href="/datenschutz"
            style={{
              padding: "8px 18px",
              borderRadius: "var(--radius-sm)",
              background: "var(--color-azure)",
              color: "#FFFFFF",
              textDecoration: "none",
              fontSize: "0.88rem",
              fontWeight: 600,
            }}
          >
            Zur Datenschutzerklärung →
          </Link>
        </div>
      </div>
    </main>
  );
}

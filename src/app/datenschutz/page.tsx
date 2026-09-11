import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, ExternalLink, Mail, Lock, FileText } from "lucide-react";

export const metadata = {
  title: "Datenschutz | Eintracht Dachau-Karlsfeld",
  description: "Datenschutzerklärung der Handball-Spielgemeinschaft Eintracht Dachau-Karlsfeld.",
};

export default function DatenschutzPage() {
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
            Datenschutzerklärung
          </h1>
          <p style={{ fontSize: "1.05rem", color: "#94A3B8" }}>
            Informationen über die Verarbeitung personenbezogener Daten gemäß DSGVO
          </p>
        </div>

        {/* Card: Datenschutzrichtlinien der Stammvereine */}
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
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <Shield size={22} style={{ color: "var(--color-azure-bright)" }} />
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>
              Datenschutzrichtlinien der Stammvereine
            </h2>
          </div>

          <p style={{ fontSize: "0.95rem", color: "#CBD5E1", lineHeight: 1.7, marginBottom: "20px" }}>
            Für die Mitglieder und Aktivitäten der Spielgemeinschaft Eintracht Dachau-Karlsfeld
            gelten die Datenschutz-Richtlinien beider Stammvereine gleichermaßen:
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
                TSV Eintracht Karlsfeld e.V.
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#94A3B8", marginBottom: "14px" }}>
                Offizielle Datenschutzerklärung des TSV E. Karlsfeld
              </p>
              <a
                href="https://www.tsvek.de/datenschutz.html"
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
                <span>www.tsvek.de/datenschutz.html</span>
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
                TSV Dachau 1865 e.V.
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#94A3B8", marginBottom: "14px" }}>
                Offizielle Datenschutzerklärung des TSV Dachau 1865
              </p>
              <a
                href="https://www.tsvdachau1865.de/datenschutz"
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
                <span>www.tsvdachau1865.de/datenschutz</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* Card: Verantwortlicher */}
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
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "14px" }}>
            Verantwortlicher für diese Website
          </h2>
          <p style={{ fontSize: "0.95rem", color: "#CBD5E1", lineHeight: 1.6, marginBottom: "8px" }}>
            <strong>Eintracht Dachau-Karlsfeld</strong> <br />
            Vertreten durch den Vorsitzenden: Moritz Eder <br />
            Schleißheimerstr. 82A, 85221 Dachau <br />
            E-Mail:{" "}
            <a href="mailto:team@handballeintracht.de" style={{ color: "var(--color-azure-bright)" }}>
              team@handballeintracht.de
            </a>
          </p>
        </div>

        {/* Card: Datenerfassung auf der Website */}
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
            Datenerfassung auf unserer Website
          </h2>

          <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: "#FFFFFF", marginBottom: "8px" }}>
            1. Server-Log-Dateien
          </h3>
          <p style={{ fontSize: "0.9rem", color: "#CBD5E1", lineHeight: 1.7, marginBottom: "20px" }}>
            Der Provider der Seiten erhebt und speichert automatisch Informationen in sogenannten
            Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt (z.B. Browsertyp,
            Betriebssystem, Referrer URL, Hostname des zugreifenden Rechners, Uhrzeit der
            Serveranfrage). Diese Daten sind nicht bestimmten Personen zuordenbar. Eine
            Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen.
          </p>

          <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: "#FFFFFF", marginBottom: "8px" }}>
            2. Kontaktaufnahme per E-Mail oder Formular
          </h3>
          <p style={{ fontSize: "0.9rem", color: "#CBD5E1", lineHeight: 1.7, marginBottom: "20px" }}>
            Wenn Sie uns per E-Mail oder Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben
            inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und
            für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne
            Ihre Einwilligung weiter.
          </p>

          <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: "#FFFFFF", marginBottom: "8px" }}>
            3. nuLiga Spielbetriebs-Schnittstelle
          </h3>
          <p style={{ fontSize: "0.9rem", color: "#CBD5E1", lineHeight: 1.7 }}>
            Zur Bereitstellung aktueller Spielpläne und Spielergebnisse werden öffentlich zugängliche
            Daten des Bayerischen Handball-Verbands (nuLiga) serverseitig abgerufen und aggregiert.
            Dabei werden keine personenbezogenen Daten unserer Webseitenbesucher an nuLiga übermittelt.
          </p>
        </div>

        {/* Card: Betroffenenrechte */}
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
            Ihre Rechte
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#CBD5E1", lineHeight: 1.7, marginBottom: "12px" }}>
            Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten
            personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung
            sowie ein Recht auf Berichtigung, Sperrung oder Löschung dieser Daten.
          </p>
          <p style={{ fontSize: "0.9rem", color: "#94A3B8", lineHeight: 1.7 }}>
            Hierzu sowie zu weiteren Fragen zum Thema personenbezogene Daten können Sie sich
            jederzeit unter der im Impressum angegebenen Adresse an uns wenden.
          </p>
        </div>
      </div>
    </main>
  );
}

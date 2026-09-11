"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Heart,
  History,
  MapPin,
  Users,
  Handshake,
  CheckCircle2,
  ExternalLink,
  Award,
  Calendar,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Footer from "@/components/Footer";

export default function VereinPage() {
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
        <div style={{ marginBottom: "56px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "var(--radius-full)",
              background: "rgba(14, 165, 233, 0.1)",
              border: "1px solid rgba(14, 165, 233, 0.25)",
              color: "var(--color-azure-bright)",
              fontSize: "0.82rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "18px",
            }}
          >
            <Shield size={15} />
            <span>Vereinsidentität &amp; Leitbild</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              marginBottom: "20px",
            }}
          >
            Eintracht Dachau-Karlsfeld
          </h1>

          <p
            style={{
              color: "#94A3B8",
              fontSize: "clamp(1.05rem, 1.3vw, 1.2rem)",
              maxWidth: "840px",
              lineHeight: 1.65,
            }}
          >
            Gemeinsam mehr erreichen: Die HSG Eintracht Dachau-Karlsfeld vereint die Handball-Leidenschaft,
            Tradition und Ressourcen des <strong style={{ color: "#FFFFFF" }}>TSV Dachau 1865 e.V.</strong> und
            des <strong style={{ color: "#FFFFFF" }}>TSV Eintracht Karlsfeld e.V.</strong> zu einer starken,
            zukunftsorientierten Handball-Familie im Landkreis Dachau.
          </p>
        </div>

        {/* Quick Highlights Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
            marginBottom: "64px",
          }}
        >
          <div
            style={{
              padding: "24px",
              borderRadius: "16px",
              background: "rgba(143, 24, 56, 0.12)",
              border: "1px solid rgba(143, 24, 56, 0.3)",
            }}
          >
            <div style={{ color: "var(--color-crimson-bright)", fontWeight: 700, fontSize: "1.8rem", marginBottom: "4px" }}>
              2 Stammvereine
            </div>
            <div style={{ color: "#FFFFFF", fontWeight: 600, fontSize: "0.95rem" }}>
              TSV Dachau 1865 &amp; TSV Eintracht Karlsfeld
            </div>
            <div style={{ color: "#94A3B8", fontSize: "0.82rem", marginTop: "6px" }}>
              Enge Zusammenarbeit &amp; gemeinsame Strukturen für maximale Stärke im Landkreis.
            </div>
          </div>

          <div
            style={{
              padding: "24px",
              borderRadius: "16px",
              background: "rgba(14, 165, 233, 0.12)",
              border: "1px solid rgba(14, 165, 233, 0.3)",
            }}
          >
            <div style={{ color: "var(--color-azure-bright)", fontWeight: 700, fontSize: "1.8rem", marginBottom: "4px" }}>
              Über 15 Teams
            </div>
            <div style={{ color: "#FFFFFF", fontWeight: 600, fontSize: "0.95rem" }}>
              Vollständige Jugend- &amp; Seniorenstruktur
            </div>
            <div style={{ color: "#94A3B8", fontSize: "0.82rem", marginTop: "6px" }}>
              Von den Bambinis und Minis bis hin zu Damen 1 und Herren 1 in den bayerischen Ligen.
            </div>
          </div>

          <div
            style={{
              padding: "24px",
              borderRadius: "16px",
              background: "rgba(34, 197, 94, 0.12)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
            }}
          >
            <div style={{ color: "#4ADE80", fontWeight: 700, fontSize: "1.8rem", marginBottom: "4px" }}>
              5 Sportstätten
            </div>
            <div style={{ color: "#FFFFFF", fontWeight: 600, fontSize: "0.95rem" }}>
              Dachau &amp; Karlsfeld
            </div>
            <div style={{ color: "#94A3B8", fontSize: "0.82rem", marginTop: "6px" }}>
              3 Hallen in Dachau, 2 Hallen in Karlsfeld – moderne Sportinfrastruktur für beste Entwicklung.
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* SECTION: Unsere Werte                                                 */}
        {/* ===================================================================== */}
        <div id="werte" style={{ marginBottom: "80px", scrollMarginTop: "110px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(143, 24, 56, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-crimson-bright)",
              }}
            >
              <Heart size={20} />
            </div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>
              Unsere Werte
            </h2>
          </div>
          <p style={{ color: "#94A3B8", fontSize: "1rem", lineHeight: 1.6, maxWidth: "760px", marginBottom: "32px" }}>
            Handball ist mehr als Tore werfen. Es ist eine Schule fürs Leben. Das offizielle Leitbild der
            Eintracht Dachau-Karlsfeld basiert auf 5 festen Säulen, die tagtäglich auf der Platte und in der Gemeinschaft gelebt werden:
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "24px",
            }}
          >
            {[
              {
                title: "Respekt und Toleranz",
                text: "Wir respektieren unsere Mitspieler, den Gegner, die Schiedsrichter und die Fans. Ohne Respekt vor den sportlichen Kontrahenten und den Unparteiischen kann kein echtes Handballspiel stattfinden. Fairplay ist unser oberstes Gebot.",
                icon: "🤝",
                border: "var(--color-crimson)",
              },
              {
                title: "Verantwortung",
                text: "Unsere Trainer und erwachsenen SpielerInnen sind sich ihrer Verantwortung als Vorbild für die vielen Kinder und Jugendlichen bewusst und füllen diese Rolle mit großer Freude, Geduld und Engagement aus.",
                icon: "🛡️",
                border: "var(--color-azure)",
              },
              {
                title: "Familie & Offenheit",
                text: "Wir sind allen Religionen, Ethnien und Hintergründen offen eingestellt und setzen uns für ein freundliches, vorurteilsfreies und familiäres Miteinander ein. Jeder Handballbegeisterte findet bei uns seinen Platz.",
                icon: "👨‍👩‍👧‍👦",
                border: "#A855F7",
              },
              {
                title: "Hilfsbereitschaft",
                text: "Wir packen gemeinsam an. Bei uns muss niemand ein zu großes Paket alleine tragen. Jeder bringt sich so viel ein, wie er kann – von Fahrdiensten über Kampfgericht bis zur Hallenorganisation schaffen wir gemeinsam Großes.",
                icon: "🤲",
                border: "#F59E0B",
              },
              {
                title: "Teamgeist und Fairplay",
                text: "Wir stehen geschlossen hinter unserem Team. Es gibt keine Einzelkämpfer. Gewinnen und Verlieren gehören zum Sport – entscheidend ist, dass wir immer gemeinsam kämpfen, füreinander einstehen und fair bleiben.",
                icon: "⚡",
                border: "#22C55E",
              },
            ].map((val, idx) => (
              <div
                key={idx}
                style={{
                  padding: "28px 24px",
                  borderRadius: "16px",
                  background: "rgba(13, 17, 26, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderTop: `4px solid ${val.border}`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: "2rem", marginBottom: "12px" }}>{val.icon}</div>
                  <h3 style={{ fontSize: "1.25rem", color: "#FFFFFF", fontWeight: 700, marginBottom: "10px" }}>
                    {val.title}
                  </h3>
                  <p style={{ color: "#CBD5E1", fontSize: "0.92rem", lineHeight: 1.6, margin: 0 }}>
                    {val.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* SECTION: Historie & Meilensteine                                      */}
        {/* ===================================================================== */}
        <div id="historie" style={{ marginBottom: "80px", scrollMarginTop: "110px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(14, 165, 233, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-azure-bright)",
              }}
            >
              <History size={20} />
            </div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>
              Kurze Historie der Spielgemeinschaft
            </h2>
          </div>
          <p style={{ color: "#94A3B8", fontSize: "1rem", lineHeight: 1.6, maxWidth: "760px", marginBottom: "32px" }}>
            Die Geschichte der HSG Eintracht Dachau-Karlsfeld ist eine Erfolgsgeschichte der partnerschaftlichen
            Zusammenarbeit im bayerischen Handball:
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              maxWidth: "960px",
            }}
          >
            <div
              style={{
                padding: "24px 28px",
                borderRadius: "16px",
                background: "rgba(13, 17, 26, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderLeft: "5px solid var(--color-azure-bright)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: "var(--radius-full)",
                    background: "rgba(14, 165, 233, 0.18)",
                    color: "var(--color-azure-bright)",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                  }}
                >
                  2022 – 2023
                </span>
                <h3 style={{ fontSize: "1.2rem", color: "#FFFFFF", fontWeight: 700, margin: 0 }}>
                  Notspielgemeinschaft im Jugendbereich
                </h3>
              </div>
              <p style={{ color: "#CBD5E1", fontSize: "0.95rem", lineHeight: 1.65, margin: "8px 0 0 0" }}>
                Um den Spielbetrieb in allen Altersklassen aufrechtzuerhalten und talentierten Jugendlichen optimale
                Entwicklungsmöglichkeiten zu bieten, beginnen der TSV Eintracht Karlsfeld und der TSV 1865 Dachau
                im männlichen Jugendbereich eng zusammenzuarbeiten. Alle Mannschaften werden gemeinsam gestellt.
                Der Erfolg und der teamübergreifende Sportsgeist übertreffen alle Erwartungen.
              </p>
            </div>

            <div
              style={{
                padding: "24px 28px",
                borderRadius: "16px",
                background: "rgba(13, 17, 26, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderLeft: "5px solid #F59E0B",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: "var(--radius-full)",
                    background: "rgba(245, 158, 11, 0.18)",
                    color: "#FBBF24",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                  }}
                >
                  Frühjahr 2023
                </span>
                <h3 style={{ fontSize: "1.2rem", color: "#FFFFFF", fontWeight: 700, margin: 0 }}>
                  Interessensbekundung &amp; Konkrete Planungen
                </h3>
              </div>
              <p style={{ color: "#CBD5E1", fontSize: "0.95rem", lineHeight: 1.65, margin: "8px 0 0 0" }}>
                Beflügelt durch den Erfolg der Jugendkooperation treffen sich die Abteilungsleitungen beider Vereine
                regelmäßig zu strategischen Workshops. Das gemeinsame Ziel: Eine dauerhafte, umfassende Spielgemeinschaft,
                die alle Altersgruppen von den Jüngsten bis zu den Erwachsenen-Teams bündelt.
              </p>
            </div>

            <div
              style={{
                padding: "24px 28px",
                borderRadius: "16px",
                background: "rgba(13, 17, 26, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderLeft: "5px solid #22C55E",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: "var(--radius-full)",
                    background: "rgba(34, 197, 94, 0.18)",
                    color: "#4ADE80",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                  }}
                >
                  März 2023
                </span>
                <h3 style={{ fontSize: "1.2rem", color: "#FFFFFF", fontWeight: 700, margin: 0 }}>
                  Vertragsunterzeichnung &amp; Geburtsstunde der Eintracht Dachau-Karlsfeld
                </h3>
              </div>
              <p style={{ color: "#CBD5E1", fontSize: "0.95rem", lineHeight: 1.65, margin: "8px 0 0 0" }}>
                Die Vorstände beider Hauptvereine unterzeichnen feierlich den Gründungsvertrag der
                Handball-Spielgemeinschaft &bdquo;Eintracht Dachau-Karlsfeld&ldquo;. Mit gemeinsamen Trikots, neuem
                Wappen und geeinten Kräften startet der Verein in die neue Ära des Handballsports im Landkreis.
              </p>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* SECTION: Die Stammvereine                                             */}
        {/* ===================================================================== */}
        <div style={{ marginBottom: "80px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
              }}
            >
              <Users size={20} />
            </div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>
              Zwei traditionsreiche Stammvereine
            </h2>
          </div>
          <p style={{ color: "#94A3B8", fontSize: "1rem", lineHeight: 1.6, maxWidth: "760px", marginBottom: "32px" }}>
            Die HSG Eintracht Dachau-Karlsfeld baut auf der jahrzehntelangen Erfahrung und Infrastruktur
            zweier traditionsreicher Mehrspartenvereine auf:
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: "24px",
            }}
          >
            {/* TSV Dachau 1865 */}
            <div
              style={{
                padding: "32px 28px",
                borderRadius: "16px",
                background: "rgba(13, 17, 26, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderTop: "4px solid var(--color-crimson)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "0.76rem",
                    fontWeight: 700,
                    color: "var(--color-crimson-bright)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Gegründet 1865
                </span>
                <h3 style={{ fontSize: "1.5rem", color: "#FFFFFF", fontWeight: 700, margin: "8px 0 14px 0" }}>
                  TSV Dachau 1865 e.V.
                </h3>
                <p style={{ color: "#CBD5E1", fontSize: "0.92rem", lineHeight: 1.65, marginBottom: "20px" }}>
                  Der größte Traditionsverein der Großen Kreisstadt Dachau mit über 3.000 Mitgliedern und zahlreichen
                  Sparten von Breiten- bis zum Spitzensport. Die Handballabteilung blickt auf eine traditionsreiche Historie
                  zurück und stellt einen unverzichtbaren Pfeiler der Dachauer Sportlandschaft dar.
                </p>
              </div>

              <a
                href="https://www.tsvdachau1865.de/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "var(--color-crimson-bright)",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                <span>Website des TSV Dachau 1865</span>
                <ExternalLink size={14} />
              </a>
            </div>

            {/* TSV Eintracht Karlsfeld */}
            <div
              style={{
                padding: "32px 28px",
                borderRadius: "16px",
                background: "rgba(13, 17, 26, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderTop: "4px solid var(--color-azure)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "0.76rem",
                    fontWeight: 700,
                    color: "var(--color-azure-bright)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Gegründet 1925
                </span>
                <h3 style={{ fontSize: "1.5rem", color: "#FFFFFF", fontWeight: 700, margin: "8px 0 14px 0" }}>
                  TSV Eintracht Karlsfeld e.V.
                </h3>
                <p style={{ color: "#CBD5E1", fontSize: "0.92rem", lineHeight: 1.65, marginBottom: "20px" }}>
                  Der führende Sportverein in der Gemeinde Karlsfeld am nordwestlichen Stadtrand Münchens. Mit modernen
                  Sportstätten, engagierter Jugendarbeit und starker Verankerung in der Gemeinde bietet der Verein
                  ein ideales Zuhause für Handballbegeisterte aller Altersklassen.
                </p>
              </div>

              <a
                href="https://www.tsvek.de/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "var(--color-azure-bright)",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                <span>Website des TSV Eintracht Karlsfeld</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* SECTION: Hallen & Standorte Teaser                                    */}
        {/* ===================================================================== */}
        <div
          style={{
            padding: "36px 32px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, rgba(143, 24, 56, 0.15) 0%, rgba(14, 165, 233, 0.15) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "24px",
            marginBottom: "80px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#CBD5E1", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", marginBottom: "8px" }}>
              <MapPin size={16} color="var(--color-azure-bright)" />
              <span>Unsere Spielstätten</span>
            </div>
            <h3 style={{ fontSize: "1.6rem", color: "#FFFFFF", fontWeight: 700, margin: "0 0 10px 0" }}>
              Hallen &amp; Standorte im Überblick
            </h3>
            <p style={{ color: "#CBD5E1", fontSize: "0.95rem", lineHeight: 1.6, maxWidth: "680px", margin: 0 }}>
              Finde alle 5 Sporthallen in Dachau und Karlsfeld inklusive Adressen, Routenplaner-Links,
              Parkhinweisen und Hallenrichtlinien auf unserer interaktiven Hallenseite.
            </p>
          </div>

          <Link
            href="/hallen"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "14px 24px",
              borderRadius: "12px",
              background: "var(--color-azure)",
              color: "#FFFFFF",
              fontSize: "0.95rem",
              fontWeight: 700,
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
          >
            <span>Zu allen Hallendetails</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

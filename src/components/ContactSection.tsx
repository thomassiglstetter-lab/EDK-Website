"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare, Clock, Instagram, ArrowUpRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import defaultContactData from "@/data/contact.json";

export default function ContactSection() {
  const { ref: sectionRef, isRevealed } = useScrollReveal({ threshold: 0.08 });
  const [contactSettings, setContactSettings] = useState<any>(defaultContactData);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [mailSentInfo, setMailSentInfo] = useState<{ mailSent: boolean; targetEmail: string } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: defaultContactData.categories[0]?.name || "Allgemeine Vereinsanfrage",
    message: "",
  });

  useEffect(() => {
    fetch("/api/contact", { cache: "no-store", headers: { "Cache-Control": "no-cache", Pragma: "no-cache" } })
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.categories) && data.categories.length > 0) {
          setContactSettings(data);
          // ensure current category is valid
          setFormData((prev) => {
            const exists = data.categories.some((c: any) => c.name === prev.category && c.active !== false);
            if (!exists) {
              const firstActive = data.categories.find((c: any) => c.active !== false);
              return { ...prev, category: firstActive ? firstActive.name : prev.category };
            }
            return prev;
          });
        }
      })
      .catch((err) => console.error("Error loading contact categories:", err));
  }, []);

  const jugendEmail = contactSettings.categories?.find((c: any) => c.id === "cat-jugend" || c.name.toLowerCase().includes("jugend"))?.email || "jugend@eintracht-handball.de";
  const aktiveEmail = contactSettings.categories?.find((c: any) => c.id === "cat-aktive" || c.name.toLowerCase().includes("aktive"))?.email || "aktive@eintracht-handball.de";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/contact/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Fehler beim Absenden der Nachricht.");
      }

      setMailSentInfo({
        mailSent: Boolean(data.mailSent),
        targetEmail: data.targetEmail,
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error("Submit error:", err);
      setSubmitError(err.message || "Es gab ein Problem beim Übertragen. Bitte versuche es noch einmal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="kontakt"
      className="reveal-container"
      style={{
        position: "relative",
        zIndex: 10,
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "80px 24px 120px 24px",
      }}
    >
      {/* Section Header (Fly-In) */}
      <div
        className={`reveal-3d-header ${isRevealed ? "is-revealed" : ""}`}
        style={{
          maxWidth: "680px",
          marginBottom: "56px",
        }}
      >
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
          <MessageSquare size={15} />
          <span>Kontakt & Probetraining</span>
        </div>

        <h2
          style={{
            fontSize: "clamp(2.2rem, 4vw, 3.2rem)",
            fontWeight: 700,
            lineHeight: 1.1,
            color: "#FFFFFF",
            marginBottom: "18px",
            letterSpacing: "-0.03em",
          }}
        >
          Werde Teil der Eintracht. <br />
          Wir freuen uns auf dich.
        </h2>

        <p
          style={{
            color: "#CBD5E1",
            fontSize: "clamp(1.02rem, 1.2vw, 1.12rem)",
            lineHeight: 1.65,
          }}
        >
          Egal ob du nach einem Probetraining für dein Kind suchst, selbst wieder
          den Ball in die Hand nehmen möchtest oder Fragen zum Verein hast.
        </p>
      </div>

      {/* 2-Column Grid: Info & Form with 3D Slide Entrance */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "36px",
        }}
      >
        {/* Left Column: Direct Channels (Slide Left) */}
        <div
          className={`reveal-3d-slide-left ${isRevealed ? "is-revealed" : ""}`}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            transitionDelay: "0.1s",
          }}
        >
          {/* Channel Card 1: Jugend */}
          <div
            className="glass-panel"
            style={{
              padding: "28px",
              background: "rgba(13, 17, 26, 0.85)",
              borderLeft: "3px solid var(--color-crimson)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "rgba(143, 24, 56, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFA6BD",
                }}
              >
                <Mail size={18} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#94A3B8",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Jugendleitung & Probetraining
                </div>
                <div
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    color: "#FFFFFF",
                  }}
                >
                  {jugendEmail}
                </div>
              </div>
            </div>
            <p style={{ fontSize: "0.88rem", color: "#CBD5E1", lineHeight: 1.5 }}>
              Für Schnuppertrainings von den Minis (ab 5 Jahren) bis zur
              A-Jugend.
            </p>
          </div>

          {/* Channel Card 2: Aktive Damen & Herren */}
          <div
            className="glass-panel"
            style={{
              padding: "28px",
              background: "rgba(13, 17, 26, 0.85)",
              borderLeft: "3px solid var(--color-azure)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "rgba(72, 156, 216, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-azure-bright)",
                }}
              >
                <Phone size={18} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#94A3B8",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Aktive Damen & Herren
                </div>
                <div
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    color: "#FFFFFF",
                  }}
                >
                  {aktiveEmail}
                </div>
              </div>
            </div>
            <p style={{ fontSize: "0.88rem", color: "#CBD5E1", lineHeight: 1.5 }}>
              Für Quereinsteiger, Vereinswechsler und interessierte
              Senioren-Spieler.
            </p>
          </div>

          {/* Channel Card 3: Spielstätten */}
          <div
            className="glass-panel"
            style={{
              padding: "28px",
              background: "rgba(13, 17, 26, 0.85)",
              borderLeft: "3px solid rgba(255, 255, 255, 0.35)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                }}
              >
                <MapPin size={18} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#94A3B8",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Trainings- & Spielorte
                </div>
                <div
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    color: "#FFFFFF",
                  }}
                >
                  Dachau & Karlsfeld
                </div>
              </div>
            </div>
            <p style={{ fontSize: "0.88rem", color: "#CBD5E1", lineHeight: 1.5, marginBottom: "10px" }}>
              5 offizielle Spielstätten: Berufsschule, Realschule & Augustenfeld (Dachau)
              sowie Mittelschule (MSK) & Grundschule (GSK) (Karlsfeld).
            </p>
            <Link
              href="/hallen"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.82rem",
                color: "var(--color-azure-bright)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <span>Hallen & Routenplaner ansehen</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>

          {/* Channel Card 4: Instagram Community */}
          <div
            className="glass-panel"
            style={{
              padding: "24px 28px",
              background: "rgba(13, 17, 26, 0.85)",
              borderLeft: "3px solid #E1306C",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    boxShadow: "0 4px 14px rgba(225, 48, 108, 0.35)",
                    flexShrink: 0,
                  }}
                >
                  <Instagram size={20} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#94A3B8",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Social Media & Storys
                  </div>
                  <div
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: 600,
                      color: "#FFFFFF",
                    }}
                  >
                    @handballeintracht
                  </div>
                </div>
              </div>

              <a
                href="https://www.instagram.com/handballeintracht/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  borderRadius: "var(--radius-full)",
                  background: "rgba(225, 48, 108, 0.15)",
                  border: "1px solid rgba(225, 48, 108, 0.4)",
                  color: "#FFFFFF",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#E1306C";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(225, 48, 108, 0.15)";
                }}
              >
                <span>Auf Instagram folgen</span>
                <ArrowUpRight size={13} />
              </a>
            </div>
            <p style={{ fontSize: "0.88rem", color: "#CBD5E1", lineHeight: 1.5, margin: 0 }}>
              Aktuelle Spieltags-Highlights, Trainings-Eindrücke und Vereins-News direkt auf deinem Smartphone.
            </p>
          </div>
        </div>

        {/* Right Column: Contact Form (Slide Right) */}
        <div
          className={`glass-panel reveal-3d-slide-right ${isRevealed ? "is-revealed" : ""}`}
          style={{
            padding: "36px 32px",
            background: "rgba(14, 18, 28, 0.9)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "0 16px 48px rgba(0, 0, 0, 0.6)",
            transitionDelay: "0.22s",
          }}
        >
          {submitted ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                minHeight: "360px",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "rgba(16, 185, 129, 0.15)",
                  border: "1px solid rgba(16, 185, 129, 0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#34D399",
                }}
              >
                <CheckCircle2 size={32} />
              </div>

              <h3
                style={{
                  fontSize: "1.6rem",
                  color: "#FFFFFF",
                  fontWeight: 700,
                }}
              >
                Nachricht erfolgreich gesendet!
              </h3>

              <p
                style={{
                  color: "#CBD5E1",
                  maxWidth: "400px",
                  lineHeight: 1.6,
                  fontSize: "0.98rem",
                  margin: 0,
                }}
              >
                Vielen Dank für deine Nachricht,{" "}
                <strong style={{ color: "#FFFFFF" }}>{formData.name}</strong>.
              </p>

              <div
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  padding: "14px 18px",
                  fontSize: "0.85rem",
                  color: "#CBD5E1",
                  maxWidth: "420px",
                  width: "100%",
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-azure-bright)", fontWeight: 600 }}>
                  <Mail size={15} />
                  <span>Empfänger: {mailSentInfo?.targetEmail || "Vereinsleitung"}</span>
                </div>
                <div style={{ color: "#94A3B8", fontSize: "0.8rem", lineHeight: 1.4 }}>
                  {mailSentInfo?.mailSent
                    ? "✓ Deine Anfrage wurde per E-Mail an das Team übermittelt. Wir antworten dir in der Regel innerhalb von 1–2 Werktagen."
                    : "Deine Anfrage wurde sicher im Vereins-System erfasst. Unser Team bearbeitet dein Anliegen in Kürze!"}
                </div>
              </div>

              <button
                onClick={() => {
                  setSubmitted(false);
                  setMailSentInfo(null);
                  setFormData({
                    name: "",
                    email: "",
                    category: contactSettings.categories?.[0]?.name || "Allgemeine Vereinsanfrage",
                    message: "",
                  });
                }}
                className="btn-secondary"
                style={{ marginTop: "8px" }}
              >
                Weitere Nachricht senden
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "22px" }}
            >
              <div style={{ marginBottom: "8px" }}>
                <h3
                  style={{
                    fontSize: "1.35rem",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    marginBottom: "6px",
                  }}
                >
                  Nachricht schreiben
                </h3>
                <p style={{ fontSize: "0.88rem", color: "#94A3B8" }}>
                  Fülle die Felder aus – wir leiten dein Anliegen an den passenden
                  Ansprechpartner weiter.
                </p>
              </div>

              {/* Name */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "#CBD5E1",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Name & Vorname *
                </label>
                <input
                  type="text"
                  required
                  placeholder="z.B. Markus Huber"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "13px 16px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#FFFFFF",
                    fontSize: "0.95rem",
                    outline: "none",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--color-azure)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor =
                      "rgba(255, 255, 255, 0.12)")
                  }
                />
              </div>

              {/* Email */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "#CBD5E1",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  E-Mail-Adresse *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@beispiel.de"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "13px 16px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#FFFFFF",
                    fontSize: "0.95rem",
                    outline: "none",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--color-azure)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor =
                      "rgba(255, 255, 255, 0.12)")
                  }
                />
              </div>

              {/* Category */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "#CBD5E1",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Bereich / Anliegen *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "13px 16px",
                    borderRadius: "var(--radius-sm)",
                    background: "#141a24",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#FFFFFF",
                    fontSize: "0.95rem",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  {contactSettings.categories && contactSettings.categories.length > 0 ? (
                    contactSettings.categories
                      .filter((c: any) => c.active !== false)
                      .map((c: any) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))
                  ) : (
                    <option value="Allgemeine Vereinsanfrage">Allgemeine Vereinsanfrage</option>
                  )}
                </select>

                {/* Routing-Hinweis zur ausgewählten Kategorie */}
                {(() => {
                  const selectedCat = contactSettings.categories?.find(
                    (c: any) => c.name === formData.category
                  );
                  if (selectedCat && selectedCat.email) {
                    return (
                      <div
                        style={{
                          marginTop: "6px",
                          fontSize: "0.78rem",
                          color: "#94A3B8",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <Mail size={12} color="var(--color-azure-bright)" />
                        <span>
                          Empfänger: <strong style={{ color: "#E2E8F0" }}>{selectedCat.email}</strong>
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Message */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "#CBD5E1",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Deine Nachricht *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Wie können wir dir helfen? (z.B. Jahrgang für Jugendtraining, bisherige Spielerfahrung etc.)"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "13px 16px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#FFFFFF",
                    fontSize: "0.95rem",
                    outline: "none",
                    resize: "vertical",
                    fontFamily: "inherit",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--color-azure)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor =
                      "rgba(255, 255, 255, 0.12)")
                  }
                />
              </div>

              {submitError && (
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.35)",
                    color: "#FCA5A5",
                    fontSize: "0.85rem",
                    lineHeight: 1.4,
                  }}
                >
                  {submitError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{
                  width: "100%",
                  padding: "14px",
                  fontSize: "0.98rem",
                  marginTop: "6px",
                  opacity: isSubmitting ? 0.75 : 1,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                }}
              >
                <span>{isSubmitting ? "Wird gesendet..." : "Nachricht absenden"}</span>
                <Send size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

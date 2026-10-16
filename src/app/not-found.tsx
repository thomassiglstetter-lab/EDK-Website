import React from "react";
import Link from "next/link";
import { ArrowLeft, Users, Home, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#080B10" }}>
      <Header />

      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "140px 24px 100px 24px",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(230, 57, 70, 0.12) 0%, rgba(14, 165, 233, 0.08) 50%, transparent 70%)",
            pointerEvents: "none",
            filter: "blur(40px)",
          }}
        />

        <div
          className="glass-panel"
          style={{
            maxWidth: "600px",
            width: "100%",
            padding: "48px 36px",
            borderRadius: "24px",
            background: "rgba(13, 17, 26, 0.9)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 25px 60px rgba(0, 0, 0, 0.7)",
            textAlign: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "18px",
              background: "rgba(230, 57, 70, 0.15)",
              border: "1px solid rgba(230, 57, 70, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px auto",
              color: "var(--color-crimson-bright)",
            }}
          >
            <AlertCircle size={32} />
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "9999px",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#94A3B8",
              fontSize: "0.8rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "16px",
            }}
          >
            404 — Nicht gefunden
          </div>

          <h1
            style={{
              fontSize: "clamp(1.8rem, 3.5vw, 2.2rem)",
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
              marginBottom: "14px",
              lineHeight: 1.2,
            }}
          >
            Seite oder Team nicht gefunden
          </h1>

          <p
            style={{
              color: "#94A3B8",
              fontSize: "0.98rem",
              lineHeight: 1.6,
              marginBottom: "32px",
              maxWidth: "460px",
              marginInline: "auto",
            }}
          >
            Die von dir aufgerufene Mannschaft oder Seite existiert nicht mehr, wurde im Admin-Bereich gelöscht oder der Link ist veraltet.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              justifyContent: "center",
            }}
          >
            <Link
              href="/#teams"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 22px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, var(--color-crimson) 0%, #B91C1C 100%)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#FFFFFF",
                fontSize: "0.9rem",
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 8px 20px rgba(230, 57, 70, 0.35)",
                transition: "all 0.2s ease",
              }}
            >
              <Users size={16} />
              <span>Zu den Mannschaften</span>
            </Link>

            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 22px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#E2E8F0",
                fontSize: "0.9rem",
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              <Home size={16} />
              <span>Zur Startseite</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

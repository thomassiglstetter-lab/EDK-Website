"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { RotateCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Client Exception caught by error boundary:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#07090D",
        color: "#F8FAFC",
        fontFamily: "var(--font-body)",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "480px",
          width: "100%",
          textAlign: "center",
          background: "rgba(13, 17, 23, 0.8)",
          padding: "36px 28px",
          borderRadius: "20px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.7)",
        }}
      >
        <img
          src="/logo-dark.png"
          alt="Eintracht Dachau-Karlsfeld"
          style={{ width: "64px", height: "auto", margin: "0 auto 20px auto" }}
        />
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.45rem",
            fontWeight: 700,
            marginBottom: "12px",
            color: "#FFFFFF",
          }}
        >
          Eintracht Dachau-Karlsfeld
        </h1>
        <p
          style={{
            color: "#94A3B8",
            fontSize: "0.92rem",
            lineHeight: 1.5,
            marginBottom: "28px",
          }}
        >
          Die Seite konnte nicht vollständig geladen werden. Bitte aktualisieren Sie die Ansicht.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.reload();
              } else {
                reset();
              }
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              borderRadius: "9999px",
              border: "none",
              background: "linear-gradient(135deg, #8F1838 0%, #489CD8 100%)",
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
              touchAction: "manipulation",
            }}
          >
            <RotateCw size={16} />
            <span>Seite neu laden</span>
          </button>
          <Link
            href="/"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = "/";
              }
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              borderRadius: "9999px",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              background: "rgba(255, 255, 255, 0.05)",
              color: "#CBD5E1",
              textDecoration: "none",
              fontWeight: 500,
              fontSize: "0.9rem",
              cursor: "pointer",
              touchAction: "manipulation",
            }}
          >
            <Home size={16} />
            <span>Start</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

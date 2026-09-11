"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import HeroCrest3D from "./HeroCrest3D";

export default function HeroContent() {
  const { ref: heroRef, isRevealed } = useScrollReveal({ threshold: 0.15, rootMargin: "0px" });

  const handleScrollToNews = (e: React.MouseEvent) => {
    e.preventDefault();
    const newsEl = document.getElementById("news");
    if (newsEl) {
      newsEl.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
    }
  };

  return (
    <div
      ref={heroRef}
      className="reveal-container hero-wrapper"
      style={{
        position: "relative",
        zIndex: 10,
        maxWidth: "1320px",
        margin: "0 auto",
        padding: "110px 28px 60px 28px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      {/* Balanced 2-Column Hero Stage: Editorial Content Left, Heroic 3D Crest Right */}
      <div className="hero-stage-grid">
        {/* Left Column: Editorial Text & High-Contrast Stats */}
        <div
          className={`reveal-3d-header ${isRevealed ? "is-revealed" : ""}`}
          style={{
            maxWidth: "640px",
            background:
              "radial-gradient(ellipse at 15% 50%, rgba(7, 9, 13, 0.88) 0%, rgba(7, 9, 13, 0.45) 60%, transparent 80%)",
            padding: "16px 24px 20px 0",
            borderRadius: "24px",
            zIndex: 2,
          }}
        >
          {/* Hero Title - Bold, high-contrast typography */}
          <h1
            style={{
              fontSize: "clamp(2.8rem, 5.2vw, 4.8rem)",
              fontWeight: 700,
              lineHeight: 1.04,
              letterSpacing: "-0.035em",
              marginBottom: "22px",
              color: "#FFFFFF",
              textShadow:
                "0 4px 28px rgba(0, 0, 0, 0.9), 0 1px 4px rgba(0, 0, 0, 0.8)",
            }}
          >
            Gemeinschaft. <br />
            Leidenschaft. <br />
            <span
              style={{
                color: "#FFFFFF",
                textShadow:
                  "0 4px 32px rgba(0, 0, 0, 0.95), 0 0 24px rgba(72, 156, 216, 0.45)",
              }}
            >
              Eintracht.
            </span>
          </h1>

          {/* Subtitle with High Contrast & Readability */}
          <p
            style={{
              fontSize: "clamp(1.05rem, 1.35vw, 1.25rem)",
              lineHeight: 1.62,
              color: "#E2E8F0",
              marginBottom: "36px",
              fontWeight: 400,
              maxWidth: "540px",
              textShadow:
                "0 2px 14px rgba(0, 0, 0, 0.9), 0 1px 2px rgba(0, 0, 0, 0.8)",
            }}
          >
            Die Spielgemeinschaft aus TSV Dachau 1865 und TSV Eintracht Karlsfeld.
            Spitzenhandball, leidenschaftliche Nachwuchsförderung und echter
            Zusammenhalt im Münchner Norden.
          </p>

          {/* Stats Strip - Crisp typography & solid backdrop */}
          <div
            className="hero-stats-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "14px",
              maxWidth: "520px",
              pointerEvents: "auto",
            }}
          >
            <div
              className={`reveal-3d-card ${isRevealed ? "is-revealed" : ""}`}
              style={{
                padding: "16px 18px",
                borderRadius: "var(--radius-md)",
                background: "rgba(11, 15, 23, 0.90)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderTop: "3px solid var(--color-crimson)",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
                transitionDelay: "0.1s",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  lineHeight: 1,
                  marginBottom: "6px",
                  textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                }}
              >
                20+
              </div>
              <div
                style={{
                  fontSize: "0.78rem",
                  color: "#CBD5E1",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Teams im Spielbetrieb
              </div>
            </div>

            <div
              className={`reveal-3d-card ${isRevealed ? "is-revealed" : ""}`}
              style={{
                padding: "16px 18px",
                borderRadius: "var(--radius-md)",
                background: "rgba(11, 15, 23, 0.90)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderTop: "3px solid rgba(255, 255, 255, 0.45)",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
                transitionDelay: "0.2s",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  lineHeight: 1,
                  marginBottom: "6px",
                  textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                }}
              >
                350+
              </div>
              <div
                style={{
                  fontSize: "0.78rem",
                  color: "#CBD5E1",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Aktive Handballer
              </div>
            </div>

            <div
              className={`reveal-3d-card ${isRevealed ? "is-revealed" : ""}`}
              style={{
                padding: "16px 18px",
                borderRadius: "var(--radius-md)",
                background: "rgba(11, 15, 23, 0.90)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderTop: "3px solid var(--color-azure)",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
                transitionDelay: "0.3s",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  lineHeight: 1,
                  marginBottom: "6px",
                  textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                }}
              >
                5
              </div>
              <div
                style={{
                  fontSize: "0.78rem",
                  color: "#CBD5E1",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Moderne Hallen
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Heroic 3D Club Crest Stage (Eye-Catcher, Perfectly Centered) */}
        <div
          className={`hero-crest-stage ${isRevealed ? "is-revealed" : ""}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            minHeight: "480px",
            position: "relative",
            pointerEvents: "auto",
            zIndex: 5,
          }}
        >
          <HeroCrest3D />
        </div>
      </div>

      {/* Apple-Style Scroll Down Cue & Animation */}
      <a
        href="#news"
        onClick={handleScrollToNews}
        className={`apple-scroll-cue ${isRevealed ? "is-revealed" : ""}`}
        style={{
          position: "absolute",
          bottom: "28px",
          left: "50%",
          transform: isRevealed ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(20px)",
          opacity: isRevealed ? 1 : 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
          textDecoration: "none",
          pointerEvents: "auto",
          cursor: "pointer",
          zIndex: 20,
          transition: "opacity 0.6s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        aria-label="Nach unten scrollen zu News"
      >
        <div className="apple-mouse-pill">
          <div className="apple-wheel-dot" />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            color: "#CBD5E1",
            fontSize: "0.72rem",
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          <span>Scrollen</span>
          <ChevronDown size={13} className="apple-chevron" />
        </div>
      </a>

      <style jsx>{`
        .hero-stage-grid {
          display: grid;
          grid-template-columns: 1.12fr 0.88fr;
          gap: 40px;
          align-items: center;
          width: 100%;
          margin-top: 10px;
        }

        .hero-crest-stage {
          opacity: 0;
          transform: scale(0.94) translateY(24px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hero-crest-stage.is-revealed {
          opacity: 1;
          transform: scale(1) translateY(0);
        }

        .apple-scroll-cue:hover {
          transform: translateX(-50%) translateY(-3px) !important;
        }

        .apple-mouse-pill {
          position: relative;
          width: 24px;
          height: 40px;
          border-radius: 9999px;
          border: 1.5px solid rgba(255, 255, 255, 0.3);
          background: rgba(10, 14, 20, 0.65);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4),
            inset 0 1px 2px rgba(255, 255, 255, 0.15);
          display: flex;
          justify-content: center;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .apple-scroll-cue:hover .apple-mouse-pill {
          border-color: var(--color-azure-bright);
          box-shadow: 0 6px 24px rgba(72, 156, 216, 0.35),
            inset 0 1px 4px rgba(255, 255, 255, 0.3);
        }

        .apple-wheel-dot {
          position: absolute;
          top: 6px;
          width: 4px;
          height: 7px;
          border-radius: 3px;
          background: #ffffff;
          box-shadow: 0 0 8px rgba(72, 156, 216, 0.9),
            0 0 2px rgba(255, 255, 255, 1);
          animation: appleScrollWheel 2.2s cubic-bezier(0.65, 0, 0.35, 1)
            infinite;
        }

        .apple-chevron {
          animation: appleChevronPulse 2.2s ease-in-out infinite;
        }

        @keyframes appleScrollWheel {
          0% {
            opacity: 0;
            transform: translateY(0) scaleY(0.6);
          }
          20% {
            opacity: 1;
            transform: translateY(3px) scaleY(1);
          }
          65% {
            opacity: 1;
            transform: translateY(16px) scaleY(1);
          }
          95%,
          100% {
            opacity: 0;
            transform: translateY(22px) scaleY(0.5);
          }
        }

        @keyframes appleChevronPulse {
          0%,
          100% {
            opacity: 0.4;
            transform: translateY(0);
          }
          50% {
            opacity: 1;
            transform: translateY(3px);
            color: var(--color-azure-bright);
          }
        }

        @media (max-width: 1024px) {
          .hero-stage-grid {
            grid-template-columns: 1fr;
            gap: 28px;
            text-align: center;
          }
          .hero-stage-grid > div:first-child {
            margin: 0 auto;
            padding-right: 0;
          }
          .hero-stage-grid h1 {
            text-align: center;
          }
          .hero-stage-grid p {
            margin-left: auto;
            margin-right: auto;
          }
          .hero-stage-grid > div:first-child > div:nth-child(3) {
            justify-content: center;
          }
          .hero-stage-grid > div:first-child > div:nth-child(4) {
            margin: 0 auto;
          }
          .hero-crest-stage {
            min-height: 380px;
            order: -1;
          }
        }

        @media (max-width: 640px) {
          .apple-scroll-cue {
            bottom: 18px;
          }
        }

        @media (max-width: 520px) {
          :global(.hero-stats-grid) {
            gap: 8px !important;
          }
          :global(.hero-stats-grid > div) {
            padding: 12px 10px !important;
          }
        }
      `}</style>
    </div>
  );
}

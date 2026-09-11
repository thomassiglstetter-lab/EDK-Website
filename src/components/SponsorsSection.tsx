"use client";

import React, { useState, useEffect } from "react";
import { Handshake, ChevronRight, ExternalLink } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface Sponsor {
  id?: string;
  name: string;
  tier?: "gold" | "silver" | "partner" | "none";
  url?: string;
  logo?: string;
  fit?: "cover" | "contain";
}

const initialSponsors: Sponsor[] = [
  {
    id: "sp-1",
    name: "Stadtwerke Dachau",
    tier: "gold",
    url: "https://www.stadtwerke-dachau.de",
    logo: "/sponsors/stadtwerke-dachau.svg",
  },
  {
    id: "sp-2",
    name: "Sparkasse Dachau",
    tier: "gold",
    url: "https://www.sparkasse-dachau.de",
    logo: "/sponsors/sparkasse-dachau.svg",
  },
  {
    id: "sp-3",
    name: "Autohaus Demmler",
    tier: "silver",
    url: "https://www.autohaus-demmler.de",
    logo: "/sponsors/autohaus-demmler.svg",
  },
  {
    id: "sp-4",
    name: "Dachauer Sportzentren",
    tier: "silver",
    url: "https://www.dachau.de",
    logo: "/sponsors/sportzentren-dachau.svg",
  },
  {
    id: "sp-5",
    name: "Physio Karlsfeld",
    tier: "partner",
    url: "https://www.physiotherapie-karlsfeld.de",
    logo: "/sponsors/physio-karlsfeld.svg",
  },
  {
    id: "sp-6",
    name: "Metzgerei Huber",
    tier: "partner",
    url: "https://www.metzgerei-huber.de",
    logo: "/sponsors/metzgerei-huber.svg",
  },
  {
    id: "sp-7",
    name: "Bäckerei Lang",
    tier: "gold",
    url: "https://www.baeckerei-lang.de",
    logo: "/uploads/sponsors/b-ckerei-lang-cropped-1789139269756.png",
    fit: "contain",
  },
  {
    id: "sp-8",
    name: "IT-Service Müller",
    tier: "partner",
    url: "https://www.it-service-mueller.de",
    logo: "/sponsors/it-service-mueller.svg",
    fit: "contain",
  },
  {
    id: "sp-1788952714718",
    name: "Dachau Sports Nutrition",
    tier: "gold",
    url: "https://dachau-sports.de",
    logo: "/sponsors/dachau-sports-nutrition.svg",
    fit: "contain",
  },
  {
    id: "sp-1789053571188",
    name: "Tommy Tronic",
    tier: "none",
    url: "",
    logo: "/uploads/sponsors/tommy-tronic-cropped-1789056316291.png",
    fit: "contain",
  },
];

export default function SponsorsSection() {
  const [sponsorsList, setSponsorsList] = useState<Sponsor[]>(initialSponsors);
  const { ref: sectionRef, isRevealed } = useScrollReveal({ threshold: 0.1 });

  useEffect(() => {
    const loadFromCache = () => {
      try {
        const cached = localStorage.getItem("edk_sponsors_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSponsorsList(parsed);
          }
        }
      } catch {}
    };

    const fetchFresh = () => {
      fetch("/api/sponsors", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Failed to fetch sponsors");
        })
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            let merged = data;
            try {
              const cachedRaw = localStorage.getItem("edk_sponsors_cache");
              if (cachedRaw) {
                const cachedArr: Sponsor[] = JSON.parse(cachedRaw);
                if (Array.isArray(cachedArr) && cachedArr.length > 0) {
                  const cachedMap = new Map<string, Sponsor>();
                  cachedArr.forEach((c) => {
                    if (c.id) cachedMap.set(c.id, c);
                    else if (c.name) cachedMap.set(c.name.toLowerCase().trim(), c);
                  });
                  merged = data.map((server) => {
                    const cached = cachedMap.get(server.id) || cachedMap.get(server.name.toLowerCase().trim());
                    if (!cached) return server;
                    return {
                      ...server,
                      tier: cached.tier || server.tier,
                      logo: cached.logo || server.logo,
                      fit: cached.fit || server.fit,
                      url: cached.url !== undefined ? cached.url : server.url,
                    };
                  });
                  cachedArr.forEach((c) => {
                    const exists = merged.some((m) => m.id === c.id || m.name.toLowerCase().trim() === c.name.toLowerCase().trim());
                    if (!exists) merged.push(c);
                  });
                }
              }
            } catch {}

            setSponsorsList(merged);
            try {
              localStorage.setItem("edk_sponsors_cache", JSON.stringify(merged));
            } catch {}
          }
        })
        .catch((err) => console.log("Using initial sponsors fallback:", err));
    };

    // 1. Initial load
    loadFromCache();
    fetchFresh();

    // 2. Real-time sync: when updated from admin in same tab, other tabs or on window focus
    const handleUpdate = () => {
      loadFromCache();
      fetchFresh();
    };

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("edk_sponsors_updated", handleUpdate);
    window.addEventListener("focus", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("edk_sponsors_updated", handleUpdate);
      window.removeEventListener("focus", handleUpdate);
    };
  }, []);

  // Duplicate for seamless infinite marquee loop
  const marqueeSponsors = [...sponsorsList, ...sponsorsList];

  return (
    <section
      ref={sectionRef}
      id="partner"
      style={{
        position: "relative",
        zIndex: 10,
        padding: "80px 0 100px 0",
        borderTop: "1px solid rgba(255, 255, 255, 0.06)",
      }}
    >
      <div
        className={`reveal-3d-header ${isRevealed ? "is-revealed" : ""}`}
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 24px",
          marginBottom: "52px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "24px",
        }}
      >
        <div>
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
            }}
          >
            <Handshake size={15} />
            <span>Partner &amp; Sponsoren</span>
          </div>

          <h2
            style={{
              fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              color: "#FFFFFF",
              letterSpacing: "-0.03em",
            }}
          >
            Gemeinsam für den Handballsport.
          </h2>
        </div>

        <a
          href="#kontakt"
          className="btn-secondary"
          style={{
            padding: "10px 22px",
            fontSize: "0.88rem",
          }}
        >
          <span>Sponsor werden</span>
          <ChevronRight size={15} />
        </a>
      </div>

      {/* Marquee Container */}
      <div
        className={`reveal-3d-card ${isRevealed ? "is-revealed" : ""}`}
        style={{
          overflow: "hidden",
          position: "relative",
          transitionDelay: "0.2s",
        }}
      >
        {/* Left / Right Fade Edges */}
        <div
          className="sponsor-fade-edge sponsor-fade-left"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            background: "linear-gradient(to right, rgba(7,9,13,1), transparent)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />
        <div
          className="sponsor-fade-edge sponsor-fade-right"
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            background: "linear-gradient(to left, rgba(7,9,13,1), transparent)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />

        {/* Scrolling Track */}
        <div className="sponsor-marquee-track">
          {marqueeSponsors.map((sponsor, idx) => {
            const tierColors: Record<string, { bg: string; border: string; hoverBorder: string; glow: string; text: string; label: string }> = {
              gold: {
                bg: "rgba(245, 158, 11, 0.06)",
                border: "rgba(245, 158, 11, 0.25)",
                hoverBorder: "rgba(245, 158, 11, 0.8)",
                glow: "rgba(245, 158, 11, 0.35)",
                text: "#FBBF24",
                label: "Gold-Partner",
              },
              silver: {
                bg: "rgba(148, 163, 184, 0.06)",
                border: "rgba(148, 163, 184, 0.2)",
                hoverBorder: "rgba(203, 213, 225, 0.7)",
                glow: "rgba(148, 163, 184, 0.25)",
                text: "#CBD5E1",
                label: "Silber-Partner",
              },
              partner: {
                bg: "rgba(72, 156, 216, 0.04)",
                border: "rgba(72, 156, 216, 0.18)",
                hoverBorder: "rgba(94, 178, 238, 0.7)",
                glow: "rgba(72, 156, 216, 0.25)",
                text: "#5EB2EE",
                label: "Förderer",
              },
              none: {
                bg: "rgba(255, 255, 255, 0.03)",
                border: "rgba(255, 255, 255, 0.12)",
                hoverBorder: "rgba(255, 255, 255, 0.6)",
                glow: "rgba(255, 255, 255, 0.2)",
                text: "transparent",
                label: "",
              },
            };
            const currentTier = sponsor.tier && tierColors[sponsor.tier] ? sponsor.tier : "none";
            const colors = tierColors[currentTier];

            return (
              <a
                key={`${sponsor.id || sponsor.name}-${idx}`}
                href={sponsor.url || "#partner"}
                target={sponsor.url ? "_blank" : undefined}
                rel={sponsor.url ? "noopener noreferrer" : undefined}
                className="sponsor-card"
                title={sponsor.url ? `${sponsor.name} – Website besuchen` : sponsor.name}
                style={
                  {
                    "--card-bg": colors.bg,
                    "--card-border": colors.border,
                    "--hover-border": colors.hoverBorder,
                    "--hover-glow": colors.glow,
                  } as React.CSSProperties
                }
              >
                {/* Dedicated Top Bar: Tier Badge on left/center & External Link indicator on right */}
                <div className="sponsor-card-topbar">
                  {colors.label ? (
                    <span
                      className="sponsor-tier-pill"
                      style={{
                        color: colors.text,
                        borderColor: colors.border,
                        background: colors.border.replace("0.25", "0.15").replace("0.2", "0.15").replace("0.18", "0.15"),
                      }}
                    >
                      {colors.label}
                    </span>
                  ) : (
                    <span />
                  )}
                  {sponsor.url && (
                    <span className="sponsor-external-icon">
                      <ExternalLink size={11} />
                    </span>
                  )}
                </div>

                {/* Sponsor Logo Container: Completely separated from the top bar - zero overlap possible! */}
                {sponsor.logo ? (
                  <div
                    className={`sponsor-logo-container ${
                      sponsor.fit === "cover" ? "is-cover" : "is-contain"
                    }`}
                  >
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      className="sponsor-logo"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/logo-dark.png";
                      }}
                    />
                  </div>
                ) : (
                  /* Fallback when no logo is uploaded */
                  <div className="sponsor-fallback-wrapper">
                    <span className="sponsor-name">{sponsor.name}</span>
                  </div>
                )}
              </a>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .sponsor-fade-edge {
          width: 80px;
        }

        .sponsor-marquee-track {
          display: flex;
          gap: 22px;
          animation: sponsorMarquee 38s linear infinite;
          width: max-content;
          padding: 12px 0;
        }

        .sponsor-marquee-track:hover {
          animation-play-state: paused;
        }

        .sponsor-card {
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 8px 12px 10px 12px;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-md);
          min-width: 250px;
          height: 122px;
          flex-shrink: 0;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }

        .sponsor-card:hover {
          transform: translateY(-4px) scale(1.02);
          border-color: var(--hover-border) !important;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.75), 0 0 28px var(--hover-glow);
          background: rgba(16, 22, 34, 0.96);
        }

        .sponsor-card-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          height: 20px;
          margin-bottom: 2px;
          flex-shrink: 0;
        }

        .sponsor-tier-pill {
          font-size: 0.62rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 2px 8px;
          border-radius: 9999px;
          border: 1px solid;
          display: inline-flex;
          align-items: center;
          line-height: 1.2;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
          transition: all 0.25s ease;
        }

        .sponsor-card:hover .sponsor-tier-pill {
          border-color: var(--hover-border);
          box-shadow: 0 2px 10px var(--hover-glow);
        }

        .sponsor-external-icon {
          color: rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          transition: color 0.2s ease, transform 0.2s ease;
        }

        .sponsor-card:hover .sponsor-external-icon {
          color: #38BDF8;
          transform: translate(1px, -1px);
        }

        .sponsor-logo-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          overflow: hidden;
          border-radius: 6px;
        }

        .sponsor-logo-container.is-cover {
          padding: 2px 4px;
        }

        .sponsor-logo-container.is-contain {
          padding: 4px 10px;
        }

        .sponsor-logo {
          width: auto;
          height: auto;
          max-width: 100%;
          max-height: 72px;
          object-fit: contain;
          object-position: center;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.45));
        }

        .sponsor-card:hover .sponsor-logo {
          transform: scale(1.04);
        }

        @media (max-width: 640px) {
          .sponsor-card {
            min-width: 210px !important;
            height: 106px !important;
            padding: 6px 10px 8px 10px !important;
          }

          .sponsor-fade-edge {
            width: 24px !important;
          }

          .sponsor-card-topbar {
            height: 18px !important;
            margin-bottom: 2px !important;
          }

          .sponsor-tier-pill {
            font-size: 0.54rem !important;
            padding: 1px 6px !important;
          }

          .sponsor-logo {
            max-height: 60px !important;
          }
        }

        .sponsor-fallback-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          text-align: center;
          width: 100%;
        }

        .sponsor-name {
          font-size: 1.05rem;
          font-weight: 700;
          color: #FFFFFF;
          font-family: var(--font-display);
          text-align: center;
          letter-spacing: 0.01em;
        }

        .sponsor-tier-badge {
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .sponsor-hover-hint {
          position: absolute;
          bottom: 6px;
          left: 50%;
          transform: translateX(-50%) translateY(10px);
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.66rem;
          font-weight: 600;
          color: #E2E8F0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(6px);
          padding: 2px 8px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          opacity: 0;
          transition: all 0.25s ease;
          pointer-events: none;
          white-space: nowrap;
        }

        .sponsor-card:hover .sponsor-hover-hint {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        @keyframes sponsorMarquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}

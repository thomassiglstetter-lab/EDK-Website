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
  scale?: number;
  bg?: "white" | "dark" | "transparent";
}

const initialSponsors: Sponsor[] = [
  {
    id: "sp-1793178042353",
    name: "Farbenpracht",
    tier: "none",
    url: "https://www.farbenpracht-malermeister.de",
    logo: "https://jewlvukxdkqemydsnxnk.supabase.co/storage/v1/object/public/uploads/1793178030290-sponsors-image001-1-cropped-1793178030290.png",
    fit: "contain",
    bg: "white",
    scale: 1.0,
  },
];

export default function SponsorsSection() {
  const [sponsorsList, setSponsorsList] = useState<Sponsor[]>(initialSponsors);
  const [isHovered, setIsHovered] = useState(false);
  const { ref: sectionRef, isRevealed } = useScrollReveal({ threshold: 0.1 });

  useEffect(() => {
    const getDeletedSponsors = (): string[] => {
      try {
        const raw = localStorage.getItem("edk_deleted_sponsors");
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    };

    const isDeleted = (s: Sponsor, deletedList: string[]) => {
      if (s.id && deletedList.includes(s.id)) return true;
      if (s.name && deletedList.includes(s.name.toLowerCase().trim())) return true;
      return false;
    };

    const loadFromCache = () => {
      try {
        const deletedList = getDeletedSponsors();
        const cached = localStorage.getItem("edk_sponsors_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const filtered = parsed.filter((s) => !isDeleted(s, deletedList));
            setSponsorsList(filtered);
            return;
          }
        }
        // Fallback to initialSponsors without deleted
        setSponsorsList(initialSponsors.filter((s) => !isDeleted(s, deletedList)));
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
          if (Array.isArray(data)) {
            const deletedList = getDeletedSponsors();
            const validData = data.filter((s: Sponsor) => !isDeleted(s, deletedList));
            setSponsorsList(validData);
            try {
              localStorage.setItem("edk_sponsors_cache", JSON.stringify(validData));
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

  const isSingleSponsor = sponsorsList.length === 1;

  // For 1 sponsor: exactly 1 card that glides across without duplication
  // For 2+ sponsors: repeat to fill widescreen displays seamlessly
  const marqueeSponsors = React.useMemo(() => {
    if (sponsorsList.length === 0) return [];
    if (sponsorsList.length === 1) return sponsorsList;

    const minCardsPerHalf = 8;
    const multiplier = Math.max(1, Math.ceil(minCardsPerHalf / sponsorsList.length));

    const oneSet: Sponsor[] = [];
    for (let i = 0; i < multiplier; i++) {
      oneSet.push(...sponsorsList);
    }

    // Duplicate oneSet for seamless 50% translateX loop
    return [...oneSet, ...oneSet];
  }, [sponsorsList]);

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

  const renderSponsorCard = (sponsor: Sponsor, key: string, isStatic?: boolean) => {
    const currentTier = sponsor.tier && tierColors[sponsor.tier] ? sponsor.tier : "none";
    const colors = tierColors[currentTier];
    const isWhiteBg = sponsor.bg === "white";

    return (
      <a
        key={key}
        href={sponsor.url || "#partner"}
        target={sponsor.url ? "_blank" : undefined}
        rel={sponsor.url ? "noopener noreferrer" : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`sponsor-card ${isWhiteBg ? "has-white-bg" : ""} ${isSingleSponsor ? "single-runner-card" : ""} ${isStatic ? "is-static-card" : ""}`}
        title={sponsor.url ? `${sponsor.name} – Website besuchen` : sponsor.name}
        style={
          {
            "--card-bg": colors.bg,
            "--card-border": colors.border,
            "--hover-border": colors.hoverBorder,
            "--hover-glow": colors.glow,
            display: "flex",
            flexDirection: "column",
            minWidth: isStatic ? "280px" : "250px",
            maxWidth: isStatic ? "360px" : "320px",
            height: "124px",
            padding: "8px 12px 10px 12px",
            borderRadius: "12px",
            border: `1px solid ${colors.border}`,
            background: colors.bg,
            textDecoration: "none",
            position: "relative",
            overflow: "hidden",
            boxSizing: "border-box",
            cursor: "pointer",
            ...(isHovered ? { animationPlayState: "paused" } : {}),
          } as React.CSSProperties
        }
      >
        {/* Dedicated Top Bar: Tier Badge on left/center & External Link indicator on right */}
        <div
          className="sponsor-card-topbar"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            height: "20px",
            marginBottom: "4px",
            flexShrink: 0,
          }}
        >
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
            <span
              className="sponsor-external-icon"
              style={{
                color: "rgba(255, 255, 255, 0.35)",
                display: "flex",
                alignItems: "center",
              }}
            >
              <ExternalLink size={11} />
            </span>
          )}
        </div>

        {/* Sponsor Logo Container: Completely separated from the top bar */}
        {sponsor.logo ? (
          <div
            className={`sponsor-logo-container ${
              sponsor.fit === "cover" ? "is-cover" : "is-contain"
            } ${isWhiteBg ? "is-white-bg" : ""}`}
            style={{
              flex: 1,
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              borderRadius: "8px",
              background: isWhiteBg ? "#FFFFFF" : sponsor.fit === "cover" ? "rgba(0,0,0,0.2)" : "transparent",
              padding: isWhiteBg ? "8px 16px" : sponsor.fit === "cover" ? "0" : "4px 10px",
              boxShadow: isWhiteBg ? "0 4px 14px rgba(0, 0, 0, 0.45)" : "none",
              boxSizing: "border-box",
            }}
          >
            <img
              src={sponsor.logo}
              alt={sponsor.name}
              className="sponsor-logo"
              style={{
                width: sponsor.fit === "cover" ? "100%" : "auto",
                height: sponsor.fit === "cover" ? "100%" : "auto",
                maxWidth: "100%",
                maxHeight: isWhiteBg ? "64px" : "68px",
                objectFit: sponsor.fit === "cover" ? "cover" : "contain",
                objectPosition: "center",
                filter: isWhiteBg ? "none" : "drop-shadow(0 2px 8px rgba(0,0,0,0.45))",
                ...(sponsor.fit !== "cover" && sponsor.scale && sponsor.scale !== 1
                  ? { transform: `scale(${sponsor.scale})` }
                  : {}),
              }}
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
  };

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

      {/* Sponsors Content */}
      {sponsorsList.length === 0 ? (
        <div
          className={`reveal-3d-card ${isRevealed ? "is-revealed" : ""}`}
          style={{
            textAlign: "center",
            padding: "48px 24px",
            color: "#94A3B8",
            fontSize: "0.95rem",
          }}
        >
          Werden Sie jetzt Partner der Eintracht Dachau-Karlsfeld und unterstützen Sie unsere Teams!
        </div>
      ) : (
        /* Marquee Container (Laufband) */
        <div
          className={`reveal-3d-card ${isRevealed ? "is-revealed" : ""}`}
          style={{
            overflow: "hidden",
            position: "relative",
            transitionDelay: "0.2s",
            width: "100%",
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
          <div
            className={`sponsor-marquee-track ${isSingleSponsor ? "is-single-runner" : ""} ${isHovered ? "is-paused" : ""}`}
            style={isHovered ? { animationPlayState: "paused" } : undefined}
          >
            {marqueeSponsors.map((sponsor, idx) =>
              renderSponsorCard(sponsor, `${sponsor.id || sponsor.name}-${idx}`)
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
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

        .sponsor-marquee-track:hover,
        .sponsor-marquee-track.is-single-runner:hover,
        .sponsor-marquee-track:has(.sponsor-card:hover),
        .sponsor-marquee-track.is-paused {
          animation-play-state: paused !important;
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
          position: relative;
        }

        .is-static-card {
          min-width: 280px;
          max-width: 360px;
        }

        .sponsor-logo-container.is-cover {
          padding: 0;
          background: rgba(0, 0, 0, 0.2);
        }

        .sponsor-logo-container.is-contain {
          padding: 4px 10px;
        }

        .sponsor-logo-container.is-white-bg {
          background: #FFFFFF !important;
          border-radius: 8px;
          padding: 8px 16px !important;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45), inset 0 0 0 1px rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
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

        .sponsor-logo-container.is-cover .sponsor-logo {
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          max-height: 100% !important;
          object-fit: cover !important;
          border-radius: 4px;
        }

        .sponsor-logo-container.is-contain .sponsor-logo {
          max-width: 100%;
          max-height: 72px;
          object-fit: contain !important;
        }

        .sponsor-logo-container.is-white-bg .sponsor-logo {
          filter: none !important;
          max-height: 64px !important;
          max-width: 100% !important;
          object-fit: contain !important;
        }

        .sponsor-card:hover .sponsor-logo {
          transform: scale(1.05);
        }

        .sponsor-card:hover .sponsor-logo-container.is-cover .sponsor-logo {
          transform: scale(1.04);
        }

        .sponsor-card:hover .sponsor-logo-container.is-white-bg {
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.55), 0 0 16px rgba(255, 255, 255, 0.3);
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

        .single-runner-card {
          animation: singleSponsorMarquee 22s linear infinite;
          will-change: transform;
        }

        .single-runner-card:hover {
          animation-play-state: paused !important;
        }

        .sponsor-marquee-track.is-single-runner {
          animation: none !important;
          width: 100%;
          display: flex;
          justify-content: flex-start;
        }

        @keyframes sponsorMarquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes singleSponsorMarquee {
          0% {
            transform: translateX(100vw);
          }
          100% {
            transform: translateX(calc(-100% - 100px));
          }
        }
      `}</style>
    </section>
  );
}

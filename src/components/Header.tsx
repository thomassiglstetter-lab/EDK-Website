"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Menu,
  X,
  Instagram,
  ChevronDown,
  ChevronRight,
  Users,
  Shield,
  Calendar,
  MapPin,
  Trophy,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface SubLink {
  title: string;
  subtitle?: string;
  href: string;
  badge?: string;
  badgeType?: "crimson" | "azure" | "gold";
  isExternal?: boolean;
}

interface NavCategory {
  name: string;
  items: SubLink[];
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  categories?: NavCategory[];
  bottomAction?: {
    label: string;
    href: string;
  };
}

const navItems: NavItem[] = [
  { id: "start", label: "Start", href: "/#uebersicht" },
  { id: "news", label: "News", href: "/#news" },
  {
    id: "verein",
    label: "Verein",
    href: "/#verein",
    categories: [
      {
        name: "Vereinsleben & Werte",
        items: [
          {
            title: "Werte & Philosophie",
            subtitle: "Gemeinschaft, Respekt & Leistungsbereitschaft",
            href: "/verein#werte",
          },
          {
            title: "Vereinsgeschichte",
            subtitle: "Tradition im Dachauer Land seit 1865",
            href: "/verein#historie",
          },
          {
            title: "Stammvereine",
            subtitle: "TSV Dachau 1865 e.V. & TSV Eintracht Karlsfeld e.V.",
            href: "/verein#stammvereine",
          },
        ],
      },
      {
        name: "Standorte & Infrastruktur",
        items: [
          {
            title: "Hallen & Anfahrtswege",
            subtitle: "5 moderne Hallen mit Hallennummern & Adressen",
            href: "/hallen",
            badge: "5 Hallen",
            badgeType: "azure",
          },
          {
            title: "Vereinsübersicht",
            subtitle: "Die 3 Säulen unseres Handballsports auf einen Blick",
            href: "/#verein",
          },
        ],
      },
    ],
    bottomAction: {
      label: "Ausführliche Vereinsseite öffnen →",
      href: "/verein",
    },
  },
  {
    id: "teams",
    label: "Mannschaften",
    href: "/#teams",
    categories: [
      {
        name: "Herren",
        items: [
          {
            title: "Herren 1",
            subtitle: "Bezirksliga Männer West",
            href: "/teams/herren-1",
            badge: "BL West",
            badgeType: "crimson",
          },
          {
            title: "Herren 2",
            subtitle: "Bezirksklasse Männer",
            href: "/teams/herren-2",
            badge: "BK",
            badgeType: "crimson",
          },
        ],
      },
      {
        name: "Damen",
        items: [
          {
            title: "Damen 1",
            subtitle: "Bezirksoberliga Frauen",
            href: "/teams/damen-1",
            badge: "BOL",
            badgeType: "azure",
          },
          {
            title: "Damen 2",
            subtitle: "Bezirksklasse Frauen West",
            href: "/teams/damen-2",
            badge: "BK West",
            badgeType: "azure",
          },
        ],
      },
      {
        name: "Jugend",
        items: [
          {
            title: "Männliche B-Jugend",
            subtitle: "BL männl. B-Jugend",
            href: "/teams/m-b1",
            badge: "mB",
          },
          {
            title: "Männliche C-Jugend",
            subtitle: "BL männl. C-Jugend",
            href: "/teams/m-c1",
            badge: "mC",
          },
          {
            title: "Weibliche C-Jugend",
            subtitle: "Oberliga weibl. C-Jugend",
            href: "/teams/w-c1",
            badge: "wC",
          },
          {
            title: "Weibliche B-Jugend",
            subtitle: "BL weibl. B-Jugend",
            href: "/teams/w-b1",
            badge: "wB",
          },
        ],
      },
      {
        name: "Kinderhandball",
        items: [
          {
            title: "Minis & Ballschule",
            subtitle: "Spiel & Spaß ab 5 Jahren",
            href: "/teams/minis",
            badge: "Gemischt",
            badgeType: "gold",
          },
        ],
      },
    ],
    bottomAction: {
      label: "Alle 16 Mannschaften & Trainingszeiten ansehen →",
      href: "/#teams",
    },
  },
  {
    id: "spielplan",
    label: "Spielplan",
    href: "/#spielplan",
    categories: [
      {
        name: "Spielbetrieb",
        items: [
          {
            title: "Aktueller Spielplan",
            subtitle: "Nächste Spiele & Heimpieltage aller Teams",
            href: "/#spielplan",
            badge: "nuLiga Live",
            badgeType: "azure",
          },
          {
            title: "nuLiga Verbandsportal",
            subtitle: "Offizielle Tabellen, Bilanzen & Spielberichte",
            href: "https://bhv-handball.liga.nu/cgi-bin/WebObjects/nuLigaHBDE.woa/wa/clubInfoDisplay?club=105665",
            isExternal: true,
          },
        ],
      },
      {
        name: "Spielstätten",
        items: [
          {
            title: "Hallen & Anfahrtswege",
            subtitle: "Wegweiser & Hallennummern für Gastmannschaften & Fans",
            href: "/hallen",
          },
        ],
      },
    ],
    bottomAction: {
      label: "Zum interaktiven Spielplan auf der Startseite →",
      href: "/#spielplan",
    },
  },
  { id: "kontakt", label: "Kontakt", href: "/#kontakt" },
  { id: "partner", label: "Partner & Sponsoren", href: "/#partner" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("/#uebersicht");
  const [activeFlyout, setActiveFlyout] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({
    teams: true,
    verein: false,
    spielplan: false,
  });

  const headerRef = useRef<HTMLElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const hashLinks = navItems.filter((l) => l.href.includes("#"));
      const sections = hashLinks.map((l) => l.href.split("#")[1]);
      let current = sections[0];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 160) {
            current = id;
          }
        }
      }
      setActiveSection(`/#${current}`);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close flyout on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveFlyout(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveFlyout(null);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleMouseEnterNav = (id: string, hasCategories: boolean) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (hasCategories) {
      setActiveFlyout(id);
    } else {
      setActiveFlyout(null);
    }
  };

  const handleMouseLeaveNav = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveFlyout(null);
    }, 180);
  };

  const toggleMobileAccordion = (id: string) => {
    setMobileExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getBadgeStyles = (badgeType?: "crimson" | "azure" | "gold") => {
    if (badgeType === "crimson") {
      return {
        bg: "rgba(244, 63, 94, 0.14)",
        border: "rgba(244, 63, 94, 0.35)",
        text: "var(--color-crimson-bright)",
      };
    }
    if (badgeType === "gold") {
      return {
        bg: "rgba(245, 158, 11, 0.14)",
        border: "rgba(245, 158, 11, 0.35)",
        text: "#FBBF24",
      };
    }
    return {
      bg: "rgba(72, 156, 216, 0.14)",
      border: "rgba(72, 156, 216, 0.35)",
      text: "var(--color-azure-bright)",
    };
  };

  const currentFlyoutItem = navItems.find((item) => item.id === activeFlyout);

  return (
    <header
      ref={headerRef}
      style={{
        position: "fixed",
        top: "max(12px, env(safe-area-inset-top, 12px))",
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 32px)",
        maxWidth: "1280px",
        zIndex: 50,
        transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      onMouseLeave={handleMouseLeaveNav}
    >
      {/* Top Floating Pill Bar */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 20px",
          borderRadius: "var(--radius-full)",
          background: scrolled
            ? "linear-gradient(135deg, rgba(255, 255, 255, 0.16) 0%, rgba(20, 26, 42, 0.48) 45%, rgba(10, 14, 24, 0.62) 100%)"
            : "linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(24, 32, 50, 0.36) 45%, rgba(12, 16, 28, 0.48) 100%)",
          backdropFilter: "blur(48px) saturate(220%) contrast(108%)",
          WebkitBackdropFilter: "blur(48px) saturate(220%) contrast(108%)",
          border: "1px solid rgba(255, 255, 255, 0.26)",
          boxShadow: scrolled
            ? "inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.45), inset 0 -1.5px 2px 0 rgba(0, 0, 0, 0.4), 0 20px 48px rgba(0, 0, 0, 0.65), 0 0 30px rgba(225, 29, 72, 0.18)"
            : "inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.52), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.3), 0 14px 36px rgba(0, 0, 0, 0.45), 0 0 26px rgba(72, 156, 216, 0.16)",
          zIndex: 52,
        }}
      >
        {/* Top Edge Specular Rim Sheen */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "15%",
            right: "15%",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.85) 50%, transparent 100%)",
            pointerEvents: "none",
            borderRadius: "var(--radius-full)",
          }}
        />

        {/* Club Logo & Brand */}
        <Link
          href="/#uebersicht"
          onClick={() => setActiveFlyout(null)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.04) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.22)",
              boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <img
              src="/logo-dark.png"
              alt="Eintracht Dachau-Karlsfeld"
              style={{
                width: "36px",
                height: "auto",
                objectFit: "contain",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }} className="brand-text">
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "1.05rem",
                letterSpacing: "0.04em",
                color: "var(--color-text-main)",
                lineHeight: 1.1,
              }}
            >
              EINTRACHT
            </span>
            <span
              style={{
                fontSize: "0.68rem",
                letterSpacing: "0.12em",
                color: "var(--color-text-dim)",
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              Dachau - Karlsfeld
            </span>
          </div>
        </Link>

        {/* Desktop Navigation with Animated Dropdown Flyouts */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
          className="desktop-nav"
        >
          {navItems.map((item) => {
            const isActive = activeSection === item.href;
            const hasCategories = !!item.categories && item.categories.length > 0;
            const isOpen = activeFlyout === item.id;

            return (
              <div
                key={item.id}
                style={{ position: "relative" }}
                onMouseEnter={() => handleMouseEnterNav(item.id, hasCategories)}
              >
                <Link
                  href={item.href}
                  onClick={(e) => {
                    if (hasCategories) {
                      if (!isOpen) {
                        setActiveFlyout(item.id);
                      }
                    }
                  }}
                  style={{
                    color: isActive || isOpen ? "#FFFFFF" : "#CBD5E1",
                    textDecoration: "none",
                    fontSize: "0.82rem",
                    fontWeight: isActive || isOpen ? 600 : 500,
                    padding: "7px 14px",
                    borderRadius: "var(--radius-full)",
                    background: isOpen
                      ? "linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.08) 100%)"
                      : isActive
                      ? "linear-gradient(135deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.04) 100%)"
                      : "transparent",
                    border: isOpen
                      ? "1px solid rgba(255, 255, 255, 0.32)"
                      : isActive
                      ? "1px solid rgba(255, 255, 255, 0.20)"
                      : "1px solid transparent",
                    boxShadow: isOpen
                      ? "inset 0 1px 1px rgba(255, 255, 255, 0.45), 0 4px 14px rgba(0, 0, 0, 0.25)"
                      : isActive
                      ? "inset 0 1px 1px rgba(255, 255, 255, 0.3)"
                      : "none",
                    backdropFilter: isOpen || isActive ? "blur(16px)" : "none",
                    WebkitBackdropFilter: isOpen || isActive ? "blur(16px)" : "none",
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                    whiteSpace: "nowrap",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive && !isOpen) {
                      e.currentTarget.style.color = "#FFFFFF";
                      e.currentTarget.style.background =
                        "linear-gradient(135deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.04) 100%)";
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.22)";
                      e.currentTarget.style.boxShadow =
                        "inset 0 1px 1px rgba(255, 255, 255, 0.35)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive && !isOpen) {
                      e.currentTarget.style.color = "#CBD5E1";
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.borderColor = "transparent";
                      e.currentTarget.style.boxShadow = "none";
                    }
                  }}
                >
                  <span>{item.label}</span>
                  {hasCategories && (
                    <ChevronDown
                      size={12}
                      style={{
                        transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        opacity: 0.85,
                      }}
                    />
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Right Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Instagram Button */}
          <a
            href="https://www.instagram.com/handballeintracht/"
            target="_blank"
            rel="noopener noreferrer"
            title="Folge uns auf Instagram: @handballeintracht"
            aria-label="Instagram: @handballeintracht"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#CBD5E1",
              textDecoration: "none",
              transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#FFFFFF";
              e.currentTarget.style.background =
                "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)";
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#CBD5E1";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
              e.currentTarget.style.transform = "none";
            }}
          >
            <Instagram size={17} />
          </a>

          <a
            href="/#kontakt"
            onClick={() => setActiveFlyout(null)}
            className="btn-primary header-top-cta"
            style={{
              padding: "9px 20px",
              fontSize: "0.85rem",
              whiteSpace: "nowrap",
            }}
          >
            <span>Mitmachen</span>
            <ArrowUpRight size={15} />
          </a>

          {/* Mobile menu toggle */}
          <button
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              setActiveFlyout(null);
            }}
            style={{
              display: "none",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              color: "var(--color-text-main)",
              cursor: "pointer",
              padding: "0",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
            className="mobile-toggle"
            aria-label="Menü umschalten"
          >
            {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP ANIMATED GLASSMORPHIC FLYOUT PANEL ("REITER")                      */}
      {/* ========================================================================= */}
      {currentFlyoutItem && currentFlyoutItem.categories && (
        <div
          className="desktop-flyout-panel"
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            left: "50%",
            transform: "translateX(-50%)",
            width:
              currentFlyoutItem.id === "teams"
                ? "min(1120px, 94vw)"
                : currentFlyoutItem.id === "verein"
                ? "min(800px, 90vw)"
                : "min(700px, 85vw)",
            background:
              "linear-gradient(145deg, rgba(255, 255, 255, 0.20) 0%, rgba(26, 34, 52, 0.50) 25%, rgba(12, 16, 28, 0.65) 100%)",
            backdropFilter: "blur(54px) saturate(230%) contrast(110%)",
            WebkitBackdropFilter: "blur(54px) saturate(230%) contrast(110%)",
            border: "1px solid rgba(255, 255, 255, 0.28)",
            borderRadius: "28px",
            boxShadow:
              "inset 0 2px 2px 0 rgba(255, 255, 255, 0.52), inset 0 -2px 3px 0 rgba(0, 0, 0, 0.4), 0 35px 85px -10px rgba(0, 0, 0, 0.8), 0 0 45px rgba(72, 156, 216, 0.18), 0 0 55px rgba(244, 63, 94, 0.16)",
            padding: "26px 30px",
            zIndex: 51,
            animation: "flyoutAppear 0.26s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            overflow: "hidden",
          }}
          onMouseEnter={() => {
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current);
              hoverTimeoutRef.current = null;
            }
          }}
          onMouseLeave={handleMouseLeaveNav}
        >
          {/* Top Edge Specular Prism Highlight Sheen */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "10%",
              right: "10%",
              height: "1.5px",
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.9) 50%, transparent 100%)",
              pointerEvents: "none",
            }}
          />

          {/* Header Title inside Flyout */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: "16px",
              marginBottom: "18px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.10)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {currentFlyoutItem.id === "teams" && (
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: "rgba(244, 63, 94, 0.18)",
                    border: "1px solid rgba(244, 63, 94, 0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Users size={16} style={{ color: "var(--color-crimson-bright)" }} />
                </div>
              )}
              {currentFlyoutItem.id === "verein" && (
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: "rgba(72, 156, 216, 0.18)",
                    border: "1px solid rgba(72, 156, 216, 0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Shield size={16} style={{ color: "var(--color-azure-bright)" }} />
                </div>
              )}
              {currentFlyoutItem.id === "spielplan" && (
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: "rgba(72, 156, 216, 0.18)",
                    border: "1px solid rgba(72, 156, 216, 0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Calendar size={16} style={{ color: "var(--color-azure-bright)" }} />
                </div>
              )}
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  letterSpacing: "0.02em",
                }}
              >
                {currentFlyoutItem.label} – Schnellzugriff
              </span>
            </div>

            <button
              onClick={() => setActiveFlyout(null)}
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.16)",
                borderRadius: "var(--radius-full)",
                color: "#E2E8F0",
                cursor: "pointer",
                padding: "5px 12px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "0.78rem",
                fontWeight: 500,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#FFFFFF";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.18)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#E2E8F0";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.16)";
              }}
            >
              <span>Schließen</span>
              <X size={13} />
            </button>
          </div>

          {/* Columns Grid with iOS Glass Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                currentFlyoutItem.id === "teams"
                  ? "repeat(4, 1fr)"
                  : currentFlyoutItem.id === "verein"
                  ? "repeat(2, 1fr)"
                  : "repeat(2, 1fr)",
              gap: "16px",
            }}
          >
            {currentFlyoutItem.categories.map((cat, cIdx) => (
              <div
                key={cIdx}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  background:
                    "linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.14)",
                  borderRadius: "20px",
                  padding: "16px 14px",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  boxShadow:
                    "inset 0 1px 1px 0 rgba(255, 255, 255, 0.22), 0 8px 24px rgba(0, 0, 0, 0.25)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color:
                      cat.name.includes("Herren")
                        ? "var(--color-crimson-bright)"
                        : cat.name.includes("Damen")
                        ? "var(--color-azure-bright)"
                        : cat.name.includes("Kinder")
                        ? "#FBBF24"
                        : "#CBD5E1",
                    paddingBottom: "6px",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  {cat.name}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {cat.items.map((sub, sIdx) => {
                    const badgeStyles = getBadgeStyles(sub.badgeType);
                    return (
                      <Link
                        key={sIdx}
                        href={sub.href}
                        target={sub.isExternal ? "_blank" : undefined}
                        rel={sub.isExternal ? "noopener noreferrer" : undefined}
                        onClick={() => setActiveFlyout(null)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "3px",
                          padding: "10px 12px",
                          borderRadius: "14px",
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.10)",
                          boxShadow: "inset 0 1px 0.5px rgba(255, 255, 255, 0.18)",
                          textDecoration: "none",
                          transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.08) 100%)";
                          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.38)";
                          e.currentTarget.style.boxShadow =
                            "inset 0 1.5px 1.5px rgba(255, 255, 255, 0.52), 0 10px 24px rgba(0, 0, 0, 0.35)";
                          e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.10)";
                          e.currentTarget.style.boxShadow = "inset 0 1px 0.5px rgba(255, 255, 255, 0.18)";
                          e.currentTarget.style.transform = "none";
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{
                              color: "#FFFFFF",
                              fontSize: "0.88rem",
                              fontWeight: 600,
                            }}
                          >
                            {sub.title}
                          </span>
                          {sub.badge && (
                            <span
                              style={{
                                fontSize: "0.64rem",
                                fontWeight: 700,
                                padding: "3px 7px",
                                borderRadius: "6px",
                                background: badgeStyles.bg,
                                border: `1px solid ${badgeStyles.border}`,
                                color: badgeStyles.text,
                                whiteSpace: "nowrap",
                                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
                              }}
                            >
                              {sub.badge}
                            </span>
                          )}
                          {sub.isExternal && (
                            <ExternalLink size={12} style={{ color: "#CBD5E1" }} />
                          )}
                        </div>

                        {sub.subtitle && (
                          <span
                            style={{
                              color: "#94A3B8",
                              fontSize: "0.74rem",
                              lineHeight: 1.3,
                            }}
                          >
                            {sub.subtitle}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Action Bar */}
          {currentFlyoutItem.bottomAction && (
            <div
              style={{
                marginTop: "20px",
                paddingTop: "14px",
                borderTop: "1px solid rgba(255, 255, 255, 0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Link
                href={currentFlyoutItem.bottomAction.href}
                onClick={() => setActiveFlyout(null)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: "var(--radius-full)",
                  background:
                    "linear-gradient(135deg, rgba(72, 156, 216, 0.22) 0%, rgba(72, 156, 216, 0.08) 100%)",
                  border: "1px solid rgba(72, 156, 216, 0.35)",
                  color: "#FFFFFF",
                  fontSize: "0.86rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 4px 14px rgba(0, 0, 0, 0.2)",
                  transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(72, 156, 216, 0.36) 0%, rgba(72, 156, 216, 0.16) 100%)";
                  e.currentTarget.style.borderColor = "rgba(72, 156, 216, 0.6)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "inset 0 1px 1px rgba(255, 255, 255, 0.5), 0 6px 18px rgba(72, 156, 216, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(72, 156, 216, 0.22) 0%, rgba(72, 156, 216, 0.08) 100%)";
                  e.currentTarget.style.borderColor = "rgba(72, 156, 216, 0.35)";
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow =
                    "inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 4px 14px rgba(0, 0, 0, 0.2)";
                }}
              >
                <span>{currentFlyoutItem.bottomAction.label}</span>
              </Link>

              <span style={{ fontSize: "0.74rem", color: "#94A3B8", letterSpacing: "0.04em" }}>
                Eintracht Dachau-Karlsfeld
              </span>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MOBILE FULLSCREEN DRAWER WITH EXPANDABLE ACCORDIONS                       */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div
          style={{
            position: "relative",
            marginTop: "10px",
            padding: "20px 16px",
            borderRadius: "26px",
            background:
              "linear-gradient(165deg, rgba(255, 255, 255, 0.20) 0%, rgba(24, 32, 52, 0.62) 28%, rgba(10, 14, 24, 0.78) 100%)",
            backdropFilter: "blur(54px) saturate(230%) contrast(110%)",
            WebkitBackdropFilter: "blur(54px) saturate(230%) contrast(110%)",
            border: "1px solid rgba(255, 255, 255, 0.26)",
            boxShadow:
              "inset 0 2px 2px rgba(255, 255, 255, 0.48), inset 0 -2px 3px rgba(0, 0, 0, 0.4), 0 32px 75px rgba(0, 0, 0, 0.85), 0 0 35px rgba(225, 29, 72, 0.16)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            maxHeight: "calc(100dvh - 90px)",
            overflowY: "auto",
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* Top Edge Specular Rim Sheen */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "12%",
              right: "12%",
              height: "1.5px",
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.9) 50%, transparent 100%)",
              pointerEvents: "none",
            }}
          />

          {navItems.map((item) => {
            const isActive = activeSection === item.href;
            const hasCategories = !!item.categories && item.categories.length > 0;
            const isExpanded = !!mobileExpanded[item.id];

            return (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "16px",
                  background: isExpanded
                    ? "linear-gradient(180deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.03) 100%)"
                    : "rgba(255, 255, 255, 0.04)",
                  border: isExpanded
                    ? "1px solid rgba(255, 255, 255, 0.18)"
                    : "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: isExpanded
                    ? "inset 0 1px 1px rgba(255, 255, 255, 0.25), 0 4px 16px rgba(0, 0, 0, 0.25)"
                    : "inset 0 1px 0 rgba(255, 255, 255, 0.12)",
                  overflow: "hidden",
                  transition: "all 0.25s ease",
                }}
              >
                {/* Main Link / Accordion Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "11px 14px",
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (!hasCategories) {
                        setMobileMenuOpen(false);
                      }
                    }}
                    style={{
                      color: isActive ? "#FFFFFF" : "#E2E8F0",
                      textDecoration: "none",
                      fontSize: "1rem",
                      fontWeight: isActive ? 600 : 500,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flex: 1,
                    }}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <span
                        style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "50%",
                          background: "var(--color-azure-bright)",
                          boxShadow: "0 0 10px var(--color-azure-bright)",
                        }}
                      />
                    )}
                  </Link>

                  {hasCategories && (
                    <button
                      onClick={() => toggleMobileAccordion(item.id)}
                      style={{
                        background: isExpanded
                          ? "rgba(255, 255, 255, 0.16)"
                          : "rgba(255, 255, 255, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.18)",
                        borderRadius: "8px",
                        padding: "6px 12px",
                        color: "#FFFFFF",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        touchAction: "manipulation",
                        boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.25)",
                      }}
                    >
                      <span>{isExpanded ? "Schließen" : "Unterseiten"}</span>
                      <ChevronDown
                        size={13}
                        style={{
                          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.25s ease",
                        }}
                      />
                    </button>
                  )}
                </div>

                {/* Expanded Accordion Content */}
                {hasCategories && isExpanded && item.categories && (
                  <div
                    style={{
                      padding: "10px 14px 16px 14px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                      background: "rgba(0, 0, 0, 0.15)",
                    }}
                  >
                    {item.categories.map((cat, catIdx) => (
                      <div key={catIdx} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div
                          style={{
                            fontSize: "0.70rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            color:
                              cat.name.includes("Herren")
                                ? "var(--color-crimson-bright)"
                                : cat.name.includes("Damen")
                                ? "var(--color-azure-bright)"
                                : cat.name.includes("Kinder")
                                ? "#FBBF24"
                                : "#CBD5E1",
                          }}
                        >
                          {cat.name}
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                          {cat.items.map((sub, subIdx) => {
                            const badge = getBadgeStyles(sub.badgeType);
                            return (
                              <Link
                                key={subIdx}
                                href={sub.href}
                                target={sub.isExternal ? "_blank" : undefined}
                                rel={sub.isExternal ? "noopener noreferrer" : undefined}
                                onClick={() => setMobileMenuOpen(false)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "9px 12px",
                                  borderRadius: "10px",
                                  background: "rgba(255, 255, 255, 0.05)",
                                  border: "1px solid rgba(255, 255, 255, 0.09)",
                                  boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                                  textDecoration: "none",
                                  color: "#F8FAFC",
                                  fontSize: "0.88rem",
                                  fontWeight: 500,
                                }}
                              >
                                <span>{sub.title}</span>
                                {sub.badge && (
                                  <span
                                    style={{
                                      fontSize: "0.64rem",
                                      fontWeight: 700,
                                      padding: "3px 6px",
                                      borderRadius: "5px",
                                      background: badge.bg,
                                      border: `1px solid ${badge.border}`,
                                      color: badge.text,
                                    }}
                                  >
                                    {sub.badge}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {item.bottomAction && (
                      <Link
                        href={item.bottomAction.href}
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          fontSize: "0.82rem",
                          color: "var(--color-azure-bright)",
                          fontWeight: 600,
                          textDecoration: "none",
                          paddingTop: "6px",
                        }}
                      >
                        {item.bottomAction.label}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Social & Probetraining CTA inside mobile drawer */}
          <div
            style={{
              marginTop: "8px",
              paddingTop: "14px",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <a
              href="https://www.instagram.com/handballeintracht/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px 16px",
                borderRadius: "var(--radius-sm)",
                background: "rgba(225, 48, 108, 0.15)",
                border: "1px solid rgba(225, 48, 108, 0.35)",
                color: "#FFFFFF",
                fontSize: "0.9rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <Instagram size={17} />
              <span>@handballeintracht auf Instagram</span>
              <ArrowUpRight size={14} />
            </a>

            <a
              href="/#kontakt"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "14px 20px",
                fontSize: "0.95rem",
              }}
            >
              <span>Mitmachen & Probetraining</span>
              <ArrowUpRight size={15} />
            </a>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes flyoutAppear {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(-8px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }

        @media (max-width: 1040px) {
          .desktop-nav {
            display: none !important;
          }
          .desktop-flyout-panel {
            display: none !important;
          }
          .mobile-toggle {
            display: flex !important;
          }
        }
        @media (max-width: 560px) {
          .header-top-cta {
            display: none !important;
          }
        }
        @media (max-width: 360px) {
          .brand-text span:last-child {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}

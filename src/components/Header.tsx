"use client";

import React, { useState, useEffect } from "react";
import { ArrowUpRight, Menu, X, Instagram } from "lucide-react";

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: "Start", href: "/#uebersicht" },
  { label: "News", href: "/#news" },
  { label: "Verein", href: "/#verein" },
  { label: "Mannschaften", href: "/#teams" },
  { label: "Spielplan", href: "/#spielplan" },
  { label: "Kontakt", href: "/#kontakt" },
  { label: "Partner & Sponsoren", href: "/#partner" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("/#uebersicht");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const hashLinks = navLinks.filter((l) => l.href.includes("#"));
      const sections = hashLinks.map((l) => l.href.split("#")[1]);
      let current = sections[0];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150) {
            current = id;
          }
        }
      }
      setActiveSection(`/#${current}`);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      style={{
        position: "fixed",
        top: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 32px)",
        maxWidth: "1280px",
        zIndex: 50,
        transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 20px",
          borderRadius: "var(--radius-full)",
          background: scrolled
            ? "rgba(10, 14, 20, 0.88)"
            : "rgba(13, 17, 24, 0.7)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: scrolled
            ? "0 16px 36px rgba(0, 0, 0, 0.6)"
            : "0 8px 24px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Club Logo & Brand */}
        <a
          href="#"
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
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
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
        </a>

        {/* Desktop Navigation */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => {
            const isActive = activeSection === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                style={{
                  color: isActive ? "#FFFFFF" : "#94A3B8",
                  textDecoration: "none",
                  fontSize: "0.82rem",
                  fontWeight: isActive ? 600 : 500,
                  padding: "6px 12px",
                  borderRadius: "var(--radius-full)",
                  background: isActive
                    ? "rgba(255, 255, 255, 0.08)"
                    : "transparent",
                  transition:
                    "color 0.2s ease, background 0.2s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "#FFFFFF";
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.04)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "#94A3B8";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Action Button & Social */}
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
              e.currentTarget.style.background = "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)";
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

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            marginTop: "8px",
            padding: "20px",
            borderRadius: "var(--radius-lg)",
            background: "rgba(10, 14, 20, 0.96)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "0 20px 48px rgba(0, 0, 0, 0.8)",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            maxHeight: "calc(100vh - 100px)",
            overflowY: "auto",
          }}
        >
          {navLinks.map((link) => {
            const isActive = activeSection === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: isActive ? "#FFFFFF" : "#CBD5E1",
                  textDecoration: "none",
                  fontSize: "1rem",
                  fontWeight: isActive ? 600 : 400,
                  padding: "12px 16px",
                  borderRadius: "var(--radius-sm)",
                  background: isActive
                    ? "rgba(255, 255, 255, 0.08)"
                    : "transparent",
                  transition: "background 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{link.label}</span>
                {isActive && (
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "var(--color-azure-bright)",
                      boxShadow: "0 0 8px var(--color-azure-bright)",
                    }}
                  />
                )}
              </a>
            );
          })}

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
        @media (max-width: 1040px) {
          .desktop-nav {
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

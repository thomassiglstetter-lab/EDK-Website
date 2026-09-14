"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Newspaper,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  Search,
  Tag,
  X,
  Share2,
  Check,
  Filter,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Article {
  id: string;
  category: "Spielbetrieb" | "Jugend" | "Verein";
  categoryColor: "azure" | "crimson";
  date: string;
  readTime: string;
  title: string;
  excerpt: string;
  content?: string;
  image?: string;
}

export default function NewsArchivePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Alle");
  const [readingArticle, setReadingArticle] = useState<Article | null>(null);

  useEffect(() => {
    fetch("/api/news", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Fehler beim Laden");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setArticles(data);
        }
      })
      .catch((err) => {
        console.error("News fetch error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Filter articles
  const filteredArticles = articles.filter((article) => {
    const matchesCategory =
      activeCategory === "Alle" || article.category === activeCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      article.title.toLowerCase().includes(query) ||
      article.excerpt.toLowerCase().includes(query) ||
      (article.content && article.content.toLowerCase().includes(query));
    return matchesCategory && matchesQuery;
  });

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#080B10" }}>
      <Header />

      <main style={{ flex: 1, position: "relative", zIndex: 10, padding: "120px 24px 100px 24px", maxWidth: "1280px", margin: "0 auto", width: "100%" }}>
        {/* Breadcrumb & Navigation */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
          <Link
            href="/#news"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "#94A3B8",
              textDecoration: "none",
              fontSize: "0.88rem",
              fontWeight: 600,
              padding: "8px 14px",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              transition: "all 0.2s ease",
            }}
          >
            <ArrowLeft size={16} />
            <span>Zurück zur Startseite</span>
          </Link>

          <div style={{ fontSize: "0.82rem", color: "#64748B" }}>
            Gesamt: <strong style={{ color: "#38BDF8" }}>{articles.length}</strong> Berichte im Archiv
          </div>
        </div>

        {/* Hero Header */}
        <div
          style={{
            position: "relative",
            padding: "44px 36px",
            borderRadius: "24px",
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 14, 22, 0.9) 100%)",
            border: "1px solid rgba(14, 165, 233, 0.25)",
            borderTop: "4px solid var(--color-azure)",
            boxShadow: "0 20px 48px rgba(0, 0, 0, 0.65)",
            marginBottom: "36px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "5px 12px",
              borderRadius: "9999px",
              background: "rgba(14, 165, 233, 0.12)",
              border: "1px solid rgba(14, 165, 233, 0.3)",
              color: "var(--color-azure-bright)",
              fontSize: "0.8rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "16px",
            }}
          >
            <Newspaper size={14} />
            <span>Eintracht Dachau-Karlsfeld • News-Archiv</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(2.4rem, 4.2vw, 3.4rem)",
              fontWeight: 800,
              color: "#FFFFFF",
              lineHeight: 1.1,
              margin: "0 0 14px 0",
              letterSpacing: "-0.02em",
            }}
          >
            Alle Neuigkeiten &amp; Berichte
          </h1>

          <p
            style={{
              fontSize: "1.05rem",
              lineHeight: 1.6,
              color: "#CBD5E1",
              maxWidth: "760px",
              margin: 0,
            }}
          >
            Durchstöbern Sie alle Mitteilungen, Saisonberichte, Jugendnews und Vereinsaktivitäten unseres Vereinsarchivs.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "32px",
            background: "rgba(13, 17, 26, 0.8)",
            padding: "16px 20px",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          {/* Search Box */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "10px",
              padding: "10px 16px",
              flex: 1,
              minWidth: "260px",
              maxWidth: "440px",
            }}
          >
            <Search size={18} color="#94A3B8" />
            <input
              type="text"
              placeholder="Berichte nach Stichwort durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                color: "#FFFFFF",
                fontSize: "0.9rem",
                outline: "none",
                width: "100%",
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94A3B8",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {["Alle", "Spielbetrieb", "Jugend", "Verein"].map((cat) => {
              const isSelected = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "9999px",
                    border: "1px solid",
                    borderColor: isSelected ? "var(--color-azure)" : "rgba(255, 255, 255, 0.1)",
                    background: isSelected ? "var(--color-azure)" : "rgba(255, 255, 255, 0.03)",
                    color: isSelected ? "#07090D" : "#CBD5E1",
                    fontSize: "0.82rem",
                    fontWeight: isSelected ? 700 : 500,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading Skeleton / Empty State / Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "#94A3B8" }}>
            <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>Berichte werden geladen...</div>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div
            style={{
              padding: "60px 24px",
              textAlign: "center",
              background: "rgba(255, 255, 255, 0.02)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              color: "#94A3B8",
            }}
          >
            <Filter size={36} color="#64748B" style={{ margin: "0 auto 14px auto" }} />
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "8px" }}>
              Keine Berichte gefunden
            </h3>
            <p style={{ margin: "0 0 16px 0", fontSize: "0.92rem" }}>
              Zu Ihren Filter- oder Suchkriterien wurden leider keine passenden Artikel im Archiv gefunden.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("Alle");
              }}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                background: "rgba(14, 165, 233, 0.15)",
                border: "1px solid rgba(14, 165, 233, 0.3)",
                color: "#38BDF8",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Filter zurücksetzen
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "24px",
            }}
          >
            {filteredArticles.map((article) => {
              const isCrimson = article.categoryColor === "crimson" || article.category === "Jugend";
              const badgeBg = isCrimson ? "rgba(230, 57, 70, 0.12)" : "rgba(14, 165, 233, 0.12)";
              const badgeBorder = isCrimson ? "rgba(230, 57, 70, 0.3)" : "rgba(14, 165, 233, 0.3)";
              const badgeColor = isCrimson ? "var(--color-crimson-bright)" : "var(--color-azure-bright)";

              return (
                <article
                  key={article.id}
                  onClick={() => setReadingArticle(article)}
                  style={{
                    borderRadius: "18px",
                    background: "rgba(13, 17, 26, 0.85)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    cursor: "pointer",
                    transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease, box-shadow 0.25s ease",
                  }}
                  className="archive-card"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.borderColor = isCrimson ? "rgba(230, 57, 70, 0.4)" : "rgba(14, 165, 233, 0.4)";
                    e.currentTarget.style.boxShadow = "0 14px 34px rgba(0, 0, 0, 0.6)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Article Thumbnail */}
                  <div
                    style={{
                      height: "190px",
                      position: "relative",
                      background: "rgba(10, 14, 20, 0.9)",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={article.image || "/news-match.jpg"}
                      alt={article.title}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/news-match.jpg";
                      }}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(to top, rgba(13, 17, 26, 0.9) 0%, transparent 50%)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "14px",
                        left: "14px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "4px 10px",
                        borderRadius: "9999px",
                        background: badgeBg,
                        border: `1px solid ${badgeBorder}`,
                        color: badgeColor,
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        backdropFilter: "blur(6px)",
                      }}
                    >
                      <Tag size={11} />
                      <span>{article.category}</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div
                    style={{
                      padding: "20px 22px",
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      {/* Meta Date & Read Time */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          fontSize: "0.76rem",
                          color: "#94A3B8",
                          marginBottom: "10px",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <Calendar size={13} />
                          {article.date}
                        </span>
                        <span>•</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <Clock size={13} />
                          {article.readTime}
                        </span>
                      </div>

                      {/* Title */}
                      <h2
                        style={{
                          fontSize: "1.18rem",
                          fontWeight: 700,
                          lineHeight: 1.35,
                          color: "#FFFFFF",
                          margin: "0 0 10px 0",
                        }}
                      >
                        {article.title}
                      </h2>

                      {/* Excerpt */}
                      <p
                        style={{
                          fontSize: "0.88rem",
                          lineHeight: 1.6,
                          color: "#CBD5E1",
                          margin: "0 0 16px 0",
                        }}
                      >
                        {article.excerpt}
                      </p>
                    </div>

                    {/* Bottom Link */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: badgeColor,
                        fontSize: "0.84rem",
                        fontWeight: 600,
                        paddingTop: "12px",
                        borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                      }}
                    >
                      <span>Vollständigen Bericht lesen</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* In-Page Reader Modal */}
        {readingArticle && (
          <ArchiveReaderModal
            article={readingArticle}
            onClose={() => setReadingArticle(null)}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

function ArchiveReaderModal({
  article,
  onClose,
}: {
  article: Article;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin + `/news/${article.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isCrimson = article.categoryColor === "crimson" || article.category === "Jugend";
  const badgeBg = isCrimson ? "rgba(230, 57, 70, 0.12)" : "rgba(14, 165, 233, 0.12)";
  const badgeBorder = isCrimson ? "rgba(230, 57, 70, 0.3)" : "rgba(14, 165, 233, 0.3)";
  const badgeColor = isCrimson ? "var(--color-crimson-bright)" : "var(--color-azure-bright)";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(4, 7, 12, 0.88)",
        backdropFilter: "blur(12px)",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "760px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "24px",
          background: "#0C111A",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.85)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            background: "rgba(16, 22, 34, 0.8)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                padding: "3px 10px",
                borderRadius: "9999px",
                background: badgeBg,
                border: `1px solid ${badgeBorder}`,
                color: badgeColor,
                fontSize: "0.74rem",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              {article.category}
            </span>
            <span style={{ fontSize: "0.8rem", color: "#94A3B8" }}>{article.date}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              onClick={handleShare}
              title="Link zum Artikel kopieren"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 12px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#CBD5E1",
                fontSize: "0.78rem",
                cursor: "pointer",
              }}
            >
              {copied ? <Check size={14} color="#34D399" /> : <Share2 size={14} />}
              <span>{copied ? "Kopiert!" : "Teilen"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#94A3B8",
                cursor: "pointer",
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body (Scrollable) */}
        <div
          style={{
            padding: "28px 32px 40px 32px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {article.image && (
            <div
              style={{
                borderRadius: "14px",
                overflow: "hidden",
                maxHeight: "320px",
                width: "100%",
                background: "rgba(0, 0, 0, 0.5)",
              }}
            >
              <img
                src={article.image}
                alt={article.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
          )}

          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#FFFFFF", lineHeight: 1.25, margin: 0 }}>
            {article.title}
          </h2>

          <div
            style={{
              padding: "16px 20px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.03)",
              borderLeft: `4px solid ${badgeColor}`,
              color: "#E2E8F0",
              fontSize: "0.98rem",
              lineHeight: 1.6,
              fontWeight: 500,
            }}
          >
            {article.excerpt}
          </div>

          <div
            style={{
              color: "#CBD5E1",
              fontSize: "0.95rem",
              lineHeight: 1.75,
              whiteSpace: "pre-line",
            }}
          >
            {article.content || article.excerpt}
          </div>
        </div>
      </div>
    </div>
  );
}

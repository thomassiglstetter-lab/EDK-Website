"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Newspaper,
  Calendar,
  Clock,
  ArrowRight,
  Tag,
  X,
  ExternalLink,
  ChevronLeft,
  Share2,
  Check
} from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

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

const initialArticles: Article[] = [
  {
    id: "1",
    category: "Spielbetrieb",
    categoryColor: "azure",
    date: "06. September 2026",
    readTime: "3 Min. Lesezeit",
    title: "Auftaktsieg der Herren 1: Nervenstark im Derby-Krimi gegen Allach",
    excerpt:
      "Mit einer geschlossenen Mannschaftsleistung und einem überragenden Rückraum sichern sich die Eintracht-Männer die ersten zwei Punkte in heimischer Halle.",
    content:
      "Die Herren 1 der Eintracht Dachau-Karlsfeld sind mit einem hart erkämpften 28:26-Heimsieg gegen den TSV Allach in die neue Handballsaison gestartet. Vor über 350 Zuschauern in der Sporthalle Mittelschule Karlsfeld entwickelte sich von Beginn an ein hochintensiver Schlagabtausch.\n\nBesonders in der entscheidenden Schlussphase behielt die Mannschaft kühlen Kopf. Torhüter Felix B. parierte in den letzten drei Minuten zwei freie Würfe, während Spielmacher Jonas K. mit seinem siebten Treffer 30 Sekunden vor Schluss den Deckel draufmachte.\n\nTrainer Markus V. zeigte sich nach dem Schlusspfiff hochzufrieden: 'Die Einstellung und der Kampfgeist jedes Einzelnen waren heute ausschlaggebend. Wir wissen aber auch, woran wir in den kommenden Wochen noch feilen müssen.'",
    image: "/news-match.jpg",
  },
  {
    id: "2",
    category: "Jugend",
    categoryColor: "crimson",
    date: "03. September 2026",
    readTime: "4 Min. Lesezeit",
    title: "Männliche B-Jugend qualifiziert sich für die Bayernliga-Endrunde",
    excerpt:
      "Das Trainerteam blickt stolz auf das Qualifikationsturnier: Mit schnellem Umschaltspiel und starker Abwehr setzt sich der Nachwuchs souverän durch.",
    content:
      "Großer Erfolg für die Jugendarbeit der Eintracht: Die männliche B1-Jugend hat beim Qualifikationsturnier in Karlsfeld den Sprung in die höchste bayerische Spielklasse geschafft.\n\nMit drei Siegen aus drei Spielen ließ das Team um Kapitän Leo S. keinen Zweifel an den Ambitionen. Das konsequente Tempospiel und eine disziplinierte 6:0-Abwehr stellten die gegnerischen Angriffsreihen immer wieder vor unlösbare Aufgaben.\n\n'Die Jungs haben in den Sommermonaten enorm hart gearbeitet. Diese Qualifikation ist der verdiente Lohn für den gesamten Jahrgang', so Jugendkoordinator Thomas W.",
    image: "/news-youth.jpg",
  },
  {
    id: "3",
    category: "Verein",
    categoryColor: "azure",
    date: "01. September 2026",
    readTime: "2 Min. Lesezeit",
    title: "Ausbau des Trainer- & Betreuerteams zur neuen Handballsaison 2026/27",
    excerpt:
      "Wir begrüßen drei neue B-Lizenz-Inhaber im Nachwuchsbereich und erweitern unser Athletik-Förderprogramm in Zusammenarbeit mit den Dachauer Sportzentren.",
    content:
      "Die Eintracht Dachau-Karlsfeld stellt die Weichen für eine nachhaltige sportliche Zukunft. Zur Saison 2026/27 verstärken drei erfahrene Übungsleiter mit DOSB-B-Lizenz das Nachwuchstrainerteam.\n\nZudem startet ein neues modulares Athletikkonzept für alle Altersklassen ab der C-Jugend. Dadurch sollen Kraft, Beweglichkeit und Verletzungsprävention gezielt geschult werden.",
    image: "/news-coaches.jpg",
  },
  {
    id: "4",
    category: "Spielbetrieb",
    categoryColor: "azure",
    date: "28. August 2026",
    readTime: "3 Min. Lesezeit",
    title: "Damen 1 starten mit klarem 31:22 Sieg in die neue Saison",
    excerpt:
      "Die Damenmannschaft zeigt von Beginn an eine überzeugende Leistung und dominiert das Auftaktspiel. Rückraumspielerin Lena M. erzielt 9 Treffer.",
    content:
      "Ein Auftakt nach Maß für die Damen 1: Gegen die Gäste aus dem Umland dominierte das Eintracht-Team von der ersten Minute an und feierte einen ungefährdeten 31:22-Erfolg.\n\nMit einer schnellen 6:1-Führung zu Beginn zwang die Eintracht den gegnerischen Trainer früh zur ersten Auszeit. Überragende Akteurin war Rückraumspielerin Lena M., die mit 9 Treffern glänzte.",
  },
  {
    id: "5",
    category: "Jugend",
    categoryColor: "crimson",
    date: "25. August 2026",
    readTime: "2 Min. Lesezeit",
    title: "Mini-Handball-Tag: Über 60 Kinder beim Schnuppertraining",
    excerpt:
      "Ein voller Erfolg! Beim diesjährigen Mini-Handball-Tag konnten wir zahlreiche neue Talente für den Handballsport begeistern.",
    content:
      "Bunte Bälle, strahlende Kinderaugen und jede Menge Bewegung: Der Mini-Handball-Tag in Karlsfeld lockte über 60 Mädchen und Jungen in die Halle.\n\nAn verschiedenen Koordinations- und Wurfstationen konnten die Nachwuchstalente erste Erfahrungen mit dem Handball sammeln. Viele Teilnehmer haben sich direkt für das regelmäßige Schnuppertraining angemeldet.",
  },
];

export default function NewsSection() {
  const [articlesList, setArticlesList] = useState<Article[]>(initialArticles);
  const [activeFilter, setActiveFilter] = useState<string>("Alle");
  const [readingArticle, setReadingArticle] = useState<Article | null>(null);
  const { ref: sectionRef, isRevealed } = useScrollReveal({ threshold: 0.08 });

  useEffect(() => {
    fetch("/api/news")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch");
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setArticlesList(data);
        }
      })
      .catch((err) => console.log("Using initial articles fallback:", err));
  }, []);

  const filteredArticles =
    activeFilter === "Alle"
      ? articlesList
      : articlesList.filter((a) => a.category === activeFilter);

  // Exactly max 5 news articles displayed on homepage
  const displayArticles = filteredArticles.slice(0, 5);
  const featuredArticle = displayArticles[0];
  const remainingArticles = displayArticles.slice(1);

  return (
    <section
      ref={sectionRef}
      id="news"
      className="reveal-container"
      style={{
        position: "relative",
        zIndex: 10,
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "80px 24px 100px 24px",
      }}
    >
      {/* Section Header with Filters (Fly-in) */}
      <div
        className={`reveal-3d-header ${isRevealed ? "is-revealed" : ""}`}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "24px",
          marginBottom: "48px",
        }}
      >
        <div style={{ maxWidth: "600px" }}>
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
            <Newspaper size={15} />
            <span>Aktuelles &amp; Berichte</span>
          </div>

          <h2
            style={{
              fontSize: "clamp(2.2rem, 3.8vw, 3rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              color: "#FFFFFF",
              letterSpacing: "-0.03em",
            }}
          >
            Neuigkeiten aus der Eintracht.
          </h2>
        </div>

        {/* Filter Pills */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(13, 17, 26, 0.8)",
            padding: "4px",
            borderRadius: "var(--radius-full)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          {["Alle", "Spielbetrieb", "Jugend", "Verein"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              style={{
                padding: "8px 18px",
                borderRadius: "var(--radius-full)",
                border: "none",
                background:
                  activeFilter === cat
                    ? "var(--color-azure)"
                    : "transparent",
                color: activeFilter === cat ? "#07090D" : "#CBD5E1",
                fontFamily: "var(--font-display)",
                fontSize: "0.82rem",
                fontWeight: activeFilter === cat ? 600 : 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Magazine-Style Layout: Featured + Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "28px",
        }}
        className="news-magazine-grid"
      >
        {/* Featured Article (Large) */}
        {featuredArticle && (
          <FeaturedCard
            article={featuredArticle}
            isRevealed={isRevealed}
            onOpenArticle={(a) => setReadingArticle(a)}
          />
        )}

        {/* Remaining Articles (Stacked) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {remainingArticles.map((article, idx) => (
            <CompactCard
              key={article.id}
              article={article}
              isRevealed={isRevealed}
              delay={idx * 0.12}
              onOpenArticle={(a) => setReadingArticle(a)}
            />
          ))}
        </div>
      </div>

      {/* Link to full News Archive */}
      <div
        style={{
          marginTop: "48px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Link
          href="/news"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px 28px",
            borderRadius: "var(--radius-full)",
            background: "rgba(13, 17, 26, 0.9)",
            border: "1px solid rgba(72, 156, 216, 0.35)",
            color: "#FFFFFF",
            fontFamily: "var(--font-display)",
            fontSize: "0.92rem",
            fontWeight: 600,
            textDecoration: "none",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
            transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--color-azure)";
            e.currentTarget.style.background = "rgba(72, 156, 216, 0.15)";
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "0 14px 32px rgba(72, 156, 216, 0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(72, 156, 216, 0.35)";
            e.currentTarget.style.background = "rgba(13, 17, 26, 0.9)";
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.4)";
          }}
        >
          <Newspaper size={18} style={{ color: "var(--color-azure-bright)" }} />
          <span>Zum News-Archiv (alle {articlesList.length} Berichte)</span>
          <ArrowRight size={16} style={{ color: "var(--color-azure-bright)" }} />
        </Link>
      </div>

      {/* Beautifully Framed Article Reader Modal (Portaled above navbar & everything) */}
      {readingArticle && (
        <ArticleReaderPortal
          article={readingArticle}
          onClose={() => setReadingArticle(null)}
        />
      )}

      <style jsx>{`
        @media (max-width: 900px) {
          .news-magazine-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

/* Featured (Large) News Card */
function FeaturedCard({
  article,
  isRevealed,
  onOpenArticle,
}: {
  article: Article;
  isRevealed: boolean;
  onOpenArticle: (article: Article) => void;
}) {
  const isCrimson = article.categoryColor === "crimson";
  const accentColor = isCrimson ? "var(--color-crimson)" : "var(--color-azure)";
  const accentColorBright = isCrimson
    ? "var(--color-crimson-bright)"
    : "var(--color-azure-bright)";
  const badgeBg = isCrimson
    ? "rgba(143, 24, 56, 0.18)"
    : "rgba(72, 156, 216, 0.18)";
  const badgeBorder = isCrimson
    ? "rgba(143, 24, 56, 0.45)"
    : "rgba(72, 156, 216, 0.45)";

  return (
    <article
      onClick={() => onOpenArticle(article)}
      className={`glass-panel reveal-3d-card compact-news-card ${isRevealed ? "is-revealed" : ""}`}
      style={{
        background: "rgba(12, 16, 24, 0.85)",
        borderTop: `3px solid ${accentColor}`,
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.5)",
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.65), 0 0 20px rgba(72, 156, 216, 0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(0, 0, 0, 0.5)";
      }}
    >
      {/* Hero Image */}
      {article.image && (
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "260px",
            overflow: "hidden",
          }}
        >
          <img
            src={article.image}
            alt={article.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/news-match.jpg";
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "80px",
              background:
                "linear-gradient(transparent, rgba(12, 16, 24, 0.95))",
            }}
          />
        </div>
      )}

      <div
        style={{
          padding: "28px 32px 32px 32px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          {/* Meta Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "18px",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "var(--radius-full)",
                background: badgeBg,
                border: `1px solid ${badgeBorder}`,
                color: accentColorBright,
                fontSize: "0.74rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              <Tag size={11} />
              <span>{article.category}</span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.78rem",
                color: "#94A3B8",
              }}
            >
              <Calendar size={13} />
              <span>{article.date}</span>
            </div>
          </div>

          {/* Article Title */}
          <h3
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              lineHeight: 1.25,
              color: "#FFFFFF",
              marginBottom: "14px",
              transition: "color 0.2s ease",
            }}
          >
            {article.title}
          </h3>

          {/* Excerpt */}
          <p
            style={{
              fontSize: "0.98rem",
              lineHeight: 1.65,
              color: "#CBD5E1",
              marginBottom: "24px",
            }}
          >
            {article.excerpt}
          </p>
        </div>

        {/* Card Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "16px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.78rem",
              color: "#94A3B8",
            }}
          >
            <Clock size={13} />
            <span>{article.readTime}</span>
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: accentColorBright,
              fontSize: "0.85rem",
              fontWeight: 600,
              transition: "gap 0.2s ease",
            }}
          >
            <span>Bericht lesen</span>
            <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </article>
  );
}

/* Compact News Card (for the right stack) */
function CompactCard({
  article,
  isRevealed,
  delay,
  onOpenArticle,
}: {
  article: Article;
  isRevealed: boolean;
  delay: number;
  onOpenArticle: (article: Article) => void;
}) {
  const isCrimson = article.categoryColor === "crimson";
  const accentColor = isCrimson ? "var(--color-crimson)" : "var(--color-azure)";
  const accentColorBright = isCrimson
    ? "var(--color-crimson-bright)"
    : "var(--color-azure-bright)";
  const badgeBg = isCrimson
    ? "rgba(143, 24, 56, 0.18)"
    : "rgba(72, 156, 216, 0.18)";
  const badgeBorder = isCrimson
    ? "rgba(143, 24, 56, 0.45)"
    : "rgba(72, 156, 216, 0.45)";

  return (
    <article
      onClick={() => onOpenArticle(article)}
      className={`glass-panel reveal-3d-card ${isRevealed ? "is-revealed" : ""}`}
      style={{
        background: "rgba(12, 16, 24, 0.85)",
        borderLeft: `3px solid ${accentColor}`,
        display: "flex",
        flexDirection: "row",
        gap: "0",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.45)",
        overflow: "hidden",
        transitionDelay: `${delay}s`,
        cursor: "pointer",
        transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateX(4px)";
        e.currentTarget.style.boxShadow = "0 12px 30px rgba(0, 0, 0, 0.6)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.45)";
      }}
    >
      {/* Thumbnail */}
      {article.image && (
        <div
          style={{
            width: "150px",
            position: "relative",
            background: "rgba(10, 14, 20, 0.8)",
            minHeight: "100%",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          <img
            src={article.image}
            alt={article.title}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/news-match.jpg";
            }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      )}

      <div
        style={{
          padding: "20px 24px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "3px 8px",
                borderRadius: "var(--radius-full)",
                background: badgeBg,
                border: `1px solid ${badgeBorder}`,
                color: accentColorBright,
                fontSize: "0.68rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              <Tag size={9} />
              <span>{article.category}</span>
            </div>
            <span style={{ fontSize: "0.72rem", color: "#64748B" }}>
              {article.date}
            </span>
          </div>

          <h3
            style={{
              fontSize: "1.05rem",
              fontWeight: 700,
              lineHeight: 1.3,
              color: "#FFFFFF",
              marginBottom: "8px",
            }}
          >
            {article.title}
          </h3>

          <p
            style={{
              fontSize: "0.85rem",
              lineHeight: 1.55,
              color: "#94A3B8",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {article.excerpt}
          </p>
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            color: accentColorBright,
            fontSize: "0.8rem",
            fontWeight: 600,
            marginTop: "12px",
          }}
        >
          <span>Lesen</span>
          <ArrowRight size={13} />
        </div>
      </div>
    </article>
  );
}

/* 
 * ArticleReaderPortal:
 * Renders via React Portal directly into document.body.
 * This guarantees it is completely ABOVE the fixed header navigation bar (z-index 10000 > 50),
 * perfectly framed, responsive, and seamless within the site design.
 */
function ArticleReaderPortal({
  article,
  onClose,
}: {
  article: Article;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    // Save previous overflow and lock body scrolling
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  const isCrimson = article.categoryColor === "crimson";
  const accentColor = isCrimson ? "var(--color-crimson)" : "var(--color-azure)";
  const accentColorBright = isCrimson
    ? "var(--color-crimson-bright)"
    : "var(--color-azure-bright)";
  const badgeBg = isCrimson
    ? "rgba(143, 24, 56, 0.25)"
    : "rgba(72, 156, 216, 0.25)";
  const badgeBorder = isCrimson
    ? "rgba(143, 24, 56, 0.6)"
    : "rgba(72, 156, 216, 0.6)";

  const contentParagraphs = (article.content || article.excerpt)
    .split("\n\n")
    .filter((p) => p.trim().length > 0);

  const handleShare = () => {
    const url = `${window.location.origin}/news/${article.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="framed-article-title"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000, // Explicitly higher than the fixed Header navbar (zIndex 50) and top brand strip (zIndex 100)
        background: "rgba(4, 7, 12, 0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(16px, 3vh, 36px) 16px",
        overflowY: "auto",
        animation: "modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      }}
    >
      {/* Elegantly Framed Article Dialog Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "840px",
          maxHeight: "min(90vh, 920px)",
          display: "flex",
          flexDirection: "column",
          background: "rgba(11, 15, 23, 0.98)",
          borderRadius: "22px",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow:
            "0 32px 80px -10px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.06), 0 0 40px rgba(72, 156, 216, 0.08)",
          overflow: "hidden",
          animation: "modalCardIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
      >
        {/* Top Dual Brand Stripe (Eintracht Crimson & Azure) */}
        <div
          style={{
            height: "4px",
            width: "100%",
            display: "flex",
            flexShrink: 0,
          }}
        >
          <div style={{ flex: 1, background: "var(--color-crimson)" }} />
          <div style={{ width: "2px", background: "#FFFFFF" }} />
          <div style={{ flex: 1, background: "var(--color-azure)" }} />
        </div>

        {/* Framing Control Bar (Pinned at top of card, never obscured) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            background: "rgba(13, 18, 28, 0.95)",
            backdropFilter: "blur(16px)",
            flexShrink: 0,
            gap: "12px",
          }}
        >
          {/* Left: Brand + Category */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 12px",
                borderRadius: "var(--radius-full)",
                background: badgeBg,
                border: `1px solid ${badgeBorder}`,
                color: accentColorBright,
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              <Tag size={11} />
              <span>{article.category}</span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.78rem",
                color: "#94A3B8",
              }}
            >
              <Calendar size={13} />
              <span>{article.date}</span>
            </div>

            <span style={{ color: "rgba(255, 255, 255, 0.2)" }}>•</span>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "0.78rem",
                color: "#94A3B8",
              }}
            >
              <Clock size={13} />
              <span>{article.readTime}</span>
            </div>
          </div>

          {/* Right: Actions & Close */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* Share link */}
            <button
              onClick={handleShare}
              title="Link kopieren"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 12px",
                borderRadius: "8px",
                background: copied
                  ? "rgba(16, 185, 129, 0.2)"
                  : "rgba(255, 255, 255, 0.05)",
                border: `1px solid ${
                  copied ? "rgba(16, 185, 129, 0.4)" : "rgba(255, 255, 255, 0.1)"
                }`,
                color: copied ? "#34D399" : "#CBD5E1",
                fontSize: "0.78rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {copied ? <Check size={13} /> : <Share2 size={13} />}
              <span>{copied ? "Kopiert!" : "Teilen"}</span>
            </button>

            {/* In New Tab link */}
            <a
              href={`/news/${article.id}`}
              target="_blank"
              rel="noopener noreferrer"
              title="In separatem Tab / Fenster öffnen"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 12px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#CBD5E1",
                fontSize: "0.78rem",
                fontWeight: 500,
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.color = "#FFFFFF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.color = "#CBD5E1";
              }}
            >
              <span>Vollbild</span>
              <ExternalLink size={13} />
            </a>

            {/* ESC Badge */}
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 600,
                color: "#64748B",
                background: "rgba(255, 255, 255, 0.05)",
                padding: "3px 6px",
                borderRadius: "4px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                userSelect: "none",
              }}
            >
              ESC
            </span>

            {/* Prominent Close Button */}
            <button
              onClick={onClose}
              aria-label="Bericht schließen"
              title="Schließen"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#FFFFFF",
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
                e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.5)";
                e.currentTarget.style.color = "#F87171";
                e.currentTarget.style.transform = "scale(1.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                e.currentTarget.style.color = "#FFFFFF";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Framed Article Body */}
        <div
          style={{
            overflowY: "auto",
            padding: "clamp(24px, 4vw, 40px)",
          }}
        >
          {/* Hero Banner if available */}
          {article.image && (
            <div
              style={{
                width: "100%",
                height: "clamp(220px, 32vw, 360px)",
                borderRadius: "16px",
                overflow: "hidden",
                marginBottom: "28px",
                boxShadow: "0 14px 36px rgba(0, 0, 0, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                position: "relative",
              }}
            >
              <img
                src={article.image}
                alt={article.title}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/news-match.jpg";
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(11, 15, 23, 0.6) 0%, transparent 50%)",
                }}
              />
            </div>
          )}

          {/* Article Title */}
          <h2
            id="framed-article-title"
            style={{
              fontSize: "clamp(1.75rem, 3.2vw, 2.35rem)",
              fontWeight: 800,
              lineHeight: 1.18,
              color: "#FFFFFF",
              letterSpacing: "-0.03em",
              marginBottom: "20px",
            }}
          >
            {article.title}
          </h2>

          {/* Styled Lead / Teaser Paragraph */}
          <div
            style={{
              padding: "18px 22px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.03)",
              borderLeft: `4px solid ${accentColorBright}`,
              borderTop: "1px solid rgba(255, 255, 255, 0.05)",
              borderRight: "1px solid rgba(255, 255, 255, 0.05)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
              marginBottom: "32px",
              fontSize: "1.08rem",
              lineHeight: 1.65,
              color: "#E2E8F0",
              fontWeight: 500,
            }}
          >
            {article.excerpt}
          </div>

          {/* Full Paragraphs */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              fontSize: "1.02rem",
              lineHeight: 1.85,
              color: "#CBD5E1",
            }}
          >
            {contentParagraphs.map((paragraph, idx) => (
              <p key={idx} style={{ margin: 0 }}>
                {paragraph}
              </p>
            ))}
          </div>

          {/* Framed Card Bottom Bar / Sign-off */}
          <div
            style={{
              marginTop: "48px",
              paddingTop: "24px",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "18px",
            }}
          >
            {/* Club Signature */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <img
                src="/logo-dark.png"
                alt="Eintracht Logo"
                style={{ width: "36px", height: "auto" }}
              />
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    color: "#FFFFFF",
                    fontSize: "0.92rem",
                    letterSpacing: "0.02em",
                  }}
                >
                  Eintracht Dachau-Karlsfeld
                </div>
                <div
                  style={{
                    fontSize: "0.76rem",
                    color: "var(--color-text-dim)",
                  }}
                >
                  Offizielle Vereinsmitteilung
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                onClick={onClose}
                className="btn-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 22px",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                <ChevronLeft size={16} />
                <span>Bericht schließen</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes modalCardIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>,
    document.body
  );
}

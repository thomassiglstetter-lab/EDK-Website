import React from "react";
import Link from "next/link";
import fs from "fs/promises";
import path from "path";
import { ArrowLeft, Calendar, Clock, Tag, Share2, Newspaper } from "lucide-react";

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

async function getArticle(id: string): Promise<Article | null> {
  try {
    const filePath = path.join(process.cwd(), "src", "data", "news.json");
    const raw = await fs.readFile(filePath, "utf8");
    const news: Article[] = JSON.parse(raw);
    return news.find((a) => a.id === id) || null;
  } catch (err) {
    console.error("Error fetching article:", err);
    return null;
  }
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    return (
      <div
        style={{
          position: "relative",
          zIndex: 10,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "#080B10",
        }}
      >
        <div
          className="glass-panel"
          style={{
            maxWidth: "480px",
            width: "100%",
            padding: "40px 32px",
            textAlign: "center",
            background: "rgba(14, 18, 28, 0.9)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          <Newspaper size={40} color="#64748B" style={{ margin: "0 auto 16px auto" }} />
          <h1 style={{ fontSize: "1.3rem", color: "#FFFFFF", marginBottom: "8px" }}>
            Bericht nicht gefunden
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--color-text-dim)", marginBottom: "24px" }}>
            Der gewünschte News-Artikel existiert leider nicht mehr oder die ID ist ungültig.
          </p>
          <Link
            href="/#news"
            className="btn-primary"
            style={{ display: "inline-flex", padding: "10px 20px", fontSize: "0.9rem" }}
          >
            <ArrowLeft size={16} />
            <span>Zurück zur Übersicht</span>
          </Link>
        </div>
      </div>
    );
  }

  const isCrimson = article.categoryColor === "crimson";
  const accentColor = isCrimson ? "var(--color-crimson)" : "var(--color-azure)";
  const accentColorBright = isCrimson ? "var(--color-crimson-bright)" : "var(--color-azure-bright)";
  const badgeBg = isCrimson ? "rgba(143, 24, 56, 0.2)" : "rgba(72, 156, 216, 0.2)";

  // Format content paragraphs
  const contentText = article.content || article.excerpt;
  const paragraphs = contentText.split("\n\n").filter(Boolean);

  return (
    <div
      style={{
        position: "relative",
        zIndex: 10,
        minHeight: "100vh",
        background: "#080B10",
        color: "#F1F5F9",
        paddingBottom: "100px",
      }}
    >
      {/* Top Sticky Navigation Bar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(11, 15, 22, 0.92)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div
          style={{
            maxWidth: "1040px",
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/#news"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "var(--radius-full)",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#FFFFFF",
              fontSize: "0.85rem",
              fontWeight: 500,
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
          >
            <ArrowLeft size={15} />
            <span>Zurück zu News</span>
          </Link>

          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
            }}
          >
            <img src="/logo-dark.png" alt="Eintracht Logo" style={{ width: "32px", height: "auto" }} />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "0.95rem",
                color: "#FFFFFF",
                letterSpacing: "0.04em",
              }}
            >
              EINTRACHT
            </span>
          </Link>
        </div>
      </header>

      {/* Main Article Container */}
      <article
        style={{
          maxWidth: "880px",
          margin: "48px auto 0 auto",
          padding: "0 24px",
        }}
      >
        {/* Meta Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: accentColorBright,
              background: badgeBg,
              border: `1px solid ${accentColor}`,
              padding: "4px 12px",
              borderRadius: "var(--radius-full)",
            }}
          >
            {article.category}
          </span>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.86rem",
              color: "#94A3B8",
            }}
          >
            <Calendar size={14} />
            <span>{article.date}</span>
          </span>

          <span style={{ color: "#64748B" }}>•</span>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.86rem",
              color: "#94A3B8",
            }}
          >
            <Clock size={14} />
            <span>{article.readTime}</span>
          </span>
        </div>

        {/* Article Headline */}
        <h1
          style={{
            fontSize: "clamp(2rem, 4vw, 2.9rem)",
            fontWeight: 800,
            lineHeight: 1.15,
            color: "#FFFFFF",
            letterSpacing: "-0.03em",
            marginBottom: "24px",
          }}
        >
          {article.title}
        </h1>

        {/* Lead / Teaser */}
        <p
          style={{
            fontSize: "1.15rem",
            lineHeight: 1.65,
            color: "#CBD5E1",
            marginBottom: "36px",
            paddingLeft: "18px",
            borderLeft: `4px solid ${accentColor}`,
            fontWeight: 500,
          }}
        >
          {article.excerpt}
        </p>

        {/* Hero Image */}
        {article.image && (
          <div
            style={{
              width: "100%",
              height: "clamp(260px, 45vw, 440px)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              marginBottom: "40px",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              position: "relative",
            }}
          >
            <img
              src={article.image}
              alt={article.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        )}

        {/* Full Article Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            fontSize: "1.05rem",
            lineHeight: 1.8,
            color: "#E2E8F0",
          }}
        >
          {paragraphs.map((p, i) => (
            <p key={i} style={{ margin: 0 }}>
              {p}
            </p>
          ))}
        </div>

        {/* Sign-off / Author Footer */}
        <div
          style={{
            marginTop: "60px",
            paddingTop: "28px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img src="/logo-dark.png" alt="Eintracht" style={{ width: "36px", height: "auto" }} />
            <div>
              <div style={{ fontWeight: 600, color: "#FFFFFF", fontSize: "0.95rem" }}>
                Eintracht Dachau-Karlsfeld
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--color-text-dim)" }}>
                Redaktion & Öffentlichkeitsarbeit
              </div>
            </div>
          </div>

          <Link
            href="/#news"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 22px",
              borderRadius: "var(--radius-full)",
              background: "var(--color-azure)",
              color: "#07090D",
              fontFamily: "var(--font-display)",
              fontSize: "0.88rem",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={15} />
            <span>Zurück zur Übersicht</span>
          </Link>
        </div>
      </article>
    </div>
  );
}

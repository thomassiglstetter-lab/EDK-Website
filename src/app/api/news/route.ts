import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

import { getSiteData, setSiteData } from "@/lib/supabase";

const DATA_FILE = path.join(process.cwd(), "src", "data", "news.json");

export interface Article {
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

async function getNews(): Promise<Article[]> {
  // 1. Try reading from Supabase site_data
  try {
    const fromDb = await getSiteData<Article[] | null>("news", null);
    if (fromDb !== null && Array.isArray(fromDb)) {
      return fromDb;
    }
  } catch (err) {
    console.warn("Could not read news from Supabase, falling back to local file:", err);
  }

  // 2. Fallback to local news.json only if DB entry does not exist
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Error reading news.json, falling back:", err);
    return [];
  }
}

async function saveNews(news: Article[]): Promise<boolean> {
  // 1. Save to Supabase (persistent on Vercel)
  const dbSaved = await setSiteData("news", news);

  // 2. Only write to local file if not in Vercel serverless environment
  if (!process.env.VERCEL) {
    try {
      await fs.writeFile(DATA_FILE, JSON.stringify(news, null, 2), "utf8");
    } catch {
      // Ignore local write errors
    }
  }

  return dbSaved;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET: list all news
export async function GET() {
  const news = await getNews();
  return NextResponse.json(news, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

// POST: create new article
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, category, excerpt, content, image, readTime } = body;

    if (!title || !category || !excerpt) {
      return NextResponse.json(
        { error: "Titel, Kategorie und Kurzbeschreibung sind erforderlich." },
        { status: 400 }
      );
    }

    const news = await getNews();

    // Determine German date string
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const months = [
      "Januar", "Februar", "März", "April", "Mai", "Juni",
      "Juli", "August", "September", "Oktober", "November", "Dezember"
    ];
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const formattedDate = body.date || `${day}. ${month} ${year}`;

    const newArticle: Article = {
      id: Date.now().toString(),
      category: category as "Spielbetrieb" | "Jugend" | "Verein",
      categoryColor: category === "Jugend" ? "crimson" : "azure",
      date: formattedDate,
      readTime: readTime || "3 Min. Lesezeit",
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content ? content.trim() : excerpt.trim(),
      image: image || "/news-match.jpg",
    };

    // Prepend new article so it appears at top
    news.unshift(newArticle);
    await saveNews(news);

    return NextResponse.json(newArticle, { status: 201 });
  } catch (err) {
    console.error("POST error:", err);
    return NextResponse.json(
      { error: "Artikel konnte nicht erstellt werden." },
      { status: 500 }
    );
  }
}

// PUT: update existing article
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, category, excerpt, content, image, date, readTime } = body;

    if (!id) {
      return NextResponse.json({ error: "Artikel-ID fehlt." }, { status: 400 });
    }

    const news = await getNews();
    const index = news.findIndex((item) => item.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Artikel nicht gefunden." }, { status: 404 });
    }

    const updated: Article = {
      ...news[index],
      title: title !== undefined ? title.trim() : news[index].title,
      category: category !== undefined ? category : news[index].category,
      categoryColor:
        category !== undefined
          ? category === "Jugend"
            ? "crimson"
            : "azure"
          : news[index].categoryColor,
      date: date !== undefined ? date : news[index].date,
      readTime: readTime !== undefined ? readTime : news[index].readTime,
      excerpt: excerpt !== undefined ? excerpt.trim() : news[index].excerpt,
      content: content !== undefined ? content.trim() : news[index].content,
      image: image !== undefined ? image : news[index].image,
    };

    news[index] = updated;
    await saveNews(news);

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT error:", err);
    return NextResponse.json(
      { error: "Artikel konnte nicht aktualisiert werden." },
      { status: 500 }
    );
  }
}

// DELETE: remove article
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Artikel-ID fehlt." }, { status: 400 });
    }

    const news = await getNews();
    const filtered = news.filter((item) => String(item.id) !== String(id));

    await saveNews(filtered);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (err) {
    console.error("DELETE error:", err);
    return NextResponse.json(
      { error: "Artikel konnte nicht gelöscht werden." },
      { status: 500 }
    );
  }
}

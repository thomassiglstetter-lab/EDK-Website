import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src", "data", "sponsors.json");
const TMP_DATA_FILE = path.join("/tmp", "sponsors.json");

export type SponsorTier = "gold" | "silver" | "partner" | "none";

export interface Sponsor {
  id: string;
  name: string;
  tier: SponsorTier;
  url?: string;
  logo?: string;
  fit?: "cover" | "contain";
}

async function getSponsors(): Promise<Sponsor[]> {
  // 1. Try reading from /tmp (latest updates in serverless environment)
  try {
    const tmpRaw = await fs.readFile(TMP_DATA_FILE, "utf8");
    const parsed = JSON.parse(tmpRaw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // /tmp does not exist yet, fallback to bundled file
  }

  // 2. Read from bundled src/data/sponsors.json
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading sponsors.json:", err);
    return [];
  }
}

async function saveSponsors(sponsors: Sponsor[]): Promise<boolean> {
  let saved = false;

  // 1. Try writing to src/data/sponsors.json (local dev, VPS)
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(sponsors, null, 2), "utf8");
    saved = true;
  } catch (err) {
    console.warn("Could not write to src/data/sponsors.json (read-only on Vercel):", err);
  }

  // 2. Also write to /tmp/sponsors.json (writable on Vercel serverless)
  try {
    await fs.writeFile(TMP_DATA_FILE, JSON.stringify(sponsors, null, 2), "utf8");
    saved = true;
  } catch (tmpErr) {
    console.warn("Could not write to /tmp/sponsors.json:", tmpErr);
  }

  return saved;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET: list all sponsors
export async function GET() {
  const sponsors = await getSponsors();
  return NextResponse.json(sponsors, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

// POST: create new sponsor
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, tier, url, logo, fit } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Unternehmensname ist erforderlich." },
        { status: 400 }
      );
    }

    const sponsors = await getSponsors();

    const newSponsor: Sponsor = {
      id: "sp-" + Date.now().toString(),
      name: name.trim(),
      tier: (tier as SponsorTier) || "none",
      url: url ? url.trim() : "",
      logo: logo ? logo.trim() : "",
      fit: fit || (logo && !logo.endsWith(".svg") ? "cover" : "contain"),
    };

    sponsors.push(newSponsor);
    await saveSponsors(sponsors);

    return NextResponse.json(newSponsor, { status: 201 });
  } catch (err) {
    console.error("POST /api/sponsors error:", err);
    return NextResponse.json({ error: "Sponsor konnte nicht hinzugefügt werden." }, { status: 500 });
  }
}

// PUT: update existing sponsor
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, tier, url, logo, fit } = body;

    if (!id) {
      return NextResponse.json({ error: "Sponsor-ID fehlt." }, { status: 400 });
    }

    const sponsors = await getSponsors();
    const index = sponsors.findIndex((s) => s.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Sponsor nicht gefunden." }, { status: 404 });
    }

    const updated: Sponsor = {
      ...sponsors[index],
      name: name !== undefined ? name.trim() : sponsors[index].name,
      tier: tier !== undefined ? tier : sponsors[index].tier,
      url: url !== undefined ? url.trim() : sponsors[index].url,
      logo: logo !== undefined ? logo.trim() : sponsors[index].logo,
      fit: fit !== undefined ? fit : sponsors[index].fit || (logo && !logo.endsWith(".svg") ? "cover" : "contain"),
    };

    sponsors[index] = updated;
    await saveSponsors(sponsors);

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /api/sponsors error:", err);
    return NextResponse.json({ error: "Sponsor konnte nicht aktualisiert werden." }, { status: 500 });
  }
}

// DELETE: delete sponsor
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Sponsor-ID fehlt." }, { status: 400 });
    }

    const sponsors = await getSponsors();
    const filtered = sponsors.filter((s) => s.id !== id);

    if (filtered.length === sponsors.length) {
      return NextResponse.json({ error: "Sponsor nicht gefunden." }, { status: 404 });
    }

    await saveSponsors(filtered);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (err) {
    console.error("DELETE /api/sponsors error:", err);
    return NextResponse.json({ error: "Sponsor konnte nicht gelöscht werden." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { syncLeagueTable } from "@/lib/tables";

const DATA_FILE = path.join(process.cwd(), "src", "data", "teams.json");

export type TeamCategory = "Herren" | "Damen" | "Jugend männlich" | "Jugend weiblich" | "Kinderhandball" | "Minis";

export interface CoachContact {
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
}

export interface TrainingSession {
  day: string;
  time: string;
  hallName: string;
  hallId?: string;
}

export interface SocialMedia {
  instagram?: string;
}

export interface Team {
  id: string;
  slug: string;
  name: string;
  league: string;
  trainer: string;
  coaches?: CoachContact[];
  trainingTimes: string;
  trainingLocation: string;
  trainingSchedule?: TrainingSession[];
  category: TeamCategory;
  accentType: "crimson" | "azure";
  image?: string;
  showImage?: boolean;
  portrait?: string;
  groupUrl?: string;
  nuligaCategory?: string;
  hallId?: string;
  coachContact?: CoachContact;
  socialMedia?: SocialMedia;
}

async function getTeams(): Promise<Team[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading teams.json:", err);
    return [];
  }
}

async function saveTeams(teams: Team[]): Promise<boolean> {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(teams, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Error writing teams.json:", err);
    return false;
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET: list all teams
export async function GET() {
  const teams = await getTeams();
  return NextResponse.json(teams, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

// POST: create new team
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      league,
      trainer,
      trainingTimes,
      trainingLocation,
      category,
      accentType,
      image,
      showImage,
      portrait,
      groupUrl,
      nuligaCategory,
      hallId,
      coachContact,
      socialMedia,
      coaches,
      trainingSchedule,
    } = body;

    if (!name || !league || (!trainer && (!coaches || coaches.length === 0))) {
      return NextResponse.json(
        { error: "Teamname, Liga und mindestens ein Trainer sind erforderlich." },
        { status: 400 }
      );
    }

    const teams = await getTeams();

    const slug = (body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-")).replace(/^-|-$/g, "");
    const primaryTrainer = (coaches && coaches[0]?.name) ? coaches[0].name.trim() : (trainer || "").trim();

    const newTeam: Team = {
      id: "team-" + Date.now().toString(),
      slug,
      name: name.trim(),
      league: league.trim(),
      trainer: primaryTrainer,
      coaches: coaches || (coachContact ? [coachContact] : [{ name: primaryTrainer, role: "Cheftrainer" }]),
      trainingSchedule: trainingSchedule || [],
      trainingTimes: (trainingTimes || "Nach Absprache").trim(),
      trainingLocation: (trainingLocation || "Sporthalle Mittelschule (MSK)").trim(),
      category: (category as TeamCategory) || "Herren",
      accentType: accentType || (category === "Herren" || category === "Jugend männlich" ? "crimson" : "azure"),
      image: image || `/teams/${slug}.jpg`,
      showImage: showImage !== undefined ? Boolean(showImage) : true,
      portrait: portrait ? portrait.trim() : "",
      groupUrl: groupUrl ? groupUrl.trim() : "",
      nuligaCategory: nuligaCategory ? nuligaCategory.trim() : name.trim(),
      hallId: hallId || "hall-260180",
      coachContact: coachContact || {
        name: primaryTrainer,
        role: (coaches && coaches[0]?.role) || "Trainerteam",
        email: (coaches && coaches[0]?.email) || "trainer@handballeintracht.de",
        phone: (coaches && coaches[0]?.phone) || "",
      },
      socialMedia: socialMedia || {
        instagram: "https://www.instagram.com/handballeintracht/",
      },
    };

    teams.push(newTeam);
    await saveTeams(teams);

    // If groupUrl is provided, trigger sync of the nuLiga table in the background
    if (newTeam.groupUrl && newTeam.groupUrl.startsWith("http")) {
      syncLeagueTable(newTeam.slug, newTeam.groupUrl).catch((e) =>
        console.error("Async table sync error on create:", e)
      );
    }

    return NextResponse.json(newTeam, { status: 201 });
  } catch (err) {
    console.error("POST /api/teams error:", err);
    return NextResponse.json({ error: "Team konnte nicht erstellt werden." }, { status: 500 });
  }
}

// PUT: update existing team
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      name,
      slug,
      league,
      trainer,
      trainingTimes,
      trainingLocation,
      category,
      accentType,
      image,
      showImage,
      portrait,
      groupUrl,
      nuligaCategory,
      hallId,
      coachContact,
      socialMedia,
      coaches,
      trainingSchedule,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Team-ID fehlt." }, { status: 400 });
    }

    const teams = await getTeams();
    const index = teams.findIndex((t) => t.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Team nicht gefunden." }, { status: 404 });
    }

    const current = teams[index];
    const updatedSlug = slug !== undefined ? slug.trim() : current.slug;
    const updatedTrainer = trainer !== undefined ? trainer.trim() : (coaches && coaches[0]?.name ? coaches[0].name.trim() : current.trainer);

    const updated: Team = {
      ...current,
      slug: updatedSlug,
      name: name !== undefined ? name.trim() : current.name,
      league: league !== undefined ? league.trim() : current.league,
      trainer: updatedTrainer,
      coaches: coaches !== undefined ? coaches : current.coaches,
      trainingSchedule: trainingSchedule !== undefined ? trainingSchedule : current.trainingSchedule,
      trainingTimes: trainingTimes !== undefined ? trainingTimes.trim() : current.trainingTimes,
      trainingLocation: trainingLocation !== undefined ? trainingLocation.trim() : current.trainingLocation,
      category: category !== undefined ? category : current.category,
      accentType: accentType !== undefined ? accentType : current.accentType,
      image: image !== undefined ? image.trim() : current.image,
      showImage: showImage !== undefined ? Boolean(showImage) : (current.showImage !== undefined ? current.showImage : true),
      portrait: portrait !== undefined ? portrait.trim() : current.portrait,
      groupUrl: groupUrl !== undefined ? groupUrl.trim() : current.groupUrl,
      nuligaCategory: nuligaCategory !== undefined ? nuligaCategory.trim() : current.nuligaCategory,
      hallId: hallId !== undefined ? hallId : current.hallId,
      coachContact: coachContact !== undefined ? coachContact : current.coachContact,
      socialMedia: socialMedia !== undefined ? socialMedia : current.socialMedia,
    };

    teams[index] = updated;
    await saveTeams(teams);

    // If groupUrl is provided, trigger sync of the nuLiga table in the background
    if (updated.groupUrl && updated.groupUrl.startsWith("http")) {
      syncLeagueTable(updated.slug, updated.groupUrl).catch((e) =>
        console.error("Async table sync error on update:", e)
      );
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /api/teams error:", err);
    return NextResponse.json({ error: "Team konnte nicht aktualisiert werden." }, { status: 500 });
  }
}

// DELETE: delete team
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Team-ID fehlt." }, { status: 400 });
    }

    const teams = await getTeams();
    const filtered = teams.filter((t) => t.id !== id);

    if (filtered.length === teams.length) {
      return NextResponse.json({ error: "Team nicht gefunden." }, { status: 404 });
    }

    await saveTeams(filtered);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (err) {
    console.error("DELETE /api/teams error:", err);
    return NextResponse.json({ error: "Team konnte nicht gelöscht werden." }, { status: 500 });
  }
}

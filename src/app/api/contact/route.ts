import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src", "data", "contact.json");
const MESSAGES_FILE = path.join(process.cwd(), "src", "data", "contact-messages.json");

export interface ContactCategory {
  id: string;
  name: string;
  email: string;
  description?: string;
  active?: boolean;
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password?: string;
  fromEmail: string;
  fromName: string;
}

export interface ContactSettings {
  generalEmail: string;
  categories: ContactCategory[];
  smtp?: SmtpConfig;
}

export interface ContactMessage {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  category: string;
  targetEmail: string;
  message: string;
  read: boolean;
  mailSent: boolean;
  sendError?: string;
}

const DEFAULT_SETTINGS: ContactSettings = {
  generalEmail: "kontakt@handballeintracht.de",
  categories: [
    {
      id: "cat-allgemein",
      name: "Allgemeine Vereinsanfrage",
      email: "kontakt@handballeintracht.de",
      description: "Allgemeine Fragen zum Verein, Mitgliedschaft und Organisation",
      active: true,
    },
  ],
  smtp: {
    host: "",
    port: 587,
    secure: false,
    user: "",
    password: "",
    fromEmail: "kontakt@handballeintracht.de",
    fromName: "Eintracht Dachau-Karlsfeld Handball",
  },
};

async function getContactSettings(): Promise<ContactSettings> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading contact.json:", err);
    return DEFAULT_SETTINGS;
  }
}

async function saveContactSettings(settings: ContactSettings): Promise<boolean> {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(settings, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Error writing contact.json:", err);
    return false;
  }
}

async function getMessages(): Promise<ContactMessage[]> {
  try {
    const raw = await fs.readFile(MESSAGES_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function saveMessages(messages: ContactMessage[]): Promise<boolean> {
  try {
    await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Error writing contact-messages.json:", err);
    return false;
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET: returns contact settings, categories, and messages
export async function GET() {
  const settings = await getContactSettings();
  const messages = await getMessages();

  return NextResponse.json(
    { ...settings, messages },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}

// POST: Add new category or update whole settings
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const settings = await getContactSettings();

    // Check if updating entire settings object
    if (body.generalEmail && Array.isArray(body.categories)) {
      settings.generalEmail = body.generalEmail.trim();
      settings.categories = body.categories;
      if (body.smtp) settings.smtp = body.smtp;
      await saveContactSettings(settings);
      return NextResponse.json({ success: true, settings });
    }

    // Creating a single category
    const { name, email, description, active } = body;
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name und E-Mail-Adresse sind erforderlich." },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const newCategory: ContactCategory = {
      id: body.id || `cat-${slug || Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      description: description ? description.trim() : "",
      active: active !== false,
    };

    settings.categories.push(newCategory);
    const ok = await saveContactSettings(settings);
    if (!ok) {
      return NextResponse.json({ error: "Fehler beim Speichern" }, { status: 500 });
    }

    return NextResponse.json({ success: true, category: newCategory, settings });
  } catch (err) {
    console.error("Error in POST /api/contact:", err);
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }
}

// PUT: Update existing category, general settings, SMTP or message status
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Update SMTP Settings
    if (body.action === "updateSmtp") {
      const settings = await getContactSettings();
      settings.smtp = {
        host: body.smtp?.host ? body.smtp.host.trim() : "",
        port: Number(body.smtp?.port) || 587,
        secure: Boolean(body.smtp?.secure),
        user: body.smtp?.user ? body.smtp.user.trim() : "",
        password: body.smtp?.password !== undefined ? body.smtp.password : (settings.smtp?.password || ""),
        fromEmail: body.smtp?.fromEmail ? body.smtp.fromEmail.trim() : "kontakt@handballeintracht.de",
        fromName: body.smtp?.fromName ? body.smtp.fromName.trim() : "Eintracht Dachau-Karlsfeld Handball",
      };
      await saveContactSettings(settings);
      return NextResponse.json({ success: true, smtp: settings.smtp });
    }

    // 2. Mark Message Read / Unread
    if (body.action === "toggleMessageRead") {
      const messages = await getMessages();
      const msg = messages.find((m) => m.id === body.messageId);
      if (!msg) {
        return NextResponse.json({ error: "Nachricht nicht gefunden." }, { status: 404 });
      }
      msg.read = body.read !== undefined ? Boolean(body.read) : !msg.read;
      await saveMessages(messages);
      return NextResponse.json({ success: true, message: msg, messages });
    }

    // 3. Update general email
    const settings = await getContactSettings();
    if (body.action === "updateGeneralEmail" && body.generalEmail) {
      settings.generalEmail = body.generalEmail.trim();
      await saveContactSettings(settings);
      return NextResponse.json({ success: true, settings });
    }

    // 4. Update category
    const { id, name, email, description, active } = body;
    if (!id) {
      return NextResponse.json({ error: "ID ist erforderlich." }, { status: 400 });
    }

    const idx = settings.categories.findIndex((c) => c.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Kategorie nicht gefunden." }, { status: 404 });
    }

    settings.categories[idx] = {
      ...settings.categories[idx],
      name: name !== undefined ? name.trim() : settings.categories[idx].name,
      email: email !== undefined ? email.trim() : settings.categories[idx].email,
      description: description !== undefined ? description.trim() : settings.categories[idx].description,
      active: active !== undefined ? active : settings.categories[idx].active,
    };

    const ok = await saveContactSettings(settings);
    if (!ok) {
      return NextResponse.json({ error: "Fehler beim Speichern" }, { status: 500 });
    }

    return NextResponse.json({ success: true, category: settings.categories[idx], settings });
  } catch (err) {
    console.error("Error in PUT /api/contact:", err);
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }
}

// DELETE: Delete a category or message
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get("messageId");
    const categoryId = searchParams.get("id");

    // Delete a Message from Inbox
    if (messageId) {
      const messages = await getMessages();
      const filtered = messages.filter((m) => m.id !== messageId);
      await saveMessages(filtered);
      return NextResponse.json({ success: true, messages: filtered });
    }

    // Delete a Category
    if (!categoryId) {
      return NextResponse.json({ error: "ID ist erforderlich." }, { status: 400 });
    }

    const settings = await getContactSettings();
    const initialLen = settings.categories.length;
    settings.categories = settings.categories.filter((c) => c.id !== categoryId);

    if (settings.categories.length === initialLen) {
      return NextResponse.json({ error: "Kategorie nicht gefunden." }, { status: 404 });
    }

    const ok = await saveContactSettings(settings);
    if (!ok) {
      return NextResponse.json({ error: "Fehler beim Speichern" }, { status: 500 });
    }

    return NextResponse.json({ success: true, settings });
  } catch (err) {
    console.error("Error in DELETE /api/contact:", err);
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }
}

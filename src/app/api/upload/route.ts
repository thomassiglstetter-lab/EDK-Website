import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const rawFolder = (formData.get("folder") as string) || "uploads";
    const rawSlug = (formData.get("slug") as string) || "file";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Keine Datei ausgewählt." },
        { status: 400 }
      );
    }

    // Max 15 MB
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "Die Datei ist zu groß (maximal 15 MB erlaubt)." },
        { status: 400 }
      );
    }

    const fileNameLower = file.name.toLowerCase();
    const validMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/svg+xml",
      "image/svg",
    ];

    const hasValidExt =
      fileNameLower.endsWith(".jpg") ||
      fileNameLower.endsWith(".jpeg") ||
      fileNameLower.endsWith(".png") ||
      fileNameLower.endsWith(".webp") ||
      fileNameLower.endsWith(".svg");

    if (!validMimes.includes(file.type) && !hasValidExt) {
      return NextResponse.json(
        { success: false, error: "Ungültiges Dateiformat. Erlaubt sind JPG, PNG, WEBP und SVG." },
        { status: 400 }
      );
    }

    // Determine extension
    let ext = "jpg";
    if (file.type === "image/png" || fileNameLower.endsWith(".png")) ext = "png";
    else if (file.type === "image/webp" || fileNameLower.endsWith(".webp")) ext = "webp";
    else if (file.type.includes("svg") || fileNameLower.endsWith(".svg")) ext = "svg";
    else if (file.type === "image/jpeg" || file.type === "image/jpg" || fileNameLower.endsWith(".jpeg") || fileNameLower.endsWith(".jpg")) ext = "jpg";

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize folder and slug to avoid directory traversal
    const safeFolder = rawFolder.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 30) || "uploads";
    const safeSlug = rawSlug
      .toLowerCase()
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 40)
      .replace(/^-|-$/g, "") || "upload";

    const filename = `${safeSlug}-${Date.now()}.${ext}`;
    
    // Save to public/uploads/<folder>/... (primary)
    const uploadsDir = path.join(process.cwd(), "public", "uploads", safeFolder);
    const uploadsPath = path.join(uploadsDir, filename);
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.writeFile(uploadsPath, buffer);

    // Also save to public/<folder>/... (backup / legacy support)
    try {
      const legacyDir = path.join(process.cwd(), "public", safeFolder);
      await fs.mkdir(legacyDir, { recursive: true });
      await fs.writeFile(path.join(legacyDir, filename), buffer);
    } catch (e) {
      // Non-fatal
    }

    const publicUrl = `/uploads/${safeFolder}/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Fehler beim Speichern der Datei auf dem Server." },
      { status: 500 }
    );
  }
}

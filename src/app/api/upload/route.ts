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

    const filename = `${safeFolder}-${safeSlug}-${Date.now()}.${ext}`;
    const mime =
      file.type ||
      (ext === "png"
        ? "image/png"
        : ext === "webp"
        ? "image/webp"
        : ext === "svg"
        ? "image/svg+xml"
        : "image/jpeg");

    let publicUrl = "";

    // 1. Upload to Supabase Storage (primary persistent storage for both dev & Vercel)
    try {
      const { uploadToSupabaseStorage } = await import("@/lib/supabase");
      publicUrl = await uploadToSupabaseStorage(buffer, filename, mime);
    } catch (sbErr) {
      console.error("Supabase Storage upload error, attempting fallback:", sbErr);
    }

    // 2. Also save to local public/uploads (in local development or VPS) if possible
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads", safeFolder);
      const uploadsPath = path.join(uploadsDir, filename);
      await fs.mkdir(uploadsDir, { recursive: true });
      await fs.writeFile(uploadsPath, buffer);
      if (!publicUrl) {
        publicUrl = `/uploads/${safeFolder}/${filename}`;
      }
    } catch (fsErr) {
      // Expected in Vercel serverless read-only environment
    }

    // 3. Fallback to base64 only if Supabase and local disk both failed
    if (!publicUrl) {
      publicUrl = `data:${mime};base64,${buffer.toString("base64")}`;
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Fehler beim Verarbeiten der Datei auf dem Server." },
      { status: 500 }
    );
  }
}

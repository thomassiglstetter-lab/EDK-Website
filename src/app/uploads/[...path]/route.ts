import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".avif": "image/avif",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const segments = resolvedParams.path || [];

    if (segments.length === 0) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    // Sanitize path segments to prevent directory traversal
    const safeSegments = segments.map((s) => s.replace(/\.\./g, "").replace(/[^a-zA-Z0-9_.-]/g, ""));

    // 1. First priority: public/uploads/...
    let filePath = path.join(process.cwd(), "public", "uploads", ...safeSegments);
    let exists = false;
    try {
      await fs.access(filePath);
      exists = true;
    } catch {
      // 2. Fallback: check directly in public/... (e.g. public/news/..., public/teams/...)
      filePath = path.join(process.cwd(), "public", ...safeSegments);
      try {
        await fs.access(filePath);
        exists = true;
      } catch {
        // 3. Fallback: check /tmp/uploads/... (for serverless environments)
        filePath = path.join("/tmp", "uploads", ...safeSegments);
        try {
          await fs.access(filePath);
          exists = true;
        } catch {
          exists = false;
        }
      }
    }

    if (!exists) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    const fileBuffer = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving upload:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

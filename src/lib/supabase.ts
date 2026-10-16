// Central Supabase integration for persistent storage of site data and uploaded media

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://jewlvukxdkqemydsnxnk.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impld2x2dWt4ZGtxZW15ZHNueG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MjQ4MDIsImV4cCI6MjEwNTMwMDgwMn0.hUdGfL6kRAPlgku2cLD6zsDnyYOIRTFZgjl7EgXj9j0";

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impld2x2dWt4ZGtxZW15ZHNueG5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTcyNDgwMiwiZXhwIjoyMTA1MzAwODAyfQ.N6nKa9-rcNq9LSrWdGp24RZL3LSymL5pbLWiQDPfxOw";

const BUCKET_NAME = "uploads";

/**
 * Retrieve persistent data for a given key (e.g., "teams", "news", "reports", "sponsors").
 * Falls back to the provided fallback value if not present or in case of an error.
 */
export async function getSiteData<T>(key: string, fallback: T): Promise<T> {
  try {
    const url = `${SUPABASE_URL}/rest/v1/site_data?key=eq.${encodeURIComponent(key)}&select=data`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      console.warn(`[Supabase] getSiteData(${key}) returned status ${res.status}`);
      return fallback;
    }

    const rows = await res.json();
    if (Array.isArray(rows) && rows.length > 0 && rows[0].data !== undefined) {
      return rows[0].data as T;
    }

    return fallback;
  } catch (err) {
    console.error(`[Supabase] getSiteData(${key}) error:`, err);
    return fallback;
  }
}

/**
 * Persist data for a given key (e.g., "teams", "news", "reports", "sponsors").
 * Uses upsert (merge duplicates) to save or update.
 */
export async function setSiteData<T>(key: string, data: T): Promise<boolean> {
  try {
    const url = `${SUPABASE_URL}/rest/v1/site_data`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
      body: JSON.stringify({
        key,
        data,
        updated_at: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[Supabase] setSiteData(${key}) failed [${res.status}]:`, errText);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`[Supabase] setSiteData(${key}) error:`, err);
    return false;
  }
}

/**
 * Upload an image or document buffer to the public Supabase Storage bucket.
 * Returns the permanent public URL.
 */
export async function uploadToSupabaseStorage(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  // Sanitize filename
  const cleanFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
  const uniqueName = `${Date.now()}-${cleanFilename}`;
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${uniqueName}`;

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": mimeType,
    },
    body: buffer as unknown as BodyInit,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Storage upload failed [${res.status}]: ${errText}`);
  }

  // Public access URL
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${uniqueName}`;
}

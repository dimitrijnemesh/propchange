// Server-side helpers for the API routes.

// Small in-memory limiter: max N requests per minute per IP and route (per server instance).
const hits = new Map<string, { n: number; t: number }>();
export function limited(key: string, max = 5) {
  const now = Date.now();
  const h = hits.get(key);
  if (!h || now - h.t > 60_000) {
    hits.set(key, { n: 1, t: now });
    return false;
  }
  h.n += 1;
  return h.n > max;
}

export function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/** Sends one row to the Google Apps Script web app. `type` picks the sheet tab. */
export async function sendToSheet(type: "waitlist" | "feedback", row: Record<string, string | number>, req: Request) {
  const url = process.env.GOOGLE_SCRIPT_URL;
  const secret = process.env.WAITLIST_SECRET;
  if (!url || !secret) return { ok: false as const, error: "config" };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ secret, type, ...row, referrer: (req.headers.get("referer") ?? "").slice(0, 200) }),
      redirect: "follow",
      cache: "no-store",
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; duplicate?: boolean };
    if (!res.ok || !data.ok) return { ok: false as const, error: "store" };
    return { ok: true as const, duplicate: !!data.duplicate };
  } catch {
    return { ok: false as const, error: "store" };
  }
}

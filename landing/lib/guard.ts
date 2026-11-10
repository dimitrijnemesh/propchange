// Request guards shared by the API routes: origin check, time trap, optional Cloudflare Turnstile.

/** Only accept submissions coming from our own site (Origin, or Referer as a fallback). */
export function sameOrigin(req: Request) {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const extra = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      try {
        return new URL(s).host;
      } catch {
        return s;
      }
    });
  const source = req.headers.get("origin") || req.headers.get("referer");
  if (!source) return false;
  try {
    const h = new URL(source).host;
    return h === host || extra.includes(h);
  } catch {
    return false;
  }
}

/** Forms filled faster than this are almost always bots. `elapsed` = ms since the form appeared. */
export const MIN_FILL_MS = 1500;
export function tooFast(elapsed: unknown) {
  const n = Number(elapsed);
  return !Number.isFinite(n) || n < MIN_FILL_MS;
}

/** Cloudflare Turnstile — only active when TURNSTILE_SECRET_KEY is set. */
export async function turnstileOk(token: unknown, req: Request) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (typeof token !== "string" || !token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    if (ip) body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body, cache: "no-store" });
    const data = (await res.json()) as { success?: boolean };
    return !!data.success;
  } catch {
    return false;
  }
}

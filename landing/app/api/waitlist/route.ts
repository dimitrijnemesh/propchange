import { NextResponse } from "next/server";
import { isLang } from "@/lib/copy";
import { domainAcceptsMail, isDisposable } from "@/lib/email-check";
import { sameOrigin, tooFast, turnstileOk } from "@/lib/guard";
import { clientIp, limited, sendToSheet } from "@/lib/sheet";

export const runtime = "nodejs"; // DNS lookups for the email domain check

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const X_NAME = /^[A-Za-z0-9_]{1,15}$/;
const ROLES = new Set(["follower", "trader", "community"]);
const fail = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

export async function POST(req: Request) {
  if (limited(`w:${clientIp(req)}`)) return fail("rate", 429);
  if (!sameOrigin(req)) return fail("origin", 403);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return fail("bad");
  }

  // Honeypot: real users never fill this hidden field. Pretend success so bots learn nothing.
  if (typeof body.pc_trap === "string" && body.pc_trap.trim() !== "") return NextResponse.json({ ok: true });
  if (tooFast(body.elapsed)) return fail("slow");
  if (!(await turnstileOk(body.ts, req))) return fail("check", 403);

  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 200);
  if (!EMAIL.test(email)) return fail("email");
  const domain = email.split("@")[1];
  if (isDisposable(domain)) return fail("disposable");
  if (!(await domainAcceptsMail(domain))) return fail("domain");

  const x = String(body.x ?? "").trim().replace(/^@/, "");
  if (x && !X_NAME.test(x)) return fail("x");

  const phone = String(body.phone ?? "").trim().slice(0, 24);
  const digits = phone.replace(/\D/g, "");
  if (phone && (!/^\+?[\d\s().-]+$/.test(phone) || digits.length < 7 || digits.length > 15)) return fail("phone");

  const r = await sendToSheet(
    "waitlist",
    {
      email,
      role: ROLES.has(String(body.role)) ? String(body.role) : "follower",
      lang: isLang(body.lang) ? body.lang : "en",
      x: x ? `@${x}` : "",
      // Leading apostrophe keeps "+380…" as text in Google Sheets.
      phone: phone ? `'${phone}` : "",
      source: String(body.source ?? "").slice(0, 40),
    },
    req,
  );
  if (!r.ok) return fail(r.error, r.error === "config" ? 500 : 502);
  return NextResponse.json({ ok: true, duplicate: r.duplicate });
}

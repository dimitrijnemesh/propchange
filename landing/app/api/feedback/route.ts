import { NextResponse } from "next/server";
import { isLang } from "@/lib/copy";
import { domainAcceptsMail, isDisposable } from "@/lib/email-check";
import { sameOrigin, tooFast, turnstileOk } from "@/lib/guard";
import { clientIp, limited, sendToSheet } from "@/lib/sheet";

export const runtime = "nodejs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const fail = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

export async function POST(req: Request) {
  if (limited(`f:${clientIp(req)}`, 3)) return fail("rate", 429);
  if (!sameOrigin(req)) return fail("origin", 403);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return fail("bad");
  }
  if (typeof body.pc_trap === "string" && body.pc_trap.trim() !== "") return NextResponse.json({ ok: true });
  if (tooFast(body.elapsed)) return fail("slow");
  if (!(await turnstileOk(body.ts, req))) return fail("check", 403);

  const rating = Number(body.rating);
  const liked = String(body.liked ?? "").trim().slice(0, 2000);
  const improve = String(body.improve ?? "").trim().slice(0, 2000);
  const r5 = Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : 0;
  if (!r5 && !liked && !improve) return fail("empty");

  // The reply email is optional: keep it only if it looks real (never block feedback because of it).
  const emailRaw = String(body.email ?? "").trim().toLowerCase().slice(0, 200);
  let email = "";
  if (EMAIL.test(emailRaw)) {
    const domain = emailRaw.split("@")[1];
    if (!isDisposable(domain) && (await domainAcceptsMail(domain))) email = emailRaw;
  }

  const r = await sendToSheet("feedback", { rating: r5 || "", liked, improve, email, lang: isLang(body.lang) ? body.lang : "en" }, req);
  if (!r.ok) return fail(r.error, r.error === "config" ? 500 : 502);
  return NextResponse.json({ ok: true });
}

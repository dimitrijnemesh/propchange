"use client";
import { useEffect, useRef, useState } from "react";
import type { Copy, Lang } from "@/lib/copy";
import { suggestEmail } from "@/lib/email-typo";
import { Consent } from "./consent";
import { EmailInput } from "./email-input";
import { Turnstile } from "./turnstile";

type Role = "follower" | "trader" | "community";
type State = { kind: "idle" | "sending" | "ok" | "dup" | "error"; msg?: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const X_NAME = /^[A-Za-z0-9_]{1,15}$/;

/** "@name", "name" or "x.com/name" → "name". */
export function cleanX(v: string) {
  return v.trim().replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//i, "").replace(/^@/, "").split(/[/?#]/)[0];
}
export function phoneOk(v: string) {
  const digits = v.replace(/\D/g, "");
  return /^\+?[\d\s().-]+$/.test(v.trim()) && digits.length >= 7 && digits.length <= 15;
}

export function WaitlistForm({ t, lang, source, id, privacyLink }: { t: Copy["form"]; lang: Lang; source: string; id: string; privacyLink: string }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("follower");
  const [more, setMore] = useState(false);
  const [x, setX] = useState("");
  const [phone, setPhone] = useState("");
  // Honeypot (bots fill it). Named so browsers never autofill it — a "company" name got autofilled with real users' details.
  const [trap, setTrap] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const [bad, setBad] = useState<"email" | "x" | "phone" | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const shownAt = useRef(0);
  useEffect(() => {
    shownAt.current = Date.now();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const xName = cleanX(x);
    if (!EMAIL.test(email.trim())) return fail("email", t.errEmail);
    if (xName && !X_NAME.test(xName)) return fail("x", t.errX);
    if (phone.trim() && !phoneOk(phone)) return fail("phone", t.errPhone);
    setBad(null);
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role, lang, source, x: xName, phone: phone.trim(), pc_trap: trap, elapsed: Date.now() - shownAt.current, ts: token }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; duplicate?: boolean; error?: string };
      if (data.ok) {
        setState({ kind: data.duplicate ? "dup" : "ok" });
        return;
      }
      const map: Record<string, [typeof bad, string]> = {
        email: ["email", t.errEmail],
        disposable: ["email", t.errDisposable],
        domain: ["email", t.errDomain],
        slow: [null, t.errSlow],
        check: [null, t.errCheck],
        x: ["x", t.errX],
        phone: ["phone", t.errPhone],
        rate: [null, t.errRate],
      };
      const [field, msg] = map[data.error ?? ""] ?? [null, t.err];
      fail(field, msg);
    } catch {
      fail(null, t.err);
    }
  }

  function fail(field: typeof bad, msg: string) {
    setBad(field);
    setResetKey((k) => k + 1);
    setState({ kind: "error", msg });
  }

  if (state.kind === "ok" || state.kind === "dup") {
    return (
      <div className="form-done" role="status">
        <span className="check" aria-hidden="true">✓</span>
        {state.kind === "ok" ? t.ok : t.dup}
      </div>
    );
  }

  const roles: Role[] = ["follower", "trader", "community"];
  return (
    <form className="wl" onSubmit={submit} noValidate>
      <fieldset className="roles">
        <legend>{t.roleLabel}</legend>
        {roles.map((r) => (
          <button key={r} type="button" className={r === role ? "role on" : "role"} aria-pressed={r === role} onClick={() => setRole(r)}>
            {t.roles[r]}
          </button>
        ))}
      </fieldset>
      <div className="wl-row">
        <label htmlFor={`${id}-email`} className="sr-only">
          {t.placeholder}
        </label>
        <EmailInput
          id={`${id}-email`}
          lang={lang}
          placeholder={t.placeholder}
          value={email}
          onChange={(v) => {
            setEmail(v);
            if (hint) setHint(null);
          }}
          onBlur={() => setHint(suggestEmail(email.trim()))}
          invalid={bad === "email"}
        />
        <input className="hp" type="text" tabIndex={-1} autoComplete="new-password" data-lpignore="true" data-1p-ignore="true" aria-hidden="true" value={trap} onChange={(e) => setTrap(e.target.value)} name="pc_trap_7f3" />
        <button type="submit" className="btn primary" disabled={state.kind === "sending"}>
          {state.kind === "sending" ? t.sending : t.button}
        </button>
      </div>

      {hint ? (
        <p className="hint">
          {t.didYouMean}{" "}
          <button
            type="button"
            onClick={() => {
              setEmail(hint);
              setHint(null);
              if (bad === "email") setBad(null);
            }}
          >
            {hint}
          </button>
          ?
        </p>
      ) : null}
      <Turnstile onToken={setToken} lang={lang} resetKey={resetKey} />

      <button type="button" className="more" aria-expanded={more} aria-controls={`${id}-more`} onClick={() => setMore((v) => !v)}>
        {more ? `− ${t.less}` : `+ ${t.more}`}
      </button>
      {more ? (
        <div className="wl-more" id={`${id}-more`}>
          <label className="field">
            <span>
              {t.x} <em>· {t.optional}</em>
            </span>
            <input type="text" autoComplete="off" spellCheck={false} placeholder={t.xPh} value={x} onChange={(e) => setX(e.target.value)} aria-invalid={bad === "x"} maxLength={60} />
          </label>
          <label className="field">
            <span>
              {t.phone} <em>· {t.optional}</em>
            </span>
            <input type="tel" inputMode="tel" autoComplete="tel" placeholder={t.phonePh} value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={bad === "phone"} maxLength={24} />
          </label>
        </div>
      ) : null}

      {state.kind === "error" ? (
        <p className="wl-err" role="alert">
          {state.msg}
        </p>
      ) : null}
      <Consent text={t.consent} link={privacyLink} />
    </form>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
import type { Copy, Lang } from "@/lib/copy";
import { Consent } from "./consent";
import { EmailInput } from "./email-input";
import { Turnstile } from "./turnstile";

type State = { kind: "idle" | "sending" | "ok" | "error"; msg?: string };

export function FeedbackForm({ t, lang, privacyLink }: { t: Copy["feedback"]; lang: Lang; privacyLink: string }) {
  const [rating, setRating] = useState(0);
  const [liked, setLiked] = useState("");
  const [improve, setImprove] = useState("");
  const [email, setEmail] = useState("");
  // Honeypot (bots fill it). Named so browsers never autofill it — a "company" name got autofilled with real users' details.
  const [trap, setTrap] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const [token, setToken] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const shownAt = useRef(0);
  useEffect(() => {
    shownAt.current = Date.now();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating && !liked.trim() && !improve.trim()) {
      setState({ kind: "error", msg: t.errEmpty });
      return;
    }
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, liked, improve, email, lang, pc_trap: trap, elapsed: Date.now() - shownAt.current, ts: token }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (data.ok) setState({ kind: "ok" });
      else {
        setResetKey((k) => k + 1);
        setState({ kind: "error", msg: data.error === "slow" ? t.errSlow : data.error === "check" ? t.errCheck : t.err });
      }
    } catch {
      setState({ kind: "error", msg: t.err });
    }
  }

  if (state.kind === "ok") {
    return (
      <div className="form-done" role="status">
        <span className="check" aria-hidden="true">✓</span>
        {t.ok}
      </div>
    );
  }

  return (
    <form className="fb" onSubmit={submit} noValidate>
      <fieldset className="rating">
        <legend>{t.rating}</legend>
        <div className="rating-row">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" className={n === rating ? "rate on" : n < rating ? "rate below" : "rate"} aria-pressed={n === rating} onClick={() => setRating(n)}>
              {n}
            </button>
          ))}
        </div>
        <div className="rating-ends" aria-hidden="true">
          <span>{t.ratingLow}</span>
          <span>{t.ratingHigh}</span>
        </div>
      </fieldset>
      <label className="field">
        <span>{t.liked}</span>
        <textarea rows={3} maxLength={2000} value={liked} onChange={(e) => setLiked(e.target.value)} />
      </label>
      <label className="field">
        <span>{t.improve}</span>
        <textarea rows={3} maxLength={2000} value={improve} onChange={(e) => setImprove(e.target.value)} />
      </label>
      <div className="field">
        <label htmlFor="fb-email">{t.email}</label>
        <EmailInput id="fb-email" lang={lang} value={email} onChange={setEmail} />
      </div>
      <Turnstile onToken={setToken} lang={lang} resetKey={resetKey} />
      <input className="hp" type="text" tabIndex={-1} autoComplete="new-password" data-lpignore="true" data-1p-ignore="true" aria-hidden="true" value={trap} onChange={(e) => setTrap(e.target.value)} name="pc_trap_7f3" />
      <button type="submit" className="btn primary" disabled={state.kind === "sending"}>
        {state.kind === "sending" ? t.sending : t.button}
      </button>
      {state.kind === "error" ? (
        <p className="wl-err" role="alert">
          {state.msg}
        </p>
      ) : null}
      <Consent text={t.consent} link={privacyLink} />
    </form>
  );
}

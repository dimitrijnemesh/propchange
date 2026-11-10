"use client";
import { useEffect, useRef, useState } from "react";
import type { Copy, Lang } from "@/lib/copy";
import { FeedbackForm } from "./feedback-form";

/** Opens the feedback panel from anywhere on the page. */
export function openFeedback() {
  window.dispatchEvent(new Event("pc-feedback-open"));
}

/** Floating "Feedback" button (visible from the first second) + a slide-in panel with the form. */
export function FeedbackWidget({ t, label, lang, privacyLink }: { t: Copy["feedback"]; label: string; lang: Lang; privacyLink: string }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("pc-feedback-open", onOpen);
    return () => window.removeEventListener("pc-feedback-open", onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button ref={btnRef} type="button" className={open ? "fbw-btn hide" : "fbw-btn"} onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
          <path d="M8.5 11h.01M12 11h.01M15.5 11h.01" />
        </svg>
        <span>{label}</span>
      </button>

      {open ? (
        <>
          <div className="fbw-backdrop" onClick={() => setOpen(false)} />
          <div ref={panelRef} className="fbw-panel" role="dialog" aria-modal="true" aria-labelledby="fbw-title" tabIndex={-1}>
            <div className="fbw-head">
              <div>
                <p className="eyebrow">{t.eyebrow}</p>
                <h2 id="fbw-title">{t.title}</h2>
                <p className="fbw-sub">{t.sub}</p>
              </div>
              <button type="button" className="fbw-close" aria-label="Close" onClick={() => setOpen(false)}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            <FeedbackForm t={t} lang={lang} privacyLink={privacyLink} />
          </div>
        </>
      ) : null}
    </>
  );
}

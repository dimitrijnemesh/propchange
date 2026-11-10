"use client";
import { useEffect, useId, useRef, useState } from "react";
import { LANGS, type Lang } from "@/lib/copy";

/** Custom language dropdown (no native <select>): globe + code button, panel with native names. */
export function LangMenu({ lang, onChange, label }: { lang: Lang; onChange: (l: Lang) => void; label: string }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();
  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  useEffect(() => {
    if (open) itemRefs.current[active]?.focus();
  }, [open, active]);

  function openMenu() {
    setActive(Math.max(0, LANGS.findIndex((l) => l.code === lang)));
    setOpen(true);
  }

  function choose(code: Lang) {
    onChange(code);
    setOpen(false);
    btnRef.current?.focus();
  }

  function onMenuKey(e: React.KeyboardEvent) {
    const n = LANGS.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % n);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + n) % n);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(n - 1);
    } else if (e.key === "Escape" || e.key === "Tab") {
      setOpen(false);
      if (e.key === "Escape") btnRef.current?.focus();
    }
  }

  return (
    <div className="langm" ref={rootRef}>
      <button
        ref={btnRef}
        type="button"
        className={open ? "langm-btn open" : "langm-btn"}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`${label}: ${current.label}`}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            openMenu();
          }
        }}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
        </svg>
        <span className="langm-code">{current.short}</span>
        <svg className="langm-chev" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open ? (
        <div className="langm-menu" id={menuId} role="menu" aria-label={label} onKeyDown={onMenuKey}>
          <div className="langm-title">{label}</div>
          <div className="langm-grid">
            {LANGS.map((l, i) => (
              <button
                key={l.code}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                type="button"
                role="menuitemradio"
                aria-checked={l.code === lang}
                tabIndex={i === active ? 0 : -1}
                className={l.code === lang ? "langm-item on" : "langm-item"}
                lang={l.code}
                onClick={() => choose(l.code)}
                onMouseEnter={() => setActive(i)}
              >
                <span className="langm-name">{l.label}</span>
                {l.code === lang ? (
                  <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m5 12 5 5 9-10" />
                  </svg>
                ) : (
                  <span className="langm-short">{l.short}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

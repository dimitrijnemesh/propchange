"use client";
import { useId, useMemo, useState } from "react";
import type { Lang } from "@/lib/copy";

const COMMON = ["gmail.com", "outlook.com", "icloud.com", "yahoo.com", "hotmail.com", "proton.me", "live.com", "aol.com", "mail.com", "gmx.com", "googlemail.com", "protonmail.com", "me.com"];
const LOCAL: Partial<Record<Lang, string[]>> = {
  uk: ["ukr.net", "i.ua", "meta.ua"],
  de: ["gmx.de", "web.de", "t-online.de"],
  fr: ["orange.fr", "free.fr", "laposte.net"],
  it: ["libero.it", "virgilio.it"],
  pl: ["wp.pl", "o2.pl", "onet.pl", "interia.pl"],
  es: ["yahoo.es", "hotmail.es"],
  pt: ["uol.com.br", "bol.com.br"],
  tr: ["yandex.com.tr", "hotmail.com.tr"],
  zh: ["qq.com", "163.com", "126.com"],
  ja: ["yahoo.co.jp", "docomo.ne.jp"],
  ko: ["naver.com", "daum.net", "kakao.com"],
  hi: ["rediffmail.com", "yahoo.co.in"],
};

function domainsFor(lang: Lang) {
  const local = LOCAL[lang] ?? [];
  // gmail first everywhere, then local providers, then the rest
  return [...new Set(["gmail.com", ...local, ...COMMON])];
}

/** Email field with domain autocomplete: dropdown after "@" + inline ghost completion (Tab / → to accept). */
export function EmailInput({
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  invalid,
  lang,
  className,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  invalid?: boolean;
  lang: Lang;
  className?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(0);
  const [dismissed, setDismissed] = useState("");
  const listId = useId();

  const suggestions = useMemo(() => {
    const at = value.indexOf("@");
    if (at < 1 || value.indexOf("@", at + 1) !== -1 || /\s/.test(value)) return [];
    const local = value.slice(0, at);
    const typed = value.slice(at + 1).toLowerCase();
    return domainsFor(lang)
      .filter((d) => d.startsWith(typed) && d !== typed)
      .slice(0, 5)
      .map((d) => `${local}@${d}`);
  }, [value, lang]);

  const open = focused && suggestions.length > 0 && dismissed !== value;
  const idx = Math.min(active, suggestions.length - 1);
  const ghost = open && suggestions[idx]?.toLowerCase().startsWith(value.toLowerCase()) ? suggestions[idx].slice(value.length) : "";

  function accept(s: string) {
    onChange(s);
    setDismissed(s);
    setActive(0);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    const atEnd = e.currentTarget.selectionStart === value.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if ((e.key === "Tab" && !e.shiftKey) || (e.key === "ArrowRight" && atEnd) || e.key === "Enter") {
      e.preventDefault();
      accept(suggestions[idx]);
    } else if (e.key === "Escape") {
      setDismissed(value);
    }
  }

  return (
    <div className={`email-ac ${className ?? ""}`}>
      <div className="email-ghost" aria-hidden="true">
        <span className="email-ghost-typed">{value}</span>
        <span className="email-ghost-rest">{ghost}</span>
      </div>
      <input
        id={id}
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="off"
        spellCheck={false}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setActive(0);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
        onKeyDown={onKeyDown}
        aria-invalid={invalid}
        role="combobox"
        aria-autocomplete="both"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${idx}` : undefined}
        maxLength={200}
        required
      />
      {open ? (
        <ul className="email-list" id={listId} role="listbox">
          {suggestions.map((s, i) => {
            const at = s.indexOf("@");
            return (
              <li
                key={s}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === idx}
                className={i === idx ? "on" : ""}
                // mousedown (not click) so the input keeps focus and blur doesn't close the list first
                onMouseDown={(e) => {
                  e.preventDefault();
                  accept(s);
                }}
                onMouseEnter={() => setActive(i)}
              >
                <span className="email-local">{s.slice(0, at)}</span>
                <b>{s.slice(at)}</b>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

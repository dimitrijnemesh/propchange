"use client";
import { useEffect, useState } from "react";
import { CONTACT_EMAIL, PRIVACY_UPDATED, privacy } from "@/lib/privacy";
import { Mark } from "./mark";

export function PrivacyContent() {
  const [lang, setLang] = useState<"en" | "uk">("en");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pc_lang") || navigator.language.toLowerCase().split("-")[0];
      if (saved === "uk") setLang("uk");
    } catch {}
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = privacy[lang];
  const date = new Date(PRIVACY_UPDATED).toLocaleDateString(lang === "uk" ? "uk-UA" : "en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <header className="top">
        <div className="wrap top-in">
          <a href="/" className="brand" aria-label="PropChange home">
            <Mark size={18} />
            <span>PropChange</span>
          </a>
          <div className="top-actions">
            <div className="pp-lang" role="group" aria-label="Language">
              <button type="button" className={lang === "en" ? "on" : ""} aria-pressed={lang === "en"} onClick={() => setLang("en")}>
                EN
              </button>
              <button type="button" className={lang === "uk" ? "on" : ""} aria-pressed={lang === "uk"} onClick={() => setLang("uk")}>
                UA
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="wrap narrow pp">
        <a href="/" className="pp-back">
          ← {t.back}
        </a>
        <h1>{t.title}</h1>
        <p className="pp-date">
          {t.updated}: {date}
        </p>
        <p className="lead">{t.intro}</p>
        {t.sections.map((s, i) => (
          <section key={i}>
            {s.h ? <h2>{s.h}</h2> : null}
            {s.p?.map((x) => <p key={x}>{x}</p>)}
            {s.list ? (
              <ul>
                {s.list.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            ) : null}
            {s.after?.map((x) => <p key={x}>{x}</p>)}
            {i === t.sections.length - 1 ? <p className="pp-contact">{t.contactLine(CONTACT_EMAIL)}</p> : null}
          </section>
        ))}
      </main>
      <footer className="foot">
        <div className="wrap">
          <p className="disc">© {new Date().getFullYear()} PropChange</p>
        </div>
      </footer>
    </>
  );
}

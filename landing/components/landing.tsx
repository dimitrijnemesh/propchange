"use client";
import { useEffect, useState } from "react";
import { copy, isLang, PROTOTYPE_URL, type Lang } from "@/lib/copy";
import { FeedbackWidget, openFeedback } from "./feedback-widget";
import { IntroSplash } from "./intro-splash";
import { LangMenu } from "./lang-menu";
import { Mark } from "./mark";
import { WaitlistForm } from "./waitlist-form";

const X_URL = "https://x.com/propchange_io";
const IG_URL = "https://www.instagram.com/propchange.io";

function Concept({ t }: { t: (typeof copy)["en"]["concept"] }) {
  return (
    <div className="concept" aria-hidden="true">
      <div className="node">
        <div className="avatar big">
          <span className="head" />
          <span className="body" />
        </div>
        <span>{t.trader}</span>
      </div>
      <div className="arrow">
        <small>{t.tokenized}</small>
        <i />
      </div>
      <div className="node">
        <div className="token">
          <small>{t.token}</small>
          <div className="seats">
            {Array.from({ length: 10 }, (_, i) => (
              <b key={i} className={i < 7 ? "taken" : ""} />
            ))}
          </div>
        </div>
        <span>{t.seats}</span>
      </div>
      <div className="arrow">
        <small>{t.buy}</small>
        <i />
      </div>
      <div className="node">
        <div className="users">
          {[0, 1, 2].map((i) => (
            <div key={i} className="avatar">
              <span className="head" />
              <span className="body" />
            </div>
          ))}
        </div>
        <span>{t.users}</span>
      </div>
      <div className="outcomes">
        <span className="pill kept">✓ {t.kept}</span>
        <span className="pill broken">✕ {t.broken}</span>
      </div>
    </div>
  );
}

export function Landing() {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pc_lang");
      if (isLang(saved)) setLang(saved);
      else {
        const nav = navigator.language.toLowerCase().split("-")[0];
        if (isLang(nav)) setLang(nav);
      }
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem("pc_lang", lang);
    } catch {}
  }, [lang]);

  const t = copy[lang];

  return (
    <>
      <IntroSplash powered="Powered by Solana" />
      <header className="top">
        <div className="wrap top-in">
          <a href="#" className="brand" aria-label="PropChange home" data-intro-target="">
            <Mark size={18} />
            <span>PropChange</span>
          </a>
          <nav className="links" aria-label="Main">
            <a href="#how">{t.nav.how}</a>
            <a href="#why">{t.nav.why}</a>
            <a href="#faq">{t.nav.faq}</a>
            <button type="button" className="link-btn" onClick={openFeedback}>
              {t.nav.feedback}
            </button>
          </nav>
          <div className="top-actions">
            <LangMenu lang={lang} onChange={setLang} label={t.nav.language} />
            <a href={PROTOTYPE_URL} target="_blank" rel="noopener noreferrer" className="btn ghost sm proto-btn">
              {t.nav.proto} ↗
            </a>
            <a href="#join" className="btn primary sm">
              {t.nav.join}
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" id="join">
          <div className="wrap hero-in">
            <div className="hero-copy">
              <p className="eyebrow">
                <span className="dot" />
                {t.hero.eyebrow}
              </p>
              <h1>
                {t.hero.title1}
                <br />
                <span className="accent">{t.hero.title2}</span>
              </h1>
              <p className="lead">{t.hero.sub}</p>
              <WaitlistForm t={t.form} lang={lang} source="hero" id="hero" privacyLink={t.footer.privacy} />
              <p className="note">
                {t.hero.note}{" "}
                <a href={PROTOTYPE_URL} target="_blank" rel="noopener noreferrer" className="inline-link">
                  {t.hero.proto}
                </a>
              </p>
            </div>
            <Concept t={t.concept} />
          </div>
        </section>

        <section className="sec" id="problem">
          <div className="wrap">
            <p className="eyebrow">{t.problem.eyebrow}</p>
            <h2>{t.problem.title}</h2>
            <div className="problem">
              <div className="stat">
                <strong>{t.problem.stat}</strong>
                <p>{t.problem.statText}</p>
                <small>{t.problem.statSrc}</small>
              </div>
              <ul className="xlist">
                {t.problem.items.map(([h, d]) => (
                  <li key={h}>
                    <span className="x" aria-hidden="true">
                      ✕
                    </span>
                    <div>
                      <b>{h}</b>
                      <span>{d}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="sec alt" id="how">
          <div className="wrap">
            <p className="eyebrow">{t.how.eyebrow}</p>
            <h2>{t.how.title}</h2>
            <ol className="steps">
              {t.how.steps.map(([h, d], i) => (
                <li key={h} className={i === 1 ? "hl" : ""}>
                  <span className="n">0{i + 1}</span>
                  <b>{h}</b>
                  <p>{d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="sec" id="why">
          <div className="wrap">
            <p className="eyebrow">{t.why.eyebrow}</p>
            <h2>{t.why.title}</h2>
            <div className="grid3">
              {t.why.items.map(([h, d], i) => (
                <div key={h} className={i === 0 || i === 2 ? "card hl" : "card"}>
                  <span className="n">0{i + 1}</span>
                  <b>{h}</b>
                  <p>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sec alt">
          <div className="wrap">
            <p className="eyebrow">{t.winwin.eyebrow}</p>
            <h2>{t.winwin.title}</h2>
            <div className="grid2">
              {[t.winwin.users, t.winwin.traders].map(([h, d]) => (
                <div key={h} className="card">
                  <b>{h}</b>
                  <p>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sec" id="prototype">
          <div className="wrap">
            <div className="proto">
              <div>
                <p className="eyebrow">{t.proto.eyebrow}</p>
                <h2>{t.proto.title}</h2>
                <p className="lead">{t.proto.text}</p>
                <div className="proto-actions">
                  <a href={PROTOTYPE_URL} target="_blank" rel="noopener noreferrer" className="btn primary">
                    {t.proto.open} ↗
                  </a>
                  <button type="button" className="btn outline" onClick={openFeedback}>
                    {t.proto.give}
                  </button>
                </div>
              </div>
              <a href={PROTOTYPE_URL} target="_blank" rel="noopener noreferrer" className="proto-shot" aria-label={t.proto.open}>
                <img src="/prototype.jpg" alt="" loading="lazy" width={1600} height={1000} />
              </a>
            </div>
          </div>
        </section>

        <section className="sec">
          <div className="wrap">
            <div className="soon">
              <div>
                <p className="eyebrow">{t.soon.eyebrow}</p>
                <h2>{t.soon.title}</h2>
                <p className="lead">{t.soon.text}</p>
              </div>
              <Mark size={120} className="soon-mark" />
            </div>
          </div>
        </section>

        <section className="sec alt" id="faq">
          <div className="wrap narrow">
            <h2>{t.faq.title}</h2>
            <div className="faq">
              {t.faq.items.map(([q, a]) => (
                <details key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="sec final">
          <div className="wrap narrow center">
            <h2>{t.final.title}</h2>
            <p className="lead">{t.final.sub}</p>
            <WaitlistForm t={t.form} lang={lang} source="footer" id="final" privacyLink={t.footer.privacy} />
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap foot-in">
          <div className="brand">
            <Mark size={18} />
            <span>PropChange</span>
          </div>
          <div className="social">
            <a href={X_URL} target="_blank" rel="noopener noreferrer" aria-label="PropChange on X">
              X · @propchange_io
            </a>
            <a href={IG_URL} target="_blank" rel="noopener noreferrer" aria-label="PropChange on Instagram">
              Instagram · @propchange.io
            </a>
          </div>
        </div>
        <div className="wrap">
          <p className="disc">{t.footer.disclaimer}</p>
          <p className="disc">
            © {new Date().getFullYear()} PropChange. {t.footer.rights} ·{" "}
            <a href="/privacy" className="foot-link">
              {t.footer.privacyTitle}
            </a>
          </p>
        </div>
      </footer>
      <FeedbackWidget t={t.feedback} label={t.nav.feedback} lang={lang} privacyLink={t.footer.privacy} />
    </>
  );
}

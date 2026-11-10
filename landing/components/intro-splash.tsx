"use client";
import { useEffect, useRef, useState } from "react";
import { MARK_VIEWBOX, PATHS } from "./mark";

/**
 * Intro (same as the prototype): frosted overlay → the logo is "painted" (strokes draw, then fill)
 * → the overlay fades while the logo flies into the header logo ([data-intro-target]).
 * The painting is pure CSS and starts on first paint; JS only runs the flight.
 * Skipped for reduced motion (inline script in app/layout.tsx). Click or press a key to skip.
 */

const ORDER = [1, 2, 0]; // paint order: the "P" stem, the small swoosh, then the round "o"
const PAINT_MS = 2250;
const FLY_MS = 800;

export function IntroSplash({ powered }: { powered: string }) {
  const [gone, setGone] = useState(false);
  const bgRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const poweredRef = useRef<HTMLDivElement>(null);
  const flying = useRef(false);

  useEffect(() => {
    const html = document.documentElement;
    if (html.classList.contains("intro-done")) {
      setGone(true);
      return;
    }
    const logo = logoRef.current!;
    const finish = () => {
      html.classList.add("intro-done");
      setGone(true);
    };

    const fly = () => {
      if (flying.current) return;
      flying.current = true;
      logo.classList.add("intro-painted");
      const target = document.querySelector<HTMLElement>("[data-intro-target]")?.getBoundingClientRect();
      const r = logo.getBoundingClientRect();
      let end = "translate(0px, 0px) scale(1)";
      if (target) {
        const s = target.width / r.width;
        const dx = target.left - r.left;
        const dy = target.top + (target.height - r.height * s) / 2 - r.top;
        end = `translate(${dx}px, ${dy}px) scale(${s})`;
      }
      logo.animate([{ transform: "translate(0px, 0px) scale(1)" }, target ? { transform: end } : { transform: "scale(0.9)", opacity: 0 }], {
        duration: FLY_MS,
        easing: "cubic-bezier(0.65, 0, 0.35, 1)",
        fill: "forwards",
      });
      poweredRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FLY_MS * 0.35, easing: "ease-out", fill: "forwards" });
      bgRef.current!
        .animate([{ opacity: 1 }, { opacity: 0 }], { duration: FLY_MS * 0.75, delay: FLY_MS * 0.15, easing: "ease-out", fill: "forwards" })
        .finished.then(() => setTimeout(finish, FLY_MS * 0.15))
        .catch(finish);
    };

    // The painting may have started before hydration — fly once it has finished.
    const now = performance.now();
    const started = Math.min(now, ...logo.getAnimations({ subtree: true }).map((a) => (typeof a.startTime === "number" ? a.startTime : now)));
    const timer = setTimeout(fly, Math.max(250, started + PAINT_MS - now));
    const skip = () => {
      clearTimeout(timer);
      fly();
    };
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("pc-intro-skip", skip, { once: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pc-intro-skip", skip);
    };
  }, []);

  if (gone) return null;

  return (
    <div id="pc-intro" aria-hidden="true" onClick={() => window.dispatchEvent(new Event("pc-intro-skip"))}>
      <div ref={bgRef} className="intro-bg" />
      {/* Same proportions as the header logo (19px text, 18px mark, 8px gap), scaled via font-size. */}
      <div ref={logoRef} className="intro-logo">
        <svg viewBox={MARK_VIEWBOX} fill="none" className="intro-mark">
          {ORDER.map((i, k) => (
            <path key={i} d={PATHS[i]} pathLength={1} className="intro-stroke" style={{ animationDelay: `${150 + k * 220}ms, ${1050 + k * 120}ms` }} />
          ))}
        </svg>
        <span className="intro-text">
          <span className="intro-prop">Prop</span>Change
        </span>
      </div>
      <div ref={poweredRef} className="intro-powered">
        <span className="sol-mark" aria-hidden="true" />
        {powered}
      </div>
    </div>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
import { SolanaBadge } from "@/components/common/solana-mark";
import { MARK_PATHS, MARK_VIEWBOX } from "./mark-paths";

/**
 * Intro: frosted-glass overlay (the page shows through, blurred) → the logo is "painted" (strokes draw, then fill) → the blue
 * fades away while the logo flies into its place in the navbar ([data-intro-target]).
 *
 * The painting is pure CSS and starts on first paint (no wait for hydration); JS only measures
 * the navbar logo and runs the flight. Plays on every full page load (not on in-app navigation,
 * since the root layout stays mounted) and is skipped for reduced motion (see the inline script
 * in app/layout.tsx). Click or press a key to skip.
 */

// Paint order left → right: the "P" stem, the small swoosh, then the round "o".
const ORDER = [1, 2, 0];
const PAINT_MS = 2250; // paint (~2s) + a short hold so "Powered by Solana" can be read
const FLY_MS = 800;

export function IntroSplash() {
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
      // FLIP: from the centered splash logo to the navbar logo's box.
      const target = document.querySelector<HTMLElement>("[data-intro-target]")?.getBoundingClientRect();
      const r = logo.getBoundingClientRect();
      let end = "translate(0px, 0px) scale(1)";
      if (target) {
        const s = target.width / r.width;
        const dx = target.left - r.left;
        const dy = target.top + (target.height - r.height * s) / 2 - r.top;
        end = `translate(${dx}px, ${dy}px) scale(${s})`;
      }
      logo.animate(
        [{ transform: "translate(0px, 0px) scale(1)" }, target ? { transform: end } : { transform: "scale(0.9)", opacity: 0 }],
        { duration: FLY_MS, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" },
      );
      // the "Powered by Solana" line stays put and fades out as the logo leaves
      poweredRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FLY_MS * 0.35, easing: "ease-out", fill: "forwards" });
      bgRef.current!
        .animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: FLY_MS * 0.75,
          delay: FLY_MS * 0.15,
          easing: "ease-out",
          fill: "forwards",
        })
        .finished.then(() => setTimeout(finish, FLY_MS * 0.15))
        .catch(finish);
    };

    // The painting is CSS and may have started before hydration — fly once it has finished.
    const now = performance.now();
    const started = Math.min(
      now,
      ...logo.getAnimations({ subtree: true }).map((a) => (typeof a.startTime === "number" ? a.startTime : now)),
    );
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
    <div
      id="pc-intro"
      aria-hidden
      className="fixed inset-0 z-[100] flex cursor-pointer items-center justify-center"
      onClick={() => window.dispatchEvent(new Event("pc-intro-skip"))}
    >
      <div ref={bgRef} className="intro-bg absolute inset-0" />
      {/* Same proportions as the navbar logo (20px text, 19px mark, 8px gap), scaled via font-size. */}
      <div
        ref={logoRef}
        className="relative flex items-center gap-[0.4em]"
        style={{ fontSize: "clamp(36px, 10.5vw, 68px)", transformOrigin: "0 0" }}
      >
        <svg viewBox={MARK_VIEWBOX} fill="none" className="h-[0.95em] w-[1.5em] shrink-0 overflow-visible">
          {ORDER.map((i, k) => (
            <path
              key={i}
              d={MARK_PATHS[i]}
              pathLength={1}
              className="intro-stroke"
              style={{ animationDelay: `${150 + k * 220}ms, ${1050 + k * 120}ms` }}
            />
          ))}
        </svg>
        <span className="intro-text font-display font-medium leading-none tracking-[-0.01em]">
          <span className="intro-prop">Prop</span>Change
        </span>
      </div>
      <div ref={poweredRef} className="intro-powered absolute left-1/2 top-[calc(50%+clamp(44px,9vw,76px))] -translate-x-1/2">
        <SolanaBadge className="text-[13px] tracking-wide" />
      </div>
    </div>
  );
}

"use client";
import { useEffect } from "react";

/**
 * Scroll reveal for every `[data-reveal]` element: they start hidden (only once JS runs, so content is never lost
 * without it) and fade/rise in when they come into view. `data-reveal="2"` staggers by 2×90ms.
 * Uses a plain scroll check rather than IntersectionObserver so it also works in embedded/throttled browsers.
 */
export function ScrollReveal() {
  useEffect(() => {
    let pending = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
    pending.forEach((el) => {
      const step = Number(el.dataset.reveal) || 0;
      if (step) el.style.setProperty("--reveal-delay", `${step * 90}ms`);
    });
    document.documentElement.classList.add("reveal-on");

    let ticking = false;
    const check = () => {
      ticking = false;
      const limit = window.innerHeight * 0.92;
      pending = pending.filter((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < limit && r.bottom > 0) {
          el.dataset.revealed = "";
          return false;
        }
        // anything already scrolled past (e.g. after a jump) is shown too
        if (r.bottom <= 0) {
          el.dataset.revealed = "";
          return false;
        }
        return true;
      });
      if (!pending.length) stop();
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        setTimeout(check, 50);
      }
    };
    const stop = () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    check();
    return () => {
      stop();
      document.documentElement.classList.remove("reveal-on");
    };
  }, []);
  return null;
}

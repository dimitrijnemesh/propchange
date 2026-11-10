"use client";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Interactive running ticker band.
 * - Drifts left at a base speed; page scrolling boosts the speed, scrolling up reverses direction.
 * - Hover eases it down to a crawl and highlights the hovered word.
 * - Drag (mouse or touch) to scrub it; releasing keeps the throw's momentum, which then decays.
 * - Stars spin and a light sheen sweeps across. Static under prefers-reduced-motion.
 * Screen readers get the text once.
 */

const BASE_SPEED = 55; // px per second
const HOVER_FACTOR = 0.18;

export function Marquee({ items, className, bare }: { items: string[]; className?: string; bare?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = rootRef.current!;
    const rail = railRef.current!;
    const track = trackRef.current!;

    let width = track.offsetWidth;
    let x = 0; // current offset in px (0..width)
    let dir = 1; // 1 = moving left, -1 = moving right
    let hover = 1; // eased speed multiplier for hover
    let hovered = false;
    let boost = 0; // extra px/s from scrolling or a drag throw
    let dragging = false;
    let lastPointerX = 0;
    let dragVelocity = 0;
    let lastScrollY = window.scrollY;
    let last = performance.now();
    let raf = 0;

    const onResize = () => (width = track.offsetWidth);
    const onScroll = () => {
      const dy = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      if (dy !== 0) dir = dy > 0 ? 1 : -1;
      boost = Math.min(900, boost + Math.abs(dy) * 6);
    };
    const onEnter = () => (hovered = true);
    const onLeave = () => (hovered = false);
    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastPointerX = e.clientX;
      dragVelocity = 0;
      try {
        root.setPointerCapture(e.pointerId);
      } catch {}
      root.classList.add("is-dragging");
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastPointerX;
      lastPointerX = e.clientX;
      x -= dx;
      dragVelocity = -dx * 60; // px per second, roughly
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      try {
        root.releasePointerCapture(e.pointerId);
      } catch {}
      root.classList.remove("is-dragging");
      // Throw: carry the drag's momentum in its direction.
      if (Math.abs(dragVelocity) > 30) {
        dir = dragVelocity > 0 ? 1 : -1;
        boost = Math.min(1600, Math.abs(dragVelocity));
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      hover += ((hovered && !dragging ? HOVER_FACTOR : 1) - hover) * Math.min(1, dt * 6);
      boost *= Math.pow(0.04, dt); // decays to ~4% per second
      if (!dragging) x += dir * (BASE_SPEED * hover + boost) * dt;
      if (width > 0) x = ((x % width) + width) % width;
      rail.style.transform = `translate3d(${-x}px, 0, 0)`;
      // only touch the custom property when it actually changes (each write restyles the subtree)
      const energy = Math.round(Math.min(1, boost / 600) * 50) / 50;
      if (energy !== lastEnergy) {
        lastEnergy = energy;
        root.style.setProperty("--marquee-energy", String(energy));
      }
      raf = visible ? requestAnimationFrame(tick) : 0;
    };

    // pause entirely while scrolled off-screen
    let lastEnergy = -1;
    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      const was = visible;
      visible = entry.isIntersecting;
      if (visible && !was) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    });
    io.observe(root);

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerup", onUp);
    root.addEventListener("pointercancel", onUp);
    raf = requestAnimationFrame(tick);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onUp);
    };
  }, []);

  // Repeat enough times that one track is wider than any screen.
  const run = Array.from({ length: 6 }, () => items).flat();
  const renderTrack = (ref?: React.Ref<HTMLUListElement>) => (
    <ul ref={ref} className="flex shrink-0 items-center">
      {run.map((t, i) => (
        <li key={i} className="flex items-center whitespace-nowrap">
          <span className="marquee-word mx-2 rounded-full px-3 py-px transition-colors duration-200">{t}</span>
          <Star />
        </li>
      ))}
    </ul>
  );

  return (
    <div
      ref={rootRef}
      className={cn(
        bare && "marquee-bare",
        "marquee group relative flex cursor-grab touch-pan-y select-none overflow-hidden border-y border-white/10 py-[5px] font-display text-[11px] font-medium uppercase leading-4 tracking-[0.16em] text-white md:text-[12px]",
        className,
      )}
    >
      <span className="sr-only">{items.join(" · ")}</span>
      <div ref={railRef} className="flex will-change-transform" aria-hidden>
        {renderTrack(trackRef)}
        {renderTrack()}
      </div>
    </div>
  );
}

function Star() {
  return (
    <svg viewBox="0 0 12 12" className="marquee-star size-2 shrink-0 text-white/70" aria-hidden>
      <path d="M6 0l1.3 4.7L12 6 7.3 7.3 6 12 4.7 7.3 0 6l4.7-1.3z" fill="currentColor" />
    </svg>
  );
}

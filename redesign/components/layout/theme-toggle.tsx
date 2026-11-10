"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

/**
 * Light/dark switch. Dark is the default; the choice made here is remembered. The new theme is revealed as a circle growing from the switch
 * (View Transitions API), with an instant fallback.
 */
export function ThemeToggle({ className, onBlue }: { className?: string; onBlue?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => setMounted(true), []);
  useEffect(() => setOptimistic(null), [resolvedTheme]);
  const dark = optimistic ?? (mounted ? resolvedTheme === "dark" : true);

  const toggle = () => {
    const next = dark ? "light" : "dark";
    setOptimistic(next === "dark");
    const apply = () => {
      const html = document.documentElement;
      html.classList.toggle("dark", next === "dark");
      html.classList.toggle("light", next === "light");
      html.style.colorScheme = next;
      setTheme(next);
    };
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!doc.startViewTransition || reduced || !btn.current) return apply();

    // Let the thumb start sliding, then reveal the new theme from the switch outward.
    const r = btn.current.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    // Safety net: if the browser stalls the transition (e.g. background tab), switch anyway.
    let applied = false;
    const run = () => {
      if (applied) return;
      applied = true;
      apply();
    };
    const vt = doc.startViewTransition(run);
    setTimeout(run, 250);
    vt.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 600, easing: EASE, pseudoElement: "::view-transition-new(root)" },
        );
      })
      .catch(() => {});
  };

  return (
    <button
      ref={btn}
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      className={cn(
        "relative inline-flex h-8 w-[58px] shrink-0 items-center rounded-full p-1 transition-colors duration-300",
        onBlue
          ? dark
            ? "bg-white/30 hover:bg-white/35"
            : "bg-bg-muted hover:bg-border"
          : dark
            ? "bg-primary/25 hover:bg-primary/30"
            : "bg-bg-muted hover:bg-border",
        className,
      )}
    >
      {/* track icons fade toward the side the thumb leaves */}
      <Sun
        aria-hidden
        className={cn(
          "absolute left-[9px] size-3.5 transition-opacity duration-300",
          onBlue && dark ? "text-white" : "text-tertiary",
          dark ? "opacity-70" : "opacity-0",
        )}
        strokeWidth={2}
      />
      <Moon
        aria-hidden
        className={cn(
          "absolute right-[9px] size-3.5 transition-opacity duration-300",
          onBlue && dark ? "text-white" : "text-tertiary",
          dark ? "opacity-0" : "opacity-70",
        )}
        strokeWidth={2}
      />
      {/* thumb */}
      <span
        aria-hidden
        className={cn(
          "relative z-10 flex size-6 items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(15,23,41,0.25)]",
          !mounted && "opacity-0",
        )}
        style={{
          transform: `translateX(${dark ? 26 : 0}px)`,
          transition: `transform 380ms ${EASE}, opacity 200ms ease-out`,
        }}
      >
        <Sun
          className="absolute size-3.5 text-[#1E53E5]"
          strokeWidth={2.25}
          style={{
            opacity: dark ? 0 : 1,
            transform: `rotate(${dark ? -90 : 0}deg) scale(${dark ? 0.5 : 1})`,
            transition: `opacity 250ms ease-out, transform 380ms ${EASE}`,
          }}
        />
        <Moon
          className="absolute size-3.5 text-[#1E53E5]"
          strokeWidth={2.25}
          style={{
            opacity: dark ? 1 : 0,
            transform: `rotate(${dark ? 0 : 90}deg) scale(${dark ? 1 : 0.5})`,
            transition: `opacity 250ms ease-out, transform 380ms ${EASE}`,
          }}
        />
      </span>
    </button>
  );
}

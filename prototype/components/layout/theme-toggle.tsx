"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Light/dark button: a sun in light mode, a moon in dark mode; clicking swaps them with a small spin.
 * Dark is the default; the choice is remembered by next-themes.
 */
export function ThemeToggle({ className }: { className?: string; onBlue?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  useEffect(() => setMounted(true), []);
  useEffect(() => setOptimistic(null), [resolvedTheme]);
  const dark = optimistic ?? (mounted ? resolvedTheme === "dark" : true);

  const toggle = () => {
    const next = dark ? "light" : "dark";
    setOptimistic(next === "dark");
    const html = document.documentElement;
    html.classList.toggle("dark", next === "dark");
    html.classList.toggle("light", next === "light");
    html.style.colorScheme = next;
    setTheme(next);
  };

  const icon = "absolute size-[18px] transition-all duration-300 ease-out";
  return (
    <button
      type="button"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      className={cn(
        "relative inline-flex size-9 shrink-0 items-center justify-center rounded-full text-text transition-colors hover:bg-bg-muted dark:text-white dark:hover:bg-white/10",
        !mounted && "opacity-0",
        className,
      )}
    >
      <Sun aria-hidden strokeWidth={1.75} className={cn(icon, dark ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100")} />
      <Moon aria-hidden strokeWidth={1.75} className={cn(icon, dark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0")} />
    </button>
  );
}

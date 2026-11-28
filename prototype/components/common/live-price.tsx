"use client";
import { useEffect, useState } from "react";
import { Price } from "@/components/layout/currency";
import { cn } from "@/lib/utils";

/**
 * A price that "ticks" like a real market: irregular pauses (4–14 s), mostly tiny moves with the odd bigger one,
 * and only the text colour flashes green/red for a moment. Demo data only — it stays within ~1.5% of its base.
 */
export function LivePrice({ value, className }: { value: number; className?: string }) {
  const [v, setV] = useState(value);
  const [dir, setDir] = useState<0 | 1 | -1>(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      // irregular rhythm: next tick in 4–14 s
      timer = setTimeout(() => {
        setV((cur) => {
          // ~25% of ticks don't move at all; most moves are tiny, a few are larger
          if (Math.random() < 0.25) return cur;
          const size = Math.random() < 0.15 ? 0.006 : 0.0015;
          const next = Math.round(Math.min(value * 1.015, Math.max(value * 0.985, cur + (Math.random() - 0.5) * 2 * size * value)) * 100) / 100;
          if (next !== cur) setDir(next > cur ? 1 : -1);
          return next;
        });
        tick();
      }, 4000 + Math.random() * 10000);
    };
    tick();
    return () => clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    if (!dir) return;
    const t = setTimeout(() => setDir(0), 900);
    return () => clearTimeout(t);
  }, [v, dir]);

  return <Price value={v} className={cn("transition-colors duration-700", dir === 1 && "text-up", dir === -1 && "text-down", className)} />;
}

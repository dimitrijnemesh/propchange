"use client";
import { Star } from "lucide-react";
import { toggleWatch, useWatchlist } from "@/lib/watchlist";
import { cn } from "@/lib/utils";

/** Favorites star (persisted in localStorage). Sits above the card's stretched link. */
export function WatchStar({ id, name, className, size = 18 }: { id: string; name: string; className?: string; size?: number }) {
  const on = useWatchlist().includes(id);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from Favorites` : `Add ${name} to Favorites`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWatch(id);
      }}
      className={cn("relative z-10 inline-flex size-8 items-center justify-center rounded-md text-tertiary transition-colors hover:bg-bg-muted hover:text-text", className)}
    >
      <Star style={{ width: size, height: size }} className={cn("transition-transform", on && "scale-110 fill-primary text-primary dark:fill-warning dark:text-warning")} strokeWidth={1.75} />
    </button>
  );
}

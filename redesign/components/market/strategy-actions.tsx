"use client";
import { Share2, Star } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function StrategyActions({ name, shareOnly }: { name: string; shareOnly?: boolean }) {
  const [watching, setWatching] = useState(false);
  const toast = useToast();
  return (
    <>
      {shareOnly ? null : (
        <Button
          variant="outline"
          size="sm"
          aria-pressed={watching}
          onClick={() => {
            setWatching((w) => !w);
            toast({
              kind: "info",
              title: watching ? "Removed from watchlist" : "Added to watchlist",
              body: name,
            });
          }}
        >
          <Star className={watching ? "fill-warning text-warning" : ""} strokeWidth={1.75} />
          {watching ? "Watching" : "Watch"}
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          navigator.clipboard?.writeText(window.location.href).catch(() => {});
          toast({ kind: "success", title: "Link copied" });
        }}
      >
        <Share2 strokeWidth={1.75} /> Share
      </Button>
    </>
  );
}

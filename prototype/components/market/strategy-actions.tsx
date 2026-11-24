"use client";
import { Share2, Star } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAuthGate } from "@/components/auth/auth-gate";

export function StrategyActions({ name }: { name: string }) {
  const [watching, setWatching] = useState(false);
  const toast = useToast();
  const gate = useAuthGate("watch strategies", "Your watchlist is saved to your account. It takes a minute and you come straight back here.");
  return (
    <>
      {gate.dialog}
      <Button
        variant="outline"
        size="sm"
        aria-pressed={watching}
        onClick={gate.guard(() => {
          setWatching((w) => !w);
          toast({ kind: "info", title: watching ? "Removed from watchlist" : "Added to watchlist", body: name });
        })}
      >
        <Star className={watching ? "fill-warning text-warning" : ""} strokeWidth={1.75} />
        {watching ? "Watching" : "Watch"}
      </Button>
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

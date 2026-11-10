"use client";
import { Clock, LogOut, RefreshCw } from "lucide-react";
import { SeatIcon } from "@/components/common/seat-icon";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fmtNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SeatEvent, SeatEventType } from "@/mock/community";

type Ev = SeatEvent & { name: string; slug: string };

const META: Record<SeatEventType, { verb: string; I: React.ElementType; tone: string }> = {
  buy: { verb: "bought", I: SeatIcon, tone: "bg-primary-soft text-primary-soft-text" },
  renew: { verb: "renewed", I: RefreshCw, tone: "bg-bg-muted text-secondary" },
  waitlist: { verb: "joined waitlist", I: Clock, tone: "bg-warning-soft text-warning" },
  exit: { verb: "left", I: LogOut, tone: "bg-bg-muted text-tertiary" },
};

function ago(ms: number) {
  const m = Math.round(ms / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

/**
 * Seat activity feed. Simulates a live stream: starts a few events back and reveals newer ones
 * every few seconds with a highlight. Data is mock.
 */
export function LiveFeed({ events, rows = 10 }: { events: Ev[]; rows?: number }) {
  const [offset, setOffset] = useState(6);
  const [fresh, setFresh] = useState<string | null>(null);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return setOffset(0);
    const t = setInterval(() => {
      setOffset((o) => {
        if (o <= 0) return 0;
        setFresh(events[o - 1].id);
        return o - 1;
      });
    }, 3800);
    return () => clearInterval(t);
  }, [events]);
  const now = new Date(events[0].at).getTime() + (offset === 0 ? 60_000 : 0);
  const head = new Date(events[offset].at).getTime();
  const list = events.slice(offset, offset + rows);

  return (
    <ol className="divide-y divide-border" aria-live="polite">
      {list.map((e) => {
        const m = META[e.type];
        // the newest visible event reads as "just now"; others relative to it
        const t = offset > 0 ? head - new Date(e.at).getTime() : now - new Date(e.at).getTime();
        return (
          <li key={e.id} className={cn("flex items-center gap-3 py-2.5", e.id === fresh && "feed-in")}>
            <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", m.tone)}>
              <m.I className="size-4" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1 text-[13px] leading-[18px]">
              <span className="font-mono text-[12px] text-secondary">{e.user}</span> <span className="text-tertiary">{m.verb}</span>{" "}
              {e.type === "buy" || e.type === "renew" ? (
                <span className="text-tertiary">
                  {e.seats} {e.seats === 1 ? "seat" : "seats"} ·{" "}
                </span>
              ) : null}
              <Link href={`/seats/${e.slug}`} className="font-semibold hover:text-primary-text">
                {e.name}
              </Link>
            </div>
            <div className="shrink-0 text-right">
              {e.type === "buy" || e.type === "renew" ? (
                <div className="tnum text-[13px] font-semibold">{fmtNumber(e.priceUsdc)}</div>
              ) : null}
              <div className="text-[11px] text-tertiary">{ago(t)}</div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

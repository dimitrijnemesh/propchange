"use client";
import { Price } from "@/components/layout/currency";
import Link from "next/link";
import { useState } from "react";
import { fmtNumber, fmtPct } from "@/lib/format";
import type { SeatRow } from "@/lib/mock-api";
import { cn } from "@/lib/utils";

function tint(chg: number) {
  const k = Math.min(1, Math.abs(chg) / 0.08);
  const pct = Math.round(6 + k * 34);
  return { background: `color-mix(in srgb, ${chg >= 0 ? "var(--up)" : "var(--down)"} ${pct}%, var(--surface))` };
}

const FIRST = 24;

/** Seat map: equal tiles in a grid, tint = 7-day seat price change. */
export function SeatHeatmap({ rows }: { rows: SeatRow[] }) {
  const [all, setAll] = useState(false);
  const sorted = [...rows].sort((a, b) => b.seatsTraded30d - a.seatsTraded30d);
  const shown = all ? sorted : sorted.slice(0, FIRST);
  return (
    <div>
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {shown.map((r) => (
          <Link
            key={r.id}
            prefetch={false}
            href={`/seats/${r.slug}`}
            title={`${r.name} · ${r.seatsTaken}/${r.seatsTotal} seats`}
            className="flex h-[68px] min-w-0 flex-col justify-between rounded-md p-2.5 transition-opacity hover:opacity-80"
            style={tint(r.seatPrice7dChange)}
          >
            <div className="truncate text-[12px] font-semibold leading-4">{r.name}</div>
            <div className="flex items-end justify-between gap-2">
              <Price value={r.price} digits={0} className="font-mono text-[14px] font-semibold leading-5" />
              <span className={cn("tnum font-mono text-[11.5px] font-semibold", r.seatPrice7dChange >= 0 ? "text-up" : "text-down")}>
                {fmtPct(r.seatPrice7dChange, { sign: true })}
              </span>
            </div>
          </Link>
        ))}
      </div>
      {sorted.length > FIRST ? (
        <button onClick={() => setAll((v) => !v)} className="mt-3 text-[13px] font-semibold text-primary-text hover:underline">
          {all ? "Show less" : `Show all ${sorted.length}`}
        </button>
      ) : null}
    </div>
  );
}

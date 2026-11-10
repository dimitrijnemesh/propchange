"use client";
import Link from "next/link";
import { Tooltip } from "@/components/ui/tooltip";
import { fmtNumber, fmtPct } from "@/lib/format";
import type { SeatRow } from "@/lib/mock-api";

function tint(chg: number) {
  const k = Math.min(1, Math.abs(chg) / 0.08);
  const pct = Math.round(8 + k * 52);
  return { background: `color-mix(in srgb, ${chg >= 0 ? "var(--up)" : "var(--down)"} ${pct}%, var(--surface))` };
}

/** Treemap-style seat map: tile size ∝ √seats, tint = 7-day seat price change. */
export function SeatHeatmap({ rows }: { rows: SeatRow[] }) {
  const sorted = [...rows].sort((a, b) => b.seatsTotal - a.seatsTotal);
  return (
    <div className="flex flex-wrap gap-1.5">
      {sorted.map((r) => {
        const w = Math.sqrt(r.seatsTotal);
        const occ = r.seatsTaken / r.seatsTotal;
        return (
          <Tooltip
            key={r.id}
            asChild
            content={`${r.name} · ${fmtNumber(r.price)} USDC/30d · ${fmtPct(r.seatPrice7dChange, { sign: true })} 7d · ${r.seatsTaken}/${r.seatsTotal} seats`}
          >
            <Link
              href={`/seats/${r.slug}`}
              className="group relative flex min-h-[74px] min-w-[96px] md:min-h-[78px] md:min-w-[112px] flex-col justify-between overflow-hidden rounded-md p-2.5 ring-1 ring-black/5 transition-transform duration-200 hover:z-10 hover:scale-[1.03] hover:shadow-md dark:ring-white/5"
              style={{ ...tint(r.seatPrice7dChange), flex: `${w} 1 min(${Math.round(70 + w * 7)}px, 31%)` }}
            >
              <div className="truncate text-[12px] font-semibold leading-4">{r.name}</div>
              <div className="mt-1 flex items-end justify-between gap-2">
                <span className="tnum text-[15px] font-bold leading-5">{fmtNumber(r.price, 0)}</span>
                <span className={`tnum text-[11px] font-semibold ${r.seatPrice7dChange >= 0 ? "text-up" : "text-down"}`}>
                  {fmtPct(r.seatPrice7dChange, { sign: true })}
                </span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, occ * 100)}%` }} />
              </div>
            </Link>
          </Tooltip>
        );
      })}
    </div>
  );
}

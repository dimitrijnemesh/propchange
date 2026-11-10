import { ChevronRight, Flame, Sparkles, TrendingUp, BarChart3 } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/common";
import { fmtNumber, fmtPct } from "@/lib/format";
import type { SeatRow } from "@/lib/mock-api";
import { cn } from "@/lib/utils";

export interface OverviewBoard {
  key: "hot" | "new" | "gainers" | "volume";
  title: string;
  href: string;
  rows: SeatRow[];
}

const ICON = { hot: Flame, new: Sparkles, gainers: TrendingUp, volume: BarChart3 } as const;

/** Binance-style "Markets overview": four compact boards with the top Seats per category. */
export function MarketOverview({ boards, more, traded }: { boards: OverviewBoard[]; more: string; traded: string }) {
  return (
    <div className="swipe-row grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {boards.map((b) => {
        const Icon = ICON[b.key];
        return (
          <section key={b.key} className="min-w-0 rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-[14px] font-semibold">
                <Icon className="size-4 text-primary-text" strokeWidth={1.75} /> {b.title}
              </h3>
              <Link href={b.href} className="inline-flex items-center text-[12px] font-medium text-tertiary transition-colors hover:text-text">
                {more} <ChevronRight className="size-3.5" />
              </Link>
            </div>
            <ol>
              {b.rows.map((r, i) => (
                <li key={r.id}>
                  <Link
                    href={`/strategies/${r.slug}`}
                    className="-mx-2 flex h-11 items-center gap-2.5 rounded-md px-2 transition-colors hover:bg-bg-subtle"
                  >
                    <span className="tnum w-3 shrink-0 font-mono text-[11px] text-tertiary">{i + 1}</span>
                    <Avatar name={r.traderHandle} size={22} />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">{r.name}</span>
                    <span className="tnum shrink-0 text-right text-[13px]">{fmtNumber(r.price)}</span>
                    {b.key === "volume" ? (
                      <span className="tnum w-[68px] shrink-0 text-right text-[12px] text-secondary" title={traded}>
                        {r.seatsTraded30d}
                      </span>
                    ) : (
                      <span
                        className={cn(
                          "tnum w-[68px] shrink-0 text-right text-[12px] font-semibold",
                          r.seatPrice7dChange >= 0 ? "text-up" : "text-down",
                        )}
                      >
                        {fmtPct(r.seatPrice7dChange, { sign: true })}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}

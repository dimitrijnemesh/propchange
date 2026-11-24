"use client";
import { ArrowUpRight, Clock, Flame, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/common";
import { AreaSpark as Area, ChangePill } from "@/components/common/area-spark";
import { Price } from "@/components/layout/currency";
import type { SeatRow } from "@/lib/mock-api";
import { cn } from "@/lib/utils";
import { Eyebrow } from "./landing-sections";

type ColKey = "trending" | "new" | "gainers";

/**
 * BingX-style market block, kept compact: three trend cards (swipeable on phones) and a ranking of
 * three lists — side by side on desktop, one list with tabs on phones/tablets.
 */
export function SeatTrends({ trends, trending, fresh, gainers }: { trends: SeatRow[]; trending: SeatRow[]; fresh: SeatRow[]; gainers: SeatRow[] }) {
  const [tab, setTab] = useState<ColKey>("trending");
  const cols = [
    { key: "trending" as const, title: "Trending", icon: Flame, iconCls: "bg-[#ff5a5f]/15 text-[#ff5a5f]", rows: trending, href: "/seats", tag: (r: SeatRow) => (r.seatsTaken >= r.seatsTotal ? "Full" : "Popular") },
    { key: "new" as const, title: "New listing", icon: Clock, iconCls: "bg-primary/15 text-primary-text", rows: fresh, href: "/strategies?state=rookie", tag: () => "Rookie" },
    { key: "gainers" as const, title: "Top gainers", icon: TrendingUp, iconCls: "bg-[var(--up)]/15 text-up", rows: gainers, href: "/seats", tag: (r: SeatRow) => `${r.seatsTraded30d} traded` },
  ];
  return (
    <section aria-label="Seat market" className="relative isolate overflow-hidden py-14 md:py-20">
      <div className="container-market">
      <div className="mx-auto max-w-[1140px]">
      <Eyebrow live>Live Seat market</Eyebrow>
      <h2 className="mt-4 text-center text-[28px] font-semibold tracking-[-0.03em] md:text-[40px]">Most wanted Seats</h2>
      <p className="mx-auto mt-4 max-w-[520px] text-center text-[15px] text-secondary md:mt-5 md:text-[16px]">Limited Seats behind verified traders. Prices move with demand.</p>

      {/* trend cards: swipe row on phones, three columns from md */}
      <div className="swipe-row mt-8 sm:grid sm:grid-cols-3 sm:gap-4 md:mt-10 md:gap-6">
        {trends.map((r) => {
          const up = r.seatPrice7dChange >= 0;
          return (
            <Link
              key={r.id}
              prefetch={false}
              href={`/strategies/${r.slug}`}
              className="glow-border relative flex h-[184px] flex-col overflow-hidden rounded-[24px] bg-surface p-5 transition-transform duration-300 hover:-translate-y-1 md:h-[200px]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-[15px] font-semibold">{r.name}</span>
                <Avatar name={r.traderHandle} size={30} className="shrink-0" />
              </div>
              <Price value={r.price} className="mt-3 block font-mono text-[26px] font-medium leading-none tracking-tight" />
              <ChangePill v={r.seatPrice7dChange} className="mt-2 self-start" />
              <Area data={r.priceHistory} up={up} id={`tc-${r.id}`} strokeWidth={2} className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] w-full" />
            </Link>
          );
        })}
      </div>

      {/* ranking: one list with tabs below lg */}
      <div className="mt-6 rounded-[24px] bg-surface p-5 ring-1 ring-border lg:hidden">
        <div className="flex gap-1 rounded-full bg-bg-muted p-1" role="tablist" aria-label="Ranking">
          {cols.map((c) => (
            <button
              key={c.key}
              type="button"
              role="tab"
              aria-selected={tab === c.key}
              onClick={() => setTab(c.key)}
              className={cn("h-8 flex-1 rounded-full text-[13px] font-semibold transition-colors", tab === c.key ? "bg-surface text-text shadow-sm" : "text-tertiary")}
            >
              {c.title}
            </button>
          ))}
        </div>
        {cols
          .filter((c) => c.key === tab)
          .map((c) => (
            <RankList key={c.key} c={c} />
          ))}
      </div>
      {/* ranking: three lists side by side on desktop */}
      <div className="mt-6 hidden gap-6 lg:grid lg:grid-cols-3">
        {cols.map((c) => (
          <div key={c.key} className="flex flex-col rounded-[24px] bg-surface p-5 ring-1 ring-border">
            <h3 className="flex items-center gap-2.5 text-[17px] font-semibold">
              <span className={cn("inline-flex size-8 items-center justify-center rounded-full", c.iconCls)}>
                <c.icon className="size-4" strokeWidth={2} />
              </span>
              {c.title}
            </h3>
            <RankList c={c} />
          </div>
        ))}
      </div>
      </div>
      </div>
    </section>
  );
}

function RankList({ c }: { c: { key: ColKey; rows: SeatRow[]; href: string; tag: (r: SeatRow) => string } }) {
  return (
    <>
      <ol className="mt-2 flex-1">
        {c.rows.map((r) => (
          <li key={r.id} className="border-b border-border last:border-b-0">
            <Link prefetch={false} href={`/strategies/${r.slug}`} className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-bg-subtle">
              <Avatar name={r.traderHandle} size={32} className="shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold">{r.name}</span>
                <span className="mt-0.5 inline-block rounded bg-bg-muted px-1.5 py-px text-[10.5px] text-secondary">{c.tag(r)}</span>
              </span>
              <Area data={r.priceHistory} up={r.seatPrice7dChange >= 0} id={`rk-${c.key}-${r.id}`} className="hidden h-7 w-14 shrink-0 sm:block" />
              <span className="flex shrink-0 flex-col items-end gap-1">
                <Price value={r.price} className="font-mono text-[14px]" />
                <ChangePill v={r.seatPrice7dChange} className="text-[11.5px]" />
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <Link
        prefetch={false}
        href={c.href}
        className="mt-3 inline-flex items-center gap-1.5 self-start border-b border-text pb-0.5 text-[14px] font-medium transition-colors hover:border-primary hover:text-primary-text"
      >
        See all <ArrowUpRight className="size-4" />
      </Link>
    </>
  );
}

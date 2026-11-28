"use client";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/common";
import { AreaSpark, ChangePill } from "@/components/common/area-spark";
import { LivePrice } from "@/components/common/live-price";
import type { SeatRow } from "@/lib/mock-api";

/**
 * Big chart card (BingX "Stocks / TradFi" style): label + avatar, name, a light-weight price, and the area
 * chart in its own row below — it never runs under the price.
 */
function ChartCard({ label, r, delay }: { label: string; r: SeatRow; delay: number }) {
  const up = r.seatPrice7dChange >= 0;
  return (
    <Link
      data-reveal={String(delay)}
      prefetch={false}
      href={`/strategies/${r.slug}`}
      className="lift flex h-full min-h-[260px] flex-col rounded-[28px] bg-surface p-6 ring-1 ring-border md:p-7"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-[19px] font-bold tracking-[-0.02em]">{label}</span>
        <Avatar name={r.traderHandle} size={40} className="shrink-0" />
      </div>
      <span className="mt-1 truncate text-[15px] text-tertiary">{r.name}</span>
      <div className="mt-1 flex items-baseline gap-2.5">
        <LivePrice value={r.price} className="text-[34px] leading-none font-semibold tracking-[-0.025em]" />
        <ChangePill v={r.seatPrice7dChange} className="text-[12px]" />
      </div>
      <div className="mt-5 min-h-[72px] flex-1">
        <AreaSpark data={r.priceHistory} up={up} id={`cc-${r.id}`} strokeWidth={2} className="h-full w-full" />
      </div>
    </Link>
  );
}

/**
 * BingX-style market block, 1:1 layout: big headline on the left, two stacked chart cards in the middle and a
 * "Popular" list on the right (avatar, name + ticker, sparkline, price, solid change pill).
 */
export function SeatTrends({ trends, trending, gainers }: { trends: SeatRow[]; trending: SeatRow[]; fresh: SeatRow[]; gainers: SeatRow[] }) {
  const hot = trends[0];
  const top = gainers[0] ?? trends[1];
  return (
    <section aria-label="Seat market" className="py-16 md:py-24">
      <div className="container-market">
        <div className="mx-auto grid max-w-[1140px] gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-5">
          {/* headline */}
          <div className="flex flex-col lg:pr-4">
            <h2 data-reveal className="text-[44px] font-semibold leading-[0.98] tracking-[-0.03em] md:text-[68px]">
              Most
              <br />
              wanted
              <br />
              Seats
            </h2>
            <p data-reveal="1" className="mt-6 max-w-[360px] text-[17px] leading-7 text-secondary">
              Limited Seats behind verified traders. Prices move with demand — fewer Seats left, higher the price.
            </p>
            <Link
              data-reveal="2"
              href="/seats"
              className="mt-8 inline-flex items-center gap-1.5 self-start border-b border-text pb-1 text-[16px] font-medium transition-colors hover:border-primary hover:text-primary-text lg:mt-auto"
            >
              See details <ArrowUpRight className="size-4" />
            </Link>
          </div>

          {/* two stacked chart cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2 lg:gap-5">
            {hot ? <ChartCard label="Hot Seat" r={hot} delay={1} /> : null}
            {top ? <ChartCard label="Top gainer" r={top} delay={2} /> : null}
          </div>

          {/* popular list */}
          <div data-reveal="3" className="lift flex flex-col rounded-[28px] bg-surface p-6 ring-1 ring-border md:p-8">
            <h3 className="text-[22px] font-bold tracking-[-0.02em]">Popular</h3>
            <ol className="mt-3 flex-1">
              {trending.slice(0, 6).map((r) => (
                <li key={r.id} className="border-b border-border last:border-b-0">
                  <Link prefetch={false} href={`/strategies/${r.slug}`} className="flex items-center gap-3 py-3.5 transition-opacity hover:opacity-80">
                    <Avatar name={r.traderHandle} size={38} className="shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[16px] font-semibold">{r.name}</span>
                      <span className="block truncate text-[12px] uppercase tracking-wide text-tertiary">{r.symbol}</span>
                    </span>
                    <AreaSpark data={r.priceHistory} up={r.seatPrice7dChange >= 0} id={`pp-${r.id}`} className="hidden h-9 w-20 shrink-0 sm:block" />
                    <span className="flex w-[88px] shrink-0 flex-col items-end gap-1">
                      <LivePrice value={r.price} className="text-[17px] font-semibold tracking-[-0.025em]" />
                      <ChangePill v={r.seatPrice7dChange} className="text-[12px]" />
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
            <Link
              href="/seats"
              className="mt-5 inline-flex items-center gap-1.5 self-start border-b border-text pb-1 text-[16px] font-medium transition-colors hover:border-primary hover:text-primary-text"
            >
              See all Seats <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

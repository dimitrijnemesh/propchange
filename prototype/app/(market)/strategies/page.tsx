import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import { Suspense } from "react";
import { EmptyState } from "@/components/common";
import { DismissibleCallout } from "@/components/market/dismissible-callout";
import { FilterBar } from "@/components/market/filter-bar";
import { StrategyCard } from "@/components/market/strategy-card";
import { StrategyTable } from "@/components/market/strategy-table";
import { buttonVariants } from "@/components/ui/button";
import { getStrategies, getStrategiesOverview, type StrategyQuery } from "@/lib/mock-api";
import { getT } from "@/lib/i18n/server";
import { fmtPct } from "@/lib/format";
import { MarketBanner } from "@/components/market/market-banner";
import { Podium } from "@/components/market/podium";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Strategies",
  description: "Browse trading strategies ranked by Seat Contract compliance and risk-adjusted metrics.",
};

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function StrategiesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q: StrategyQuery = {
    q: one(sp.q),
    market: one(sp.market) as StrategyQuery["market"],
    venue: one(sp.venue),
    risk: one(sp.risk),
    minCompliance: Number(one(sp.minCompliance)) || undefined,
    maxDd: Number(one(sp.maxDd)) || undefined,
    avail: one(sp.avail) as StrategyQuery["avail"],
    state: one(sp.state) as StrategyQuery["state"],
    period: (one(sp.period) as StrategyQuery["period"]) ?? "1y",
    style: one(sp.style),
    minHistory: Number(one(sp.minHistory)) || undefined,
    maxPrice: Number(one(sp.maxPrice)) || undefined,
    minSharpe: Number(one(sp.minSharpe)) || undefined,
    profitable: one(sp.profitable) === "1",
    sort: (one(sp.sort) as StrategyQuery["sort"]) ?? "compliance",
    dir: one(sp.dir) as StrategyQuery["dir"],
    page: Number(one(sp.page)) || 1,
  };
  const view = one(sp.view);
  const leaderboard = view === "leaderboard";
  const [res, ov, t] = await Promise.all([getStrategies(q), getStrategiesOverview(), getT()]);
  const filtered = !!(q.q || (q.market && q.market !== "all") || q.venue || q.risk || q.minCompliance || q.maxDd || q.avail || q.state || q.style || q.minHistory || q.maxPrice || q.minSharpe || q.profitable);
  const showPodium = !filtered && (q.sort ?? "compliance") === "compliance" && res.page === 1;

  const table = <StrategyTable rows={res.items} leaderboard={leaderboard} />;
  const cards = (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {res.items.map((s) => (
        <StrategyCard key={s.id} s={s} period={q.period} />
      ))}
    </div>
  );

  return (
    <div className="container-market">
      <div className="pt-6 md:pt-8">
        <MarketBanner
          live={t("live")}
          eyebrow={leaderboard ? t("strat.leaderboard.eyebrow") : t("strat.eyebrow")}
          title={leaderboard ? t("nav.leaderboard") : t("nav.strategies")}
          description={
            leaderboard
              ? "Ranked by Compliance Score (min. 3 settled Epochs), then risk-adjusted return. Raw return never decides the order."
              : t("strat.description")
          }
          actions={
            <Link href="/seats" className={cn(buttonVariants({ size: "md" }), "bg-white text-primary hover:bg-blue-50 active:bg-blue-100")}>
              {t("markets.openSeatMarket")} <ArrowRight />
            </Link>
          }
          stats={[
            { label: t("strat.listed"), value: ov.stats.strategies, sub: `${ov.stats.traders} verified traders · ${ov.stats.rookies} rookies` },
            { label: t("strat.kept"), value: fmtPct(ov.stats.keptRate, { digits: 1 }), sub: `${ov.stats.settled} Epochs, incl. closed` },
            { label: t("strat.medianSharpe"), value: ov.stats.medianSharpe.toFixed(2), sub: "across listed strategies" },
            { label: t("seats.active"), value: ov.stats.seatsActive.toLocaleString("en-US"), sub: "copying right now" },
            { label: t("strat.freeSeats"), value: ov.stats.freeSeats.toLocaleString("en-US"), sub: "available to buy today" },
          ]}
          footer={
            <nav aria-label="Markets" className="scroll-thin flex gap-2 overflow-x-auto px-5 py-3 md:px-8">
              {(
                [
                  ["all", t("strat.allMarkets"), ov.stats.strategies],
                  ["crypto", t("market.crypto"), ov.markets.crypto],
                  ["forex", t("market.forex"), ov.markets.forex],
                  ["stocks", t("market.stocks"), ov.markets.stocks],
                  ["futures", t("market.futures"), ov.markets.futures],
                ] as const
              ).map(([key, label, n]) => {
                const on = (q.market ?? "all") === key;
                return (
                  <Link
                    key={key}
                    href={key === "all" ? "/strategies" : `/strategies?market=${key}`}
                    scroll={false}
                    className={cn(
                      "inline-flex h-8 shrink-0 items-center gap-2 rounded-full px-3.5 text-[13px] font-semibold transition-colors",
                      on ? "bg-white text-primary" : "bg-white/10 text-white hover:bg-white/20",
                    )}
                  >
                    {label}
                    <span className={cn("tnum rounded-full px-1.5 text-[11px]", on ? "bg-primary-soft text-primary-soft-text" : "bg-white/15")}>{n}</span>
                  </Link>
                );
              })}
            </nav>
          }
        />
      </div>
      {showPodium ? (
        <section className="mt-8" aria-label="Top three">
          <h2 className="mb-1 text-caption font-semibold uppercase tracking-[0.12em] text-secondary">{t("strat.top3")}</h2>
          <Podium items={ov.podium} />
        </section>
      ) : null}
      <div className="mt-6" />
      <Suspense>
        <FilterBar total={res.total} />
      </Suspense>
      <div className="mt-5 space-y-4">
        <DismissibleCallout>Sorted by contract compliance by default. Raw return is not a measure of quality.</DismissibleCallout>
        {res.items.length === 0 ? (
          <div className="rounded-lg border border-border">
            <EmptyState
              icon={<SearchX />}
              title="No strategies match"
              body="Try widening the drawdown limit or removing a filter."
              action={
                <Link href="/strategies" className={buttonVariants()}>
                  Reset filters
                </Link>
              }
            />
          </div>
        ) : view === "cards" ? (
          cards
        ) : view === "table" || leaderboard ? (
          <Suspense>{table}</Suspense>
        ) : (
          <>
            <div className="hidden md:block">
              <Suspense>{table}</Suspense>
            </div>
            <div className="md:hidden">{cards}</div>
          </>
        )}
        <nav className="flex items-center justify-between pt-2" aria-label="Pagination">
          <span className="tnum text-caption text-tertiary">
            Page {res.page} of {res.pages} · {res.total} strategies · 20 per page
          </span>
          <div className="flex gap-2">
            <span className={cn(buttonVariants({ variant: "outline", size: "sm" }), res.page <= 1 && "pointer-events-none opacity-50")}>
              <ChevronLeft /> Prev
            </span>
            <span className={cn(buttonVariants({ variant: "outline", size: "sm" }), res.page >= res.pages && "pointer-events-none opacity-50")}>
              Next <ChevronRight />
            </span>
          </div>
        </nav>
      </div>
    </div>
  );
}

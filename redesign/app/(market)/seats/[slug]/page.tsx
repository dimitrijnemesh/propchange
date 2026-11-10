import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { NavChart } from "@/components/analytics/charts";
import { MonteCarlo } from "@/components/analytics/monte-carlo";
import { Avatar } from "@/components/common";
import { VerificationBadge } from "@/components/market/badges";
import { StrategyActions } from "@/components/market/strategy-actions";
import { WatchStar } from "@/components/market/watch-star";
import { RememberSeat } from "@/components/layout/mobile-tab-bar";
import { OnchainCard } from "@/components/seat-market/onchain-card";
import { SeatTrading } from "@/components/seat-market/seat-trading";
import { SeatPanel } from "@/components/seat/buy-seat";
import { Protection, V2ActionPanel } from "@/components/seats/v2-action-panel";
import {
  Analytics,
  CapacityTab,
  ContractTab,
  EpochsTab,
  FollowersTab,
  Overview,
  STRATEGY_TABS,
} from "@/components/seats/strategy-sections";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { LinkTabs } from "@/components/ui/tabs";
import { getEdition } from "@/lib/edition-server";
import { fmtNumber, fmtPct } from "@/lib/format";
import { getAccounts, getAllStrategySlugs, getStrategy, getStrategyCharts, getSeatToken, priceFrom } from "@/lib/mock-api";
import { cn } from "@/lib/utils";

export async function generateStaticParams() {
  return (await getAllStrategySlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getStrategy(slug);
  if (!data) return { title: "Seat not found" };
  const s = data.strategy;
  return {
    title: `${s.name} by ${s.traderHandle} · Seats`,
    description: `${s.compliance.kept}/${s.compliance.settled} Seat Contracts kept · max drawdown ${fmtPct(s.metrics.maxDrawdown)} · ${s.seatsTaken}/${s.seatsTotal} Seats taken.`,
  };
}

/** Binance-style trading screen for one strategy's Seats (v2 Platform or v3 Seat Market). */
export default async function SeatPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string; action?: string }>;
}) {
  const [{ slug }, { tab: tabParam, action }, edition] = await Promise.all([params, searchParams, getEdition()]);
  const [data, charts, accounts, seat] = await Promise.all([getStrategy(slug), getStrategyCharts(slug).catch(() => null), getAccounts(), getSeatToken(slug)]);
  if (!data || !charts) notFound();
  const { strategy: s, trader } = data;
  const token = seat?.token ?? null;
  const owned = seat?.owned ?? 0;
  const market = edition === "v3" && token;

  const tabs = [...STRATEGY_TABS, ...(market ? [{ key: "onchain", label: "On-chain" }] : [])];
  const tab = tabs.some((t) => t.key === tabParam) ? tabParam! : "overview";
  const m = s.metrics;
  const short = m.historyDays < 365;
  const running = s.epochs.find((e) => e.outcome === "running");
  const daysLeft = token?.daysLeft ?? 0;
  const mddLimit = parseFloat(s.contract.rules[0].limit);
  const levLimit = parseFloat(s.contract.rules.find((r) => r.key === "leverage")!.limit);
  const price = market ? token.marketPrice : priceFrom(s);
  const change = market ? token.change24h : s.seatPrice7dChange;

  const seatStrategy = {
    id: s.id,
    slug: s.slug,
    name: s.name,
    traderHandle: s.traderHandle,
    basePriceUsdc: s.basePriceUsdc,
    seatsTaken: s.seatsTaken,
    seatsTotal: s.seatsTotal,
    seatAllocationUsd: s.seatAllocationUsd,
    minAccountUsd: s.minAccountUsd,
    venue: s.venue,
    state: s.state,
    waitlist: s.waitlist,
    contractLeverage: levLimit,
    epochEnd: running?.end,
    pausedReason: s.pausedReason,
  };

  const stats: { label: string; value: React.ReactNode; tone?: "up" | "down" }[] = [
    { label: short ? "Return (all)" : "Return 12m", value: fmtPct(short ? m.returnAll : m.return12m, { sign: true }), tone: (short ? m.returnAll : m.return12m) >= 0 ? "up" : "down" },
    { label: "Max DD", value: fmtPct(m.maxDrawdown) },
    { label: "Kept", value: s.compliance.settled ? `${s.compliance.kept}/${s.compliance.settled}` : "new" },
    { label: "Capacity", value: `${s.seatsTaken}/${s.seatsTotal}` },
    { label: "Seatlist", value: `${s.waitlist} bids` },
    { label: "Epoch ends", value: s.state === "paused" ? "—" : `${daysLeft}d` },
    ...(market ? [{ label: "24h volume", value: fmtNumber(token.volume24h) }, { label: "Holders", value: token.holders.toLocaleString("en-US") }] : []),
  ];

  return (
    <div className="container-market pb-28 pt-3 lg:pb-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[12px] text-tertiary">
        <Link href="/" className="hover:text-text">
          Seats
        </Link>
        <ChevronRight className="size-3" />
        <Link href={`/traders/${trader.handle}`} className="hover:text-text">
          {trader.handle}
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-secondary">{s.name}</span>
      </nav>

      {/* symbol header bar */}
      <header className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border border-border bg-surface px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar name={trader.handle} size={36} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-[17px] font-semibold leading-6">{s.name}</h1>
              <VerificationBadge trader={trader} />
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-tertiary">
              <Link href={`/traders/${trader.handle}`} className="hover:text-text">
                @{trader.handle}
              </Link>
              {token ? (
                <span className="font-mono font-semibold text-secondary">
                  · {token.symbol}-E{token.epoch}
                </span>
              ) : null}
              <span>· {s.venue}</span>
            </div>
          </div>
        </div>
        <div className="border-border sm:border-l sm:pl-6">
          <div className="tnum font-mono text-[22px] font-semibold leading-7">{fmtNumber(price)}</div>
          <div className="tnum flex items-center gap-1.5 text-[12px]">
            <span className={cn("font-mono font-semibold", change >= 0 ? "text-up" : "text-down")}>{fmtPct(change, { sign: true, digits: 2 })}</span>
            <span className="text-tertiary">{market ? "last price · 24h" : "Seat price · 7d"}</span>
          </div>
        </div>
        <dl className="scroll-thin order-last -mx-4 flex w-full gap-6 overflow-x-auto border-t border-border px-4 pt-2.5 xl:order-none xl:mx-0 xl:w-auto xl:flex-1 xl:border-0 xl:px-0 xl:pt-0">
          {stats.map((st) => (
            <div key={st.label} className="shrink-0">
              <dt className="text-[11px] text-tertiary">{st.label}</dt>
              <dd className={cn("tnum font-mono text-[13.5px] font-semibold", st.tone === "up" && "text-up", st.tone === "down" && "text-down")}>{st.value}</dd>
            </div>
          ))}
        </dl>
        <div className="ml-auto flex items-center gap-1">
          <WatchStar id={s.id} name={s.name} size={16} />
          <StrategyActions name={s.name} shareOnly />
        </div>
      </header>

      {s.state === "paused" && s.pausedReason ? (
        <div className="mt-3 flex gap-3 rounded-lg border border-border-strong bg-bg-subtle p-3 text-[13px]">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-semibold">Strategy paused</p>
            <p className="text-secondary">{s.pausedReason}</p>
          </div>
        </div>
      ) : null}

      {/* trading area */}
      <div className="mt-3" id="trade">
        {market ? (
          <SeatTrading token={token} owned={owned} />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
            <Card className="min-w-0">
              <CardHeader title="Performance" description="Strategy NAV vs. realized follower results" />
              <CardBody>
                <NavChart data={charts.nav} />
              </CardBody>
            </Card>
            <aside className="min-w-0 lg:sticky lg:top-20 lg:row-span-2 lg:h-fit">
              {edition === "v2" ? (
                <V2ActionPanel s={seatStrategy} accounts={accounts} owned={owned} daysLeft={daysLeft} initial={action} />
              ) : (
                <div className="space-y-4">
                  <SeatPanel s={seatStrategy} accounts={accounts} />
                  <Protection />
                </div>
              )}
            </aside>
          </div>
        )}
      </div>

      {/* analytics tabs */}
      <div className="mt-6 min-w-0">
        <LinkTabs items={tabs.map((t) => ({ ...t, href: `/seats/${s.slug}?tab=${t.key}` }))} active={tab} />
        <div className="mt-5 space-y-5">
          {tab === "overview" ? <Overview s={s} charts={charts} mddLimit={mddLimit} withPerformance={!!market} /> : null}
          {tab === "analytics" ? <Analytics s={s} charts={charts} /> : null}
          {tab === "simulate" ? (
            <MonteCarlo nav={charts.nav} seatAllocation={s.seatAllocationUsd} defaultCostBps={charts.dailyCostBps} contractMaxDd={mddLimit} strategyName={s.name} />
          ) : null}
          {tab === "contract" ? <ContractTab s={s} /> : null}
          {tab === "capacity" ? <CapacityTab s={s} charts={charts} /> : null}
          {tab === "followers" ? <FollowersTab s={s} charts={charts} /> : null}
          {tab === "epochs" ? <EpochsTab s={s} /> : null}
          {tab === "onchain" && market ? <OnchainCard token={token} /> : null}
        </div>
      </div>

      <RememberSeat slug={s.slug} />
      <SeatActionBar slug={s.slug} edition={edition} full={s.seatsTaken >= s.seatsTotal} paused={s.state === "paused"} />
    </div>
  );
}

/** Phones: sticky main action above the tab bar (spec 7.3). */
function SeatActionBar({ slug, edition, full, paused }: { slug: string; edition: "v2" | "v3"; full: boolean; paused: boolean }) {
  const actions: { label: string; action: string; primary?: boolean }[] = paused
    ? []
    : edition === "v3"
      ? full
        ? [
            { label: "Buy", action: "buy", primary: true },
            { label: "Bid", action: "bid" },
          ]
        : [
            { label: "Mint", action: "mint", primary: true },
            { label: "Buy", action: "buy" },
          ]
      : full
        ? [{ label: "Join Seatlist", action: "bid", primary: true }]
        : [
            { label: "Take Seat", action: "take", primary: true },
            { label: "Bid", action: "bid" },
          ];
  if (!actions.length) return null;
  return (
    <div className="seat-action-bar fixed inset-x-0 z-20 flex gap-2 border-t border-border bg-surface px-4 py-2 lg:hidden">
      {actions.map((a) => (
        <Link
          key={a.action}
          href={`/seats/${slug}?action=${a.action}#trade`}
          scroll={false}
          className={cn(
            "flex h-11 flex-1 items-center justify-center rounded-md text-[14px] font-semibold",
            a.primary ? "bg-primary text-on-primary" : "border border-border-strong text-text",
          )}
        >
          {a.label}
        </Link>
      ))}
    </div>
  );
}

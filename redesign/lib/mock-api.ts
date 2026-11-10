/**
 * Mock service layer. Every page loads data through these async functions so that
 * swapping to a real API later only touches this file. Simulated latency 150–400ms.
 */
import { accounts, claimableRefundUsdc, demoUser, seats, walletTx } from "@/mock/portfolio";
import { runningEpoch, seatQuote, seatToken } from "@/mock/seat-chain";
import { exposureSeries, monthlyReturns, returnHistogram, TODAY, addDays } from "@/mock/nav";
import { notifications, riskLog } from "@/mock/activity";
import { strategies, strategyById, strategySeries } from "@/mock/strategies";
import { traderByHandle, traders } from "@/mock/traders";
import { mulberry32 } from "@/lib/rng";
import { generateTrades } from "@/mock/trades";
import { platform, seatEvents } from "@/mock/community";
import { tradeStats } from "@/lib/trade-stats";
import { occupancyOf, seatPrice } from "@/lib/pricing";
import type { Market, Strategy } from "@/types/domain";

/** Simulated network latency in development (shows loading states); none in production. */
const latency = (min = 150, max = 400) =>
  process.env.NODE_ENV === "production" ? Promise.resolve() : new Promise((r) => setTimeout(r, min + Math.random() * (max - min)));

import { PERIODS, priceFrom, riskLevel, type Period, type StrategyWithSpark } from "./domain";
export { priceFrom, riskLevel, type Period, type StrategyWithSpark };

export const MIN_SETTLED_FOR_RANK = 3;

export function complianceRank(s: Strategy) {
  const { kept, settled } = s.compliance;
  const ratio = settled ? kept / settled : 0;
  return settled >= MIN_SETTLED_FOR_RANK ? ratio : ratio * 0.01 - 1;
}

export const listed = (s: Strategy) => s.state !== "closed";

export type StrategySort =
  | "return"
  | "sharpe"
  | "seatChange"
  | "volume"
  | "popular"
  | "newest"
  | "waitlist"
  | "compliance"
  | "sortino"
  | "calmar"
  | "return12m"
  | "maxdd"
  | "price"
  | "occupancy";

export interface StrategyQuery {
  q?: string;
  market?: Market | "all";
  venue?: string;
  risk?: string;
  minCompliance?: number; // percent
  maxDd?: number; // percent
  avail?: "free" | "waitlist" | "";
  state?: "active" | "rookie" | "";
  /** performance window for the Return column / sort */
  period?: Period;
  style?: string;
  /** minimum history, days */
  minHistory?: number;
  /** maximum seat price, USDC / 30d */
  maxPrice?: number;
  minSharpe?: number;
  /** only strategies with a positive return over `period` */
  profitable?: boolean;
  sort?: StrategySort;
  dir?: "asc" | "desc";
  page?: number;
}


/** NAV return over each period, cached per strategy. */
const perfCache = new Map<string, Record<Period, number>>();
export function perfOf(s: Strategy): Record<Period, number> {
  const hit = perfCache.get(s.id);
  if (hit) return hit;
  const pts = strategySeries.get(s.id)!.points;
  const last = pts[pts.length - 1].nav;
  const out = Object.fromEntries(PERIODS.map((p) => [p.value, last / pts[Math.max(0, pts.length - 1 - p.days)].nav - 1])) as Record<Period, number>;
  perfCache.set(s.id, out);
  return out;
}

/** Style families for the Style filter (matched against style + name). */
export const STYLE_FAMILIES: Record<string, RegExp> = {
  trend: /trend/i,
  momentum: /momentum|rotation/i,
  breakout: /breakout|opening range|range breakout/i,
  "mean-reversion": /mean.?revers|fade/i,
  "carry-arb": /carry|basis|arb|funding|neutral|pairs|relative value/i,
  scalping: /scalp|minutes|market-making/i,
  swing: /swing|weekly|earnings|drift/i,
};

const sorters: Record<Exclude<StrategySort, "return">, (a: Strategy, b: Strategy) => number> = {
  compliance: (a, b) => complianceRank(b) - complianceRank(a) || b.metrics.sortino - a.metrics.sortino,
  sortino: (a, b) => b.metrics.sortino - a.metrics.sortino,
  calmar: (a, b) => b.metrics.calmar - a.metrics.calmar,
  return12m: (a, b) => b.metrics.return12m - a.metrics.return12m,
  maxdd: (a, b) => a.metrics.maxDrawdown - b.metrics.maxDrawdown,
  price: (a, b) => priceFrom(a) - priceFrom(b),
  occupancy: (a, b) => occupancyOf(b) - occupancyOf(a),
  sharpe: (a, b) => b.metrics.sharpe - a.metrics.sharpe,
  seatChange: (a, b) => b.seatPrice7dChange - a.seatPrice7dChange,
  volume: (a, b) => b.seatsTraded30d - a.seatsTraded30d,
  popular: (a, b) => b.seatsTaken + b.waitlist - (a.seatsTaken + a.waitlist),
  newest: (a, b) => (a.createdAt < b.createdAt ? 1 : -1),
  waitlist: (a, b) => b.waitlist - a.waitlist,
};

export function queryStrategies(q: StrategyQuery) {
  let list = strategies.filter(listed);
  if (q.q) {
    const t = q.q.toLowerCase();
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(t) ||
        s.traderHandle.includes(t) ||
        s.instruments.some((i) => i.toLowerCase().includes(t)),
    );
  }
  if (q.market && q.market !== "all") list = list.filter((s) => s.markets.includes(q.market as Market));
  if (q.venue) list = list.filter((s) => s.venue === q.venue);
  if (q.risk) list = list.filter((s) => riskLevel(s.metrics.riskScore) === q.risk);
  if (q.minCompliance)
    list = list.filter(
      (s) => s.compliance.settled > 0 && (s.compliance.kept / s.compliance.settled) * 100 >= q.minCompliance!,
    );
  if (q.maxDd) list = list.filter((s) => s.metrics.maxDrawdown * 100 <= q.maxDd!);
  if (q.avail === "free") list = list.filter((s) => s.seatsTaken < s.seatsTotal && s.state !== "paused");
  if (q.avail === "waitlist") list = list.filter((s) => s.waitlist > 0);
  if (q.state === "active") list = list.filter((s) => s.state === "active" || s.state === "full");
  if (q.state === "rookie") list = list.filter((s) => s.state === "rookie");
  const period = q.period ?? "1y";
  if (q.style && STYLE_FAMILIES[q.style]) list = list.filter((s) => STYLE_FAMILIES[q.style!].test(`${s.style} ${s.name}`));
  if (q.minHistory) list = list.filter((s) => s.metrics.historyDays >= q.minHistory!);
  if (q.maxPrice) list = list.filter((s) => priceFrom(s) <= q.maxPrice!);
  if (q.minSharpe) list = list.filter((s) => s.metrics.sharpe >= q.minSharpe!);
  if (q.profitable) list = list.filter((s) => perfOf(s)[period] > 0);
  const sort =
    q.sort === "return" ? (a: Strategy, b: Strategy) => perfOf(b)[period] - perfOf(a)[period] : (sorters[(q.sort ?? "compliance") as Exclude<StrategySort, "return">] ?? sorters.compliance);
  list = [...list].sort(sort);
  if (q.dir === "asc") list.reverse();
  return list;
}

export async function getStrategies(q: StrategyQuery = {}) {
  await latency();
  const all = queryStrategies(q);
  const page = Math.max(1, q.page ?? 1);
  const perPage = 20;
  return {
    total: all.length,
    page,
    pages: Math.max(1, Math.ceil(all.length / perPage)),
    items: all.slice((page - 1) * perPage, page * perPage).map((s) => lean(withSparkFor(s, q.period ?? "1y"))),
  };
}

function withSparkFor(s: Strategy, period: Period): StrategyWithSpark {
  const pts = strategySeries.get(s.id)!.points;
  // sparkline follows the selected window (at least 7 days so it has a shape), default 90d
  const days = Math.max(7, PERIODS.find((p) => p.value === period)?.days ?? 90);
  const win = pts.slice(-(Math.min(days, pts.length - 1) + 1));
  const step = Math.max(1, Math.floor(win.length / 40));
  return { ...s, spark: win.filter((_, i) => i % step === 0 || i === win.length - 1).map((p) => p.nav), perf: perfOf(s), period };
}

function withSpark(s: Strategy): StrategyWithSpark {
  return withSparkFor(s, "90d");
}

/**
 * List payloads (tables, cards, podium) never show epochs, contract rules, allocation history or
 * descriptions — drop them so client components receive a fraction of the data.
 */
/** Downsample a sparkline to ~n points (keeps the last point) and trim float noise. */
function thin(a: number[], n: number) {
  const step = Math.max(1, Math.ceil(a.length / n));
  return a.filter((_, i) => i % step === 0 || i === a.length - 1).map((v) => Math.round(v * 1e4) / 1e4);
}
const roundPerf = (p: Record<Period, number>) =>
  Object.fromEntries(Object.entries(p).map(([k, v]) => [k, Math.round(v * 1e5) / 1e5])) as Record<Period, number>;

function lean(s: StrategyWithSpark): StrategyWithSpark {
  return {
    ...s,
    spark: thin(s.spark, 40),
    perf: roundPerf(s.perf),
    epochs: [],
    allocationHistory: [],
    instrumentPnl: [],
    description: "",
    contract: { ...s.contract, rules: [] },
  };
}

export async function getAllStrategySlugs() {
  return strategies.map((s) => s.slug);
}

export async function getStrategy(slug: string) {
  await latency();
  const s = strategyById(slug);
  if (!s) return null;
  return { strategy: withSpark(s), trader: traderByHandle(s.traderHandle)! };
}

export async function getStrategyCharts(slug: string) {
  await latency(100, 250);
  const s = strategyById(slug)!;
  const { returns, points } = strategySeries.get(slug)!;
  return {
    nav: points,
    monthly: monthlyReturns(points),
    histogram: returnHistogram(returns),
    exposure: exposureSeries(s.navSeed, s.instruments, points[points.length - 1].date, 120, s.metrics.avgLeverage * 1.6),
    priceCurve: Array.from({ length: 21 }, (_, i) => ({
      occupancy: i * 5,
      price: Math.round(seatPrice(s.basePriceUsdc, 30, i / 20) * 100) / 100,
    })),
    followerOutcomes: followerOutcomes(s),
    trades: tradeStats(generateTrades(s)),
    /** Follower execution drag per day, in bps (slippage × trade frequency), used by the simulator */
    dailyCostBps: Math.round(s.followerSlippageBps * (s.metrics.trades / s.metrics.historyDays) * 0.1 * 100) / 100,
  };
}

function followerOutcomes(s: Strategy) {
  const rand = mulberry32(s.navSeed + 3);
  const center = s.metrics.return3m * 100 - s.followerSlippageBps * 0.3;
  const buckets = [
    { range: "< −10%", lo: -Infinity, hi: -10 },
    { range: "−10% to −5%", lo: -10, hi: -5 },
    { range: "−5% to 0%", lo: -5, hi: 0 },
    { range: "0% to +5%", lo: 0, hi: 5 },
    { range: "+5% to +10%", lo: 5, hi: 10 },
    { range: "> +10%", lo: 10, hi: Infinity },
  ].map((b) => ({ ...b, count: 0 }));
  const n = Math.max(s.seatsTaken, 4) + 30;
  for (let i = 0; i < n; i++) {
    const v = center + (rand() + rand() + rand() - 1.5) * 6;
    buckets.find((b) => v >= b.lo && v < b.hi)!.count++;
  }
  return buckets.map(({ range, count }) => ({ range, count, share: count / n }));
}

export async function getTrader(handle: string) {
  await latency();
  const t = traderByHandle(handle);
  if (!t) return null;
  const own = strategies.filter((s) => s.traderHandle === handle);
  return {
    trader: t,
    active: own.filter((s) => s.state !== "closed").map(withSpark),
    closed: own.filter((s) => s.state === "closed").map(withSpark),
  };
}

export async function getTraders() {
  await latency(50, 100);
  return traders;
}

export function seatPriceHistory(s: Strategy) {
  const rand = mulberry32(s.navSeed + 17);
  const now = priceFrom(s);
  const weekAgo = now / (1 + s.seatPrice7dChange);
  const out: number[] = [];
  let p = weekAgo * (1 - 0.04 + rand() * 0.08);
  for (let i = 0; i < 23; i++) {
    p += (weekAgo - p) * 0.15 + (rand() - 0.5) * weekAgo * 0.01;
    out.push(p);
  }
  for (let i = 0; i <= 7; i++) out.push(weekAgo + ((now - weekAgo) * i) / 7);
  return out.map((x) => Math.round(x * 100) / 100);
}

export interface SeatRow {
  id: string;
  slug: string;
  name: string;
  traderHandle: string;
  markets: Strategy["markets"];
  venue: string;
  state: Strategy["state"];
  seatsTaken: number;
  seatsTotal: number;
  waitlist: number;
  compliance: Strategy["compliance"];
  seatPrice7dChange: number;
  seatsTraded30d: number;
  price: number;
  priceHistory: number[];
  riskScore: number;
  ret: number;
  /** on-chain Seat token quote */
  symbol: string;
  marketPrice: number;
  premium: number;
  change24h: number;
  /** redesign table: per-period return, risk, age, Epoch countdown */
  perf: Record<Period, number>;
  maxDrawdown: number;
  sharpe: number;
  createdAt: string;
  epochDaysLeft: number;
  epoch: number;
  style: string;
}

const toSeatRow = (s: Strategy): SeatRow => ({
  id: s.id,
  slug: s.slug,
  name: s.name,
  traderHandle: s.traderHandle,
  markets: s.markets,
  venue: s.venue,
  state: s.state,
  seatsTaken: s.seatsTaken,
  seatsTotal: s.seatsTotal,
  waitlist: s.waitlist,
  compliance: s.compliance,
  seatPrice7dChange: s.seatPrice7dChange,
  seatsTraded30d: s.seatsTraded30d,
  price: priceFrom(s),
  priceHistory: seatPriceHistory(s),
  riskScore: s.metrics.riskScore,
  ret: s.metrics.historyDays < 365 ? s.metrics.returnAll : s.metrics.return12m,
  ...pickQuote(seatQuote(s)),
  perf: perfOf(s),
  maxDrawdown: s.metrics.maxDrawdown,
  sharpe: s.metrics.sharpe,
  createdAt: s.createdAt,
  epochDaysLeft: runningEpoch(s).daysLeft,
  epoch: runningEpoch(s).idx,
  style: s.style,
});
const pickQuote = (q: ReturnType<typeof seatQuote>) => ({ symbol: q.symbol, marketPrice: q.marketPrice, premium: q.premium, change24h: q.change24h });

/** Current-Epoch Seat token for a strategy (Solana mint, curve, order book, trades). */
export async function getSeatToken(slug: string) {
  await latency();
  const s = strategyById(slug);
  if (!s || s.state === "closed") return null;
  const owned = seats.filter((x) => x.strategyId === s.id).reduce((a, x) => a + x.seats, 0);
  return { token: seatToken(s), owned };
}

export async function getSeatMarket() {
  await latency();
  const rows = strategies.filter(listed).map(toSeatRow);
  const byId = new Map(rows.map((r) => [r.id, r]));
  const day = new Date(seatEvents[0].at).getTime() - 24 * 3_600_000;
  const last24 = seatEvents.filter((e) => new Date(e.at).getTime() >= day);
  const bought24 = last24.filter((e) => e.type === "buy" || e.type === "renew");
  const occ = rows.filter((r) => r.state !== "paused");
  const movers = [...rows].sort((a, b) => Math.abs(b.seatPrice7dChange) - Math.abs(a.seatPrice7dChange)).slice(0, 4);
  return {
    rows: rows.sort((a, b) => b.seatsTraded30d - a.seatsTraded30d),
    movers,
    stats: {
      ...platform,
      /** Monthly seat-fee run rate (all occupied seats × current 30d price) */
      escrowRunRate: occ.reduce((a, r) => a + r.seatsTaken * r.price, 0),
      seatsActive: occ.reduce((a, r) => a + r.seatsTaken, 0),
      seats24h: bought24.reduce((a, e) => a + e.seats, 0),
      volume24h: bought24.reduce((a, e) => a + e.priceUsdc, 0),
      buyers24h: new Set(bought24.map((e) => e.user)).size,
      avgOccupancy: occ.reduce((a, r) => a + r.seatsTaken / r.seatsTotal, 0) / occ.length,
      waitlist: rows.reduce((a, r) => a + r.waitlist, 0),
      full: rows.filter((r) => r.seatsTaken >= r.seatsTotal).length,
    },
    activity: seatEvents.slice(0, 40).map((e) => ({ ...e, name: byId.get(e.strategyId)?.name ?? "", slug: byId.get(e.strategyId)?.slug ?? "" })),
    boards: {
      hot: [...rows].filter((r) => r.state !== "paused").sort((a, b) => b.seatsTraded30d / Math.max(1, b.seatsTotal) - a.seatsTraded30d / Math.max(1, a.seatsTotal) || b.seatPrice7dChange - a.seatPrice7dChange).slice(0, 5),
      filling: rows.filter((r) => r.seatsTaken < r.seatsTotal && r.seatsTaken / r.seatsTotal >= 0.75 && r.state !== "paused").sort((a, b) => b.seatsTaken / b.seatsTotal - a.seatsTaken / a.seatsTotal).slice(0, 5),
      waitlist: rows.filter((r) => r.waitlist > 0).sort((a, b) => b.waitlist - a.waitlist).slice(0, 5),
    },
  };
}

/** Banner numbers + podium for the Strategies page. */
export async function getStrategiesOverview() {
  await latency(60, 140);
  const live = strategies.filter(listed);
  // Compliance counts every strategy ever published (incl. closed) — no hiding failures.
  const kept = strategies.reduce((a, s) => a + s.compliance.kept, 0);
  const settled = strategies.reduce((a, s) => a + s.compliance.settled, 0);
  const sharpes = live.map((s) => s.metrics.sharpe).sort((a, b) => a - b);
  const count = (m: Market) => live.filter((s) => s.markets.includes(m)).length;
  return {
    stats: {
      strategies: live.length,
      traders: new Set(live.map((s) => s.traderHandle)).size,
      keptRate: kept / settled,
      settled,
      medianSharpe: sharpes[Math.floor(sharpes.length / 2)],
      seatsActive: live.filter((s) => s.state !== "paused").reduce((a, s) => a + s.seatsTaken, 0),
      freeSeats: live.filter((s) => s.state !== "paused").reduce((a, s) => a + (s.seatsTotal - s.seatsTaken), 0),
      rookies: live.filter((s) => s.state === "rookie").length,
    },
    markets: { crypto: count("crypto"), forex: count("forex"), stocks: count("stocks"), futures: count("futures") },
    podium: queryStrategies({ sort: "compliance" }).slice(0, 3).map((s) => lean(withSpark(s))),
  };
}

export async function getPlatformStats() {
  await latency(50, 120);
  return { ...platform, latest: seatEvents.slice(0, 6).map((e) => ({ ...e, name: strategyById(e.strategyId)?.name ?? "" })) };
}

export async function getHomeData() {
  await latency();
  const live = strategies.filter(listed);
  const settled = strategies.reduce((a, s) => a + s.compliance.settled, 0);
  const kept = strategies.reduce((a, s) => a + s.compliance.kept, 0);
  const escrow = live.reduce(
    (a, s) => a + (s.state === "paused" ? 0 : s.seatsTaken * priceFrom(s)),
    0,
  );
  return {
    stats: {
      strategies: live.length,
      seatsActive: live.filter((s) => s.state !== "paused").reduce((a, s) => a + s.seatsTaken, 0),
      keptRate: kept / settled,
      escrowUsdc: escrow,
    },
    /** Featured: the reference strategy + the three most in-demand (seats traded vs. size). */
    featured: [
      strategyById("eth-swing")!,
      ...[...live]
        .filter((s) => s.id !== "eth-swing" && s.state !== "paused")
        .sort((a, b) => b.seatsTraded30d / b.seatsTotal - a.seatsTraded30d / a.seatsTotal)
        .slice(0, 3),
    ].map((s) => lean(withSpark(s))),
    /** Rows for the home markets table (compliance order). */
    table: [...live].sort(sorters.compliance).map((s) => {
      const w = withSpark(s);
      return {
        id: s.id,
        slug: s.slug,
        name: s.name,
        traderHandle: s.traderHandle,
        venue: s.venue,
        markets: s.markets,
        state: s.state,
        compliance: s.compliance,
        ret: s.metrics.historyDays < 365 ? s.metrics.returnAll : s.metrics.return12m,
        maxDd: s.metrics.maxDrawdown,
        fresh: s.state === "rookie" || s.metrics.historyDays < 365,
        perf: roundPerf(perfOf(s)),
        spark: thin(w.spark, 24),
        seatsTaken: s.seatsTaken,
        seatsTotal: s.seatsTotal,
        waitlist: s.waitlist,
        price: priceFrom(s),
      };
    }),
  };
}

/* ---------------- follower area ---------------- */

export async function getPortfolio() {
  await latency();
  const rows = seats.map((seat) => ({ seat, strategy: strategyById(seat.strategyId)! }));
  const active = rows.filter((r) => r.seat.status === "active");
  return {
    user: demoUser,
    seats: rows,
    accounts,
    totals: {
      allocationUsd: active.reduce((a, r) => a + r.seat.seats * r.strategy.seatAllocationUsd, 0),
      escrowUsdc: active.reduce((a, r) => a + r.seat.escrowUsdc, 0),
      pnlUsd: rows.reduce((a, r) => a + r.seat.pnlUsd, 0),
      activeSeats: active.reduce((a, r) => a + r.seat.seats, 0),
      claimableRefundUsdc,
    },
    walletTx,
  };
}

export async function getRiskLog(limit = 40) {
  await latency(100, 200);
  return riskLog.slice(0, limit).map((e) => ({ ...e, strategyName: strategyById(e.strategyId)?.name ?? "" }));
}

export async function getNotifications() {
  await latency(100, 200);
  return notifications;
}

export async function getAccounts() {
  await latency(100, 200);
  return accounts;
}

/* ---------------- trader area (demo trader = alex.k) ---------------- */

export const DEMO_TRADER = "alex.k";

export async function getTraderDashboard(handle = DEMO_TRADER) {
  await latency();
  const t = traderByHandle(handle)!;
  const own = strategies.filter((s) => s.traderHandle === handle);
  const live = own.filter((s) => s.state !== "closed");
  const epochRows = own.flatMap((s) =>
    s.epochs
      .filter((e) => e.outcome !== "running" && e.outcome !== "upcoming")
      .map((e) => ({ ...e, strategyId: s.id, strategyName: s.name })),
  );
  // monthly payout series for earnings chart (by epoch end month)
  const byMonth = new Map<string, { month: string; payout: number; refunded: number }>();
  epochRows.forEach((e) => {
    const m = e.end.slice(0, 7);
    const row = byMonth.get(m) ?? { month: m, payout: 0, refunded: 0 };
    row.payout += e.payoutUsdc ?? 0;
    row.refunded += e.refundUsdc ?? 0;
    byMonth.set(m, row);
  });
  const currentEscrow = live
    .filter((s) => s.state !== "paused")
    .map((s) => {
      const ep = s.epochs.find((e) => e.outcome === "running")!;
      const gross = s.seatsTaken * priceFrom(s);
      return { strategy: s, epoch: ep, gross, traderShare: gross * 0.75 };
    });
  return {
    trader: t,
    strategies: own.map(withSpark),
    epochRows: epochRows.sort((a, b) => (a.end < b.end ? 1 : -1)),
    earningsByMonth: [...byMonth.values()].sort((a, b) => (a.month < b.month ? -1 : 1)).slice(-12),
    currentEscrow,
    totals: {
      lifetimePayout: epochRows.reduce((a, e) => a + (e.payoutUsdc ?? 0), 0),
      lifetimeRefunded: epochRows.reduce((a, e) => a + (e.refundUsdc ?? 0), 0),
      pendingTraderShare: currentEscrow.reduce((a, e) => a + e.traderShare, 0),
      seatsFilled: live.reduce((a, s) => a + s.seatsTaken, 0),
      bondTotal: live.reduce((a, s) => a + s.bondUsdc, 0),
    },
    followers: live.flatMap((s) => anonFollowers(s)),
  };
}

function anonFollowers(s: Strategy) {
  const rand = mulberry32(s.navSeed + 23);
  const n = Math.min(s.seatsTaken, 8);
  return Array.from({ length: n }, (_, i) => {
    const seatsHeld = 1 + Math.floor(rand() * 3);
    return {
      id: `${s.id}-f${i}`,
      strategyId: s.id,
      strategyName: s.name,
      wallet: `${"ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.floor(rand() * 24)]}${Math.floor(rand() * 9)}${"abcdefghjk"[i % 10]}q…${Math.floor(rand() * 9000 + 1000).toString(36)}`,
      seats: seatsHeld,
      since: addDays(TODAY, -Math.floor(rand() * 200 + 5)),
      venue: rand() > 0.5 ? s.venue : s.venue,
      slippageBps: Math.round((s.followerSlippageBps * (0.6 + rand() * 0.9)) * 10) / 10,
      pnlPct: s.metrics.return3m * (0.8 + rand() * 0.3),
    };
  });
}

export { TODAY };

import { gaussian, mulberry32 } from "@/lib/rng";
import type { NavPoint } from "@/types/domain";

export const TODAY = "2026-10-06";
const DAY = 86_400_000;

export function addDays(iso: string, n: number) {
  return new Date(new Date(iso + "T00:00:00Z").getTime() + n * DAY).toISOString().slice(0, 10);
}

export function daysBetween(a: string, b: string) {
  return Math.round((new Date(b + "T00:00:00Z").getTime() - new Date(a + "T00:00:00Z").getTime()) / DAY);
}

export interface NavSpec {
  seed: number;
  days: number;
  endDate: string;
  /** total return over the last min(365, days) days, e.g. 0.384 */
  targetReturn: number;
  /** max drawdown over the whole history, e.g. 0.12 */
  targetMdd: number;
}

function maxDrawdown(logs: number[]) {
  let cum = 0;
  let peak = 0;
  let mdd = 0;
  for (const l of logs) {
    cum += l;
    if (cum > peak) peak = cum;
    const dd = 1 - Math.exp(cum - peak);
    if (dd > mdd) mdd = dd;
  }
  return mdd;
}

/**
 * Seeded, deterministic NAV generator. Fits a drift + scaled noise series so that the
 * trailing-window return and full-history max drawdown match the fixture targets.
 */
export function generateDailyReturns(spec: NavSpec, common?: number[], rho = 0): number[] {
  const rand = mulberry32(spec.seed);
  const noise: number[] = [];
  let regime = 0;
  const idio = Math.sqrt(1 - rho * rho);
  for (let i = 0; i < spec.days; i++) {
    // mild volatility clustering + occasional fat-tail day, plus a shared market (BTC) factor
    regime = 0.94 * regime + 0.06 * Math.abs(gaussian(rand));
    const fat = rand() < 0.03 ? 2.6 : 1;
    const own = gaussian(rand) * (0.7 + regime) * fat;
    noise.push(common ? rho * common[i] + idio * own : own);
  }
  const window = Math.min(365, spec.days);
  const sumW = noise.slice(-window).reduce((a, b) => a + b, 0);
  const target = Math.log(1 + spec.targetReturn);

  const build = (s: number) => {
    const mu = (target - s * sumW) / window;
    return noise.map((n) => mu + s * n);
  };

  let lo = 0.0001;
  let hi = 0.25;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (maxDrawdown(build(mid)) > spec.targetMdd) hi = mid;
    else lo = mid;
  }
  return build((lo + hi) / 2).map((l) => Math.exp(l) - 1);
}

/* ---------------- shared market factor (BTC) ---------------- */

const BTC_START = "2019-01-01";
/** One deterministic BTC path for the whole platform: standardized daily shocks by date. */
const btcZ: number[] = (() => {
  const r = mulberry32(77);
  return Array.from({ length: daysBetween(BTC_START, TODAY) + 400 }, () => gaussian(r) * (r() < 0.03 ? 2.4 : 1));
})();
const btcShock = (date: string) => btcZ[daysBetween(BTC_START, date)] ?? 0;
/** BTC daily return for a shock: ~+24%/yr drift, ~50% annualized volatility. */
const btcReturn = (z: number) => 0.0006 + 0.026 * z;

export function navSeries(spec: NavSpec, opts: { followerDragAnnual?: number; btcRho?: number } = {}) {
  const start = addDays(spec.endDate, -spec.days);
  const common = Array.from({ length: spec.days }, (_, i) => btcShock(addDays(start, i + 1)));
  const r = generateDailyReturns(spec, common, opts.btcRho ?? 0);
  const drag = (opts.followerDragAnnual ?? 0) / 365;
  let nav = 1;
  let peak = 1;
  let fol = 1;
  let bench = 1;
  const points: NavPoint[] = [{ date: start, nav: 1, dd: 0, follower: 1, bench: 1 }];
  r.forEach((ri, i) => {
    nav *= 1 + ri;
    fol *= 1 + ri - drag;
    bench *= 1 + btcReturn(common[i]);
    peak = Math.max(peak, nav);
    points.push({
      date: addDays(start, i + 1),
      nav: round(nav, 5),
      dd: round(1 - nav / peak, 5),
      follower: round(fol, 5),
      bench: round(bench, 5),
    });
  });
  return { returns: r, points };
}

const round = (n: number, d: number) => Math.round(n * 10 ** d) / 10 ** d;

/* ---------------- statistics ---------------- */

const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / Math.max(a.length, 1);
const std = (a: number[]) => {
  const m = mean(a);
  return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(a.length - 1, 1));
};

function normCdf(x: number) {
  // Abramowitz–Stegun approximation
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}

export function computeSeriesMetrics(returns: number[], points: NavPoint[]) {
  const N = 365;
  const navs = points.map((p) => p.nav);
  const last = navs[navs.length - 1];
  const ret = (days: number) => last / navs[Math.max(0, navs.length - 1 - days)] - 1;
  const days = returns.length;
  const cagr = Math.pow(last, N / days) - 1;
  const mdd = Math.max(...points.map((p) => p.dd));
  const m = mean(returns);
  const sd = std(returns);
  const downside = Math.sqrt(mean(returns.map((x) => Math.min(x, 0) ** 2)));
  const sorted = [...returns].sort((a, b) => a - b);
  const i95 = Math.floor(sorted.length * 0.05);
  const var95 = -sorted[i95];
  const cvar95 = -mean(sorted.slice(0, i95 + 1));
  const skew = mean(returns.map((x) => ((x - m) / sd) ** 3));
  const kurt = mean(returns.map((x) => ((x - m) / sd) ** 4));
  const sr = m / sd;
  const psr = normCdf((sr * Math.sqrt(days - 1)) / Math.sqrt(Math.max(1 - skew * sr + ((kurt - 1) / 4) * sr * sr, 1e-6)));

  // equity R² of ln(NAV) vs t
  const ys = navs.map((n) => Math.log(n));
  const xs = ys.map((_, i) => i);
  const mx = mean(xs);
  const my = mean(ys);
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  xs.forEach((x, i) => {
    sxy += (x - mx) * (ys[i] - my);
    sxx += (x - mx) ** 2;
    syy += (ys[i] - my) ** 2;
  });
  const r2 = syy === 0 ? 0 : (sxy * sxy) / (sxx * syy);

  const monthly = monthlyReturns(points);
  const profitableMonthsPct = monthly.filter((x) => x.ret > 0).length / Math.max(monthly.length, 1);

  // longest losing streak in days
  let streak = 0;
  let longest = 0;
  returns.forEach((x) => {
    streak = x < 0 ? streak + 1 : 0;
    longest = Math.max(longest, streak);
  });

  return {
    return1m: ret(30),
    return3m: ret(90),
    return12m: ret(Math.min(365, days)),
    returnAll: last - 1,
    cagr,
    maxDrawdown: mdd,
    currentDrawdown: points[points.length - 1].dd,
    volatility: sd * Math.sqrt(N),
    ulcer: Math.sqrt(mean(points.map((p) => p.dd ** 2))),
    sharpe: (m / sd) * Math.sqrt(N),
    sortino: (m / downside) * Math.sqrt(N),
    calmar: cagr / mdd,
    psr,
    downsideDev: downside * Math.sqrt(N),
    var95,
    cvar95,
    skew,
    kurtosis: kurt,
    equityR2: r2,
    profitableMonthsPct,
    longestLosingStreakDays: longest,
  };
}

export function monthlyReturns(points: NavPoint[]) {
  const out: { month: string; ret: number }[] = [];
  let curMonth = points[0].date.slice(0, 7);
  let startNav = points[0].nav;
  let prevNav = points[0].nav;
  for (const p of points.slice(1)) {
    const m = p.date.slice(0, 7);
    if (m !== curMonth) {
      out.push({ month: curMonth, ret: prevNav / startNav - 1 });
      curMonth = m;
      startNav = prevNav;
    }
    prevNav = p.nav;
  }
  out.push({ month: curMonth, ret: prevNav / startNav - 1 });
  return out;
}

export function returnHistogram(returns: number[], bins = 31) {
  const lo = -0.06;
  const hi = 0.06;
  const w = (hi - lo) / bins;
  const counts = Array.from({ length: bins }, (_, i) => ({ x: lo + w * (i + 0.5), count: 0 }));
  returns.forEach((r) => {
    const idx = Math.min(bins - 1, Math.max(0, Math.floor((r - lo) / w)));
    counts[idx].count++;
  });
  return counts.map((c) => ({ x: Math.round(c.x * 1000) / 10, count: c.count }));
}

export function exposureSeries(seed: number, instruments: string[], endDate: string, days = 120, maxLev = 4) {
  const rand = mulberry32(seed + 99);
  const state = instruments.map(() => rand());
  const out: Record<string, number | string>[] = [];
  for (let i = days; i >= 0; i--) {
    const row: Record<string, number | string> = { date: addDays(endDate, -i) };
    instruments.forEach((ins, k) => {
      state[k] = Math.max(0, Math.min(1, state[k] + (rand() - 0.5) * 0.25));
      const weight = k === 0 ? 1.4 : 1 / (k + 0.6);
      row[ins] = Math.round(((state[k] * weight * maxLev * 100) / instruments.length) * 10) / 10;
    });
    out.push(row);
  }
  return out;
}

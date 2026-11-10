import type { NavPoint } from "@/types/domain";

/** Institutional analytics computed from a NAV series with a BTC benchmark. */

const mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const std = (a: number[]) => {
  const m = mean(a);
  return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, a.length - 1));
};
const cov = (a: number[], b: number[]) => {
  const ma = mean(a);
  const mb = mean(b);
  return a.reduce((s, x, i) => s + (x - ma) * (b[i] - mb), 0) / Math.max(1, a.length - 1);
};

function pairs(pts: NavPoint[]) {
  const s: number[] = [];
  const b: number[] = [];
  for (let i = 1; i < pts.length; i++) {
    s.push(pts[i].nav / pts[i - 1].nav - 1);
    b.push((pts[i].bench ?? 1) / (pts[i - 1].bench ?? 1) - 1);
  }
  return { s, b };
}

/** Beta, alpha, correlation, capture ratios and tracking stats vs BTC. */
export function benchmarkStats(pts: NavPoint[]) {
  const { s, b } = pairs(pts);
  const vb = cov(b, b);
  const beta = vb ? cov(s, b) / vb : 0;
  const sdS = std(s);
  const sdB = std(b);
  const corr = sdS && sdB ? cov(s, b) / (sdS * sdB) : 0;
  const up = s.filter((_, i) => b[i] > 0);
  const upB = b.filter((x) => x > 0);
  const dn = s.filter((_, i) => b[i] < 0);
  const dnB = b.filter((x) => x < 0);
  const active = s.map((x, i) => x - b[i]);
  const te = std(active) * Math.sqrt(365);
  return {
    beta,
    alpha: (mean(s) - beta * mean(b)) * 365,
    corr,
    r2: corr * corr,
    upCapture: mean(upB) ? mean(up) / mean(upB) : 0,
    downCapture: mean(dnB) ? mean(dn) / mean(dnB) : 0,
    trackingError: te,
    infoRatio: te ? (mean(active) * 365) / te : 0,
    /** regression line for the scatter: s = a + beta·b (daily) */
    intercept: mean(s) - beta * mean(b),
  };
}

/** Daily (BTC, strategy) return pairs in %, most recent `max` days. */
export function scatterPoints(pts: NavPoint[], max = 365) {
  const { s, b } = pairs(pts);
  const from = Math.max(0, s.length - max);
  return s.slice(from).map((y, i) => ({ x: Math.round(b[from + i] * 1e4) / 100, y: Math.round(y * 1e4) / 100 }));
}

/** Rolling beta and correlation vs BTC. */
export function rollingBeta(pts: NavPoint[], window = 90) {
  const { s, b } = pairs(pts);
  const out: { date: string; beta: number; corr: number }[] = [];
  for (let i = window; i <= s.length; i += 2) {
    const ws = s.slice(i - window, i);
    const wb = b.slice(i - window, i);
    const vb = cov(wb, wb);
    const d = std(ws) * std(wb);
    out.push({
      date: pts[i].date,
      beta: Math.round((vb ? cov(ws, wb) / vb : 0) * 100) / 100,
      corr: Math.round((d ? cov(ws, wb) / d : 0) * 100) / 100,
    });
  }
  return out;
}

export interface DrawdownPeriod {
  start: string;
  trough: string;
  end: string | null;
  depth: number;
  /** peak → trough, days */
  decline: number;
  /** trough → recovery, days (null while still underwater) */
  recovery: number | null;
}

/** The deepest drawdown episodes (peak → trough → recovery). */
export function drawdownPeriods(pts: NavPoint[], top = 5): DrawdownPeriod[] {
  const out: DrawdownPeriod[] = [];
  let peakI = 0;
  let troughI = 0;
  let inDd = false;
  for (let i = 1; i < pts.length; i++) {
    if (pts[i].nav >= pts[peakI].nav) {
      if (inDd) {
        out.push(period(pts, peakI, troughI, i));
        inDd = false;
      }
      peakI = i;
      troughI = i;
    } else {
      inDd = true;
      if (pts[i].nav < pts[troughI].nav) troughI = i;
    }
  }
  if (inDd) out.push(period(pts, peakI, troughI, null));
  return out.sort((a, b) => b.depth - a.depth).slice(0, top);
}

function period(pts: NavPoint[], p: number, t: number, e: number | null): DrawdownPeriod {
  return {
    start: pts[p].date,
    trough: pts[t].date,
    end: e === null ? null : pts[e].date,
    depth: 1 - pts[t].nav / pts[p].nav,
    decline: t - p,
    recovery: e === null ? null : e - t,
  };
}

/** Trailing returns: strategy, followers (after costs) and BTC. */
export function trailingReturns(pts: NavPoint[]) {
  const last = pts[pts.length - 1];
  const year = last.date.slice(0, 4);
  const ytdIdx = Math.max(0, pts.findIndex((p) => p.date >= `${year}-01-01`) - 1);
  const windows: [string, number][] = [
    ["1W", 7],
    ["1M", 30],
    ["3M", 90],
    ["6M", 180],
    ["YTD", pts.length - 1 - ytdIdx],
    ["1Y", 365],
    ["All", pts.length - 1],
  ];
  return windows
    .filter(([label, d]) => d > 0 && (d <= pts.length - 1 || label === "All"))
    .map(([label, d]) => {
      const p = pts[pts.length - 1 - d];
      const strat = last.nav / p.nav - 1;
      const btc = (last.bench ?? 1) / (p.bench ?? 1) - 1;
      return { label, strat, follower: (last.follower ?? 1) / (p.follower ?? 1) - 1, btc, excess: strat - btc };
    });
}

const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Average return and hit rate by weekday. */
export function weekdayStats(pts: NavPoint[]) {
  const buckets = WD.map(() => [] as number[]);
  for (let i = 1; i < pts.length; i++) {
    const d = new Date(pts[i].date + "T00:00:00Z").getUTCDay();
    buckets[d].push(pts[i].nav / pts[i - 1].nav - 1);
  }
  return [1, 2, 3, 4, 5, 6, 0].map((d) => ({
    day: WD[d],
    avg: Math.round(mean(buckets[d]) * 1e5) / 1e3,
    hit: buckets[d].filter((x) => x > 0).length / Math.max(1, buckets[d].length),
    n: buckets[d].length,
  }));
}

/** Tail and asymmetry statistics from daily returns. */
export function tailStats(pts: NavPoint[]) {
  const { s } = pairs(pts);
  const sorted = [...s].sort((a, b) => a - b);
  const q = (p: number) => sorted[Math.max(0, Math.floor(p * sorted.length) - 1)] ?? 0;
  const var99 = -q(0.01);
  const tail99 = sorted.slice(0, Math.max(1, Math.floor(sorted.length * 0.01)));
  const gains = s.filter((x) => x > 0).reduce((a, b) => a + b, 0);
  const losses = -s.filter((x) => x < 0).reduce((a, b) => a + b, 0);
  const p95 = q(0.95);
  const p05 = q(0.05);
  // max time under water (days)
  let peak = pts[0].nav;
  let under = 0;
  let maxUnder = 0;
  for (const p of pts) {
    if (p.nav >= peak) {
      peak = p.nav;
      under = 0;
    } else maxUnder = Math.max(maxUnder, ++under);
  }
  return {
    var99,
    cvar99: -mean(tail99),
    omega: losses ? gains / losses : 0,
    gainToPain: losses ? (gains - losses) / losses : 0,
    tailRatio95: p05 ? Math.abs(p95 / p05) : 0,
    maxUnderwaterDays: maxUnder,
  };
}

/** Gross exposure summary from the per-instrument exposure series. */
export function exposureSummary(rows: Record<string, number | string>[], instruments: string[]) {
  const total = rows.map((r) => ({ date: String(r.date), gross: Math.round(instruments.reduce((a, k) => a + Number(r[k] ?? 0), 0) * 10) / 10 }));
  const share = instruments
    .map((k) => ({ instrument: k, avg: mean(rows.map((r) => Number(r[k] ?? 0))) }))
    .sort((a, b) => b.avg - a.avg);
  const sum = share.reduce((a, b) => a + b.avg, 0) || 1;
  return { total, share: share.map((x) => ({ instrument: x.instrument, avg: Math.round(x.avg * 10) / 10, pct: x.avg / sum })) };
}

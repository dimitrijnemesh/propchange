import { gaussian, mulberry32 } from "./rng";

export interface McParams {
  capital: number;
  horizonDays: number;
  paths: number;
  /** Stop copying when the allocation is down this fraction (0.2 = −20%). */
  maxLoss: number;
  /** Cap a single day's loss at this fraction (Risk Engine daily limit, best-effort). */
  dailyLoss: number;
  /** Position size multiplier vs the trader (leverage scaling). */
  sizeScale: number;
  /** Execution drag per day (slippage + fees), in bps. */
  costBps: number;
  seed: number;
  /** Bootstrap block length in days (keeps volatility clustering). */
  block?: number;
}

const BANDS = [0.05, 0.25, 0.5, 0.75, 0.95] as const;
/** Share of a move beyond the daily limit that still hits the follower (stop slippage on fast days). */
const STOP_SLIPPAGE = 0.35;
/** Typical intraday dip below the close, in daily standard deviations. */
const INTRADAY_DIP = 0.6;

function quantile(sorted: Float64Array | number[], q: number) {
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

/**
 * Monte Carlo of a follower's allocation copying the strategy.
 * Daily returns are block-bootstrapped from history. Every path is simulated twice on the
 * same draws: with the Risk Engine (size scaling, daily loss cap, max-loss stop) and without
 * any protection (size scaling + costs only), so the difference is purely the rules.
 */
export function runMonteCarlo(returns: number[], p: McParams) {
  const rand = mulberry32(p.seed);
  const block = p.block ?? 5;
  const D = p.horizonDays;
  const N = p.paths;
  const cost = p.costBps / 1e4;
  const floor = 1 - p.maxLoss;
  const re = new Float64Array(N * (D + 1)); // equity multiples with Risk Engine
  const raw = new Float64Array(N * (D + 1)); // without Risk Engine
  const finalRe = new Float64Array(N);
  const finalRaw = new Float64Array(N);
  const ddRe = new Float64Array(N);
  const ddRaw = new Float64Array(N);
  const stopDay = new Int32Array(N).fill(-1);
  let cappedDays = 0;
  // Daily volatility, used to estimate how far below the close each day traded intraday.
  const mu = returns.reduce((x, y) => x + y, 0) / returns.length;
  const sd = Math.sqrt(returns.reduce((s2, x) => s2 + (x - mu) ** 2, 0) / returns.length);

  for (let i = 0; i < N; i++) {
    let a = 1;
    let b = 1;
    let peakA = 1;
    let peakB = 1;
    let mddA = 0;
    let mddB = 0;
    let stopped = false;
    re[i * (D + 1)] = 1;
    raw[i * (D + 1)] = 1;
    let d = 1;
    while (d <= D) {
      const start = Math.floor(rand() * Math.max(1, returns.length - block));
      for (let k = 0; k < block && d <= D; k++, d++) {
        const r = returns[start + k] * p.sizeScale - cost;
        // without protection
        b = Math.max(0, b * (1 + r));
        peakB = Math.max(peakB, b);
        mddB = Math.max(mddB, 1 - b / peakB);
        // with Risk Engine
        if (!stopped) {
          let rr = r;
          // Intraday low: the close (if negative) plus a volatility-scaled dip. A day can close up
          // yet still breach the limit intraday — the stop then locks the loss and misses the recovery.
          const low = Math.min(r, 0) - Math.abs(gaussian(rand)) * INTRADAY_DIP * sd * p.sizeScale;
          if (low < -p.dailyLoss) {
            // The daily stop fires during a fast move: fills land past the limit (part of the overshoot),
            // then the follower is flat for the rest of the day.
            rr = -p.dailyLoss - STOP_SLIPPAGE * Math.max(0, -low - p.dailyLoss);
            cappedDays++;
          }
          a *= 1 + rr;
          if (a <= floor) {
            a = floor;
            stopped = true;
            stopDay[i] = d;
          }
          peakA = Math.max(peakA, a);
          mddA = Math.max(mddA, 1 - a / peakA);
        }
        re[i * (D + 1) + d] = a;
        raw[i * (D + 1) + d] = b;
      }
    }
    finalRe[i] = a - 1;
    finalRaw[i] = b - 1;
    ddRe[i] = mddA;
    ddRaw[i] = mddB;
  }

  // percentile fan per day (sampled for chart density)
  const step = Math.max(1, Math.floor(D / 120));
  const fan: Record<string, number>[] = [];
  const col = new Float64Array(N);
  const colRaw = new Float64Array(N);
  for (let d = 0; d <= D; d += step) {
    for (let i = 0; i < N; i++) {
      col[i] = re[i * (D + 1) + d];
      colRaw[i] = raw[i * (D + 1) + d];
    }
    col.sort();
    colRaw.sort();
    const row: Record<string, number> = { day: d };
    BANDS.forEach((q) => (row[`p${Math.round(q * 100)}`] = (quantile(col, q) - 1) * 100));
    row.raw50 = (quantile(colRaw, 0.5) - 1) * 100;
    row.raw5 = (quantile(colRaw, 0.05) - 1) * 100;
    // sample paths
    for (let s = 0; s < 8; s++) row[`s${s}`] = (re[s * (D + 1) + d] - 1) * 100;
    fan.push(row);
  }
  if (fan[fan.length - 1].day !== D) {
    // ensure the last day is present
    for (let i = 0; i < N; i++) {
      col[i] = re[i * (D + 1) + D];
      colRaw[i] = raw[i * (D + 1) + D];
    }
    col.sort();
    colRaw.sort();
    const row: Record<string, number> = { day: D };
    BANDS.forEach((q) => (row[`p${Math.round(q * 100)}`] = (quantile(col, q) - 1) * 100));
    row.raw50 = (quantile(colRaw, 0.5) - 1) * 100;
    row.raw5 = (quantile(colRaw, 0.05) - 1) * 100;
    for (let s = 0; s < 8; s++) row[`s${s}`] = (re[s * (D + 1) + D] - 1) * 100;
    fan.push(row);
  }

  const sortedRe = Float64Array.from(finalRe).sort();
  const sortedRaw = Float64Array.from(finalRaw).sort();
  const sortedDdRe = Float64Array.from(ddRe).sort();
  const sortedDdRaw = Float64Array.from(ddRaw).sort();
  const tail = (arr: Float64Array, q: number) => {
    const n = Math.max(1, Math.floor(arr.length * q));
    let s = 0;
    for (let i = 0; i < n; i++) s += arr[i];
    return s / n;
  };
  const mean = (arr: Float64Array) => arr.reduce((x, y) => x + y, 0) / arr.length;
  const stops = stopDay.filter((d) => d >= 0);

  return {
    fan,
    hist: histogram(finalRe, finalRaw),
    ddHist: ddHistogram(ddRe, ddRaw),
    stats: {
      median: quantile(sortedRe, 0.5),
      mean: mean(finalRe),
      p5: quantile(sortedRe, 0.05),
      p95: quantile(sortedRe, 0.95),
      cvar5: tail(sortedRe, 0.05),
      probProfit: finalRe.filter((x) => x > 0).length / N,
      probLoss10: finalRe.filter((x) => x < -0.1).length / N,
      probStop: stops.length / N,
      medianStopDay: stops.length ? [...stops].sort((x, y) => x - y)[Math.floor(stops.length / 2)] : null,
      cappedDayShare: cappedDays / (N * D),
      ddMedian: quantile(sortedDdRe, 0.5),
      dd95: quantile(sortedDdRe, 0.95),
      raw: {
        median: quantile(sortedRaw, 0.5),
        p5: quantile(sortedRaw, 0.05),
        cvar5: tail(sortedRaw, 0.05),
        probProfit: finalRaw.filter((x) => x > 0).length / N,
        dd95: quantile(sortedDdRaw, 0.95),
        worst: sortedRaw[0],
      },
    },
  };
}

function histogram(a: Float64Array, b: Float64Array) {
  const all = [...a, ...b];
  const lo = Math.max(-1, Math.floor(Math.min(...all) * 20) / 20);
  const hi = Math.ceil(Math.max(...all) * 20) / 20;
  const bins = 28;
  const w = Math.max(0.01, (hi - lo) / bins);
  const rows = Array.from({ length: bins }, (_, i) => ({ x: Math.round((lo + w * (i + 0.5)) * 1000) / 10, re: 0, raw: 0 }));
  const put = (v: number, key: "re" | "raw") => {
    const idx = Math.min(bins - 1, Math.max(0, Math.floor((v - lo) / w)));
    rows[idx][key]++;
  };
  a.forEach((v) => put(v, "re"));
  b.forEach((v) => put(v, "raw"));
  return rows;
}

function ddHistogram(a: Float64Array, b: Float64Array) {
  const bins = Array.from({ length: 12 }, (_, i) => ({ x: `${i * 5}–${i * 5 + 5}%`, lo: i * 0.05, re: 0, raw: 0 }));
  const put = (v: number, key: "re" | "raw") => (bins[Math.min(bins.length - 1, Math.floor(v / 0.05))][key] += 1);
  a.forEach((v) => put(v, "re"));
  b.forEach((v) => put(v, "raw"));
  return bins;
}

export type McResult = ReturnType<typeof runMonteCarlo>;

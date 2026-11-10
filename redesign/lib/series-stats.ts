import type { NavPoint } from "@/types/domain";

export const dailyReturns = (pts: NavPoint[]) => pts.slice(1).map((p, i) => p.nav / pts[i].nav - 1);

const mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const std = (a: number[]) => {
  const m = mean(a);
  return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, a.length - 1));
};

/** Statistics for a NAV window (used by the period stats strip). */
export function periodStats(pts: NavPoint[]) {
  const r = dailyReturns(pts);
  const ret = pts[pts.length - 1].nav / pts[0].nav - 1;
  let peak = pts[0].nav;
  let mdd = 0;
  for (const p of pts) {
    peak = Math.max(peak, p.nav);
    mdd = Math.max(mdd, 1 - p.nav / peak);
  }
  const sd = std(r);
  const days = r.length;
  return {
    ret,
    cagr: days >= 60 ? Math.pow(1 + ret, 365 / days) - 1 : null,
    vol: sd * Math.sqrt(365),
    sharpe: sd ? (mean(r) / sd) * Math.sqrt(365) : 0,
    maxDd: mdd,
    bestDay: Math.max(...r),
    worstDay: Math.min(...r),
    upDays: r.filter((x) => x > 0).length / Math.max(1, days),
    followerRet: pts[pts.length - 1].follower! / pts[0].follower! - 1,
    benchRet: pts[pts.length - 1].bench! / pts[0].bench! - 1,
  };
}

/** Rolling annualized Sharpe and volatility. */
export function rollingStats(pts: NavPoint[], window = 90) {
  const r = dailyReturns(pts);
  const out: { date: string; sharpe: number; vol: number }[] = [];
  for (let i = window; i <= r.length; i += 2) {
    const w = r.slice(i - window, i);
    const sd = std(w);
    out.push({
      date: pts[i].date,
      sharpe: Math.round((sd ? (mean(w) / sd) * Math.sqrt(365) : 0) * 100) / 100,
      vol: Math.round(sd * Math.sqrt(365) * 1000) / 10,
    });
  }
  return out;
}

/** Day-level stats across the whole history (for the daily P&L dashboard). */
export function dayStats(pts: NavPoint[]) {
  const r = dailyReturns(pts);
  const ups = r.filter((x) => x > 0);
  const downs = r.filter((x) => x < 0);
  let s = 0;
  let maxUp = 0;
  let maxDown = 0;
  for (const x of r) {
    s = x > 0 ? (s > 0 ? s + 1 : 1) : x < 0 ? (s < 0 ? s - 1 : -1) : 0;
    maxUp = Math.max(maxUp, s);
    maxDown = Math.min(maxDown, s);
  }
  return {
    days: r.length,
    upDays: ups.length / Math.max(1, r.length),
    avgUp: mean(ups),
    avgDown: mean(downs),
    bestDay: Math.max(...r),
    worstDay: Math.min(...r),
    upDownRatio: downs.length ? Math.abs(mean(ups) / mean(downs)) : 0,
    maxUpStreak: maxUp,
    maxDownStreak: Math.abs(maxDown),
  };
}

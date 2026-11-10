import type { Trade } from "@/mock/trades";

const mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const std = (a: number[]) => {
  const m = mean(a);
  return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, a.length - 1));
};
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function streaks(trades: Trade[]) {
  let w = 0;
  let l = 0;
  let maxW = 0;
  let maxL = 0;
  for (const t of trades) {
    if (t.r > 0) {
      w++;
      l = 0;
    } else {
      l++;
      w = 0;
    }
    maxW = Math.max(maxW, w);
    maxL = Math.max(maxL, l);
  }
  return { maxW, maxL };
}

function sideStats(trades: Trade[]) {
  const wins = trades.filter((t) => t.r > 0);
  return {
    trades: trades.length,
    winRate: trades.length ? wins.length / trades.length : 0,
    expectancyR: mean(trades.map((t) => t.r)),
    totalR: trades.reduce((a, t) => a + t.r, 0),
    pnlPct: trades.reduce((a, t) => a + t.pnlPct, 0),
  };
}

/** Professional trade-level analytics computed from a trade sample. */
export function tradeStats(trades: Trade[]) {
  const rs = trades.map((t) => t.r);
  const wins = trades.filter((t) => t.r > 0);
  const losses = trades.filter((t) => t.r <= 0);
  const winRate = wins.length / Math.max(1, trades.length);
  const avgWinR = mean(wins.map((t) => t.r));
  const avgLossR = Math.abs(mean(losses.map((t) => t.r)));
  const realizedRR = avgLossR ? avgWinR / avgLossR : 0;
  const expectancyR = mean(rs);
  const sqn = (Math.sqrt(Math.min(trades.length, 100)) * expectancyR) / (std(rs) || 1);
  const kelly = realizedRR ? winRate - (1 - winRate) / realizedRR : 0;
  const grossWinR = wins.reduce((a, t) => a + t.r, 0);
  const grossLossR = Math.abs(losses.reduce((a, t) => a + t.r, 0));
  const { maxW, maxL } = streaks(trades);

  // R-multiple histogram (−2R … +5R, 0.5R bins)
  const rBins: { r: string; lo: number; count: number }[] = [];
  for (let lo = -2; lo < 5; lo += 0.5) rBins.push({ r: `${lo >= 0 ? "+" : ""}${lo}`, lo, count: 0 });
  rs.forEach((r) => {
    const idx = Math.min(rBins.length - 1, Math.max(0, Math.floor((r + 2) / 0.5)));
    rBins[idx].count++;
  });

  // cumulative R curve, trade by trade
  let cum = 0;
  const cumR = trades.map((t, i) => {
    cum += t.r;
    return { n: i + 1, cumR: Math.round(cum * 100) / 100, r: t.r };
  });

  // by weekday / hour (close time, UTC)
  const byWeekday = WEEKDAYS.map((d) => ({ label: d, totalR: 0, trades: 0, wins: 0 }));
  const byHour = Array.from({ length: 24 }, (_, h) => ({ label: String(h).padStart(2, "0"), totalR: 0, trades: 0 }));
  trades.forEach((t) => {
    const d = new Date(t.close);
    const wd = (d.getUTCDay() + 6) % 7;
    byWeekday[wd].totalR += t.r;
    byWeekday[wd].trades++;
    if (t.r > 0) byWeekday[wd].wins++;
    byHour[d.getUTCHours()].totalR += t.r;
    byHour[d.getUTCHours()].trades++;
  });

  // risk per trade over time (to expose escalating size)
  const riskSeries = trades.map((t, i) => ({ n: i + 1, risk: t.riskPct }));
  const risks = trades.map((t) => t.riskPct);
  const sortedRisk = [...risks].sort((a, b) => a - b);

  return {
    sample: trades.length,
    from: trades[0]?.close,
    to: trades[trades.length - 1]?.close,
    winRate,
    avgRiskPct: mean(risks),
    medianRiskPct: sortedRisk[Math.floor(sortedRisk.length / 2)] ?? 0,
    maxRiskPct: Math.max(...risks),
    riskStdPct: std(risks),
    avgPlannedRR: mean(trades.map((t) => t.plannedRR)),
    realizedRR,
    avgWinR,
    avgLossR,
    expectancyR,
    sqn,
    kelly,
    profitFactorR: grossLossR ? grossWinR / grossLossR : 0,
    largestWinR: Math.max(...rs),
    largestLossR: Math.min(...rs),
    totalR: rs.reduce((a, b) => a + b, 0),
    maxConsecWins: maxW,
    maxConsecLosses: maxL,
    avgHoldWin: mean(wins.map((t) => t.holdHours)),
    avgHoldLoss: mean(losses.map((t) => t.holdHours)),
    avgMaeR: mean(trades.map((t) => t.maeR)),
    avgMfeR: mean(trades.map((t) => t.mfeR)),
    /** Share of the available favorable move captured by winners */
    captureRatio: mean(wins.map((t) => (t.mfeR ? t.r / t.mfeR : 0))),
    long: sideStats(trades.filter((t) => t.side === "long")),
    short: sideStats(trades.filter((t) => t.side === "short")),
    rBins,
    cumR,
    byWeekday: byWeekday.map((d) => ({ ...d, totalR: Math.round(d.totalR * 10) / 10, winRate: d.trades ? d.wins / d.trades : 0 })),
    byHour: byHour.map((h) => ({ ...h, totalR: Math.round(h.totalR * 10) / 10 })),
    riskSeries,
    recent: trades.slice(-12).reverse(),
  };
}

export type TradeStats = ReturnType<typeof tradeStats>;

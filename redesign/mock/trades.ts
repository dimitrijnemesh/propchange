import { gaussian, mulberry32 } from "@/lib/rng";
import type { Strategy } from "@/types/domain";

export interface Trade {
  id: number;
  open: string; // ISO datetime
  close: string;
  instrument: string;
  side: "long" | "short";
  /** Risk at stop, % of equity (e.g. 0.65 = 0.65%) */
  riskPct: number;
  /** Planned reward : risk at entry (target distance ÷ stop distance) */
  plannedRR: number;
  /** Realized R multiple (PnL ÷ initial risk) */
  r: number;
  /** Realized PnL, % of equity */
  pnlPct: number;
  holdHours: number;
  /** Max adverse / favorable excursion, in R */
  maeR: number;
  mfeR: number;
}

const SAMPLE = 400;

/**
 * Seeded trade-level sample (most recent trades) calibrated to the strategy's win rate,
 * payoff ratio, holding time and risk profile. Strategies flagged for martingale / averaging
 * down escalate size after losses, which shows up in the risk statistics.
 */
export function generateTrades(s: Strategy): Trade[] {
  const rand = mulberry32(s.navSeed + 101);
  const m = s.metrics;
  const n = Math.min(SAMPLE, m.trades);
  const martingale = s.flags.includes("Martingale pattern") || s.flags.includes("Averaging down");
  const baseRisk = 0.3 + (m.riskScore / 100) * 1.1; // % equity
  const meanLossR = 0.86;
  const meanPlannedRR = (m.payoffRatio * meanLossR) / 0.82;
  const end = new Date((s.closedAt ?? "2026-10-06") + "T20:00:00Z").getTime();
  const spanMs = Math.min(m.historyDays, Math.max(30, (n / m.trades) * m.historyDays)) * 86_400_000;
  const weights = s.instrumentPnl.map((x) => Math.max(5, x.pnlPct));
  const wSum = weights.reduce((a, b) => a + b, 0);
  const forex = s.markets.includes("forex");

  // close times spread over the span, sorted ascending
  const closes = Array.from({ length: n }, () => end - rand() * spanMs).sort((a, b) => a - b);
  const trades: Trade[] = [];
  let lossStreak = 0;
  closes.forEach((closeMs, i) => {
    // session-aware close hour
    const d = new Date(closeMs);
    const hour = forex ? 7 + Math.floor(rand() * 10) : Math.floor(rand() * 24);
    d.setUTCHours(hour, Math.floor(rand() * 60));
    // skip weekends for non-crypto markets
    if (!s.markets.includes("crypto")) {
      const wd = d.getUTCDay();
      if (wd === 0) d.setUTCDate(d.getUTCDate() + 1);
      if (wd === 6) d.setUTCDate(d.getUTCDate() - 1);
    }
    const hold = Math.max(0.1, -Math.log(1 - rand()) * m.avgHoldHours);
    const open = new Date(d.getTime() - hold * 3_600_000);

    let risk = baseRisk * (0.75 + rand() * 0.5);
    if (martingale) risk *= Math.min(4, Math.pow(1.6, lossStreak));
    const plannedRR = Math.max(0.08, meanPlannedRR * (0.8 + rand() * 0.45));
    const win = rand() < m.winRate;
    let r: number;
    let mae: number;
    let mfe: number;
    if (win) {
      r = plannedRR * (0.55 + rand() * 0.6);
      mae = rand() * 0.7;
      mfe = r * (1 + rand() * 0.4);
      lossStreak = 0;
    } else {
      r = -(0.6 + rand() * 0.45) - (rand() < 0.06 ? 0.25 + rand() * 0.3 : 0); // occasional stop slippage
      mae = Math.abs(r) * (1 + rand() * 0.1);
      mfe = rand() * 0.8;
      lossStreak++;
    }
    const k = (() => {
      let x = rand() * wSum;
      for (let j = 0; j < weights.length; j++) {
        x -= weights[j];
        if (x <= 0) return j;
      }
      return 0;
    })();
    trades.push({
      id: i + 1,
      open: open.toISOString(),
      close: d.toISOString(),
      instrument: s.instruments[k] ?? s.instruments[0],
      side: rand() < 0.58 + gaussian(rand) * 0.02 ? "long" : "short",
      riskPct: round(risk, 3),
      plannedRR: round(plannedRR, 2),
      r: round(r, 3),
      pnlPct: round((r * risk) / 1, 4),
      holdHours: round(hold, 2),
      maeR: round(mae, 2),
      mfeR: round(mfe, 2),
    });
  });
  return trades;
}

const round = (x: number, d: number) => Math.round(x * 10 ** d) / 10 ** d;

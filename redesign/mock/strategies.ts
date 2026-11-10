import { seatPrice, FEE_SPLIT } from "@/lib/pricing";
import { procSpecs } from "./procedural";
import { mulberry32 } from "@/lib/rng";
import type { Epoch, Market, MetricSet, RiskRule, Strategy, StrategyState, Venue } from "@/types/domain";
import { TODAY, addDays, computeSeriesMetrics, navSeries } from "./nav";

interface Fixture {
  id: string;
  name: string;
  trader: string;
  markets: Market[];
  instruments: string[];
  venue: Venue;
  style: string;
  description: string;
  state: StrategyState;
  historyDays: number;
  /** closed strategies stop N days ago */
  closedDaysAgo?: number;
  r: number;
  mdd: number;
  trades: number;
  winRate: number;
  profitFactor: number;
  expectancyBps: number;
  avgHoldHours: number;
  payoffRatio: number;
  tailRatio: number;
  maxLeverage: number;
  avgLeverage: number;
  top3PnlShare: number;
  riskScore: number;
  consistencyScore: number;
  fullCapacityUsd: number;
  seatAllocationUsd: number;
  seatsTaken: number;
  waitlist: number;
  minAccountUsd: number;
  basePriceUsdc: number;
  compliance: { kept: number; settled: number };
  breaches: { index: number; kind: "hard" | "soft"; reason: string }[];
  contract: {
    p99Daily: number;
    p95Lev: number;
    p95Pos: number;
    minTrades: number;
    tightened?: { daily_loss?: number; leverage?: number; position_size?: number };
    usage: { dd: number; daily: number; lev: number; pos: number; trades: number };
  };
  epochStartDaysAgo: number;
  flags: string[];
  slippageBps: number;
  instrumentPnl: number[];
  seatPrice7dChange: number;
  seatsTraded30d: number;
  override?: Partial<MetricSet>;
  closedReason?: string;
  pausedReason?: string;
}

const fixtures: Fixture[] = [
  {
    id: "eth-swing",
    name: "ETH Swing",
    trader: "alex.k",
    markets: ["crypto"],
    instruments: ["ETH", "BTC", "SOL"],
    venue: "Binance",
    style: "Swing · 1–3 day holds",
    description:
      "Multi-day swing trades on ETH with BTC and SOL as secondary instruments. Entries on 4h structure breaks after pullbacks, fixed fractional sizing, hard stop on every position. No averaging down.",
    state: "active",
    historyDays: 412,
    r: 0.384,
    mdd: 0.12,
    trades: 1284,
    winRate: 0.54,
    profitFactor: 1.72,
    expectancyBps: 15,
    avgHoldHours: 31,
    payoffRatio: 1.47,
    tailRatio: 2.1,
    maxLeverage: 5.6,
    avgLeverage: 2.4,
    top3PnlShare: 0.14,
    riskScore: 32,
    consistencyScore: 84,
    fullCapacityUsd: 312_500,
    seatAllocationUsd: 3000,
    seatsTaken: 87,
    waitlist: 0,
    minAccountUsd: 1000,
    basePriceUsdc: 30,
    compliance: { kept: 11, settled: 12 },
    breaches: [{ index: 5, kind: "hard", reason: "Daily loss 3.4% exceeded the 3.0% limit on Mar 18" }],
    contract: {
      p99Daily: 2.5,
      p95Lev: 5,
      p95Pos: 20,
      minTrades: 10,
      usage: { dd: 6.2, daily: 1.1, lev: 3.8, pos: 18, trades: 6 },
    },
    epochStartDaysAgo: 15,
    flags: [],
    slippageBps: 2.1,
    instrumentPnl: [61, 27, 12],
    seatPrice7dChange: 0.034,
    seatsTraded30d: 14,
    override: { sharpe: 1.84 },
  },
  {
    id: "btc-scalping",
    name: "BTC Scalping",
    trader: "alex.k",
    markets: ["crypto"],
    instruments: ["BTC"],
    venue: "Bybit",
    style: "Intraday scalping · minutes",
    description:
      "High-frequency intraday BTC perpetual scalping around liquidity sweeps. Tight stops, small edge per trade, low capacity by design.",
    state: "full",
    historyDays: 400,
    r: 0.296,
    mdd: 0.074,
    trades: 6120,
    winRate: 0.58,
    profitFactor: 1.41,
    expectancyBps: 6,
    avgHoldHours: 0.6,
    payoffRatio: 1.02,
    tailRatio: 1.6,
    maxLeverage: 4.2,
    avgLeverage: 1.9,
    top3PnlShare: 0.04,
    riskScore: 24,
    consistencyScore: 88,
    fullCapacityUsd: 50_000,
    seatAllocationUsd: 3000,
    seatsTaken: 16,
    waitlist: 23,
    minAccountUsd: 1500,
    basePriceUsdc: 45,
    compliance: { kept: 9, settled: 9 },
    breaches: [],
    contract: {
      p99Daily: 1.6,
      p95Lev: 4,
      p95Pos: 25,
      minTrades: 60,
      usage: { dd: 2.1, daily: 0.6, lev: 2.4, pos: 14, trades: 41 },
    },
    epochStartDaysAgo: 9,
    flags: [],
    slippageBps: 1.4,
    instrumentPnl: [100],
    seatPrice7dChange: 0.0,
    seatsTraded30d: 3,
  },
  {
    id: "majors-trend",
    name: "Majors Trend",
    trader: "alex.k",
    markets: ["crypto"],
    instruments: ["BTC", "ETH", "SOL", "BNB", "XRP"],
    venue: "Binance",
    style: "Trend following · 1–3 week holds",
    description:
      "Daily-timeframe trend following across the five most liquid crypto majors. Volatility-scaled position sizes, trailing stops, wide diversification — high capacity.",
    state: "active",
    historyDays: 620,
    r: 0.214,
    mdd: 0.143,
    trades: 388,
    winRate: 0.41,
    profitFactor: 1.86,
    expectancyBps: 42,
    avgHoldHours: 260,
    payoffRatio: 2.7,
    tailRatio: 1.3,
    maxLeverage: 2.8,
    avgLeverage: 1.4,
    top3PnlShare: 0.22,
    riskScore: 38,
    consistencyScore: 76,
    fullCapacityUsd: 1_000_000,
    seatAllocationUsd: 3000,
    seatsTaken: 141,
    waitlist: 0,
    minAccountUsd: 2000,
    basePriceUsdc: 18,
    compliance: { kept: 15, settled: 16 },
    breaches: [{ index: 9, kind: "soft", reason: "Minimum activity not met (4 of ≥ 6 trades)" }],
    contract: {
      p99Daily: 3.1,
      p95Lev: 2.3,
      p95Pos: 18,
      minTrades: 6,
      usage: { dd: 4.4, daily: 0.9, lev: 1.6, pos: 12, trades: 3 },
    },
    epochStartDaysAgo: 21,
    flags: [],
    slippageBps: 0.9,
    instrumentPnl: [38, 29, 18, 9, 6],
    seatPrice7dChange: 0.012,
    seatsTraded30d: 9,
  },
  {
    id: "sol-momentum",
    name: "SOL Momentum",
    trader: "alex.k",
    markets: ["crypto"],
    instruments: ["SOL"],
    venue: "Binance",
    style: "Momentum · intraday to 2 days",
    description: "Momentum continuation on SOL. Closed by the trader after a hard breach.",
    state: "closed",
    historyDays: 240,
    closedDaysAgo: 160,
    r: -0.18,
    mdd: 0.29,
    trades: 512,
    winRate: 0.46,
    profitFactor: 0.88,
    expectancyBps: -4,
    avgHoldHours: 14,
    payoffRatio: 1.04,
    tailRatio: 3.2,
    maxLeverage: 6.4,
    avgLeverage: 3.1,
    top3PnlShare: 0.35,
    riskScore: 71,
    consistencyScore: 34,
    fullCapacityUsd: 120_000,
    seatAllocationUsd: 3000,
    seatsTaken: 0,
    waitlist: 0,
    minAccountUsd: 1000,
    basePriceUsdc: 25,
    compliance: { kept: 3, settled: 5 },
    breaches: [
      { index: 2, kind: "soft", reason: "Minimum activity not met (7 of ≥ 12 trades)" },
      { index: 5, kind: "hard", reason: "Max drawdown 22.4% exceeded the 21.0% limit" },
    ],
    contract: {
      p99Daily: 4.1,
      p95Lev: 5,
      p95Pos: 28,
      minTrades: 12,
      usage: { dd: 22.4, daily: 3.9, lev: 4.8, pos: 30, trades: 19 },
    },
    epochStartDaysAgo: 0,
    flags: ["Concentration"],
    slippageBps: 4.8,
    instrumentPnl: [100],
    seatPrice7dChange: 0,
    seatsTraded30d: 0,
    closedReason: "Closed by trader after a hard breach in Epoch 5",
  },
  {
    id: "fx-mean-reversion",
    name: "FX Mean Reversion",
    trader: "mira.fx",
    markets: ["forex"],
    instruments: ["EURUSD", "GBPUSD", "EURGBP", "USDCHF"],
    venue: "MT5",
    style: "Mean reversion · hours",
    description:
      "Fades statistically stretched moves on liquid FX majors during low-impact sessions. Small size, many trades, strict daily loss cap — trader tightened two generated rules.",
    state: "active",
    historyDays: 700,
    r: 0.171,
    mdd: 0.058,
    trades: 2410,
    winRate: 0.63,
    profitFactor: 1.58,
    expectancyBps: 4,
    avgHoldHours: 5.5,
    payoffRatio: 0.93,
    tailRatio: 2.4,
    maxLeverage: 9.6,
    avgLeverage: 4.2,
    top3PnlShare: 0.05,
    riskScore: 18,
    consistencyScore: 91,
    fullCapacityUsd: 600_000,
    seatAllocationUsd: 3000,
    seatsTaken: 172,
    waitlist: 0,
    minAccountUsd: 800,
    basePriceUsdc: 35,
    compliance: { kept: 12, settled: 12 },
    breaches: [],
    contract: {
      p99Daily: 1.25,
      p95Lev: 8.3,
      p95Pos: 40,
      minTrades: 40,
      tightened: { daily_loss: 1.2, leverage: 8 },
      usage: { dd: 1.8, daily: 0.4, lev: 5.1, pos: 32, trades: 52 },
    },
    epochStartDaysAgo: 18,
    flags: [],
    slippageBps: 0.6,
    instrumentPnl: [44, 31, 15, 10],
    seatPrice7dChange: 0.051,
    seatsTraded30d: 21,
  },
  {
    id: "xau-breakout",
    name: "Gold Breakout",
    trader: "mira.fx",
    markets: ["forex"],
    instruments: ["XAUUSD"],
    venue: "MT5",
    style: "Breakout · 1–5 day holds",
    description:
      "Trades range breakouts on gold around London and New York opens. Currently paused after a hard drawdown breach; reopens next Epoch with a regenerated contract.",
    state: "paused",
    historyDays: 330,
    r: 0.243,
    mdd: 0.156,
    trades: 296,
    winRate: 0.44,
    profitFactor: 1.49,
    expectancyBps: 28,
    avgHoldHours: 52,
    payoffRatio: 1.9,
    tailRatio: 2.2,
    maxLeverage: 7.1,
    avgLeverage: 3.3,
    top3PnlShare: 0.27,
    riskScore: 54,
    consistencyScore: 62,
    fullCapacityUsd: 180_000,
    seatAllocationUsd: 3000,
    seatsTaken: 38,
    waitlist: 0,
    minAccountUsd: 1500,
    basePriceUsdc: 32,
    compliance: { kept: 7, settled: 9 },
    breaches: [
      { index: 4, kind: "hard", reason: "Leverage 8.9x exceeded the 8.0x limit" },
      { index: 9, kind: "hard", reason: "Max drawdown 19.8% exceeded the 19.5% limit on Oct 2" },
    ],
    contract: {
      p99Daily: 3.3,
      p95Lev: 6.7,
      p95Pos: 34,
      minTrades: 8,
      usage: { dd: 19.8, daily: 2.6, lev: 5.9, pos: 41, trades: 12 },
    },
    epochStartDaysAgo: 26,
    flags: ["Concentration"],
    slippageBps: 3.2,
    instrumentPnl: [100],
    seatPrice7dChange: -0.087,
    seatsTraded30d: 6,
    pausedReason:
      "Hard breach on Oct 2: max drawdown 19.8% exceeded the 19.5% limit. Copying stopped and Epoch 9 fees were refunded to followers.",
  },
  {
    id: "london-session",
    name: "London Session Scalper",
    trader: "mira.fx",
    markets: ["forex"],
    instruments: ["GBPUSD", "EURUSD"],
    venue: "MT5",
    style: "Scalping · London open",
    description: "Short-hold scalps in the first two hours of the London session. Rookie stage: limited Seats and capped price until 3 consecutive kept Epochs.",
    state: "rookie",
    historyDays: 84,
    r: 0.061,
    mdd: 0.031,
    trades: 112,
    winRate: 0.6,
    profitFactor: 1.38,
    expectancyBps: 3,
    avgHoldHours: 1.2,
    payoffRatio: 0.92,
    tailRatio: 1.8,
    maxLeverage: 6,
    avgLeverage: 3,
    top3PnlShare: 0.12,
    riskScore: 29,
    consistencyScore: 58,
    fullCapacityUsd: 400_000,
    seatAllocationUsd: 3000,
    seatsTaken: 4,
    waitlist: 0,
    minAccountUsd: 800,
    basePriceUsdc: 15,
    compliance: { kept: 1, settled: 1 },
    breaches: [],
    contract: {
      p99Daily: 0.9,
      p95Lev: 5,
      p95Pos: 30,
      minTrades: 25,
      usage: { dd: 0.8, daily: 0.3, lev: 2.2, pos: 18, trades: 19 },
    },
    epochStartDaysAgo: 12,
    flags: ["Thin sample"],
    slippageBps: 1.1,
    instrumentPnl: [72, 28],
    seatPrice7dChange: 0.0,
    seatsTraded30d: 1,
  },
  {
    id: "alt-momentum-x",
    name: "Altcoin Momentum X",
    trader: "jtan",
    markets: ["crypto"],
    instruments: ["DOGE", "PEPE", "WIF", "SOL"],
    venue: "Bybit",
    style: "Momentum · high leverage",
    description:
      "Aggressive momentum on small-cap altcoins with position adds into losers. Spectacular headline return, but the risk profile is flagged — shown here to illustrate why PropChange does not rank by return.",
    state: "active",
    historyDays: 380,
    r: 2.12,
    mdd: 0.61,
    trades: 734,
    winRate: 0.71,
    profitFactor: 1.31,
    expectancyBps: 22,
    avgHoldHours: 9,
    payoffRatio: 0.53,
    tailRatio: 6.8,
    maxLeverage: 18,
    avgLeverage: 7.5,
    top3PnlShare: 0.58,
    riskScore: 88,
    consistencyScore: 31,
    fullCapacityUsd: 40_000,
    seatAllocationUsd: 3000,
    seatsTaken: 11,
    waitlist: 0,
    minAccountUsd: 2500,
    basePriceUsdc: 60,
    compliance: { kept: 5, settled: 8 },
    breaches: [
      { index: 2, kind: "hard", reason: "Max drawdown 64.2% exceeded the 63.0% limit" },
      { index: 5, kind: "hard", reason: "Martingale pattern detected above threshold" },
      { index: 7, kind: "soft", reason: "Data gap of 9h during open positions" },
    ],
    contract: {
      p99Daily: 14,
      p95Lev: 15,
      p95Pos: 60,
      minTrades: 20,
      usage: { dd: 41, daily: 9.8, lev: 14.1, pos: 77, trades: 31 },
    },
    epochStartDaysAgo: 6,
    flags: ["Martingale pattern", "Averaging down", "Hidden tail risk", "Concentration"],
    slippageBps: 11.5,
    instrumentPnl: [48, 29, 17, 6],
    seatPrice7dChange: -0.021,
    seatsTraded30d: 8,
  },
  {
    id: "nq-trend",
    name: "Index Futures Trend",
    trader: "jtan",
    markets: ["futures"],
    instruments: ["NAS100", "US500"],
    venue: "MT5",
    style: "Trend · 2–10 day holds",
    description: "Systematic trend following on US equity index futures CFDs with volatility targeting.",
    state: "active",
    historyDays: 520,
    r: 0.192,
    mdd: 0.098,
    trades: 341,
    winRate: 0.45,
    profitFactor: 1.64,
    expectancyBps: 31,
    avgHoldHours: 120,
    payoffRatio: 2.0,
    tailRatio: 1.7,
    maxLeverage: 3.5,
    avgLeverage: 1.8,
    top3PnlShare: 0.18,
    riskScore: 35,
    consistencyScore: 74,
    fullCapacityUsd: 900_000,
    seatAllocationUsd: 3000,
    seatsTaken: 118,
    waitlist: 0,
    minAccountUsd: 1200,
    basePriceUsdc: 25,
    compliance: { kept: 10, settled: 11 },
    breaches: [{ index: 6, kind: "soft", reason: "Data gap of 3h during an open position" }],
    contract: {
      p99Daily: 2.4,
      p95Lev: 2.9,
      p95Pos: 45,
      minTrades: 6,
      usage: { dd: 3.1, daily: 0.7, lev: 2.2, pos: 31, trades: 4 },
    },
    epochStartDaysAgo: 3,
    flags: [],
    slippageBps: 0.8,
    instrumentPnl: [66, 34],
    seatPrice7dChange: 0.018,
    seatsTraded30d: 11,
  },
  {
    id: "funding-carry",
    name: "Funding Rate Carry",
    trader: "jtan",
    markets: ["crypto"],
    instruments: ["BTC", "ETH"],
    venue: "Bybit",
    style: "Delta-neutral carry",
    description: "Collects perpetual funding with hedged spot/perp positions. Very low volatility, very high capacity.",
    state: "active",
    historyDays: 450,
    r: 0.118,
    mdd: 0.031,
    trades: 204,
    winRate: 0.81,
    profitFactor: 3.1,
    expectancyBps: 18,
    avgHoldHours: 190,
    payoffRatio: 0.72,
    tailRatio: 2.9,
    maxLeverage: 2.1,
    avgLeverage: 1.6,
    top3PnlShare: 0.09,
    riskScore: 12,
    consistencyScore: 93,
    fullCapacityUsd: 1_500_000,
    seatAllocationUsd: 3000,
    seatsTaken: 233,
    waitlist: 0,
    minAccountUsd: 3000,
    basePriceUsdc: 20,
    compliance: { kept: 8, settled: 8 },
    breaches: [],
    contract: {
      p99Daily: 0.6,
      p95Lev: 1.9,
      p95Pos: 50,
      minTrades: 4,
      usage: { dd: 0.4, daily: 0.1, lev: 1.5, pos: 46, trades: 5 },
    },
    epochStartDaysAgo: 24,
    flags: [],
    slippageBps: 0.5,
    instrumentPnl: [58, 42],
    seatPrice7dChange: 0.009,
    seatsTraded30d: 17,
  },
  {
    id: "doge-grid",
    name: "DOGE Grid",
    trader: "jtan",
    markets: ["crypto"],
    instruments: ["DOGE"],
    venue: "Bybit",
    style: "Grid · averaging",
    description: "Grid strategy with averaging. Breached twice and was closed by the platform's rules.",
    state: "closed",
    historyDays: 150,
    closedDaysAgo: 210,
    r: -0.34,
    mdd: 0.47,
    trades: 1990,
    winRate: 0.88,
    profitFactor: 0.71,
    expectancyBps: -6,
    avgHoldHours: 20,
    payoffRatio: 0.11,
    tailRatio: 9.1,
    maxLeverage: 12,
    avgLeverage: 6,
    top3PnlShare: 0.6,
    riskScore: 92,
    consistencyScore: 18,
    fullCapacityUsd: 60_000,
    seatAllocationUsd: 3000,
    seatsTaken: 0,
    waitlist: 0,
    minAccountUsd: 1000,
    basePriceUsdc: 20,
    compliance: { kept: 1, settled: 3 },
    breaches: [
      { index: 2, kind: "hard", reason: "Averaging-down pattern above threshold" },
      { index: 3, kind: "hard", reason: "Max drawdown 41% exceeded the 38% limit" },
    ],
    contract: {
      p99Daily: 6,
      p95Lev: 10,
      p95Pos: 60,
      minTrades: 50,
      usage: { dd: 41, daily: 7, lev: 11, pos: 80, trades: 300 },
    },
    epochStartDaysAgo: 0,
    flags: ["Averaging down", "Hidden tail risk"],
    slippageBps: 7.5,
    instrumentPnl: [100],
    seatPrice7dChange: 0,
    seatsTraded30d: 0,
    closedReason: "Breached — closed after two hard breaches (Epoch 3)",
  },
  {
    id: "us-tech-swing",
    name: "US Tech Swing",
    trader: "kenji.q",
    markets: ["stocks"],
    instruments: ["NVDA", "MSFT", "AAPL", "AMZN", "META"],
    venue: "MT5",
    style: "Swing · 3–15 day holds",
    description: "Earnings-drift and relative-strength swing trades on mega-cap US tech via MT5 CFDs.",
    state: "active",
    historyDays: 480,
    r: 0.265,
    mdd: 0.109,
    trades: 268,
    winRate: 0.52,
    profitFactor: 1.81,
    expectancyBps: 46,
    avgHoldHours: 170,
    payoffRatio: 1.67,
    tailRatio: 1.9,
    maxLeverage: 2.4,
    avgLeverage: 1.5,
    top3PnlShare: 0.21,
    riskScore: 36,
    consistencyScore: 78,
    fullCapacityUsd: 2_000_000,
    seatAllocationUsd: 3000,
    seatsTaken: 98,
    waitlist: 0,
    minAccountUsd: 1500,
    basePriceUsdc: 28,
    compliance: { kept: 6, settled: 7 },
    breaches: [{ index: 3, kind: "hard", reason: "Position size 34% exceeded the 33% limit" }],
    contract: {
      p99Daily: 2.8,
      p95Lev: 2,
      p95Pos: 22,
      minTrades: 5,
      usage: { dd: 5.2, daily: 1.4, lev: 1.8, pos: 25, trades: 4 },
    },
    epochStartDaysAgo: 11,
    flags: [],
    slippageBps: 1.2,
    instrumentPnl: [34, 22, 18, 15, 11],
    seatPrice7dChange: 0.027,
    seatsTraded30d: 12,
  },
  {
    id: "es-mean-reversion",
    name: "ES Mean Reversion",
    trader: "kenji.q",
    markets: ["futures"],
    instruments: ["US500"],
    venue: "MT5",
    style: "Mean reversion · 1–2 days",
    description: "Buys short-term oversold conditions in the S&P 500 with a time stop. Rookie stage.",
    state: "rookie",
    historyDays: 98,
    r: 0.048,
    mdd: 0.036,
    trades: 64,
    winRate: 0.67,
    profitFactor: 1.52,
    expectancyBps: 19,
    avgHoldHours: 30,
    payoffRatio: 0.77,
    tailRatio: 2.6,
    maxLeverage: 2,
    avgLeverage: 1.2,
    top3PnlShare: 0.29,
    riskScore: 33,
    consistencyScore: 52,
    fullCapacityUsd: 700_000,
    seatAllocationUsd: 3000,
    seatsTaken: 9,
    waitlist: 0,
    minAccountUsd: 1000,
    basePriceUsdc: 15,
    compliance: { kept: 1, settled: 1 },
    breaches: [],
    contract: {
      p99Daily: 1.7,
      p95Lev: 1.8,
      p95Pos: 70,
      minTrades: 4,
      usage: { dd: 1.1, daily: 0.6, lev: 1.0, pos: 55, trades: 3 },
    },
    epochStartDaysAgo: 20,
    flags: ["Thin sample"],
    slippageBps: 0.7,
    instrumentPnl: [100],
    seatPrice7dChange: 0.0,
    seatsTraded30d: 2,
  },
];

/* ------------------------------------------------------------------ */

const seedOf = (id: string) => [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const r1 = (n: number) => Math.round(n * 10) / 10;

/* ---------- generated fixtures: more traders & strategies ---------- */

interface Spec {
  id: string;
  name: string;
  trader: string;
  markets: Market[];
  instruments: string[];
  venue: Venue;
  style: string;
  description: string;
  state?: StrategyState;
  days: number;
  r: number;
  mdd: number;
  risk: number;
  cap: number;
  taken: number;
  base: number;
  kept: number;
  settled: number;
  win: number;
  payoff: number;
  trades: number;
  hold: number;
  flags?: string[];
  waitlist?: number;
  closedDaysAgo?: number;
  closedReason?: string;
  pausedReason?: string;
}

const LEV: Record<Market, number> = { crypto: 3.2, forex: 6.5, futures: 2.6, stocks: 1.9 };
const SLIP: Record<Market, number> = { crypto: 1.6, forex: 0.7, futures: 0.8, stocks: 1.1 };
const BREACH_REASONS = {
  hard: ["Daily loss exceeded the contract limit", "Leverage exceeded the contract limit", "Max drawdown exceeded the contract limit", "Position size exceeded the contract limit"],
  soft: ["Minimum activity not met", "Data gap during open positions"],
};

function gen(x: Spec): Fixture {
  const rand = mulberry32(seedOf(x.id) + 31);
  const m = x.markets[0];
  const lev = LEV[m] * (0.7 + x.risk / 90);
  const nBreach = x.settled - x.kept;
  const breaches = Array.from({ length: nBreach }, (_, j) => {
    const kind: "hard" | "soft" = j % 3 === 2 ? "soft" : "hard";
    const list = BREACH_REASONS[kind];
    return { index: Math.max(1, Math.round(((j + 1) * x.settled) / (nBreach + 1))), kind, reason: list[Math.floor(rand() * list.length)] };
  });
  const mddLimit = x.mdd * 100 * 1.25;
  const p99Daily = Math.round(x.mdd * 100 * 0.21 * 10) / 10;
  const p95Lev = Math.round(lev * 0.85 * 10) / 10;
  const p95Pos = Math.round(18 + x.risk / 4);
  const minTrades = Math.max(3, Math.round((x.trades / x.days) * 30 * 0.55));
  const u = () => 0.15 + rand() * 0.55;
  const r1x = (n: number) => Math.round(n * 10) / 10;
  const shares = x.instruments.map((_, i) => Math.pow(0.6, i));
  const sum = shares.reduce((a, b) => a + b, 0);
  return {
    id: x.id,
    name: x.name,
    trader: x.trader,
    markets: x.markets,
    instruments: x.instruments,
    venue: x.venue,
    style: x.style,
    description: x.description,
    state: x.state ?? (x.taken >= Math.floor(x.cap / 3000) ? "full" : "active"),
    historyDays: x.days,
    closedDaysAgo: x.closedDaysAgo,
    r: x.r,
    mdd: x.mdd,
    trades: x.trades,
    winRate: x.win,
    profitFactor: Math.round(((x.win * x.payoff) / (1 - x.win)) * 100) / 100,
    expectancyBps: Math.max(2, Math.round((x.r * 1e4) / ((x.trades / x.days) * 365) / 4)),
    avgHoldHours: x.hold,
    payoffRatio: x.payoff,
    tailRatio: r1x(1.4 + x.risk / 35),
    maxLeverage: r1x(lev),
    avgLeverage: r1x(lev * 0.45),
    top3PnlShare: Math.round((0.06 + x.risk / 380) * 100) / 100,
    riskScore: x.risk,
    consistencyScore: Math.max(15, Math.min(95, Math.round(96 - x.risk * 0.65 + (rand() - 0.5) * 10))),
    fullCapacityUsd: x.cap,
    seatAllocationUsd: 3000,
    seatsTaken: x.taken,
    waitlist: x.waitlist ?? (x.taken >= Math.floor(x.cap / 3000) ? 6 + Math.floor(rand() * 40) : 0),
    minAccountUsd: m === "forex" ? 800 : 1000,
    basePriceUsdc: x.base,
    compliance: { kept: x.kept, settled: x.settled },
    breaches,
    contract: {
      p99Daily,
      p95Lev,
      p95Pos,
      minTrades,
      usage: {
        dd: r1x(mddLimit * u()),
        daily: r1x(p99Daily * 1.2 * u()),
        lev: r1x(p95Lev * 1.2 * u()),
        pos: Math.round(p95Pos * 1.5 * u()),
        trades: Math.round(minTrades * (0.3 + rand() * 0.9)),
      },
    },
    epochStartDaysAgo: 2 + Math.floor(rand() * 25),
    flags: x.flags ?? [],
    slippageBps: r1x(SLIP[m] * (0.7 + x.risk / 70)),
    instrumentPnl: shares.map((v) => Math.round((v / sum) * 100)),
    seatPrice7dChange: Math.round((rand() * 0.16 - 0.05) * 1000) / 1000,
    seatsTraded30d: Math.round(x.taken * (0.05 + rand() * 0.12)),
    closedReason: x.closedReason,
    pausedReason: x.pausedReason,
  };
}

const D = (s: string) => s; // readability helper for descriptions

const generated: Fixture[] = [
  // nordic.quant — futures
  gen({ id: "global-macro-trend", name: "Global Macro Trend", trader: "nordic.quant", markets: ["futures"], instruments: ["US500", "GER40", "NAS100", "JP225"], venue: "MT5", style: "Trend · 1–4 week holds", description: D("Multi-market index trend following with volatility targeting and strict portfolio heat limits."), days: 760, r: 0.163, mdd: 0.084, risk: 26, cap: 2_400_000, taken: 412, base: 26, kept: 20, settled: 21, win: 0.43, payoff: 2.3, trades: 290, hold: 300 }),
  gen({ id: "rates-carry", name: "Index Carry & Roll", trader: "nordic.quant", markets: ["futures"], instruments: ["US500", "UK100"], venue: "MT5", style: "Carry · weeks", description: D("Harvests roll yield and carry on index futures with defined drawdown brakes."), days: 540, r: 0.094, mdd: 0.041, risk: 14, cap: 3_000_000, taken: 286, base: 18, kept: 15, settled: 15, win: 0.68, payoff: 0.9, trades: 140, hold: 420 }),
  // sato.fx — forex
  gen({ id: "tokyo-yen-scalper", name: "Tokyo Yen Scalper", trader: "sato.fx", markets: ["forex"], instruments: ["USDJPY", "EURJPY", "GBPJPY"], venue: "MT5", style: "Scalping · Tokyo session", description: D("Short-hold scalps during the Tokyo session on yen crosses, flat before London."), days: 520, r: 0.212, mdd: 0.067, risk: 27, cap: 260_000, taken: 86, base: 38, kept: 15, settled: 16, win: 0.61, payoff: 1.05, trades: 2900, hold: 0.8, waitlist: 0 }),
  gen({ id: "carry-basket", name: "G10 Carry Basket", trader: "sato.fx", markets: ["forex"], instruments: ["AUDJPY", "NZDJPY", "USDCHF"], venue: "MT5", style: "Carry · swing", description: D("Positive-carry FX basket with volatility filters and a hard risk-off switch."), days: 610, r: 0.118, mdd: 0.072, risk: 31, cap: 900_000, taken: 154, base: 22, kept: 17, settled: 19, win: 0.57, payoff: 1.3, trades: 260, hold: 160 }),
  gen({ id: "yen-breakout-rookie", name: "Yen Breakout", trader: "sato.fx", markets: ["forex"], instruments: ["USDJPY"], venue: "MT5", style: "Breakout · intraday", description: D("Breakouts of the Asian range on USDJPY. Rookie stage."), state: "rookie", days: 92, r: 0.052, mdd: 0.029, risk: 30, cap: 350_000, taken: 7, base: 15, kept: 1, settled: 1, win: 0.47, payoff: 1.6, trades: 88, hold: 4, flags: ["Thin sample"] }),
  // lucas.m — crypto
  gen({ id: "btc-basis", name: "BTC Basis Arb", trader: "lucas.m", markets: ["crypto"], instruments: ["BTC"], venue: "Binance", style: "Delta-neutral basis", description: D("Captures the spread between BTC perpetuals and spot. Very low volatility, capacity-rich."), days: 480, r: 0.089, mdd: 0.018, risk: 10, cap: 2_000_000, taken: 512, base: 22, kept: 13, settled: 13, win: 0.86, payoff: 0.6, trades: 340, hold: 140 }),
  gen({ id: "eth-mean-revert", name: "ETH Mean Reversion", trader: "lucas.m", markets: ["crypto"], instruments: ["ETH", "BTC"], venue: "Binance", style: "Mean reversion · hours", description: D("Fades intraday overextensions on ETH with BTC as a hedge leg."), days: 430, r: 0.276, mdd: 0.105, risk: 37, cap: 380_000, taken: 121, base: 34, kept: 12, settled: 13, win: 0.6, payoff: 1.1, trades: 1700, hold: 7 }),
  gen({ id: "majors-mm", name: "Majors Liquidity", trader: "lucas.m", markets: ["crypto"], instruments: ["BTC", "ETH", "SOL"], venue: "Bybit", style: "Market-making style · minutes", description: D("Passive liquidity provision style on majors with inventory limits. Small edge, high turnover."), days: 360, r: 0.152, mdd: 0.046, risk: 22, cap: 120_000, taken: 40, base: 55, kept: 11, settled: 11, win: 0.66, payoff: 0.85, trades: 9100, hold: 0.3, waitlist: 41 }),
  // amara.o — commodities via forex/CFD
  gen({ id: "gold-swing", name: "Gold Macro Swing", trader: "amara.o", markets: ["forex"], instruments: ["XAUUSD", "XAGUSD"], venue: "MT5", style: "Swing · days", description: D("Swing trades on gold and silver around macro catalysts with scaled exits."), days: 590, r: 0.231, mdd: 0.118, risk: 41, cap: 450_000, taken: 133, base: 30, kept: 16, settled: 18, win: 0.48, payoff: 1.75, trades: 410, hold: 70 }),
  gen({ id: "oil-momentum", name: "Oil Momentum", trader: "amara.o", markets: ["futures"], instruments: ["USOIL", "UKOIL"], venue: "MT5", style: "Momentum · 1–5 days", description: D("Momentum on crude oil with event filters around inventory reports."), state: "paused", days: 400, r: 0.188, mdd: 0.171, risk: 58, cap: 300_000, taken: 64, base: 28, kept: 9, settled: 12, win: 0.45, payoff: 1.6, trades: 360, hold: 44, pausedReason: "Hard breach on Oct 3: daily loss 5.1% exceeded the 4.5% limit. Copying stopped and Epoch 12 fees were refunded." }),
  // dmitri.v — crypto breakout
  gen({ id: "crypto-breakout", name: "Crypto Breakout 1R", trader: "dmitri.v", markets: ["crypto"], instruments: ["SOL", "ETH", "AVAX", "LINK", "BTC"], venue: "Bybit", style: "Breakout · 1–3 days", description: D("Range breakouts on liquid crypto with fixed 1R stops and partial profit at 2R."), days: 420, r: 0.412, mdd: 0.163, risk: 49, cap: 220_000, taken: 70, base: 42, kept: 11, settled: 13, win: 0.42, payoff: 2.1, trades: 520, hold: 30, waitlist: 0 }),
  gen({ id: "meme-rotation", name: "Meme Rotation", trader: "dmitri.v", markets: ["crypto"], instruments: ["DOGE", "PEPE", "BONK", "WIF"], venue: "Bybit", style: "Momentum rotation", description: D("Rotates into the strongest meme coins weekly. Highly volatile; flagged for concentration."), days: 300, r: 0.954, mdd: 0.48, risk: 82, cap: 30_000, taken: 10, base: 50, kept: 5, settled: 9, win: 0.4, payoff: 2.4, trades: 260, hold: 60, flags: ["Concentration", "Hidden tail risk"] }),
  gen({ id: "alt-breakout-closed", name: "Alt Breakout v1", trader: "dmitri.v", markets: ["crypto"], instruments: ["AVAX", "NEAR"], venue: "Bybit", style: "Breakout", description: D("First version of the breakout system. Closed after style drift."), state: "closed", days: 200, closedDaysAgo: 330, r: -0.12, mdd: 0.24, risk: 63, cap: 90_000, taken: 0, base: 25, kept: 3, settled: 5, win: 0.38, payoff: 1.5, trades: 210, hold: 26, flags: ["Style drift"], closedReason: "Closed by trader after style drift — continued as Crypto Breakout 1R" }),
  // priya.k — stocks
  gen({ id: "earnings-drift", name: "Earnings Drift", trader: "priya.k", markets: ["stocks"], instruments: ["NVDA", "AMD", "AVGO", "MSFT", "CRM"], venue: "MT5", style: "Post-earnings drift · days", description: D("Trades post-earnings announcement drift in US large caps with gap filters."), days: 640, r: 0.248, mdd: 0.097, risk: 34, cap: 1_800_000, taken: 361, base: 32, kept: 19, settled: 20, win: 0.53, payoff: 1.7, trades: 330, hold: 110 }),
  gen({ id: "sector-rotation", name: "Sector Rotation", trader: "priya.k", markets: ["stocks"], instruments: ["XLK", "XLE", "XLF", "XLV"], venue: "MT5", style: "Rotation · weeks", description: D("Monthly relative-strength rotation across sector ETFs with a cash filter."), days: 720, r: 0.137, mdd: 0.079, risk: 21, cap: 3_500_000, taken: 508, base: 16, kept: 22, settled: 23, win: 0.58, payoff: 1.4, trades: 120, hold: 520 }),
  gen({ id: "ai-momentum", name: "AI Leaders Momentum", trader: "priya.k", markets: ["stocks"], instruments: ["NVDA", "TSM", "ARM", "AMD"], venue: "MT5", style: "Momentum · swing", description: D("Momentum in AI-semiconductor leaders with volatility-scaled sizing."), days: 380, r: 0.392, mdd: 0.142, risk: 46, cap: 900_000, taken: 288, base: 40, kept: 11, settled: 12, win: 0.49, payoff: 1.9, trades: 240, hold: 140 }),
  // rio.trades — futures scalper
  gen({ id: "nq-scalper", name: "NQ Open Scalper", trader: "rio.trades", markets: ["futures"], instruments: ["NAS100"], venue: "MT5", style: "Scalping · NY open", description: D("First-hour NASDAQ scalps with fixed risk per trade and a daily stop."), days: 260, r: 0.183, mdd: 0.088, risk: 44, cap: 160_000, taken: 53, base: 36, kept: 7, settled: 8, win: 0.55, payoff: 1.15, trades: 1900, hold: 0.5, waitlist: 9 }),
  gen({ id: "dax-rookie", name: "DAX Morning Range", trader: "rio.trades", markets: ["futures"], instruments: ["GER40"], venue: "MT5", style: "Range breakout · intraday", description: D("Opening-range breakouts on the DAX. Rookie stage."), state: "rookie", days: 76, r: 0.041, mdd: 0.035, risk: 39, cap: 500_000, taken: 11, base: 15, kept: 1, settled: 1, win: 0.5, payoff: 1.3, trades: 70, hold: 3, flags: ["Thin sample"] }),
  // hana.lee — crypto trend
  gen({ id: "vol-target-trend", name: "Vol-Target Trend", trader: "hana.lee", markets: ["crypto"], instruments: ["BTC", "ETH", "SOL", "BNB"], venue: "Binance", style: "Trend · vol-targeted", description: D("Trend following with position size inversely proportional to recent volatility."), days: 700, r: 0.297, mdd: 0.112, risk: 33, cap: 1_400_000, taken: 398, base: 27, kept: 21, settled: 22, win: 0.4, payoff: 2.6, trades: 420, hold: 200 }),
  gen({ id: "btc-weekly", name: "BTC Weekly Swing", trader: "hana.lee", markets: ["crypto"], instruments: ["BTC"], venue: "Binance", style: "Swing · weekly", description: D("One to three trades a month on BTC around weekly structure. Very selective."), days: 650, r: 0.214, mdd: 0.093, risk: 29, cap: 1_100_000, taken: 366, base: 24, kept: 20, settled: 20, win: 0.5, payoff: 2.2, trades: 64, hold: 330 }),
  gen({ id: "sol-ecosystem", name: "SOL Ecosystem", trader: "hana.lee", markets: ["crypto"], instruments: ["SOL", "JUP", "JTO", "PYTH"], venue: "Bybit", style: "Thematic momentum", description: D("Momentum within the Solana ecosystem tokens with liquidity filters."), state: "full", days: 340, r: 0.517, mdd: 0.187, risk: 56, cap: 90_000, taken: 30, base: 48, kept: 9, settled: 10, win: 0.44, payoff: 2.0, trades: 300, hold: 50, waitlist: 57 }),
  // existing traders get one more each
  gen({ id: "eth-btc-pairs", name: "ETH/BTC Pairs", trader: "alex.k", markets: ["crypto"], instruments: ["ETH", "BTC"], venue: "Binance", style: "Relative value · days", description: D("Trades the ETH/BTC ratio with market-neutral sizing."), days: 450, r: 0.142, mdd: 0.058, risk: 20, cap: 700_000, taken: 199, base: 26, kept: 14, settled: 14, win: 0.56, payoff: 1.25, trades: 380, hold: 60 }),
  gen({ id: "us-small-caps", name: "US Small-Cap Momentum", trader: "kenji.q", markets: ["stocks"], instruments: ["IWM", "SMCI", "PLTR", "SOFI"], venue: "MT5", style: "Momentum · swing", description: D("Momentum in liquid US small and mid caps with gap-risk position caps."), days: 410, r: 0.318, mdd: 0.152, risk: 51, cap: 600_000, taken: 144, base: 30, kept: 11, settled: 13, win: 0.46, payoff: 1.8, trades: 260, hold: 120 }),
];

function hashOf(seed: number) {
  const rand = mulberry32(seed + 5);
  return "0x" + Array.from({ length: 40 }, () => Math.floor(rand() * 16).toString(16)).join("");
}

function buildRules(f: Fixture, mddPct: number): RiskRule[] {
  const c = f.contract;
  const mddLimit = r1(mddPct * 1.25);
  const dailyGen = r1(c.p99Daily * 1.2);
  const levGen = r1(c.p95Lev * 1.2);
  const posGen = Math.round(c.p95Pos * 1.5);
  const daily = c.tightened?.daily_loss ?? dailyGen;
  const lev = c.tightened?.leverage ?? levGen;
  const pos = c.tightened?.position_size ?? posGen;
  return [
    {
      key: "max_dd",
      label: "Max drawdown in Epoch",
      limit: `${mddLimit}%`,
      current: `${c.usage.dd}%`,
      usage: c.usage.dd / mddLimit,
      historical: `Hist. max ${r1(mddPct).toFixed(1)}% × 1.25`,
      historicalValue: `${r1(mddPct).toFixed(1)}%`,
      buffer: "× 1.25",
    },
    {
      key: "daily_loss",
      label: "Max daily loss",
      limit: `${daily}%`,
      current: `${c.usage.daily}%`,
      usage: c.usage.daily / daily,
      historical: `p99 daily loss ${c.p99Daily}% × 1.2`,
      historicalValue: `${c.p99Daily}%`,
      buffer: "× 1.2",
      tightened: c.tightened?.daily_loss !== undefined,
    },
    {
      key: "leverage",
      label: "Max leverage",
      limit: `${lev}x`,
      current: `${c.usage.lev}x`,
      usage: c.usage.lev / lev,
      historical: `p95 leverage ${c.p95Lev}x × 1.2`,
      historicalValue: `${c.p95Lev}x`,
      buffer: "× 1.2",
      tightened: c.tightened?.leverage !== undefined,
    },
    {
      key: "position_size",
      label: "Max single position",
      limit: `${pos}% equity`,
      current: `${c.usage.pos}%`,
      usage: c.usage.pos / pos,
      historical: `p95 position ${c.p95Pos}% × 1.5`,
      historicalValue: `${c.p95Pos}%`,
      buffer: "× 1.5",
      tightened: c.tightened?.position_size !== undefined,
    },
    {
      key: "instruments",
      label: "Allowed instruments",
      limit: [...f.instruments].sort().join(", "),
      current: "Only allowed traded",
      usage: 0,
      historical: "Instruments traded in history",
      historicalValue: `${f.instruments.length} instruments`,
      buffer: "—",
    },
    {
      key: "activity",
      label: "Minimum activity",
      limit: `≥ ${c.minTrades} trades`,
      current: `${c.usage.trades} trades so far`,
      usage: Math.min(1, c.usage.trades / c.minTrades),
      historical: `Typical ${Math.round(c.minTrades * 1.8)} trades / Epoch`,
      historicalValue: `${Math.round(c.minTrades * 1.8)} trades`,
      buffer: "≈ 0.55×",
    },
  ];
}

function buildEpochs(f: Fixture, endDate: string, navAt: (d: string) => number, seatsTotal: number) {
  const epochs: Epoch[] = [];
  const settled = f.compliance.settled;
  const running = f.state === "active" || f.state === "full" || f.state === "rookie";
  // start of the epoch after the last settled one
  const nextStart =
    f.state === "paused" ? addDays(TODAY, 4) : running ? addDays(TODAY, -f.epochStartDaysAgo) : endDate;
  for (let k = 1; k <= settled; k++) {
    const start = addDays(nextStart, -(settled + 1 - k) * 30);
    const end = addDays(start, 30);
    const breach = f.breaches.find((b) => b.index === k);
    const seats = Math.max(1, Math.min(seatsTotal, Math.round(Math.max(f.seatsTaken, 6) * (0.3 + (0.7 * k) / settled))));
    const fee = seats * seatPrice(f.basePriceUsdc, 30, seats / seatsTotal);
    const ret = navAt(end) / navAt(start) - 1;
    const e: Epoch = { index: k, start, end, outcome: "kept", returnPct: ret, seats };
    if (!breach) e.payoutUsdc = Math.round(fee * FEE_SPLIT.trader);
    else if (breach.kind === "hard") {
      e.outcome = "breach_hard";
      e.payoutUsdc = 0;
      e.refundUsdc = Math.round(fee);
      e.breachReason = breach.reason;
    } else {
      e.outcome = "breach_soft";
      e.payoutUsdc = Math.round(fee * 0.6 * FEE_SPLIT.trader);
      e.refundUsdc = Math.round(fee * 0.4);
      e.breachReason = breach.reason;
    }
    epochs.push(e);
  }
  if (running) {
    const start = nextStart;
    const end = addDays(start, 30);
    epochs.push({
      index: settled + 1,
      start,
      end,
      outcome: "running",
      returnPct: navAt(TODAY) / navAt(start) - 1,
      seats: f.seatsTaken,
      progress: f.epochStartDaysAgo / 30,
    });
  } else if (f.state === "paused") {
    epochs.push({ index: settled + 1, start: nextStart, end: addDays(nextStart, 30), outcome: "upcoming" });
  }
  return epochs;
}

/** Correlation of a strategy's daily returns with BTC, from its markets and style. */
function btcRhoOf(f: Fixture) {
  const style = `${f.style} ${f.name}`.toLowerCase();
  if (/arb|basis|neutral|carry|funding|market.?making/.test(style)) return 0.06 + (seedOf(f.id) % 7) / 100;
  const base = f.markets.includes("crypto") ? 0.58 : f.markets.includes("stocks") ? 0.32 : f.markets.includes("futures") ? 0.22 : 0.06;
  const damp = /mean.?revers|scalp|range/.test(style) ? 0.55 : 1;
  return Math.min(0.85, base * damp + ((seedOf(f.id) % 13) - 6) / 100);
}

function build(f: Fixture): { strategy: Strategy; seriesKey: NavKey } {
  const seed = seedOf(f.id);
  const endDate = f.closedDaysAgo ? addDays(TODAY, -f.closedDaysAgo) : TODAY;
  const tradesPerYear = (f.trades / f.historyDays) * 365;
  const spec = { seed, days: f.historyDays, endDate, targetReturn: f.r, targetMdd: f.mdd };
  const { returns, points } = navSeries(spec, {
    followerDragAnnual: (f.slippageBps / 1e4) * tradesPerYear * 0.1,
    btcRho: btcRhoOf(f),
  });
  const s = computeSeriesMetrics(returns, points);
  const byDate = new Map(points.map((p) => [p.date, p.nav]));
  const navAt = (d: string) => {
    if (d <= points[0].date) return points[0].nav;
    if (d >= points[points.length - 1].date) return points[points.length - 1].nav;
    return byDate.get(d) ?? points[points.length - 1].nav;
  };

  const rookie = f.state === "rookie";
  const capacityUsd = rookie ? f.fullCapacityUsd * 0.1 : f.fullCapacityUsd;
  const seatsTotal = Math.floor(capacityUsd / f.seatAllocationUsd);
  const avgWin = (f.expectancyBps / 1e4 + (1 - f.winRate) * 0.01) / f.winRate;

  const metrics: MetricSet = {
    return1m: s.return1m,
    return3m: s.return3m,
    return12m: s.return12m,
    returnAll: s.returnAll,
    cagr: s.cagr,
    maxDrawdown: s.maxDrawdown,
    currentDrawdown: s.currentDrawdown,
    volatility: s.volatility,
    ulcer: s.ulcer,
    sharpe: s.sharpe,
    sortino: s.sortino,
    calmar: s.calmar,
    psr: s.psr,
    winRate: f.winRate,
    profitFactor: f.profitFactor,
    expectancyBps: f.expectancyBps,
    trades: f.trades,
    avgHoldHours: f.avgHoldHours,
    profitableMonthsPct: s.profitableMonthsPct,
    equityR2: s.equityR2,
    riskScore: f.riskScore,
    consistencyScore: f.consistencyScore,
    downsideDev: s.downsideDev,
    var95: s.var95,
    cvar95: s.cvar95,
    maxLeverage: f.maxLeverage,
    avgLeverage: f.avgLeverage,
    payoffRatio: f.payoffRatio,
    avgWinPct: avgWin,
    avgLossPct: avgWin / f.payoffRatio,
    tailRatio: f.tailRatio,
    longestLosingStreak: s.longestLosingStreakDays,
    recoveryFactor: s.returnAll / Math.max(s.maxDrawdown, 0.001),
    top3PnlShare: f.top3PnlShare,
    skew: s.skew,
    kurtosis: s.kurtosis,
    historyDays: f.historyDays,
    ...f.override,
  };

  const epochs = buildEpochs(f, endDate, navAt, seatsTotal);
  const statusFromState: Record<StrategyState, "active" | "kept" | "breached"> = {
    active: "active",
    full: "active",
    rookie: "active",
    paused: "breached",
    closed: "breached",
  };

  const strategy: Strategy = {
    id: f.id,
    slug: f.id,
    name: f.name,
    traderHandle: f.trader,
    markets: f.markets,
    instruments: f.instruments,
    venue: f.venue,
    style: f.style,
    description: f.description,
    state: f.state,
    createdAt: points[0].date,
    metrics,
    flags: f.flags,
    capacityUsd,
    fullCapacityUsd: f.fullCapacityUsd,
    seatAllocationUsd: f.seatAllocationUsd,
    seatsTotal,
    seatsTaken: Math.min(f.seatsTaken, seatsTotal),
    waitlist: f.waitlist,
    minAccountUsd: f.minAccountUsd,
    basePriceUsdc: f.basePriceUsdc,
    bondUsdc: Math.max(500, Math.round(f.fullCapacityUsd * 0.01)),
    compliance: f.compliance,
    contract: {
      epoch: f.state === "paused" ? f.compliance.settled : f.compliance.settled + 1,
      status: statusFromState[f.state],
      hash: hashOf(seed),
      rules: buildRules(f, f.mdd * 100),
      tightenedByTrader: !!f.contract.tightened,
    },
    epochs,
    followerSlippageBps: f.slippageBps,
    navSeed: seed,
    closedReason: f.closedReason,
    pausedReason: f.pausedReason,
    closedAt: f.closedDaysAgo ? endDate : undefined,
    instrumentPnl: f.instruments.map((ins, i) => ({ instrument: ins, pnlPct: f.instrumentPnl[i] ?? 0 })),
    seatPrice7dChange: f.seatPrice7dChange,
    seatsTraded30d: f.seatsTraded30d,
    allocationHistory: allocationHistory(f, seed),
  };
  return { strategy, seriesKey: { returns, points } };
}

function allocationHistory(f: Fixture, seed: number) {
  if (f.state === "rookie" || f.state === "closed") return [];
  const rand = mulberry32(seed + 11);
  const hist: Strategy["allocationHistory"] = [];
  const prev = Math.round((f.seatAllocationUsd * (1.05 + rand() * 0.15)) / 100) * 100;
  hist.push({
    date: addDays(TODAY, -Math.round(100 + rand() * 90)),
    from: prev,
    to: f.seatAllocationUsd,
    reason: `Capacity recalibrated: follower slippage reached ${(0.34 + rand() * 0.1).toFixed(2)}× edge for two Epochs`,
  });
  hist.push({
    date: addDays(TODAY, -Math.round(220 + rand() * 60)),
    from: 3000,
    to: prev,
    reason: "Capacity increased after monthly recalculation (higher ADV on venue)",
  });
  return hist;
}

type NavKey = { returns: number[]; points: ReturnType<typeof navSeries>["points"] };

const built = [...fixtures, ...generated, ...procSpecs.map(gen)].map(build);
export const strategies: Strategy[] = built.map((b) => b.strategy);
export const strategySeries = new Map(built.map((b) => [b.strategy.id, b.seriesKey]));
export const strategyById = (id: string) => strategies.find((s) => s.id === id);

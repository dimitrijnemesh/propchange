export type Market = "crypto" | "forex" | "stocks" | "futures";
export type StrategyState = "rookie" | "active" | "full" | "paused" | "closed";
export type EpochOutcome = "kept" | "breach_hard" | "breach_soft" | "running" | "upcoming";
export type Venue = "Binance" | "Bybit" | "MT5";

export interface Trader {
  handle: string;
  name: string;
  avatarUrl?: string;
  country?: string;
  bio: string;
  joinedAt: string;
  kyc: boolean;
  verification: "connected" | "verified" | "verified_plus";
  strategyIds: string[];
  closedStrategyIds: string[];
}

export interface MetricSet {
  return1m: number;
  return3m: number;
  return12m: number;
  returnAll: number;
  cagr: number;
  maxDrawdown: number;
  currentDrawdown: number;
  volatility: number;
  ulcer: number;
  sharpe: number;
  sortino: number;
  calmar: number;
  psr: number;
  winRate: number;
  profitFactor: number;
  expectancyBps: number;
  trades: number;
  avgHoldHours: number;
  profitableMonthsPct: number;
  equityR2: number;
  riskScore: number;
  consistencyScore: number;
  // extra fields used by the analytics tab
  downsideDev: number;
  var95: number;
  cvar95: number;
  maxLeverage: number;
  avgLeverage: number;
  payoffRatio: number;
  avgWinPct: number;
  avgLossPct: number;
  tailRatio: number;
  longestLosingStreak: number;
  recoveryFactor: number;
  top3PnlShare: number;
  skew: number;
  kurtosis: number;
  historyDays: number;
}

export type RiskRuleKey =
  | "max_dd"
  | "daily_loss"
  | "leverage"
  | "position_size"
  | "instruments"
  | "activity";

export interface RiskRule {
  key: RiskRuleKey;
  label: string;
  limit: string;
  usage: number; // 0..1 (for "activity" it is progress toward the minimum)
  current: string;
  historical: string; // e.g. "Hist. max 12.0% × 1.25"
  historicalValue: string;
  buffer: string;
  tightened?: boolean;
}

export interface RiskContract {
  epoch: number;
  status: "active" | "kept" | "breached";
  hash: string;
  rules: RiskRule[];
  tightenedByTrader: boolean;
}

export interface Epoch {
  index: number;
  start: string;
  end: string;
  outcome: EpochOutcome;
  returnPct?: number;
  payoutUsdc?: number;
  refundUsdc?: number;
  seats?: number;
  breachReason?: string;
  progress?: number;
}

export interface Strategy {
  id: string;
  slug: string;
  name: string;
  traderHandle: string;
  markets: Market[];
  instruments: string[];
  venue: Venue;
  style: string;
  description: string;
  state: StrategyState;
  createdAt: string;
  metrics: MetricSet;
  flags: string[];
  capacityUsd: number;
  seatAllocationUsd: number;
  seatsTotal: number;
  seatsTaken: number;
  waitlist: number;
  minAccountUsd: number;
  basePriceUsdc: number;
  bondUsdc: number;
  compliance: { kept: number; settled: number };
  contract: RiskContract;
  epochs: Epoch[];
  followerSlippageBps: number;
  navSeed: number;
  closedReason?: string;
  pausedReason?: string;
  instrumentPnl: { instrument: string; pnlPct: number }[];
  seatPrice7dChange: number;
  seatsTraded30d: number;
  /** Capacity before the Rookie limit is applied */
  fullCapacityUsd: number;
  allocationHistory: { date: string; from: number; to: number; reason: string }[];
  closedAt?: string;
}

export interface Seat {
  id: string;
  strategyId: string;
  seats: number;
  termDays: number;
  paidUsdc: number;
  epochStart: string;
  epochEnd: string;
  escrowUsdc: number;
  pnlUsd: number;
  status: "active" | "paused" | "refunded" | "expired";
  accountId: string;
}

export interface NavPoint {
  date: string;
  nav: number;
  dd: number;
  follower?: number;
  bench?: number;
}

export interface ExchangeAccount {
  id: string;
  venue: Venue;
  label: string;
  equityUsd: number;
  permissions: { trade: boolean; withdraw: boolean; ipWhitelist: boolean };
  connectedAt: string;
  status: "ok" | "warning";
}

export interface Notification {
  id: string;
  at: string;
  kind: "settlement" | "breach" | "risk" | "seat" | "system" | "payout";
  title: string;
  body: string;
  read: boolean;
  href?: string;
}

export interface RiskLogEntry {
  id: string;
  at: string;
  level: "info" | "warning" | "danger";
  strategyId: string;
  action: string;
  detail: string;
}

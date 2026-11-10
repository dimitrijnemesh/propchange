import type { Notification, RiskLogEntry } from "@/types/domain";
import { TODAY } from "./nav";

const base = new Date(TODAY + "T09:12:00Z").getTime();
const at = (hoursAgo: number) => new Date(base - hoursAgo * 3_600_000).toISOString();

const logTemplates: Omit<RiskLogEntry, "id" | "at">[] = [
  { level: "info", strategyId: "eth-swing", action: "Order scaled", detail: "Trader 0.42 ETH → your 0.03 ETH (2 Seats · $6,000 allocation)" },
  { level: "info", strategyId: "eth-swing", action: "Stop-loss attached", detail: "Protective stop at −2.1% from entry (trader used none)" },
  { level: "info", strategyId: "fx-mean-reversion", action: "Order scaled", detail: "Trader 2.10 lots EURUSD → your 0.04 lots" },
  { level: "warning", strategyId: "eth-swing", action: "Leverage throttle", detail: "Strategy leverage 3.8x (63% of 6x limit) — new entries sized down 20%" },
  { level: "info", strategyId: "fx-mean-reversion", action: "Stop-loss attached", detail: "Protective stop at −0.6% from entry" },
  { level: "info", strategyId: "eth-swing", action: "Position closed", detail: "Mirrored trader exit · SOL long · +1.8% on allocation" },
  { level: "warning", strategyId: "fx-mean-reversion", action: "Order rejected", detail: "Below venue minimum (0.01 lots) after scaling — rounding error 38%" },
  { level: "info", strategyId: "eth-swing", action: "Batch executed", detail: "Signal #48122 · 87 followers · randomized order · your fill +1.9 bps vs trader" },
  { level: "danger", strategyId: "xau-breakout", action: "Copying stopped", detail: "Seat Contract breach: max drawdown 19.8% > 19.5% limit · open copied positions closed" },
  { level: "warning", strategyId: "xau-breakout", action: "Copying paused", detail: "Rapid drawdown: −4.2% in 6h · new entries paused" },
  { level: "info", strategyId: "xau-breakout", action: "Order scaled", detail: "Trader 1.50 lots XAUUSD → your 0.02 lots" },
  { level: "info", strategyId: "fx-mean-reversion", action: "Desync reconciled", detail: "Position mismatch 0.01 lots GBPUSD → reconciled to expected" },
];

export const riskLog: RiskLogEntry[] = Array.from({ length: 40 }, (_, i) => ({
  id: `log-${i}`,
  at: at(i * 5.5 + (i % 3)),
  ...logTemplates[i % logTemplates.length],
}));

const n = (
  i: number,
  kind: Notification["kind"],
  title: string,
  body: string,
  href?: string,
): Notification => ({ id: `n-${i}`, at: at(i * 14 + 1), kind, title, body, read: i > 3, href });

export const notifications: Notification[] = [
  n(0, "risk", "Leverage throttle on ETH Swing", "Strategy leverage reached 63% of the contract limit. New entries are sized down.", "/app/activity"),
  n(1, "seat", "Seat active: FX Mean Reversion", "Copying started on MT5 · IC Markets. Escrow until the end of the Epoch.", "/app/seats"),
  n(2, "breach", "Gold Breakout breached its Seat Contract", "Max drawdown 19.8% exceeded the 19.5% limit. Copying stopped. Your fee is refundable.", "/app/wallet"),
  n(3, "payout", "Refund available: 38.42 USDC", "Epoch 9 fee for Gold Breakout can be claimed from escrow.", "/app/wallet"),
  n(4, "settlement", "ETH Swing kept Epoch 12", "Contract kept. Your fee was released to the trader.", "/strategies/eth-swing?tab=epochs"),
  n(5, "system", "MT5 account: IP whitelist not set", "We recommend restricting your key to PropChange execution IPs.", "/app/connections"),
  n(6, "risk", "Stop-loss attached", "A protective stop was added to your copied SOL position on ETH Swing.", "/app/activity"),
  n(7, "settlement", "FX Mean Reversion kept Epoch 12", "12 of 12 contracts kept.", "/strategies/fx-mean-reversion?tab=epochs"),
  n(8, "seat", "Seat renewal in 15 days", "ETH Swing · 2 Seats · prepaid term covers 1 more Epoch.", "/app/seats"),
  n(9, "system", "Capacity recalculated", "ETH Swing Seat allocation remains $3,000.", "/strategies/eth-swing?tab=capacity"),
  n(10, "risk", "Order rejected below venue minimum", "One FX order could not be copied precisely and was skipped.", "/app/activity"),
  n(11, "settlement", "Gold Breakout kept Epoch 8", "Contract kept. Fee released to trader.", "/strategies/xau-breakout?tab=epochs"),
  n(12, "seat", "Price change on watched strategy", "BTC Scalping is full — 23 on waitlist.", "/strategies/btc-scalping"),
  n(13, "system", "New strategy from alex.k", "Majors Trend has free Seats.", "/strategies/majors-trend"),
  n(14, "risk", "Daily loss limit set to 5%", "Your Risk Engine defaults were applied.", "/app/risk"),
  n(15, "payout", "USDC deposit confirmed", "600.00 USDC received on Solana.", "/app/wallet"),
  n(16, "seat", "Seat active: ETH Swing", "2 Seats · 90 days · $6,000 allocation.", "/app/seats"),
  n(17, "system", "Binance key verified", "Trade permission ✓ · Withdrawal disabled ✓ · IP whitelist ✓", "/app/connections"),
  n(18, "system", "Welcome to PropChange", "Prototype — all data is simulated.", "/how-it-works"),
  n(19, "system", "Wallet connected", "7xKX…9fQa on Solana devnet (mock).", "/app/wallet"),
];

import { seatPrice, round2 } from "@/lib/pricing";
import type { ExchangeAccount, Seat } from "@/types/domain";
import { TODAY, addDays } from "./nav";
import { strategyById } from "./strategies";

export const demoUser = {
  name: "Sam Rivera",
  email: "sam@example.com",
  wallet: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJo9fQa",
  usdcBalance: 412.6,
  solBalance: 0.84,
  riskProfile: "balanced" as "conservative" | "balanced" | "aggressive",
};

export const accounts: ExchangeAccount[] = [
  {
    id: "acc-binance",
    venue: "Binance",
    label: "Binance · Main",
    equityUsd: 9840.22,
    permissions: { trade: true, withdraw: false, ipWhitelist: true },
    connectedAt: "2026-04-11",
    status: "ok",
  },
  {
    id: "acc-mt5",
    venue: "MT5",
    label: "MT5 · IC Markets #5012931",
    equityUsd: 4210.5,
    permissions: { trade: true, withdraw: false, ipWhitelist: false },
    connectedAt: "2026-06-02",
    status: "warning",
  },
  {
    id: "acc-bybit-sub",
    venue: "Bybit",
    label: "Bybit · Sub-account 2",
    equityUsd: 640,
    permissions: { trade: true, withdraw: false, ipWhitelist: true },
    connectedAt: "2026-08-19",
    status: "ok",
  },
];

function epochOf(id: string) {
  const s = strategyById(id)!;
  return s.epochs.find((e) => e.outcome === "running") ?? s.epochs[s.epochs.length - 1];
}

const eth = epochOf("eth-swing");
const fx = epochOf("fx-mean-reversion");
const xauStrategy = strategyById("xau-breakout")!;
const xau = xauStrategy.epochs.filter((e) => e.outcome === "breach_hard").at(-1)!;

const ethPaid = round2(seatPrice(30, 90, 0.78) * 2);
const fxPaid = round2(seatPrice(35, 30, 0.84));
const xauPaid = round2(seatPrice(32, 30, 0.62));

export const seats: Seat[] = [
  {
    id: "seat-eth",
    strategyId: "eth-swing",
    seats: 2,
    termDays: 90,
    paidUsdc: ethPaid,
    epochStart: eth.start,
    epochEnd: eth.end,
    escrowUsdc: round2(ethPaid / 3),
    pnlUsd: 412.35,
    status: "active",
    accountId: "acc-binance",
  },
  {
    id: "seat-fx",
    strategyId: "fx-mean-reversion",
    seats: 1,
    termDays: 30,
    paidUsdc: fxPaid,
    epochStart: fx.start,
    epochEnd: fx.end,
    escrowUsdc: fxPaid,
    pnlUsd: 96.1,
    status: "active",
    accountId: "acc-mt5",
  },
  {
    id: "seat-xau",
    strategyId: "xau-breakout",
    seats: 1,
    termDays: 30,
    paidUsdc: xauPaid,
    epochStart: xau.start,
    epochEnd: xau.end,
    escrowUsdc: 0,
    pnlUsd: -231.4,
    status: "refunded",
    accountId: "acc-mt5",
  },
];

export const claimableRefundUsdc = xauPaid;

export const walletTx = [
  { id: "tx1", at: addDays(TODAY, -4), type: "Refund available", strategyId: "xau-breakout", amount: xauPaid, sig: "4cRf…Ua2k" },
  { id: "tx2", at: fx.start, type: "Seat Fee → escrow", strategyId: "fx-mean-reversion", amount: -fxPaid, sig: "2hPq…Mn81" },
  { id: "tx3", at: addDays(eth.start, -60), type: "Seat Fee → escrow (90d)", strategyId: "eth-swing", amount: -ethPaid, sig: "5Ttw…ze9Q" },
  { id: "tx4", at: addDays(TODAY, -70), type: "USDC deposit", strategyId: undefined, amount: 600, sig: "3KxY…bB7d" },
];

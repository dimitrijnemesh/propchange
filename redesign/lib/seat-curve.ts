import { seatPrice } from "@/lib/pricing";
import { mulberry32 } from "@/lib/rng";
import type { Strategy } from "@/types/domain";

/** Client-safe Seat market primitives: bonding curve, royalties, addresses and types. */

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
export function b58(seed: number, len = 44) {
  const r = mulberry32(seed);
  return Array.from({ length: len }, () => B58[Math.floor(r() * 58)]).join("");
}
export const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 17);
export const r2 = (n: number) => Math.round(n * 100) / 100;

export const SEAT_PROGRAM_ID = "SEATpcHg7oXc1vR3kQ9mZ2uWfJ8nLaB5dYtE6sKqP4w";
export const SETTLEMENT_SIGNER = "RiskEng1n3v7K2pQ8wZ5xL4cB9mN6tR3yH2dF8sJ1aG";
export const ROYALTY = { trader: 0.05, platform: 0.02 } as const;

export function seatSymbol(name: string) {
  const words = name.toUpperCase().replace(/[^A-Z0-9 ]/g, "").split(/\s+/).filter(Boolean);
  const joined = words.join("");
  return joined.length <= 9 ? joined : (words[0].slice(0, 4) + (words[1] ?? "").slice(0, 4)).slice(0, 8);
}

/** Price of the k-th Seat on the bonding curve (k = Seats already minted). */
export const curveAt = (base: number, minted: number, supply: number) => r2(seatPrice(base, 30, Math.min(1, minted / Math.max(1, supply))));

/** Total USDC to mint `n` Seats starting after `minted`. */
export function mintCost(base: number, minted: number, supply: number, n: number) {
  let t = 0;
  for (let i = 0; i < n; i++) t += curveAt(base, minted + i, supply);
  return r2(t);
}

export interface SeatQuote {
  symbol: string;
  epoch: number;
  marketPrice: number;
  curvePrice: number;
  premium: number;
  change24h: number;
  volume24h: number;
  tradable: boolean;
}

export interface BookLevel {
  price: number;
  qty: number;
}
export interface SeatTrade {
  id: string;
  at: string;
  kind: "mint" | "trade";
  side: "buy" | "sell";
  price: number;
  qty: number;
  wallet: string;
  sig: string;
}

export interface SeatToken extends SeatQuote {
  strategyId: string;
  slug: string;
  name: string;
  traderHandle: string;
  state: Strategy["state"];
  epochEnd: string;
  daysLeft: number;
  mint: string;
  escrow: string;
  traderWallet: string;
  contractHash: string;
  supply: number;
  minted: number;
  holders: number;
  initialPrice: number;
  escrowUsdc: number;
  allocationUsd: number;
  bids: BookLevel[];
  asks: BookLevel[];
  trades: SeatTrade[];
  chart: { date: string; market: number; curve: number }[];
}


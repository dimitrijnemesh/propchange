import { gaussian, mulberry32 } from "@/lib/rng";
import type { Strategy } from "@/types/domain";
import { b58, curveAt, hash, r2, type SeatQuote, type SeatToken, type SeatTrade, seatSymbol } from "@/lib/seat-curve";
export * from "@/lib/seat-curve";
import { followers } from "./community";
import { addDays, daysBetween, TODAY } from "./nav";

/**
 * Mock of the on-chain Seat market (Solana). Each strategy's current Epoch is one fungible
 * SPL Token-2022 mint (1 token = 1 Seat, supply fixed by Capacity). New Seats are minted from a
 * bonding curve that starts at the trader's price; holders trade them on an order book.
 * Everything is deterministic so server and client render the same numbers.
 */

export function runningEpoch(s: Strategy) {
  const run = s.epochs.find((e) => e.outcome === "running");
  const idx = run?.index ?? s.compliance.settled + 1;
  const end = run?.end ?? addDays(TODAY, 30);
  return { idx, end, daysLeft: Math.max(0, daysBetween(TODAY, end)) };
}

/** Lightweight market quote (used by the Seat Market table). */
export function seatQuote(s: Strategy): SeatQuote {
  const rand = mulberry32(hash(s.id) + 911);
  const supply = Math.max(1, s.seatsTotal);
  const curvePrice = curveAt(s.basePriceUsdc, s.seatsTaken, supply);
  const occ = s.seatsTaken / supply;
  // demand premium: occupancy, waitlist and recent momentum push the market above the curve
  const premium =
    s.state === "paused"
      ? -0.28
      : Math.max(-0.25, Math.min(0.45, (occ - 0.55) * 0.45 + (s.waitlist > 0 ? 0.06 + Math.min(0.12, s.waitlist / 400) : 0) + s.metrics.return1m * 0.6 + gaussian(rand) * 0.04));
  const marketPrice = r2(curvePrice * (1 + premium));
  return {
    symbol: seatSymbol(s.name),
    epoch: runningEpoch(s).idx,
    marketPrice,
    curvePrice,
    premium,
    change24h: Math.round((gaussian(rand) * 0.035 + premium * 0.04) * 10000) / 10000,
    volume24h: r2(marketPrice * Math.max(1, Math.round(s.seatsTraded30d / 30 + rand() * 6))),
    tradable: s.state !== "paused" && s.state !== "closed",
  };
}

/** Full on-chain view of a strategy's current-Epoch Seat token. */
export function seatToken(s: Strategy): SeatToken {
  const q = seatQuote(s);
  const rand = mulberry32(hash(s.id) + 4242);
  const seed = hash(s.id);
  const supply = Math.max(1, s.seatsTotal);
  const { end, daysLeft } = runningEpoch(s);

  // order book around the market price; tighter for busy strategies
  const spread = 0.006 + (1 - Math.min(1, s.seatsTraded30d / 60)) * 0.012;
  const mid = q.marketPrice;
  const lvl = (i: number, dir: 1 | -1) => r2(mid * (1 + dir * (spread / 2 + i * (0.004 + rand() * 0.004))));
  const asks = q.tradable ? Array.from({ length: 9 }, (_, i) => ({ price: lvl(i, 1), qty: 1 + Math.floor(rand() * (i < 2 ? 4 : 9)) })) : [];
  const bids = q.tradable ? Array.from({ length: 9 }, (_, i) => ({ price: lvl(i, -1), qty: 1 + Math.floor(rand() * (i < 2 ? 5 : 11)) })) : [];

  // recent fills, newest first: a random walk that ends at the market price
  const now = new Date(TODAY + "T15:30:00Z").getTime();
  const trades: SeatTrade[] = [];
  let p = mid;
  let t = now;
  for (let i = 0; i < 36; i++) {
    const mintFill = s.seatsTaken < supply && rand() < 0.22;
    trades.push({
      id: `${s.id}-t${i}`,
      at: new Date(t).toISOString(),
      kind: mintFill ? "mint" : "trade",
      side: mintFill || rand() < 0.55 ? "buy" : "sell",
      price: mintFill ? curveAt(s.basePriceUsdc, Math.max(0, s.seatsTaken - i), supply) : r2(p),
      qty: 1 + (rand() < 0.3 ? 1 : 0) + (rand() < 0.1 ? 2 : 0),
      wallet: followers[Math.floor(rand() * followers.length)],
      sig: b58(seed + i * 7919, 88),
    });
    p = p / (1 + gaussian(rand) * 0.006 + q.change24h / 36);
    t -= (8 + rand() * 50) * 60_000;
  }

  // 30-day chart: curve follows occupancy build-up, market wanders around it with the premium
  const chart = Array.from({ length: 31 }, (_, i) => {
    const f = i / 30;
    const occ = Math.max(0, s.seatsTaken / supply - (1 - f) * (0.25 + rand() * 0.02));
    const curve = curveAt(s.basePriceUsdc, Math.round(occ * supply), supply);
    const prem = q.premium * (0.4 + 0.6 * f) + gaussian(rand) * 0.025;
    return { date: addDays(TODAY, i - 30), curve, market: i === 30 ? q.marketPrice : r2(curve * (1 + prem)) };
  });

  const avgMint = (curveAt(s.basePriceUsdc, 0, supply) + q.curvePrice) / 2;
  return {
    ...q,
    strategyId: s.id,
    slug: s.slug,
    name: s.name,
    traderHandle: s.traderHandle,
    state: s.state,
    epochEnd: end,
    daysLeft,
    mint: b58(seed + 1),
    escrow: b58(seed + 2),
    traderWallet: b58(seed + 3),
    contractHash: s.contract.hash,
    supply,
    minted: s.seatsTaken,
    holders: Math.max(1, Math.round(s.seatsTaken * (0.78 + rand() * 0.12))),
    initialPrice: r2(s.basePriceUsdc),
    escrowUsdc: r2(avgMint * s.seatsTaken),
    allocationUsd: s.seatAllocationUsd,
    bids,
    asks,
    trades,
    chart,
  };
}

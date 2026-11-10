import "server-only";
import { priceFrom } from "@/lib/domain";
import type { SearchData, SearchItem } from "@/lib/search-types";
import { notifications } from "@/mock/activity";
import { strategies } from "@/mock/strategies";
import { traders } from "@/mock/traders";
import type { Market, Strategy } from "@/types/domain";

const toItem = (s: Strategy): SearchItem => ({
  type: "strategy",
  label: s.name,
  sub: `${s.traderHandle} · ${s.venue}`,
  href: `/strategies/${s.slug}`,
  price: Math.round(priceFrom(s) * 100) / 100,
  change: s.seatPrice7dChange,
  kept: s.compliance.kept,
  settled: s.compliance.settled,
  state: s.state,
  trader: s.traderHandle,
});

export function searchIndex(): SearchData {
  const listed = strategies.filter((s) => s.state !== "closed");
  const instruments = new Map<string, number>();
  listed.forEach((s) => s.instruments.forEach((i) => instruments.set(i, (instruments.get(i) ?? 0) + 1)));
  // "Hot seats": most seats traded relative to size, rising price first (like an exchange's hot list).
  const hot = [...listed]
    .filter((s) => s.state !== "paused")
    .sort((a, b) => b.seatsTraded30d / b.seatsTotal - a.seatsTraded30d / a.seatsTotal || b.seatPrice7dChange - a.seatPrice7dChange)
    .slice(0, 5)
    .map(toItem);
  const markets = (["crypto", "forex", "stocks", "futures"] as Market[]).map((key) => ({
    key,
    count: listed.filter((s) => s.markets.includes(key)).length,
  }));
  const topTraders = traders
    .map((t) => {
      const own = strategies.filter((s) => s.traderHandle === t.handle);
      return {
        handle: t.handle,
        name: t.name,
        kept: own.reduce((a, s) => a + s.compliance.kept, 0),
        settled: own.reduce((a, s) => a + s.compliance.settled, 0),
      };
    })
    .filter((t) => t.settled >= 10)
    .sort((a, b) => b.kept / b.settled - a.kept / a.settled)
    .slice(0, 4);
  return {
    items: [
      ...listed.map(toItem),
      ...traders.map((t) => ({ type: "trader" as const, label: t.handle, sub: t.name, href: `/traders/${t.handle}` })),
      ...[...instruments.entries()].map(([i, n]) => ({
        type: "instrument" as const,
        label: i,
        sub: `${n}`,
        href: `/strategies?q=${encodeURIComponent(i)}`,
      })),
    ],
    hot,
    markets,
    topTraders,
  };
}

export const navNotifications = () => notifications;

/** Bottom status-bar ticker: most-traded Seats with their price and 7d change. */
export function tickerItems(): SearchItem[] {
  return strategies
    .filter((s) => s.state !== "closed" && s.state !== "paused")
    .sort((a, b) => b.seatsTraded30d - a.seatsTraded30d)
    .slice(0, 14)
    .map(toItem);
}

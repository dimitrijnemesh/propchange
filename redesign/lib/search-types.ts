import type { Market } from "@/types/domain";

export interface SearchItem {
  type: "strategy" | "trader" | "instrument";
  label: string;
  sub: string;
  href: string;
  /** strategy-only extras shown in results */
  price?: number;
  change?: number;
  kept?: number;
  settled?: number;
  state?: string;
  trader?: string;
}

export interface SearchData {
  items: SearchItem[];
  hot: SearchItem[];
  markets: { key: Market; count: number }[];
  topTraders: { handle: string; name: string; kept: number; settled: number }[];
}

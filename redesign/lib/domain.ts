import { occupancyOf, seatPrice } from "./pricing";
import type { Strategy } from "@/types/domain";

export const riskLevel = (score: number): "low" | "medium" | "high" =>
  score < 40 ? "low" : score < 70 ? "medium" : "high";

export const priceFrom = (s: Pick<Strategy, "basePriceUsdc" | "seatsTaken" | "seatsTotal">) =>
  seatPrice(s.basePriceUsdc, 30, occupancyOf(s));

export type Period = "24h" | "7d" | "30d" | "90d" | "1y" | "all";
export const PERIODS: { value: Period; label: string; days: number }[] = [
  { value: "24h", label: "24h", days: 1 },
  { value: "7d", label: "7d", days: 7 },
  { value: "30d", label: "30d", days: 30 },
  { value: "90d", label: "90d", days: 90 },
  { value: "1y", label: "1Y", days: 365 },
  { value: "all", label: "All", days: 100_000 },
];
export type StrategyWithSpark = Strategy & {
  spark: number[];
  /** NAV return over each period (all-time if history is shorter) */
  perf: Record<Period, number>;
  /** period shown / sorted on the current list */
  period: Period;
};

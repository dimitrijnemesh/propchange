/** Seat price formula — PROJECT_CONTEXT §14.1 */
export function seatPrice(base: number, days: number, occupancy: number) {
  return base * Math.pow(days / 30, 0.9) * (1 + 0.5 * occupancy ** 2);
}
// base 30: 30d @20% → 30.6 · 30d @90% → 42.2 · 90d @20% → 82.2 · 90d @90% → 113.3

export const termFactor = (days: number) => Math.pow(days / 30, 0.9);
export const occupancyFactor = (occupancy: number) => 1 + 0.5 * occupancy ** 2;

export const FEE_SPLIT = { trader: 0.75, platform: 0.25 } as const;
export const TERMS = [30, 60, 90, 180] as const;

export const occupancyOf = (s: { seatsTaken: number; seatsTotal: number }) =>
  s.seatsTotal === 0 ? 0 : s.seatsTaken / s.seatsTotal;

export const round2 = (n: number) => Math.round(n * 100) / 100;

import type { Metadata } from "next";
import { SeatsMarket } from "@/components/seats/seats-market";
import { getSeatMarket, getStrategiesOverview } from "@/lib/mock-api";

export const metadata: Metadata = {
  title: { absolute: "Seats — PropChange" },
  description: "Every trader's Seats in one market: prices, returns, Seat Contracts kept, capacity, Seatlist bids and Epoch countdowns.",
};

export default async function SeatsPage() {
  const [{ rows, stats }, ov] = await Promise.all([getSeatMarket(), getStrategiesOverview()]);
  return (
    <SeatsMarket
      rows={rows}
      kpis={{
        strategies: ov.stats.strategies,
        traders: ov.stats.traders,
        seatsActive: stats.seatsActive,
        keptRate: ov.stats.keptRate,
        seats24h: stats.seats24h,
        volume24h: stats.volume24h,
        seatlist: stats.waitlist,
      }}
    />
  );
}

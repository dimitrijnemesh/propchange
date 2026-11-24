import type { Metadata } from "next";
import { SeatBoards } from "@/components/market/seat-boards";
import { SeatHeatmap } from "@/components/market/seat-heatmap";
import { MarketBanner } from "@/components/market/market-banner";
import { SeatMarketTable } from "@/components/market/seat-market-table";
import { getSeatMarket } from "@/lib/mock-api";
import { getT } from "@/lib/i18n/server";
import { fmtMoney, fmtPct } from "@/lib/format";

export const metadata: Metadata = {
  title: "Seats",
  description: "Prices, occupancy and waitlists for Seats across every strategy.",
};

export default async function SeatsPage() {
  const [{ rows, stats, boards }, t] = await Promise.all([getSeatMarket(), getT()]);

  return (
    <div className="container-market pt-6 md:pt-8">
      <MarketBanner
        title={t("nav.seatMarket")}
        stats={[
          { label: t("seats.feesMonth"), value: fmtMoney(stats.escrowRunRate, { compact: true }) },
          { label: t("seats.active"), value: stats.seatsActive.toLocaleString("en-US") },
          { label: t("seats.bought24h"), value: stats.seats24h },
          { label: t("seats.avgOcc"), value: fmtPct(stats.avgOccupancy, { digits: 0 }) },
          { label: t("seats.onWaitlists"), value: stats.waitlist.toLocaleString("en-US") },
        ]}
      />

      <section className="mt-6">
        <SeatBoards
          hot={boards.hot}
          filling={boards.filling}
          waitlist={boards.waitlist}
          titles={{ hot: t("seats.mostDemand"), filling: t("seats.fillingFast"), waitlist: t("seats.longestWaitlists") }}
        />
      </section>

      <section className="mt-12">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-[22px] font-semibold tracking-[-0.02em]">{t("seats.map")}</h2>
          <span className="tnum text-[12px] text-tertiary">7d · −8% … +8%</span>
        </div>
        <SeatHeatmap rows={rows.filter((r) => r.state !== "paused")} />
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-[22px] font-semibold tracking-[-0.02em]">{t("seats.all")}</h2>
        <SeatMarketTable rows={rows} />
      </section>
    </div>
  );
}

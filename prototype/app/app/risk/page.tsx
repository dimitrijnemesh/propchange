import type { Metadata } from "next";
import { RiskSettings } from "@/components/app/risk-settings";
import { PageHeader } from "@/components/layout/page-header";
import { getPortfolio } from "@/lib/mock-api";

export const metadata: Metadata = { title: "Risk settings" };

export default async function RiskPage() {
  const p = await getPortfolio();
  const seats = p.seats
    .filter((r) => r.seat.status === "active")
    .map((r) => ({
      id: r.seat.id,
      name: r.strategy.name,
      allocation: r.seat.seats * r.strategy.seatAllocationUsd,
      contractLev: parseFloat(r.strategy.contract.rules.find((x) => x.key === "leverage")!.limit),
    }));
  return (
    <>
      <PageHeader title="Risk settings" description="The Risk Engine protects you even from the trader. Limits are best-effort and do not guarantee against loss." />
      <RiskSettings seats={seats} />
    </>
  );
}

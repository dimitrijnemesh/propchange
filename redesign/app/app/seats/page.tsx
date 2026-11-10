import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { SeatCard } from "@/components/seat/seat-card";
import { buttonVariants } from "@/components/ui/button";
import { getPortfolio } from "@/lib/mock-api";

export const metadata: Metadata = { title: "My Seats" };

export default async function MySeats() {
  const p = await getPortfolio();
  const active = p.seats.filter((r) => r.seat.status === "active");
  const past = p.seats.filter((r) => r.seat.status !== "active");
  return (
    <>
      <PageHeader
        title="My Seats"
        description="Each Seat copies one strategy into your own account, up to its allocation."
        actions={
          <Link href="/strategies" className={buttonVariants()}>
            Get another Seat
          </Link>
        }
      />
      <h2 className="mb-3 text-caption text-secondary">Active · {active.length}</h2>
      <div className="space-y-4">
        {active.map((r) => (
          <SeatCard key={r.seat.id} seat={r.seat} strategy={r.strategy} account={p.accounts.find((a) => a.id === r.seat.accountId)} />
        ))}
      </div>
      <h2 className="mb-3 mt-10 text-caption text-secondary">Refunded &amp; expired · {past.length}</h2>
      <div className="space-y-4">
        {past.map((r) => (
          <SeatCard key={r.seat.id} seat={r.seat} strategy={r.strategy} account={p.accounts.find((a) => a.id === r.seat.accountId)} />
        ))}
      </div>
    </>
  );
}

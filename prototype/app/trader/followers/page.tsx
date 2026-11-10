import type { Metadata } from "next";
import { FollowersTable } from "@/components/app/followers-table";
import { PageHeader } from "@/components/layout/page-header";
import { getTraderDashboard } from "@/lib/mock-api";

export const metadata: Metadata = { title: "Followers" };

export default async function FollowersPage() {
  const d = await getTraderDashboard();
  const live = d.strategies.filter((s) => s.state !== "closed");
  return (
    <>
      <PageHeader title="Followers" description="Anonymous Seat holders. You never see their accounts or keys — only wallet stubs, Seats and realized slippage." />
      <FollowersTable rows={d.followers} strategies={live.map((s) => ({ id: s.id, name: s.name }))} />
      <p className="mt-3 text-caption text-tertiary">Showing up to 8 followers per strategy.</p>
    </>
  );
}

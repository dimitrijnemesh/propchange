import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";
import { ClaimRefund } from "@/components/app/claim-refund";
import { Money } from "@/components/common";
import { Address } from "@/components/common/address";
import { PageHeader } from "@/components/layout/page-header";
import { EscrowStatus } from "@/components/seat/escrow-status";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { getPortfolio } from "@/lib/mock-api";
import { fmtDate, fmtMoney } from "@/lib/format";
import { strategyById } from "@/mock/strategies";

export const metadata: Metadata = { title: "Wallet & Escrow" };

export default async function WalletPage() {
  const p = await getPortfolio();
  const active = p.seats.filter((r) => r.seat.status === "active");
  return (
    <>
      <PageHeader title="Wallet & Escrow" description="USDC on Solana. Only Seat Fees live here — never your trading capital." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-caption text-secondary">Wallet</span>
            <Badge variant="neutral">Solana · devnet (mock)</Badge>
          </div>
          <div className="mt-2">
            <Address value={p.user.wallet} className="text-[15px]" />
          </div>
          <div className="text-metric-xl mt-4">
            <Money value={p.user.usdcBalance} currency="USDC" />
          </div>
          <div className="text-caption text-tertiary">{p.user.solBalance} SOL for network fees</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-caption text-secondary">
            <Lock className="size-3.5" /> Held in escrow
          </div>
          <div className="text-metric-xl mt-2">
            <Money value={p.totals.escrowUsdc} currency="USDC" />
          </div>
          <div className="text-caption text-tertiary">Across {active.length} active Seats</div>
        </Card>
        <Card className="p-5">
          <div className="text-caption text-secondary">Refunds to claim</div>
          <div className="text-metric-xl mt-2">
            <Money value={p.totals.claimableRefundUsdc} currency="USDC" />
          </div>
          <div className="mt-3">
            <ClaimRefund amount={p.totals.claimableRefundUsdc} />
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Escrow positions" description="One escrow account per strategy and Epoch" />
        <CardBody className="px-0 pb-2">
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-bg-subtle text-caption text-secondary">
                <tr>
                  <th className="px-5 py-2.5 text-left font-medium">Strategy</th>
                  <th className="px-5 py-2.5 text-left font-medium">Epoch</th>
                  <th className="px-5 py-2.5 text-right font-medium">Amount</th>
                  <th className="px-5 py-2.5 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {p.seats.map(({ seat, strategy }) => (
                  <tr key={seat.id} className="h-12">
                    <td className="px-5 font-semibold">
                      <Link href={`/strategies/${strategy.slug}`} className="hover:text-primary-text">
                        {strategy.name}
                      </Link>
                    </td>
                    <td className="px-5 text-secondary">
                      {fmtDate(seat.epochStart, { year: false })} – {fmtDate(seat.epochEnd)}
                    </td>
                    <td className="tnum px-5 text-right font-semibold">{fmtMoney(seat.status === "refunded" ? seat.paidUsdc : seat.escrowUsdc, { currency: "USDC" })}</td>
                    <td className="px-5">
                      {seat.status === "refunded" ? <Badge variant="warning">Refundable — breached</Badge> : <Badge variant="primary">Locked until {fmtDate(seat.epochEnd, { year: false })}</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader title="Transactions" />
          <CardBody className="px-0 pb-2">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border">
                {p.walletTx.map((t) => (
                  <tr key={t.id} className="h-14">
                    <td className="px-5">
                      <div className="font-medium">{t.type}</div>
                      <div className="text-caption text-tertiary">
                        {t.strategyId ? strategyById(t.strategyId)?.name + " · " : ""}
                        {fmtDate(t.at)} · <span className="font-mono">{t.sig}</span>
                      </div>
                    </td>
                    <td className={`tnum px-5 text-right font-semibold ${t.amount >= 0 ? "text-up" : ""}`}>
                      {t.amount >= 0 ? "+" : ""}
                      {fmtMoney(t.amount, { currency: "USDC" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
        <Card className="h-fit p-5">
          <h3 className="text-h3 mb-3">How escrow works</h3>
          <EscrowStatus />
        </Card>
      </div>
    </>
  );
}

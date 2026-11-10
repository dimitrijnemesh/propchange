import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { SeatIcon } from "@/components/common/seat-icon";
import { Avatar, Delta, Money } from "@/components/common";
import { ContractStatusBadge } from "@/components/contract/risk-contract";
import { Badge } from "@/components/ui/badge";
import { fmtDate, fmtMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ExchangeAccount, Seat, Strategy } from "@/types/domain";
import { EscrowStatus } from "./escrow-status";
import { SeatActions } from "./seat-actions";
import { TODAY, daysBetween } from "@/mock/nav";

export function SeatCard({ seat, strategy: s, account }: { seat: Seat; strategy: Strategy; account?: ExchangeAccount }) {
  const allocation = seat.seats * s.seatAllocationUsd;
  const elapsed = Math.max(0, Math.min(30, daysBetween(seat.epochStart, TODAY)));
  const progress = elapsed / 30;
  const refunded = seat.status === "refunded";
  const epoch = s.epochs.find((e) => e.start === seat.epochStart);
  return (
    <article className={cn("rounded-lg border border-border bg-surface shadow-sm", refunded && "bg-bg-subtle")}>
      <header className="flex flex-wrap items-start gap-3 border-b border-border p-5">
        <Avatar name={s.traderHandle} size={36} />
        <div className="min-w-0 flex-1">
          <Link href={`/strategies/${s.slug}`} className="text-[15px] font-semibold hover:text-primary-text">
            {s.name}
          </Link>
          <p className="text-caption text-tertiary">
            by {s.traderHandle} · {account?.label ?? s.venue}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="neutral">
            <SeatIcon strokeWidth={1.75} /> {seat.seats} {seat.seats === 1 ? "Seat" : "Seats"}
          </Badge>
          {refunded ? (
            <Badge variant="warning">
              <RotateCcw strokeWidth={1.75} /> Refunded
            </Badge>
          ) : (
            <ContractStatusBadge status={s.contract.status} />
          )}
        </div>
      </header>
      <div className="grid grid-cols-2 gap-4 p-5 md:grid-cols-4">
        <Stat label="Allocation" value={<Money value={allocation} digits={0} />} />
        <Stat label="PnL on allocation" value={<span className={seat.pnlUsd >= 0 ? "text-up" : "text-down"}><Money value={seat.pnlUsd} /></span>} sub={<Delta value={seat.pnlUsd / allocation} />} />
        <Stat label={refunded ? "Refund" : "In escrow"} value={<Money value={refunded ? seat.paidUsdc : seat.escrowUsdc} currency="USDC" />} sub={`Term ${seat.termDays}d · paid ${fmtMoney(seat.paidUsdc, { currency: "USDC" })}`} />
        <Stat label={`Epoch ${epoch?.index ?? ""}`} value={refunded ? "Breached" : `Day ${elapsed} / 30`} sub={`${fmtDate(seat.epochStart, { year: false })} – ${fmtDate(seat.epochEnd, { year: false })}`} />
      </div>
      {!refunded ? (
        <div className="px-5 pb-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-bg-muted" role="progressbar" aria-label="Epoch progress" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-primary" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
      ) : null}
      <footer className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        {refunded ? (
          <p className="text-[13px] text-secondary">{s.pausedReason ?? "Contract breached — your Epoch fee was refunded."}</p>
        ) : (
          <EscrowStatus compact until={seat.epochEnd} className="self-start" />
        )}
        <SeatActions refunded={refunded} slug={s.slug} name={s.name} />
      </footer>
    </article>
  );
}

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div>
      <div className="text-caption text-tertiary">{label}</div>
      <div className="tnum mt-0.5 text-[17px] font-semibold">{value}</div>
      {sub ? <div className="text-caption text-tertiary">{sub}</div> : null}
    </div>
  );
}

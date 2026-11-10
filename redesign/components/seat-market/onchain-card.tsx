"use client";
import { Coins, FileCheck2, Landmark, ShieldCheck, Signature, Wallet } from "lucide-react";
import { Address } from "@/components/common/address";
import { SeatIcon } from "@/components/common/seat-icon";
import { SolanaMark } from "@/components/common/solana-mark";
import { ROYALTY, SEAT_PROGRAM_ID, SETTLEMENT_SIGNER, type SeatToken } from "@/lib/seat-curve";

/** On-chain accounts for a Seat token: mint, escrow, program, payout, settlement signer, contract hash. */
export function OnchainCard({ token }: { token: SeatToken }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <h2 className="flex items-center gap-2 text-[14px] font-semibold">
        <SolanaMark className="size-4" tone="gradient" /> On-chain · Solana
      </h2>
      <dl className="mt-3 space-y-2.5 text-[12.5px]">
        {[
          { icon: SeatIcon, label: "Seat mint", value: <Address value={token.mint} className="text-[12px]" /> },
          { icon: Landmark, label: "Epoch escrow", value: <Address value={token.escrow} className="text-[12px]" /> },
          { icon: FileCheck2, label: "Seat program", value: <Address value={SEAT_PROGRAM_ID} className="text-[12px]" /> },
          { icon: Wallet, label: "Trader payout", value: <Address value={token.traderWallet} className="text-[12px]" /> },
          { icon: Signature, label: "Settlement signer", value: <Address value={SETTLEMENT_SIGNER} className="text-[12px]" /> },
          { icon: ShieldCheck, label: "Contract hash", value: <Address value={token.contractHash} className="text-[12px]" /> },
        ].map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-1.5 text-tertiary">
              <r.icon className="size-3.5" strokeWidth={1.75} /> {r.label}
            </dt>
            <dd className="text-secondary">{r.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 rounded-lg bg-bg-subtle p-3 text-[12px] leading-5 text-secondary">
        <div className="mb-1 flex items-center gap-1.5 font-semibold text-text">
          <Coins className="size-3.5" /> SPL Token-2022 · 1 token = 1 Seat
        </div>
        Supply fixed by Capacity ({token.supply}). Transfer hook enforces the {Math.round(ROYALTY.trader * 100)}% trader + {Math.round(ROYALTY.platform * 100)}% platform
        royalty and halts transfers while the strategy is paused. At Epoch end the escrow pays the trader if the Seat Contract was kept, or refunds
        current holders if it was breached.
      </div>
    </section>
  );
}

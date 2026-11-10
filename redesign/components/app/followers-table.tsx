"use client";
import { useState } from "react";
import { Delta } from "@/components/common";
import { Pills } from "@/components/ui/tabs";
import { fmtDate } from "@/lib/format";

type F = { id: string; strategyId: string; strategyName: string; wallet: string; seats: number; since: string; venue: string; slippageBps: number; pnlPct: number };

export function FollowersTable({ rows, strategies }: { rows: F[]; strategies: { id: string; name: string }[] }) {
  const [f, setF] = useState("all");
  const list = rows.filter((r) => f === "all" || r.strategyId === f);
  return (
    <>
      <Pills ariaLabel="Strategy" className="mb-4" value={f} onChange={setF} options={[{ value: "all", label: "All" }, ...strategies.map((s) => ({ value: s.id, label: s.name }))]} />
      <div className="scroll-thin overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-bg-subtle text-caption text-secondary">
            <tr>
              <th className="px-5 py-2.5 text-left font-medium">Follower</th>
              <th className="px-5 py-2.5 text-left font-medium">Strategy</th>
              <th className="px-5 py-2.5 text-right font-medium">Seats</th>
              <th className="px-5 py-2.5 text-left font-medium">Since</th>
              <th className="px-5 py-2.5 text-right font-medium">Slippage</th>
              <th className="px-5 py-2.5 text-right font-medium">Return (3m)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {list.map((r) => (
              <tr key={r.id} className="h-12">
                <td className="px-5 font-mono text-[13px]">{r.wallet}</td>
                <td className="px-5">{r.strategyName}</td>
                <td className="tnum px-5 text-right">{r.seats}</td>
                <td className="px-5 text-secondary">{fmtDate(r.since)}</td>
                <td className="tnum px-5 text-right">{r.slippageBps} bps</td>
                <td className="px-5 text-right font-semibold">
                  <Delta value={r.pnlPct} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

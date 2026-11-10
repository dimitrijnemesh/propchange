"use client";
import { Tooltip } from "@/components/ui/tooltip";
import { fmtDate, fmtMoney, fmtPct } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Epoch } from "@/types/domain";

const outcomeLabel: Record<Epoch["outcome"], string> = {
  kept: "Contract kept",
  breach_hard: "Hard breach — full refund",
  breach_soft: "Soft breach — pro-rata refund",
  running: "Running",
  upcoming: "Upcoming",
};

export function EpochTimeline({ epochs, max = 12, className }: { epochs: Epoch[]; max?: number; className?: string }) {
  const list = epochs.slice(-max);
  return (
    <div className={className}>
      <div className="flex gap-1" role="list" aria-label="Epoch history">
        {list.map((e) => (
          <Tooltip
            key={e.index}
            asChild
            content={
              <div className="space-y-0.5">
                <div className="font-semibold">
                  Epoch {e.index} · {outcomeLabel[e.outcome]}
                </div>
                <div>
                  {fmtDate(e.start, { year: false })} – {fmtDate(e.end)}
                </div>
                {e.returnPct !== undefined ? <div>Return {fmtPct(e.returnPct, { sign: true })}</div> : null}
                {e.payoutUsdc ? <div>Paid to trader {fmtMoney(e.payoutUsdc, { currency: "USDC", digits: 0 })}</div> : null}
                {e.refundUsdc ? <div>Refunded {fmtMoney(e.refundUsdc, { currency: "USDC", digits: 0 })}</div> : null}
                {e.breachReason ? <div className="opacity-80">{e.breachReason}</div> : null}
              </div>
            }
          >
            <button
              type="button"
              role="listitem"
              aria-label={`Epoch ${e.index}: ${outcomeLabel[e.outcome]}`}
              className={cn(
                "relative h-8 min-w-0 flex-1 overflow-hidden rounded-sm transition-opacity hover:opacity-80",
                e.outcome === "kept" && "bg-success",
                e.outcome === "breach_hard" && "bg-danger",
                e.outcome === "breach_soft" && "bg-warning",
                e.outcome === "running" && "border-2 border-primary bg-primary-soft",
                e.outcome === "upcoming" && "border-2 border-dashed border-border-strong",
              )}
            >
              {e.outcome === "running" ? (
                <span className="absolute inset-y-0 left-0 bg-primary/30" style={{ width: `${(e.progress ?? 0) * 100}%` }} />
              ) : null}
            </button>
          </Tooltip>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-caption text-tertiary">
        <span>Epoch {list[0]?.index}</span>
        <span>Epoch {list[list.length - 1]?.index}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-caption text-secondary">
        <Legend cls="bg-success" label="Kept" />
        <Legend cls="bg-danger" label="Hard breach" />
        <Legend cls="bg-warning" label="Soft breach" />
        <Legend cls="border-2 border-primary bg-primary-soft" label="Current" />
      </div>
    </div>
  );
}

function Legend({ cls, label }: { cls: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("size-2.5 rounded-[3px]", cls)} />
      {label}
    </span>
  );
}

export function OutcomeBadge({ outcome }: { outcome: Epoch["outcome"] }) {
  const cls = {
    kept: "bg-success-soft text-success",
    breach_hard: "bg-danger-soft text-danger",
    breach_soft: "bg-warning-soft text-warning",
    running: "bg-primary-soft text-primary-soft-text",
    upcoming: "bg-bg-muted text-secondary",
  }[outcome];
  const label = { kept: "Kept", breach_hard: "Hard breach", breach_soft: "Soft breach", running: "Running", upcoming: "Upcoming" }[outcome];
  return <span className={cn("inline-flex h-[22px] items-center rounded-sm px-2 text-caption", cls)}>{label}</span>;
}

import { CheckCircle2, Lock, RotateCcw } from "lucide-react";
import { fmtDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function EscrowStatus({
  until,
  compact,
  className,
}: {
  until?: string;
  compact?: boolean;
  className?: string;
}) {
  if (compact)
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-caption shadow-sm",
          className,
        )}
      >
        <Lock className="size-3.5 text-primary-text" strokeWidth={1.75} />
        Held in escrow{until ? ` until ${fmtDate(until, { year: false })}` : ""}
      </div>
    );
  const rows = [
    { icon: Lock, tone: "text-primary-text", text: <>Held in escrow{until ? <> until <b className="font-semibold text-text">{fmtDate(until)}</b></> : " for the Epoch"}</> },
    { icon: CheckCircle2, tone: "text-success", text: "Released to the trader if the Seat Contract is kept" },
    { icon: RotateCcw, tone: "text-warning", text: "Refunded to you if the contract is breached" },
  ];
  return (
    <ul className={cn("space-y-2", className)}>
      {rows.map((r, i) => (
        <li key={i} className="flex items-start gap-2.5 text-secondary">
          <r.icon className={cn("mt-0.5 size-4 shrink-0", r.tone)} strokeWidth={1.75} />
          <span>{r.text}</span>
        </li>
      ))}
    </ul>
  );
}

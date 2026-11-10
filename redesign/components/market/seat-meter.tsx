import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SeatMeter({
  taken,
  total,
  waitlist = 0,
  size = "md",
  className,
}: {
  taken: number;
  total: number;
  waitlist?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const pct = total ? taken / total : 0;
  const full = taken >= total;
  return (
    <div className={cn("w-full", className)}>
      {size !== "sm" ? (
        <div className="mb-1.5 flex items-center justify-between gap-2 text-caption">
          <span className="tnum text-text">
            <span className="font-semibold">{taken}</span>
            <span className="text-tertiary">/{total} seats</span>
          </span>
          {full ? (
            <span className="flex items-center gap-1.5">
              <Badge variant="solid">Full</Badge>
              {waitlist ? <span className="tnum text-secondary">{waitlist} waitlist</span> : null}
            </span>
          ) : (
            <span className="tnum text-secondary">{Math.round(pct * 100)}% occupied</span>
          )}
        </div>
      ) : null}
      <div
        className={cn("w-full overflow-hidden rounded-full bg-bg-muted", size === "lg" ? "h-3" : size === "sm" ? "h-1.5" : "h-2")}
        role="meter"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={taken}
        aria-label={`${taken} of ${total} seats occupied`}
      >
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, pct * 100)}%` }} />
      </div>
      {size === "sm" ? (
        <div className="tnum mt-1 text-caption text-tertiary">
          {taken}/{total}
          {full ? " · Full" : ""}
        </div>
      ) : null}
    </div>
  );
}

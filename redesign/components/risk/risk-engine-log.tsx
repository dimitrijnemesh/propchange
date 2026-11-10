import { AlertTriangle, Info, OctagonX } from "lucide-react";
import { fmtDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { RiskLogEntry } from "@/types/domain";

export function RiskEngineLog({
  entries,
  className,
  showStrategy = true,
}: {
  entries: (RiskLogEntry & { strategyName?: string })[];
  className?: string;
  showStrategy?: boolean;
}) {
  return (
    <ol className={cn("relative", className)}>
      {entries.map((e, i) => {
        const I = e.level === "danger" ? OctagonX : e.level === "warning" ? AlertTriangle : Info;
        return (
          <li key={e.id} className="relative flex gap-3 pb-4 last:pb-0">
            {i < entries.length - 1 ? <span className="absolute left-[13px] top-7 h-[calc(100%-24px)] w-px bg-border" aria-hidden /> : null}
            <span
              className={cn(
                "relative z-10 mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
                e.level === "danger" && "bg-danger-soft text-danger",
                e.level === "warning" && "bg-warning-soft text-warning",
                e.level === "info" && "bg-primary-soft text-primary-soft-text",
              )}
            >
              <I className="size-3.5" strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="font-semibold">{e.action}</p>
                <time className="text-caption text-tertiary">{fmtDateTime(e.at)}</time>
              </div>
              <p className="text-secondary">{e.detail}</p>
              {showStrategy && e.strategyName ? <p className="mt-0.5 text-caption text-tertiary">{e.strategyName}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

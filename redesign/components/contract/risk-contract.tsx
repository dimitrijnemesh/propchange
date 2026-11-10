import Link from "next/link";
import { CheckCircle2, ListChecks, ShieldAlert, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { RiskContract, RiskRule } from "@/types/domain";

export function usageTone(u: number) {
  return u > 0.85 ? "danger" : u >= 0.6 ? "warning" : "primary";
}

export function RuleRow({ rule, compact }: { rule: RiskRule; compact?: boolean }) {
  const isList = rule.key === "instruments";
  const isMin = rule.key === "activity";
  const tone = isMin ? (rule.usage >= 1 ? "success" : "primary") : usageTone(rule.usage);
  const bar = {
    primary: "bg-primary",
    warning: "bg-warning",
    danger: "bg-danger",
    success: "bg-success",
  }[tone];
  const dot = rule.usage > 1 && !isMin ? "bg-danger" : tone === "danger" ? "bg-danger" : tone === "warning" ? "bg-warning" : "bg-success";
  return (
    <div className={cn("grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5", compact ? "py-2" : "py-3")}>
      <div className="flex min-w-0 items-center gap-2">
        <span className={cn("size-2 shrink-0 rounded-full", dot)} aria-hidden />
        <span className="truncate font-medium">{rule.label}</span>
        {rule.tightened ? (
          <Tooltip content="The trader tightened this rule below the generated limit.">
            <Badge variant="primary" className="h-[18px] px-1.5 text-[11px]">
              Tightened
            </Badge>
          </Tooltip>
        ) : null}
      </div>
      <span className="tnum text-right font-semibold">{rule.limit}</span>
      {isList ? (
        <p className="col-span-2 flex items-center gap-1.5 pl-4 text-caption text-success">
          <CheckCircle2 className="size-3.5" /> {rule.current}
        </p>
      ) : (
        <div className="col-span-2 flex items-center gap-3 pl-4">
          <div
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-muted"
            role="meter"
            aria-label={`${rule.label} usage`}
            aria-valuenow={Math.round(rule.usage * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className={cn("h-full rounded-full", bar)} style={{ width: `${Math.min(100, rule.usage * 100)}%` }} />
          </div>
          <span className="tnum w-[128px] shrink-0 text-right text-caption text-secondary">
            {isMin ? rule.current : `${rule.current} of ${rule.limit.replace(" equity", "")}`}
          </span>
        </div>
      )}
    </div>
  );
}

export function ContractStatusBadge({ status }: { status: RiskContract["status"] }) {
  if (status === "active")
    return (
      <Badge variant="primary">
        <ShieldCheck strokeWidth={1.75} /> Active
      </Badge>
    );
  if (status === "kept")
    return (
      <Badge variant="success">
        <ShieldCheck strokeWidth={1.75} /> Kept
      </Badge>
    );
  return (
    <Badge variant="danger">
      <ShieldAlert strokeWidth={1.75} /> Breached
    </Badge>
  );
}

export function RiskContractCard({
  contract,
  compact,
  className,
  rulesLimit,
}: {
  contract: RiskContract;
  compact?: boolean;
  className?: string;
  rulesLimit?: number;
}) {
  const rules = rulesLimit ? contract.rules.slice(0, rulesLimit) : contract.rules;
  return (
    <section className={cn("rounded-lg border border-border bg-surface shadow-sm", className)}>
      <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
        <h3 className="flex items-center gap-2 whitespace-nowrap text-[15px] font-semibold">
          <ListChecks className="size-4 text-primary-text" strokeWidth={1.75} />
          Seat Contract · Epoch {contract.epoch}
        </h3>
        <ContractStatusBadge status={contract.status} />
      </header>
      <div className={cn("divide-y divide-border px-5", compact && "py-1")}>
        {rules.map((r) => (
          <RuleRow key={r.key} rule={r} compact={compact} />
        ))}
      </div>
      {!compact ? (
        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-5 py-3 text-caption text-tertiary">
          <span className="font-mono">
            hash {contract.hash.slice(0, 10)}…{contract.hash.slice(-6)}
          </span>
          <Link href="/how-it-works#contract" className="font-semibold text-primary-text hover:underline">
            How rules are generated
          </Link>
        </footer>
      ) : null}
    </section>
  );
}

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { fmtMoney, fmtPct } from "@/lib/format";
import { cn } from "@/lib/utils";
import { InfoTip } from "@/components/ui/tooltip";

export function Money({
  value,
  currency = "USD",
  compact,
  digits,
  className,
}: {
  value: number;
  currency?: "USD" | "USDC";
  compact?: boolean;
  digits?: number;
  className?: string;
}) {
  if (currency === "USDC") {
    const num = fmtMoney(value, { currency: "USD", compact, digits }).replace("$", "");
    return (
      <span className={cn("tnum whitespace-nowrap", className)}>
        {num}
        <span className="ml-[0.25em] text-[0.62em] font-semibold text-secondary">USDC</span>
      </span>
    );
  }
  return <span className={cn("tnum", className)}>{fmtMoney(value, { currency, compact, digits })}</span>;
}

/** Signed percent with up/down colors; never relies on color alone. */
export function Delta({
  value,
  digits = 1,
  arrow,
  className,
  neutral,
}: {
  value: number;
  digits?: number;
  arrow?: boolean;
  className?: string;
  neutral?: boolean;
}) {
  const up = value > 0;
  const down = value < 0;
  return (
    <span
      className={cn(
        "tnum inline-flex items-center gap-0.5",
        !neutral && up && "text-up",
        !neutral && down && "text-down",
        className,
      )}
    >
      {arrow && up ? <ArrowUpRight className="size-3.5" /> : null}
      {arrow && down ? <ArrowDownRight className="size-3.5" /> : null}
      {fmtPct(value, { sign: true, digits })}
    </span>
  );
}

export function Pct({ value, digits = 1, className }: { value: number; digits?: number; className?: string }) {
  return <span className={cn("tnum", className)}>{fmtPct(value, { digits })}</span>;
}

export function Avatar({ name, size = 32, className }: { name: string; size?: number; className?: string }) {
  const initials = name
    .replace(/[^a-zA-Z ]/g, " ")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-primary-soft font-semibold text-primary-soft-text",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.38) }}
    >
      {initials}
    </span>
  );
}

export function Sparkline({
  data,
  width = 80,
  height = 28,
  className,
  tone = "primary",
}: {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
  tone?: "primary" | "up" | "down";
}) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data
    .map((v, i) => `${((i / (data.length - 1)) * width).toFixed(1)},${(height - 2 - ((v - min) / span) * (height - 4)).toFixed(1)}`)
    .join(" ");
  const stroke = tone === "up" ? "var(--up)" : tone === "down" ? "var(--down)" : "var(--chart-nav)";
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} aria-hidden>
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function MetricTile({
  label,
  value,
  sub,
  info,
  className,
  children,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  info?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("min-w-0 rounded-lg border border-border bg-surface p-4 md:p-5", className)}>
      <div className="flex items-center gap-1.5 text-caption text-secondary">
        {label}
        {info ? <InfoTip content={info} label={`About ${label}`} /> : null}
      </div>
      <div className="text-metric-xl mt-1.5 truncate">{value}</div>
      {sub ? <div className="mt-1 text-caption text-tertiary">{sub}</div> : null}
      {children}
    </div>
  );
}

export function MetricGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4", className)}>{children}</div>;
}

export function StatList({
  rows,
  className,
}: {
  rows: { label: React.ReactNode; value: React.ReactNode; info?: React.ReactNode }[];
  className?: string;
}) {
  return (
    <dl className={cn("divide-y divide-border", className)}>
      {rows.map((r, i) => (
        <div key={i} className="flex items-center justify-between gap-4 py-2.5">
          <dt className="flex items-center gap-1.5 text-secondary">
            {r.label}
            {r.info ? <InfoTip content={r.info} /> : null}
          </dt>
          <dd className="tnum text-right font-semibold">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-12 text-center", className)}>
      <div className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary-soft-text [&_svg]:size-6">
        {icon}
      </div>
      <h3 className="text-h3 mt-4">{title}</h3>
      <p className="mt-1 max-w-sm text-secondary">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function SectionTitle({
  title,
  description,
  action,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex flex-wrap items-end justify-between gap-3", className)}>
      <div>
        <h2 className="text-h2">{title}</h2>
        {description ? <p className="mt-1 text-secondary">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

import { cn } from "@/lib/utils";

/** Flat exchange-style page header: title, optional action, one slim row of stats. */
export function MarketBanner({
  title,
  stats,
  actions,
  footer,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  stats: { label: string; value: React.ReactNode; sub?: React.ReactNode }[];
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  live?: boolean | string;
  badge?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border-b border-border", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[34px] font-bold leading-[1.05] tracking-[-0.045em] md:text-[48px]">{title}</h1>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
      <dl className="scroll-thin mt-3 flex gap-8 overflow-x-auto pb-4">
        {stats.map((s) => (
          <div key={s.label} className="shrink-0">
            <dt className="text-[12px] text-tertiary">{s.label}</dt>
            <dd className="tnum mt-0.5 font-mono text-[15px] font-semibold">{s.value}</dd>
          </div>
        ))}
      </dl>
      {footer}
    </section>
  );
}

export function LiveBadge({ label = "Live" }: { label?: string }) {
  return <span className="inline-flex h-6 items-center rounded-md bg-bg-muted px-2 text-caption font-semibold text-secondary">{label}</span>;
}

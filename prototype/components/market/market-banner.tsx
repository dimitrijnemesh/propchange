import { cn } from "@/lib/utils";

/** Flagship page header: deep-navy panel with brand glows, live badge and headline stats. */
export function MarketBanner({
  eyebrow,
  title,
  description,
  stats,
  actions,
  footer,
  live,
  badge,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  stats: { label: string; value: React.ReactNode; sub?: React.ReactNode }[];
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  live?: boolean | string;
  /** small chip after the eyebrow (e.g. "Settled on Solana") */
  badge?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("market-banner relative isolate overflow-hidden rounded-xl text-white", className)}>
      <div aria-hidden className="market-banner-dots pointer-events-none absolute inset-0" />
      <div className="relative px-5 pb-6 pt-6 md:px-8 md:pb-8 md:pt-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {live ? <LiveBadge label={typeof live === "string" ? live : undefined} /> : null}
              {eyebrow ? <span className="text-caption font-medium uppercase tracking-[0.14em] text-white/70">{eyebrow}</span> : null}
              {badge}
            </div>
            <h1 className="text-h1 mt-2 font-display font-medium tracking-[-0.02em] md:text-[40px] md:leading-[48px]">{title}</h1>
            {description ? <p className="mt-2 max-w-[640px] text-white/75">{description}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-white/10 [clip-path:inset(0_round_8px)] md:grid-cols-3 lg:grid-cols-5">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={cn(
                "market-banner-stat px-4 py-3.5",
                // odd count on mobile: let the last stat span the full row
                stats.length % 2 === 1 && i === stats.length - 1 && "col-span-2 md:col-span-1",
              )}
            >
              <dt className="truncate text-caption text-white/65">{s.label}</dt>
              <dd className="tnum mt-1 truncate text-[22px] font-bold leading-7 md:text-[24px]">{s.value}</dd>
              {s.sub ? <dd className="tnum text-caption text-white/60 md:truncate">{s.sub}</dd> : null}
            </div>
          ))}
        </dl>
      </div>
      {footer ? <div className="relative border-t border-white/10">{footer}</div> : null}
    </section>
  );
}

export function LiveBadge({ label = "Live" }: { label?: string }) {
  return (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-white/12 px-2.5 text-caption font-semibold text-white ring-1 ring-white/20">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#9DB4FF] opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-[#9DB4FF]" />
      </span>
      {label}
    </span>
  );
}

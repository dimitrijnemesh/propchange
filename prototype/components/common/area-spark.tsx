import { fmtPct } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Filled area sparkline (pure SVG) shared by the landing and market pages. Stretches to its box. */
export function AreaSpark({
  data,
  up,
  id,
  className,
  strokeWidth = 1.6,
}: {
  data: number[];
  up: boolean;
  id: string;
  className?: string;
  strokeWidth?: number;
}) {
  if (data.length < 2) return null;
  const w = 200;
  const h = 60;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const x = (i: number) => (i / (data.length - 1)) * w;
  const y = (v: number) => h - 3 - ((v - min) / (max - min || 1)) * (h - 8);
  const line = data.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const color = up ? "var(--up)" : "var(--down)";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.34" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${w},${h} L0,${h} Z`} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}

/** Solid green/red change pill, exchange-ticker style. */
export function ChangePill({ v, className }: { v: number; className?: string }) {
  return (
    <span className={cn("tnum inline-block rounded-md px-1.5 py-0.5 text-[12.5px] font-semibold text-white", v >= 0 ? "bg-[var(--up)]" : "bg-[var(--down)]", className)}>
      {fmtPct(v, { sign: true })}
    </span>
  );
}

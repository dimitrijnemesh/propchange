import { cn } from "@/lib/utils";

/** Mini area chart (server-renderable SVG): line + soft gradient fill, colored by direction. */
export function AreaSpark({
  data,
  height = 56,
  className,
  tone,
}: {
  data: number[];
  height?: number;
  className?: string;
  tone?: "up" | "down" | "primary";
}) {
  if (data.length < 2) return null;
  // Deterministic gradient id from the data (no hooks, works in server components).
  const id = Math.abs(data.reduce((h, v, i) => (h * 31 + Math.round(v * 1e4) + i) | 0, 7)).toString(36);
  const w = 300;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, height - 3 - ((v - min) / span) * (height - 8)] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${w},${height} L0,${height} Z`;
  const dir = tone ?? (data[data.length - 1] >= data[0] ? "up" : "down");
  const color = dir === "up" ? "var(--up)" : dir === "down" ? "var(--down)" : "var(--chart-nav)";
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className={cn("block w-full", className)} style={{ height }} aria-hidden>
      <defs>
        <linearGradient id={`as-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.22} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* gradient fill only in dark mode; light mode is a clean line */}
      <path d={area} fill={`url(#as-${id})`} className="hidden dark:inline" />
      <path d={line} fill="none" stroke={color} strokeWidth={1.75} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}

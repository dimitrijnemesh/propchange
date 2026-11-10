import { monthNames } from "@/lib/format";
import { cn } from "@/lib/utils";

function cellStyle(v: number) {
  const k = Math.min(1, Math.abs(v) / 0.1);
  const pct = Math.round(8 + k * 52);
  const tone = v >= 0 ? "var(--up)" : "var(--down)";
  return { background: `color-mix(in srgb, ${tone} ${pct}%, var(--bg-muted))` };
}

export function MonthlyHeatmap({ data }: { data: { month: string; ret: number }[] }) {
  const years = [...new Set(data.map((d) => d.month.slice(0, 4)))].sort();
  const map = new Map(data.map((d) => [d.month, d.ret]));
  return (
    <div className="scroll-thin overflow-x-auto">
      <table className="w-full min-w-[720px] border-separate border-spacing-1 text-center text-caption">
        <thead>
          <tr className="text-tertiary">
            <th className="w-12 text-left font-medium">Year</th>
            {monthNames.map((m) => (
              <th key={m} className="font-medium">
                {m}
              </th>
            ))}
            <th className="font-semibold text-secondary">Total</th>
          </tr>
        </thead>
        <tbody>
          {years.map((y) => {
            const months = monthNames.map((_, i) => map.get(`${y}-${String(i + 1).padStart(2, "0")}`));
            const total = months.reduce<number>((a, v) => (v === undefined ? a : a * (1 + v)), 1) - 1;
            return (
              <tr key={y}>
                <td className="text-left font-semibold text-secondary">{y}</td>
                {months.map((v, i) => (
                  <td
                    key={i}
                    className={cn("tnum h-9 rounded-sm font-semibold", v === undefined && "bg-bg-subtle text-disabled")}
                    style={v === undefined ? undefined : cellStyle(v)}
                    title={v === undefined ? "No data" : undefined}
                  >
                    {v === undefined ? "—" : `${v >= 0 ? "+" : "−"}${Math.abs(v * 100).toFixed(1)}`}
                  </td>
                ))}
                <td className={cn("tnum rounded-sm bg-bg-subtle font-bold", total >= 0 ? "text-up" : "text-down")}>
                  {total >= 0 ? "+" : "−"}
                  {Math.abs(total * 100).toFixed(1)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-2 text-caption text-tertiary">Monthly returns in %, color clamped at ±10%.</p>
    </div>
  );
}

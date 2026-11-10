"use client";
import { useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AxisPill, LegendItem, axis, tickDate } from "@/components/analytics/charts";
import { fmtDate } from "@/lib/format";

type HoverState = { activeTooltipIndex?: number | string | null };

/** Seat token price: market (last trade) vs bonding-curve price, 30 days. */
export function SeatChart({ data, height = 280 }: { data: { date: string; market: number; curve: number }[]; height?: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const cur = data[hover ?? data.length - 1];
  const last = data[data.length - 1];
  const prem = cur.curve ? cur.market / cur.curve - 1 : 0;
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
        <span className="tnum font-mono text-tertiary">{fmtDate(cur.date)}</span>
        <LegendItem color="var(--chart-nav)" label="Market" value={`${cur.market.toFixed(2)} USDC`} />
        <LegendItem color="var(--text-tertiary)" dashed label="Curve" value={`${cur.curve.toFixed(2)} USDC`} />
        <LegendItem color="transparent" label="Premium" value={`${prem >= 0 ? "+" : "−"}${Math.abs(prem * 100).toFixed(1)}%`} tone={prem} />
      </div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
            onMouseMove={(s: HoverState) => setHover(typeof s.activeTooltipIndex === "number" ? s.activeTooltipIndex : s.activeTooltipIndex != null ? Number(s.activeTooltipIndex) : null)}
            onMouseLeave={() => setHover(null)}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" {...axis} tickFormatter={tickDate} minTickGap={56} />
            <YAxis orientation="right" {...axis} width={62} domain={["auto", "auto"]} tickFormatter={(v) => Number(v).toFixed(1)} />
            <Tooltip cursor={{ stroke: "var(--border-strong)" }} content={() => null} />
            <ReferenceLine
              y={last.market}
              stroke="transparent"
              label={(p: { viewBox?: { x?: number; y?: number; width?: number } }) => <AxisPill viewBox={p.viewBox} text={last.market.toFixed(2)} />}
            />
            <Line type="stepAfter" dataKey="curve" stroke="var(--text-tertiary)" strokeWidth={1.5} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="market" stroke="var(--chart-nav)" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

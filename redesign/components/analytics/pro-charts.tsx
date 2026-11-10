"use client";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { fmtDate, fmtPct } from "@/lib/format";
import { exposureSummary, rollingBeta, scatterPoints, weekdayStats } from "@/lib/pro-stats";
import { rollingStats } from "@/lib/series-stats";
import type { NavPoint } from "@/types/domain";
import { AxisPill, LegendItem, TipBox, axis, tickDate } from "./charts";

type HoverState = { activeTooltipIndex?: number | string | null };
const idx = (s: HoverState) => (typeof s.activeTooltipIndex === "number" ? s.activeTooltipIndex : s.activeTooltipIndex != null ? Number(s.activeTooltipIndex) : null);

/** Daily strategy vs BTC returns with the fitted regression line (beta = slope). */
export function BenchmarkScatter({ data, beta, intercept, height = 280 }: { data: NavPoint[]; beta: number; intercept: number; height?: number }) {
  const pts = useMemo(() => scatterPoints(data), [data]);
  const xs = pts.map((p) => p.x);
  const ext = Math.ceil(Math.max(...xs.map(Math.abs), 1));
  const yAt = (x: number) => (intercept * 100 + beta * x);
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
        <LegendItem color="var(--chart-nav)" label="Daily return pair" value={`${pts.length} days`} />
        <LegendItem color="var(--text-secondary)" dashed label="Fit · β" value={beta.toFixed(2)} />
      </div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 0, left: 0, bottom: 4 }}>
            <CartesianGrid />
            <XAxis type="number" dataKey="x" {...axis} domain={[-ext, ext]} tickFormatter={(v) => `${v}%`} name="BTC" />
            <YAxis type="number" dataKey="y" orientation="right" {...axis} width={52} tickFormatter={(v) => `${v}%`} name="Strategy" />
            <ZAxis range={[14, 14]} />
            <ReferenceLine x={0} stroke="var(--border-strong)" />
            <ReferenceLine y={0} stroke="var(--border-strong)" />
            <ReferenceLine
              segment={[
                { x: -ext, y: yAt(-ext) },
                { x: ext, y: yAt(ext) },
              ]}
              stroke="var(--text-secondary)"
              strokeDasharray="5 4"
              strokeWidth={1.5}
              ifOverflow="hidden"
            />
            <Tooltip
              cursor={{ stroke: "var(--border-strong)" }}
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <TipBox>
                    <div>BTC {fmtPct(payload[0].payload.x / 100, { sign: true, digits: 2 })}</div>
                    <div>Strategy {fmtPct(payload[0].payload.y / 100, { sign: true, digits: 2 })}</div>
                  </TipBox>
                ) : null
              }
            />
            <Scatter data={pts} fill="var(--chart-nav)" fillOpacity={0.35} isAnimationActive={false} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-center text-[11.5px] text-tertiary">BTC daily return →</p>
    </div>
  );
}

/** 90-day rolling beta and correlation to BTC (same unitless scale, one axis). */
export function RollingBetaChart({ data, height = 220 }: { data: NavPoint[]; height?: number }) {
  const rows = useMemo(() => rollingBeta(data, 90), [data]);
  const [hover, setHover] = useState<number | null>(null);
  if (rows.length < 5) return <p className="text-secondary">Needs at least 90 days of history.</p>;
  const cur = rows[hover ?? rows.length - 1];
  const lo = Math.min(0, ...rows.map((r) => Math.min(r.beta, r.corr)));
  const hi = Math.max(1, ...rows.map((r) => Math.max(r.beta, r.corr)));
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
        <span className="tnum font-mono text-tertiary">{fmtDate(cur.date)}</span>
        <LegendItem color="var(--chart-nav)" label="Beta" value={cur.beta.toFixed(2)} />
        <LegendItem color="var(--text-tertiary)" dashed label="Correlation" value={cur.corr.toFixed(2)} />
      </div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={rows}
            margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
            onMouseMove={(s: HoverState) => setHover(idx(s))}
            onMouseLeave={() => setHover(null)}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" {...axis} tickFormatter={tickDate} minTickGap={56} />
            <YAxis orientation="right" {...axis} width={58} domain={[Math.floor(lo * 10) / 10, Math.ceil(hi * 10) / 10]} tickFormatter={(v) => Number(v).toFixed(1)} />
            <Tooltip cursor={{ stroke: "var(--border-strong)" }} content={() => null} />
            <ReferenceLine y={0} stroke="var(--border-strong)" />
            <ReferenceLine
              y={rows[rows.length - 1].beta}
              stroke="transparent"
              label={(p: { viewBox?: { x?: number; y?: number; width?: number } }) => <AxisPill viewBox={p.viewBox} text={rows[rows.length - 1].beta.toFixed(2)} />}
            />
            <Line type="monotone" dataKey="corr" stroke="var(--text-tertiary)" strokeWidth={1.5} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="beta" stroke="var(--chart-nav)" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/**
 * Rolling 90-day Sharpe and annualized volatility as two synced panes
 * (two measures, two scales → two charts, never a dual axis).
 */
export function RollingPanes({ data }: { data: NavPoint[] }) {
  const rows = useMemo(() => rollingStats(data, 90), [data]);
  const [hover, setHover] = useState<number | null>(null);
  if (rows.length < 5) return <p className="text-secondary">Needs at least 90 days of history.</p>;
  const cur = rows[hover ?? rows.length - 1];
  const onMove = (s: HoverState) => setHover(idx(s));
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
        <span className="tnum font-mono text-tertiary">{fmtDate(cur.date)}</span>
        <LegendItem color="var(--chart-nav)" label="Sharpe 90d" value={cur.sharpe.toFixed(2)} />
        <LegendItem color="var(--chart-follower)" label="Volatility 90d" value={`${cur.vol.toFixed(1)}%`} />
      </div>
      <div className="h-[170px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} syncId="rolling" margin={{ top: 8, right: 0, left: 0, bottom: 0 }} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" hide />
            <YAxis orientation="right" {...axis} width={58} tickFormatter={(v) => Number(v).toFixed(1)} />
            <Tooltip cursor={{ stroke: "var(--border-strong)" }} content={() => null} />
            <ReferenceLine y={0} stroke="var(--border-strong)" />
            <ReferenceLine y={1} stroke="var(--border-strong)" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="sharpe" stroke="var(--chart-nav)" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 border-t border-border pt-1 text-[11px] font-medium uppercase tracking-[0.1em] text-tertiary">Volatility (ann.)</div>
      <div className="h-[110px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows} syncId="rolling" margin={{ top: 4, right: 0, left: 0, bottom: 0 }} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" {...axis} tickFormatter={tickDate} minTickGap={56} />
            <YAxis orientation="right" {...axis} width={58} tickFormatter={(v) => `${v}%`} tickCount={3} />
            <Tooltip cursor={{ stroke: "var(--border-strong)" }} content={() => null} />
            <Area type="monotone" dataKey="vol" stroke="var(--chart-follower)" strokeWidth={1.5} fill="var(--chart-follower)" fillOpacity={0.18} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/** Average daily return by weekday (polarity bars) with hit rate underneath. */
export function WeekdayBars({ data, height = 200 }: { data: NavPoint[]; height?: number }) {
  const rows = useMemo(() => weekdayStats(data), [data]);
  return (
    <div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 8, right: 0, left: 0, bottom: 0 }} barCategoryGap="28%">
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" {...axis} />
            <YAxis orientation="right" {...axis} width={58} tickFormatter={(v) => `${Number(v).toFixed(2)}%`} />
            <ReferenceLine y={0} stroke="var(--border-strong)" />
            <Tooltip
              cursor={{ fill: "var(--bg-muted)" }}
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <TipBox>
                    <div className="font-semibold">{payload[0].payload.day}</div>
                    <div>Avg return {payload[0].payload.avg >= 0 ? "+" : ""}{payload[0].payload.avg.toFixed(3)}%</div>
                    <div className="opacity-80">
                      Up days {Math.round(payload[0].payload.hit * 100)}% · {payload[0].payload.n} days
                    </div>
                  </TipBox>
                ) : null
              }
            />
            <Bar dataKey="avg" radius={[4, 4, 4, 4]} isAnimationActive={false} maxBarSize={36}>
              {rows.map((r) => (
                <Cell key={r.day} fill={r.avg >= 0 ? "var(--up)" : "var(--down)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mr-[58px] border-t border-border pt-2">
        <div className="mb-1 text-[11px] font-medium uppercase tracking-[0.1em] text-tertiary">Share of up days</div>
        <div className="grid grid-cols-7 text-center">
          {rows.map((r) => (
            <div key={r.day} className="tnum font-mono text-[12px] font-semibold">
              {Math.round(r.hit * 100)}%
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Gross exposure over time (one series) + average share by instrument (one color). */
export function ExposurePanel({ data, instruments, height = 200 }: { data: Record<string, number | string>[]; instruments: string[]; height?: number }) {
  const { total, share } = useMemo(() => exposureSummary(data, instruments), [data, instruments]);
  const last = total[total.length - 1];
  const peak = Math.max(...total.map((t) => t.gross));
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
          <LegendItem color="var(--chart-nav)" label="Gross exposure" value={`${last.gross.toFixed(0)}% of equity`} />
          <LegendItem color="var(--border-strong)" dashed label="Peak" value={`${peak.toFixed(0)}%`} />
        </div>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={total} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" {...axis} tickFormatter={tickDate} minTickGap={56} />
              <YAxis orientation="right" {...axis} width={58} tickFormatter={(v) => `${v}%`} />
              <ReferenceLine y={peak} stroke="var(--border-strong)" strokeDasharray="4 4" />
              <Tooltip
                cursor={{ stroke: "var(--border-strong)" }}
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <TipBox>
                      <div className="font-semibold">{fmtDate(payload[0].payload.date)}</div>
                      <div>Gross exposure {payload[0].payload.gross}% of equity</div>
                    </TipBox>
                  ) : null
                }
              />
              <Area type="monotone" dataKey="gross" stroke="var(--chart-nav)" strokeWidth={2} fill="var(--chart-nav)" fillOpacity={0.12} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div>
        <div className="mb-3 text-[12px] text-tertiary">Average share of exposure</div>
        <ul className="space-y-3">
          {share.map((s) => (
            <li key={s.instrument}>
              <div className="flex items-baseline justify-between text-[13px]">
                <span className="font-medium">{s.instrument}</span>
                <span className="tnum font-mono text-secondary">
                  {fmtPct(s.pct, { digits: 0 })} <span className="text-tertiary">· {s.avg}%</span>
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-bg-muted">
                <div className="h-full rounded-full bg-[var(--chart-nav)]" style={{ width: `${s.pct * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

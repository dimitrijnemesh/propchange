"use client";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Pills } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { fmtDate, fmtMonth, fmtPct } from "@/lib/format";
import { periodStats } from "@/lib/series-stats";
import { cn } from "@/lib/utils";
import type { NavPoint } from "@/types/domain";

export const axis = { tickLine: false, axisLine: false, fontSize: 11 } as const;

export function TipBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md bg-[#131417] px-3 py-2 text-xs leading-[18px] text-[#EAECEF] shadow-md dark:border dark:border-border dark:bg-bg-muted">
      {children}
    </div>
  );
}

export const tickDate = (d: string) => fmtDate(d, { year: false });

type Period = "1M" | "3M" | "6M" | "1Y" | "All";
const periodDays: Record<Period, number> = { "1M": 30, "3M": 90, "6M": 180, "1Y": 365, All: 100000 };

/** Value pill drawn on the right price axis (e.g. last value), exchange-style. */
export function AxisPill({
  viewBox,
  text,
  fill = "var(--chart-nav)",
}: {
  viewBox?: { x?: number; y?: number; width?: number };
  text: string;
  fill?: string;
}) {
  if (!viewBox) return null;
  const x = (viewBox.x ?? 0) + (viewBox.width ?? 0) + 4;
  const y = viewBox.y ?? 0;
  const w = Math.max(40, text.length * 6.6 + 10);
  return (
    <g>
      <rect x={x} y={y - 9} width={w} height={18} rx={4} fill={fill} />
      <text x={x + w / 2} y={y + 3.5} textAnchor="middle" fontSize={10.5} fontWeight={600} fill="#fff" style={{ fontFamily: "var(--font-jetbrains), monospace" }}>
        {text}
      </text>
    </g>
  );
}

const fmtSigned = (v: number, d = 2) => `${v >= 0 ? "+" : "\u2212"}${Math.abs(v).toFixed(d)}%`;

export function LegendItem({ color, dashed, label, value, tone }: { color: string; dashed?: boolean; label: string; value: string; tone?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span
        className="h-0 w-3.5"
        style={{ borderTop: `2px ${dashed ? "dashed" : "solid"} ${color}` }}
        aria-hidden
      />
      <span className="text-tertiary">{label}</span>
      <span className={cn("tnum font-mono font-semibold", tone === undefined ? "text-text" : tone >= 0 ? "text-up" : "text-down")}>{value}</span>
    </span>
  );
}

/**
 * Exchange-grade performance chart: TradingView-style legend that follows the crosshair,
 * right-side price axis with a last-value pill, and a synced daily-returns pane below.
 */
export function NavChart({ data, height = 300 }: { data: NavPoint[]; height?: number }) {
  const [period, setPeriod] = useState<Period>("1Y");
  const [bench, setBench] = useState(false);
  const [fol, setFol] = useState(true);
  const [hover, setHover] = useState<number | null>(null);
  const rows = useMemo(() => {
    const slice = data.slice(-Math.min(data.length, periodDays[period] + 1));
    const b = slice[0];
    return slice.map((p, i) => ({
      date: p.date,
      nav: (p.nav / b.nav - 1) * 100,
      navAbs: p.nav,
      follower: ((p.follower ?? p.nav) / (b.follower ?? b.nav) - 1) * 100,
      bench: ((p.bench ?? 1) / (b.bench ?? 1) - 1) * 100,
      day: i === 0 ? 0 : (p.nav / slice[i - 1].nav - 1) * 100,
    }));
  }, [data, period]);
  const st = useMemo(() => periodStats(data.slice(-Math.min(data.length, periodDays[period] + 1))), [data, period]);
  const last = rows[rows.length - 1];
  const cur = hover !== null && rows[hover] ? rows[hover] : last;
  const move = (e: { activeTooltipIndex?: number | string | null }) => {
    const i = typeof e?.activeTooltipIndex === "number" ? e.activeTooltipIndex : Number(e?.activeTooltipIndex);
    setHover(Number.isFinite(i) ? i : null);
  };
  const syncId = useMemo(() => `nav-${Math.random().toString(36).slice(2, 8)}`, []);

  return (
    <div>
      <StatStrip
        items={[
          { label: `Return ${period}`, value: fmtPct(st.ret, { sign: true }), tone: st.ret >= 0 ? "up" : "down" },
          { label: "CAGR", value: st.cagr === null ? "—" : fmtPct(st.cagr, { sign: true }) },
          { label: "Sharpe", value: st.sharpe.toFixed(2) },
          { label: "Volatility", value: fmtPct(st.vol) },
          { label: "Max drawdown", value: fmtPct(st.maxDd) },
          { label: "Best / worst day", value: `${fmtPct(st.bestDay, { sign: true })} / ${fmtPct(st.worstDay, { sign: true })}` },
          { label: "Up days", value: fmtPct(st.upDays, { digits: 0 }) },
          { label: "vs BTC", value: fmtPct(st.ret - st.benchRet, { sign: true }), tone: st.ret - st.benchRet >= 0 ? "up" : "down" },
        ]}
      />
      {/* toolbar: live legend (left) + period/series controls (right) */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
          <span className="tnum font-mono text-secondary">{fmtDate(cur.date)}</span>
          <LegendItem color="var(--chart-nav)" label="Strategy" value={fmtSigned(cur.nav)} tone={cur.nav} />
          <LegendItem color="var(--chart-nav)" label="NAV" value={cur.navAbs.toFixed(4)} />
          {fol ? <LegendItem color="var(--chart-follower)" dashed label="Followers" value={fmtSigned(cur.follower)} tone={cur.follower} /> : null}
          {bench ? <LegendItem color="var(--chart-bench)" label="BTC" value={fmtSigned(cur.bench)} tone={cur.bench} /> : null}
          <LegendItem color="transparent" label="Day" value={fmtSigned(cur.day)} tone={cur.day} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFol((v) => !v)}
            aria-pressed={fol}
            className={cn("h-7 rounded-md border px-2 text-[12px] font-semibold transition-colors", fol ? "border-primary/40 bg-primary-soft text-primary-soft-text" : "border-border text-tertiary hover:text-text")}
          >
            Followers
          </button>
          <button
            type="button"
            onClick={() => setBench((v) => !v)}
            aria-pressed={bench}
            className={cn("h-7 rounded-md border px-2 text-[12px] font-semibold transition-colors", bench ? "border-primary/40 bg-primary-soft text-primary-soft-text" : "border-border text-tertiary hover:text-text")}
          >
            BTC
          </button>
          <div className="flex rounded-md bg-bg-subtle p-0.5" role="radiogroup" aria-label="Period">
            {(["1M", "3M", "6M", "1Y", "All"] as Period[]).map((p) => (
              <button
                key={p}
                role="radio"
                aria-checked={period === p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "h-6 rounded-[5px] px-2 font-mono text-[11px] font-semibold transition-colors",
                  period === p ? "bg-surface text-text shadow-sm dark:bg-bg-muted" : "text-tertiary hover:text-text",
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ height }} onMouseLeave={() => setHover(null)}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={rows} syncId={syncId} margin={{ top: 10, right: 0, left: 0, bottom: 0 }} onMouseMove={move}>
            <defs>
              <linearGradient id="navFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-nav)" stopOpacity={0.22} />
                <stop offset="100%" stopColor="var(--chart-nav)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" hide />
            <YAxis orientation="right" {...axis} width={58} tickFormatter={(v) => `${v.toFixed(0)}%`} domain={["auto", "auto"]} />
            <Tooltip cursor={{ stroke: "var(--text-tertiary)", strokeDasharray: "3 3", strokeWidth: 1 }} content={() => null} />
            <ReferenceLine
              y={last.nav}
              stroke="var(--chart-nav)"
              strokeDasharray="2 3"
              strokeOpacity={0.6}
              label={(props: { viewBox?: { x?: number; y?: number; width?: number } }) => <AxisPill viewBox={props.viewBox} text={fmtSigned(last.nav, 1)} />}
            />
            {bench ? <Line type="monotone" dataKey="bench" stroke="var(--chart-bench)" strokeWidth={1.25} dot={false} isAnimationActive={false} /> : null}
            {fol ? (
              <Line type="monotone" dataKey="follower" stroke="var(--chart-follower)" strokeWidth={1.4} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
            ) : null}
            <Area
              type="monotone"
              dataKey="nav"
              stroke="var(--chart-nav)"
              strokeWidth={2}
              fill="url(#navFill)"
              isAnimationActive={false}
              activeDot={{ r: 4, fill: "var(--chart-nav)", stroke: "var(--surface)", strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {/* daily returns pane (synced crosshair) */}
      <div className="mt-1 border-t border-border pt-1" style={{ height: 76 }} onMouseLeave={() => setHover(null)}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} syncId={syncId} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} onMouseMove={move} barCategoryGap={1}>
            <XAxis dataKey="date" {...axis} tickFormatter={tickDate} minTickGap={56} />
            <YAxis orientation="right" {...axis} width={58} tickFormatter={(v) => `${v.toFixed(1)}%`} tickCount={3} />
            <Tooltip cursor={{ fill: "var(--bg-muted)" }} content={() => null} />
            <Bar dataKey="day" isAnimationActive={false}>
              {rows.map((r, i) => (
                <Cell key={i} fill={r.day >= 0 ? "var(--up)" : "var(--down)"} fillOpacity={hover === i ? 1 : 0.55} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-caption text-tertiary">
        Time-weighted return (cash-flow adjusted NAV) · bars = daily return · followers shown after slippage &amp; fees
      </p>
    </div>
  );
}

export function DrawdownChart({ data, limitPct, height = 200 }: { data: NavPoint[]; limitPct?: number; height?: number }) {
  const rows = useMemo(() => {
    const step = Math.max(1, Math.floor(data.length / 365));
    return data.filter((_, i) => i % step === 0).map((p) => ({ date: p.date, dd: -p.dd * 100 }));
  }, [data]);
  const min = Math.min(...rows.map((r) => r.dd), -(limitPct ?? 0));
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="date" {...axis} tickFormatter={tickDate} minTickGap={56} />
          <YAxis orientation="right" {...axis} domain={[Math.floor(min * 1.1), 0]} tickFormatter={(v) => `${v}%`} width={58} />
          <Tooltip
            cursor={{ stroke: "var(--border-strong)" }}
            content={({ active, payload }) =>
              active && payload?.length ? (
                <TipBox>
                  <div className="font-semibold">{fmtDate(payload[0].payload.date)}</div>
                  <div>Drawdown {payload[0].payload.dd.toFixed(2)}%</div>
                </TipBox>
              ) : null
            }
          />
          {limitPct ? (
            <ReferenceLine
              y={-limitPct}
              stroke="var(--warning)"
              strokeDasharray="4 4"
              label={(props: { viewBox?: { x?: number; y?: number; width?: number } }) => (
                <AxisPill viewBox={props.viewBox} text={`−${limitPct}%`} fill="var(--warning)" />
              )}
            />
          ) : null}
          <Area type="monotone" dataKey="dd" stroke="var(--danger)" strokeWidth={1.5} fill="var(--danger)" fillOpacity={0.16} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Daily-return histogram with a fitted normal curve — tails beyond the curve are fat-tail days. */
export function ReturnDistribution({
  data,
  meanPct,
  varPct,
  height = 240,
}: {
  data: { x: number; count: number }[];
  meanPct: number;
  varPct: number;
  height?: number;
}) {
  const rows = useMemo(() => {
    const n = data.reduce((a, d) => a + d.count, 0) || 1;
    const mu = data.reduce((a, d) => a + d.x * d.count, 0) / n;
    const sd = Math.sqrt(data.reduce((a, d) => a + d.count * (d.x - mu) ** 2, 0) / n) || 1;
    const w = data.length > 1 ? Math.abs(data[1].x - data[0].x) : 1;
    return data.map((d) => ({ ...d, normal: Math.round(((n * w) / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(-((d.x - mu) ** 2) / (2 * sd * sd)) * 10) / 10 }));
  }, [data]);
  const snap = (v: number) => data.reduce((a, b) => (Math.abs(b.x - v) < Math.abs(a.x - v) ? b : a)).x;
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
        <LegendItem color="var(--up)" label="Up days" value="" />
        <LegendItem color="var(--down)" label="Down days" value="" />
        <LegendItem color="var(--text-secondary)" dashed label="Normal fit" value="" />
        <LegendItem color="var(--warning)" dashed label="VaR 95%" value={`−${varPct.toFixed(2)}%`} />
      </div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={rows} margin={{ top: 20, right: 0, left: 0, bottom: 0 }} barCategoryGap={2}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="x" {...axis} tickFormatter={(v) => `${v}%`} interval={4} />
            <YAxis orientation="right" {...axis} width={58} />
            <Tooltip
              cursor={{ fill: "var(--bg-muted)" }}
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <TipBox>
                    <div className="font-semibold">{payload[0].payload.x}% daily return</div>
                    <div>{payload[0].payload.count} days</div>
                    <div className="opacity-80">Normal fit {payload[0].payload.normal}</div>
                  </TipBox>
                ) : null
              }
            />
            <Bar dataKey="count" isAnimationActive={false} radius={[3, 3, 0, 0]}>
              {rows.map((d, i) => (
                <Cell key={i} fill={d.x < 0 ? "var(--down)" : "var(--up)"} fillOpacity={0.8} />
              ))}
            </Bar>
            <Line type="monotone" dataKey="normal" stroke="var(--text-secondary)" strokeWidth={1.5} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
            <ReferenceLine x={snap(meanPct)} stroke="var(--chart-nav)" label={{ value: "Mean", position: "top", fill: "var(--text-secondary)", fontSize: 11 }} />
            <ReferenceLine x={snap(-varPct)} stroke="var(--warning)" strokeDasharray="3 3" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function InstrumentBars({ data }: { data: { instrument: string; pnlPct: number }[] }) {
  return (
    <div style={{ height: Math.max(120, data.length * 40 + 20) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, left: 8, bottom: 0 }}>
          <XAxis type="number" hide domain={[0, 100]} />
          <YAxis type="category" dataKey="instrument" {...axis} width={64} />
          <Tooltip cursor={{ fill: "var(--bg-muted)" }} content={({ active, payload }) => (active && payload?.length ? <TipBox>{payload[0].payload.instrument}: {payload[0].payload.pnlPct}% of net PnL</TipBox> : null)} />
          <Bar
            dataKey="pnlPct"
            fill="var(--chart-nav)"
            radius={[0, 4, 4, 0]}
            barSize={18}
            isAnimationActive={false}
            label={{ position: "right", fill: "var(--text-secondary)", fontSize: 12, formatter: (v: unknown) => `${v}%` }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PriceCurveChart({
  data,
  currentOcc,
  currentPrice,
  height = 220,
}: {
  data: { occupancy: number; price: number }[];
  currentOcc: number;
  currentPrice: number;
  height?: number;
}) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 16, right: 16, left: -8, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="occupancy" type="number" domain={[0, 100]} {...axis} tickFormatter={(v) => `${v}%`} ticks={[0, 25, 50, 75, 100]} />
          <YAxis {...axis} width={48} domain={["dataMin - 2", "dataMax + 2"]} tickFormatter={(v) => Number(v).toFixed(0)} />
          <Tooltip
            cursor={{ stroke: "var(--border-strong)" }}
            content={({ active, payload }) =>
              active && payload?.length ? (
                <TipBox>
                  Occupancy {payload[0].payload.occupancy}% → {payload[0].payload.price.toFixed(2)} USDC / 30d
                </TipBox>
              ) : null
            }
          />
          <Line type="monotone" dataKey="price" stroke="var(--chart-nav)" strokeWidth={2} dot={false} isAnimationActive={false} />
          <ReferenceDot x={currentOcc} y={currentPrice} r={5} fill="var(--primary)" stroke="var(--bg)" strokeWidth={2} />
          <ReferenceLine x={currentOcc} stroke="var(--border-strong)" strokeDasharray="3 3" label={{ value: "Now", position: "top", fill: "var(--text-secondary)", fontSize: 11 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FollowerVsTraderChart({ data, height = 260 }: { data: NavPoint[]; height?: number }) {
  const rows = useMemo(() => {
    const slice = data.slice(-181);
    const b = slice[0];
    return slice.map((p) => ({
      date: p.date,
      trader: (p.nav / b.nav - 1) * 100,
      follower: ((p.follower ?? p.nav) / (b.follower ?? b.nav) - 1) * 100,
    }));
  }, [data]);
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="date" {...axis} tickFormatter={tickDate} minTickGap={48} />
          <YAxis {...axis} tickFormatter={(v) => `${v.toFixed(0)}%`} width={48} />
          <Tooltip
            cursor={{ stroke: "var(--border-strong)" }}
            content={({ active, payload }) =>
              active && payload?.length ? (
                <TipBox>
                  <div className="font-semibold">{fmtDate(payload[0].payload.date)}</div>
                  <div>Trader {fmtPct(payload[0].payload.trader / 100, { sign: true })}</div>
                  <div>Median follower {fmtPct(payload[0].payload.follower / 100, { sign: true })}</div>
                </TipBox>
              ) : null
            }
          />
          <Line type="monotone" dataKey="trader" stroke="var(--chart-nav)" strokeWidth={2} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="follower" stroke="var(--chart-follower)" strokeDasharray="5 4" strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EarningsChart({ data, height = 260 }: { data: { month: string; payout: number; refunded: number }[]; height?: number }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -4, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" {...axis} tickFormatter={(m) => fmtMonth(m + "-01")} />
          <YAxis {...axis} width={52} tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} />
          <Tooltip
            cursor={{ fill: "var(--bg-muted)" }}
            content={({ active, payload }) =>
              active && payload?.length ? (
                <TipBox>
                  <div className="font-semibold">{fmtMonth(payload[0].payload.month + "-01")}</div>
                  <div>Released to you {payload[0].payload.payout.toLocaleString("en-US")} USDC</div>
                  <div className="opacity-80">Refunded to followers {payload[0].payload.refunded.toLocaleString("en-US")} USDC</div>
                </TipBox>
              ) : null
            }
          />
          <Bar dataKey="payout" stackId="a" fill="var(--chart-nav)" isAnimationActive={false} />
          <Bar dataKey="refunded" stackId="a" fill="var(--danger)" fillOpacity={0.6} radius={[3, 3, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function StatStrip({
  items,
  className,
}: {
  items: { label: string; value: React.ReactNode; tone?: "up" | "down" }[];
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-4",
        className,
      )}
    >
      {items.map((it) => (
        <div key={it.label} className="bg-bg-subtle px-3 py-2.5">
          <dt className="truncate text-[11px] font-medium text-tertiary">{it.label}</dt>
          <dd
            className={cn(
              "tnum mt-0.5 truncate text-[14px] font-semibold",
              it.tone === "up" && "text-up",
              it.tone === "down" && "text-down",
            )}
          >
            {it.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

const CAPITALS = [1_000, 10_000, 100_000];

/** Equity in dollars from a starting capital, with high-water mark and drawdown periods shaded. */
export function EquityCurveChart({ data, height = 280 }: { data: NavPoint[]; height?: number }) {
  const [capital, setCapital] = useState(10_000);
  const [period, setPeriod] = useState<Period>("All");
  const { rows, stats } = useMemo(() => {
    const slice = data.slice(-Math.min(data.length, periodDays[period] + 1));
    const b = slice[0].nav;
    let hwm = 0;
    let maxDdUsd = 0;
    const rows = slice.map((p) => {
      const eq = (capital * p.nav) / b;
      hwm = Math.max(hwm, eq);
      maxDdUsd = Math.max(maxDdUsd, hwm - eq);
      return { date: p.date, equity: Math.round(eq * 100) / 100, hwm: Math.round(hwm * 100) / 100, under: [eq, hwm] as [number, number] };
    });
    const final = rows[rows.length - 1].equity;
    return { rows, stats: { final, net: final - capital, peak: hwm, maxDdUsd, newHighs: rows.filter((r, i) => i > 0 && r.equity >= r.hwm).length } };
  }, [data, capital, period]);
  const usd = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Pills
          size="sm"
          ariaLabel="Starting capital"
          options={CAPITALS.map((c) => ({ value: c, label: `$${c >= 1000 ? c / 1000 + "k" : c}` }))}
          value={capital}
          onChange={setCapital}
        />
        <Pills
          size="sm"
          ariaLabel="Period"
          options={(["3M", "6M", "1Y", "All"] as Period[]).map((p) => ({ value: p, label: p }))}
          value={period}
          onChange={setPeriod}
        />
      </div>
      <StatStrip
        items={[
          { label: "Final equity", value: usd(stats.final) },
          { label: "Net profit", value: `${stats.net >= 0 ? "+" : "\u2212"}${usd(Math.abs(stats.net))}`, tone: stats.net >= 0 ? "up" : "down" },
          { label: "Peak equity", value: usd(stats.peak) },
          { label: "Max drawdown ($)", value: `\u2212${usd(stats.maxDdUsd)}`, tone: "down" },
        ]}
      />
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={rows} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="eqFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-nav)" stopOpacity={0.18} />
                <stop offset="100%" stopColor="var(--chart-nav)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" {...axis} tickFormatter={tickDate} minTickGap={56} />
            <YAxis orientation="right" {...axis} width={62} domain={["auto", "auto"]} tickFormatter={(v) => (v >= 1000 ? `$${(v / 1000).toFixed(v >= 100000 ? 0 : 1)}k` : `$${v}`)} />
            <Tooltip
              cursor={{ stroke: "var(--border-strong)" }}
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <TipBox>
                    <div className="font-semibold">{fmtDate(payload[0].payload.date)}</div>
                    <div>Equity {usd(payload[0].payload.equity)}</div>
                    <div className="opacity-80">High-water mark {usd(payload[0].payload.hwm)}</div>
                    {payload[0].payload.hwm > payload[0].payload.equity ? (
                      <div className="opacity-80">Below peak {usd(payload[0].payload.hwm - payload[0].payload.equity)}</div>
                    ) : null}
                  </TipBox>
                ) : null
              }
            />
            <ReferenceLine
              y={stats.final}
              stroke="var(--chart-nav)"
              strokeDasharray="2 3"
              strokeOpacity={0.6}
              label={(props: { viewBox?: { x?: number; y?: number; width?: number } }) => (
                <AxisPill viewBox={props.viewBox} text={stats.final >= 1000 ? `$${(stats.final / 1000).toFixed(stats.final >= 100000 ? 0 : 2)}k` : `$${Math.round(stats.final)}`} />
              )}
            />
            <Area type="monotone" dataKey="under" stroke="none" fill="var(--down)" fillOpacity={0.12} isAnimationActive={false} />
            <Area type="monotone" dataKey="equity" stroke="var(--chart-nav)" strokeWidth={2} fill="url(#eqFill)" isAnimationActive={false} />
            <Line type="stepAfter" dataKey="hwm" stroke="var(--chart-follower)" strokeWidth={1.25} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-caption text-secondary">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-[var(--chart-nav)]" /> Equity
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0 w-4 border-t-2 border-dashed border-[var(--chart-follower)]" /> High-water mark
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-[3px] bg-down/30" /> Below peak
        </span>
      </div>
    </div>
  );
}


"use client";
import { AlertTriangle, Dices, Info, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Pills } from "@/components/ui/tabs";
import { InfoTip } from "@/components/ui/tooltip";
import { fmtPct } from "@/lib/format";
import { runMonteCarlo } from "@/lib/monte-carlo";
import { dailyReturns } from "@/lib/series-stats";
import { cn } from "@/lib/utils";
import type { NavPoint } from "@/types/domain";

const axis = { tickLine: false, axisLine: false, fontSize: 11 } as const;
const PRESETS = {
  conservative: { maxLoss: 10, dailyLoss: 3, sizeScale: 0.5 },
  balanced: { maxLoss: 20, dailyLoss: 5, sizeScale: 1 },
  aggressive: { maxLoss: 35, dailyLoss: 8, sizeScale: 1.5 },
};
type Profile = keyof typeof PRESETS | "custom";

const usd = (v: number) => `${v < 0 ? "−" : ""}$${Math.round(Math.abs(v)).toLocaleString("en-US")}`;
const pct = (v: number) => fmtPct(v, { sign: true });

function TipBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md bg-[#131417] px-3 py-2 text-xs leading-[18px] text-[#EAECEF] shadow-md dark:border dark:border-border dark:bg-bg-muted">
      {children}
    </div>
  );
}

function Result({
  label,
  value,
  sub,
  compare,
  info,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  compare?: React.ReactNode;
  info: string;
  tone?: "up" | "down" | "warning";
}) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center gap-1.5 text-caption text-secondary">
        <span className="truncate">{label}</span>
        <InfoTip content={info} label={`About ${label}`} />
      </div>
      <div className={cn("tnum mt-1 text-[18px] font-bold leading-6 md:text-[22px] md:leading-7", tone === "up" && "text-up", tone === "down" && "text-down", tone === "warning" && "text-warning")}>
        {value}
      </div>
      {sub ? <div className="tnum text-caption text-tertiary">{sub}</div> : null}
      {compare ? <div className="tnum mt-2 border-t border-border pt-2 text-caption text-secondary">{compare}</div> : null}
    </div>
  );
}

export function MonteCarlo({
  nav,
  seatAllocation,
  defaultCostBps,
  contractMaxDd,
  strategyName,
}: {
  nav: NavPoint[];
  seatAllocation: number;
  defaultCostBps: number;
  contractMaxDd: number;
  strategyName: string;
}) {
  const returns = useMemo(() => dailyReturns(nav), [nav]);
  const [profile, setProfile] = useState<Profile>("balanced");
  const [seats, setSeats] = useState(1);
  const [horizon, setHorizon] = useState(180);
  const [paths, setPaths] = useState(1000);
  const [maxLoss, setMaxLoss] = useState(PRESETS.balanced.maxLoss);
  const [dailyLoss, setDailyLoss] = useState(PRESETS.balanced.dailyLoss);
  const [sizeScale, setSizeScale] = useState(PRESETS.balanced.sizeScale);
  const [costBps, setCostBps] = useState(Math.max(0.1, defaultCostBps));
  const [seed, setSeed] = useState(42);
  const [showPaths, setShowPaths] = useState(true);
  const [showRaw, setShowRaw] = useState(true);
  const capital = seats * seatAllocation;

  const params = useDeferredValue({ capital, horizonDays: horizon, paths, maxLoss: maxLoss / 100, dailyLoss: dailyLoss / 100, sizeScale, costBps, seed });
  const res = useMemo(() => runMonteCarlo(returns, params), [returns, params]);
  const s = res.stats;
  const stale = params.seed !== seed || params.maxLoss !== maxLoss / 100 || params.dailyLoss !== dailyLoss / 100 || params.sizeScale !== sizeScale || params.horizonDays !== horizon || params.paths !== paths || params.costBps !== costBps;

  const fan = useMemo(
    () => res.fan.map((r) => ({ ...r, band90: [r.p5, r.p95] as [number, number], band50: [r.p25, r.p75] as [number, number] })),
    [res.fan],
  );

  const custom = (fn: (v: number) => void) => (v: number) => {
    fn(v);
    setProfile("custom");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-h2 flex items-center gap-2">
            <Dices className="size-6 text-primary-text" strokeWidth={1.75} /> Monte Carlo simulator
          </h2>
          <p className="mt-1 max-w-[680px] text-secondary">
            {paths.toLocaleString("en-US")} possible futures for your Seat in {strategyName}, built by resampling the strategy&apos;s real
            daily returns in 5-day blocks — then run through <b className="text-text">your Risk Engine</b>. Each path is also run
            without protection on the same draws, so you see exactly what your limits change.
          </p>
        </div>
        <Button variant="outline" onClick={() => setSeed((x) => (x * 9301 + 49297) % 233280)}>
          <Dices /> Re-run
        </Button>
      </div>

      {/* Controls */}
      <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Label>Your risk profile</Label>
            <Pills
              ariaLabel="Risk profile"
              value={profile}
              onChange={(p) => {
                setProfile(p);
                if (p !== "custom") {
                  setMaxLoss(PRESETS[p].maxLoss);
                  setDailyLoss(PRESETS[p].dailyLoss);
                  setSizeScale(PRESETS[p].sizeScale);
                }
              }}
              options={[
                { value: "conservative", label: "Conservative" },
                { value: "balanced", label: "Balanced (yours)" },
                { value: "aggressive", label: "Aggressive" },
                { value: "custom", label: "Custom" },
              ]}
            />
          </div>
          <Link href="/app/risk" className="text-[13px] font-semibold text-primary-text hover:underline">
            Edit my Risk Engine settings →
          </Link>
        </div>
        <div className="mt-6 grid gap-x-10 gap-y-6 md:grid-cols-2">
          <div>
            <Label>Max loss on allocation (stop copying)</Label>
            <Slider label="Max loss" value={maxLoss} onChange={custom(setMaxLoss)} min={5} max={60} format={(v) => `−${v}%`} />
          </div>
          <div>
            <Label>Daily loss limit</Label>
            <Slider label="Daily loss limit" value={dailyLoss} onChange={custom(setDailyLoss)} min={1} max={20} format={(v) => `−${v}%`} />
          </div>
          <div>
            <Label>Position size vs trader</Label>
            <Slider label="Size scale" value={sizeScale} onChange={custom(setSizeScale)} min={0.25} max={2} step={0.25} format={(v) => `${v}×`} />
          </div>
          <div>
            <Label>Execution cost per day</Label>
            <Slider label="Execution cost" value={costBps} onChange={setCostBps} min={0} max={10} step={0.1} format={(v) => `${v.toFixed(1)} bps`} />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-4">
          <div>
            <Label>Seats · allocation</Label>
            <Pills ariaLabel="Seats" value={seats} onChange={setSeats} options={[1, 2, 3, 5].map((n) => ({ value: n, label: `${n} · ${usd(n * seatAllocation)}` }))} />
          </div>
          <div>
            <Label>Horizon</Label>
            <Pills ariaLabel="Horizon" value={horizon} onChange={setHorizon} options={[30, 90, 180, 365].map((d) => ({ value: d, label: d === 365 ? "1 year" : `${d} days` }))} />
          </div>
          <div>
            <Label>Simulations</Label>
            <Pills ariaLabel="Simulations" value={paths} onChange={setPaths} options={[500, 1000, 2000].map((n) => ({ value: n, label: n.toLocaleString("en-US") }))} />
          </div>
        </div>
      </section>

      {/* Results */}
      <div className={cn("space-y-6 transition-opacity", stale && "opacity-60")} aria-busy={stale}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-5">
          <Result
            label="Median outcome"
            value={usd(capital * s.median)}
            sub={`${pct(s.median)} after ${horizon} days`}
            compare={<>No Risk Engine: {pct(s.raw.median)}</>}
            tone={s.median >= 0 ? "up" : "down"}
            info="Half of the simulated futures end above this, half below."
          />
          <Result
            label="Worst 5% (VaR)"
            value={usd(capital * s.p5)}
            sub={`${pct(s.p5)} · avg of worst 5% ${pct(s.cvar5)}`}
            compare={<>No Risk Engine: {pct(s.raw.p5)}</>}
            tone="down"
            info="5th percentile outcome — 1 in 20 futures is worse than this. CVaR is the average of that worst 5%."
          />
          <Result
            label="Chance of profit"
            value={fmtPct(s.probProfit, { digits: 0 })}
            sub={`${fmtPct(s.probLoss10, { digits: 0 })} chance of losing >10%`}
            compare={<>No Risk Engine: {fmtPct(s.raw.probProfit, { digits: 0 })}</>}
            info="Share of simulated futures that end above your starting allocation."
          />
          <Result
            label="Risk Engine stop"
            value={fmtPct(s.probStop, { digits: 0 })}
            sub={s.medianStopDay ? `median trigger on day ${s.medianStopDay}` : "never triggered"}
            compare={<>Daily limit hit on {fmtPct(s.cappedDayShare, { digits: 1 })} of days</>}
            tone={s.probStop > 0.5 ? "warning" : undefined}
            info="Share of futures where the max-loss stop triggers and copying stops (the loss is locked in at that level)."
          />
          <Result
            label="Max drawdown p95"
            value={fmtPct(-s.dd95)}
            sub={`median ${fmtPct(-s.ddMedian)} · contract limit ${contractMaxDd}%`}
            compare={<>No Risk Engine: {fmtPct(-s.raw.dd95)}</>}
            tone="down"
            info="In 95% of futures, the deepest peak-to-trough fall on your allocation stays above this."
          />
        </div>

        <Insights s={s} maxLoss={maxLoss} dailyLoss={dailyLoss} sizeScale={sizeScale} />

        <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-h3">Simulated equity paths</h3>
              <p className="text-secondary">Return on your {usd(capital)} allocation · shaded bands = 5–95% and 25–75% of futures</p>
            </div>
            <div className="flex flex-wrap gap-4 text-caption text-secondary">
              <label className="flex items-center gap-2">
                <Switch checked={showPaths} onCheckedChange={setShowPaths} label="Show sample paths" /> Sample paths
              </label>
              <label className="flex items-center gap-2">
                <Switch checked={showRaw} onCheckedChange={setShowRaw} label="Compare without Risk Engine" /> Without Risk Engine
              </label>
            </div>
          </div>
          <div style={{ height: 340 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={fan} margin={{ top: 8, right: 8, left: -4, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" type="number" domain={[0, horizon]} {...axis} tickFormatter={(v) => `d${v}`} />
                <YAxis {...axis} width={52} tickFormatter={(v) => `${Math.round(v)}%`} />
                <Tooltip
                  cursor={{ stroke: "var(--border-strong)" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const r = payload[0].payload as Record<string, number>;
                    return (
                      <TipBox>
                        <div className="font-semibold">Day {r.day}</div>
                        <div>95th pct {fmtPct(r.p95 / 100, { sign: true })} · {usd((capital * r.p95) / 100)}</div>
                        <div>Median {fmtPct(r.p50 / 100, { sign: true })} · {usd((capital * r.p50) / 100)}</div>
                        <div>5th pct {fmtPct(r.p5 / 100, { sign: true })} · {usd((capital * r.p5) / 100)}</div>
                        {showRaw ? <div className="opacity-80">No Risk Engine median {fmtPct(r.raw50 / 100, { sign: true })}, 5th {fmtPct(r.raw5 / 100, { sign: true })}</div> : null}
                      </TipBox>
                    );
                  }}
                />
                <ReferenceLine y={0} stroke="var(--border-strong)" />
                <ReferenceLine y={-maxLoss} stroke="var(--warning)" strokeDasharray="4 4" label={{ value: `Stop −${maxLoss}%`, position: "insideBottomLeft", fill: "var(--warning)", fontSize: 11 }} />
                <Area dataKey="band90" stroke="none" fill="var(--chart-nav)" fillOpacity={0.12} isAnimationActive={false} />
                <Area dataKey="band50" stroke="none" fill="var(--chart-nav)" fillOpacity={0.2} isAnimationActive={false} />
                {showPaths
                  ? Array.from({ length: 8 }, (_, i) => (
                      <Line key={i} dataKey={`s${i}`} stroke="var(--chart-follower)" strokeWidth={1} strokeOpacity={0.55} dot={false} isAnimationActive={false} />
                    ))
                  : null}
                {showRaw ? (
                  <>
                    <Line dataKey="raw50" stroke="var(--chart-bench)" strokeWidth={1.5} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
                    <Line dataKey="raw5" stroke="var(--down)" strokeWidth={1.25} strokeDasharray="2 3" dot={false} isAnimationActive={false} />
                  </>
                ) : null}
                <Line dataKey="p50" stroke="var(--chart-nav)" strokeWidth={2.5} dot={false} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-caption text-secondary">
            <Legend swatch={<span className="h-0.5 w-4 bg-[var(--chart-nav)]" />} label="Median (with Risk Engine)" />
            <Legend swatch={<span className="h-2.5 w-4 rounded-[3px] bg-[var(--chart-nav)] opacity-30" />} label="25–75% / 5–95% of futures" />
            {showPaths ? <Legend swatch={<span className="h-0.5 w-4 bg-[var(--chart-follower)]" />} label="Sample paths" /> : null}
            {showRaw ? (
              <>
                <Legend swatch={<span className="h-0 w-4 border-t-2 border-dashed border-[var(--chart-bench)]" />} label="No Risk Engine: median" />
                <Legend swatch={<span className="h-0 w-4 border-t-2 border-dotted border-down" />} label="No Risk Engine: 5th pct" />
              </>
            ) : null}
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="min-w-0 rounded-lg border border-border bg-surface p-5 shadow-sm">
            <h3 className="text-h3">Distribution of final returns</h3>
            <p className="mb-4 text-secondary">Number of futures ending in each return range</p>
            <div style={{ height: 230 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={res.hist} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barCategoryGap={1} barGap={0}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="x" {...axis} tickFormatter={(v) => `${Math.round(v)}%`} interval={3} />
                  <YAxis {...axis} width={40} />
                  <Tooltip
                    cursor={{ fill: "var(--bg-muted)" }}
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <TipBox>
                          ≈ {fmtPct(payload[0].payload.x / 100, { sign: true })} · with Risk Engine {payload[0].payload.re} · without {payload[0].payload.raw}
                        </TipBox>
                      ) : null
                    }
                  />
                  {showRaw ? <Bar dataKey="raw" fill="var(--chart-bench)" fillOpacity={0.45} isAnimationActive={false} /> : null}
                  <Bar dataKey="re" fill="var(--chart-nav)" fillOpacity={0.85} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
          <section className="min-w-0 rounded-lg border border-border bg-surface p-5 shadow-sm">
            <h3 className="text-h3">Distribution of max drawdown</h3>
            <p className="mb-4 text-secondary">Deepest fall on your allocation within each future</p>
            <div style={{ height: 230 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={res.ddHist} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barCategoryGap={4} barGap={1}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="x" {...axis} interval={1} />
                  <YAxis {...axis} width={40} />
                  <Tooltip
                    cursor={{ fill: "var(--bg-muted)" }}
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <TipBox>
                          Drawdown {payload[0].payload.x} · with Risk Engine {payload[0].payload.re} · without {payload[0].payload.raw}
                        </TipBox>
                      ) : null
                    }
                  />
                  <Bar dataKey="re" fill="var(--chart-nav)" fillOpacity={0.85} radius={[2, 2, 0, 0]} isAnimationActive={false} />
                  {showRaw ? <Bar dataKey="raw" fill="var(--chart-bench)" fillOpacity={0.45} radius={[2, 2, 0, 0]} isAnimationActive={false} /> : null}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        <p className="flex gap-2 text-caption text-tertiary">
          <Info className="mt-px size-3.5 shrink-0" />
          Simulation, not a forecast. Resamples {returns.length} days of this strategy&apos;s history in 5-day blocks; models the daily stop
          firing intraday with slippage past the limit, and the max-loss stop locking the allocation once breached. Past behavior may not
          repeat; correlations, regime changes and venue outages are not captured. Seed {seed}.
        </p>
      </div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {swatch}
      {label}
    </span>
  );
}

function Insights({
  s,
  maxLoss,
  dailyLoss,
  sizeScale,
}: {
  s: ReturnType<typeof runMonteCarlo>["stats"];
  maxLoss: number;
  dailyLoss: number;
  sizeScale: number;
}) {
  const items: { tone: "warning" | "primary"; text: React.ReactNode }[] = [];
  if (s.probStop > 0.5)
    items.push({
      tone: "warning",
      text: (
        <>
          <b>Your limits are tight for this strategy&apos;s volatility.</b> The stop triggers in {fmtPct(s.probStop, { digits: 0 })} of futures and
          locks in −{maxLoss}%. Try a smaller position size (now {sizeScale}×) or a wider daily limit (now −{dailyLoss}%).
        </>
      ),
    });
  if (s.cappedDayShare > 0.05 && s.probStop <= 0.5)
    items.push({
      tone: "warning",
      text: (
        <>
          The daily limit fires on {fmtPct(s.cappedDayShare, { digits: 0 })} of days — frequent stop-outs cost you recoveries. Consider a smaller size scale.
        </>
      ),
    });
  if (s.raw.dd95 - s.dd95 > 0.05)
    items.push({
      tone: "primary",
      text: (
        <>
          <b>Your Risk Engine cuts the bad tail:</b> 95th-percentile drawdown {fmtPct(-s.dd95)} vs {fmtPct(-s.raw.dd95)} unprotected
          {s.raw.worst < -0.5 ? <> — and the worst unprotected future loses {fmtPct(-Math.abs(s.raw.worst))}</> : null}.
        </>
      ),
    });
  if (s.p5 < s.raw.p5 - 0.01 && s.probStop < 0.5)
    items.push({
      tone: "primary",
      text: (
        <>
          Trade-off: in some futures the stop locks a loss the strategy later recovered from (5th pct {pct(s.p5)} vs {pct(s.raw.p5)} unprotected).
        </>
      ),
    });
  if (!items.length) return null;
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <p
          key={i}
          className={cn(
            "flex gap-2.5 rounded-md border px-4 py-3 text-[13px]",
            it.tone === "warning" ? "border-warning/30 bg-warning-soft text-warning" : "border-primary/20 bg-primary-soft text-primary-soft-text",
          )}
        >
          {it.tone === "warning" ? <AlertTriangle className="mt-0.5 size-4 shrink-0" /> : <ShieldCheck className="mt-0.5 size-4 shrink-0" />}
          <span>{it.text}</span>
        </p>
      ))}
    </div>
  );
}

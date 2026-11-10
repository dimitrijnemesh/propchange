"use client";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Pills } from "@/components/ui/tabs";
import { InfoTip } from "@/components/ui/tooltip";
import { fmtDateTime, fmtPct } from "@/lib/format";
import type { TradeStats } from "@/lib/trade-stats";
import { cn } from "@/lib/utils";

const axis = { tickLine: false, axisLine: false, fontSize: 11 } as const;
const R = (x: number, d = 2) => `${x > 0 ? "+" : x < 0 ? "−" : ""}${Math.abs(x).toFixed(d)}R`;
const hrs = (h: number) => (h < 24 ? `${h.toFixed(1)}h` : `${(h / 24).toFixed(1)}d`);

function TipBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md bg-[#131417] px-3 py-2 text-xs leading-[18px] text-[#EAECEF] shadow-md dark:border dark:border-border dark:bg-bg-muted">
      {children}
    </div>
  );
}

function sqnLabel(sqn: number): { label: string; variant: "success" | "primary" | "warning" | "danger" } {
  if (sqn >= 3) return { label: "Excellent", variant: "success" };
  if (sqn >= 2) return { label: "Good", variant: "primary" };
  if (sqn >= 1.6) return { label: "Average", variant: "warning" };
  return { label: "Poor", variant: "danger" };
}

function Kpi({
  label,
  value,
  sub,
  info,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  info: string;
  tone?: "up" | "down" | "warning";
}) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center gap-1.5 text-caption text-secondary">
        <span className="truncate">{label}</span>
        <InfoTip content={info} label={`About ${label}`} />
      </div>
      <div
        className={cn(
          "tnum mt-1 text-[18px] font-bold leading-6 md:text-[22px] md:leading-7",
          tone === "up" && "text-up",
          tone === "down" && "text-down",
          tone === "warning" && "text-warning",
        )}
      >
        {value}
      </div>
      {sub ? <div className="mt-0.5 text-caption text-tertiary">{sub}</div> : null}
    </div>
  );
}

function ChartCard({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0 rounded-lg border border-border bg-surface p-5 shadow-sm">
      <h3 className="text-h3">{title}</h3>
      {desc ? <p className="mb-4 mt-0.5 text-secondary">{desc}</p> : <div className="mb-4" />}
      {children}
    </section>
  );
}

export function TradeAnalytics({ t, flags }: { t: TradeStats; flags: string[] }) {
  const [timeView, setTimeView] = useState<"weekday" | "hour">("weekday");
  const sqn = sqnLabel(t.sqn);
  const riskSpike = t.maxRiskPct > t.avgRiskPct * 2;
  const timeData = timeView === "weekday" ? t.byWeekday : t.byHour;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-h2">Trade analytics</h2>
          <p className="text-secondary">
            Last <b className="tnum text-text">{t.sample}</b> closed trades · risk measured at the initial stop
          </p>
        </div>
        {flags.length ? <Badge variant="warning">{flags.length} risk flag{flags.length > 1 ? "s" : ""}</Badge> : null}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi
          label="Avg risk / trade"
          value={fmtPct(t.avgRiskPct / 100, { digits: 2 })}
          sub={`median ${fmtPct(t.medianRiskPct / 100, { digits: 2 })} · max ${fmtPct(t.maxRiskPct / 100, { digits: 2 })}`}
          tone={riskSpike ? "warning" : undefined}
          info="Equity at risk between entry and the initial stop. A max far above the average signals size escalation (e.g. martingale)."
        />
        <Kpi
          label="Avg planned R:R"
          value={`1 : ${t.avgPlannedRR.toFixed(2)}`}
          sub="target distance ÷ stop distance"
          info="Reward-to-risk planned at entry: distance to target divided by distance to stop."
        />
        <Kpi
          label="Realized R:R"
          value={`1 : ${t.realizedRR.toFixed(2)}`}
          sub={`avg win ${R(t.avgWinR)} · avg loss ${R(-t.avgLossR)}`}
          info="Average winning R divided by average losing R — the payoff actually achieved."
        />
        <Kpi
          label="Expectancy"
          value={R(t.expectancyR)}
          sub="per trade"
          tone={t.expectancyR >= 0 ? "up" : "down"}
          info="Average R per trade: win rate × avg win − loss rate × avg loss. Above 0 means a positive edge."
        />
        <Kpi
          label="SQN"
          value={t.sqn.toFixed(2)}
          sub={<Badge variant={sqn.variant}>{sqn.label}</Badge>}
          info="System Quality Number (Van Tharp): √N × mean(R) ÷ stdev(R), N capped at 100. 2–3 good, 3+ excellent."
        />
        <Kpi
          label="Kelly fraction"
          value={fmtPct(Math.max(0, t.kelly), { digits: 1 })}
          sub="optimal f · use ¼–½ in practice"
          info="Kelly = W − (1 − W) ÷ R:R. The theoretically growth-optimal fraction of equity to risk per trade."
        />
        <Kpi
          label="Win rate"
          value={fmtPct(t.winRate, { digits: 1 })}
          sub={`profit factor ${t.profitFactorR.toFixed(2)}`}
          info="Share of trades closed with a positive R. Profit factor here = gross winning R ÷ gross losing R."
        />
        <Kpi
          label="Consecutive W / L"
          value={`${t.maxConsecWins} / ${t.maxConsecLosses}`}
          sub="longest streaks"
          info="Longest run of winning and losing trades in the sample — useful for sizing your drawdown tolerance."
        />
        <Kpi label="Largest win / loss" value={`${R(t.largestWinR, 1)} / ${R(t.largestLossR, 1)}`} info="Best and worst single trade in R. A loss far beyond −1R means stops were skipped or slipped." />
        <Kpi
          label="Avg hold"
          value={`${hrs(t.avgHoldWin)} / ${hrs(t.avgHoldLoss)}`}
          sub="winners / losers"
          info="Average holding time of winners vs losers. Holding losers much longer than winners is a discipline red flag."
        />
        <Kpi
          label="Avg MAE / MFE"
          value={`${t.avgMaeR.toFixed(2)}R / ${t.avgMfeR.toFixed(2)}R`}
          sub="adverse / favorable excursion"
          info="Maximum adverse excursion (how far trades went against you) and maximum favorable excursion, in R."
        />
        <Kpi
          label="Capture ratio"
          value={fmtPct(t.captureRatio, { digits: 0 })}
          sub="of MFE kept by winners"
          info="Realized R of winning trades ÷ their MFE. How much of the available move the exits capture."
        />
      </div>

      {riskSpike ? (
        <p className="rounded-md border border-warning/30 bg-warning-soft px-4 py-3 text-[13px] text-warning">
          <b>Risk escalation detected:</b> max risk per trade ({fmtPct(t.maxRiskPct / 100, { digits: 2 })}) is{" "}
          {(t.maxRiskPct / t.avgRiskPct).toFixed(1)}× the average. Size increases after losses are a martingale signature.
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="R-multiple distribution" desc="How many trades ended at each multiple of initial risk">
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={t.rBins} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barCategoryGap={2}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="r" {...axis} interval={1} tickFormatter={(v) => `${v}R`} />
                <YAxis {...axis} width={40} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "var(--bg-muted)" }}
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <TipBox>
                        {payload[0].payload.lo}R to {payload[0].payload.lo + 0.5}R · {payload[0].payload.count} trades
                      </TipBox>
                    ) : null
                  }
                />
                <ReferenceLine x="+0" stroke="var(--border-strong)" />
                <Bar dataKey="count" isAnimationActive={false} radius={[3, 3, 0, 0]}>
                  {t.rBins.map((b, i) => (
                    <Cell key={i} fill={b.lo < 0 ? "var(--down)" : "var(--up)"} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Cumulative R" desc={`Trade-by-trade equity in R units · total ${R(t.totalR, 1)}`}>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={t.cumR} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="n" {...axis} minTickGap={40} tickFormatter={(v) => `#${v}`} />
                <YAxis {...axis} width={44} tickFormatter={(v) => `${v}R`} />
                <Tooltip
                  cursor={{ stroke: "var(--border-strong)" }}
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <TipBox>
                        <div className="font-semibold">Trade #{payload[0].payload.n}</div>
                        <div>This trade {R(payload[0].payload.r)}</div>
                        <div className="opacity-80">Cumulative {R(payload[0].payload.cumR, 1)}</div>
                      </TipBox>
                    ) : null
                  }
                />
                <ReferenceLine y={0} stroke="var(--border-strong)" />
                <Line type="monotone" dataKey="cumR" stroke="var(--chart-nav)" strokeWidth={2} dot={false} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Risk per trade" desc="% of equity at risk on each trade, with the average line">
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={t.riskSeries} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="n" type="number" domain={[1, t.sample]} {...axis} tickFormatter={(v) => `#${v}`} />
                <YAxis {...axis} width={44} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  cursor={{ stroke: "var(--border-strong)" }}
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <TipBox>
                        Trade #{payload[0].payload.n} · risk {payload[0].payload.risk.toFixed(2)}%
                      </TipBox>
                    ) : null
                  }
                />
                <ReferenceLine y={t.avgRiskPct} stroke="var(--warning)" strokeDasharray="4 4" label={{ value: "avg", position: "insideTopRight", fill: "var(--warning)", fontSize: 11 }} />
                <Scatter dataKey="risk" fill="var(--chart-nav)" fillOpacity={0.55} isAnimationActive={false} shape={(p: { cx?: number; cy?: number }) => <circle cx={p.cx} cy={p.cy} r={2.2} fill="var(--chart-nav)" fillOpacity={0.6} />} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Performance by time" desc="Total R by day of week or close hour (UTC)">
          <Pills
            size="sm"
            ariaLabel="Group by"
            className="-mt-2 mb-3"
            value={timeView}
            onChange={setTimeView}
            options={[
              { value: "weekday", label: "Weekday" },
              { value: "hour", label: "Hour" },
            ]}
          />
          <div style={{ height: 186 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" {...axis} interval={timeView === "hour" ? 2 : 0} />
                <YAxis {...axis} width={44} tickFormatter={(v) => `${v}R`} />
                <Tooltip
                  cursor={{ fill: "var(--bg-muted)" }}
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <TipBox>
                        {payload[0].payload.label}
                        {timeView === "hour" ? ":00 UTC" : ""} · {R(payload[0].payload.totalR, 1)} over {payload[0].payload.trades} trades
                      </TipBox>
                    ) : null
                  }
                />
                <ReferenceLine y={0} stroke="var(--border-strong)" />
                <Bar dataKey="totalR" isAnimationActive={false} radius={[3, 3, 3, 3]}>
                  {timeData.map((d, i) => (
                    <Cell key={i} fill={d.totalR >= 0 ? "var(--up)" : "var(--down)"} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <ChartCard title="Long vs short">
          <table className="w-full text-sm">
            <thead className="text-caption text-secondary">
              <tr>
                <th className="pb-2 text-left font-medium" />
                <th className="pb-2 text-right font-medium">Long</th>
                <th className="pb-2 text-right font-medium">Short</th>
              </tr>
            </thead>
            <tbody className="tnum divide-y divide-border">
              {(
                [
                  ["Trades", (s: TradeStats["long"]) => String(s.trades)],
                  ["Win rate", (s: TradeStats["long"]) => fmtPct(s.winRate, { digits: 0 })],
                  ["Expectancy", (s: TradeStats["long"]) => R(s.expectancyR)],
                  ["Total R", (s: TradeStats["long"]) => R(s.totalR, 1)],
                  ["Equity PnL", (s: TradeStats["long"]) => fmtPct(s.pnlPct / 100, { sign: true })],
                ] as const
              ).map(([l, f]) => (
                <tr key={l}>
                  <td className="py-2.5 text-secondary">{l}</td>
                  <td className="py-2.5 text-right font-semibold">{f(t.long)}</td>
                  <td className="py-2.5 text-right font-semibold">{f(t.short)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartCard>
        <ChartCard title="Recent trades">
          <div className="scroll-thin -mx-5 overflow-x-auto px-5">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="text-caption text-secondary">
                <tr>
                  <th className="pb-2 text-left font-medium">Closed</th>
                  <th className="pb-2 text-left font-medium">Instrument</th>
                  <th className="pb-2 text-right font-medium">Risk</th>
                  <th className="pb-2 text-right font-medium">Plan R:R</th>
                  <th className="pb-2 text-right font-medium">Result</th>
                  <th className="pb-2 text-right font-medium">Hold</th>
                </tr>
              </thead>
              <tbody className="tnum divide-y divide-border">
                {t.recent.map((tr) => (
                  <tr key={tr.id}>
                    <td className="whitespace-nowrap py-2 text-secondary">{fmtDateTime(tr.close).replace(" UTC", "")}</td>
                    <td className="py-2">
                      <span className="font-semibold">{tr.instrument}</span>{" "}
                      <span className={cn("text-caption", tr.side === "long" ? "text-up" : "text-down")}>{tr.side}</span>
                    </td>
                    <td className="py-2 text-right">{tr.riskPct.toFixed(2)}%</td>
                    <td className="py-2 text-right">1:{tr.plannedRR.toFixed(1)}</td>
                    <td className={cn("py-2 text-right font-semibold", tr.r >= 0 ? "text-up" : "text-down")}>{R(tr.r)}</td>
                    <td className="py-2 text-right text-secondary">{hrs(tr.holdHours)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

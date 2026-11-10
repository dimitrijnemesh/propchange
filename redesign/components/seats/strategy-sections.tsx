/** Strategy analytics tabs shown under the Seat trading screen (moved from the old Strategy page). */
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, CheckCircle2, Clock, Info, ShieldCheck } from "lucide-react";
import { CapacityPanel } from "@/components/analytics/capacity-panel";
import { DailyCalendar } from "@/components/analytics/daily-calendar";
import { MonteCarlo } from "@/components/analytics/monte-carlo";
import { TradeAnalytics } from "@/components/analytics/trade-analytics";
import {
  DrawdownChart,
  EquityCurveChart,
  FollowerVsTraderChart,
  InstrumentBars,
  NavChart,
  PriceCurveChart,
  ReturnDistribution,
} from "@/components/analytics/charts";
import { BenchmarkScatter, ExposurePanel, RollingBetaChart, RollingPanes, WeekdayBars } from "@/components/analytics/pro-charts";
import { MonthlyHeatmap } from "@/components/analytics/monthly-heatmap";
import { Avatar, Delta, MetricTile, Money, Pct, SectionTitle } from "@/components/common";
import { EpochTimeline, OutcomeBadge } from "@/components/contract/epoch-timeline";
import { RiskContractCard } from "@/components/contract/risk-contract";
import { PageHeader } from "@/components/layout/page-header";
import { ComplianceBadge, MarketBadges, RiskFlagChip, RiskScoreBadge, StateBadge, VerificationBadge } from "@/components/market/badges";
import { SeatMeter } from "@/components/market/seat-meter";
import { StrategyActions } from "@/components/market/strategy-actions";
import { SeatPanel } from "@/components/seat/buy-seat";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { LinkTabs } from "@/components/ui/tabs";
import { InfoTip } from "@/components/ui/tooltip";
import { getAccounts, getAllStrategySlugs, getStrategy, getStrategyCharts, priceFrom } from "@/lib/mock-api";
import { fmtDate, fmtMoney, fmtNumber, fmtPct } from "@/lib/format";
import { benchmarkStats, drawdownPeriods, tailStats, trailingReturns } from "@/lib/pro-stats";
import { cn } from "@/lib/utils";
import type { Strategy } from "@/types/domain";

export const STRATEGY_TABS = [
  { key: "overview", label: "Overview" },
  { key: "analytics", label: "Analytics" },
  { key: "simulate", label: "Simulator" },
  { key: "contract", label: "Seat Contract" },
  { key: "capacity", label: "Capacity & Seats" },
  { key: "followers", label: "Followers' results" },
  { key: "epochs", label: "Epochs" },
];

export type Charts = NonNullable<Awaited<ReturnType<typeof getStrategyCharts>>>;

export function Overview({ s, charts, mddLimit, withPerformance = true }: { s: Strategy; charts: Charts; mddLimit: number; withPerformance?: boolean }) {
  return (
    <>
      {withPerformance ? (
        <Card>
          <CardHeader title="Performance" description="Strategy NAV vs. realized follower results" />
          <CardBody>
            <NavChart data={charts.nav} />
          </CardBody>
        </Card>
      ) : null}
      <Card>
        <CardHeader title="Equity curve" description="Growth of a starting balance, with high-water mark and time below peak" />
        <CardBody>
          <EquityCurveChart data={charts.nav} />
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Drawdown" description="Underwater curve with the current contract's max drawdown limit" />
        <CardBody>
          <DrawdownChart data={charts.nav} limitPct={mddLimit} />
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Daily P&L" description="Every trading day's result — browse month by month" />
        <CardBody>
          <DailyCalendar data={charts.nav} />
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Monthly returns" />
        <CardBody>
          <MonthlyHeatmap data={charts.monthly} />
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="About this strategy" />
        <CardBody className="space-y-4">
          <p className="text-secondary">{s.description}</p>
          <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Fact label="Style" value={s.style} />
            <Fact label="Instruments" value={s.instruments.join(", ")} />
            <Fact label="Avg holding time" value={s.metrics.avgHoldHours < 24 ? `${s.metrics.avgHoldHours} h` : `${(s.metrics.avgHoldHours / 24).toFixed(1)} days`} />
            <Fact label="Live since" value={fmtDate(s.createdAt)} />
          </dl>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Risk flags" description="Behavior detection on the full trade history" />
        <CardBody>
          {s.flags.length ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {s.flags.map((f) => (
                  <RiskFlagChip key={f} flag={f} />
                ))}
              </div>
              <p className="text-caption text-tertiary">Flags feed the Risk Score, the Seat Contract (prohibited patterns) and ranking.</p>
            </div>
          ) : (
            <p className="flex items-center gap-2 font-medium text-success">
              <CheckCircle2 className="size-5" /> No risk flags detected
            </p>
          )}
        </CardBody>
      </Card>
    </>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-caption text-tertiary">{label}</dt>
      <dd className="mt-0.5 font-semibold">{value}</dd>
    </div>
  );
}

function MetricTable({ title, rows }: { title: string; rows: [string, React.ReactNode, string][] }) {
  return (
    <Card>
      <div className="px-5 pb-1 pt-4">
        <h3 className="text-h3">{title}</h3>
      </div>
      <dl className="divide-y divide-border px-5 pb-2">
        {rows.map(([l, v, info]) => (
          <div key={l} className="flex items-center justify-between gap-4 py-2.5">
            <dt className="flex items-center gap-1.5 text-secondary">
              {l} <InfoTip content={info} label={`About ${l}`} />
            </dt>
            <dd className="tnum font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

function TrailingReturns({ rows }: { rows: ReturnType<typeof trailingReturns> }) {
  const line = (label: string, key: "strat" | "follower" | "btc" | "excess", strong?: boolean) => (
    <tr className="border-t border-border">
      <th scope="row" className={cn("sticky left-0 bg-surface py-2.5 pl-5 pr-4 text-left font-medium", strong ? "text-text" : "text-secondary")}>
        {label}
      </th>
      {rows.map((r) => (
        <td key={r.label} className={cn("tnum px-3 py-2.5 text-right", strong && "font-semibold")}>
          <Delta value={r[key]} />
        </td>
      ))}
    </tr>
  );
  return (
    <Card>
      <CardHeader title="Trailing returns" description="Strategy NAV, realized follower results after costs, and BTC over the same windows" />
      <div className="scroll-thin overflow-x-auto pb-2">
        <table className="w-full min-w-[620px] text-sm">
          <thead>
            <tr className="text-[12px] text-tertiary">
              <th className="sticky left-0 bg-surface py-2 pl-5 pr-4 text-left font-medium">Period</th>
              {rows.map((r) => (
                <th key={r.label} className="px-3 py-2 text-right font-mono font-medium">
                  {r.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {line("Strategy", "strat", true)}
            {line("Followers", "follower")}
            {line("BTC", "btc")}
            {line("Excess vs BTC", "excess")}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function DrawdownTable({ rows }: { rows: ReturnType<typeof drawdownPeriods> }) {
  if (!rows.length) return <p className="px-5 pb-5 text-secondary">No drawdowns in the analysed period.</p>;
  return (
    <div className="scroll-thin overflow-x-auto pb-2">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="text-[12px] text-tertiary">
          <tr>
            <th className="py-2 pl-5 text-left font-medium">#</th>
            <th className="px-3 py-2 text-right font-medium">Depth</th>
            <th className="px-3 py-2 text-left font-medium">Peak</th>
            <th className="px-3 py-2 text-left font-medium">Trough</th>
            <th className="px-3 py-2 text-left font-medium">Recovered</th>
            <th className="px-3 py-2 text-right font-medium">Decline</th>
            <th className="py-2 pl-3 pr-5 text-right font-medium">Recovery</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.start} className="border-t border-border">
              <td className="tnum py-2.5 pl-5 font-mono text-[12px] text-tertiary">{i + 1}</td>
              <td className="px-3 py-2.5 text-right">
                <div className="ml-auto flex w-[120px] items-center justify-end gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-muted">
                    <div className="ml-auto h-full rounded-full bg-[var(--down)]" style={{ width: `${Math.min(100, (r.depth / rows[0].depth) * 100)}%` }} />
                  </div>
                  <span className="tnum w-14 font-semibold text-down">−{(r.depth * 100).toFixed(1)}%</span>
                </div>
              </td>
              <td className="tnum whitespace-nowrap px-3 py-2.5 text-secondary">{fmtDate(r.start)}</td>
              <td className="tnum whitespace-nowrap px-3 py-2.5 text-secondary">{fmtDate(r.trough)}</td>
              <td className="tnum whitespace-nowrap px-3 py-2.5">{r.end ? <span className="text-secondary">{fmtDate(r.end)}</span> : <Badge variant="warning">Ongoing</Badge>}</td>
              <td className="tnum px-3 py-2.5 text-right">{r.decline} d</td>
              <td className="tnum py-2.5 pl-3 pr-5 text-right">{r.recovery === null ? "—" : `${r.recovery} d`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Analytics({ s, charts }: { s: Strategy; charts: Charts }) {
  const m = s.metrics;
  const thin = m.psr < 0.9 || m.trades < 50 || m.historyDays < 60;
  const meanDaily = (Math.pow(1 + m.returnAll, 1 / m.historyDays) - 1) * 100;
  const bench = benchmarkStats(charts.nav);
  const tail = tailStats(charts.nav);
  const trailing = trailingReturns(charts.nav);
  const ddPeriods = drawdownPeriods(charts.nav, 5);
  return (
    <>
      <TradeAnalytics t={charts.trades} flags={s.flags} />
      <h2 className="text-h2 pt-4">Performance statistics</h2>
      <div className="flex flex-wrap items-center gap-2 rounded-md bg-bg-subtle px-4 py-3 text-[13px] text-secondary">
        <Info className="size-4 text-primary-text" />
        Based on <b className="tnum text-text">{m.trades.toLocaleString("en-US")}</b> trades over <b className="tnum text-text">{m.historyDays}</b> days.
        Metric set v1.4 · recomputable from raw exchange data.
        {thin ? <Badge variant="warning">Thin sample — treat with caution</Badge> : null}
      </div>
      <TrailingReturns rows={trailing} />
      <div className="grid gap-4 md:grid-cols-2">
        <MetricTable
          title="Returns"
          rows={[
            ["Return 1m", <Delta key="a" value={m.return1m} />, "Time-weighted return over the last 30 days."],
            ["Return 3m", <Delta key="b" value={m.return3m} />, "Time-weighted return over the last 90 days."],
            ["Return 12m", m.historyDays < 365 ? <span key="c" className="text-tertiary">Insufficient data</span> : <Delta key="c" value={m.return12m} />, "Time-weighted return over the last 365 days. Shown only with ≥ 365 days of history."],
            ["Return since start", <Delta key="d" value={m.returnAll} />, "NAV_T − 1 since the strategy was connected."],
            ["CAGR", <Delta key="e" value={m.cagr} />, "Annualized return: NAV_T^(365/T) − 1."],
          ]}
        />
        <MetricTable
          title="Risk"
          rows={[
            ["Max drawdown", fmtPct(m.maxDrawdown), "Largest decline from a NAV peak: max(1 − NAV_t / peak)."],
            ["Volatility (ann.)", fmtPct(m.volatility), "Standard deviation of daily returns × √365."],
            ["Downside deviation", fmtPct(m.downsideDev), "Volatility of negative daily returns only (MAR 0)."],
            ["Ulcer index", fmtPct(m.ulcer, { digits: 2 }), "Root-mean-square of drawdowns — depth and duration of pain."],
            ["VaR / CVaR 95% (daily)", `${fmtPct(m.var95, { digits: 2 })} / ${fmtPct(m.cvar95, { digits: 2 })}`, "Historical: loss exceeded on 5% of days / average loss on those days."],
            ["VaR / CVaR 99% (daily)", `${fmtPct(tail.var99, { digits: 2 })} / ${fmtPct(tail.cvar99, { digits: 2 })}`, "Historical: loss exceeded on 1% of days / average loss on those days."],
            ["Longest time under water", `${tail.maxUnderwaterDays} days`, "Most consecutive days spent below a previous NAV peak."],
            ["Max / avg leverage", `${m.maxLeverage}x / ${m.avgLeverage}x`, "Gross exposure ÷ equity, sampled."],
            ["Top-3 trades share of PnL", fmtPct(m.top3PnlShare, { digits: 0 }), "Concentration: share of net PnL from the three best trades."],
          ]}
        />
        <MetricTable
          title="Risk-adjusted"
          rows={[
            ["Sharpe", m.sharpe.toFixed(2), "Mean daily excess return ÷ std of daily returns × √365."],
            ["Sortino", m.sortino.toFixed(2), "Mean daily return ÷ downside deviation × √365."],
            ["Calmar", m.calmar.toFixed(2), "Annualized return ÷ max drawdown."],
            ["Recovery factor", m.recoveryFactor.toFixed(2), "Net profit ÷ max drawdown."],
            ["Probabilistic Sharpe (PSR)", m.psr.toFixed(2), "Probability that the true Sharpe is above 0, adjusting for sample size, skew and kurtosis. Below 0.9 = possibly luck."],
            ["Omega ratio", tail.omega.toFixed(2), "Sum of daily gains ÷ sum of daily losses (threshold 0). Above 1 = more upside than downside."],
            ["Gain-to-pain", tail.gainToPain.toFixed(2), "Net daily returns ÷ sum of losing days. Above 1 is strong."],
          ]}
        />
        <MetricTable
          title="Trades"
          rows={[
            ["Trades", m.trades.toLocaleString("en-US"), "Closed trades in the analysed period."],
            ["Win rate", fmtPct(m.winRate, { digits: 0 }), "Winning trades ÷ closed trades."],
            ["Payoff ratio", m.payoffRatio.toFixed(2), "Average win ÷ |average loss|."],
            ["Profit factor", m.profitFactor.toFixed(2), "Gross profit ÷ |gross loss|."],
            ["Expectancy", `${m.expectancyBps} bps`, "Average PnL per trade in basis points of notional — the 'edge' used by the Capacity model."],
            ["Tail ratio", m.tailRatio.toFixed(1), "Largest loss ÷ average win. High values hide tail risk."],
            ["Avg holding time", m.avgHoldHours < 24 ? `${m.avgHoldHours} h` : `${(m.avgHoldHours / 24).toFixed(1)} d`, "Mean time a position stays open."],
          ]}
        />
        <MetricTable
          title="Consistency"
          rows={[
            ["Profitable months", fmtPct(m.profitableMonthsPct, { digits: 0 }), "Share of calendar months with a positive return."],
            ["Equity curve R²", m.equityR2.toFixed(2), "Fit of ln(NAV) to a straight line — 1.0 is perfectly steady growth."],
            ["Longest losing streak", `${m.longestLosingStreak} days`, "Consecutive days with negative returns."],
            ["Skew / kurtosis", `${m.skew.toFixed(2)} / ${m.kurtosis.toFixed(1)}`, "Shape of the daily return distribution."],
            ["Consistency score", `${m.consistencyScore}/100`, "R², profitable months, rolling-Sharpe stability and PSR combined."],
          ]}
        />
        <MetricTable
          title="Benchmark (vs BTC)"
          rows={[
            ["Beta", bench.beta.toFixed(2), "Sensitivity to BTC: slope of daily strategy returns on daily BTC returns. 0 = market-neutral."],
            ["Alpha (ann.)", <Delta key="al" value={bench.alpha} />, "Annualized return not explained by BTC exposure (regression intercept × 365)."],
            ["Correlation / R²", `${bench.corr.toFixed(2)} / ${bench.r2.toFixed(2)}`, "How closely daily returns move with BTC, and the share of variance BTC explains."],
            ["Up / down capture", `${fmtPct(bench.upCapture, { digits: 0 })} / ${fmtPct(bench.downCapture, { digits: 0 })}`, "Average return on BTC up days and down days, relative to BTC. Low down-capture = protection in sell-offs."],
            ["Tracking error", fmtPct(bench.trackingError), "Annualized volatility of the daily return difference vs BTC."],
            ["Information ratio", bench.infoRatio.toFixed(2), "Annualized excess return over BTC ÷ tracking error."],
          ]}
        />
      </div>
      <Card>
        <CardHeader title="Strategy vs BTC" description="Daily return pairs with the regression fit (slope = beta), and how beta and correlation change over time" />
        <CardBody className="grid gap-8 lg:grid-cols-2">
          <BenchmarkScatter data={charts.nav} beta={bench.beta} intercept={bench.intercept} />
          <div>
            <div className="mb-2 text-[13px] font-semibold">Rolling 90-day beta & correlation</div>
            <RollingBetaChart data={charts.nav} />
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Rolling risk-adjusted performance" description="90-day rolling Sharpe ratio and annualized volatility, synced" />
        <CardBody>
          <RollingPanes data={charts.nav} />
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Return distribution" description="Daily returns vs a fitted normal curve — bars beyond the curve are fat-tail days" />
        <CardBody>
          <ReturnDistribution data={charts.histogram} meanPct={meanDaily} varPct={m.var95 * 100} />
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Worst drawdowns" description="The five deepest peak-to-trough episodes and how long recovery took" />
        <DrawdownTable rows={ddPeriods} />
      </Card>
      <Card>
        <CardHeader title="Day-of-week profile" description="Average daily return and share of up days by weekday" />
        <CardBody>
          <WeekdayBars data={charts.nav} />
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Exposure" description="Gross exposure, % of equity (last 120 days), and where it sits" />
        <CardBody>
          <ExposurePanel data={charts.exposure} instruments={s.instruments} />
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Performance by instrument" description="Share of net PnL" />
        <CardBody>
          <InstrumentBars data={s.instrumentPnl} />
        </CardBody>
      </Card>
    </>
  );
}

export function ContractTab({ s }: { s: Strategy }) {
  const breaches = s.epochs.filter((e) => e.outcome === "breach_hard" || e.outcome === "breach_soft");
  const tightened = s.contract.rules.filter((r) => r.tightened).length;
  return (
    <>
      <RiskContractCard contract={s.contract} />
      <p className="flex gap-2 text-[13px] text-secondary">
        <ShieldCheck className="size-4 shrink-0 text-primary-text" />
        Rules are evaluated on the trader&apos;s strategy account. The contract is frozen for the Epoch and its hash is stored on-chain at Epoch start. You pay for disciplined risk, not guaranteed returns.
      </p>
      <Card>
        <CardHeader
          title="How these rules were generated"
          description="Each limit is derived from the strategy's own history plus a buffer. The trader may tighten, never loosen."
          action={tightened ? <Badge variant="primary">Trader tightened {tightened} rules</Badge> : null}
        />
        <CardBody className="px-0 pb-2">
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-bg-subtle text-caption text-secondary">
                <tr>
                  <th className="px-5 py-2.5 text-left font-medium">Rule</th>
                  <th className="px-5 py-2.5 text-right font-medium">Historical value</th>
                  <th className="px-5 py-2.5 text-right font-medium">Buffer</th>
                  <th className="px-5 py-2.5 text-right font-medium">Limit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {s.contract.rules.map((r) => (
                  <tr key={r.key}>
                    <td className="px-5 py-3 font-medium">{r.label}</td>
                    <td className="tnum px-5 py-3 text-right text-secondary">{r.historicalValue}</td>
                    <td className="tnum px-5 py-3 text-right text-secondary">{r.buffer}</td>
                    <td className="tnum px-5 py-3 text-right font-semibold">
                      {r.limit}
                      {r.tightened ? <span className="ml-1.5 text-caption text-primary-text">tightened</span> : null}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="px-5 py-3 font-medium">Prohibited patterns</td>
                  <td className="px-5 py-3 text-right text-secondary">Martingale / averaging-down flags</td>
                  <td className="px-5 py-3 text-right text-secondary">—</td>
                  <td className="px-5 py-3 text-right font-semibold">Above threshold = breach</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Epoch history" description="Last 12 Epochs — hover a segment for details" />
        <CardBody>
          <EpochTimeline epochs={s.epochs} />
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Breach history" />
        <CardBody>
          {breaches.length ? (
            <ul className="divide-y divide-border">
              {breaches.map((e) => (
                <li key={e.index} className="flex flex-wrap items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div>
                    <div className="flex items-center gap-2 font-semibold">
                      Epoch {e.index} <OutcomeBadge outcome={e.outcome} />
                    </div>
                    <p className="mt-0.5 text-secondary">{e.breachReason}</p>
                  </div>
                  <div className="text-right text-caption text-tertiary">
                    {fmtDate(e.start, { year: false })} – {fmtDate(e.end)}
                    <div className="tnum mt-0.5 font-semibold text-text">Refunded {fmtMoney(e.refundUsdc ?? 0, { currency: "USDC", digits: 0 })}</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="flex items-center gap-2 font-medium text-success">
              <CheckCircle2 className="size-5" /> No breaches — every Epoch kept
            </p>
          )}
        </CardBody>
      </Card>
    </>
  );
}

export function CapacityTab({ s, charts }: { s: Strategy; charts: Charts }) {
  const occ = s.seatsTaken / s.seatsTotal;
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <CapacityPanel s={s} />
        <Card>
          <CardHeader title="Seats" />
          <CardBody className="space-y-4">
            <SeatMeter size="lg" taken={s.seatsTaken} total={s.seatsTotal} waitlist={s.waitlist} />
            <dl className="grid grid-cols-2 gap-4">
              <Fact label="Free seats" value={<span className="tnum">{s.seatsTotal - s.seatsTaken}</span>} />
              <Fact label="Waitlist" value={<span className="tnum">{s.waitlist}</span>} />
              <Fact label="Price now (30d)" value={<span className="tnum">{fmtNumber(priceFrom(s))} USDC</span>} />
              <Fact label="Trader bond" value={<Money value={s.bondUsdc} currency="USDC" digits={0} />} />
            </dl>
            {s.waitlist ? (
              <p className="flex items-center gap-2 rounded-md bg-bg-subtle p-3 text-[13px] text-secondary">
                <Clock className="size-4" /> Waitlist is first-in, first-out. When a Seat frees up, the next follower gets 24h to buy it.
              </p>
            ) : null}
          </CardBody>
        </Card>
      </div>
      <Card>
        <CardHeader title="Price curve" description="30-day Seat price vs. occupancy: base × (1 + 0.5 × occupancy²)" />
        <CardBody>
          <PriceCurveChart data={charts.priceCurve} currentOcc={Math.round(occ * 1000) / 10} currentPrice={Math.round(priceFrom(s) * 100) / 100} />
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Seat allocation history" description="Capacity decreases never remove Seats — they scale every Seat's allocation equally." />
        <CardBody>
          {s.allocationHistory.length ? (
            <ul className="divide-y divide-border">
              {s.allocationHistory.map((h) => (
                <li key={h.date} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div>
                    <div className="tnum font-semibold">
                      {fmtMoney(h.from, { digits: 0 })} → {fmtMoney(h.to, { digits: 0 })}
                    </div>
                    <p className="text-secondary">{h.reason}</p>
                  </div>
                  <span className="text-caption text-tertiary">{fmtDate(h.date)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-secondary">No changes yet.</p>
          )}
        </CardBody>
      </Card>
    </>
  );
}

export function FollowersTab({ s, charts }: { s: Strategy; charts: Charts }) {
  const traderRet = s.metrics.return3m;
  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        <MetricTile label="Avg follower slippage" value={<span className="tnum">{s.followerSlippageBps.toFixed(1)} bps</span>} sub={`vs ${s.metrics.expectancyBps} bps edge per trade`} info="Average difference between follower fills and the trader's fill, per trade." />
        <MetricTile label="Slippage / edge" value={<Pct value={s.followerSlippageBps / Math.max(1, s.metrics.expectancyBps)} digits={0} />} sub="Capacity target ≤ 33%" info="If this exceeds one third for two Epochs, Capacity is reduced." />
        <MetricTile label="Active followers" value={<span className="tnum">{s.seatsTaken}</span>} sub="Anonymous" className="col-span-2 md:col-span-1" />
      </div>
      <Card>
        <CardHeader title="Trader vs. median follower" description="Last 6 months — difference reflects slippage, fees and latency" />
        <CardBody>
          <FollowerVsTraderChart data={charts.nav} />
          <div className="mt-3 flex gap-4 text-caption text-secondary">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-4 bg-[var(--chart-nav)]" /> Trader
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0 w-4 border-t-2 border-dashed border-[var(--chart-follower)]" /> Median follower
            </span>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Follower outcome distribution" description={`Realized return on allocation, last 3 months (trader: ${fmtPct(traderRet, { sign: true })})`} />
        <CardBody className="px-0 pb-2">
          <table className="w-full text-sm">
            <thead className="bg-bg-subtle text-caption text-secondary">
              <tr>
                <th className="px-5 py-2.5 text-left font-medium">Return range</th>
                <th className="px-5 py-2.5 text-right font-medium">Followers</th>
                <th className="w-1/2 px-5 py-2.5 text-left font-medium">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {charts.followerOutcomes.map((b) => (
                <tr key={b.range}>
                  <td className="tnum px-5 py-3">{b.range}</td>
                  <td className="tnum px-5 py-3 text-right font-semibold">{b.count}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg-muted">
                        <div className={cn("h-full rounded-full", b.range.startsWith("<") || b.range.startsWith("−") ? "bg-down" : "bg-up")} style={{ width: `${b.share * 100}%` }} />
                      </div>
                      <span className="tnum w-10 text-right text-caption text-secondary">{Math.round(b.share * 100)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </>
  );
}

export function EpochsTab({ s }: { s: Strategy }) {
  const list = [...s.epochs].reverse();
  return (
    <Card className="overflow-hidden">
      <div className="scroll-thin overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="bg-bg-subtle text-caption text-secondary">
            <tr>
              <th className="px-5 py-2.5 text-left font-medium">Epoch</th>
              <th className="px-5 py-2.5 text-left font-medium">Dates</th>
              <th className="px-5 py-2.5 text-right font-medium">Return</th>
              <th className="px-5 py-2.5 text-left font-medium">Outcome</th>
              <th className="px-5 py-2.5 text-right font-medium">Paid to trader</th>
              <th className="px-5 py-2.5 text-right font-medium">Refunded</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {list.map((e) => (
              <tr key={e.index} className="h-12 hover:bg-bg-muted">
                <td className="tnum px-5 font-semibold">#{e.index}</td>
                <td className="whitespace-nowrap px-5 text-secondary">
                  {fmtDate(e.start, { year: false })} – {fmtDate(e.end)}
                </td>
                <td className="px-5 text-right font-semibold">{e.returnPct !== undefined ? <Delta value={e.returnPct} /> : "—"}</td>
                <td className="px-5">
                  <OutcomeBadge outcome={e.outcome} />
                </td>
                <td className="tnum px-5 text-right">{e.payoutUsdc !== undefined ? fmtMoney(e.payoutUsdc, { currency: "USDC", digits: 0 }) : "—"}</td>
                <td className="tnum px-5 text-right">{e.refundUsdc ? fmtMoney(e.refundUsdc, { currency: "USDC", digits: 0 }) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

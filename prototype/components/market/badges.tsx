import { AlertTriangle, BadgeCheck, CircleDot, PauseCircle, ShieldCheck, Sparkles, Users, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { riskLevel } from "@/lib/domain";
import { cn } from "@/lib/utils";
import type { Market, Strategy, StrategyState, Trader } from "@/types/domain";

export function ComplianceBadge({
  strategy,
  short,
  className,
}: {
  strategy: Pick<Strategy, "compliance" | "state">;
  short?: boolean;
  className?: string;
}) {
  const { kept, settled } = strategy.compliance;
  if (strategy.state === "rookie")
    return (
      <Tooltip content={`Rookie stage: ${kept}/${settled} contracts kept. Promoted after 3 consecutive kept Epochs.`}>
        <Badge variant="primary" className={className}>
          <Sparkles strokeWidth={1.75} /> Rookie{short ? "" : ` · ${kept}/${settled} kept`}
        </Badge>
      </Tooltip>
    );
  const ratio = settled ? kept / settled : 0;
  const variant = ratio >= 0.9 ? "success" : ratio >= 0.7 ? "warning" : "danger";
  return (
    <Tooltip
      content={`Compliance Score: the trader kept the Seat Contract in ${kept} of ${settled} settled Epochs (${Math.round(ratio * 100)}%).`}
    >
      <Badge variant={variant} className={cn("tnum", className)}>
        <ShieldCheck strokeWidth={1.75} />
        {kept}/{settled}
        {short ? "" : " contracts kept"}
      </Badge>
    </Tooltip>
  );
}

const stateMap: Record<StrategyState, { label: string; variant: "success" | "primary" | "warning" | "neutral" | "solid"; icon: React.ElementType }> = {
  active: { label: "Active", variant: "success", icon: CircleDot },
  rookie: { label: "Rookie", variant: "primary", icon: Sparkles },
  full: { label: "Full", variant: "solid", icon: Users },
  paused: { label: "Paused", variant: "warning", icon: PauseCircle },
  closed: { label: "Closed", variant: "neutral", icon: XCircle },
};

export function StateBadge({ state }: { state: StrategyState }) {
  const s = stateMap[state];
  const I = s.icon;
  return (
    <Badge variant={s.variant}>
      <I strokeWidth={1.75} />
      {s.label}
    </Badge>
  );
}

const marketLabel: Record<Market, string> = { crypto: "Crypto", forex: "Forex", stocks: "Stocks", futures: "Futures" };

export function MarketBadges({ markets, venue }: { markets: Market[]; venue?: string }) {
  return (
    <>
      {markets.map((m) => (
        <Badge key={m} variant="outline">
          {marketLabel[m]}
        </Badge>
      ))}
      {venue ? <Badge variant="neutral">{venue}</Badge> : null}
    </>
  );
}

export function RiskScoreBadge({ score, withLabel = true }: { score: number; withLabel?: boolean }) {
  const lvl = riskLevel(score);
  const variant = lvl === "low" ? "success" : lvl === "medium" ? "warning" : "danger";
  const label = lvl === "low" ? "Low" : lvl === "medium" ? "Medium" : "High";
  return (
    <Tooltip content="Risk Score 0–100 (higher = riskier): max drawdown, Ulcer index, CVaR, leverage and risk flags.">
      <Badge variant={variant} className="tnum">
        {score}
        {withLabel ? ` · ${label}` : ""}
      </Badge>
    </Tooltip>
  );
}

export const flagInfo: Record<string, string> = {
  "Martingale pattern": "Position size after a loss is significantly larger than after a win.",
  "Averaging down": "Adds to positions while they are in unrealized loss.",
  "Hidden tail risk": "Win rate ≥ 85% or very high tail ratio: many small wins, rare large losses.",
  Concentration: "More than 50% of PnL comes from the top 3 trades, or exposure is concentrated in one instrument.",
  "Thin sample": "PSR < 0.9, fewer than 50 trades or fewer than 60 days — results may be luck.",
  "Leverage spike": "Exposure exceeded 1.5× its 95th percentile.",
  "No stop discipline": "Adverse excursions are large relative to typical realized loss.",
  "Style drift": "Instruments, holding time or size distribution shifted materially.",
};

export function RiskFlagChip({ flag }: { flag: string }) {
  return (
    <Tooltip content={flagInfo[flag] ?? flag}>
      <Badge variant="warning" className="cursor-help">
        <AlertTriangle strokeWidth={1.75} />
        {flag}
      </Badge>
    </Tooltip>
  );
}

export function VerificationBadge({ trader }: { trader: Pick<Trader, "verification"> }) {
  const map = {
    connected: { label: "Connected", variant: "neutral" as const, tip: "API access connected; history import may be partial." },
    verified: { label: "Verified", variant: "primary" as const, tip: "Full history sourced directly from the exchange/broker API with continuous sync." },
    verified_plus: { label: "Verified+", variant: "primary" as const, tip: "Verified + KYC + Trader Bond + kept Epochs." },
  }[trader.verification];
  return (
    <Tooltip content={map.tip}>
      <Badge variant={map.variant}>
        <BadgeCheck strokeWidth={1.75} />
        {map.label}
      </Badge>
    </Tooltip>
  );
}

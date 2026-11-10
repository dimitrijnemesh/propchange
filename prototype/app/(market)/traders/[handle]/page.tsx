import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Archive, CalendarDays, IdCard } from "lucide-react";
import { Avatar, Delta, MetricTile } from "@/components/common";
import { EpochTimeline } from "@/components/contract/epoch-timeline";
import { PageHeader } from "@/components/layout/page-header";
import { ComplianceBadge, VerificationBadge } from "@/components/market/badges";
import { FollowButton } from "@/components/market/follow-button";
import { StrategyCard } from "@/components/market/strategy-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { getTrader, getTraders } from "@/lib/mock-api";
import { fmtDate, fmtPct } from "@/lib/format";

export async function generateStaticParams() {
  return (await getTraders()).map((t) => ({ handle: t.handle }));
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const d = await getTrader(handle);
  if (!d) return { title: "Trader not found" };
  return { title: `${d.trader.name} (${d.trader.handle})`, description: d.trader.bio };
}

const flag = (cc?: string) =>
  cc ? String.fromCodePoint(...[...cc.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)) : "";

export default async function TraderPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const d = await getTrader(handle);
  if (!d) notFound();
  const { trader: t, active, closed } = d;
  const all = [...active, ...closed];
  const kept = all.reduce((a, s) => a + s.compliance.kept, 0);
  const settled = all.reduce((a, s) => a + s.compliance.settled, 0);
  const ret = (s: (typeof all)[number]) => (s.metrics.historyDays < 365 ? s.metrics.returnAll : s.metrics.return12m);
  const sorted = [...all].sort((a, b) => ret(b) - ret(a));
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  return (
    <div className="container-market">
      <PageHeader crumbs={[{ label: "Strategies", href: "/strategies" }, { label: "Traders" }, { label: t.handle }]} title="" className="pb-0" />
      <Card>
        <CardBody className="flex flex-col gap-6 md:flex-row md:items-start">
          <Avatar name={t.handle} size={80} className="text-[28px]" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h1 className="text-h1">{t.name}</h1>
              <span className="text-[20px]" aria-label={`Country ${t.country}`}>
                {flag(t.country)}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-secondary">
              <span className="font-semibold text-text">@{t.handle}</span>
              <VerificationBadge trader={t} />
              {t.kyc ? (
                <Badge variant="success">
                  <IdCard strokeWidth={1.75} /> KYC
                </Badge>
              ) : null}
              <span className="inline-flex items-center gap-1.5 text-caption">
                <CalendarDays className="size-3.5" /> Joined {fmtDate(t.joinedAt)}
              </span>
            </div>
            <p className="mt-3 max-w-[720px] text-secondary">{t.bio}</p>
          </div>
          <FollowButton />
        </CardBody>
      </Card>

      <div className="mt-6 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <MetricTile label="Strategies" value={<span className="tnum">{active.length}</span>} sub={`${closed.length} closed · all stay public`} />
        <MetricTile
          label="Overall compliance"
          value={<span className="tnum">{kept}/{settled}</span>}
          sub={`${fmtPct(kept / settled, { digits: 0 })} of all Epochs, all strategies`}
          info="Includes closed and failed strategies — so traders can't hide losers."
        />
        <MetricTile label="Seats filled" value={<span className="tnum">{active.reduce((a, s) => a + s.seatsTaken, 0)}</span>} sub="Across active strategies" />
        <MetricTile
          label="Best / worst"
          value={
            <span className="text-metric-lg flex flex-col">
              <Delta value={ret(best)} />
              <Delta value={ret(worst)} />
            </span>
          }
          sub={`${best.name} / ${worst.name}`}
        />
      </div>

      <section className="mt-10">
        <h2 className="text-h2 mb-4">Strategies</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((s) => (
            <StrategyCard key={s.id} s={s} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-h2 flex items-center gap-2">
          <Archive className="size-5 text-tertiary" strokeWidth={1.75} /> Closed &amp; failed strategies
        </h2>
        <p className="mb-4 mt-1 text-secondary">Always visible. Trader-level statistics include every strategy ever published.</p>
        {closed.length ? (
          <div className="overflow-hidden rounded-lg border border-border bg-bg-subtle">
            {closed.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-border px-5 py-4 text-secondary last:border-b-0">
                <div className="min-w-[200px] flex-1">
                  <Link href={`/strategies/${s.slug}`} className="font-semibold text-text hover:text-primary-text">
                    {s.name}
                  </Link>
                  <p className="text-caption">{s.closedReason}</p>
                </div>
                <span className="text-caption">
                  Closed {s.closedAt ? fmtDate(s.closedAt) : ""}
                </span>
                <span className="font-semibold">
                  <Delta value={s.metrics.returnAll} />
                </span>
                <span className="tnum">Max DD {fmtPct(s.metrics.maxDrawdown)}</span>
                <ComplianceBadge strategy={s} short />
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border-strong px-5 py-6 text-center text-secondary">No closed strategies.</p>
        )}
      </section>

      <section className="mt-10">
        <Card>
          <CardHeader title="Combined epoch history" description="Every strategy, every Epoch — hover for details" />
          <CardBody className="space-y-5">
            {all.map((s) => (
              <div key={s.id} className="grid items-start gap-2 md:grid-cols-[200px_1fr] md:gap-6">
                <div className="pt-1.5">
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-caption text-tertiary">{s.state === "closed" ? "Closed" : `${s.compliance.kept}/${s.compliance.settled} kept`}</div>
                </div>
                <EpochTimeline epochs={s.epochs} />
              </div>
            ))}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, Layers, ShieldCheck, User, Wallet } from "lucide-react";
import { RuleRow } from "@/components/contract/risk-contract";
import { CustodyDiagram, EscrowFlowDiagram, SeatsDiagram } from "@/components/marketing/diagrams";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { strategyById } from "@/mock/strategies";

export const metadata: Metadata = {
  title: "How it works",
  description: "Strategies, Capacity, Seats, Seat Contracts, Epochs, escrow and the independent Risk Engine — explained.",
};

const toc = [
  ["idea", "The idea"],
  ["analytics", "Strategies & analytics"],
  ["capacity", "Capacity & Seats"],
  ["contract", "Seat Contract"],
  ["epochs", "Epochs & escrow"],
  ["risk-engine", "Risk Engine"],
  ["custody", "Your money stays yours"],
  ["traders", "For traders"],
];

function Section({ id, n, title, children }: { id: string; n: number; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-border py-10 first:pt-0 last:border-0">
      <span className="tnum text-caption text-primary-text">0{n}</span>
      <h2 className="text-h1 mt-1">{title}</h2>
      <div className="text-body-lg mt-4 space-y-4 text-secondary">{children}</div>
    </section>
  );
}

export default function HowItWorks() {
  const ref = strategyById("eth-swing")!;
  return (
    <div className="container-marketing">
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "How it works" }]}
        title="How PropChange works"
        description="A market for trading strategies where you pay only for kept seat contracts."
      />
      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Contents" className="hidden lg:block">
          <ol className="sticky top-24 space-y-1 border-l border-border">
            {toc.map(([id, label], i) => (
              <li key={id}>
                <a href={`#${id}`} className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-secondary transition-colors hover:border-primary hover:text-text">
                  <span className="tnum mr-2 text-tertiary">{i + 1}</span>
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <article className="min-w-0 max-w-[820px]">
          <Section id="idea" n={1} title="Traders earn for discipline">
            <p>
              Most copy-trading platforms rank traders by return and charge you regardless of how they behave. PropChange flips that: every strategy publishes a <b className="text-text">Seat Contract</b> derived from its own history, and your fee is only released to the trader if they keep it.
            </p>
            <p className="rounded-lg border-l-4 border-primary bg-primary-soft px-5 py-4 text-text">
              &ldquo;+3%/month, 4% max drawdown, 11/12 contracts kept&rdquo; should beat &ldquo;+40%/month, 60% max drawdown&rdquo;. We build the product so that it does.
            </p>
          </Section>

          <Section id="analytics" n={2} title="Strategies & professional analytics">
            <p>A trader is a person; a <b className="text-text">strategy</b> is the product. Each strategy runs on its own dedicated sub-account, so risk and PnL are attributable.</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                [BarChart3, "Time-weighted returns", "Deposits and withdrawals never count as performance."],
                [Layers, "Risk first", "Return is always shown next to drawdown and volatility."],
                [ShieldCheck, "Risk flags", "Martingale, averaging down, hidden tail risk, thin samples."],
              ].map(([I, t, b]) => {
                const Icon = I as typeof BarChart3;
                return (
                  <div key={t as string} className="rounded-lg border border-border bg-surface p-4">
                    <Icon className="size-5 text-primary-text" strokeWidth={1.75} />
                    <div className="mt-3 text-[15px] font-semibold text-text">{t as string}</div>
                    <p className="mt-1 text-[14px] leading-5">{b as string}</p>
                  </div>
                );
              })}
            </div>
            <p>Closed and failed strategies stay visible forever — so no one can open ten strategies and only show the three winners.</p>
          </Section>

          <Section id="capacity" n={3} title="Capacity & Seats">
            <p>
              Every follower order moves the market. <b className="text-text">Capacity</b> is the most follower capital a strategy can absorb before slippage eats a third of its edge. It is split into <b className="text-text">Seats</b> — each Seat lets you copy up to a fixed allocation of your own capital.
            </p>
            <div className="rounded-xl border border-border bg-surface p-5">
              <SeatsDiagram />
              <p className="mt-3 text-[14px]">
                Example: Capacity $300,000 ÷ $3,000 per Seat = <b className="text-text">100 Seats</b>. 87 are taken — the price rises as the last ones fill.
              </p>
            </div>
            <p>Bigger holders never get signals first. All followers of a signal execute in the same batch, in randomized order.</p>
          </Section>

          <Section id="contract" n={4} title="The Seat Contract">
            <p>Before each Epoch, a contract is generated from the strategy&apos;s history plus a buffer. The trader may tighten any rule, never loosen it.</p>
            <div className="rounded-xl border border-border bg-surface px-5 py-2">
              {ref.contract.rules.map((r) => (
                <div key={r.key} className="border-b border-border last:border-0">
                  <RuleRow rule={r} />
                  <p className="-mt-1 pb-3 pl-4 text-caption text-tertiary">{r.historical}</p>
                </div>
              ))}
            </div>
            <p>
              The contract does <b className="text-text">not</b> promise profit. A trader can have a losing Epoch and still be paid if every rule was respected.
            </p>
          </Section>

          <Section id="epochs" n={5} title="Epochs & escrow">
            <p>
              You pay the Seat Fee in USDC on Solana. It sits in an on-chain escrow for the 30-day Epoch. At the end, a signed settlement report releases it — or refunds it.
            </p>
            <div className="rounded-xl border border-border bg-surface p-4 md:p-6">
              <EscrowFlowDiagram />
            </div>
            <ul className="space-y-2 text-[15px]">
              <li><b className="text-text">Hard breach</b> (drawdown, daily loss, leverage, position size, prohibited instrument): copying stops, full refund.</li>
              <li><b className="text-text">Soft breach</b> (minimum activity, repeated data gaps): pro-rata refund.</li>
              <li><b className="text-text">Fraud</b>: full refund and the trader&apos;s bond is slashed to Seat holders.</li>
            </ul>
          </Section>

          <Section id="risk-engine" n={6} title="The independent Risk Engine">
            <p>You are protected even from the trader. Three levels of checks run on every copied order:</p>
            <ol className="grid gap-3 md:grid-cols-3">
              {[
                ["Per order", "Scaled to your equity and allocation, leverage capped, protective stop attached."],
                ["Per strategy", "Breach → stop. Leverage spikes, martingale or rapid drawdown → pause new entries."],
                ["Per account", "Your daily loss limit, max drawdown, equity floor and one-click kill switch."],
              ].map(([t, b], i) => (
                <li key={t} className="rounded-lg border border-border bg-surface p-4">
                  <span className="tnum flex size-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">{i + 1}</span>
                  <div className="mt-3 text-[15px] font-semibold text-text">{t}</div>
                  <p className="mt-1 text-[14px] leading-5">{b}</p>
                </li>
              ))}
            </ol>
            <p className="text-[14px]">Stops and limits are best-effort: latency, gaps and venue outages can cause slippage.</p>
          </Section>

          <Section id="custody" n={7} title="Your money stays in your account">
            <p>PropChange never holds your trading capital. You connect a trade-only API key — keys with withdrawal permission are rejected automatically.</p>
            <div className="rounded-xl border border-border bg-surface p-4 md:p-6">
              <CustodyDiagram />
            </div>
          </Section>

          <Section id="traders" n={8} title="For traders: earnings">
            <p>Get paid every Epoch you keep your contract — Seat Fees released from escrow (75%), optional performance fees above a high-water mark, and royalties if Seats become transferable.</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/fees#trader" className={buttonVariants({ size: "lg" })}>
                Calculate your income <ArrowRight />
              </Link>
              <Link href="/signup?role=trader" className={buttonVariants({ size: "lg", variant: "outline" })}>
                <User /> Become a trader
              </Link>
              <Link href="/app/wallet" className={buttonVariants({ size: "lg", variant: "ghost" })}>
                <Wallet /> See escrow in the app
              </Link>
            </div>
          </Section>
        </article>
      </div>
    </div>
  );
}

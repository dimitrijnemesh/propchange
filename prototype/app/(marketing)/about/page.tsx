import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Eye, Lock, Scale } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { fmtMoney, fmtPct } from "@/lib/format";
import { getHomeData } from "@/lib/mock-api";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "About", description: "Why PropChange exists and how it is built." };

const principles = [
  { icon: Scale, title: "Rewarded for discipline", body: "Traders are paid for keeping their Seat Contract, not for a lucky month. Breaches refund followers automatically." },
  { icon: Lock, title: "Non-custodial by design", body: "Capital never leaves your own exchange or broker account. We only hold trade-only keys and escrowed Seat Fees." },
  { icon: Eye, title: "Measured, not marketed", body: "Every number on a strategy page is computed from its own history: drawdowns, capacity, compliance and costs." },
];

export default async function AboutPage() {
  const { stats } = await getHomeData();
  const numbers = [
    { label: "Strategies listed", value: String(stats.strategies) },
    { label: "Seats active", value: stats.seatsActive.toLocaleString("en-US") },
    { label: "Contracts kept", value: fmtPct(stats.keptRate) },
    { label: "In escrow this Epoch", value: fmtMoney(stats.escrowUsdc, { compact: true }) },
  ];
  return (
    <div className="container-market">
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        title="About PropChange"
        description="Copy trading built like a prop firm: limited Seats, enforced risk limits and fees that are only paid when the rules are kept."
      />
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-4">
        {numbers.map((n) => (
          <div key={n.label} className="bg-surface p-5">
            <dt className="text-[13px] text-tertiary">{n.label}</dt>
            <dd className="tnum mt-1 text-[28px] font-bold leading-9">{n.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {principles.map((p) => (
          <section key={p.title} className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <p.icon className="size-6 text-primary-text" strokeWidth={1.75} />
            <h2 className="mt-3 text-[17px] font-semibold">{p.title}</h2>
            <p className="mt-1.5 text-[14px] text-secondary">{p.body}</p>
          </section>
        ))}
      </div>
      <section className="mt-10 max-w-[760px] space-y-3 text-[15px] leading-7 text-secondary">
        <h2 className="text-[20px] font-semibold text-text">Why we built it</h2>
        <p>
          Copy trading usually rewards whoever posted the best recent return — and leaves late followers holding the risk. PropChange flips that:
          strategies are capped by their measured Capacity, every Epoch runs under a Seat Contract derived from the strategy&apos;s own history, and
          the trader&apos;s fee sits in escrow until the Epoch settles.
        </p>
        <p>The result is a market where discipline is the product, and where the numbers on the screen are the numbers that decide who gets paid.</p>
      </section>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/strategies" className={cn(buttonVariants({ size: "lg" }))}>
          Explore strategies <ArrowRight />
        </Link>
        <Link href="/community" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
          Join the community
        </Link>
      </div>
    </div>
  );
}

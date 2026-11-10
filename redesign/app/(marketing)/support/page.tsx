import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, KeyRound, LifeBuoy, Mail, MessageSquare, Scale, ShieldCheck, Wallet } from "lucide-react";
import { SeatIcon } from "@/components/common/seat-icon";
import { PageHeader } from "@/components/layout/page-header";
import { faq } from "@/mock/faq";

export const metadata: Metadata = { title: "Help Center", description: "Guides, answers and ways to reach PropChange support." };

const topics = [
  { icon: BookOpen, title: "Getting started", body: "Wallet, venues and your first Seat", href: "/faq#basics" },
  { icon: SeatIcon, title: "Seats & fees", body: "Pricing, escrow, waitlists", href: "/faq#seats" },
  { icon: Scale, title: "Seat Contracts", body: "Limits, breaches and refunds", href: "/faq#risk" },
  { icon: KeyRound, title: "Security & custody", body: "Trade-only keys, encryption", href: "/faq#security" },
  { icon: Wallet, title: "Payouts", body: "Settlement and trader payouts", href: "/faq#traders" },
  { icon: ShieldCheck, title: "Account", body: "Referrals, settings, closing", href: "/faq#account" },
];

export default function SupportPage() {
  const popular = faq.flatMap((c) => c.items.slice(0, 1).map((i) => ({ ...i, cat: c.id }))).slice(0, 6);
  return (
    <div className="container-market">
      <PageHeader crumbs={[{ label: "Home", href: "/" }, { label: "Help Center" }]} title="Help Center" description="Find an answer fast, or talk to a person." />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {topics.map((tp) => (
          <Link key={tp.title} href={tp.href} className="lift group rounded-xl border border-border bg-surface p-4 shadow-sm transition-colors hover:border-border-strong md:p-5">
            <tp.icon className="size-6 text-primary-text" strokeWidth={1.75} />
            <div className="mt-3 font-semibold">{tp.title}</div>
            <div className="mt-0.5 text-[13px] text-tertiary">{tp.body}</div>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-semibold">Popular questions</h2>
            <Link href="/faq" className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary-text hover:underline">
              All FAQ <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <ul className="mt-2 divide-y divide-border">
            {popular.map((p) => (
              <li key={p.q}>
                <Link href={`/faq#${p.cat}`} className="flex items-center justify-between gap-3 py-3 text-[14px] font-medium text-secondary transition-colors hover:text-text">
                  {p.q} <ArrowRight className="size-3.5 shrink-0 opacity-50" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section id="contact" className="scroll-mt-28 rounded-xl border border-border bg-surface p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-[18px] font-semibold">
            <LifeBuoy className="size-5 text-primary-text" strokeWidth={1.75} /> Contact us
          </h2>
          <p className="mt-1 text-[13px] text-tertiary">Median first response: 9 minutes (live chat), 4 hours (email).</p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-3 rounded-lg bg-bg-subtle p-3">
              <MessageSquare className="size-5 text-primary-text" strokeWidth={1.75} />
              <div className="min-w-0 flex-1">
                <div className="font-semibold">Live chat</div>
                <div className="text-[12.5px] text-tertiary">24/7 · English, Українська and 11 more</div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-up">
                <span className="size-1.5 rounded-full bg-up" /> Online
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-bg-subtle p-3">
              <Mail className="size-5 text-primary-text" strokeWidth={1.75} />
              <div className="min-w-0 flex-1">
                <div className="font-semibold">Email</div>
                <div className="text-[12.5px] text-tertiary">support@propchange.example</div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-[12.5px] text-tertiary">Support will never ask for your seed phrase, private keys or API secrets.</p>
        </section>
      </div>
    </div>
  );
}

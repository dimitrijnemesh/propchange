import type { Metadata } from "next";
import { ArrowUpRight, CalendarDays, Megaphone, ShieldCheck } from "lucide-react";
import { SOCIAL_ICON } from "@/components/common/social-links";
import { PageHeader } from "@/components/layout/page-header";
import { SOCIALS } from "@/lib/site-nav";

export const metadata: Metadata = { title: "Community", description: "Follow PropChange on X (@propchange_io) and Instagram (@propchange.io)." };

const events = [
  { date: "Oct 10", title: "Epoch 14 settlement recap", where: "X Spaces · @propchange_io", time: "16:00 UTC" },
  { date: "Oct 15", title: "Reading a Seat Contract — live walkthrough", where: "X Spaces · @propchange_io", time: "15:00 UTC" },
  { date: "Oct 22", title: "Trader office hours: listing your first strategy", where: "X Spaces · @propchange_io", time: "14:00 UTC" },
];

const rules = [
  "No signals, pumps or paid promotion — strategies speak through their Seat Contract.",
  "PropChange staff will never DM you first or ask for keys, seed phrases or payments.",
  "Be specific and respectful; disagree with numbers, not people.",
];

export default function CommunityPage() {
  return (
    <div className="container-market">
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Community" }]}
        title="Community"
        description="Follow product news, breach alerts and Epoch results — and talk strategy with traders and followers."
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {SOCIALS.map((s) => {
          const Icon = SOCIAL_ICON[s.key];
          return (
            <section key={s.key} id={s.key} className="lift flex scroll-mt-28 flex-col rounded-xl border border-border bg-surface p-5 shadow-sm target:border-primary">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary-soft-text">
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <h2 className="font-semibold">{s.name}</h2>
                  <p className="truncate text-[12.5px] text-tertiary">{s.handle}</p>
                </div>
              </div>
              <p className="mt-3 flex-1 text-[13.5px] text-secondary">{s.blurb}</p>
              <div className="mt-4 flex items-center justify-end">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-1 rounded-md bg-primary-soft px-3.5 text-[13px] font-semibold text-primary-soft-text transition-colors hover:bg-primary hover:text-on-primary"
                >
                  Follow <ArrowUpRight className="size-3.5" />
                </a>
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-[18px] font-semibold">
            <CalendarDays className="size-5 text-primary-text" strokeWidth={1.75} /> Upcoming events
          </h2>
          <ul className="mt-3 divide-y divide-border">
            {events.map((e) => (
              <li key={e.title} className="flex items-center gap-4 py-3">
                <span className="tnum flex w-14 shrink-0 flex-col items-center rounded-lg bg-bg-subtle py-1.5 text-[12px] font-semibold text-primary-text">
                  {e.date.split(" ")[0]}
                  <span className="text-[17px] text-text">{e.date.split(" ")[1]}</span>
                </span>
                <div className="min-w-0">
                  <div className="font-semibold">{e.title}</div>
                  <div className="text-[13px] text-tertiary">
                    {e.where} · {e.time}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-[18px] font-semibold">
            <ShieldCheck className="size-5 text-primary-text" strokeWidth={1.75} /> Community rules
          </h2>
          <ul className="mt-3 space-y-3 text-[14px] text-secondary">
            {rules.map((r) => (
              <li key={r} className="flex gap-2.5">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                {r}
              </li>
            ))}
          </ul>
          <p className="mt-5 flex gap-2 rounded-lg bg-bg-subtle p-3 text-[13px] text-secondary">
            <Megaphone className="mt-0.5 size-4 shrink-0 text-primary-text" />
            Official announcements are only posted on the channels listed on this page.
          </p>
        </section>
      </div>
    </div>
  );
}

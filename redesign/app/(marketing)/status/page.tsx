import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "System status", description: "Live status of PropChange services and venue connectors." };

const groups = [
  { title: "Platform", items: ["Website & app", "Public API", "Risk Engine", "Copy execution"] },
  { title: "Venue connectors", items: ["Binance", "Bybit", "MetaTrader 5 bridge"] },
  { title: "Settlement", items: ["Escrow program (Solana)", "Epoch settlement", "Notifications"] },
];

/** Deterministic 90-day uptime strip: mostly up, a few degraded days. */
function days(seed: number) {
  let x = seed * 9301 + 49297;
  return Array.from({ length: 90 }, () => {
    x = (x * 9301 + 49297) % 233280;
    const r = x / 233280;
    return r > 0.985 ? "down" : r > 0.955 ? "degraded" : "up";
  });
}

const incidents = [
  { date: "Sep 28, 2026", title: "Delayed copy fills on Bybit futures", body: "Bybit rate-limited order placement for 14 minutes. Copies queued and filled with a median delay of 2.1s; Risk Engine limits were unaffected.", state: "Resolved" },
  { date: "Sep 11, 2026", title: "Notifications delayed", body: "Email and push notifications were delayed up to 25 minutes due to a provider outage. In-app notifications were on time.", state: "Resolved" },
];

export default function StatusPage() {
  return (
    <div className="container-market max-w-[1080px]">
      <PageHeader crumbs={[{ label: "Home", href: "/" }, { label: "Status" }]} title="System status" />
      <div className="flex items-center gap-3 rounded-xl border border-border bg-up-soft p-4 text-up">
        <CheckCircle2 className="size-6 shrink-0" strokeWidth={1.75} />
        <div>
          <div className="font-semibold">All systems operational</div>
          <div className="text-[13px] opacity-80">Risk Engine p50 latency 14 ms · last checked a few seconds ago</div>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {groups.map((g, gi) => (
          <section key={g.title} className="rounded-xl border border-border bg-surface shadow-sm">
            <h2 className="border-b border-border px-5 py-3 font-semibold">{g.title}</h2>
            <ul className="divide-y divide-border">
              {g.items.map((name, i) => {
                const d = days(gi * 10 + i + 3);
                const uptime = 100 - (d.filter((v) => v === "down").length * 0.4 + d.filter((v) => v === "degraded").length * 0.05);
                return (
                  <li key={name} className="px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">{name}</span>
                      <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-up">
                        <span className="size-1.5 rounded-full bg-up" /> Operational
                      </span>
                    </div>
                    <div className="mt-3 flex h-7 gap-[2px]" aria-label={`${name}: 90-day uptime ${uptime.toFixed(2)}%`}>
                      {d.map((v, k) => (
                        <span
                          key={k}
                          className={cn("min-w-0 flex-1 rounded-[2px]", v === "up" ? "bg-up opacity-80" : v === "degraded" ? "bg-warning" : "bg-down")}
                          title={v}
                        />
                      ))}
                    </div>
                    <div className="mt-1.5 flex justify-between text-[11.5px] text-tertiary">
                      <span>90 days ago</span>
                      <span className="tnum">{uptime.toFixed(2)}% uptime</span>
                      <span>Today</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-[18px] font-semibold">Past incidents</h2>
        <ul className="mt-3 space-y-3">
          {incidents.map((i) => (
            <li key={i.title} className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold">{i.title}</span>
                <span className="text-[12.5px] text-tertiary">
                  {i.date} · {i.state}
                </span>
              </div>
              <p className="mt-1.5 text-[14px] text-secondary">{i.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

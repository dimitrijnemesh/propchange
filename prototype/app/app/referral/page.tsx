import type { Metadata } from "next";
import { Gift, Percent, UserPlus } from "lucide-react";
import { ReferralLink } from "@/components/app/referral-link";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Referral" };

const referrals = [
  { user: "kate.v", joined: "Sep 30, 2026", status: "Seat bought", earned: 12.4 },
  { user: "omar_fx", joined: "Sep 22, 2026", status: "Seat bought", earned: 28.9 },
  { user: "lena.m", joined: "Sep 14, 2026", status: "Signed up", earned: 0 },
  { user: "dmytro.k", joined: "Aug 29, 2026", status: "Seat bought", earned: 41.2 },
];

export default function ReferralPage() {
  const total = referrals.reduce((a, r) => a + r.earned, 0);
  const steps = [
    { icon: UserPlus, title: "Share your link", body: "Friends sign up with your code." },
    { icon: Gift, title: "They buy a Seat", body: "You both get 10% off one Epoch fee." },
    { icon: Percent, title: "You earn", body: "5% of the platform share of their fees for 12 months." },
  ];
  return (
    <>
      <PageHeader title="Referral" description="Invite friends and earn a share of platform fees, paid in USDC every Epoch." />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-border bg-border">
            {[
              ["Friends invited", String(referrals.length)],
              ["Bought a Seat", String(referrals.filter((r) => r.earned > 0).length)],
              ["Earned (USDC)", total.toFixed(2)],
            ].map(([l, v]) => (
              <div key={l} className="bg-surface p-4">
                <dt className="text-[12.5px] text-tertiary">{l}</dt>
                <dd className="tnum mt-1 text-[24px] font-bold">{v}</dd>
              </div>
            ))}
          </dl>
          <section className="rounded-xl border border-border bg-surface shadow-sm">
            <h2 className="border-b border-border px-5 py-3 font-semibold">Your referrals</h2>
            <div className="scroll-thin overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="text-[12px] text-tertiary">
                  <tr>
                    <th className="px-5 py-2.5 text-left font-medium">User</th>
                    <th className="px-5 py-2.5 text-left font-medium">Joined</th>
                    <th className="px-5 py-2.5 text-left font-medium">Status</th>
                    <th className="px-5 py-2.5 text-right font-medium">Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((r) => (
                    <tr key={r.user} className="border-t border-border">
                      <td className="px-5 py-3 font-semibold">{r.user}</td>
                      <td className="px-5 py-3 text-secondary">{r.joined}</td>
                      <td className="px-5 py-3 text-secondary">{r.status}</td>
                      <td className="tnum px-5 py-3 text-right font-semibold">{r.earned.toFixed(2)} USDC</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
        <aside className="space-y-6">
          <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <h2 className="mb-3 font-semibold">Invite friends</h2>
            <ReferralLink code="SAMR-7XK2" />
          </section>
          <section className="rounded-xl bg-bg-subtle p-5">
            <h2 className="font-semibold">How it works</h2>
            <ol className="mt-3 space-y-3">
              {steps.map((s) => (
                <li key={s.title} className="flex gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-soft-text">
                    <s.icon className="size-4" strokeWidth={1.75} />
                  </span>
                  <div>
                    <div className="text-[14px] font-semibold">{s.title}</div>
                    <div className="text-[13px] text-secondary">{s.body}</div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </>
  );
}

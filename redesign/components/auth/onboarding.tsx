"use client";
import { CheckCircle2, ChevronLeft, Copy, LineChart, Users, Wallet } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Address } from "@/components/common/address";
import { DEMO_WALLET, useApp } from "@/components/layout/providers";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type Role = "follower" | "trader" | "both";
type Risk = "conservative" | "balanced" | "aggressive";

const roles: { v: Role; title: string; body: string; I: React.ElementType }[] = [
  { v: "follower", title: "I want to copy strategies", body: "Buy Seats, copy into your own exchange account, get refunds on breach.", I: Copy },
  { v: "trader", title: "I'm a trader", body: "Publish strategies, get a Seat Contract and earn USDC every kept Epoch.", I: LineChart },
  { v: "both", title: "Both", body: "Trade your own strategies and follow others.", I: Users },
];

const risks: { v: Risk; title: string; body: string; values: string }[] = [
  { v: "conservative", title: "Conservative", body: "Smaller losses tolerated, tighter stops.", values: "Max loss 10% · daily 3% · 3x" },
  { v: "balanced", title: "Balanced", body: "Recommended for most followers.", values: "Max loss 20% · daily 5% · 5x" },
  { v: "aggressive", title: "Aggressive", body: "More room for volatile strategies.", values: "Max loss 35% · daily 8% · 8x" },
];

function Choice({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-4 rounded-xl border p-5 text-left transition-colors",
        on ? "border-primary bg-primary-soft" : "border-border bg-surface hover:border-border-strong",
      )}
    >
      {children}
    </button>
  );
}

export function Onboarding() {
  const sp = useSearchParams();
  const router = useRouter();
  const app = useApp();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<Role>(sp.get("role") === "trader" ? "trader" : "follower");
  const [exp, setExp] = useState("1–3 years");
  const [risk, setRisk] = useState<Risk>("balanced");
  const [later, setLater] = useState(true);
  const [busy, setBusy] = useState(false);

  const titles = ["How will you use PropChange?", "Experience & risk preference", "Connect your wallet"];

  return (
    <div className="w-full max-w-[640px]">
      <div className="mb-6">
        <div className="flex justify-between text-caption text-secondary">
          <span>
            Step {step + 1} of 3
          </span>
          <span>{Math.round(((step + 1) / 3) * 100)}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-muted" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={3}>
          <div className="h-full rounded-full bg-primary transition-[width] duration-200" style={{ width: `${((step + 1) / 3) * 100}%` }} />
        </div>
      </div>
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm md:p-8">
        <h1 className="text-h2">{titles[step]}</h1>

        {step === 0 ? (
          <div role="radiogroup" className="mt-6 space-y-3">
            {roles.map((r) => (
              <Choice key={r.v} on={role === r.v} onClick={() => setRole(r.v)}>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-soft-text">
                  <r.I className="size-5" strokeWidth={1.75} />
                </span>
                <span>
                  <span className="block text-[15px] font-semibold">{r.title}</span>
                  <span className="text-secondary">{r.body}</span>
                </span>
              </Choice>
            ))}
          </div>
        ) : null}

        {step === 1 ? (
          <div className="mt-6 space-y-6">
            <div>
              <div className="mb-2 text-caption text-secondary">Trading experience</div>
              <div className="flex flex-wrap gap-2" role="radiogroup">
                {["New", "< 1 year", "1–3 years", "3+ years"].map((e) => (
                  <button
                    key={e}
                    role="radio"
                    aria-checked={exp === e}
                    onClick={() => setExp(e)}
                    className={cn("h-9 rounded-full border px-4 text-[13px] font-semibold", exp === e ? "border-primary bg-primary-soft text-primary-soft-text" : "border-border text-secondary hover:border-border-strong")}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-caption text-secondary">Risk preference — sets your default Risk Engine limits</div>
              <div role="radiogroup" className="grid gap-3 md:grid-cols-3">
                {risks.map((r) => (
                  <Choice key={r.v} on={risk === r.v} onClick={() => setRisk(r.v)}>
                    <span>
                      <span className="block font-semibold">{r.title}</span>
                      <span className="mt-1 block text-[13px] text-secondary">{r.body}</span>
                      <span className="tnum mt-3 block text-caption text-tertiary">{r.values}</span>
                    </span>
                  </Choice>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-6 space-y-5">
            <p className="text-secondary">Seat Fees are paid in USDC on Solana. Your wallet is only used for Seats, escrow and refunds — never for trading capital.</p>
            {app.walletConnected ? (
              <div className="flex items-center gap-3 rounded-lg bg-success-soft p-4 text-success">
                <CheckCircle2 className="size-5" />
                <span className="font-semibold">Wallet connected</span>
                <Address value={DEMO_WALLET} className="ml-auto text-text" />
              </div>
            ) : (
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                loading={busy}
                onClick={async () => {
                  setBusy(true);
                  await app.connectWallet();
                  setBusy(false);
                }}
              >
                {!busy ? <Wallet /> : null} Connect wallet (mock)
              </Button>
            )}
            {role !== "trader" ? (
              <label className="flex cursor-pointer items-center gap-3">
                <Checkbox checked={later} onCheckedChange={setLater} />
                <span>Connect exchange account later</span>
              </label>
            ) : null}
          </div>
        ) : null}

        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
            <ChevronLeft /> Back
          </Button>
          {step < 2 ? (
            <Button onClick={() => setStep((s) => s + 1)}>Continue</Button>
          ) : (
            <Button
              onClick={() => {
                app.logIn();
                router.push(role === "trader" ? "/trader" : role === "both" ? "/app" : later ? "/app" : "/app/connections");
              }}
            >
              Finish
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

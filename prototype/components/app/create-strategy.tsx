"use client";
import { CheckCircle2, ChevronLeft, Info, Rocket, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldError, Input, Label, Select } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/switch";
import { Pills } from "@/components/ui/tabs";
import { fmtMoney, fmtNumber } from "@/lib/format";
import { seatPrice } from "@/lib/pricing";
import { cn, sleep } from "@/lib/utils";

const STEPS = ["Basics", "Connect account", "Analytics", "Seat Contract", "Capacity & Seats", "Price & bond"];

const generated = { max_dd: 11.5, daily_loss: 2.6, leverage: 4.8, position_size: 27 };

export function CreateStrategy() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [market, setMarket] = useState("crypto");
  const [venue, setVenue] = useState("Binance");
  const [style, setStyle] = useState("Swing · 1–3 days");
  const [nameErr, setNameErr] = useState("");
  const [dedicated, setDedicated] = useState(false);
  const [key, setKey] = useState("");
  const [importing, setImporting] = useState<"idle" | "running" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [rules, setRules] = useState(generated);
  const [alloc, setAlloc] = useState(3000);
  const [base, setBase] = useState(15);
  const [published, setPublished] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const fullCap = 420_000;
  const cap = fullCap * 0.1;
  const seats = Math.floor(cap / alloc);
  const bond = Math.max(500, fullCap * 0.01);
  const tightened = (Object.keys(generated) as (keyof typeof generated)[]).filter((k) => rules[k] < generated[k]).length;

  async function runImport() {
    setImporting("running");
    for (let i = 1; i <= 20; i++) {
      await sleep(90);
      setProgress(i * 5);
    }
    setImporting("done");
  }

  const canNext = [
    name.trim().length >= 3,
    importing === "done",
    true,
    true,
    true,
    true,
  ][step];

  if (published)
    return (
      <Card className="flex flex-col items-center px-6 py-14 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
          <Rocket className="size-7" strokeWidth={1.75} />
        </div>
        <h2 className="text-h2 mt-4">{name} is live in Rookie stage</h2>
        <p className="mt-1 max-w-md text-secondary">
          {seats} Seats open at {base} USDC base. Keep 3 consecutive Epochs to graduate to Active and unlock full capacity ({fmtMoney(fullCap, { compact: true })}).
        </p>
        <div className="mt-6 flex gap-2">
          <Link href="/trader/strategies" className={buttonVariants({ variant: "outline" })}>
            Your strategies
          </Link>
          <Link href="/trader" className={buttonVariants()}>
            Done
          </Link>
        </div>
      </Card>
    );

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <ol className="hidden space-y-1 lg:block" aria-label="Steps">
        {STEPS.map((s, i) => (
          <li key={s} aria-current={i === step ? "step" : undefined} className={cn("flex items-center gap-3 rounded-md px-3 py-2", i === step && "bg-primary-soft font-semibold text-primary-soft-text", i > step && "text-tertiary")}>
            <span className={cn("tnum flex size-6 items-center justify-center rounded-full text-[12px] font-bold", i < step ? "bg-success text-white" : i === step ? "bg-primary text-white" : "bg-bg-muted")}>
              {i < step ? "✓" : i + 1}
            </span>
            {s}
          </li>
        ))}
      </ol>
      <Card>
        <div className="border-b border-border px-5 py-4 lg:hidden">
          <div className="text-caption text-tertiary">
            Step {step + 1} of {STEPS.length}
          </div>
          <div className="font-semibold">{STEPS[step]}</div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-bg-muted">
            <div className="h-full bg-primary" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
        </div>
        <div className="space-y-6 p-5 md:p-6">
          {step === 0 ? (
            <>
              <div>
                <Label htmlFor="sname">Strategy name</Label>
                <Input
                  id="sname"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameErr("");
                  }}
                  onBlur={() => name.trim().length < 3 && setNameErr("At least 3 characters")}
                  placeholder="e.g. SOL Range Reversion"
                  invalid={!!nameErr}
                />
                <FieldError>{nameErr}</FieldError>
              </div>
              <div>
                <Label>Market</Label>
                <Pills ariaLabel="Market" value={market} onChange={setMarket} options={["crypto", "forex", "stocks", "futures"].map((m) => ({ value: m, label: m[0].toUpperCase() + m.slice(1) }))} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="svenue">Venue</Label>
                  <Select id="svenue" value={venue} onChange={(e) => setVenue(e.target.value)}>
                    <option>Binance</option>
                    <option>Bybit</option>
                    <option>MT5</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sstyle">Style</Label>
                  <Input id="sstyle" value={style} onChange={(e) => setStyle(e.target.value)} />
                </div>
              </div>
              <p className="flex gap-2 rounded-md bg-bg-subtle p-3 text-[13px] text-secondary">
                <Info className="mt-0.5 size-4 shrink-0 text-primary-text" />A material change of style later (instruments, timeframe, leverage regime) creates a new strategy — history can&apos;t be cherry-picked.
              </p>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <p className="text-secondary">
                Connect the dedicated {venue === "MT5" ? "MT5 account with investor (read-only) access" : `${venue} sub-account with a read-only key`}. One strategy = one account, so risk and PnL are attributable.
              </p>
              <div>
                <Label htmlFor="rokey">{venue === "MT5" ? "Investor login" : "Read-only API key"}</Label>
                <Input id="rokey" value={key} onChange={(e) => setKey(e.target.value)} placeholder={venue === "MT5" ? "e.g. 7731002" : "test-readonly-key"} disabled={importing !== "idle"} autoComplete="off" />
                <p className="mt-1 text-caption text-tertiary">Mock form — never enter real credentials.</p>
              </div>
              <label className="flex cursor-pointer items-center gap-3">
                <Checkbox checked={dedicated} onCheckedChange={setDedicated} />
                <span>This account is used only for this strategy</span>
              </label>
              {importing === "idle" ? (
                <Button onClick={runImport} disabled={key.length < 4 || !dedicated}>
                  Connect & import history
                </Button>
              ) : (
                <div className="space-y-3 rounded-lg bg-bg-subtle p-4">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="flex items-center gap-2 font-semibold">
                      {importing === "running" ? <Spinner className="size-3.5 text-primary-text" /> : <CheckCircle2 className="size-4 text-success" />}
                      {importing === "running" ? "Importing raw events…" : "History imported"}
                    </span>
                    <span className="tnum">{progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-bg-muted">
                    <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${progress}%` }} />
                  </div>
                  <ul className="grid grid-cols-2 gap-1 text-caption text-secondary md:grid-cols-3">
                    {["Fills", "Orders", "Positions", "Balances", "Funding & fees", "Deposits / withdrawals"].map((x, i) => (
                      <li key={x} className="flex items-center gap-1.5">
                        <CheckCircle2 className={cn("size-3.5", progress >= (i + 1) * 16 ? "text-success" : "text-disabled")} /> {x}
                      </li>
                    ))}
                  </ul>
                  {importing === "done" ? <p className="tnum text-[13px] font-semibold">96 days · 214 trades · 0 gaps · Merkle root recorded</p> : null}
                </div>
              )}
            </>
          ) : null}

          {step === 2 ? (
            <>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  ["Return (all)", "+9.8%"],
                  ["Max drawdown", "9.2%"],
                  ["Sortino", "2.14"],
                  ["PSR", "0.91"],
                ].map(([l, v]) => (
                  <div key={l} className="rounded-lg border border-border p-4">
                    <div className="text-caption text-tertiary">{l}</div>
                    <div className="tnum text-metric-lg mt-1">{v}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary-soft p-4">
                <Sparkles className="mt-0.5 size-5 shrink-0 text-primary-text" strokeWidth={1.75} />
                <div className="text-[13px]">
                  <p className="font-semibold">Eligible for Rookie stage</p>
                  <p className="text-secondary">96 days ≥ 60 · 214 trades ≥ 50. Rookie strategies get ≤ 10% of computed Capacity and a capped price until 3 consecutive kept Epochs.</p>
                </div>
              </div>
              <div>
                <div className="mb-2 text-caption text-secondary">Risk flags</div>
                <p className="flex items-center gap-2 font-medium text-success">
                  <CheckCircle2 className="size-5" /> No risk flags detected
                </p>
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <p className="text-secondary">Generated from your history plus a buffer. You can tighten any rule (safer — may justify a higher price) but never loosen it.</p>
              {(
                [
                  ["max_dd", "Max drawdown in Epoch", "%", "Hist. max 9.2% × 1.25", 3],
                  ["daily_loss", "Max daily loss", "%", "p99 daily loss 2.2% × 1.2", 0.5],
                  ["leverage", "Max leverage", "x", "p95 leverage 4.0x × 1.2", 1],
                  ["position_size", "Max single position", "% equity", "p95 position 18% × 1.5", 5],
                ] as const
              ).map(([k, label, unit, hist, min]) => (
                <div key={k} className="grid items-center gap-3 md:grid-cols-[240px_1fr]">
                  <div>
                    <div className="flex items-center gap-2 font-semibold">
                      {label} {rules[k] < generated[k] ? <Badge variant="primary">Tightened</Badge> : null}
                    </div>
                    <div className="text-caption text-tertiary">{hist}</div>
                  </div>
                  <Slider label={label} value={rules[k]} onChange={(v) => setRules((r) => ({ ...r, [k]: v }))} min={min} max={generated[k]} step={k === "position_size" ? 1 : 0.1} format={(v) => `${Number(v.toFixed(1))}${unit === "x" ? "x" : "%"}`} />
                </div>
              ))}
              <div className="rounded-md bg-bg-subtle p-4 text-[13px] text-secondary">
                Also included: allowed instruments <b className="text-text">SOL, ETH</b> · minimum activity <b className="text-text">≥ 12 trades</b> · martingale / averaging-down above threshold = breach.
                {tightened ? <span className="mt-1 block font-semibold text-primary-text">You tightened {tightened} rule{tightened > 1 ? "s" : ""}.</span> : null}
              </div>
            </>
          ) : null}

          {step === 4 ? (
            <>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-border p-4">
                  <div className="text-caption text-tertiary">Computed capacity</div>
                  <div className="tnum text-metric-lg mt-1">{fmtMoney(fullCap, { digits: 0 })}</div>
                  <div className="text-caption text-tertiary">√-impact model · edge 14 bps</div>
                </div>
                <div className="rounded-lg border border-primary bg-primary-soft p-4">
                  <div className="text-caption text-primary-soft-text">Rookie capacity (10%)</div>
                  <div className="tnum text-metric-lg mt-1">{fmtMoney(cap, { digits: 0 })}</div>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <div className="text-caption text-tertiary">Seats</div>
                  <div className="tnum text-metric-lg mt-1">{seats}</div>
                  <div className="tnum text-caption text-tertiary">
                    floor({fmtMoney(cap, { compact: true })} / {fmtMoney(alloc, { compact: true })})
                  </div>
                </div>
              </div>
              <div>
                <Label>Seat allocation</Label>
                <Pills ariaLabel="Seat allocation" value={alloc} onChange={setAlloc} options={[1000, 2000, 3000, 5000].map((a) => ({ value: a, label: fmtMoney(a, { digits: 0 }) }))} />
                <p className="mt-2 text-caption text-tertiary">Smaller allocations = more Seats, accessible to smaller accounts. Minimum account size for followers: $1,000.</p>
              </div>
            </>
          ) : null}

          {step === 5 ? (
            <>
              <div>
                <Label>Base price per 30 days</Label>
                <Slider label="Base price" value={base} onChange={setBase} min={5} max={15} format={(v) => `${v} USDC`} />
                <p className="mt-1 text-caption text-tertiary">Rookie stage: capped at 15 USDC.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {[0.2, 0.5, 0.9].map((o) => (
                  <div key={o} className="rounded-lg bg-bg-subtle p-4">
                    <div className="text-caption text-tertiary">At {o * 100}% occupancy</div>
                    <div className="tnum mt-1 font-semibold">{fmtNumber(seatPrice(base, 30, o))} USDC / 30d</div>
                    <div className="tnum text-caption text-tertiary">You earn ≈ {fmtNumber(seatPrice(base, 30, o) * Math.round(seats * o) * 0.75, 0)} / Epoch</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4">
                <div>
                  <div className="font-semibold">Trader Bond</div>
                  <div className="text-caption text-tertiary">1% of computed capacity, min. 500 USDC · slashed only for fraud</div>
                </div>
                <div className="tnum text-metric-lg">{fmtMoney(bond, { currency: "USDC", digits: 0 })}</div>
              </div>
            </>
          ) : null}
        </div>
        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            <ChevronLeft /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
              Continue
            </Button>
          ) : (
            <Button
              loading={publishing}
              onClick={async () => {
                setPublishing(true);
                await sleep(1500);
                setPublished(true);
              }}
            >
              Lock bond & publish
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

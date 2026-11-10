"use client";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronLeft,
  Dices,
  Info,
  Lock,
  Minus,
  Plus,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { SeatIcon } from "@/components/common/seat-icon";
import { SolanaBadge, SolanaMark } from "@/components/common/solana-mark";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Address } from "@/components/common/address";
import { DEMO_WALLET, useApp } from "@/components/layout/providers";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FieldError, Input, Label, Select } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox, Switch } from "@/components/ui/switch";
import { Pills } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { fmtDate, fmtMoney, fmtNumber } from "@/lib/format";
import { FEE_SPLIT, TERMS, occupancyFactor, seatPrice, termFactor } from "@/lib/pricing";
import { cn, sleep } from "@/lib/utils";
import type { ExchangeAccount, Venue } from "@/types/domain";
import { EscrowStatus } from "./escrow-status";

export interface SeatStrategy {
  id: string;
  slug: string;
  name: string;
  traderHandle: string;
  basePriceUsdc: number;
  seatsTaken: number;
  seatsTotal: number;
  seatAllocationUsd: number;
  minAccountUsd: number;
  venue: Venue;
  state: string;
  waitlist: number;
  contractLeverage: number;
  epochEnd?: string;
  pausedReason?: string;
}

const USDC_BALANCE = 412.6;

export function PriceQuote({
  base,
  term,
  occupancy,
  seats = 1,
  className,
}: {
  base: number;
  term: number;
  occupancy: number;
  seats?: number;
  className?: string;
}) {
  const per = seatPrice(base, term, occupancy);
  return (
    <dl className={cn("space-y-2 rounded-md bg-bg-subtle p-4", className)}>
      <Row label="Base price" value={`${fmtNumber(base)} USDC / 30d`} />
      <Row label={`Term factor (${term}/30)^0.9`} value={`× ${termFactor(term).toFixed(3)}`} />
      <Row label={`Occupancy factor 1 + 0.5 × ${(occupancy * 100).toFixed(1)}%²`} value={`× ${occupancyFactor(occupancy).toFixed(3)}`} />
      {seats > 1 ? <Row label="Seats" value={`× ${seats}`} /> : null}
      <div className="flex items-center justify-between border-t border-border pt-2">
        <dt className="font-semibold">Total</dt>
        <dd className="tnum text-[17px] font-bold">{fmtMoney(per * seats, { currency: "USDC" })}</dd>
      </div>
    </dl>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-secondary">
      <dt className="text-[13px]">{label}</dt>
      <dd className="tnum font-medium text-text">{value}</dd>
    </div>
  );
}

function SeatStepper({ value, onChange, max = 5 }: { value: number; onChange: (v: number) => void; max?: number }) {
  return (
    <div className="inline-flex h-10 items-center rounded-md border border-border-strong">
      <button
        type="button"
        aria-label="Fewer seats"
        className="flex size-10 items-center justify-center text-secondary hover:text-text disabled:opacity-40"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Minus className="size-4" />
      </button>
      <span className="tnum w-8 text-center font-semibold" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label="More seats"
        className="flex size-10 items-center justify-center text-secondary hover:text-text disabled:opacity-40"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sticky seat panel on the strategy page                              */
/* ------------------------------------------------------------------ */

export function SeatPanel({ s, accounts }: { s: SeatStrategy; accounts: ExchangeAccount[] }) {
  const [term, setTerm] = useState(30);
  const [seats, setSeats] = useState(1);
  const [open, setOpen] = useState(false);
  const toast = useToast();
  const occ = s.seatsTaken / s.seatsTotal;
  const full = s.seatsTaken >= s.seatsTotal;
  const paused = s.state === "paused";
  const free = s.seatsTotal - s.seatsTaken;
  const price = seatPrice(s.basePriceUsdc, term, occ);
  const price30 = seatPrice(s.basePriceUsdc, 30, occ);

  return (
    <>
      <section className="rounded-xl border border-border bg-surface p-5 shadow-sm" aria-label="Get a seat">
        <div className="flex items-baseline justify-between">
          <span className="text-caption text-secondary">Seat price</span>
          <span className="text-caption text-tertiary">{term} days</span>
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="tnum text-[32px] font-bold leading-10">{fmtNumber(price * seats)}</span>
          <span className="font-semibold text-secondary">USDC</span>
        </div>
        <p className="text-caption text-tertiary">Price rises as seats fill · locked for your term</p>

        <div className="mt-5">
          <Label>Term</Label>
          <Pills
            ariaLabel="Term"
            options={TERMS.map((t) => ({ value: t, label: `${t}d` }))}
            value={term}
            onChange={setTerm}
          />
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div>
            <Label className="mb-0.5">Seats</Label>
            <p className="tnum text-caption text-secondary">
              Copy up to <b className="text-text">{fmtMoney(s.seatAllocationUsd * seats, { digits: 0 })}</b>
            </p>
          </div>
          <SeatStepper value={seats} onChange={setSeats} max={Math.max(1, Math.min(5, free || 5))} />
        </div>

        <PriceQuote className="mt-4" base={s.basePriceUsdc} term={term} occupancy={occ} seats={seats} />

        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-caption">
            <span className="tnum">
              <b>{s.seatsTaken}</b>
              <span className="text-tertiary">/{s.seatsTotal} seats</span>
            </span>
            <span className="tnum text-secondary">{full ? `Full · ${s.waitlist} waitlist` : `${free} free`}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${occ * 100}%` }} />
          </div>
        </div>

        <EscrowStatus className="mt-5" until={s.epochEnd} />

        <div className="mt-5 space-y-2">
          {paused ? (
            <>
              <Button size="lg" className="w-full" disabled>
                Seats paused
              </Button>
              <p className="flex gap-2 rounded-md bg-warning-soft p-3 text-caption text-warning">
                <AlertTriangle className="size-4 shrink-0" />
                {s.pausedReason ?? "Copying is paused for this strategy."}
              </p>
            </>
          ) : full ? (
            <>
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={() => toast({ kind: "success", title: "Added to waitlist", body: `You are #${s.waitlist + 1} for ${s.name}.` })}
              >
                Join waitlist
              </Button>
              <Link href={`/seats/${s.slug}`} className={cn(buttonVariants({ variant: "link" }), "w-full justify-center")}>
                or buy from holders on the Seat Market
              </Link>
            </>
          ) : (
            <Button size="lg" className="w-full" onClick={() => setOpen(true)}>
              <SeatIcon strokeWidth={1.75} /> Get a seat
            </Button>
          )}
        </div>
        <Link
          href={`/seats/${s.slug}`}
          className="mt-4 flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2.5 text-[13px] font-semibold text-primary-text transition-colors hover:bg-bg-subtle"
        >
          <span className="flex items-center gap-2">
            <SeatIcon className="size-4" strokeWidth={1.75} /> Trade Seats on the Seat Market
          </span>
          <span aria-hidden>→</span>
        </Link>
        <Link
          href={`/strategies/${s.slug}?tab=simulate`}
          scroll={false}
          className="mt-2 flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2.5 text-[13px] font-semibold text-primary-text transition-colors hover:bg-bg-subtle"
        >
          <span className="flex items-center gap-2">
            <Dices className="size-4" strokeWidth={1.75} /> Simulate with your Risk Engine
          </span>
          <span aria-hidden>→</span>
        </Link>
        <p className="mt-3 text-caption text-tertiary">
          Minimum account size {fmtMoney(s.minAccountUsd, { digits: 0 })} ·{" "}
          <Link href="/glossary#seat" className="font-semibold text-primary-text hover:underline">
            What is a Seat?
          </Link>
        </p>
      </section>

      {/* mobile sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-8 z-30 flex items-center justify-between gap-3 border-t border-border bg-bg/95 px-4 py-3 backdrop-blur lg:hidden">
        <div>
          <div className="text-caption text-tertiary">from</div>
          <div className="tnum font-bold">{fmtNumber(price30)} USDC</div>
        </div>
        {paused ? (
          <Button disabled>Paused</Button>
        ) : full ? (
          <Button variant="outline" onClick={() => toast({ kind: "success", title: "Added to waitlist" })}>
            Join waitlist
          </Button>
        ) : (
          <Button onClick={() => setOpen(true)}>Get a seat</Button>
        )}
      </div>

      <BuySeatDialog open={open} onOpenChange={setOpen} s={s} accounts={accounts} initialTerm={term} initialSeats={seats} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* BuySeatDialog — 4 steps, fully mocked (FRONTEND_DESIGN §9.5)         */
/* ------------------------------------------------------------------ */

const steps = ["Seat & term", "Your account", "Your protection", "Confirm & pay"];

type Scenario = "normal" | "insufficient" | "filled";

export function BuySeatDialog({
  open,
  onOpenChange,
  s,
  accounts,
  initialTerm = 30,
  initialSeats = 1,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  s: SeatStrategy;
  accounts: ExchangeAccount[];
  initialTerm?: number;
  initialSeats?: number;
}) {
  const app = useApp();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [term, setTerm] = useState(initialTerm);
  const [seats, setSeats] = useState(initialSeats);
  const [accList, setAccList] = useState(accounts);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [maxLoss, setMaxLoss] = useState(20);
  const [dailyLoss, setDailyLoss] = useState(5);
  const [maxLev, setMaxLev] = useState(Math.min(s.contractLeverage, 5));
  const [closeOnLimit, setCloseOnLimit] = useState(true);
  const [ack, setAck] = useState(false);
  const [walletBusy, setWalletBusy] = useState(false);
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<null | "insufficient" | "filled">(null);
  const [scenario, setScenario] = useState<Scenario>("normal");

  useEffect(() => {
    if (open) {
      setStep(0);
      setTerm(initialTerm);
      setSeats(initialSeats);
      setDone(false);
      setError(null);
      setAck(false);
      setPaying(false);
    }
  }, [open, initialTerm, initialSeats]);

  const occ = s.seatsTaken / s.seatsTotal;
  const per = seatPrice(s.basePriceUsdc, term, occ);
  const total = Math.round(per * seats * 100) / 100;
  const allocation = s.seatAllocationUsd * seats;
  const compatible = (v: Venue) => (s.venue === "MT5" ? v === "MT5" : v !== "MT5");
  const account = accList.find((a) => a.id === accountId);
  const belowMin = account ? account.equityUsd < s.minAccountUsd : false;
  const epochs = Math.round(term / 30);

  const canNext =
    step === 0 ? true : step === 1 ? !!account && !belowMin : step === 2 ? true : false;

  async function pay() {
    setError(null);
    setPaying(true);
    await sleep(1500);
    setPaying(false);
    if (scenario === "insufficient" || total > USDC_BALANCE) return setError("insufficient");
    if (scenario === "filled") return setError("filled");
    setDone(true);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent wide title={done ? "Seat active" : `Get a seat · ${s.name}`} description={done ? undefined : `by ${s.traderHandle}`}>
        {done ? (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
              <CheckCircle2 className="size-7" strokeWidth={1.75} />
            </div>
            <h3 className="text-h2 mt-4">Seat active</h3>
            <p className="mt-1 max-w-sm text-secondary">Copying starts with the next trade.</p>
            <dl className="mt-6 w-full max-w-sm space-y-2 rounded-md bg-bg-subtle p-4 text-left">
              <Row label="Strategy" value={s.name} />
              <Row label="Seats · allocation" value={`${seats} · ${fmtMoney(allocation, { digits: 0 })}`} />
              <Row label="Paid into escrow" value={fmtMoney(total, { currency: "USDC" })} />
              <Row label="Account" value={account?.label ?? "—"} />
            </dl>
            <div className="mt-6 flex w-full max-w-sm gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onOpenChange(false);
                  router.push("/app/seats");
                }}
              >
                Go to My Seats
              </Button>
              <Button className="flex-1" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            <Stepper step={step} />
            <div className="px-5 pb-5">
              {step === 0 ? (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <Label>Seats</Label>
                      <SeatStepper value={seats} onChange={setSeats} max={Math.min(5, s.seatsTotal - s.seatsTaken)} />
                    </div>
                    <div className="text-right">
                      <div className="text-caption text-secondary">You copy up to</div>
                      <div className="tnum text-metric-lg">{fmtMoney(allocation, { digits: 0 })}</div>
                    </div>
                  </div>
                  <div>
                    <Label>Term</Label>
                    <Pills options={TERMS.map((t) => ({ value: t, label: `${t} days` }))} value={term} onChange={setTerm} ariaLabel="Term" />
                    {term > 30 ? (
                      <p className="mt-2 text-caption text-tertiary">
                        Paid upfront, settled per 30-day Epoch ({epochs} Epochs). A breach only refunds the current Epoch.
                      </p>
                    ) : null}
                  </div>
                  <PriceQuote base={s.basePriceUsdc} term={term} occupancy={occ} seats={seats} />
                  <p className="flex gap-2 text-caption text-secondary">
                    <Info className="mt-px size-4 shrink-0 text-primary-text" />
                    Fee split if the contract is kept: {FEE_SPLIT.trader * 100}% trader / {FEE_SPLIT.platform * 100}% platform. If it is breached,
                    your fee for that Epoch is refunded.
                  </p>
                </div>
              ) : null}

              {step === 1 ? (
                <div className="space-y-4">
                  <p className="text-secondary">
                    Choose the exchange or broker account that will receive copied orders. Your capital never leaves it.
                  </p>
                  <div role="radiogroup" aria-label="Account" className="space-y-2">
                    {accList.map((a) => {
                      const ok = compatible(a.venue);
                      const below = a.equityUsd < s.minAccountUsd;
                      const sel = a.id === accountId;
                      return (
                        <button
                          key={a.id}
                          type="button"
                          role="radio"
                          aria-checked={sel}
                          disabled={!ok}
                          onClick={() => setAccountId(a.id)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors",
                            sel ? "border-primary bg-primary-soft" : "border-border hover:border-border-strong",
                            !ok && "cursor-not-allowed opacity-50",
                          )}
                        >
                          <span className={cn("flex size-5 items-center justify-center rounded-full border-2", sel ? "border-primary" : "border-border-strong")}>
                            {sel ? <span className="size-2.5 rounded-full bg-primary" /> : null}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold">{a.label}</div>
                            <div className="text-caption text-tertiary">
                              {ok ? `Equity ${fmtMoney(a.equityUsd)}` : `Incompatible venue for a ${s.venue} strategy`}
                            </div>
                          </div>
                          {ok ? (
                            below ? (
                              <Badge variant="danger">Below {fmtMoney(s.minAccountUsd, { digits: 0 })} min</Badge>
                            ) : (
                              <Badge variant="success">
                                <Check /> Eligible
                              </Badge>
                            )
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                  {account && belowMin ? (
                    <p className="flex gap-2 rounded-md bg-danger-soft p-3 text-caption text-danger">
                      <AlertTriangle className="size-4 shrink-0" />
                      Account equity {fmtMoney(account.equityUsd)} is below this strategy&apos;s minimum of{" "}
                      {fmtMoney(s.minAccountUsd, { digits: 0 })}. Copied orders would round below venue minimums.
                    </p>
                  ) : null}
                  {account && !belowMin && account.equityUsd < allocation ? (
                    <p className="flex gap-2 rounded-md bg-warning-soft p-3 text-caption text-warning">
                      <Info className="size-4 shrink-0" />
                      Equity is below your {fmtMoney(allocation, { digits: 0 })} allocation — copying will be scaled to your equity.
                    </p>
                  ) : null}
                  {connecting ? (
                    <ConnectAccountForm
                      venueHint={s.venue}
                      onCancel={() => setConnecting(false)}
                      onConnected={(acc) => {
                        setAccList((l) => [...l, acc]);
                        setAccountId(acc.id);
                        setConnecting(false);
                      }}
                    />
                  ) : (
                    <Button variant="outline" className="w-full" onClick={() => setConnecting(true)}>
                      <Plus /> Connect account
                    </Button>
                  )}
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-6">
                  <p className="text-secondary">
                    The Risk Engine protects you even from the trader. These limits apply only to this Seat.
                  </p>
                  <div>
                    <Label>Max loss on allocation</Label>
                    <Slider label="Max loss on allocation" value={maxLoss} onChange={setMaxLoss} min={5} max={50} format={(v) => `${v}%`} />
                  </div>
                  <div>
                    <Label>Daily loss limit</Label>
                    <Slider label="Daily loss limit" value={dailyLoss} onChange={setDailyLoss} min={1} max={15} format={(v) => `${v}%`} />
                  </div>
                  <div>
                    <Label>Max leverage</Label>
                    <Slider
                      label="Max leverage"
                      value={maxLev}
                      onChange={setMaxLev}
                      min={1}
                      max={Math.max(2, s.contractLeverage)}
                      step={0.5}
                      format={(v) => `${v}x`}
                    />
                  </div>
                  <label className="flex items-center justify-between gap-4 rounded-md bg-bg-subtle p-4">
                    <span>
                      <span className="block font-semibold">Close copied positions when a limit is hit</span>
                      <span className="text-caption text-secondary">Otherwise copying stops and positions stay open.</span>
                    </span>
                    <Switch checked={closeOnLimit} onCheckedChange={setCloseOnLimit} label="Close copied positions when limit hit" />
                  </label>
                  <div className="flex gap-3 rounded-md border border-primary/30 bg-primary-soft p-4">
                    <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary-text" strokeWidth={1.75} />
                    <p className="text-[13px] leading-5">
                      If this Seat loses <b>{fmtMoney((allocation * maxLoss) / 100, { digits: 0 })}</b> ({maxLoss}% of{" "}
                      {fmtMoney(allocation, { digits: 0 })}) or more than <b>{dailyLoss}%</b> in a day, copying stops
                      {closeOnLimit ? " and copied positions are closed" : ""}. Copied orders never exceed <b>{maxLev}x</b> leverage
                      and every position gets a protective stop.
                    </p>
                  </div>
                  <p className="text-caption text-tertiary">
                    Stops and limits are best-effort: latency, gaps and venue outages can cause slippage. The Risk Engine reduces
                    risk; it does not guarantee against loss.
                  </p>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="space-y-4">
                  <dl className="space-y-2 rounded-md bg-bg-subtle p-4">
                    <Row label="Strategy" value={`${s.name} · ${s.traderHandle}`} />
                    <Row label="Seats · term" value={`${seats} · ${term} days`} />
                    <Row label="Allocation" value={fmtMoney(allocation, { digits: 0 })} />
                    <Row label="Account" value={account?.label ?? "—"} />
                    <Row label="Protection" value={`−${maxLoss}% total · −${dailyLoss}% daily · ${maxLev}x`} />
                    <div className="flex items-center justify-between border-t border-border pt-2">
                      <dt className="font-semibold">Pay now</dt>
                      <dd className="tnum text-[17px] font-bold">{fmtMoney(total, { currency: "USDC" })}</dd>
                    </div>
                    <div className="flex justify-end">
                      <SolanaBadge label="Pay with USDC on Solana" />
                    </div>
                  </dl>
                  <EscrowStatus until={s.epochEnd} />
                  <label className="flex cursor-pointer items-start gap-3">
                    <Checkbox checked={ack} onCheckedChange={setAck} className="mt-0.5" />
                    <span className="text-[13px]">
                      I understand profit is <b>not</b> guaranteed. The Seat Contract limits the trader&apos;s behavior; it does not
                      promise returns.
                    </span>
                  </label>

                  {error === "insufficient" ? (
                    <div className="flex gap-2 rounded-md bg-danger-soft p-3 text-[13px] text-danger">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                      <div>
                        <b>Insufficient USDC.</b> Wallet balance {fmtMoney(USDC_BALANCE, { currency: "USDC" })}, required{" "}
                        {fmtMoney(total, { currency: "USDC" })}. Top up USDC on Solana or choose a shorter term.
                      </div>
                    </div>
                  ) : null}
                  {error === "filled" ? (
                    <div className="flex gap-2 rounded-md bg-warning-soft p-3 text-[13px] text-warning">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                      <div className="flex-1">
                        <b>The strategy filled during checkout.</b> No USDC was charged. You can join the waitlist instead.
                        <div className="mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              onOpenChange(false);
                            }}
                          >
                            Join waitlist
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-dashed border-border-strong px-3 py-2">
                    <span className="text-caption text-tertiary">Scenario</span>
                    <Select
                      aria-label="Scenario"
                      className="h-8 w-auto text-[13px]"
                      value={scenario}
                      onChange={(e) => setScenario(e.target.value as Scenario)}
                    >
                      <option value="normal">Success</option>
                      <option value="insufficient">Insufficient USDC</option>
                      <option value="filled">Filled during checkout</option>
                    </Select>
                  </div>

                  {app.walletConnected ? (
                    <div className="flex items-center justify-between rounded-md bg-bg-subtle px-3 py-2 text-caption">
                      <span className="flex items-center gap-2 text-secondary">
                        <SolanaMark className="size-3.5" /> Solana wallet
                      </span>
                      <Address value={DEMO_WALLET} />
                      <span className="tnum text-secondary">{fmtMoney(USDC_BALANCE, { currency: "USDC" })}</span>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-border bg-surface px-5 py-4">
              <Button variant="ghost" onClick={() => setStep((x) => x - 1)} disabled={step === 0 || paying}>
                <ChevronLeft /> Back
              </Button>
              {step < 3 ? (
                <Button onClick={() => setStep((x) => x + 1)} disabled={!canNext}>
                  Continue
                </Button>
              ) : !app.walletConnected ? (
                <Button
                  loading={walletBusy}
                  onClick={async () => {
                    setWalletBusy(true);
                    await app.connectWallet();
                    setWalletBusy(false);
                  }}
                >
                  {!walletBusy ? <Wallet /> : null} Connect wallet
                </Button>
              ) : (
                <Button onClick={pay} disabled={!ack || paying} className="min-w-[160px]">
                  {paying ? (
                    <>
                      <Spinner /> Signing…
                    </>
                  ) : (
                    <>
                      <Lock /> Pay {fmtNumber(total)} USDC
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex gap-2 px-5 py-4" aria-label="Progress">
      {steps.map((label, i) => (
        <li key={label} className="flex-1" aria-current={i === step ? "step" : undefined}>
          <div className={cn("h-1 rounded-full", i <= step ? "bg-primary" : "bg-bg-muted")} />
          <div className={cn("mt-2 hidden text-caption sm:block", i === step ? "text-text" : "text-tertiary")}>
            {i + 1}. {label}
          </div>
        </li>
      ))}
      <li className="sr-only">
        Step {step + 1} of {steps.length}: {steps[step]}
      </li>
    </ol>
  );
}

/* ------------------------------------------------------------------ */

export function ConnectAccountForm({
  venueHint,
  onConnected,
  onCancel,
}: {
  venueHint?: Venue;
  onConnected: (a: ExchangeAccount) => void;
  onCancel?: () => void;
}) {
  const [venue, setVenue] = useState<Venue>(venueHint ?? "Binance");
  const [key, setKey] = useState("");
  const [secret, setSecret] = useState("");
  const [phase, setPhase] = useState<"form" | "checking" | "done">("form");
  const [checks, setChecks] = useState(0);
  const [errors, setErrors] = useState<{ key?: string; secret?: string }>({});
  const mt5 = venue === "MT5";
  const checkList = useMemo(
    () => ["Trade permission", "Withdrawal disabled", mt5 ? "Investor/trade login valid" : "IP whitelist"],
    [mt5],
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (key.trim().length < 6) errs.key = mt5 ? "Enter your MT5 login" : "Enter an API key";
    if (secret.trim().length < 6) errs.secret = mt5 ? "Enter the trading password" : "Enter the API secret";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setPhase("checking");
    for (let i = 1; i <= 3; i++) {
      await sleep(550);
      setChecks(i);
    }
    setPhase("done");
    await sleep(500);
    onConnected({
      id: `acc-new-${Date.now()}`,
      venue,
      label: `${venue} · ${mt5 ? "#" + key.slice(-6) : "API ••" + key.slice(-4)}`,
      equityUsd: 5120.4,
      permissions: { trade: true, withdraw: false, ipWhitelist: !mt5 },
      connectedAt: new Date().toISOString().slice(0, 10),
      status: "ok",
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border border-border p-4" noValidate>
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Connect account</h4>
        <Badge variant="warning">Mock — never enter real keys</Badge>
      </div>
      <div>
        <Label htmlFor="venue">Venue</Label>
        <Select id="venue" value={venue} onChange={(e) => setVenue(e.target.value as Venue)} disabled={phase !== "form"}>
          <option>Binance</option>
          <option>Bybit</option>
          <option>MT5</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="key">{mt5 ? "MT5 login" : "API key (trade-only)"}</Label>
        <Input id="key" value={key} onChange={(e) => setKey(e.target.value)} invalid={!!errors.key} disabled={phase !== "form"} autoComplete="off" placeholder={mt5 ? "5012931" : "e.g. test-key-123456"} />
        <FieldError>{errors.key}</FieldError>
      </div>
      <div>
        <Label htmlFor="secret">{mt5 ? "Trading password" : "API secret"}</Label>
        <Input id="secret" type="password" value={secret} onChange={(e) => setSecret(e.target.value)} invalid={!!errors.secret} disabled={phase !== "form"} autoComplete="off" />
        <FieldError>{errors.secret}</FieldError>
      </div>
      {phase !== "form" ? (
        <ul className="space-y-1.5 rounded-md bg-bg-subtle p-3">
          {checkList.map((c, i) => (
            <li key={c} className="flex items-center gap-2 text-[13px]">
              {checks > i ? <CheckCircle2 className="size-4 text-success" /> : <Spinner className="size-3.5 text-tertiary" />}
              <span className={checks > i ? "text-text" : "text-tertiary"}>{c}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-caption text-tertiary">
          Keys with withdrawal permission are rejected automatically. Keys are encrypted and only used by the isolated execution
          service.
        </p>
      )}
      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={phase === "checking"}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" size="sm" loading={phase === "checking"} disabled={phase === "done"}>
          {phase === "done" ? "Connected" : "Validate & connect"}
        </Button>
      </div>
    </form>
  );
}

export function fmtEpochEnd(d?: string) {
  return d ? fmtDate(d) : "—";
}

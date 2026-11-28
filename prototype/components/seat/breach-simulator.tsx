"use client";
import { Check, Loader2, OctagonAlert, RotateCcw, ShieldAlert, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { fmtMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

const STEPS = [
  { I: ShieldAlert, title: "Risk Engine detects a breach", body: (rule: string) => rule },
  { I: OctagonAlert, title: "Copying stops for every Seat", body: () => "No new orders reach your exchange account." },
  { I: RotateCcw, title: "Escrow refunds your Seat fee", body: (_: string, amt: string) => `${amt} goes back to your wallet.` },
];

/**
 * Demo of the core promise: "Simulate breach" walks through detection → copying stopped → refund from escrow,
 * one step at a time, then calls `onDone` (the card flips to Refunded).
 */
export function BreachSimulator({ name, refund, rule, onDone }: { name: string; refund: number; rule: string; onDone: () => void }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(-1);
  const amount = fmtMoney(refund, { currency: "USDC" });

  useEffect(() => {
    if (!open || step < 0 || step >= STEPS.length) return;
    const t = setTimeout(() => setStep((s) => s + 1), 1100);
    return () => clearTimeout(t);
  }, [open, step]);

  const done = step >= STEPS.length;
  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setStep(0);
          setOpen(true);
        }}
      >
        <Zap /> Simulate breach
      </Button>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o && done) {
            onDone();
            toast({ kind: "success", title: "Refund received", body: `${amount} from ${name}'s escrow.` });
          }
          setOpen(o);
        }}
      >
        <DialogContent title="What happens when a trader breaks the rules" description={name}>
          <div className="space-y-3 p-5 pt-2 md:p-6 md:pt-2">
            {STEPS.map((s, i) => {
              const state = step > i ? "done" : step === i ? "active" : "todo";
              return (
                <div
                  key={s.title}
                  className={cn(
                    "flex items-start gap-3 rounded-2xl border p-4 transition-all duration-500",
                    state === "todo" ? "border-border opacity-40" : "border-border opacity-100",
                    state === "done" && i === 2 && "border-[var(--up)]/40 bg-[var(--up)]/10",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex size-9 shrink-0 items-center justify-center rounded-full",
                      state === "done" ? "bg-[var(--up)]/15 text-up" : i === 0 ? "bg-danger/15 text-danger" : "bg-primary/15 text-primary-text",
                    )}
                  >
                    {state === "active" ? <Loader2 className="size-[18px] animate-spin" /> : state === "done" ? <Check className="size-[18px]" strokeWidth={2.5} /> : <s.I className="size-[18px]" />}
                  </span>
                  <div>
                    <div className="text-[15px] font-semibold">{s.title}</div>
                    <div className="mt-0.5 text-[13.5px] text-secondary">{s.body(rule, amount)}</div>
                  </div>
                </div>
              );
            })}
            <div className={cn("pt-2 text-center transition-opacity duration-500", done ? "opacity-100" : "opacity-0")}>
              <div className="text-[13px] text-tertiary">Back in your wallet</div>
              <div className="text-[34px] font-semibold tracking-[-0.025em] text-up">+{amount}</div>
              <Button
                className="mt-3 w-full"
                size="lg"
                onClick={() => {
                  setOpen(false);
                  onDone();
                  toast({ kind: "success", title: "Refund received", body: `${amount} from ${name}'s escrow.` });
                }}
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

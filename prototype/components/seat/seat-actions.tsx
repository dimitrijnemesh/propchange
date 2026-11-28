"use client";
import { OctagonX, RefreshCw, RotateCcw, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { fmtMoney } from "@/lib/format";
import { BreachSimulator } from "./breach-simulator";

export function SeatActions({ refunded, slug, name, refund = 0, rule = "" }: { refunded: boolean; slug: string; name: string; refund?: number; rule?: string }) {
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [simulated, setSimulated] = useState(false);
  if (simulated)
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[var(--up)]/15 px-3 text-[13px] font-semibold text-up">
          <RotateCcw className="size-4" /> Refunded {fmtMoney(refund, { currency: "USDC" })}
        </span>
        <Button size="sm" variant="ghost" onClick={() => setSimulated(false)}>
          Reset demo
        </Button>
      </div>
    );
  if (refunded)
    return (
      <div className="flex gap-2">
        <Link href="/app/wallet" className={buttonVariants({ size: "sm" })}>
          Claim refund
        </Link>
        <Link prefetch={false} href={`/strategies/${slug}`} className={buttonVariants({ size: "sm", variant: "outline" })}>
          View strategy
        </Link>
      </div>
    );
  return (
    <div className="flex flex-wrap gap-2">
      <BreachSimulator name={name} refund={refund} rule={rule} onDone={() => setSimulated(true)} />
      <Link href="/app/risk" className={buttonVariants({ size: "sm", variant: "ghost" })}>
        <SlidersHorizontal /> Limits
      </Link>
      <Button size="sm" variant="outline" onClick={() => toast({ kind: "info", title: "Renewal scheduled", body: `${name} will renew at the next Epoch price.` })}>
        <RefreshCw /> Renew
      </Button>
      <Button size="sm" variant={stopped ? "secondary" : "outline"} className={stopped ? "" : "text-danger"} onClick={() => (stopped ? (setStopped(false), toast({ kind: "success", title: "Copying resumed" })) : setConfirm(true))}>
        <OctagonX /> {stopped ? "Resume copying" : "Stop copying"}
      </Button>
      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent title="Stop copying?" description={name}>
          <div className="space-y-4 p-5">
            <p className="text-secondary">
              New signals will no longer be copied into your account. Open copied positions stay open unless you close them. Your Seat Fee for this Epoch stays in escrow and follows the contract outcome.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setStopped(true);
                  setConfirm(false);
                  toast({ kind: "success", title: "Copying stopped", body: name });
                }}
              >
                Stop copying
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

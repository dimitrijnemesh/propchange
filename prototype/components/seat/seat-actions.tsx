"use client";
import { OctagonX, RefreshCw, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

export function SeatActions({ refunded, slug, name }: { refunded: boolean; slug: string; name: string }) {
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  const [stopped, setStopped] = useState(false);
  if (refunded)
    return (
      <div className="flex gap-2">
        <Link href="/app/wallet" className={buttonVariants({ size: "sm" })}>
          Claim refund
        </Link>
        <Link href={`/strategies/${slug}`} className={buttonVariants({ size: "sm", variant: "outline" })}>
          View strategy
        </Link>
      </div>
    );
  return (
    <div className="flex flex-wrap gap-2">
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

"use client";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { sleep } from "@/lib/utils";

export function BondTopUp({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const [amt, setAmt] = useState("500");
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Plus /> Top up
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent title="Top up bond" description={name}>
          <div className="space-y-4 p-5">
            <div>
              <Label htmlFor="amt">Amount</Label>
              <Input id="amt" inputMode="decimal" value={amt} onChange={(e) => setAmt(e.target.value.replace(/[^\d.]/g, ""))} suffix="USDC" />
            </div>
            <p className="text-caption text-tertiary">A larger bond is shown to followers as extra skin in the game. Bonds are only slashed for fraud, after a dispute window.</p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                loading={busy}
                disabled={!Number(amt)}
                onClick={async () => {
                  setBusy(true);
                  await sleep(1200);
                  setBusy(false);
                  setOpen(false);
                  toast({ kind: "success", title: "Bond topped up", body: `${amt} USDC locked for ${name} (mock)` });
                }}
              >
                Lock {amt || 0} USDC
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";
import { MoreHorizontal, Pause, Pencil, Play, XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "@/components/ui/dropdown";
import { Label } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/toast";

export function TraderStrategyActions({ name, base, paused }: { name: string; base: number; paused: boolean }) {
  const toast = useToast();
  const [priceOpen, setPriceOpen] = useState(false);
  const [price, setPrice] = useState(base);
  return (
    <>
      <Dropdown>
        <DropdownTrigger aria-label={`Actions for ${name}`} className="inline-flex size-8 items-center justify-center rounded-md text-secondary hover:bg-bg-subtle">
          <MoreHorizontal className="size-4" />
        </DropdownTrigger>
        <DropdownContent>
          <DropdownItem onSelect={() => setPriceOpen(true)}>
            <Pencil /> Change base price
          </DropdownItem>
          <DropdownItem onSelect={() => toast({ kind: "info", title: paused ? "Reopens next Epoch" : "Pause scheduled", body: paused ? "A regenerated contract will apply." : "Copying pauses after the current Epoch settles." })}>
            {paused ? <Play /> : <Pause />} {paused ? "Reopen next Epoch" : "Pause after this Epoch"}
          </DropdownItem>
          <DropdownItem className="text-danger" onSelect={() => toast({ kind: "danger", title: "Close strategy", body: "Closed strategies stay public forever (mock — not applied)." })}>
            <XCircle /> Close strategy
          </DropdownItem>
        </DropdownContent>
      </Dropdown>
      <Dialog open={priceOpen} onOpenChange={setPriceOpen}>
        <DialogContent title="Change base price" description={`${name} · applies from the next Epoch`}>
          <div className="space-y-5 p-5 text-left">
            <div>
              <Label>Base price per 30 days</Label>
              <Slider label="Base price" value={price} onChange={setPrice} min={5} max={120} format={(v) => `${v} USDC`} />
            </div>
            <p className="text-caption text-tertiary">Platform bounds: 5–120 USDC (Rookie capped at 15). Existing Seats keep their locked price.</p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setPriceOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setPriceOpen(false);
                  toast({ kind: "success", title: "Price updated", body: `${name}: ${price} USDC from the next Epoch` });
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

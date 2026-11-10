"use client";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { fmtMoney } from "@/lib/format";
import { sleep } from "@/lib/utils";

export function ClaimRefund({ amount }: { amount: number }) {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const toast = useToast();
  if (state === "done")
    return (
      <span className="inline-flex items-center gap-2 font-semibold text-success">
        <CheckCircle2 className="size-5" /> Claimed {fmtMoney(amount, { currency: "USDC" })}
      </span>
    );
  return (
    <Button
      loading={state === "busy"}
      onClick={async () => {
        setState("busy");
        await sleep(1500);
        setState("done");
        toast({ kind: "success", title: "Refund claimed", body: `${fmtMoney(amount, { currency: "USDC" })} sent to your wallet (mock).` });
      }}
    >
      {state !== "busy" ? <RotateCcw /> : null} Claim {fmtMoney(amount, { currency: "USDC" })}
    </Button>
  );
}

"use client";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";

export function ReferralLink({ code }: { code: string }) {
  const toast = useToast();
  const [done, setDone] = useState(false);
  const url = `propchange.example/r/${code}`;
  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
    setDone(true);
    toast({ kind: "success", title: "Copied", body: label });
    setTimeout(() => setDone(false), 1500);
  };
  return (
    <div className="space-y-3">
      {[
        ["Referral code", code],
        ["Referral link", url],
      ].map(([label, value]) => (
        <div key={label}>
          <div className="text-[12.5px] text-tertiary">{label}</div>
          <div className="mt-1 flex h-11 items-center gap-2 rounded-lg bg-bg-subtle pl-3 pr-1.5">
            <span className="tnum min-w-0 flex-1 truncate font-mono text-[14px] font-semibold">{value}</span>
            <button
              type="button"
              onClick={() => copy(value, label)}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-[13px] font-semibold text-on-primary hover:bg-primary-hover"
            >
              {done ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} Copy
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

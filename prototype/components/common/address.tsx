"use client";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { shortAddr } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Address({ value, className }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap font-mono text-[13px]", className)}>
      {shortAddr(value)}
      <button
        type="button"
        aria-label="Copy address"
        onClick={() => {
          navigator.clipboard?.writeText(value).catch(() => {});
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        }}
        className="text-tertiary hover:text-text"
      >
        {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
      </button>
    </span>
  );
}

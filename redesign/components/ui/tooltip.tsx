"use client";
import * as T from "@radix-ui/react-tooltip";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export const TooltipProvider = T.Provider;

/**
 * By default the trigger is a focusable inline wrapper created on the client, so children
 * rendered on the server (which may arrive as lazy RSC references) can be used safely.
 * Pass `asChild` only when the child is an interactive element created in a client component.
 */
export function Tooltip({
  content,
  children,
  side = "top",
  className,
  asChild,
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
  asChild?: boolean;
}) {
  return (
    <T.Root delayDuration={150}>
      <T.Trigger asChild>
        {asChild ? (
          children
        ) : (
          <span tabIndex={0} className="inline-flex max-w-full rounded-sm">
            {children}
          </span>
        )}
      </T.Trigger>
      <T.Portal>
        <T.Content
          side={side}
          sideOffset={6}
          className={cn(
            "anim-fade z-50 max-w-[280px] rounded-md bg-[#131417] px-3 py-2 text-xs leading-[18px] text-[#EAECEF] shadow-md dark:border dark:border-border dark:bg-bg-muted",
            className,
          )}
        >
          {content}
          <T.Arrow className="fill-[#131417] dark:fill-[var(--bg-muted)]" />
        </T.Content>
      </T.Portal>
    </T.Root>
  );
}

export function InfoTip({ content, label = "More info" }: { content: React.ReactNode; label?: string }) {
  return (
    <Tooltip content={content} asChild>
      <button
        type="button"
        aria-label={label}
        className="inline-flex text-tertiary transition-colors hover:text-text"
      >
        <Info className="size-3.5" strokeWidth={1.75} />
      </button>
    </Tooltip>
  );
}

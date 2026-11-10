"use client";
import * as D from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = D.Root;
export const DialogTrigger = D.Trigger;
export const DialogClose = D.Close;

/** Focus the panel itself on open (not the first button), so no focus ring flashes on the ✕. */
const focusPanel = (e: Event) => {
  e.preventDefault();
  (e.target as HTMLElement | null)?.focus?.({ preventScroll: true });
};

/** Centered dialog on ≥ md, bottom sheet on mobile (FRONTEND_DESIGN §6.1). */
export function DialogContent({
  children,
  className,
  title,
  description,
  wide,
  hideTitle,
}: {
  children: React.ReactNode;
  className?: string;
  title: string;
  description?: string;
  wide?: boolean;
  hideTitle?: boolean;
}) {
  return (
    <D.Portal>
      <D.Overlay className="anim-fade fixed inset-0 z-50 bg-overlay" />
      <D.Content
        onOpenAutoFocus={focusPanel}
        className={cn(
          "fixed z-50 flex flex-col bg-surface shadow-md outline-none focus-visible:shadow-md",
          "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-xl anim-sheet-up",
          "md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-h-[88dvh] md:w-[calc(100vw-48px)] md:rounded-xl md:anim-pop",
          wide ? "md:max-w-[640px]" : "md:max-w-[560px]",
          "dark:border dark:border-border",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className={cn(hideTitle && "sr-only")}>
            <D.Title className="text-h3">{title}</D.Title>
            {description ? (
              <D.Description className="mt-0.5 text-secondary">{description}</D.Description>
            ) : null}
          </div>
          {hideTitle ? <span /> : null}
          <D.Close
            className="-mr-1 size-9 inline-flex cursor-pointer items-center justify-center rounded-full text-secondary transition-[background-color,color,transform] duration-150 hover:bg-bg-muted hover:text-text active:scale-90 dark:hover:bg-white/10"
            aria-label="Close"
          >
            <X className="size-5" strokeWidth={1.75} />
          </D.Close>
        </div>
        <div className="scroll-thin min-h-0 flex-1 overflow-y-auto">{children}</div>
      </D.Content>
    </D.Portal>
  );
}

export function SheetContent({
  children,
  title,
  side = "right",
  className,
}: {
  children: React.ReactNode;
  title: string;
  side?: "right" | "bottom";
  className?: string;
}) {
  return (
    <D.Portal>
      <D.Overlay className="anim-fade fixed inset-0 z-50 bg-overlay" />
      <D.Content
        onOpenAutoFocus={focusPanel}
        className={cn(
          "fixed z-50 flex flex-col bg-surface outline-none focus-visible:shadow-none dark:border-border",
          side === "right"
            ? "anim-sheet-left inset-y-0 right-0 w-full max-w-[360px] border-l"
            : "anim-sheet-up inset-x-0 bottom-0 max-h-[88dvh] rounded-t-xl border-t",
          className,
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <D.Title className="text-h3">{title}</D.Title>
          <D.Description className="sr-only">{title}</D.Description>
          <D.Close
            className="size-10 inline-flex cursor-pointer items-center justify-center rounded-full text-secondary transition-[background-color,color,transform] duration-150 hover:bg-bg-muted hover:text-text active:scale-90 dark:hover:bg-white/10"
            aria-label="Close"
          >
            <X className="size-5" strokeWidth={1.75} />
          </D.Close>
        </div>
        <div className="scroll-thin min-h-0 flex-1 overflow-y-auto">{children}</div>
      </D.Content>
    </D.Portal>
  );
}

"use client";
import * as M from "@radix-ui/react-dropdown-menu";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const Dropdown = M.Root;
export const DropdownTrigger = M.Trigger;

export function DropdownContent({
  children,
  align = "end",
  className,
  ...rest
}: {
  children: React.ReactNode;
  align?: "start" | "end" | "center";
  className?: string;
} & Omit<React.ComponentProps<typeof M.Content>, "children" | "align" | "className">) {
  return (
    <M.Portal>
      <M.Content
        align={align}
        sideOffset={8}
        {...rest}
        className={cn(
          "anim-fade z-50 min-w-[200px] rounded-lg border border-border bg-surface p-1 shadow-md",
          className,
        )}
      >
        {children}
      </M.Content>
    </M.Portal>
  );
}

export function DropdownItem({
  className,
  ...props
}: React.ComponentProps<typeof M.Item>) {
  return (
    <M.Item
      className={cn(
        "flex h-9 cursor-pointer select-none items-center gap-2.5 rounded-md px-2.5 text-sm outline-none data-[highlighted]:bg-bg-subtle [&_svg]:size-4 [&_svg]:text-secondary",
        className,
      )}
      {...props}
    />
  );
}

export const DropdownSeparator = () => <M.Separator className="my-1 h-px bg-border" />;

export function DropdownLabel({ children }: { children: React.ReactNode }) {
  return <M.Label className="px-2.5 py-1.5 text-caption text-tertiary">{children}</M.Label>;
}

/**
 * Hover-to-open for a dropdown (exchange-style profile menus). Mouse only: hovering the trigger
 * opens it, leaving trigger + menu closes it after a short grace period; clicks keep it open and
 * keyboard / touch behave like a normal dropdown.
 */
export function useHoverMenu(closeDelay = 160) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => cancel, []);
  const enter = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    cancel();
    setOpen(true);
  };
  const leave = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    cancel();
    timer.current = setTimeout(() => setOpen(false), closeDelay);
  };
  return {
    root: { open, onOpenChange: setOpen, modal: false },
    trigger: {
      ref: triggerRef,
      onPointerEnter: enter,
      onPointerLeave: leave,
      // already open from hover: a click shouldn't toggle it shut
      onPointerDown: (e: React.PointerEvent) => {
        if (e.pointerType === "mouse" && open) e.preventDefault();
      },
    },
    content: {
      onPointerEnter: enter,
      onPointerLeave: leave,
      // don't yank focus back to the avatar when a hover menu closes
      onCloseAutoFocus: (e: Event) => e.preventDefault(),
      // the trigger counts as "outside" the menu — clicking it must not dismiss a hover-opened menu
      onPointerDownOutside: (e: Event) => {
        if (triggerRef.current?.contains(e.target as Node)) e.preventDefault();
      },
    },
  };
}

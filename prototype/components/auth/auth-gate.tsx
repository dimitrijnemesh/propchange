"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/components/layout/providers";
import { buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Exchange-style auth wall: `guard(fn)` runs `fn` when logged in, otherwise opens a
 * "Log in / Sign up" prompt that brings the user back to this page afterwards.
 */
export function useAuthGate(action = "get a seat", description = "Seats are bought from your account. It takes a minute and you come straight back here.") {
  const { loggedIn } = useApp();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const guard =
    <A extends unknown[]>(fn: (...a: A) => void) =>
    (...a: A) =>
      loggedIn ? fn(...a) : setOpen(true);
  const next = encodeURIComponent(path);
  const dialog = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent title={`Log in to ${action}`} description={description}>
        <div className="flex flex-col gap-2.5 p-5 pt-2 md:p-6 md:pt-2">
          <Link href={`/signup?next=${next}`} className={cn(buttonVariants({ size: "lg" }), "w-full")}>
            Sign up
          </Link>
          <Link href={`/login?next=${next}`} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}>
            Log in
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
  return { loggedIn, guard, dialog };
}

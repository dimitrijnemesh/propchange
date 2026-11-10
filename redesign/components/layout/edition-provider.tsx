"use client";
import { useRouter } from "next/navigation";
import { createContext, useContext, useTransition } from "react";
import { EDITION_COOKIE, type Edition } from "@/lib/edition";
import { cn } from "@/lib/utils";

const Ctx = createContext<Edition>("v3");

export function EditionProvider({ edition, children }: { edition: Edition; children: React.ReactNode }) {
  return <Ctx.Provider value={edition}>{children}</Ctx.Provider>;
}

export const useEdition = () => useContext(Ctx);

/** Prototype-only switch between the two concepts (v2 Platform · v3 Seat Market). */
export function EditionSwitch({ className }: { className?: string }) {
  const edition = useEdition();
  const router = useRouter();
  const [pending, start] = useTransition();
  const set = (e: Edition) => {
    document.cookie = `${EDITION_COOKIE}=${e}; path=/; max-age=31536000; samesite=lax`;
    start(() => router.refresh());
  };
  return (
    <div
      role="radiogroup"
      aria-label="Product version"
      className={cn("inline-flex h-7 items-center rounded-md border border-border-strong p-0.5 font-sans text-[11.5px] font-semibold dark:border-white/25", pending && "opacity-60", className)}
    >
      {(["v2", "v3"] as const).map((e) => (
        <button
          key={e}
          type="button"
          role="radio"
          aria-checked={edition === e}
          title={e === "v2" ? "v2 · Platform (no resale)" : "v3 · Seat Market (tokens)"}
          onClick={() => edition !== e && set(e)}
          className={cn(
            "h-full rounded px-2 transition-colors",
            edition === e ? "bg-primary text-on-primary dark:bg-white dark:text-primary" : "text-secondary hover:text-text dark:text-white/70 dark:hover:text-white",
          )}
        >
          {e}
        </button>
      ))}
    </div>
  );
}

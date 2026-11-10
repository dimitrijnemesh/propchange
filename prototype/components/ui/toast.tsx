"use client";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useState } from "react";
import { cn } from "@/lib/utils";

type Toast = { id: number; kind: "success" | "danger" | "info"; title: string; body?: string };
const Ctx = createContext<(t: Omit<Toast, "id">) => void>(() => {});

export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((x) => [...x, { ...t, id }]);
    setTimeout(() => setToasts((x) => x.filter((y) => y.id !== id)), 4200);
  }, []);
  const Icon = { success: CheckCircle2, danger: XCircle, info: Info };
  return (
    <Ctx.Provider value={push}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-20 z-[60] flex flex-col items-center gap-2 md:inset-x-auto md:bottom-auto md:right-6 md:top-20 md:items-end"
      >
        {toasts.map((t) => {
          const I = Icon[t.kind];
          return (
            <div
              key={t.id}
              className="anim-fade pointer-events-auto flex w-full max-w-[380px] items-start gap-3 rounded-lg border border-border bg-surface p-4 shadow-md"
            >
              <I
                className={cn(
                  "mt-0.5 size-5 shrink-0",
                  t.kind === "success" && "text-success",
                  t.kind === "danger" && "text-danger",
                  t.kind === "info" && "text-primary-text",
                )}
                strokeWidth={1.75}
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{t.title}</p>
                {t.body ? <p className="mt-0.5 text-secondary">{t.body}</p> : null}
              </div>
              <button
                aria-label="Dismiss"
                onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}
                className="text-tertiary hover:text-text"
              >
                <X className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

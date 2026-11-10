"use client";
import { AlertTriangle, Bell, Coins, Scale, ShieldAlert } from "lucide-react";
import { SeatIcon } from "@/components/common/seat-icon";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { fmtDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/domain";

const icons = { settlement: Scale, breach: ShieldAlert, risk: AlertTriangle, seat: SeatIcon, system: Bell, payout: Coins };

export function NotificationList({ items }: { items: Notification[] }) {
  const [list, setList] = useState(items);
  const unread = list.filter((n) => !n.read).length;
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-secondary">{unread} unread</span>
        <Button variant="ghost" size="sm" disabled={!unread} onClick={() => setList((l) => l.map((n) => ({ ...n, read: true })))}>
          Mark all as read
        </Button>
      </div>
      <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
        {list.map((n) => {
          const I = icons[n.kind];
          return (
            <li key={n.id}>
              <Link
                href={n.href ?? "#"}
                onClick={() => setList((l) => l.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
                className={cn("flex gap-4 px-5 py-4 transition-colors hover:bg-bg-muted", !n.read && "bg-primary-soft/50")}
              >
                <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", n.kind === "breach" ? "bg-danger-soft text-danger" : n.kind === "risk" ? "bg-warning-soft text-warning" : "bg-primary-soft text-primary-soft-text")}>
                  <I className="size-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className={cn("font-semibold", n.read && "font-medium")}>{n.title}</p>
                    <time className="text-caption text-tertiary">{fmtDateTime(n.at)}</time>
                  </div>
                  <p className="text-secondary">{n.body}</p>
                </div>
                {!n.read ? <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" /> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

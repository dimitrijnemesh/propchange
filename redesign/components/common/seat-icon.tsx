import { createLucideIcon } from "lucide-react";

/**
 * PropChange "Seat" symbol: an armchair with two short currency ticks above and below it
 * (like ₿) — a Seat is a paid place to copy a strategy.
 * Drop-in Lucide icon (same size/stroke props as every other icon).
 */
export const SeatIcon = createLucideIcon("seat", [
  ["path", { d: "M6.5 13V8a3.5 3.5 0 0 1 3.5-3.5h4A3.5 3.5 0 0 1 17.5 8v5", key: "back" }],
  ["path", { d: "M4 14a1.5 1.5 0 0 1 3 0v1.5h10V14a1.5 1.5 0 0 1 3 0v3.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z", key: "seat" }],
  ["path", { d: "M10.5 1.2v3.3M13.5 1.2v3.3M10.5 19.5v3.3M13.5 19.5v3.3", key: "ticks" }],
]);

import type { Edition } from "@/lib/edition";
import type { SeatRow } from "@/lib/mock-api";

export type SeatStatus = "open" | "market" | "full" | "paused";
export type SeatAction = "take" | "mint" | "buy" | "bid" | "paused";

type Row = Pick<SeatRow, "state" | "seatsTaken" | "seatsTotal" | "seatsTraded30d">;

/** Where a strategy stands right now (drives the row button and the chips). */
export function seatStatus(r: Row): SeatStatus {
  if (r.state === "paused") return "paused";
  if (r.seatsTaken < r.seatsTotal) return "open";
  // Full: busy strategies have holders reselling (v3 only — v2 has no resale).
  return r.seatsTraded30d >= 10 ? "market" : "full";
}

/** The single action per row — see the redesign spec, section 6.3. */
export function seatAction(r: Row, edition: Edition): SeatAction {
  const st = seatStatus(r);
  if (st === "paused") return "paused";
  if (st === "open") return edition === "v3" ? "mint" : "take";
  if (st === "market" && edition === "v3") return "buy";
  return "bid";
}

export const ACTION_LABEL: Record<SeatAction, string> = {
  take: "Take Seat",
  mint: "Mint",
  buy: "Buy",
  bid: "Bid",
  paused: "Paused",
};

/** Deterministic "2d 14h" Epoch countdown (prototype: hours derived from the id). */
export function epochLeft(r: Pick<SeatRow, "id" | "epochDaysLeft">) {
  let h = 0;
  for (const c of r.id) h = (h * 31 + c.charCodeAt(0)) % 24;
  return r.epochDaysLeft > 0 ? `${r.epochDaysLeft}d ${h}h` : `${h}h`;
}

/** Seat price shown in lists: v3 = last traded token price, v2 = this Epoch's Seat price. */
export const listPrice = (r: Pick<SeatRow, "marketPrice" | "price">, edition: Edition) => (edition === "v3" ? r.marketPrice : r.price);

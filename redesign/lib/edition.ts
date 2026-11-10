/**
 * Product edition. v2 = Platform (subscriptions, Seatlist, Release — no resale);
 * v3 = Seat Market (Seats as tokens: mint, buy, sell, order book).
 * Default comes from NEXT_PUBLIC_EDITION; the prototype lets you flip it with a cookie.
 */
export type Edition = "v2" | "v3";
export const EDITION_COOKIE = "pc_edition";
export const DEFAULT_EDITION: Edition = process.env.NEXT_PUBLIC_EDITION === "v2" ? "v2" : "v3";
export const isEdition = (v: unknown): v is Edition => v === "v2" || v === "v3";

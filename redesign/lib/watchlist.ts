"use client";
import { useSyncExternalStore } from "react";

/** Prototype watchlist ("Favorites"): strategy ids in localStorage, shared across components and tabs. */
const KEY = "pc_watchlist";
const EVENT = "pc-watchlist";
const EMPTY: string[] = [];
let cache: { raw: string | null; ids: string[] } = { raw: null, ids: EMPTY };

function read(): string[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {}
  if (raw !== cache.raw) {
    let ids = EMPTY;
    try {
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) ids = parsed.filter((x): x is string => typeof x === "string");
    } catch {}
    cache = { raw, ids };
  }
  return cache.ids;
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function toggleWatch(id: string) {
  const ids = read();
  const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function useWatchlist() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

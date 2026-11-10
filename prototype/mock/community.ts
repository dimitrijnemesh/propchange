import { seatPrice } from "@/lib/pricing";
import { mulberry32 } from "@/lib/rng";
import { TODAY } from "./nav";
import { strategies } from "./strategies";

const ADJ = ["calm", "swift", "quiet", "bold", "lucky", "steady", "sharp", "brave", "cool", "wise", "lunar", "polar", "amber", "cobalt", "silent", "rapid", "noble", "solid", "prime", "zen", "iron", "jade", "neon", "crisp", "frosty", "golden", "hidden", "misty", "nimble", "royal"];
const NOUN = ["falcon", "otter", "lynx", "heron", "orca", "fox", "raven", "bison", "koala", "panda", "tiger", "wolf", "hawk", "puma", "yak", "ibis", "mako", "gecko", "crane", "owl", "badger", "condor", "dingo", "egret", "ferret", "jaguar", "marlin", "osprey", "quokka", "shark"];

const rand = mulberry32(20261006);

/** ~1,200 pseudonymous follower handles (followers are anonymous by default). */
export const followers = Array.from({ length: 1200 }, (_, i) => {
  const a = ADJ[Math.floor(rand() * ADJ.length)];
  const n = NOUN[Math.floor(rand() * NOUN.length)];
  return `${a}.${n}${(i * 37 + 11) % 997}`;
});

export type SeatEventType = "buy" | "renew" | "waitlist" | "exit";

export interface SeatEvent {
  id: string;
  at: string;
  type: SeatEventType;
  user: string;
  strategyId: string;
  seats: number;
  termDays: number;
  priceUsdc: number;
}

const base = new Date(TODAY + "T09:30:00Z").getTime();
const live = strategies.filter((s) => s.state !== "closed" && s.state !== "paused");
const weights = live.map((s) => Math.sqrt(s.seatsTaken + 4) * (1 + Math.max(0, s.seatPrice7dChange) * 6));
const wSum = weights.reduce((a, b) => a + b, 0);
const pick = () => {
  let x = rand() * wSum;
  for (let i = 0; i < live.length; i++) {
    x -= weights[i];
    if (x <= 0) return live[i];
  }
  return live[0];
};

/** Recent seat activity across the market, newest first (~3 days). */
export const seatEvents: SeatEvent[] = (() => {
  const out: SeatEvent[] = [];
  let t = base;
  for (let i = 0; i < 320; i++) {
    t -= (3 + rand() * 24) * 60_000; // every 3–27 minutes
    const s = pick();
    const full = s.seatsTaken >= s.seatsTotal;
    const roll = rand();
    const type: SeatEventType = full ? (roll < 0.75 ? "waitlist" : "renew") : roll < 0.62 ? "buy" : roll < 0.82 ? "renew" : roll < 0.9 ? "waitlist" : "exit";
    const termDays = rand() < 0.7 ? 30 : rand() < 0.6 ? 90 : 180;
    const seats = 1 + (rand() < 0.25 ? 1 : 0) + (rand() < 0.08 ? 1 : 0);
    out.push({
      id: `ev-${i}`,
      at: new Date(t).toISOString(),
      type: type === "waitlist" && !full && rand() < 0.5 ? "buy" : type,
      user: followers[Math.floor(rand() * followers.length)],
      strategyId: s.id,
      seats,
      termDays,
      priceUsdc: Math.round(seatPrice(s.basePriceUsdc, termDays, s.seatsTaken / s.seatsTotal) * seats * 100) / 100,
    });
  }
  return out;
})();

/** Platform-wide community numbers (prototype). */
export const platform = (() => {
  const listed = strategies.filter((s) => s.state !== "closed");
  const seats = listed.reduce((a, s) => a + s.seatsTaken, 0);
  return {
    registeredUsers: 64_380,
    followersWithSeats: Math.round(seats / 1.55),
    traders: new Set(strategies.map((s) => s.traderHandle)).size,
    strategies: listed.length,
    seatsActive: seats,
    waitlist: listed.reduce((a, s) => a + s.waitlist, 0),
  };
})();

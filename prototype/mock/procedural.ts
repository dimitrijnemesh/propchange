import { mulberry32 } from "@/lib/rng";
import type { Market, StrategyState, Trader, Venue } from "@/types/domain";

/**
 * Deterministic "long tail" of the marketplace: extra traders and strategies built from
 * market/style archetypes, so lists, tables and boards look like a populated platform.
 */

export interface ProcSpec {
  id: string;
  name: string;
  trader: string;
  markets: Market[];
  instruments: string[];
  venue: Venue;
  style: string;
  description: string;
  state?: StrategyState;
  days: number;
  r: number;
  mdd: number;
  risk: number;
  cap: number;
  taken: number;
  base: number;
  kept: number;
  settled: number;
  win: number;
  payoff: number;
  trades: number;
  hold: number;
  flags?: string[];
  waitlist?: number;
  closedDaysAgo?: number;
  closedReason?: string;
  pausedReason?: string;
}

interface Archetype {
  market: Market;
  style: string;
  title: string;
  desc: string;
  pool: string[];
  /** typical holding time, hours */
  hold: [number, number];
  win: [number, number];
  /** risk score range */
  risk: [number, number];
  /** reward per unit of drawdown (12m return ≈ mdd × k) */
  k: [number, number];
}

const A: Archetype[] = [
  { market: "crypto", style: "Trend · days", title: "Trend", desc: "Systematic trend following on liquid crypto with ATR-based stops and pyramiding into strength.", pool: ["BTC", "ETH", "SOL", "BNB", "XRP"], hold: [48, 240], win: [0.38, 0.46], risk: [30, 60], k: [1.4, 3.2] },
  { market: "crypto", style: "Breakout · intraday", title: "Breakout", desc: "Intraday range breakouts with volume confirmation and a hard daily stop.", pool: ["SOL", "ETH", "AVAX", "LINK", "DOGE", "SUI"], hold: [2, 18], win: [0.4, 0.5], risk: [40, 72], k: [1.2, 3.0] },
  { market: "crypto", style: "Mean reversion · hours", title: "Mean Reversion", desc: "Fades stretched intraday moves back to VWAP with tight time stops.", pool: ["BTC", "ETH", "SOL"], hold: [3, 14], win: [0.56, 0.68], risk: [25, 48], k: [1.3, 2.6] },
  { market: "crypto", style: "Funding carry · delta-neutral", title: "Funding Carry", desc: "Collects perpetual funding with a spot hedge; exits when funding turns negative.", pool: ["BTC", "ETH", "SOL"], hold: [72, 400], win: [0.78, 0.9], risk: [8, 20], k: [2.2, 4.4] },
  { market: "crypto", style: "Momentum rotation · weekly", title: "Momentum Rotation", desc: "Weekly rotation into the strongest large caps with a BTC trend filter.", pool: ["SOL", "AVAX", "NEAR", "INJ", "TIA", "ARB", "OP"], hold: [80, 300], win: [0.42, 0.5], risk: [50, 80], k: [1.0, 2.8] },
  { market: "crypto", style: "Scalping · minutes", title: "Scalper", desc: "High-frequency scalps on order-book imbalance with strict inventory caps.", pool: ["BTC", "ETH"], hold: [0.2, 1], win: [0.6, 0.7], risk: [28, 46], k: [1.6, 3.0] },
  { market: "forex", style: "London breakout · intraday", title: "London Breakout", desc: "Trades the break of the Asian range at the London open; flat by New York close.", pool: ["EURUSD", "GBPUSD", "EURGBP"], hold: [3, 10], win: [0.44, 0.52], risk: [22, 42], k: [1.4, 2.8] },
  { market: "forex", style: "Mean reversion · session", title: "Session Fade", desc: "Fades overextended session moves on majors during low-impact hours.", pool: ["EURUSD", "USDCHF", "AUDUSD", "USDCAD"], hold: [2, 12], win: [0.6, 0.7], risk: [16, 34], k: [1.5, 2.6] },
  { market: "forex", style: "Carry · swing", title: "Carry", desc: "Positive-carry crosses with a volatility regime switch and weekend flat rule.", pool: ["AUDJPY", "NZDJPY", "MXNJPY", "USDJPY"], hold: [72, 400], win: [0.55, 0.64], risk: [24, 44], k: [1.2, 2.2] },
  { market: "forex", style: "News fade · minutes", title: "News Fade", desc: "Fades the first spike after tier-2 data releases with fixed-risk entries.", pool: ["EURUSD", "GBPUSD", "XAUUSD"], hold: [0.3, 2], win: [0.57, 0.66], risk: [30, 52], k: [1.3, 2.4] },
  { market: "stocks", style: "Momentum · swing", title: "Momentum", desc: "Relative-strength leaders with earnings-gap protection and sector caps.", pool: ["NVDA", "META", "AMZN", "AVGO", "NFLX", "UBER"], hold: [60, 240], win: [0.45, 0.53], risk: [32, 58], k: [1.3, 2.6] },
  { market: "stocks", style: "Pairs · market-neutral", title: "Pairs", desc: "Cointegrated large-cap pairs, dollar-neutral, with hard spread stops.", pool: ["KO", "PEP", "V", "MA", "XOM", "CVX"], hold: [48, 200], win: [0.58, 0.68], risk: [14, 30], k: [1.8, 3.2] },
  { market: "stocks", style: "Gap fade · intraday", title: "Gap Fade", desc: "Fades opening gaps in liquid US names that fail to hold the first 15 minutes.", pool: ["TSLA", "AAPL", "AMD", "COIN", "MSTR"], hold: [1, 6], win: [0.55, 0.64], risk: [34, 56], k: [1.2, 2.4] },
  { market: "futures", style: "Index trend · weeks", title: "Index Trend", desc: "Trend following across global equity index futures with portfolio heat limits.", pool: ["US500", "NAS100", "GER40", "UK100", "JP225"], hold: [120, 500], win: [0.38, 0.46], risk: [22, 40], k: [1.3, 2.4] },
  { market: "futures", style: "Commodities momentum · days", title: "Commodities Momentum", desc: "Momentum in energy and metals with inventory-report blackout windows.", pool: ["USOIL", "UKOIL", "XAUUSD", "XAGUSD", "COPPER"], hold: [24, 140], win: [0.42, 0.5], risk: [36, 62], k: [1.0, 2.2] },
  { market: "futures", style: "Opening range · intraday", title: "Opening Range", desc: "First-30-minute range breakouts on index futures with a single daily attempt.", pool: ["NAS100", "US500", "US30"], hold: [1, 5], win: [0.46, 0.55], risk: [30, 50], k: [1.2, 2.6] },
];

const FIRST = ["Nora", "Lukas", "Aisha", "Mateo", "Ingrid", "Tomás", "Yuki", "Oliver", "Zara", "Ethan", "Leila", "Marco", "Sofia", "Daniel", "Amelie", "Kwame", "Elif", "Noah", "Freya", "Arjun", "Chloe", "Ravi", "Mei", "Lars", "Isla", "Omar", "Julia", "Taro", "Bianca", "Oksana"];
const LAST = ["Berg", "Fischer", "Khan", "Rossi", "Larsen", "Navarro", "Mori", "Hughes", "Malik", "Brooks", "Haddad", "Conti", "Ferreira", "Novak", "Dubois", "Mensah", "Yilmaz", "Weber", "Nilsen", "Mehta", "Martin", "Iyer", "Chen", "Holm", "Murray", "Farouk", "Kowal", "Ito", "Costa", "Bondar"];
const COUNTRY = ["NO", "DE", "AE", "ES", "SE", "AR", "JP", "GB", "PK", "US", "LB", "IT", "BR", "CZ", "FR", "GH", "TR", "AT", "DK", "IN", "CA", "IN", "TW", "SE", "IE", "EG", "PL", "JP", "PT", "UA"];
const BIO = [
  "Systematic trader with a background in market microstructure.",
  "Former prop desk trader. Small risk per trade, many repetitions.",
  "Quant developer turned full-time trader. Every rule is backtested and forward-tested.",
  "Discretionary entries, systematic risk. Journals every trade.",
  "Ex-commodities analyst trading macro themes with strict stops.",
  "Part-time trader for eight years, full-time since 2024. Prefers boring and repeatable.",
];

const pick = <T,>(r: () => number, a: T[]) => a[Math.floor(r() * a.length)];
const between = (r: () => number, [lo, hi]: [number, number]) => lo + r() * (hi - lo);
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const round = (n: number, d = 3) => Math.round(n * 10 ** d) / 10 ** d;

const FIRST2 = ["Alina", "Hugo", "Sana", "Felix", "Camila", "Jonas", "Hiro", "Maya", "Viktor", "Lina", "Kofi", "Emma", "Diego", "Anya", "Samir", "Clara", "Ivo", "Nadia", "Theo", "Rina", "Bruno", "Selin", "Oskar", "Priya", "Leo", "Amara", "Mateus", "Yara", "Erik", "Daria"];
const LAST2 = ["Moreau", "Lindqvist", "Akhtar", "Baumann", "Reyes", "Vogel", "Tanaka", "Levi", "Horak", "Saleh", "Owusu", "Laurent", "Ortega", "Petrenko", "Aziz", "Schmid", "Marić", "Nouri", "Blake", "Sato", "Almeida", "Demir", "Lund", "Rao", "Fontaine", "Diallo", "Souza", "Haddad", "Strand", "Melnyk"];
const COUNTRY2 = ["FR", "SE", "PK", "CH", "MX", "DE", "JP", "IL", "CZ", "JO", "GH", "BE", "CO", "UA", "MA", "AT", "HR", "IR", "AU", "JP", "BR", "TR", "NO", "IN", "CA", "SN", "BR", "LB", "FI", "UA"];

const used = new Set<string>();
const usedHandles = new Set<string>();

function build(seed: number, firsts: string[], lasts: string[], countries: string[]) {
  const r = mulberry32(seed);
  const traders: Trader[] = [];
  const specs: ProcSpec[] = [];

  firsts.forEach((first, i) => {
    const last = lasts[i];
    let handle = `${first.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()}.${last[0].toLowerCase()}${i % 3 === 0 ? "q" : ""}`;
    while (usedHandles.has(handle)) handle += "x";
    usedHandles.add(handle);
    const joined = new Date(Date.UTC(2024, 3, 1) + Math.floor(r() * 820) * 86_400_000).toISOString().slice(0, 10);
    const ver = r();
    traders.push({
      handle,
      name: `${first} ${last}`,
      country: countries[i],
      bio: pick(r, BIO),
      joinedAt: joined,
      kyc: ver > 0.15,
      verification: ver > 0.55 ? "verified_plus" : ver > 0.15 ? "verified" : "connected",
      strategyIds: [],
      closedStrategyIds: [],
    });

    const n = 1 + Math.floor(r() * 2.6); // 1–3 strategies
    const home = pick(r, ["crypto", "crypto", "forex", "stocks", "futures"] as Market[]);
    for (let j = 0; j < n; j++) {
      const pool = A.filter((a) => a.market === home || r() < 0.18);
      const a = pick(r, pool);
      const lead = pick(r, a.pool);
      const name = `${a.market === "crypto" || a.market === "forex" ? lead + " " : ""}${a.title}${r() < 0.3 ? " " + pick(r, ["Pro", "X", "Core", "v2", "Lite", "Plus"]) : ""}`;
      const id = slug(`${name}-${handle.split(".")[0]}`);
      if (used.has(id)) continue;
      used.add(id);

      const roll = r();
      const state: StrategyState | undefined = roll < 0.12 ? "rookie" : roll < 0.15 ? "paused" : roll < 0.18 ? "closed" : undefined;
      const days = state === "rookie" ? Math.round(60 + r() * 60) : Math.round(160 + r() * 760);
      const risk = Math.round(between(r, a.risk));
      const mdd = round(0.02 + (risk / 100) * (0.12 + r() * 0.26), 3);
      const losing = state === "closed" || r() < 0.06;
      const k = between(r, a.k);
      const ret = losing ? -round(mdd * (0.3 + r() * 0.6)) : round(mdd * k * (days < 365 ? days / 365 : 1));
      const hold = round(between(r, a.hold), 1);
      const trades = Math.max(30, Math.round((days * 24) / Math.max(hold, 0.25) * (0.15 + r() * 0.25)));
      const settled = Math.max(1, Math.min(30, Math.floor(days / 30) - (state === "rookie" ? 1 : 0)));
      const breaches = state === "rookie" ? 0 : Math.min(settled - 1, Math.round(settled * (risk / 100) * (0.15 + r() * 0.35)));
      const cap = Math.round((3_600_000 / (1 + risk / 9)) * (0.4 + r() * 1.4) / 10_000) * 10_000;
      const seats = Math.floor(cap / 3000);
      // demand follows quality: losing or rookie strategies don't fill up
      const occ =
        state === "closed" ? 0 : losing ? 0.04 + r() * 0.22 : state === "rookie" ? 0.1 + r() * 0.5 : Math.min(1, 0.08 + r() * (k > 2 && r() < 0.35 ? 1.25 : 0.88));
      const win = round(between(r, a.win), 2);
      specs.push({
        id,
        name,
        trader: handle,
        markets: [a.market],
        instruments: [lead, ...a.pool.filter((x) => x !== lead && r() < 0.5)].slice(0, 5),
        venue: a.market === "crypto" ? (r() < 0.55 ? "Binance" : "Bybit") : "MT5",
        style: a.style,
        description: a.desc,
        state,
        days,
        r: ret,
        mdd,
        risk,
        cap: Math.max(40_000, cap),
        // rookies list with 10% of capacity, so their seat count is sized against that
        taken: Math.round(Math.max(1, state === "rookie" ? Math.floor(seats * 0.1) : seats) * occ),
        base: Math.round(12 + (60 - risk / 2) * 0.35 + occ * 22 + r() * 10),
        kept: settled - breaches,
        settled,
        win,
        payoff: round(Math.max(0.5, (1 - win) / win * (1.15 + r() * 0.6)), 2),
        trades,
        hold,
        flags: state === "rookie" ? ["Thin sample"] : risk > 70 && r() < 0.6 ? ["Concentration"] : undefined,
        closedDaysAgo: state === "closed" ? Math.round(40 + r() * 200) : undefined,
        closedReason: state === "closed" ? "Closed by trader after two consecutive breached Epochs" : undefined,
        pausedReason: state === "paused" ? "Hard breach this Epoch: daily loss exceeded the contract limit. Copying stopped and fees were refunded." : undefined,
      });
    }
  });
  return { traders, specs };
}

const batchA = build(90210, FIRST, LAST, COUNTRY);
const batchB = build(4711, FIRST2, LAST2, COUNTRY2);
export const procTraders = [...batchA.traders, ...batchB.traders];
export const procSpecs = [...batchA.specs, ...batchB.specs];

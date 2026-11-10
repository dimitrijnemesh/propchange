const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MINUS = "−";

export function fmtNumber(n: number, digits = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function fmtMoney(
  n: number,
  opts: { currency?: "USDC" | "USD"; compact?: boolean; digits?: number } = {},
) {
  const { currency = "USD", compact = false, digits = 2 } = opts;
  const neg = n < 0;
  const abs = Math.abs(n);
  let body: string;
  if (compact) {
    if (abs >= 1_000_000) body = `${trim(abs / 1_000_000)}M`;
    else if (abs >= 1_000) body = `${trim(abs / 1_000)}k`;
    else body = fmtNumber(abs, 0);
  } else body = fmtNumber(abs, digits);
  const sign = neg ? MINUS : "";
  return currency === "USD" ? `${sign}$${body}` : `${sign}${body} USDC`;
}

function trim(n: number) {
  return n.toFixed(n >= 100 ? 0 : 1).replace(/\.0$/, "");
}

/** Percent from a fraction (0.384 → "+38.4%"). */
export function fmtPct(n: number, opts: { sign?: boolean; digits?: number } = {}) {
  const { sign = false, digits = 1 } = opts;
  const v = (Math.abs(n) * 100).toFixed(digits);
  if (n < 0) return `${MINUS}${v}%`;
  return `${sign && n > 0 ? "+" : ""}${v}%`;
}

export function fmtBps(n: number) {
  return `${n.toFixed(1)} bps`;
}

export function fmtDate(iso: string, opts: { year?: boolean } = {}) {
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00Z" : ""));
  const s = `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
  return opts.year === false ? s : `${s}, ${d.getUTCFullYear()}`;
}

export function fmtMonth(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  return `${MONTHS[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(2)}`;
}

export function fmtDateTime(iso: string) {
  const d = new Date(iso);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${hh}:${mm} UTC`;
}

export function shortAddr(a: string) {
  return `${a.slice(0, 4)}…${a.slice(-4)}`;
}

export const monthNames = MONTHS;

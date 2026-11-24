/** Preferred display currency. Seat prices are in USDC; other currencies use fixed demo rates. */
export const CURRENCIES = [
  { code: "USD", symbol: "$", label: "US Dollar", rate: 1 },
  { code: "EUR", symbol: "€", label: "Euro", rate: 0.92 },
  { code: "UAH", symbol: "₴", label: "Українська гривня", rate: 41.5 },
] as const;
export type CurrencyCode = (typeof CURRENCIES)[number]["code"];
export const CURRENCY_COOKIE = "pc_ccy";
export const isCurrency = (v: unknown): v is CurrencyCode => CURRENCIES.some((c) => c.code === v);

/** 79.58 USDC → "$79.58" / "€73.21" / "₴3,303". */
export function fmtPrice(usdc: number, code: CurrencyCode, digits?: number) {
  const c = CURRENCIES.find((x) => x.code === code) ?? CURRENCIES[0];
  const v = usdc * c.rate;
  const d = digits ?? (v >= 1000 ? 0 : 2);
  return `${c.symbol}${v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })}`;
}

"use client";
import { Check, Loader2, Minus, PauseCircle, Plus, Wallet, X } from "lucide-react";
import { useMemo, useState } from "react";
import { SeatIcon } from "@/components/common/seat-icon";
import { SolanaBadge } from "@/components/common/solana-mark";
import { OnchainCard } from "./onchain-card";
import { SeatChart } from "./seat-chart";
import { useApp } from "@/components/layout/providers";
import { useToast } from "@/components/ui/toast";
import { shortAddr } from "@/lib/format";
import { cn, sleep } from "@/lib/utils";
import { b58, curveAt, mintCost, ROYALTY, type BookLevel, type SeatToken, type SeatTrade } from "@/lib/seat-curve";

type Tab = "mint" | "buy" | "sell";
type OrderType = "market" | "limit";
type Phase = "idle" | "signing" | "confirming";
interface OpenOrder {
  id: string;
  side: "buy" | "sell";
  price: number;
  qty: number;
}

const r2 = (n: number) => Math.round(n * 100) / 100;
const usd = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const time = (iso: string) => new Date(iso).toISOString().slice(11, 16);
const ROY = ROYALTY.trader + ROYALTY.platform;

/** Walk the book for a market order: average price and how much fills. */
function walk(levels: BookLevel[], qty: number) {
  let left = qty;
  let cost = 0;
  for (const l of levels) {
    const take = Math.min(left, l.qty);
    cost += take * l.price;
    left -= take;
    if (!left) break;
  }
  const filled = qty - left;
  return { filled, avg: filled ? cost / filled : 0, cost: r2(cost) };
}
function consume(levels: BookLevel[], qty: number) {
  let left = qty;
  return levels
    .map((l) => {
      const take = Math.min(left, l.qty);
      left -= take;
      return { ...l, qty: l.qty - take };
    })
    .filter((l) => l.qty > 0);
}

/**
 * Exchange-style Seat trading: order book + trades (left), trade panel + holdings (right).
 */
export function SeatTrading({ token, owned }: { token: SeatToken; owned: number }) {
  const app = useApp();
  const toast = useToast();
  const [asks, setAsks] = useState(token.asks);
  const [bids, setBids] = useState(token.bids);
  const [trades, setTrades] = useState<SeatTrade[]>(token.trades);
  const [minted, setMinted] = useState(token.minted);
  const [balance, setBalance] = useState(owned);
  const [orders, setOrders] = useState<OpenOrder[]>([]);
  const [tab, setTab] = useState<Tab>(token.minted < token.supply ? "mint" : "buy");
  const [type, setType] = useState<OrderType>("market");
  const [qty, setQty] = useState(1);
  const [limit, setLimit] = useState(token.marketPrice);
  const [phase, setPhase] = useState<Phase>("idle");

  const left = token.supply - minted;
  const curve = curveAt(token.initialPrice, minted, token.supply);
  const bestAsk = asks[0]?.price ?? token.marketPrice;
  const bestBid = bids[0]?.price ?? token.marketPrice;
  const spread = bestAsk && bestBid ? (bestAsk - bestBid) / bestAsk : 0;

  // quote for the current form
  const quote = useMemo(() => {
    if (tab === "mint") {
      const n = Math.min(qty, left);
      return { n, total: mintCost(token.initialPrice, minted, token.supply, n), avg: n ? mintCost(token.initialPrice, minted, token.supply, n) / n : 0 };
    }
    if (type === "market") {
      const w = walk(tab === "buy" ? asks : bids, qty);
      return { n: w.filled, total: w.cost, avg: w.avg };
    }
    return { n: qty, total: r2(qty * limit), avg: limit };
  }, [tab, type, qty, limit, asks, bids, minted, left, token]);

  const royalty = tab === "mint" ? 0 : r2(quote.total * ROY);
  const maxQty = tab === "mint" ? Math.max(1, Math.min(10, left)) : tab === "sell" ? Math.max(1, balance) : 20;
  const blocked =
    !token.tradable ||
    (tab === "mint" && left <= 0) ||
    (tab === "sell" && balance < qty) ||
    (type === "market" && tab !== "mint" && quote.n < qty) ||
    quote.n <= 0;

  const submit = async () => {
    if (!app.walletConnected) {
      await app.connectWallet();
      toast({ kind: "success", title: "Wallet connected", body: "Phantom · 7xKX…9fQa" });
      return;
    }
    setPhase("signing");
    await sleep(900);
    setPhase("confirming");
    await sleep(700);
    const sig = b58(Date.now() % 1e9, 88);
    const at = new Date().toISOString();
    if (tab === "mint") {
      setMinted((m) => m + quote.n);
      setBalance((b) => b + quote.n);
      setTrades((t) => [{ id: sig, at, kind: "mint", side: "buy", price: r2(quote.avg), qty: quote.n, wallet: "you", sig }, ...t]);
      toast({ kind: "success", title: `Minted ${quote.n} ${token.symbol}`, body: `${usd(quote.total)} USDC → Epoch escrow · ${shortAddr(sig)}` });
    } else if (type === "market") {
      if (tab === "buy") {
        setAsks((a) => consume(a, quote.n));
        setBalance((b) => b + quote.n);
      } else {
        setBids((b) => consume(b, quote.n));
        setBalance((b) => b - quote.n);
      }
      setTrades((t) => [{ id: sig, at, kind: "trade", side: tab, price: r2(quote.avg), qty: quote.n, wallet: "you", sig }, ...t]);
      toast({
        kind: "success",
        title: `${tab === "buy" ? "Bought" : "Sold"} ${quote.n} ${token.symbol}`,
        body: `Avg ${usd(quote.avg)} USDC · royalty ${usd(royalty)} USDC · ${shortAddr(sig)}`,
      });
    } else {
      setOrders((o) => [{ id: sig, side: tab, price: r2(limit), qty }, ...o]);
      if (tab === "buy") setBids((b) => [...b, { price: r2(limit), qty }].sort((x, y) => y.price - x.price));
      else setAsks((a) => [...a, { price: r2(limit), qty }].sort((x, y) => x.price - y.price));
      toast({ kind: "success", title: "Limit order placed", body: `${tab === "buy" ? "Bid" : "Ask"} ${qty} @ ${usd(limit)} USDC · ${shortAddr(sig)}` });
    }
    setPhase("idle");
    setQty(1);
  };

  const cancel = (o: OpenOrder) => {
    setOrders((list) => list.filter((x) => x.id !== o.id));
    const drop = (levels: BookLevel[]) => {
      const i = levels.findIndex((l) => l.price === o.price && l.qty >= o.qty);
      return i < 0 ? levels : levels.map((l, k) => (k === i ? { ...l, qty: l.qty - o.qty } : l)).filter((l) => l.qty > 0);
    };
    if (o.side === "buy") setBids(drop);
    else setAsks(drop);
  };

  const pickLevel = (price: number, side: "buy" | "sell") => {
    setTab(side);
    setType("limit");
    setLimit(price);
  };

  const maxBook = Math.max(1, ...asks.slice(0, 8).map((a) => a.qty), ...bids.slice(0, 8).map((b) => b.qty));
  const cta =
    phase === "signing"
      ? "Approve in wallet…"
      : phase === "confirming"
        ? "Confirming on Solana…"
        : !app.walletConnected
          ? "Connect wallet"
          : tab === "mint"
            ? `Mint ${quote.n} Seat${quote.n === 1 ? "" : "s"}`
            : `${type === "limit" ? "Place " : ""}${tab === "buy" ? "Buy" : "Sell"} ${qty} ${token.symbol}`;

  return (
    /* phone: chart → trade panel → book/trades; desktop: chart + book left, panel column right */
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="min-w-0 rounded-xl border border-border bg-surface p-4 shadow-sm md:p-5 lg:col-start-1 lg:row-start-1">
        <SeatChart data={token.chart} />
      </section>

      <aside className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:h-fit">
        {/* trade panel */}
        <section className="rounded-xl border border-border bg-surface shadow-sm">
          <div className="grid grid-cols-3 gap-1 border-b border-border p-1.5" role="tablist" aria-label="Trade">
            {(["mint", "buy", "sell"] as const).map((k) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={tab === k}
                onClick={() => {
                  setTab(k);
                  setQty(1);
                  if (k === "mint") setType("market");
                }}
                className={cn(
                  "h-9 rounded-md text-[13.5px] font-semibold transition-colors",
                  tab === k
                    ? k === "sell"
                      ? "bg-[var(--down)] text-white"
                      : "bg-primary text-on-primary"
                    : "text-secondary hover:bg-bg-subtle hover:text-text",
                )}
              >
                {k === "mint" ? "Mint" : k === "buy" ? "Buy" : "Sell"}
              </button>
            ))}
          </div>

          <div className="space-y-4 p-4">
            {!token.tradable ? (
              <p className="rounded-lg bg-warning-soft p-3 text-[13px] text-warning">
                Trading halted — the strategy is paused. Current holders are refunded from escrow at settlement.
              </p>
            ) : null}

            {tab === "mint" ? (
              <div className="rounded-lg bg-bg-subtle p-3 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-secondary">Next Seat on the curve</span>
                  <span className="tnum font-semibold">{usd(curve)} USDC</span>
                </div>
                <div className="mt-1 flex justify-between">
                  <span className="text-secondary">Left to mint</span>
                  <span className="tnum font-semibold">
                    {left} / {token.supply}
                  </span>
                </div>
                <p className="mt-2 text-[12px] text-tertiary">Each Seat minted raises the curve price. USDC goes to the Epoch escrow on Solana.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1 rounded-lg bg-bg-muted p-1" role="radiogroup" aria-label="Order type">
                {(["market", "limit"] as const).map((o) => (
                  <button
                    key={o}
                    type="button"
                    role="radio"
                    aria-checked={type === o}
                    onClick={() => setType(o)}
                    className={cn("h-8 rounded-md text-[13px] font-semibold", type === o ? "bg-surface text-text shadow-sm" : "text-tertiary hover:text-text")}
                  >
                    {o === "market" ? "Market" : "Limit"}
                  </button>
                ))}
              </div>
            )}

            {tab !== "mint" && type === "limit" ? (
              <label className="block">
                <span className="mb-1.5 block text-[12.5px] font-medium text-secondary">Price (USDC per Seat)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0.01"
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value) || 0)}
                  className="tnum h-10 w-full rounded-md border border-transparent bg-bg-subtle px-3 font-mono text-[14px] outline-none focus:border-primary"
                />
              </label>
            ) : null}

            <div>
              <span className="mb-1.5 block text-[12.5px] font-medium text-secondary">Seats</span>
              <div className="flex items-center gap-2">
                <button type="button" aria-label="Fewer" onClick={() => setQty((q) => Math.max(1, q - 1))} className="inline-flex size-10 items-center justify-center rounded-md bg-bg-subtle hover:bg-bg-muted">
                  <Minus className="size-4" />
                </button>
                <div className="tnum flex h-10 flex-1 items-center justify-center rounded-md bg-bg-subtle font-mono text-[16px] font-semibold">{qty}</div>
                <button type="button" aria-label="More" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} className="inline-flex size-10 items-center justify-center rounded-md bg-bg-subtle hover:bg-bg-muted">
                  <Plus className="size-4" />
                </button>
              </div>
              <p className="mt-1.5 text-[12px] text-tertiary">
                1 Seat copies ${token.allocationUsd.toLocaleString("en-US")} of your capital · {token.daysLeft} days left in Epoch {token.epoch}
              </p>
            </div>

            <dl className="space-y-1.5 border-t border-border pt-3 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-secondary">{tab === "mint" ? "Avg price" : type === "market" ? "Est. avg price" : "Limit price"}</dt>
                <dd className="tnum font-mono">{usd(quote.avg)} USDC</dd>
              </div>
              {tab === "sell" ? (
                <>
                  <div className="flex justify-between">
                    <dt className="text-secondary">Royalty · trader 5%</dt>
                    <dd className="tnum font-mono text-secondary">−{usd(quote.total * ROYALTY.trader)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-secondary">Royalty · platform 2%</dt>
                    <dd className="tnum font-mono text-secondary">−{usd(quote.total * ROYALTY.platform)}</dd>
                  </div>
                </>
              ) : tab === "buy" ? (
                <div className="flex justify-between">
                  <dt className="text-secondary">Royalty (paid by seller)</dt>
                  <dd className="tnum font-mono text-secondary">7%</dd>
                </div>
              ) : (
                <div className="flex justify-between">
                  <dt className="text-secondary">Destination</dt>
                  <dd className="font-mono text-secondary">Epoch escrow</dd>
                </div>
              )}
              <div className="flex justify-between pt-1 text-[14px]">
                <dt className="font-semibold">{tab === "sell" ? "You receive" : "Total"}</dt>
                <dd className="tnum font-mono font-semibold">{usd(tab === "sell" ? quote.total - royalty : quote.total)} USDC</dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={submit}
              disabled={phase !== "idle" || (app.walletConnected && blocked)}
              className={cn(
                "inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg text-[14.5px] font-semibold text-white transition-colors disabled:opacity-50",
                tab === "sell" ? "bg-[var(--down)] hover:opacity-90" : "bg-primary hover:bg-primary-hover",
              )}
            >
              {phase !== "idle" ? <Loader2 className="size-4 animate-spin" /> : !app.walletConnected ? <Wallet className="size-4" /> : null}
              {cta}
            </button>
            <div className="flex justify-center">
              <SolanaBadge label={tab === "sell" ? "Settles in USDC on Solana" : "Pay with USDC on Solana"} />
            </div>
            {app.walletConnected && tab === "sell" && balance < qty ? <p className="text-center text-[12px] text-tertiary">You hold {balance} {token.symbol}.</p> : null}
            {app.walletConnected && type === "market" && tab !== "mint" && quote.n < qty ? (
              <p className="text-center text-[12px] text-tertiary">Not enough liquidity — try a limit order.</p>
            ) : null}
          </div>
        </section>

        {/* holdings */}
        <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <h2 className="flex items-center gap-2 text-[14px] font-semibold">
            <SeatIcon className="size-4 text-primary-text" strokeWidth={1.75} /> Your {token.symbol}
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-[13px]">
            <div>
              <dt className="text-tertiary">Balance</dt>
              <dd className="tnum mt-0.5 text-[18px] font-semibold">{balance} Seats</dd>
            </div>
            <div>
              <dt className="text-tertiary">Value at market</dt>
              <dd className="tnum mt-0.5 text-[18px] font-semibold">{usd(balance * token.marketPrice)}</dd>
            </div>
          </dl>
          {balance > 0 ? (
            <p className="mt-3 flex items-center gap-1.5 text-[12.5px] text-up">
              <Check className="size-3.5" /> Copying active · {(balance * token.allocationUsd).toLocaleString("en-US")} USD allocated
            </p>
          ) : (
            <p className="mt-3 text-[12.5px] text-tertiary">Hold a Seat to start copying this strategy.</p>
          )}
          {orders.length ? (
            <div className="mt-3 border-t border-border pt-3">
              <div className="mb-1.5 text-[12px] font-medium text-tertiary">Open orders</div>
              {orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between py-1 text-[13px]">
                  <span className={cn("tnum font-mono", o.side === "buy" ? "text-up" : "text-down")}>
                    {o.side === "buy" ? "Bid" : "Ask"} {o.qty} @ {o.price.toFixed(2)}
                  </span>
                  <button type="button" onClick={() => cancel(o)} aria-label="Cancel order" className="inline-flex size-7 items-center justify-center rounded-md text-tertiary hover:bg-bg-subtle hover:text-text">
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <OnchainCard token={token} />
      </aside>

      <div className="min-w-0 lg:col-start-1 lg:row-start-2">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* order book */}
          <section className="min-w-0 rounded-xl border border-border bg-surface shadow-sm">
            <h2 className="border-b border-border px-4 py-3 text-[14px] font-semibold">Order book</h2>
            {token.tradable ? (
              <div className="p-2 text-[12.5px]">
                <div className="grid grid-cols-3 px-2 pb-1 text-[11px] text-tertiary">
                  <span>Price (USDC)</span>
                  <span className="text-right">Seats</span>
                  <span className="text-right">Total</span>
                </div>
                {[...asks.slice(0, 8)].reverse().map((a, i) => (
                  <button
                    key={`a${i}-${a.price}`}
                    type="button"
                    onClick={() => pickLevel(a.price, "buy")}
                    className="relative grid w-full grid-cols-3 rounded px-2 py-[3px] text-left hover:bg-bg-subtle"
                  >
                    <span className="absolute inset-y-0 right-0 bg-[var(--down)] opacity-10" style={{ width: `${(a.qty / maxBook) * 100}%` }} />
                    <span className="tnum relative font-mono text-down">{a.price.toFixed(2)}</span>
                    <span className="tnum relative text-right font-mono">{a.qty}</span>
                    <span className="tnum relative text-right font-mono text-secondary">{usd(a.price * a.qty)}</span>
                  </button>
                ))}
                <div className="my-1 flex items-baseline justify-between border-y border-border px-2 py-2">
                  <span className="tnum font-mono text-[16px] font-semibold">{token.marketPrice.toFixed(2)}</span>
                  <span className="text-[11px] text-tertiary">Spread {(spread * 100).toFixed(2)}%</span>
                </div>
                {bids.slice(0, 8).map((b, i) => (
                  <button
                    key={`b${i}-${b.price}`}
                    type="button"
                    onClick={() => pickLevel(b.price, "sell")}
                    className="relative grid w-full grid-cols-3 rounded px-2 py-[3px] text-left hover:bg-bg-subtle"
                  >
                    <span className="absolute inset-y-0 right-0 bg-[var(--up)] opacity-10" style={{ width: `${(b.qty / maxBook) * 100}%` }} />
                    <span className="tnum relative font-mono text-up">{b.price.toFixed(2)}</span>
                    <span className="tnum relative text-right font-mono">{b.qty}</span>
                    <span className="tnum relative text-right font-mono text-secondary">{usd(b.price * b.qty)}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="flex items-center gap-2 p-4 text-[13px] text-secondary">
                <PauseCircle className="size-4 text-warning" /> Trading halted while the strategy is paused.
              </p>
            )}
          </section>

          {/* recent trades */}
          <section className="min-w-0 rounded-xl border border-border bg-surface shadow-sm">
            <h2 className="border-b border-border px-4 py-3 text-[14px] font-semibold">Recent trades</h2>
            <div className="scroll-thin max-h-[436px] overflow-y-auto p-2 text-[12.5px]">
              <div className="grid grid-cols-[56px_1fr_40px_1fr] gap-2 px-2 pb-1 text-[11px] text-tertiary">
                <span>Time</span>
                <span className="text-right">Price</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Tx</span>
              </div>
              {trades.slice(0, 40).map((t) => (
                <div key={t.id} className={cn("grid grid-cols-[56px_1fr_40px_1fr] items-center gap-2 rounded px-2 py-[3px]", t.wallet === "you" && "bg-primary-soft")}>
                  <span className="tnum font-mono text-tertiary">{time(t.at)}</span>
                  <span className={cn("tnum text-right font-mono", t.side === "buy" ? "text-up" : "text-down")}>
                    {t.kind === "mint" ? <span className="mr-1 rounded bg-bg-muted px-1 py-px font-sans text-[10px] font-semibold text-secondary">MINT</span> : null}
                    {t.price.toFixed(2)}
                  </span>
                  <span className="tnum text-right font-mono">{t.qty}</span>
                  <span className="truncate text-right font-mono text-[11px] text-tertiary" title={t.sig}>
                    {t.sig.slice(0, 4)}…{t.sig.slice(-4)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

    </div>
  );
}

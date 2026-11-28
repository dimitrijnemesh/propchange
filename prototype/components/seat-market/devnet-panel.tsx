"use client";
import { getWallets } from "@wallet-standard/app";
import type { Wallet, WalletAccount } from "@wallet-standard/base";
import { Connection, Transaction, clusterApiUrl } from "@solana/web3.js";
import { ArrowUpRight, Check, Coins, Loader2, RotateCcw, Wallet as WalletIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type State = { enabled: boolean; seatsLeft?: number; usdc?: number; seats?: number; config?: { seat: { symbol: string; mint: string; supply: number; priceUsdc: number }; usdcMint: string; escrow: string } };
type Busy = null | "connect" | "faucet" | "buy" | "refund";

const explorer = (kind: "tx" | "address", id: string) => `https://explorer.solana.com/${kind}/${id}?cluster=devnet`;
const short = (a: string) => `${a.slice(0, 4)}…${a.slice(-4)}`;

/** Phantom via Wallet Standard — picked by name, so other extensions that pretend to be Phantom are ignored. */
function findPhantom(): Wallet | undefined {
  return getWallets()
    .get()
    .find((w) => w.name === "Phantom" && "solana:signTransaction" in w.features);
}

/**
 * Real Solana devnet flow for one Seat (ALTCMOME-E9): connect Phantom, get test USDC, buy a Seat (pay dUSDC into
 * escrow, receive the Seat token in one transaction) and simulate a breach (return the Seat, get the dUSDC back).
 * Escrow pays every network fee, so the user needs no SOL. Devnet only — nothing here has real value.
 */
export function DevnetPanel() {
  const toast = useToast();
  const [state, setState] = useState<State | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [busy, setBusy] = useState<Busy>(null);
  const [lastTx, setLastTx] = useState<{ label: string; sig: string } | null>(null);
  const [hasPhantom, setHasPhantom] = useState(true);

  const refresh = useCallback(async (owner?: string) => {
    const r = await fetch(`/api/devnet${owner ? `?owner=${owner}` : ""}`, { cache: "no-store" });
    setState(await r.json());
  }, []);

  useEffect(() => {
    refresh();
    setHasPhantom(!!findPhantom());
  }, [refresh]);

  if (!state?.enabled || !state.config) return null;
  const cfg = state.config;
  const owner = account?.address;

  const connect = async () => {
    const w = findPhantom();
    if (!w) {
      setHasPhantom(false);
      return;
    }
    setBusy("connect");
    try {
      const res = await (w.features["standard:connect"] as { connect: () => Promise<{ accounts: readonly WalletAccount[] }> }).connect();
      const acc = res.accounts[0];
      setWallet(w);
      setAccount(acc);
      await refresh(acc.address);
    } catch {
      toast({ kind: "danger", title: "Wallet not connected" });
    } finally {
      setBusy(null);
    }
  };

  const disconnect = async () => {
    try {
      const f = wallet?.features["standard:disconnect"] as { disconnect?: () => Promise<void> } | undefined;
      await f?.disconnect?.();
    } catch {
      /* wallet may not support disconnect — we still forget it locally */
    }
    setWallet(null);
    setAccount(null);
    setLastTx(null);
    await refresh();
  };

  const signAndSend = async (b64: string) => {
    if (!wallet || !account) throw new Error("No wallet");
    const feature = wallet.features["solana:signTransaction"] as {
      signTransaction: (...i: { account: WalletAccount; transaction: Uint8Array; chain: string }[]) => Promise<{ signedTransaction: Uint8Array }[]>;
    };
    const [out] = await feature.signTransaction({ account, transaction: Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)), chain: "solana:devnet" });
    const conn = new Connection(clusterApiUrl("devnet"), "confirmed");
    const tx = Transaction.from(out.signedTransaction);
    const sig = await conn.sendRawTransaction(tx.serialize());
    await conn.confirmTransaction(sig, "confirmed");
    return sig;
  };

  const run = async (action: "faucet" | "buy" | "refund") => {
    if (!owner) return;
    setBusy(action);
    try {
      const r = await fetch("/api/devnet", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, owner }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Request failed");
      const sig: string = j.signature ?? (await signAndSend(j.transaction));
      const label = action === "faucet" ? "Got 100 test USDC" : action === "buy" ? `Bought 1 ${cfg.seat.symbol}` : `Refunded ${cfg.seat.priceUsdc} dUSDC`;
      setLastTx({ label, sig });
      toast({ kind: "success", title: label, body: `Confirmed on Solana devnet · ${short(sig)}` });
      await refresh(owner);
    } catch (e) {
      toast({ kind: "danger", title: "Transaction failed", body: e instanceof Error ? e.message.slice(0, 140) : undefined });
    } finally {
      setBusy(null);
    }
  };

  const steps = [
    { n: 1, done: !!owner, label: owner ? `Phantom · ${short(owner)}` : "Connect Phantom (Devnet)" },
    { n: 2, done: (state.usdc ?? 0) >= cfg.seat.priceUsdc || (state.seats ?? 0) > 0, label: "Get test USDC" },
    { n: 3, done: (state.seats ?? 0) > 0, label: `Buy 1 Seat · ${cfg.seat.priceUsdc} dUSDC` },
  ];

  return (
    <section className="rounded-[28px] bg-surface p-5 ring-1 ring-primary/40 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-[16px] font-semibold">
          <span className="live-dot" /> Live on Solana devnet
        </h2>
        <a href={explorer("address", cfg.seat.mint)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[12.5px] font-medium text-primary-text hover:underline">
          {cfg.seat.symbol} <ArrowUpRight className="size-3.5" />
        </a>
      </div>
      <p className="mt-1 text-[13px] text-secondary">A real Seat token. Test money only — we pay the network fees.</p>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="Seats left" value={`${state.seatsLeft ?? "—"} / ${cfg.seat.supply}`} />
        <Stat label="Your Seats" value={owner ? String(state.seats ?? 0) : "—"} />
        <Stat label="Your dUSDC" value={owner ? (state.usdc ?? 0).toFixed(2) : "—"} />
      </div>

      <ol className="mt-4 space-y-1.5">
        {steps.map((s) => (
          <li key={s.n} className="flex items-center gap-2.5 text-[13.5px]">
            <span className={cn("inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold", s.done ? "bg-[var(--up)] text-white" : "bg-bg-muted text-tertiary")}>
              {s.done ? <Check className="size-3" strokeWidth={3} /> : s.n}
            </span>
            <span className={s.done ? "text-text" : "text-secondary"}>{s.label}</span>
          </li>
        ))}
      </ol>

      <div className="mt-4 grid gap-2">
        {!owner ? (
          hasPhantom ? (
            <Action onClick={connect} busy={busy === "connect"} icon={<WalletIcon className="size-4" />} primary>
              Connect Phantom
            </Action>
          ) : (
            <a href="https://phantom.com/download" target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary text-[14px] font-semibold text-on-primary">
              Install Phantom <ArrowUpRight className="size-4" />
            </a>
          )
        ) : (
          <>
            <Action onClick={() => run("faucet")} busy={busy === "faucet"} disabled={!!busy} icon={<Coins className="size-4" />}>
              Get 100 test USDC
            </Action>
            <Action onClick={() => run("buy")} busy={busy === "buy"} disabled={!!busy || (state.usdc ?? 0) < cfg.seat.priceUsdc} icon={<WalletIcon className="size-4" />} primary>
              Buy 1 Seat · {cfg.seat.priceUsdc} dUSDC
            </Action>
            <Action onClick={() => run("refund")} busy={busy === "refund"} disabled={!!busy || !(state.seats ?? 0)} icon={<RotateCcw className="size-4" />}>
              Simulate breach → refund
            </Action>
          </>
        )}
      </div>

      {lastTx ? (
        <a href={explorer("tx", lastTx.sig)} target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-between rounded-xl bg-[var(--up)]/10 px-3 py-2 text-[12.5px] font-medium text-up">
          <span>✓ {lastTx.label}</span>
          <span className="inline-flex items-center gap-1">
            View on Explorer <ArrowUpRight className="size-3.5" />
          </span>
        </a>
      ) : null}
      {owner ? (
        <div className="mt-3 flex items-start justify-between gap-3">
          <p className="text-[11.5px] text-tertiary">Phantom → Settings → Developer settings → Testnet mode → Solana Devnet, to see the Seat in your wallet.</p>
          <button type="button" onClick={disconnect} className="shrink-0 rounded-full border border-border px-3 py-1 text-[12px] font-semibold text-secondary transition-colors hover:border-border-strong hover:text-text">
            Disconnect
          </button>
        </div>
      ) : null}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-bg-subtle px-2 py-2.5">
      <div className="text-[11px] text-tertiary">{label}</div>
      <div className="mt-0.5 text-[15px] font-semibold tracking-[-0.02em]">{value}</div>
    </div>
  );
}

function Action({ children, onClick, busy, disabled, icon, primary }: { children: React.ReactNode; onClick: () => void; busy?: boolean; disabled?: boolean; icon: React.ReactNode; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-full text-[14px] font-semibold transition-colors disabled:opacity-50",
        primary ? "bg-primary text-on-primary hover:bg-primary-hover" : "border border-border-strong hover:bg-bg-muted",
      )}
    >
      {busy ? <Loader2 className="size-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

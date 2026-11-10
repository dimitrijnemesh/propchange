import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Avatar } from "@/components/common";
import { SeatIcon } from "@/components/common/seat-icon";
import { SolanaBadge } from "@/components/common/solana-mark";
import { StateBadge } from "@/components/market/badges";
import { SeatTrading } from "@/components/seat-market/seat-trading";
import { fmtPct } from "@/lib/format";
import { getSeatToken } from "@/lib/mock-api";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getSeatToken(slug);
  if (!data) return { title: "Seat not found" };
  const t = data.token;
  return { title: `${t.symbol} · ${t.name} Seats`, description: `Trade ${t.name} Seats on Solana: ${t.marketPrice.toFixed(2)} USDC, ${t.minted}/${t.supply} minted.` };
}

const usd = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default async function SeatTokenPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getSeatToken(slug);
  if (!data) notFound();
  const { token: t, owned } = data;

  const stats = [
    { label: "Curve price", value: `${usd(t.curvePrice)}`, sub: `start ${usd(t.initialPrice)}` },
    { label: "24h volume", value: usd(t.volume24h), sub: "USDC" },
    { label: "Minted", value: `${t.minted} / ${t.supply}`, sub: `${t.supply - t.minted} left on curve` },
    { label: "Holders", value: t.holders.toLocaleString("en-US"), sub: "wallets" },
    { label: "Escrow", value: usd(t.escrowUsdc), sub: "USDC this Epoch" },
    { label: "Epoch ends", value: `${t.daysLeft}d`, sub: `Epoch ${t.epoch}` },
  ];


  return (
    <div className="container-market pt-5 md:pt-6">
      <Link href="/seats" className="inline-flex items-center gap-1 text-[13px] font-medium text-tertiary hover:text-text">
        <ArrowLeft className="size-3.5" /> Seat Market
      </Link>

      {/* ticker header */}
      <header className="mt-3 rounded-xl border border-border bg-surface p-4 shadow-sm md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-soft-text">
              <SeatIcon className="size-6" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-mono text-[22px] font-semibold tracking-tight md:text-[26px]">
                  {t.symbol}
                  <span className="text-tertiary">-E{t.epoch}</span>
                </h1>
                {t.state !== "active" ? <StateBadge state={t.state} /> : null}
                <span className="rounded-md bg-bg-muted px-2 py-0.5 text-[11.5px] font-medium text-secondary">USDC</span>
                <SolanaBadge label="Settled on Solana" variant="chip" />
              </div>
              <Link href={`/strategies/${t.slug}`} className="mt-0.5 flex items-center gap-1.5 text-[13px] text-secondary hover:text-text">
                <Avatar name={t.traderHandle} size={18} /> {t.name} · {t.traderHandle}
              </Link>
            </div>
          </div>
          <div className="text-right">
            <div className="tnum font-mono text-[28px] font-semibold leading-8 md:text-[32px]">{usd(t.marketPrice)}</div>
            <div className="mt-0.5 flex items-center justify-end gap-2 text-[13px]">
              <span className={cn("tnum font-semibold", t.change24h >= 0 ? "text-up" : "text-down")}>
                {t.change24h >= 0 ? "+" : ""}
                {fmtPct(t.change24h, { digits: 2 })}
              </span>
              <span className="text-tertiary">24h</span>
              <span className={cn("tnum rounded-md px-1.5 py-0.5 text-[11.5px] font-semibold", t.premium >= 0 ? "bg-up-soft text-up" : "bg-down-soft text-down")}>
                {t.premium >= 0 ? "+" : ""}
                {(t.premium * 100).toFixed(1)}% vs curve
              </span>
            </div>
          </div>
        </div>
        <dl className="scroll-thin -mx-4 mt-4 flex gap-6 overflow-x-auto border-t border-border px-4 pt-3 md:mx-0 md:grid md:grid-cols-6 md:gap-4 md:px-0">
          {stats.map((s) => (
            <div key={s.label} className="shrink-0">
              <dt className="text-[11.5px] text-tertiary">{s.label}</dt>
              <dd className="tnum mt-0.5 font-mono text-[15px] font-semibold">{s.value}</dd>
              <dd className="text-[11px] text-tertiary">{s.sub}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="mt-4">
        <SeatTrading token={t} owned={owned} />
      </div>
    </div>
  );
}

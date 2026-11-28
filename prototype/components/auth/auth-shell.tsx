import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Logo, LogoMark } from "@/components/layout/logo";

const POINTS = ["Copy verified traders in your own account", "Seat fee held in escrow on Solana", "Rules broken — your fee comes back"];

/**
 * Auth pages in the landing style: a blue brand panel (same blue + grid as the facts panel) with the 3D seat on
 * the left, the form card on the right. Phones get the form only.
 */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-[1100px] items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)]">
      <aside className="cta-banner relative hidden overflow-hidden rounded-[28px] p-10 text-white shadow-[0_30px_70px_-24px_rgba(59,99,255,0.6)] lg:flex lg:flex-col">
        <div aria-hidden className="cta-grid absolute inset-0" />
        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-2 font-display text-[20px] font-medium tracking-[-0.01em]">
            <LogoMark size={18} white />
            PropChange
          </Link>
          <h2 className="mt-10 text-[44px] font-semibold leading-[1.02] tracking-[-0.03em]">
            Take a Seat.
            <br />
            Copy. Earn.
          </h2>
          <ul className="mt-8 space-y-3">
            {POINTS.map((p) => (
              <li key={p} className="flex items-center gap-3 text-[15px] text-white/90">
                <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div aria-hidden className="relative mt-auto aspect-square w-[78%] self-end">
          <Image src="/brand/seat-3d.png" alt="" fill priority sizes="380px" className="hero-seat object-contain drop-shadow-[0_30px_40px_rgba(10,20,90,0.45)]" />
          <Image src="/brand/hero/coin.png" alt="" width={120} height={120} className="hero-item absolute -left-2 top-[12%] h-auto w-[20%]" style={{ animationDuration: "5.2s" }} />
          <Image src="/brand/hero/shield.png" alt="" width={120} height={120} className="hero-item absolute -right-2 top-[44%] h-auto w-[22%]" style={{ animationDelay: "-3s", animationDuration: "6.4s" }} />
        </div>
      </aside>

      <div className="flex flex-col items-center">
        <Logo className="mb-8 lg:hidden" />
        <div className="w-full rounded-[28px] bg-surface p-6 ring-1 ring-border md:p-9">
          <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.03em] md:text-[36px]">{title}</h1>
          <p className="mb-7 mt-2 text-[15px] text-secondary">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

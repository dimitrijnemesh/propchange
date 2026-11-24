import { ArrowRight, ArrowUpRight, ChevronRight, LifeBuoy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Small pill above a section title. */
export function Eyebrow({ children, live }: { children: React.ReactNode; live?: boolean }) {
  return (
    <div className="flex justify-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3.5 py-1.5 text-[12.5px] font-medium text-secondary backdrop-blur">
        {live ? <span className="live-dot" /> : <span className="size-1.5 rounded-full bg-primary" />}
        {children}
      </span>
    </div>
  );
}

/** Product facts, not traction numbers (we don't invent stats). */
const FACTS = [
  { img: "/brand/hero/shield.png", big: "100%", label: "Seat fee back if rules break" },
  { img: "/brand/seat-3d.png", big: "1 Seat = 1 token", label: "Settled in USDC on Solana" },
  { img: "/brand/hero/card.png", big: "0", label: "Withdrawal access to your funds" },
];

/** Three headline facts in one glowing panel, each with a 3D icon. */
export function FactsStrip() {
  return (
    <section aria-label="PropChange in numbers" className="container-market pb-6 pt-20 md:pt-28">
      <ul className="glow-border mx-auto grid max-w-[1140px] overflow-hidden rounded-[28px] bg-gradient-to-b from-surface to-bg md:grid-cols-3">
        {FACTS.map((f, i) => (
          <li key={f.big} className={cn("relative flex items-center gap-4 px-7 py-7 md:flex-col md:gap-3 md:py-10 md:text-center", i > 0 && "border-t border-border md:border-l md:border-t-0")}>
            <div className="relative size-14 shrink-0 md:size-20">
              <div className="hero-glow absolute inset-[-30%] rounded-full" />
              <Image src={f.img} alt="" fill sizes="80px" className="seat-shadow object-contain" />
            </div>
            <div>
              <div className="text-[24px] font-semibold tracking-[-0.03em] md:text-[32px]">{f.big}</div>
              <div className="mt-0.5 text-[14px] text-secondary">{f.label}</div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

const STEPS = [
  { img: "/brand/hero/chart.png", title: "Pick a verified trader", accent: "verified", tag: "Real history, rules from it" },
  { img: "/brand/hero/coin.png", title: "Take a limited Seat", accent: "Seat", tag: "Pay in USDC, held in escrow" },
  { img: "/brand/hero/shield.png", title: "Rules broken? Fee back", accent: "Fee back", tag: "Refund is automatic" },
];

function Accent({ text, accent }: { text: string; accent: string }) {
  const i = text.indexOf(accent);
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className="text-primary-text">{accent}</span>
      {text.slice(i + accent.length)}
    </>
  );
}

/** Three steps: 3D objects breaking out of each card, ghost step numbers, a dashed path between cards. */
export function HowItWorksCards() {
  return (
    <section aria-label="How it works" className="relative isolate overflow-hidden py-16 md:py-24">
      <div className="container-market">
        <Eyebrow>3 steps</Eyebrow>
        <h2 className="mt-4 text-center text-[28px] font-semibold tracking-[-0.03em] md:text-[40px]">How a Seat works</h2>
        <div className="relative mx-auto mt-16 grid max-w-[1140px] gap-x-5 gap-y-14 md:mt-24 md:grid-cols-3 md:gap-y-20">
          {/* dashed path behind the cards (desktop) */}
          <div aria-hidden className="absolute left-[16%] right-[16%] top-1/2 hidden border-t-2 border-dashed border-primary/30 md:block" />
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className="glow-border relative flex flex-col items-center overflow-visible rounded-[24px] bg-gradient-to-b from-surface to-bg px-6 pb-7 pt-16 text-center md:pb-9 md:pt-24"
            >
              <div className="absolute left-1/2 top-0 size-24 -translate-x-1/2 -translate-y-1/2 md:size-36">
                <div className="hero-glow absolute inset-[-20%] rounded-full" />
                <Image src={s.img} alt="" fill sizes="144px" className="hero-item seat-shadow object-contain" style={{ animationDelay: `${-i * 1.7}s` }} />
              </div>
              <span className="tnum mb-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-tertiary">Step {i + 1}</span>
              <h3 className="text-[19px] font-semibold tracking-[-0.02em] md:text-[22px]">
                <Accent text={s.title} accent={s.accent} />
              </h3>
              <span className="mt-3 rounded-full bg-primary-soft px-3 py-1 text-[13px] font-medium text-primary-text">{s.tag}</span>
              {i < STEPS.length - 1 ? (
                <span aria-hidden className="absolute -right-[18px] top-1/2 z-10 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-primary-text md:flex">
                  <ChevronRight className="size-4" />
                </span>
              ) : null}
            </div>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <Link href="/how-it-works" className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-8 text-[15px] font-semibold text-on-primary transition-colors hover:bg-primary-hover">
            See how it works <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Big blue call-to-action banner with the 3D seat. */
export function CtaBanner({ loggedIn }: { loggedIn: boolean }) {
  return (
    <section aria-label="Get started" className="container-market py-10 md:py-16">
      <div className="cta-banner relative mx-auto max-w-[1140px] overflow-hidden rounded-[32px] px-7 py-10 text-white md:px-14 md:py-14">
        <div aria-hidden className="cta-grid absolute inset-0" />
        <div className="relative grid items-center gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <h2 className="text-[30px] font-semibold leading-[1.08] tracking-[-0.03em] md:text-[44px]">
              Ready to take
              <br />a Seat?
            </h2>
            <p className="mt-4 max-w-[420px] text-[16px] text-white/80">Pick a trader with real rules. If the rules break, your fee comes back.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={loggedIn ? "/strategies" : "/signup"}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-[15px] font-semibold text-[#2848e6] transition-colors hover:bg-blue-50"
              >
                {loggedIn ? "Explore strategies" : "Create account"} <ArrowRight className="size-4" />
              </Link>
              <Link href="/seats" className="inline-flex h-12 items-center rounded-full border border-white/40 px-7 text-[15px] font-semibold text-white transition-colors hover:bg-white/10">
                Open Seat market
              </Link>
            </div>
          </div>
          <div aria-hidden className="relative mx-auto hidden aspect-square w-[300px] md:block">
            <Image src="/brand/seat-3d.png" alt="" fill sizes="300px" className="hero-seat object-contain drop-shadow-[0_30px_40px_rgba(10,20,90,0.45)]" />
            <Image src="/brand/hero/coin.png" alt="" width={120} height={120} className="hero-item absolute -left-6 top-[10%] h-auto w-[24%]" style={{ animationDuration: "5.2s" }} />
            <Image src="/brand/hero/shield.png" alt="" width={120} height={120} className="hero-item absolute -right-4 top-[42%] h-auto w-[24%]" style={{ animationDelay: "-3s", animationDuration: "6.4s" }} />
          </div>
        </div>
      </div>
    </section>
  );
}

/** FAQ in two columns: heading + support on the left, the questions on the right. */
export function FaqSection({ title, viewAll, children }: { title: string; viewAll: string; children: React.ReactNode }) {
  return (
    <section aria-label={title} className="relative isolate overflow-hidden pb-20 pt-10 md:pt-16">
      <div className="container-market">
        <div className="mx-auto grid max-w-[1140px] gap-8 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] md:gap-14">
          <div>
            <h2 className="text-[28px] font-semibold tracking-[-0.03em] md:text-[40px]">{title}</h2>
            <p className="mt-3 max-w-[320px] text-[15px] text-secondary">Short answers about Seats, escrow and refunds.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/faq" className="inline-flex h-11 items-center gap-1.5 rounded-full border border-border-strong px-5 text-[14px] font-semibold transition-colors hover:bg-bg-muted">
                {viewAll} <ArrowUpRight className="size-4" />
              </Link>
              <Link href="/support" className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-[14px] font-semibold text-primary-text transition-colors hover:bg-primary-soft">
                <LifeBuoy className="size-4" /> Support
              </Link>
            </div>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </section>
  );
}

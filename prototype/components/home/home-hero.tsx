"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/components/layout/providers";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Google = () => (
  <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);
const Apple = () => (
  <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden>
    <path d="M16.4 12.6c0-2.5 2-3.6 2.1-3.7-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.8-1.7 0-3.3 1-4.1 2.5-1.8 3.1-.5 7.6 1.3 10.1.8 1.2 1.8 2.6 3.1 2.5 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.4-.9-2.4-3.3zM14 5.1c.7-.8 1.1-1.9 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4z" />
  </svg>
);

/**
 * Landing header, exchange-style: headline + one short line on the left, artwork in its own
 * column on the right. Logged out → email sign-up (plus Google / Apple); logged in → go trade.
 * Fills the first screen down to the status-bar ticker.
 */
export function HomeHero({ initialLoggedIn }: { initialLoggedIn: boolean }) {
  const app = useApp();
  const router = useRouter();
  const ref = useRef<HTMLElement>(null);
  const [email, setEmail] = useState("");
  const loggedIn = app.loggedIn || initialLoggedIn;

  // height = viewport minus everything above the hero and the fixed ticker below it
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      const bar = document.querySelector<HTMLElement>(".status-bar");
      const barH = bar && getComputedStyle(bar).display !== "none" ? bar.offsetHeight : 0;
      el.style.setProperty("--home-hero-offset", `${top + barH}px`);
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return (
    <section ref={ref} className="home-hero relative flex items-center overflow-hidden border-b border-border">
      {/* phones/tablets: flat faded grid; desktop keeps only the perspective grid at the bottom of the stage */}
      <div aria-hidden className="hero-bg-grid pointer-events-none absolute inset-0 lg:hidden" />
      <HeroStage />
      <div className="relative mx-auto flex w-full max-w-[1320px] flex-col items-start gap-2 px-6 py-10 sm:flex-row sm:items-center sm:gap-4 md:gap-6 md:px-12 lg:px-20 lg:py-0">
          {/* phone: the seat sits above the headline; tablet: right next to it (the big side stage is desktop-only) */}
          <div aria-hidden className="relative hidden aspect-square shrink-0 sm:order-last sm:block sm:w-[min(340px,40vw)] lg:hidden">
            <div className="hero-glow absolute inset-[-15%]" />
            <Image src="/brand/seat-3d.png" alt="" fill priority sizes="300px" className="hero-seat seat-shadow object-contain" />
            <Image src="/brand/hero/coin.png" alt="" width={160} height={160} className="hero-item absolute left-[0%] top-[12%] h-auto w-[22%]" style={{ animationDuration: "5.2s" }} />
            <Image src="/brand/hero/shield.png" alt="" width={160} height={160} className="hero-item absolute right-[0%] top-[30%] h-auto w-[24%]" style={{ animationDelay: "-3s", animationDuration: "6.4s" }} />
          </div>
        <div className="relative w-full max-w-[540px] sm:min-w-0 sm:flex-1">
          {/* phone: space on top for a big seat on the right; the headline tucks in beside its lower half */}
          <div aria-hidden className="pointer-events-none relative -mb-12 -mr-8 -mt-8 ml-auto aspect-square w-[min(250px,66vw)] sm:hidden">
            <div className="hero-glow absolute inset-[-20%]" />
            <Image src="/brand/seat-3d.png" alt="" fill priority sizes="250px" className="hero-seat seat-shadow object-contain" />
            {/* small 3D items fill the empty space left of the seat and by its legs */}
            <Image src="/brand/hero/card.png" alt="" width={120} height={120} className="hero-item absolute left-[-46%] top-[2%] h-auto w-[22%]" style={{ animationDelay: "-4.2s", animationDuration: "7s" }} />
            <Image src="/brand/hero/coin.png" alt="" width={120} height={120} className="hero-item absolute left-[-26%] top-[38%] h-auto w-[20%]" style={{ animationDelay: "-1.2s", animationDuration: "5.2s" }} />
            <Image src="/brand/hero/shield.png" alt="" width={120} height={120} className="hero-item absolute right-[10%] top-[72%] h-auto w-[20%]" style={{ animationDelay: "-3s", animationDuration: "6.4s" }} />
          </div>
          <h1 className="relative text-[36px] font-semibold min-[400px]:text-[40px] leading-[1.05] tracking-[-0.035em] md:text-[60px]">
            Take a Seat.
            <br />
            <span className="text-primary-text">Copy. Earn.</span>
          </h1>
          <p className="relative mt-5 text-[17px] leading-7 text-secondary">Copy verified traders in your own account. Rules broken? Your fee comes back.</p>

          {loggedIn ? (
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/strategies" className={buttonVariants({ size: "lg" })}>
                Explore strategies
              </Link>
              <Link href="/app" className={buttonVariants({ size: "lg", variant: "outline" })}>
                My portfolio
              </Link>
            </div>
          ) : (
            <>
              <form
                className="mt-8 flex max-w-[480px] flex-col gap-3 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  router.push(`/signup${email ? `?email=${encodeURIComponent(email)}` : ""}`);
                }}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  aria-label="Email"
                  className="h-12 w-full min-w-0 shrink-0 rounded-md border sm:w-auto sm:flex-1 border-border-strong bg-transparent px-4 text-[15px] text-text outline-none transition-colors placeholder:text-tertiary hover:border-text/40 focus:border-primary"
                />
                <button type="submit" className={cn(buttonVariants({ size: "lg" }), "h-12 px-7 text-[15px]")}>
                  Sign up
                </button>
              </form>
              <div className="mt-5 flex items-center gap-3">
                <span className="text-caption text-tertiary">Or continue with</span>
                {[
                  { label: "Google", I: Google },
                  { label: "Apple", I: Apple },
                ].map(({ label, I }) => (
                  <Link
                    key={label}
                    href="/signup"
                    aria-label={`Continue with ${label}`}
                    className="inline-flex size-11 items-center justify-center rounded-md border border-border-strong text-text transition-colors hover:bg-bg-muted"
                  >
                    <I />
                  </Link>
                ))}
              </div>
              <p className="mt-6 text-[14px] text-secondary">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-primary-text hover:underline">
                  Log in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

const ITEMS = [
  { src: "/brand/hero/coin.png", cls: "left-[4%] top-[14%] w-[22%]", delay: "-1.2s", dur: "5.2s" },
  { src: "/brand/hero/shield.png", cls: "right-[2%] top-[30%] w-[24%]", delay: "-3s", dur: "6.4s" },
  { src: "/brand/hero/chart.png", cls: "left-[0%] bottom-[14%] w-[24%]", delay: "-2.1s", dur: "5.8s" },
  { src: "/brand/hero/card.png", cls: "right-[10%] top-[2%] w-[18%]", delay: "-4.2s", dur: "7s" },
];

/** Right-hand stage: blue glow + perspective grid, the 3D seat, and small 3D items floating around it. */
function HeroStage() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 hidden w-[54vw] max-w-[900px] lg:block"
      style={{ right: "max(0%, calc((100vw - 1440px) / 2))" }}
    >
      <div className="hero-glow absolute inset-0" />
      <div className="hero-grid absolute inset-x-[-10%] bottom-0 h-[58%]" />
      <div className="absolute left-1/2 top-1/2 aspect-square w-[min(470px,33vw)] -translate-x-1/2 -translate-y-1/2">
        <Image src="/brand/seat-3d.png" alt="" fill priority sizes="470px" className="hero-seat seat-shadow object-contain" />
        {ITEMS.map((it) => (
          <Image
            key={it.src}
            src={it.src}
            alt=""
            width={320}
            height={320}
            className={`hero-item absolute h-auto ${it.cls}`}
            style={{ animationDelay: it.delay, animationDuration: it.dur }}
          />
        ))}
      </div>
    </div>
  );
}

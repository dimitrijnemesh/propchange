"use client";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

const PRODUCTS = [
  { href: "/seats", title: "Seat market", body: "Buy and sell limited Seats." },
  { href: "/strategies", title: "Verified strategies", body: "Real history and kept contracts." },
  { href: "/seats/alt-momentum-x", title: "Seat trading", body: "Mint, trade and settle in USDC." },
  { href: "/app", title: "Escrow & refunds", body: "Rules broken — your fee comes back." },
];

/**
 * BingX-style "Explore our products" list: full-width rows split by hairlines. Hovering a row flips it to a solid
 * band (square corners) (solid brand blue).
 */
export function ProductRows() {
  const [active, setActive] = useState<number | null>(null);
  return (
    <section aria-label="Our products" className="py-16 md:py-24">
      <div className="container-market">
        <h2 data-reveal className="mx-auto max-w-[1140px] text-[36px] leading-[1.02] font-semibold tracking-[-0.03em] md:text-[56px]">
          Explore PropChange
        </h2>
      </div>
      <div
        className="relative mt-10 border-t border-border"
        onMouseLeave={() => setActive(null)}
      >
        {PRODUCTS.map((p, i) => (
          <Link
            key={p.href}
            href={p.href}
            prefetch={false}
            data-reveal={String(i + 1)}
            onMouseEnter={() => setActive(i)}
            className={cn(
              "group relative block border-b border-border transition-colors duration-300",
              active === i ? "border-transparent bg-[#3b63ff] text-white" : "bg-transparent",
            )}
          >
            {/* white "loading" stripe running along the bottom of the hovered row */}
            <div className="container-market">
              <div className="relative mx-auto flex max-w-[1140px] items-center gap-6 py-10 md:py-14">
                {/* thin white stripe under the row, from the title to the arrow, like a loading underline */}
                {active === i ? <span aria-hidden className="row-loader absolute bottom-6 left-0 h-[1.5px] bg-white md:bottom-8" /> : null}
                <div className="min-w-0 flex-1">
                  <h3 className="text-[24px] font-bold tracking-[-0.03em] md:text-[34px]">{p.title}</h3>
                  {/* description only on hover: the row grows open */}
                  <div className={cn("grid transition-[grid-template-rows,opacity] duration-300", active === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                    <p className="overflow-hidden pt-2.5 text-[15px] font-medium text-white/85">{p.body}</p>
                  </div>
                </div>
                <ArrowUpRight className={cn("size-7 shrink-0 transition-transform duration-300", active === i && "-translate-y-1 translate-x-1")} strokeWidth={1.5} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

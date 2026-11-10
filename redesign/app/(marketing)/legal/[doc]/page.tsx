import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";

const DOCS = {
  terms: {
    title: "Terms of Service",
    sections: [
      ["The service", "PropChange provides software that copies orders from a strategy into accounts you control, enforces Seat Contracts and settles Seat Fees through an escrow program."],
      ["Your account and keys", "You are responsible for the exchange or broker accounts you connect. Only trade-only keys are accepted; you may revoke them at any time."],
      ["Seats and Epochs", "A Seat grants copying rights for one 30-day Epoch at the price shown at purchase. Fees are escrowed and settled according to the Seat Contract outcome."],
      ["No advice", "Strategies are published by independent traders. Nothing on PropChange is investment advice, and past performance does not guarantee future results."],
    ],
  },
  privacy: {
    title: "Privacy Policy",
    sections: [
      ["What we collect", "Account details, wallet address, connected-venue metadata and usage analytics. API secrets are encrypted and never used for analytics."],
      ["How we use it", "To operate copying, enforce risk limits, settle Epochs, prevent abuse and improve the product."],
      ["Sharing", "We do not sell personal data. Processors (hosting, email) act under contract and only on our instructions."],
      ["Your rights", "You can export or delete your data from Settings, subject to records we must keep for settlement and legal obligations."],
    ],
  },
  risk: {
    title: "Risk Disclosure",
    sections: [
      ["Trading risk", "Trading crypto, forex, stocks and futures involves substantial risk of loss. Leverage magnifies both gains and losses."],
      ["Seat Contracts limit behaviour, not outcomes", "A kept contract means the trader stayed within limits — it does not mean the Epoch was profitable."],
      ["Execution differences", "Copied fills can differ from the trader's fills because of latency, liquidity, fees and account size."],
      ["Venue and technology risk", "Exchanges, brokers, blockchains and our own systems can fail or be unavailable. Never risk money you cannot afford to lose."],
    ],
  },
} as const;
type Doc = keyof typeof DOCS;

export function generateStaticParams() {
  return Object.keys(DOCS).map((doc) => ({ doc }));
}

export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }): Promise<Metadata> {
  const { doc } = await params;
  return { title: DOCS[doc as Doc]?.title ?? "Legal" };
}

export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  const d = DOCS[doc as Doc];
  if (!d) notFound();
  return (
    <div className="container-market">
      <PageHeader crumbs={[{ label: "Home", href: "/" }, { label: "Legal" }, { label: d.title }]} title={d.title} description="Last updated October 1, 2026" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Legal documents" className="flex gap-1 overflow-x-auto lg:sticky lg:top-24 lg:h-fit lg:flex-col">
          {(Object.keys(DOCS) as Doc[]).map((k) => (
            <Link
              key={k}
              href={`/legal/${k}`}
              aria-current={k === doc ? "page" : undefined}
              className={cn(
                "flex h-9 shrink-0 items-center rounded-md px-3 text-[14px] font-medium",
                k === doc ? "bg-primary-soft text-primary-soft-text" : "text-secondary hover:bg-bg-subtle hover:text-text",
              )}
            >
              {DOCS[k].title}
            </Link>
          ))}
        </nav>
        <article className="max-w-[760px]">
          <p className="mb-6 rounded-lg border border-dashed border-border-strong p-3 text-[13px] text-tertiary">
            Prototype placeholder — a plain-language summary, not the final legal text.
          </p>
          {d.sections.map(([h, body], i) => (
            <section key={h} className="mb-6">
              <h2 className="text-[18px] font-semibold">
                {i + 1}. {h}
              </h2>
              <p className="mt-1.5 text-[15px] leading-7 text-secondary">{body}</p>
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, LifeBuoy, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FaqBrowser } from "@/components/marketing/faq-browser";
import { faq } from "@/mock/faq";

export const metadata: Metadata = { title: "FAQ", description: "Answers about Seats, fees, Seat Contracts, custody and listing a strategy." };

export default function FaqPage() {
  return (
    <div className="container-market">
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "FAQ" }]}
        title="Frequently asked questions"
        description={
          <>
            Everything about Seats, fees, Seat Contracts, analytics and custody. Still stuck?{" "}
            <Link href="/support#contact" className="font-semibold text-primary-text hover:underline">
              Contact support
            </Link>
            .
          </>
        }
      />
      <FaqBrowser data={faq} />

      <section className="mt-12 rounded-xl border border-border bg-surface p-5 shadow-sm md:p-6">
        <h2 className="text-[18px] font-semibold">Still have questions?</h2>
        <p className="mt-1 text-[14px] text-secondary">Our team and community usually answer within minutes.</p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { href: "/support#contact", icon: LifeBuoy, title: "Contact support", body: "Live chat 24/7 or email" },
            { href: "/community", icon: Users, title: "Ask the community", body: "X and Instagram" },
            { href: "/glossary", icon: BookOpen, title: "Read the glossary", body: "Every term in plain language" },
          ].map((c) => (
            <Link key={c.href} href={c.href} className="flex items-center gap-3 rounded-lg bg-bg-subtle p-3 transition-colors hover:bg-bg-muted">
              <c.icon className="size-5 shrink-0 text-primary-text" strokeWidth={1.75} />
              <div className="min-w-0">
                <div className="text-[14px] font-semibold">{c.title}</div>
                <div className="truncate text-[12.5px] text-tertiary">{c.body}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

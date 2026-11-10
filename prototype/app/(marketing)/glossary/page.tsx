import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { GlossaryList } from "@/components/marketing/glossary-list";
import { glossary } from "@/mock/glossary";

export const metadata: Metadata = { title: "Glossary", description: "Terms used on PropChange: Seats, Capacity, Seat Contracts, Epochs and more." };

export default function GlossaryPage() {
  return (
    <div className="container-marketing max-w-[920px]">
      <PageHeader crumbs={[{ label: "Home", href: "/" }, { label: "Glossary" }]} title="Glossary" description="Every term used in PropChange, in plain language." />
      <GlossaryList items={glossary} />
    </div>
  );
}

import type { Metadata } from "next";
import { CreateStrategy } from "@/components/app/create-strategy";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Create strategy" };

export default function CreatePage() {
  return (
    <>
      <PageHeader title="Create strategy" description="Connect a dedicated account, review your generated Seat Contract and open Seats." />
      <CreateStrategy />
    </>
  );
}

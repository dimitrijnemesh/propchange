import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { Connections } from "@/components/app/connections";
import { PageHeader } from "@/components/layout/page-header";
import { getAccounts } from "@/lib/mock-api";

export const metadata: Metadata = { title: "Connections" };

export default async function ConnectionsPage() {
  const accounts = await getAccounts();
  return (
    <>
      <PageHeader title="Connections" description="Exchange and broker accounts that receive copied orders." />
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Connections initial={accounts} />
        <aside className="h-fit rounded-lg bg-bg-subtle p-5">
          <ShieldCheck className="size-6 text-primary-text" strokeWidth={1.75} />
          <h2 className="text-h3 mt-3">How we handle keys</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-secondary">
            <li>Keys with withdrawal permission are rejected — checked on connect and periodically.</li>
            <li>Restrict keys to PropChange execution IPs where your venue supports it.</li>
            <li>Keys are envelope-encrypted and only decrypted inside the isolated execution service.</li>
            <li>Keys never reach the browser, logs or analytics.</li>
          </ul>
        </aside>
      </div>
    </>
  );
}

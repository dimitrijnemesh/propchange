import type { Metadata } from "next";
import { ActivityLog } from "@/components/app/activity-log";
import { PageHeader } from "@/components/layout/page-header";
import { getRiskLog } from "@/lib/mock-api";

export const metadata: Metadata = { title: "Activity" };

export default async function ActivityPage() {
  const log = await getRiskLog(40);
  return (
    <>
      <PageHeader title="Activity" description="Every action the Risk Engine took on your accounts — scaling, stops, pauses and rejections." />
      <ActivityLog entries={log} />
    </>
  );
}

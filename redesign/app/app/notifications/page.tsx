import type { Metadata } from "next";
import { NotificationList } from "@/components/app/notification-list";
import { PageHeader } from "@/components/layout/page-header";
import { getNotifications } from "@/lib/mock-api";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const items = await getNotifications();
  return (
    <>
      <PageHeader title="Notifications" description="Settlements, breaches, Risk Engine actions and account alerts." />
      <NotificationList items={items} />
    </>
  );
}

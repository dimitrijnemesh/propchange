import { navNotifications } from "@/lib/search-index";
import { AppSidebar } from "./app-sidebar";
import { RequireAuth } from "./providers";
import { TopNav } from "./top-nav";

export function AppShell({ role, children }: { role: "follower" | "trader" | "settings"; children: React.ReactNode }) {
  return (
    <>
      <TopNav notifications={navNotifications()} compact />
      <div className="flex">
        <AppSidebar role={role} />
        <main id="main" className="min-w-0 flex-1 px-4 pb-24 md:px-6 md:pb-12 lg:px-8">
          <div className="mx-auto max-w-[1280px]">
            <RequireAuth>{children}</RequireAuth>
          </div>
        </main>
      </div>
    </>
  );
}

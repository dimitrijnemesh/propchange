import { navNotifications, tickerItems } from "@/lib/search-index";
import { Footer } from "./footer";
import { MobileTabBar } from "./mobile-tab-bar";
import { StatusBar } from "./status-bar";
import { TopNav } from "./top-nav";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="has-status-bar">
      <TopNav notifications={navNotifications()} />
      <main id="main">{children}</main>
      <Footer />
      <StatusBar items={tickerItems()} />
      <MobileTabBar />
    </div>
  );
}

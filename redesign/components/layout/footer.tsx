import Link from "next/link";
import { SocialLinks } from "@/components/common/social-links";
import { SolanaBadge } from "@/components/common/solana-mark";
import { getT } from "@/lib/i18n/server";
import { SITE_NAV } from "@/lib/site-nav";
import { LanguageSwitcher } from "./language-switcher";
import { LogoMark } from "./logo";
import { ThemeToggle } from "./theme-toggle";

export async function Footer() {
  const t = await getT();
  return (
    <footer className="mt-20 border-t border-border bg-bg-subtle">
      <div className="container-market grid grid-cols-2 gap-8 py-12 md:grid-cols-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(5,minmax(0,1fr))]">
        {/* Community (Binance-style: socials first) */}
        <div className="col-span-2 md:col-span-3 lg:col-span-1">
          <h4 className="text-[15px] font-semibold text-text">{t("menu.community")}</h4>
          <SocialLinks className="mt-4 max-w-[220px]" />
          <Link href="/community" className="mt-4 inline-block text-[13px] font-semibold text-primary-text hover:underline">
            {t("menu.communityHub")} →
          </Link>
        </div>
        {SITE_NAV.map((c) => (
          <div key={c.title}>
            <h4 className="text-[15px] font-semibold text-text">{t(c.title)}</h4>
            <ul className="mt-4 space-y-2.5">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[14px] text-secondary transition-colors hover:text-text">
                    {t(l.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="container-market flex flex-col gap-4 py-6 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <LogoMark size={16} />
            <span className="text-caption text-secondary">© 2026 PropChange</span>
            <SolanaBadge label="Built on Solana" variant="chip" />
            <ThemeToggle />
            <LanguageSwitcher full />
          </div>
          <p className="text-caption text-tertiary md:ml-auto md:max-w-[640px] md:text-right">{t("footer.disclaimer")}</p>
        </div>
      </div>
    </footer>
  );
}

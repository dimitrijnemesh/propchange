import { resolve4, resolve6, resolveMx } from "node:dns/promises";

/** Common disposable / throwaway email domains. */
const DISPOSABLE = new Set([
  "10minutemail.com", "10minutemail.net", "20minutemail.com", "33mail.com", "anonaddy.me", "burnermail.io",
  "byom.de", "dispostable.com", "discard.email", "dropmail.me", "emailondeck.com", "emailfake.com",
  "fakeinbox.com", "fakemail.net", "getairmail.com", "getnada.com", "guerrillamail.biz", "guerrillamail.com",
  "guerrillamail.de", "guerrillamail.info", "guerrillamail.net", "guerrillamail.org", "guerrillamailblock.com",
  "grr.la", "harakirimail.com", "inboxkitten.com", "incognitomail.org", "jetable.org", "mail.tm", "mail7.io",
  "maildrop.cc", "mailcatch.com", "mailinator.com", "mailinator.net", "mailinator2.com", "mailnesia.com",
  "mailpoof.com", "mintemail.com", "moakt.com", "mohmal.com", "mvrht.com", "my10minutemail.com", "mytemp.email",
  "nada.email", "nowmymail.com", "throwawaymail.com", "temp-mail.io", "temp-mail.org", "tempail.com",
  "tempinbox.com", "tempmail.com", "tempmail.dev", "tempmail.net", "tempmailo.com", "tempr.email", "tmail.ws",
  "tmpmail.net", "tmpmail.org", "trashmail.com", "trashmail.de", "trashmail.io", "trashmail.net", "yopmail.com",
  "yopmail.fr", "yopmail.net", "sharklasers.com", "spam4.me", "spamgourmet.com", "spambox.us", "mailsac.com",
  "mail-temp.com", "emailtemporanea.net", "fexpost.com", "fexbox.org", "linshiyouxiang.net", "luxusmail.org",
  "minuteinbox.com", "owlymail.com", "rootfest.net", "smailpro.com", "tempmailaddress.com", "vomoto.com",
  "wegwerfmail.de", "wegwerfmail.net", "zetmail.com", "cock.li", "crazymailing.com", "dayrep.com", "einrot.com",
  "fleckens.hu", "gustr.com", "jourrapide.com", "rhyta.com", "superrito.com", "teleworm.us", "armyspy.com",
  "cuvox.de", "mailforspam.com", "spamfree24.org", "tempemail.co", "tempmail.plus", "1secmail.com",
  "1secmail.net", "1secmail.org", "emltmp.com", "kzccv.com", "qiott.com", "wuuvo.com", "xojxe.com", "laafd.com",
]);

export function isDisposable(domain: string) {
  const d = domain.toLowerCase();
  if (DISPOSABLE.has(d)) return true;
  // subdomains of known throwaway services (e.g. abc.mailinator.com)
  return [...DISPOSABLE].some((x) => d.endsWith(`.${x}`));
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | "timeout"> {
  return Promise.race([p, new Promise<"timeout">((r) => setTimeout(() => r("timeout"), ms))]);
}

const cache = new Map<string, { ok: boolean; t: number }>();

/**
 * Does the domain accept email? True if it has MX records (or, per RFC 5321, an A/AAAA record).
 * Fails open: on DNS timeouts or errors other than "domain not found" it returns true,
 * so a slow DNS never blocks a real person.
 */
export async function domainAcceptsMail(domain: string): Promise<boolean> {
  const d = domain.toLowerCase();
  const hit = cache.get(d);
  if (hit && Date.now() - hit.t < 6 * 3600_000) return hit.ok;

  let ok = true;
  try {
    const mx = await withTimeout(resolveMx(d), 2500);
    if (mx === "timeout") ok = true;
    else if (mx.some((r) => r.exchange && r.exchange !== ".")) ok = true;
    else ok = false; // null MX (".") = domain explicitly receives no mail
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "ENOTFOUND" || code === "ENODATA") {
      // No MX: fall back to an address record.
      const [a, aaaa] = await Promise.all([
        withTimeout(resolve4(d), 2000).catch(() => [] as string[]),
        withTimeout(resolve6(d), 2000).catch(() => [] as string[]),
      ]);
      ok = a === "timeout" || aaaa === "timeout" || (Array.isArray(a) && a.length > 0) || (Array.isArray(aaaa) && aaaa.length > 0);
    } else {
      ok = true; // other DNS failures: do not block
    }
  }
  cache.set(d, { ok, t: Date.now() });
  return ok;
}

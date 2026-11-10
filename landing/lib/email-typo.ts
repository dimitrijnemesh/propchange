/** "Did you mean …?" for common email domain typos (gmial.com → gmail.com). Runs in the browser. */

const DOMAINS = [
  "gmail.com", "googlemail.com", "yahoo.com", "outlook.com", "hotmail.com", "live.com", "icloud.com", "me.com",
  "aol.com", "proton.me", "protonmail.com", "mail.com", "gmx.com", "gmx.de", "gmx.net", "web.de", "ukr.net",
  "i.ua", "meta.ua", "yahoo.co.uk", "hotmail.co.uk", "outlook.de", "orange.fr", "free.fr", "wp.pl", "o2.pl",
  "onet.pl", "interia.pl", "libero.it", "qq.com", "163.com", "naver.com", "daum.net", "yahoo.co.jp", "rediffmail.com",
];

const TLD_FIX: Record<string, string> = { con: "com", cpm: "com", cmo: "com", ocm: "com", vom: "com", xom: "com", comm: "com", co: "com", nett: "net", ner: "net", ogr: "org" };

function distance(a: string, b: string) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
    }
  return dp[m][n];
}

/** Returns a corrected email, or null if the domain looks fine. */
export function suggestEmail(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at < 1) return null;
  const local = email.slice(0, at);
  let domain = email.slice(at + 1).trim().toLowerCase();
  if (!domain.includes(".")) return null;
  if (DOMAINS.includes(domain)) return null;

  const parts = domain.split(".");
  const tld = parts[parts.length - 1];
  if (TLD_FIX[tld] && !(tld === "co" && parts.length > 2)) {
    parts[parts.length - 1] = TLD_FIX[tld];
    domain = parts.join(".");
    if (DOMAINS.includes(domain)) return `${local}@${domain}`;
  }

  let best: string | null = null;
  let bestD = Infinity;
  for (const d of DOMAINS) {
    const dist = distance(domain, d);
    if (dist < bestD) {
      bestD = dist;
      best = d;
    }
  }
  // Short domains (i.ua) need an exact-ish match; longer ones allow 1–2 typos.
  const limit = domain.length <= 6 ? 1 : 2;
  if (best && bestD > 0 && bestD <= limit) return `${local}@${best}`;
  if (domain !== email.slice(at + 1).trim().toLowerCase()) return `${local}@${domain}`;
  return null;
}

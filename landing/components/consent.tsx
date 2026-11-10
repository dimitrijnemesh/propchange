/** "By joining, you agree to our {link}." — the link opens the Privacy Policy. */
export function Consent({ text, link }: { text: string; link: string }) {
  const [before, after = ""] = text.split("{link}");
  return (
    <p className="consent">
      {before}
      <a href="/privacy" target="_blank" rel="noopener">
        {link}
      </a>
      {after}
    </p>
  );
}

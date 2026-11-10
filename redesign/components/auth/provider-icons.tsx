/**
 * Sign-in provider marks: simplified brand-colored glyphs (recognisable tiles, not official
 * artwork). Each renders at 20×20 by default.
 */
type P = { className?: string };
const box = (className?: string) => ({ viewBox: "0 0 24 24", className: className ?? "size-5", "aria-hidden": true as const });

export function GoogleMark({ className }: P) {
  return (
    <svg {...box(className)}>
      <path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2-1.9 3.3-4.7 3.3-8z" />
      <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1-3.7 1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.1a11 11 0 0 0 0 9.8l3.7-2.8z" />
      <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z" />
    </svg>
  );
}

export function AppleMark({ className }: P) {
  return (
    <svg {...box(className)}>
      <path
        fill="currentColor"
        d="M16.6 12.8c0-2.5 2.1-3.7 2.2-3.8-1.2-1.7-3-2-3.6-2-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.5 1.3 0 1.8-.8 3.3-.8s2 .8 3.3.8c1.4 0 2.2-1.2 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.8-1-2.9-4zM14.1 5.3c.7-.9 1.2-2 1-3.2-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1.1 3 1.2.1 2.3-.5 3-1.3z"
      />
    </svg>
  );
}

export function MetaMaskMark({ className }: P) {
  return (
    <svg {...box(className)}>
      <path fill="#E2761B" d="M2.5 2.5 10.2 8.2l2-.6 2 .6 7.7-5.7-1.6 8.6 1.4 4.3-4.3 5.6-3-1-1 1.3h-2.2l-1-1.3-3 1-4.3-5.6 1.4-4.3z" />
      <path fill="#F6851B" d="M8.6 12.6 12 11.6l3.4 1-.6 4.4-2.8 1.4-2.8-1.4z" />
      <path fill="#C0AD9E" d="M10.8 19.8h2.4l-.2-1.4h-2z" />
      <path fill="#233447" d="M7.4 12.3 9.6 13l-1.9 1.2zM16.6 12.3 14.4 13l1.9 1.2z" />
      <path fill="#CD6116" d="M2.5 2.5 8 9.7l2.2-1.5zM21.5 2.5 16 9.7l-2.2-1.5z" />
    </svg>
  );
}

export function PhantomMark({ className }: P) {
  return (
    <svg {...box(className)}>
      <rect width="24" height="24" rx="6" fill="#AB9FF2" />
      <path fill="#fff" d="M5.2 15.2c0-5 3-8.2 7.1-8.2 4 0 6.5 2.7 6.5 6.4 0 3.6-2.6 5.4-5.1 5.4-1.3 0-1.8-.8-2.5-.8s-1.1.8-2.2.8c-2 0-3.8-1.3-3.8-3.6z" />
      <ellipse cx="11.6" cy="12" rx=".9" ry="1.3" fill="#AB9FF2" />
      <ellipse cx="15" cy="12" rx=".9" ry="1.3" fill="#AB9FF2" />
    </svg>
  );
}

export function WalletConnectMark({ className }: P) {
  return (
    <svg {...box(className)}>
      <rect width="24" height="24" rx="6" fill="#3B99FC" />
      <path d="M6.6 10.3a7.8 7.8 0 0 1 10.8 0M6.2 12.8l2.8 2.7 3-2.9 3 2.9 2.8-2.7" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CoinbaseMark({ className }: P) {
  return (
    <svg {...box(className)}>
      <circle cx="12" cy="12" r="12" fill="#0052FF" />
      <circle cx="12" cy="12" r="6.6" fill="#fff" />
      <rect x="9.8" y="9.8" width="4.4" height="4.4" rx=".8" fill="#0052FF" />
    </svg>
  );
}

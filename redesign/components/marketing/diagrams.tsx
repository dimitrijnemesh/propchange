/** Inline SVG diagrams using design tokens (work in light and dark). */

export function SeatsDiagram({ total = 100, taken = 87 }: { total?: number; taken?: number }) {
  const cols = 20;
  return (
    <svg viewBox={`0 0 ${cols * 22} ${Math.ceil(total / cols) * 22 + 4}`} className="w-full max-w-[520px]" role="img" aria-label={`${taken} of ${total} seats filled`}>
      {Array.from({ length: total }, (_, i) => {
        const x = (i % cols) * 22 + 2;
        const y = Math.floor(i / cols) * 22 + 2;
        const on = i < taken;
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <rect width="16" height="11" rx="3" fill={on ? "var(--primary)" : "var(--bg-muted)"} stroke={on ? "none" : "var(--border-strong)"} />
            <rect x="2" y="12" width="12" height="4" rx="1.5" fill={on ? "var(--primary)" : "var(--bg-muted)"} opacity={on ? 0.6 : 1} />
          </g>
        );
      })}
    </svg>
  );
}

export function EscrowFlowDiagram() {
  const box = (x: number, y: number, w: number, label: string, sub: string, tone: string) => (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height="64" rx="12" fill="var(--surface)" stroke={tone} strokeWidth="1.5" />
      <text x={w / 2} y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="var(--text)">
        {label}
      </text>
      <text x={w / 2} y="46" textAnchor="middle" fontSize="11" fill="var(--text-secondary)">
        {sub}
      </text>
    </g>
  );
  return (
    <svg viewBox="0 0 720 220" className="w-full" role="img" aria-label="Seat fee flows into escrow; if the contract is kept it goes to the trader, if breached it is refunded">
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--text-tertiary)" />
        </marker>
      </defs>
      {box(10, 78, 140, "You pay", "Seat Fee in USDC", "var(--border-strong)")}
      {box(220, 78, 160, "Escrow", "PDA per strategy · Epoch", "var(--primary)")}
      {box(470, 10, 240, "Contract kept", "75% trader · 25% platform", "var(--success)")}
      {box(470, 146, 240, "Contract breached", "Copying stops · fee refunded", "var(--danger)")}
      <line x1="150" y1="110" x2="214" y2="110" stroke="var(--text-tertiary)" strokeWidth="1.5" markerEnd="url(#arr)" />
      <path d="M380 100 C 420 100, 420 42, 464 42" fill="none" stroke="var(--success)" strokeWidth="1.5" markerEnd="url(#arr)" />
      <path d="M380 120 C 420 120, 420 178, 464 178" fill="none" stroke="var(--danger)" strokeWidth="1.5" markerEnd="url(#arr)" />
      <text x="300" y="168" textAnchor="middle" fontSize="11" fill="var(--text-tertiary)">
        30-day Epoch · settled by oracle report
      </text>
    </svg>
  );
}

export function CustodyDiagram() {
  return (
    <svg viewBox="0 0 720 230" className="w-full" role="img" aria-label="Your capital stays in your exchange account; PropChange only sends orders via a trade-only key, and only the seat fee goes on-chain">
      <defs>
        <marker id="arr2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--text-tertiary)" />
        </marker>
      </defs>
      <rect x="10" y="20" width="220" height="190" rx="14" fill="var(--primary-soft)" stroke="var(--primary)" strokeWidth="1.5" />
      <text x="120" y="52" textAnchor="middle" fontSize="14" fontWeight="600" fill="var(--text)">Your exchange account</text>
      <text x="120" y="72" textAnchor="middle" fontSize="11" fill="var(--text-secondary)">Binance · Bybit · MT5</text>
      <rect x="40" y="96" width="160" height="44" rx="10" fill="var(--surface)" stroke="var(--border-strong)" />
      <text x="120" y="123" textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--text)">Your capital</text>
      <text x="120" y="175" textAnchor="middle" fontSize="11" fill="var(--success)">✓ never leaves</text>

      <rect x="290" y="70" width="160" height="90" rx="14" fill="var(--surface)" stroke="var(--border-strong)" strokeWidth="1.5" />
      <text x="370" y="104" textAnchor="middle" fontSize="14" fontWeight="600" fill="var(--text)">PropChange</text>
      <text x="370" y="124" textAnchor="middle" fontSize="11" fill="var(--text-secondary)">copy engine + Risk Engine</text>
      <text x="370" y="142" textAnchor="middle" fontSize="11" fill="var(--text-secondary)">trade-only key</text>

      <rect x="510" y="70" width="200" height="90" rx="14" fill="var(--surface)" stroke="var(--border-strong)" strokeWidth="1.5" />
      <text x="610" y="104" textAnchor="middle" fontSize="14" fontWeight="600" fill="var(--text)">Solana</text>
      <text x="610" y="124" textAnchor="middle" fontSize="11" fill="var(--text-secondary)">Seat · escrow · settlement</text>
      <text x="610" y="142" textAnchor="middle" fontSize="11" fill="var(--text-secondary)">USDC Seat Fees only</text>

      <line x1="284" y1="115" x2="236" y2="115" stroke="var(--text-tertiary)" strokeWidth="1.5" markerEnd="url(#arr2)" />
      <text x="260" y="104" textAnchor="middle" fontSize="10" fill="var(--text-tertiary)">orders</text>
      <line x1="456" y1="115" x2="504" y2="115" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arr2)" />
      <text x="480" y="104" textAnchor="middle" fontSize="10" fill="var(--text-tertiary)">reports</text>
      <text x="260" y="140" textAnchor="middle" fontSize="10" fill="var(--danger)">✗ withdraw</text>
    </svg>
  );
}

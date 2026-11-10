import { ImageResponse } from "next/og";
import { MARK_PATHS, MARK_VIEWBOX } from "@/components/layout/mark-paths";

export const alt = "PropChange — Take a Seat. Copy. Earn.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social preview card: brand mark + headline on the dark platform palette. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(60% 80% at 85% 10%, rgba(56,97,251,0.35), transparent 70%), #0A0A0C",
          color: "#EAECEF",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width={96} height={60} viewBox={MARK_VIEWBOX}>
            {MARK_PATHS.map((d, i) => (
              <path key={i} d={d} fill="#FFFFFF" />
            ))}
          </svg>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 600 }}>
            <span style={{ color: "#5B7FFF" }}>Prop</span>Change
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -3, lineHeight: 1.05 }}>Take a Seat. Copy. Earn.</div>
          <div style={{ fontSize: 30, color: "#9A9EA8" }}>The first Seat Market · Verified traders · On Solana</div>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 24, color: "#767A85" }}>
          <span style={{ color: "#5B7FFF" }}>●</span> Seat Market · Seat Contracts · Risk Engine
        </div>
      </div>
    ),
    size,
  );
}

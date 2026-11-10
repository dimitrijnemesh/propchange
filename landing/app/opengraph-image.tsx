import { ImageResponse } from "next/og";
import { MARK_VIEWBOX, PATHS } from "@/components/mark";

export const alt = "PropChange — Take a Seat. Copy. Earn. The first Seat Market. Join the waitlist.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BLUE = "#3861FB";
const BLUE_TEXT = "#5B7FFF";

/** Space Grotesk for the headline; falls back to the default font if Google Fonts can't be reached at build time. */
async function grotesk(): Promise<ArrayBuffer | null> {
  try {
    const css = await (await fetch("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600")).text();
    const url = css.match(/src: url\((https:[^)]+)\)/)?.[1];
    if (!url) return null;
    return await (await fetch(url)).arrayBuffer();
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const font = await grotesk();
  const head = font ? "Space Grotesk" : "sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "radial-gradient(ellipse 70% 80% at 85% 25%, #1a2a6e 0%, #0a0a0c 62%)",
          color: "#EAECEF",
          padding: "64px 72px",
          fontFamily: head,
        }}
      >
        {/* left: copy */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 660 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <svg viewBox={MARK_VIEWBOX} width={52} height={33}>
              {PATHS.map((d, i) => (
                <path key={i} d={d} fill="#ffffff" />
              ))}
            </svg>
            <div style={{ display: "flex", fontSize: 36, fontWeight: 600, letterSpacing: -0.5 }}>
              <span style={{ color: BLUE_TEXT }}>Prop</span>
              <span>Change</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 22, letterSpacing: 4, color: BLUE_TEXT, textTransform: "uppercase", marginBottom: 18 }}>
              The first Seat Market
            </div>
            <div style={{ display: "flex", flexDirection: "column", fontSize: 92, fontWeight: 600, lineHeight: 1.0, letterSpacing: -3 }}>
              <span>Take a Seat.</span>
              <span style={{ color: BLUE_TEXT }}>Copy. Earn.</span>
            </div>
            <div style={{ display: "flex", fontSize: 28, color: "#A3A7B0", marginTop: 26, lineHeight: 1.35, width: 600 }}>
              Verified traders sell limited Seats. Copy them in your own account — refunded if they break the rules.
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", background: BLUE, color: "#fff", fontSize: 24, fontWeight: 600, padding: "14px 26px", borderRadius: 12 }}>Join the waitlist</div>
            <div style={{ display: "flex", fontSize: 22, color: "#80848E" }}>Early access · Powered by Solana</div>
          </div>
        </div>

        {/* right: limited Seats visual */}
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "flex-end" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 22,
              padding: "34px 36px",
              borderRadius: 28,
              border: `2px solid ${BLUE}`,
              background: "rgba(21, 22, 26, 0.92)",
            }}
          >
            <div style={{ display: "flex", fontSize: 20, letterSpacing: 4, color: BLUE_TEXT }}>SEATS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[0, 1, 2, 3].map((r) => (
                <div key={r} style={{ display: "flex", gap: 14 }}>
                  {[0, 1, 2].map((c) => {
                    const taken = r * 3 + c < 9;
                    return (
                      <div
                        key={c}
                        style={{
                          display: "flex",
                          width: 64,
                          height: 64,
                          borderRadius: 14,
                          border: `3px solid ${BLUE}`,
                          background: taken ? BLUE : "transparent",
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", fontSize: 26, fontWeight: 600 }}>9 / 12 taken</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font ? [{ name: "Space Grotesk", data: font, weight: 600, style: "normal" }] : undefined,
    },
  );
}

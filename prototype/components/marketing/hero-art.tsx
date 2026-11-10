import { MARK_PATHS, MARK_VIEWBOX } from "@/components/layout/mark-paths";

/**
 * Decorative hero background built from the brand mark: a softly glowing filled mark with
 * contour outlines echoing outward (a slow ripple runs through them). Pure SVG + CSS, themed
 * via tokens, faded toward the headline so text stays readable.
 */
const ECHOES = [1.06, 1.14, 1.23, 1.33, 1.44, 1.56];

export function HeroArt() {
  return (
    <div aria-hidden className="hero-art pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        viewBox={MARK_VIEWBOX}
        className="hero-art-svg absolute"
        fill="none"
        overflow="visible"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="hero-art-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--hero-art-a)" />
            <stop offset="100%" stopColor="var(--hero-art-b)" />
          </linearGradient>
          <linearGradient id="hero-art-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--hero-art-line)" stopOpacity="0.2" />
            <stop offset="60%" stopColor="var(--hero-art-line)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--hero-art-line)" stopOpacity="0.6" />
          </linearGradient>
          <filter id="hero-art-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          {/* the mark's paths once; every layer below references them */}
          <g id="hero-art-paths">
            {MARK_PATHS.map((d, i) => (
              <path key={i} d={d} vectorEffect="non-scaling-stroke" />
            ))}
          </g>
        </defs>

        {/* soft glow behind the mark */}
        <g className="hero-art-glow" filter="url(#hero-art-glow)">
          <use href="#hero-art-paths" fill="url(#hero-art-fill)" />
        </g>

        {/* contour echoes rippling outward from the mark */}
        {ECHOES.map((s, k) => (
          <g
            key={s}
            className="hero-art-echo"
            style={{
              transform: `scale(${s})`,
              transformOrigin: "200px 126px",
              animationDelay: `${k * 0.55}s`,
              ["--echo-base" as string]: String(0.55 - k * 0.07),
            }}
          >
            <use href="#hero-art-paths" stroke="url(#hero-art-stroke)" strokeWidth={1.1} />
          </g>
        ))}

        {/* the mark itself: translucent fill + crisp outline */}
        <g className="hero-art-mark">
          <use href="#hero-art-paths" fill="url(#hero-art-fill)" stroke="var(--hero-art-line)" strokeWidth={1.25} />
        </g>
      </svg>
    </div>
  );
}

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PropChange",
    short_name: "PropChange",
    description: "Copy trading strategies with a Seat Contract. Non-custodial strategy market.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0A0C",
    theme_color: "#0A0A0C",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}

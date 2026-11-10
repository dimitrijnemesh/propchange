import { createLucideIcon } from "lucide-react";

/**
 * Simplified monochrome social glyphs in the Lucide line style (lucide-react 1.x ships no
 * brand icons). Recognisable silhouettes, not official artwork.
 */
export const XIcon = createLucideIcon("x-social", [
  ["path", { d: "M4.5 4h4l11 16h-4z", key: "a" }],
  ["path", { d: "M19.5 4l-6.1 6.9M4.5 20l6.1-6.9", key: "b" }],
]);



export const InstagramIcon = createLucideIcon("instagram-social", [
  ["rect", { x: "3", y: "3", width: "18", height: "18", rx: "5", key: "a" }],
  ["circle", { cx: "12", cy: "12", r: "4", key: "b" }],
  ["circle", { cx: "17.3", cy: "6.7", r: ".6", fill: "currentColor", key: "c" }],
]);

/**
 * Writes placeholder images so the layout is final before real photos land.
 * They match the site palette on purpose — a broken-looking grey box would
 * make the composition impossible to judge.
 *
 * Run: node scripts/gen-placeholders.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const pub = resolve(here, "../public");

const GROUND = "#0e0e10";
const RULE = "#24242a";
const DIM = "#6a6a66";

function plate(w, h, label) {
  // Corner ticks + a center crosshair. Reads as a registration mark
  // rather than a missing asset.
  const t = Math.round(Math.min(w, h) * 0.055);
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.round(Math.min(w, h) * 0.06);

  const corners = [
    [0, 0, 1, 1],
    [w, 0, -1, 1],
    [0, h, 1, -1],
    [w, h, -1, -1],
  ]
    .map(
      ([x, y, sx, sy]) =>
        `<path d="M${x + sx * 14} ${y + sy * 14} h${sx * t}" />` +
        `<path d="M${x + sx * 14} ${y + sy * 14} v${sy * t}" />`,
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${label}">
  <rect width="${w}" height="${h}" fill="${GROUND}"/>
  <g stroke="${RULE}" stroke-width="1" fill="none">${corners}</g>
  <g stroke="${RULE}" stroke-width="1" fill="none">
    <circle cx="${cx}" cy="${cy}" r="${r}"/>
    <path d="M${cx - r * 1.8} ${cy} H${cx - r * 1.25} M${cx + r * 1.25} ${cy} H${cx + r * 1.8}"/>
    <path d="M${cx} ${cy - r * 1.8} V${cy - r * 1.25} M${cx} ${cy + r * 1.25} V${cy + r * 1.8}"/>
  </g>
  <text x="${cx}" y="${cy + r * 3.4}" fill="${DIM}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="${Math.round(Math.min(w, h) * 0.042)}" letter-spacing="2.5" text-anchor="middle">${label}</text>
</svg>
`;
}

mkdirSync(resolve(pub, "photos"), { recursive: true });
mkdirSync(resolve(pub, "projects"), { recursive: true });

// 4:5 portraits for the hero frame + lightbox
for (let i = 1; i <= 3; i++) {
  const n = String(i).padStart(2, "0");
  writeFileSync(
    resolve(pub, `photos/placeholder-${n}.svg`),
    plate(880, 1100, `PHOTO ${n}`),
  );
}

// 16:10 for case-study screenshots
writeFileSync(
  resolve(pub, "projects/placeholder-wide.svg"),
  plate(1600, 1000, "SCREENSHOT"),
);

console.log("Wrote 3 photo plates + 1 screenshot plate");

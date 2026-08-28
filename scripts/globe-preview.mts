import { decodeLand, renderGlobe } from "../src/components/hero/globe.ts";
import { LAND } from "../src/components/hero/land-mask.ts";

const cols = Number(process.argv[2] ?? 96);
const rows = Number(process.argv[3] ?? 58);
const spins = (process.argv[4] ?? "0").split(",").map(Number);
const tilt = Number(process.argv[5] ?? 0.35);

const land = decodeLand(LAND);

for (const s of spins) {
  const { base, highlight } = renderGlobe({ cols, rows }, (s * Math.PI) / 180, tilt, land);
  const lit = [...base].filter((c) => c !== " " && c !== "\n").length;
  const hi = [...highlight].filter((c) => c !== " " && c !== "\n").length;
  console.log(`\n=== spin ${s}deg tilt ${tilt} — ${lit} cells, ${hi} amber (${((hi/lit)*100).toFixed(1)}%) ===`);
  console.log(base);
}

const t0 = performance.now();
for (let i = 0; i < 60; i++) renderGlobe({ cols, rows }, i * 0.05, tilt, land);
console.log(`\nper frame: ${((performance.now() - t0) / 60).toFixed(2)}ms (16.7ms budget)`);

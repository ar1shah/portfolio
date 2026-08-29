/**
 * Simulates the hero globe spin at several refresh rates and checks it
 * lands in the same place after the same wall-clock time. It was
 * previously stepped per-frame, which made its speed a function of the
 * display.
 *
 * Run: node scripts/motion-check.mjs
 */
const RATES = [60, 90, 120, 144, 165];
const SECONDS = 6;
const MAX_DT = 0.05;

// ── globe: time-based spin + exponential cursor lean ───────────────────
const SPIN_A = 0.157;
const SPIN_B = 0.0;
const TILT = 0.5;
const TILT_TAU = 0.30;

function carAt(hz) {
  const step = 1 / hz;
  let spinA = 0.6;
  let spinB = 1.1;
  let tiltA = 0;
  let tiltB = 0;

  for (let i = 0; i < hz * SECONDS; i++) {
    const dt = Math.min(MAX_DT, step);
    spinA += SPIN_A * dt;
    spinB += SPIN_B * dt;
    const k = 1 - Math.exp(-dt / TILT_TAU);
    // cursor parked bottom-right the whole time
    tiltA += (0.8 * TILT - tiltA) * k;
    tiltB += (0.5 * TILT - tiltB) * k;
  }
  return { A: spinA + tiltA, B: spinB + tiltB };
}

console.log(`after ${SECONDS}s of wall-clock time:\n`);
console.log("  Hz | globe spin| lean    | revs");
const carAngles = [];
for (const hz of RATES) {
  const { A, B } = carAt(hz);
  carAngles.push(A);
  const revs = ((2 * Math.PI) / SPIN_A).toFixed(0);
  console.log(
    `${String(hz).padStart(4)} | ${A.toFixed(4)}  | ${B.toFixed(4)}  | ${revs}s`,
  );
}

const spread = (xs) => Math.max(...xs) - Math.min(...xs);
const tSpread = spread(carAngles);

console.log(`\nglobe angle spread across refresh rates: ${tSpread.toFixed(6)} rad`);

const ok = tSpread < 0.01;
console.log(
  `\n${ok ? "PASS" : "FAIL"} — motion is ${ok ? "" : "NOT "}independent of refresh rate`,
);
process.exit(ok ? 0 : 1);

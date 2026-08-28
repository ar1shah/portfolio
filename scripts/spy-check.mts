import { pickActive, ACTIVE_LINE } from "../src/hooks/useActiveSection.ts";

const ids = ["about", "projects", "experience", "skills"];
let pass = 0;
let fail = 0;

function t(name: string, tops: number[], atBottom: boolean, expect: string) {
  const got = pickActive(ids, tops, atBottom);
  const ok = got === expect;
  if (ok) pass++;
  else fail++;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${name}\n      tops=[${tops}] atBottom=${atBottom} -> ${got}${
      ok ? "" : `  (expected ${expect})`
    }`,
  );
}

console.log(`-- free scrolling (ACTIVE_LINE=${ACTIVE_LINE}) --`);
t("at page top", [0, 900, 1900, 2800], false, "about");
t("about still above the line", [-50, 700, 1700, 2600], false, "about");
t("projects exactly on the line", [-800, ACTIVE_LINE, 1100, 2000], false, "projects");
t("projects one px below line", [-800, ACTIVE_LINE + 1, 1100, 2000], false, "about");
t("experience current", [-2853, -1781, -740, 208], false, "experience");
t("skills current", [-3000, -2000, -1000, 40], false, "skills");
t("bottom of page wins", [-3000, -2000, -1000, 500], true, "skills");
t("missing section (Infinity)", [0, Infinity, Infinity, Infinity], false, "about");

// Regression: clicking a nav item must underline THAT item.
//
// Sections land at their scroll-mt-28 (112px) after an anchor jump. When
// ACTIVE_LINE sat at 96px — and a stray scroll-padding-top pushed targets
// to 208px — the clicked section fell past the line, failed the test, and
// the previous section kept the underline. Every item lit the one before it.
const ANCHOR = 112;

console.log(`\n-- anchor jumps (section lands at ${ANCHOR}px) --`);
t("clicked about", [ANCHOR, 1000, 2000, 3000], false, "about");
t("clicked projects", [-900, ANCHOR, 1000, 2000], false, "projects");
t("clicked experience", [-1900, -900, ANCHOR, 1000], false, "experience");
t("clicked skills", [-2900, -1900, -900, ANCHOR], false, "skills");

// The invariant behind all four cases above. This is what actually broke:
// ACTIVE_LINE was 96 while targets landed at 208, so every clicked section
// fell past the line. Guards against re-adding a scroll-padding-top or
// changing scroll-mt-28 without moving ACTIVE_LINE with it.
console.log("\n-- invariant --");
{
  const ok = ACTIVE_LINE >= ANCHOR;
  if (ok) pass++;
  else fail++;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ACTIVE_LINE (${ACTIVE_LINE}) >= anchor offset (${ANCHOR})`,
  );
  if (!ok) {
    console.log(
      "      A clicked section lands past the line and the previous one",
    );
    console.log("      keeps the underline. Raise ACTIVE_LINE.");
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

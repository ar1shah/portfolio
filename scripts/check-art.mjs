/**
 * Diffs the wordmark stored in AsciiWordmark.tsx against
 * scripts/expected-art.txt, byte for byte. Guards the escaping in that file
 * — a single mangled backslash silently corrupts the logo.
 *
 * Run: node scripts/check-art.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

const src = readFileSync(
  resolve(here, "../src/components/site/AsciiWordmark.tsx"),
  "utf8",
);

const block = src.match(/const ART = \[([\s\S]*?)\]\.join/)[1];

// Matches a double-quoted JS string literal, honoring escapes.
const STRING_LITERAL = new RegExp('"((?:[^"\\\\]|\\\\.)*)"', "g");

const stored = [...block.matchAll(STRING_LITERAL)].map((m) =>
  JSON.parse('"' + m[1] + '"'),
);

const expected = readFileSync(resolve(here, "expected-art.txt"), "utf8")
  .replace(/\r\n/g, "\n")
  .split("\n")
  .filter((l) => l.length > 0);

let ok = true;
console.log("row | stored | expected | match");

for (let i = 0; i < Math.max(stored.length, expected.length); i++) {
  const a = stored[i] ?? "(missing)";
  const b = expected[i] ?? "(missing)";
  const same = a === b;
  if (!same) ok = false;

  console.log(
    `  ${i + 1} |   ${String(a.length).padStart(2)}   |    ${String(b.length).padStart(2)}    | ${same ? "yes" : "NO"}`,
  );
  if (!same) {
    console.log("    stored  :[" + a + "]");
    console.log("    expected:[" + b + "]");
  }
}

console.log("\nall rows 38 wide:", stored.every((l) => l.length === 38));
console.log("BYTE-EXACT MATCH:", ok);
process.exit(ok ? 0 : 1);

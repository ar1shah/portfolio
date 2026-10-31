/**
 * Runs every terminal command at both column widths and asserts nothing
 * overflows the panel.
 *
 * The panel's font-size is `clamp(11px, 100cqw / (cols * 0.6), 14px)` — it
 * only ever shrinks to avoid overflow, and it stops at 11px. A row wider
 * than `cols` therefore has no way to fit and just runs out the side, so
 * the width assertion below is the whole point of this file. The in-editor
 * preview can't be trusted to catch it (no ResizeObserver, no IO), which
 * is why this is a headless check rather than a browser one.
 *
 * Run: node --experimental-strip-types scripts/term-check.mts
 */
import {
  commands,
  commandNames,
  completeCommand,
  historyStep,
  resolveCommand,
  runCommand,
  type Rows,
} from "../src/components/about/commands.ts";

const COLS = [40, 52] as const;

let pass = 0;
let fail = 0;

function ok(name: string, condition: boolean, detail = "") {
  if (condition) pass++;
  else fail++;
  console.log(`${condition ? "PASS" : "FAIL"}  ${name}${condition || !detail ? "" : `\n      ${detail}`}`);
}

const width = (row: Rows[number]) => row.reduce((n, seg) => n + seg.text.length, 0);

/** The widest row, and what it was, so a failure says which line to fix. */
function widest(rows: Rows) {
  let max = 0;
  let text = "";
  for (const row of rows) {
    const w = width(row);
    if (w > max) {
      max = w;
      text = row.map((s) => s.text).join("");
    }
  }
  return { max, text };
}

// ── every command fits, at both widths ────────────────────────────────

// Arguments worth exercising: the list form, a real detail lookup, and a
// miss. `projects partsync` is the widest realistic row in the set.
const INVOCATIONS = [
  ...commandNames,
  "projects partsync",
  "projects ssh-portfolio",
  "projects ssh portfolio",
  "projects nope",
  "experience delta",
  "experience ucf",
  "experience nope",
  "cat about.txt",
  "cat contact.txt",
  "cat skills.txt",
  "cat resume.pdf",
  "cat nope.txt",
  "echo hello world",
  "man ls",
  "sudo rm -rf /",
  "definitelynotacommand",
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
];

console.log("-- row widths --");
for (const cols of COLS) {
  let worst = 0;
  for (const input of INVOCATIONS) {
    const rows = runCommand(input, cols);
    const { max, text } = widest(rows);
    worst = Math.max(worst, max);
    ok(
      `${cols}c  ${input}`,
      max <= cols,
      `widest row is ${max} > ${cols}: ${JSON.stringify(text)}`,
    );
  }
  console.log(`      worst row at ${cols} cols: ${worst}\n`);
}

// ── dispatch ──────────────────────────────────────────────────────────

console.log("-- dispatch --");
const flat = (rows: Rows) => rows.map((r) => r.map((s) => s.text).join("")).join(" ");

ok("unknown command reports not found", flat(runCommand("blah", 52)).includes("command not found"));

ok("empty input prints nothing", runCommand("   ", 52).length === 0);
ok("clear prints nothing", runCommand("clear", 52).length === 0);

for (const cmd of commands) {
  if (cmd.name === "clear") continue;
  ok(`${cmd.name} produces output`, runCommand(cmd.name, 52).length > 0);
}

for (const cmd of commands) {
  for (const alias of cmd.aliases ?? []) {
    ok(`alias ${alias} -> ${cmd.name}`, resolveCommand(alias)?.name === cmd.name);
  }
}

ok("dispatch is case-insensitive", resolveCommand("HELP")?.name === "help");
ok("dispatch ignores leading space", resolveCommand("   help")?.name === "help");
ok("no duplicate names or aliases", (() => {
  const seen = new Set<string>();
  for (const c of commands) {
    for (const n of [c.name, ...(c.aliases ?? [])]) {
      if (seen.has(n)) return false;
      seen.add(n);
    }
  }
  return true;
})());

// ── tab completion ────────────────────────────────────────────────────

console.log("\n-- completion --");
ok("unique prefix completes and adds a space", completeCommand("who").completed === "whoami ");
ok("exact name still completes", completeCommand("ls").completed === "ls ");
ok("ambiguous prefix stops at the common prefix", completeCommand("e").completed === "e");
ok("ambiguous prefix returns its candidates", completeCommand("e").matches.length > 1);
ok("another unique prefix completes", completeCommand("su").completed === "sudo ");

// No two current command names share a prefix longer than one character,
// so the longest-common-prefix branch has nothing to extend to today.
// Assert the invariant instead, so the branch stays covered if a name
// like `export` ever lands next to `exit`.
ok("ambiguous completion never invents text", (() => {
  for (const name of commandNames) {
    for (let n = 1; n <= name.length; n++) {
      const partial = name.slice(0, n);
      const { completed, matches } = completeCommand(partial);
      if (matches.length < 2) continue;
      if (completed === partial) continue;
      if (!matches.every((m) => m.startsWith(completed))) return false;
      if (completed.length <= partial.length) return false;
    }
  }
  return true;
})());
ok("no match leaves the value alone", completeCommand("zz").completed === "zz");
ok("no match reports no candidates", completeCommand("zz").matches.length === 0);
ok("empty value does not complete", completeCommand("").matches.length === 0);
ok("does not complete past the first word", completeCommand("cat ab").completed === "cat ab");

// ── history ───────────────────────────────────────────────────────────

console.log("\n-- history --");
ok("empty history stays at the draft", historyStep(0, -1, -1) === -1);
ok("up from draft lands on the newest", historyStep(3, -1, -1) === 2);
ok("up walks back", historyStep(3, 2, -1) === 1);
ok("up stops at the oldest", historyStep(3, 0, -1) === 0);
ok("down walks forward", historyStep(3, 0, 1) === 1);
ok("down past the newest returns to the draft", historyStep(3, 2, 1) === -1);
ok("down from the draft stays there", historyStep(3, -1, 1) === -1);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);

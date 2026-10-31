"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { profile } from "@/content/profile";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useInView } from "@/hooks/useInView";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTypedLines } from "@/hooks/useTypedLines";
import { Caret } from "@/components/ui/Caret";
import { wrapToColumns, revealSegments, type Segment } from "./wrap";
import {
  completeCommand,
  historyStep,
  resolveCommand,
  runCommand,
  type Rows,
} from "./commands";

/** JetBrains Mono em advance — same technique as AsciiGlobe's grid sizing. */
const ADVANCE = 0.6;

// Below `lg` the panel is full-width and stacked above the photo — a
// fixed, conservative count that's safe even at a ~320px phone at the
// clamp's floor (see FONT_MIN). Tried tracking the real viewport instead, but a
// flexible grid track that shrinks to fit its sibling doesn't correlate
// to a single width per breakpoint, so a static guess either overflowed
// narrow layouts or left the wide one short.
//
// At `lg` and up, the two-column layout doesn't kick in until 1024px,
// where the fixed-width photo column plus the gap leaves the terminal
// at least ~460px of real content width — a known worst case, not a
// squeeze that varies with the sibling. COLS_DESKTOP is picked to
// reach the 14px cap at that width, so the text reaches edge to edge
// on typical desktop windows instead of sitting in a narrow column
// with empty space to its right — the font-size clamp only ever
// shrinks to avoid overflow, it doesn't grow on its own to fill a
// wider box. AboutBlock also gives the terminal's grid track a 340px
// floor as a defensive backstop (extreme zoom, odd scrollbar widths) —
// that floor should never actually engage at 1024px+.
//
// `scripts/term-check.mts` runs every command at both of these and
// asserts no printed row exceeds them.
const COLS_MOBILE = 40;
const COLS_DESKTOP = 52;

/** Visible rows in the scroll region. See the height note in the body. */
const ROWS_MOBILE = 14;
const ROWS_DESKTOP = 16;

// The floor of the font-size clamp, and the one number that decides
// whether the narrowest supported phone can show COLS_MOBILE columns.
//
// At a 320px viewport: 24px page gutter each side leaves a 272px panel,
// less 1px of border each side and the body's 12px padding each side
// leaves 246px of content. 40 columns needs 40 * 0.6 * FONT_MIN, so
// FONT_MIN must stay at or below 10.25 — at the 11px this used to be,
// 40 columns wanted 264px and the last two ran off the side. The old
// panel hid that behind `overflow-hidden`; a scroll region would
// instead scroll sideways, which is worse on a phone.
//
// Lowering the floor is surgical: `clamp` only reaches it on viewports
// that could not fit the text anyway. Everything wider is untouched.
const FONT_MIN = 10;
const FONT_MAX = 14;

const LINE_HEIGHT = 1.35;

/** A runaway paste shouldn't become a runaway row in the scrollback. */
const MAX_INPUT = 120;

type Block = {
  id: number;
  /** Echoed after the prompt. Empty for a bare Enter. */
  command: string;
  /**
   * Literal rows, for a block whose body is not a command's output —
   * the `^C` echo and Tab's candidate list. Everything else stores only
   * the command and re-renders it at the current width, so scrollback
   * printed at 52 columns re-wraps instead of overflowing when the
   * window narrows past `lg`.
   */
  note?: Rows;
};

function WindowDots() {
  return (
    <span aria-hidden className="inline-flex items-center gap-[4px]">
      <span className="h-[9px] w-[9px] rounded-full" style={{ background: "var(--dot-red)" }} />
      <span className="h-[9px] w-[9px] rounded-full" style={{ background: "var(--dot-yellow)" }} />
      <span className="h-[9px] w-[9px] rounded-full" style={{ background: "var(--dot-green)" }} />
    </span>
  );
}

function Run({ seg }: { seg: Segment }) {
  const className = seg.accent ? "text-accent" : seg.dim ? "text-ink-dim" : undefined;

  if (seg.href) {
    // mailto: hands off to a mail client, so a new tab would just leave a
    // blank one behind. Only real navigations get target.
    const external = seg.href.startsWith("http");
    return (
      <a
        href={seg.href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className={`${className ?? ""} underline decoration-rule underline-offset-2 hover:decoration-current`}
      >
        {seg.text}
      </a>
    );
  }

  return <span className={className}>{seg.text}</span>;
}

function Row({
  segments,
  caret,
  blink,
}: {
  segments: Segment[];
  caret?: boolean;
  blink?: boolean;
}) {
  return (
    <div className="whitespace-pre">
      {segments.map((seg, i) => (
        <Run key={i} seg={seg} />
      ))}
      {caret && <Caret blink={!!blink} />}
    </div>
  );
}

/** The `$ ` prompt plus an echoed command, as printed in the scrollback. */
function PromptLine({ command }: { command: string }) {
  return (
    <div className="whitespace-pre">
      <span className="text-accent">$ </span>
      {command}
    </div>
  );
}

export function IntroTerminal() {
  const reduced = usePrefersReducedMotion();
  const [inViewRef, inView] = useInView<HTMLDivElement>();
  const visible = reduced || inView;

  // Matches AboutBlock's `lg:` breakpoint, where the terminal moves into
  // the two-column layout described above COLS_DESKTOP.
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const cols = isDesktop ? COLS_DESKTOP : COLS_MOBILE;
  const rows = isDesktop ? ROWS_DESKTOP : ROWS_MOBILE;

  const outputLines = useMemo(
    () =>
      profile.introParagraphs.flatMap((paragraph, i) => {
        const wrapped = wrapToColumns(paragraph, cols, profile.introAccent);
        // A truly empty line collapses to zero height (an empty block has
        // no inline content to establish a line box) — a non-breaking
        // space keeps the paragraph gap visible.
        return i === 0 ? wrapped : [" ", ...wrapped];
      }),
    [cols],
  );

  const lines = useMemo(
    () => [profile.introCommand, ...outputLines],
    [outputLines],
  );

  // Only ever fed the intro. useTypedLines latches `done` permanently, so
  // it cannot drive a REPL — which is fine, because command output prints
  // instantly by design.
  const { line, char, done } = useTypedLines(lines, { enabled: visible });

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIndex, setHistIndex] = useState(-1);
  const nextId = useRef(0);
  /** The line in progress, stashed while walking back through history. */
  const draft = useRef("");

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Nothing here is client-only anymore, but the body still waits for the
  // scroll trigger — the header bar and the sr-only paragraph carry the
  // panel's identity until then.
  const showBody = inView || reduced;

  const commandRevealed = line > 0 ? lines[0] : lines[0].slice(0, char);

  // Newest output stays in view. The intro is in the deps too: at 40
  // columns it nearly fills the region on its own.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [blocks, line, char]);

  const print = useCallback((command: string, note?: Rows) => {
    setBlocks((prev) => [...prev, { id: nextId.current++, command, note }]);
  }, []);

  /** Output is derived, not stored, so it re-wraps when `cols` changes. */
  const printed = useMemo(
    () => blocks.map((b) => ({ ...b, output: b.note ?? runCommand(b.command, cols) })),
    [blocks, cols],
  );

  const submit = useCallback(() => {
    const entry = value.trim();
    setValue("");
    setHistIndex(-1);
    draft.current = "";

    if (!entry) {
      print("");
      return;
    }
    setHistory((prev) => (prev[prev.length - 1] === entry ? prev : [...prev, entry]));

    if (resolveCommand(entry)?.name === "clear") {
      setBlocks([]);
      return;
    }
    print(entry);
  }, [value, print]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
      return;
    }

    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      if (histIndex === -1) draft.current = value;
      const next = historyStep(history.length, histIndex, event.key === "ArrowUp" ? -1 : 1);
      setHistIndex(next);
      setValue(next === -1 ? draft.current : history[next]);
      return;
    }

    if (event.key === "Tab" && !event.shiftKey) {
      const { completed, matches } = completeCommand(value);
      // No candidate means no completion to offer, so the keystroke is
      // left to the browser and Tab still moves focus out of the panel.
      // Shift+Tab always does.
      if (matches.length === 0) return;
      event.preventDefault();
      if (completed !== value) setValue(completed);
      else if (matches.length > 1) {
        print(value, [matches.map((m) => ({ text: `${m}  `, accent: true }))]);
      }
      return;
    }

    if (event.ctrlKey && (event.key === "l" || event.key === "k")) {
      event.preventDefault();
      setBlocks([]);
      return;
    }

    if (event.ctrlKey && event.key === "c") {
      event.preventDefault();
      print(`${value}^C`, []);
      setValue("");
      setHistIndex(-1);
      draft.current = "";
    }
  };

  // Clicking the panel focuses the prompt, the way a terminal window
  // does — but not when the click was a text selection, which focusing
  // would immediately collapse.
  const focusInput = () => {
    if (window.getSelection()?.isCollapsed === false) return;
    inputRef.current?.focus();
  };

  return (
    <div
      ref={inViewRef}
      className={`overflow-hidden rounded-lg border border-rule bg-raised transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
    >
      {/* Accessible + crawlable copy. The typed intro below repeats it. */}
      <p className="sr-only">{profile.introParagraphs.join(" ")}</p>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-rule bg-raised px-3 py-1.5">
        <WindowDots />
        <span className="chrome justify-self-center text-ink-dim">
          ari@ar13dev:~/about
        </span>
        <span aria-hidden />
      </div>

      {/* container-type lives on this element; the cqw-based font-size
          below must live on a CHILD, not here — a container can't query
          its own inline-size (see AsciiGlobe, which splits the same way:
          containerType on the box, `calc(100cqw / …)` on the <pre>s
          inside it). Combining the two on one element makes `cqw`
          resolve against the nearest ANCESTOR container instead — here,
          effectively the viewport — which is why the text used to blow
          past the panel's actual width. */}
      <div
        className="bg-ground px-3 py-2.5 font-mono sm:px-4"
        style={{ containerType: "inline-size" }}
        onClick={focusInput}
      >
        {/* The height is in `em` of this element's own clamped font-size,
            so the panel holds one fixed row count at every width instead
            of fighting the clamp. It also renders unconditionally, before
            the scroll trigger fires and whatever the scrollback holds, so
            the panel never changes height — the job the old invisible
            full-text copy used to do, which a growing scrollback made
            impossible. */}
        <div
          ref={scrollRef}
          className="term-scroll overflow-y-auto"
          style={{
            fontSize: `clamp(${FONT_MIN}px, calc(100cqw / ${cols * ADVANCE}), ${FONT_MAX}px)`,
            lineHeight: LINE_HEIGHT,
            height: `${(rows * LINE_HEIGHT).toFixed(2)}em`,
          }}
        >
          {showBody && (
            <>
              <div aria-hidden>
                <div className="whitespace-pre">
                  <span className="text-accent">$ </span>
                  {commandRevealed}
                  {line === 0 && <Caret blink={!reduced} />}
                </div>

                {outputLines.map((l, i) => {
                  const lineIndex = i + 1;
                  if (lineIndex > line) return null;

                  const typing = lineIndex === line && !done;
                  const limit = typing ? char : undefined;

                  return (
                    <Row
                      key={i}
                      segments={revealSegments(l, profile.introAccent, limit)}
                      caret={typing}
                      blink={!reduced}
                    />
                  );
                })}
              </div>

              {done && (
                <>
                  <div role="log" aria-live="polite">
                    {printed.map((block) => (
                      <div key={block.id}>
                        <div>&nbsp;</div>
                        <PromptLine command={block.command} />
                        {block.output.map((segments, i) => (
                          <Row key={i} segments={segments} />
                        ))}
                      </div>
                    ))}
                  </div>

                  <div>&nbsp;</div>
                  {blocks.length === 0 && (
                    <div className="whitespace-pre text-ink-dim">
                      type &apos;help&apos; to get started
                    </div>
                  )}

                  <div className="flex whitespace-pre">
                    <span className="text-accent">$ </span>
                    <input
                      ref={inputRef}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      onKeyDown={onKeyDown}
                      maxLength={MAX_INPUT}
                      aria-label="Terminal input. Type help for a list of commands."
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      className="term-input min-w-0 flex-1 bg-transparent text-ink"
                      style={{
                        caretColor: "var(--accent)",
                        fontSize: "inherit",
                        lineHeight: "inherit",
                      }}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

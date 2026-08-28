"use client";

import { useMemo } from "react";
import { profile } from "@/content/profile";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useInView } from "@/hooks/useInView";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTypedLines } from "@/hooks/useTypedLines";
import { Caret } from "@/components/ui/Caret";
import { wrapToColumns, revealSegments, type Segment } from "./wrap";

/** JetBrains Mono em advance — same technique as AsciiGlobe's grid sizing. */
const ADVANCE = 0.6;

// Below `lg` the panel is full-width and stacked above the photo — a
// fixed, conservative count that's safe even at a ~320px phone at the
// clamp's 11px floor. Tried tracking the real viewport instead, but a
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
const COLS_MOBILE = 40;
const COLS_DESKTOP = 52;

/** Trailing blank rows so the panel has breathing room at the bottom
 * without the font-size clamp reading them as more text to fit. */
const TRAILING_BLANK_LINES = 1;

function WindowDots() {
  return (
    <span aria-hidden className="inline-flex items-center gap-[4px]">
      <span className="h-[9px] w-[9px] rounded-full" style={{ background: "var(--dot-red)" }} />
      <span className="h-[9px] w-[9px] rounded-full" style={{ background: "var(--dot-yellow)" }} />
      <span className="h-[9px] w-[9px] rounded-full" style={{ background: "var(--dot-green)" }} />
    </span>
  );
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
      {segments.map((seg, i) =>
        seg.accent ? (
          <span key={i} className="text-accent">
            {seg.text}
          </span>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
      {caret && <Caret blink={!!blink} />}
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

  const outputLines = useMemo(
    () =>
      profile.introParagraphs.flatMap((paragraph, i) => {
        const wrapped = wrapToColumns(paragraph, cols, profile.introAccent);
        // A truly empty line collapses to zero height (an empty block has
        // no inline content to establish a line box) — a non-breaking
        // space keeps the paragraph gap visible.
        return i === 0 ? wrapped : [" ", ...wrapped];
      }),
    [cols],
  );

  const lines = useMemo(
    () => [profile.introCommand, ...outputLines],
    [outputLines],
  );

  const { line, char, done } = useTypedLines(lines, { enabled: visible });

  // Nothing here is client-only anymore, but the body still waits for the
  // scroll trigger — the header bar and the sr-only paragraph carry the
  // panel's identity until then.
  const showBody = inView || reduced;

  const commandRevealed = line > 0 ? lines[0] : lines[0].slice(0, char);

  return (
    <div
      ref={inViewRef}
      className={`overflow-hidden rounded-lg border border-rule bg-raised transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
    >
      {/* Accessible + crawlable copy. Everything below is aria-hidden. */}
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
        aria-hidden
        className="bg-ground px-4 py-2.5 font-mono"
        style={{ containerType: "inline-size" }}
      >
        {showBody && (
          <div
            className="grid"
            style={{
              fontSize: `clamp(11px, calc(100cqw / ${cols * ADVANCE}), 14px)`,
              lineHeight: 1.35,
            }}
          >
            {/* Invisible, full sizing copy in the same grid cell — reserves
                space so the panel doesn't grow while the text prints. */}
            <div className="invisible col-start-1 row-start-1">
              <div className="whitespace-pre">
                <span className="text-accent">$ </span>
                {lines[0]}
              </div>
              {outputLines.map((l, i) => (
                <Row key={i} segments={revealSegments(l, profile.introAccent)} />
              ))}
              {Array.from({ length: TRAILING_BLANK_LINES }).map((_, i) => (
                <div key={`blank-${i}`}>&nbsp;</div>
              ))}
            </div>

            <div className="col-start-1 row-start-1">
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
                const isLastOutputLine = i === outputLines.length - 1;
                const caret = done ? isLastOutputLine : typing;

                return (
                  <Row
                    key={i}
                    segments={revealSegments(l, profile.introAccent, limit)}
                    caret={caret}
                    blink={!reduced}
                  />
                );
              })}
              {done &&
                Array.from({ length: TRAILING_BLANK_LINES }).map((_, i) => (
                  <div key={`blank-${i}`}>&nbsp;</div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

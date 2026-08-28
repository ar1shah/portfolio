"use client";

import { useMemo } from "react";
import { profile } from "@/content/profile";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useInView } from "@/hooks/useInView";
import { useTypedLines } from "@/hooks/useTypedLines";
import { Caret } from "@/components/ui/Caret";
import { wrapToColumns, revealSegments, type Segment } from "./wrap";

/** JetBrains Mono em advance — same technique as AsciiGlobe's grid sizing. */
const ADVANCE = 0.6;

// A single column count, sized to fit even a ~320px phone at the clamp's
// 11px floor. Tried a wider/narrower pair keyed off a viewport breakpoint
// instead, but the panel's real width doesn't track viewport width — it's
// squeezed by the photo panel beside it — so a viewport-based guess
// overflowed the panel at plenty of real widths. A fixed, conservative
// count plus the font-size clamp below is what actually can't overflow.
const COLS = 34;

function WindowDots() {
  return (
    <span aria-hidden className="inline-flex items-center gap-[6px]">
      <span className="h-[10px] w-[10px] rounded-full" style={{ background: "var(--dot-red)" }} />
      <span className="h-[10px] w-[10px] rounded-full" style={{ background: "var(--dot-yellow)" }} />
      <span className="h-[10px] w-[10px] rounded-full" style={{ background: "var(--dot-green)" }} />
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

  const outputLines = useMemo(
    () => wrapToColumns(profile.intro, COLS, profile.introAccent),
    [],
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
      <p className="sr-only">{profile.intro}</p>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-rule bg-raised px-4 py-2.5">
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
        className="bg-ground px-5 py-4 font-mono"
        style={{ containerType: "inline-size" }}
      >
        {showBody && (
          <div
            className="grid"
            style={{
              fontSize: `clamp(11px, calc(100cqw / ${COLS * ADVANCE}), 14px)`,
              lineHeight: 1.7,
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

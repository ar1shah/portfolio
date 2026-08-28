"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

type Options = {
  /** Nothing types until this flips true. Driven by the scroll trigger. */
  enabled: boolean;
  /** ms per character for every line after the first. */
  charMs?: number;
  /** ms per character for the first line — the typed command. */
  firstLineMs?: number;
  /** ms pause at the end of each line before starting the next. */
  lineGapMs?: number;
  /** ms pause once before the first character. */
  startDelayMs?: number;
};

type State = {
  /** Index of the line currently being typed (or `lines.length` when done). */
  line: number;
  /** Characters revealed on that line. */
  char: number;
  done: boolean;
};

const jitter = (ms: number, spread: number) => ms + (Math.random() - 0.5) * spread;

/**
 * Types a fixed list of lines top to bottom, once, then stops. Unlike
 * useTypedText (type/hold/delete/repeat, driving TypedRoles), this never
 * loops — it's for a terminal that prints once and stays printed.
 *
 * `lines` should be stable across renders (memoize at the call site) —
 * a new array identity restarts the effect, though a completed run stays
 * complete rather than re-typing (see doneRef below).
 */
export function useTypedLines(lines: string[], options: Options): State {
  const {
    enabled,
    charMs = 17,
    firstLineMs = 55,
    lineGapMs = 200,
    startDelayMs = 220,
  } = options;

  const reduced = usePrefersReducedMotion();
  const [state, setState] = useState<State>({ line: 0, char: 0, done: false });
  const doneRef = useRef(false);

  useEffect(() => {
    // A completed run stays completed across a `lines` identity change (a
    // breakpoint reflow, say) — snap to the new full length instead of
    // re-typing from scratch.
    if (doneRef.current) {
      setState({ line: lines.length, char: 0, done: true });
      return;
    }
    if (reduced || !enabled || lines.length === 0) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let line = 0;
    let char = 0;

    function tick() {
      if (cancelled) return;
      const current = lines[line];

      if (char >= current.length) {
        if (line === lines.length - 1) {
          doneRef.current = true;
          setState({ line: lines.length, char: 0, done: true });
          return;
        }
        line += 1;
        char = 0;
        setState({ line, char, done: false });
        timer = setTimeout(tick, lineGapMs);
        return;
      }

      char += 1;
      setState({ line, char, done: false });
      const perChar = line === 0 ? firstLineMs : charMs;
      timer = setTimeout(tick, jitter(perChar, perChar * 0.55));
    }

    timer = setTimeout(tick, startDelayMs);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [lines, enabled, reduced, charMs, firstLineMs, lineGapMs, startDelayMs]);

  if (reduced) {
    return { line: lines.length, char: 0, done: true };
  }

  return state;
}

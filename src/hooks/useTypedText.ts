"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

type Options = {
  /** ms per character while typing */
  typeMs?: number;
  /** ms per character while deleting — deleting reads better slightly faster */
  deleteMs?: number;
  /** ms to sit on a completed phrase before erasing it */
  holdMs?: number;
  /** ms to sit on empty before the next phrase starts */
  gapMs?: number;
};

/**
 * Types a phrase out, holds, deletes it, moves to the next, forever.
 *
 * Timing is jittered by a few ms per character. A perfectly even cadence is
 * the tell that gives away a typing animation — real typing is uneven, and
 * the eye picks up on the difference even when it cannot name it.
 */
export function useTypedText(phrases: string[], options: Options = {}) {
  const { typeMs = 62, deleteMs = 28, holdMs = 1700, gapMs = 380 } = options;

  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduced || phrases.length === 0) return;

    const phrase = phrases[index % phrases.length];
    const jitter = (ms: number, spread: number) =>
      ms + (Math.random() - 0.5) * spread;

    let delay: number;
    let step: () => void;

    if (!deleting && text === phrase) {
      delay = holdMs;
      step = () => setDeleting(true);
    } else if (deleting && text === "") {
      delay = gapMs;
      step = () => {
        setDeleting(false);
        setIndex((i) => (i + 1) % phrases.length);
      };
    } else if (deleting) {
      delay = jitter(deleteMs, 16);
      step = () => setText((t) => t.slice(0, -1));
    } else {
      delay = jitter(typeMs, 36);
      step = () => setText(phrase.slice(0, text.length + 1));
    }

    const id = setTimeout(step, delay);
    return () => clearTimeout(id);
  }, [text, deleting, index, phrases, reduced, typeMs, deleteMs, holdMs, gapMs]);

  if (reduced) {
    return { text: phrases[0] ?? "", reduced: true as const };
  }

  return { text, reduced: false as const };
}

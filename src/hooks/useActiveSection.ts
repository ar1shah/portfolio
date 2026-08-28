"use client";

import { useSyncExternalStore } from "react";

/**
 * Where a section lands after an anchor jump: the `scroll-mt-28` (112px)
 * on each section. Nothing else may add to this — a `scroll-padding-top`
 * on <html> would stack with it and push targets to the sum.
 */
const ANCHOR_OFFSET = 112;

/**
 * Y coordinate that decides which section is "current".
 *
 * MUST sit below ANCHOR_OFFSET. If it sits above, a clicked section lands
 * *past* the line, fails the test, and the previous section keeps the
 * underline — every nav item appears to highlight the one before it.
 */
export const ACTIVE_LINE = ANCHOR_OFFSET + 38;

/**
 * Picks the active section from geometry alone.
 *
 * Pure and exported so the decision logic can be tested headlessly —
 * scroll events, IntersectionObserver, ResizeObserver and rAF are all
 * undeliverable in a document that is not compositing, so the only part of
 * this worth asserting on is the arithmetic.
 *
 * `tops` are viewport-relative rect tops, in the same order as `ids`.
 */
export function pickActive(
  ids: readonly string[],
  tops: readonly number[],
  atBottom: boolean,
): string {
  // At the very bottom the last section wins even though its top never
  // reaches the line — otherwise the final nav item can never activate.
  if (atBottom) return ids[ids.length - 1];

  let current = ids[0];
  for (let i = 0; i < ids.length; i++) {
    if (tops[i] <= ACTIVE_LINE) current = ids[i];
  }
  return current;
}

function readActive(ids: readonly string[]): string {
  const doc = document.documentElement;
  const atBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 2;
  const tops = ids.map((id) => {
    const el = document.getElementById(id);
    return el ? el.getBoundingClientRect().top : Number.POSITIVE_INFINITY;
  });
  return pickActive(ids, tops, atBottom);
}

/**
 * Tracks which section is currently under the header.
 *
 * Scroll events rather than IntersectionObserver: the bottom-of-page case
 * (a short final section whose top never crosses the line) needs explicit
 * handling that rootMargin tuning does not give cleanly, and four
 * getBoundingClientRect reads on a stable layout is not a meaningful cost.
 */
export function useActiveSection(ids: readonly string[]): string {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener("scroll", onChange, { passive: true });
      window.addEventListener("resize", onChange);
      return () => {
        window.removeEventListener("scroll", onChange);
        window.removeEventListener("resize", onChange);
      };
    },
    () => readActive(ids),
    () => ids[0],
  );
}

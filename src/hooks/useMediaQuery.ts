"use client";

import { useSyncExternalStore } from "react";

/**
 * Subscribes to a media query.
 *
 * Preferred over ResizeObserver for anything that must be *correct* rather
 * than merely responsive: matchMedia delivers synchronously and does not
 * depend on the page painting, whereas ResizeObserver notifications are
 * part of the rendering pipeline and never arrive in a document that is
 * not compositing frames.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    // The server cannot know. Callers must tolerate one frame of the
    // false branch.
    () => false,
  );
}

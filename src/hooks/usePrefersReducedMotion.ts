"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

// Returns a boolean primitive, so re-reading it every render is stable and
// does not retrigger the store.
function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

// The server cannot know the preference. Rendering the motion variant for
// the first paint is the safe default — anything reading this must tolerate
// one frame of it.
function getServerSnapshot() {
  return false;
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

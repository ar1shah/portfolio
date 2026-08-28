"use client";

import { useMediaQuery } from "./useMediaQuery";

/**
 * Server snapshot is `false`, so the motion variant renders for the first
 * frame. Anything reading this must tolerate that.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

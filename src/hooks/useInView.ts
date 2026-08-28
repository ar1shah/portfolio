"use client";

import { useCallback, useRef, useState } from "react";

type Options = {
  rootMargin?: string;
  threshold?: number;
};

/** Grace period before treating the element as in view even without an IO hit. */
const FALLBACK_MS = 1200;

/**
 * One-shot "has this element entered the viewport yet". Unlike
 * useActiveSection, which avoids IntersectionObserver for a specific reason
 * (there's no sentinel intersecting once you're scrolled past the last
 * section), this only needs a single enter event, so IO is the right tool.
 *
 * A fallback timer covers two cases IO alone can't: the API being
 * unavailable, and — per this repo's README — the in-editor browser
 * preview, where IntersectionObserver exists but its callback never fires.
 * Either way, after `FALLBACK_MS` the element is treated as in view rather
 * than staying invisible forever. The timer (not a `typeof
 * IntersectionObserver` check) is what keeps this hydration-safe: that
 * check is `true` on the server (no DOM) and `false` on the client, which
 * would make the initial state disagree between the two.
 */
export function useInView<T extends Element>(
  options: Options = {},
): [ref: (node: T | null) => void, inView: boolean] {
  const { rootMargin = "0px 0px -15% 0px", threshold = 0 } = options;
  const [inView, setInView] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const fallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (fallbackRef.current !== null) {
      clearTimeout(fallbackRef.current);
      fallbackRef.current = null;
    }
  }, []);

  const ref = useCallback(
    (node: T | null) => {
      cleanup();
      if (!node) return;

      fallbackRef.current = setTimeout(() => setInView(true), FALLBACK_MS);

      if (typeof IntersectionObserver === "undefined") return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setInView(true);
            cleanup();
          }
        },
        { rootMargin, threshold },
      );

      observer.observe(node);
      observerRef.current = observer;
    },
    [cleanup, rootMargin, threshold],
  );

  return [ref, inView];
}

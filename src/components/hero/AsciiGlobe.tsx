"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { decodeLand, renderGlobe, type Grid } from "./globe";
import { LAND } from "./land-mask";

/**
 * A globe projects to a circle, so the grid wants `rows ~= cols * 0.55`
 * (the character aspect) for the disc to come out round rather than as an
 * ellipse.
 */
const DESKTOP: Grid = { cols: 88, rows: 48 };
const MOBILE: Grid = { cols: 52, rows: 29 };

/** Radians per second — about 40s for a full rotation. */
const SPIN = 0.157;

/** Camera lean. Positive looks down on the north pole. */
const BASE_TILT = 0.35;
/** Stop the drag short of the poles; past this it reads as flipping over. */
const TILT_LIMIT = 1.0;

/** Radians of spin per full-width drag. */
const DRAG_SPIN = Math.PI * 1.6;
/** Radians of tilt per full-height drag. */
const DRAG_TILT = Math.PI * 0.55;

/** Cap on flick speed, rad/s, and how long it takes to bleed off. */
const MAX_FLICK = 4;
const FLICK_TAU = 0.7;

/** Largest frame delta to honour. Caps the jump when a tab returns. */
const MAX_DT = 0.05;

/** Longitude 81 W puts Orlando under the viewer at rest. */
const REST_SPIN = 1.42;

/** JetBrains Mono advance width, in em. */
const ADVANCE = 0.6;

const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;

export function AsciiGlobe({ className = "" }: { className?: string }) {
  const reduced = usePrefersReducedMotion();
  // matchMedia, not ResizeObserver: RO notifications are part of the
  // rendering pipeline and never fire in a document that is not
  // compositing, which would strand the wrong grid.
  const wide = useMediaQuery("(min-width: 640px)");
  const grid = wide ? DESKTOP : MOBILE;

  const land = useMemo(() => decodeLand(LAND), []);

  const boxRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLPreElement>(null);
  const markerRef = useRef<HTMLPreElement>(null);

  const state = useRef({
    spin: REST_SPIN,
    tilt: BASE_TILT,
    dragging: false,
    lastX: 0,
    lastY: 0,
    lastT: 0,
    /** Extra angular velocity left over from a flick, rad/s. */
    flick: 0,
  });

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    const st = state.current;

    const paint = () => {
      const { base, highlight } = renderGlobe(grid, st.spin, st.tilt, land);
      if (baseRef.current) baseRef.current.textContent = base;
      if (markerRef.current) markerRef.current.textContent = highlight;
    };

    /* ── drag ──────────────────────────────────────────────────────────
       Rotation is driven only by an actual drag on the globe. Tracking
       the cursor ambiently means the thing reacts to you crossing the
       page on your way to something else, which reads as twitchy.
       ---------------------------------------------------------------- */

    const onPointerDown = (e: PointerEvent) => {
      if (!e.isPrimary) return;
      st.dragging = true;
      st.lastX = e.clientX;
      st.lastY = e.clientY;
      st.lastT = e.timeStamp;
      st.flick = 0;
      // Capture so a drag that leaves the globe keeps working. Throws if
      // the pointer is not active, which is not worth failing the drag over.
      try {
        box.setPointerCapture(e.pointerId);
      } catch {
        // no capture; the drag still tracks while the pointer is over us
      }
      box.style.cursor = "grabbing";
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!st.dragging) return;
      const r = box.getBoundingClientRect();
      if (!r.width || !r.height) return;

      const dx = e.clientX - st.lastX;
      const dy = e.clientY - st.lastY;
      const dt = Math.max(1, e.timeStamp - st.lastT) / 1000;
      st.lastX = e.clientX;
      st.lastY = e.clientY;
      st.lastT = e.timeStamp;

      // Screen x of a point goes as sin(lon + spin), so dragging right and
      // increasing spin move the surface the same way — the globe follows
      // the finger instead of fighting it.
      const dSpin = (dx / r.width) * DRAG_SPIN;
      st.spin += dSpin;
      st.tilt = clamp(
        st.tilt + (dy / r.height) * DRAG_TILT,
        -TILT_LIMIT,
        TILT_LIMIT,
      );

      st.flick = clamp(dSpin / dt, -MAX_FLICK, MAX_FLICK);
      paint();
    };

    const endDrag = (e: PointerEvent) => {
      if (!st.dragging) return;
      st.dragging = false;
      try {
        if (box.hasPointerCapture(e.pointerId)) {
          box.releasePointerCapture(e.pointerId);
        }
      } catch {
        // nothing captured
      }
      box.style.cursor = "grab";
    };

    box.addEventListener("pointerdown", onPointerDown);
    box.addEventListener("pointermove", onPointerMove);
    box.addEventListener("pointerup", endDrag);
    box.addEventListener("pointercancel", endDrag);

    /* ── idle rotation ─────────────────────────────────────────────── */

    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);

      // Advance the clock before any early return, or skipped time piles up
      // and the globe lurches when it comes back into view.
      const dt = Math.min(MAX_DT, (now - last) / 1000);
      last = now;

      if (st.dragging) return; // the move handler is painting
      if (box.offsetParent === null) return;
      const r = box.getBoundingClientRect();
      if (r.bottom < -200 || r.top > window.innerHeight + 200) return;

      // Under reduced motion the globe holds still until someone drags it.
      // User-initiated movement is fine; unprompted movement is not.
      const drift = reduced ? 0 : SPIN;
      if (drift === 0 && st.flick === 0) return;

      st.spin += (drift + st.flick) * dt;
      // Exponential bleed-off — frame-rate independent by construction.
      st.flick *= Math.exp(-dt / FLICK_TAU);
      if (Math.abs(st.flick) < 0.001) st.flick = 0;

      paint();
    };

    box.style.cursor = "grab";
    paint();
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      box.removeEventListener("pointerdown", onPointerDown);
      box.removeEventListener("pointermove", onPointerMove);
      box.removeEventListener("pointerup", endDrag);
      box.removeEventListener("pointercancel", endDrag);
    };
  }, [grid, land, reduced]);

  // Width of the glyph block in em. Type size is derived from it in CSS so
  // the text always exactly fills the box, with no JS measurement involved.
  const emWidth = grid.cols * ADVANCE;

  // Absolutely positioned so the glyphs never contribute intrinsic width.
  // Left in flow, an 88-column <pre> forces its container wider than the
  // viewport and the whole page picks up a horizontal scrollbar.
  const preClass =
    "absolute inset-0 m-0 whitespace-pre font-mono leading-[1] select-none";
  const preStyle = { fontSize: `calc(100cqw / ${emWidth})` };

  return (
    <div
      ref={boxRef}
      aria-hidden
      className={`relative w-full min-w-0 overflow-hidden ${className}`}
      style={{
        // Children size themselves against this box's inline size.
        containerType: "inline-size",
        // Height follows the grid, not the text, so the box is sized before
        // a single character is painted.
        aspectRatio: `${emWidth} / ${grid.rows}`,
        // pan-y, not none: a horizontal drag spins the globe, but a vertical
        // swipe still scrolls the page. Locking both traps touch users on a
        // decorative element.
        touchAction: "pan-y",
      }}
    >
      <pre ref={baseRef} className={`${preClass} text-ink-dim`} style={preStyle} />
      <pre
        ref={markerRef}
        className={`${preClass} text-accent`}
        style={preStyle}
      />
    </div>
  );
}

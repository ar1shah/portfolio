"use client";

import { forwardRef } from "react";
import type { Icon } from "./icon-paths";

type Props = {
  icon: Icon;
  /** 0..1 normalized position within the cluster box */
  x: number;
  y: number;
  /** px, already resolved for the current breakpoint */
  size: number;
  active: boolean;
  dimmed: boolean;
  onToggle: () => void;
};

/**
 * The outer element owns layout position; the ref'd element owns the
 * per-frame drift transform written by the rAF loop. Keeping those on
 * separate nodes means the animation never fights the layout.
 *
 * Brand color rides in on a `--brand` custom property so the hover and
 * active states are pure CSS — see `.skill-mark` in globals.css.
 */
export const SkillNode = forwardRef<HTMLDivElement, Props>(function SkillNode(
  { icon, x, y, size, active, dimmed, onToggle },
  ref,
) {
  return (
    /* toFixed so the serialized string is identical on server and client —
       `0.5539 * 100` is `55.38999999999999`, and float noise like that
       surfaces as a hydration mismatch. */
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${(x * 100).toFixed(3)}%`, top: `${(y * 100).toFixed(3)}%` }}
    >
      <div ref={ref} className="will-change-transform">
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={active}
          data-active={active || undefined}
          style={
            {
              width: size,
              height: size,
              "--brand": `#${icon.hex}`,
            } as React.CSSProperties
          }
          className={`skill-node group relative grid place-items-center transition-opacity duration-300 ${
            dimmed ? "opacity-25" : "opacity-100"
          } ${active ? "z-30" : "hover:z-30 focus-visible:z-30"}`}
        >
          <span className="skill-tile grid h-full w-full place-items-center border border-rule bg-raised/60 transition-[transform,border-color] duration-300 ease-out">
            <svg
              viewBox="0 0 24 24"
              width={size * 0.44}
              height={size * 0.44}
              aria-hidden
              className="skill-mark"
            >
              <path d={icon.path} />
            </svg>
          </span>

          <span
            aria-hidden
            className="skill-label pointer-events-none absolute left-1/2 top-full mt-2.5 -translate-x-1/2 whitespace-nowrap border border-rule bg-ground px-2 py-1 font-mono text-[10px] tracking-[0.08em] text-ink opacity-0 transition-opacity duration-200">
            {icon.label}
          </span>

          <span className="sr-only">{icon.label}</span>
        </button>
      </div>
    </div>
  );
});

"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { icons, type Icon } from "./icon-paths";
import { SkillNode } from "./SkillNode";
import { SectionLabel } from "@/components/site/SectionLabel";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** Sit nearer the middle and render larger — these are the load-bearing ones. */
const CORE = new Set([
  "typescript",
  "react",
  "nextdotjs",
  "nodedotjs",
  "postgresql",
  "python",
  "tailwindcss",
  "supabase",
]);

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/** Deterministic PRNG — the layout must be identical on server and client. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Placed = {
  icon: Icon;
  x: number;
  y: number;
  scale: number;
  /** idle drift params */
  phase: number;
  speed: number;
  amp: number;
};

/**
 * Phyllotaxis spiral, squashed to an ellipse and jittered. Gives even
 * coverage with no two nodes landing on a visible row or ring, which is
 * what makes it read as organic rather than as a grid someone rotated.
 */
function buildLayout(): Placed[] {
  const ordered = [...icons].sort((a, b) => {
    const d = Number(CORE.has(b.slug)) - Number(CORE.has(a.slug));
    return d !== 0 ? d : a.slug.localeCompare(b.slug);
  });

  const rand = mulberry32(0x5eed);
  const n = ordered.length;

  return ordered.map((icon, i) => {
    // sqrt keeps density uniform across the disc instead of clumping center
    const r = Math.sqrt((i + 0.5) / n);
    const a = i * GOLDEN_ANGLE;

    const jx = (rand() - 0.5) * 0.035;
    const jy = (rand() - 0.5) * 0.035;

    // Rounded before it ever reaches a style attribute. Full float precision
    // gets serialized differently on server and client, which React reports
    // as a hydration mismatch.
    const round = (v: number) => Number(v.toFixed(4));

    return {
      icon,
      x: round(0.5 + Math.cos(a) * r * 0.44 + jx),
      y: round(0.5 + Math.sin(a) * r * 0.4 + jy),
      scale: round(CORE.has(icon.slug) ? 1.16 : 0.92 + rand() * 0.1),
      phase: rand() * Math.PI * 2,
      speed: 0.22 + rand() * 0.2,
      amp: 3.2 + rand() * 3.4,
    };
  });
}

const LAYOUT = buildLayout();

// Repulsion radius and strength, in px.
const RADIUS = 165;
const STRENGTH = 52;
// Critically-ish damped spring.
const STIFFNESS = 0.11;
const DAMPING = 0.84;

export function SkillCluster() {
  const reduced = usePrefersReducedMotion();
  const [pinned, setPinned] = useState<string | null>(null);
  const [nodeSize, setNodeSize] = useState(46);

  const boxRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pointer = useRef<{ x: number; y: number; on: boolean }>({
    x: 0,
    y: 0,
    on: false,
  });
  const motion = useRef(
    LAYOUT.map(() => ({ ox: 0, oy: 0, vx: 0, vy: 0 })),
  );

  // Node size tracks container width so the cluster stays proportional
  // between the sm breakpoint and a wide desktop.
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;

    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setNodeSize(Math.max(36, Math.min(62, w / 11.5)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (reduced) return;

    const el = boxRef.current;
    if (!el) return;

    let raf = 0;
    let rect = el.getBoundingClientRect();

    const onPointerMove = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY, on: true };
    };
    const onPointerLeave = () => {
      pointer.current.on = false;
    };
    // Touch drives hover states poorly; leaving repulsion off on touch keeps
    // the cluster from lurching when someone is just scrolling past it.
    const onTouch = () => {
      pointer.current.on = false;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onTouch, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);

      // Hidden below the sm breakpoint — skip the work entirely.
      if (el.offsetParent === null) return;

      rect = el.getBoundingClientRect();

      // Off-screen: keep the loop alive but do nothing expensive.
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;

      const t = now / 1000;
      const p = pointer.current;

      for (let i = 0; i < LAYOUT.length; i++) {
        const node = nodeRefs.current[i];
        if (!node) continue;

        const cfg = LAYOUT[i];
        const m = motion.current[i];

        const idleX = Math.sin(t * cfg.speed + cfg.phase) * cfg.amp;
        const idleY = Math.cos(t * cfg.speed * 0.83 + cfg.phase * 1.7) * cfg.amp;

        let repelX = 0;
        let repelY = 0;

        if (p.on) {
          const baseX = rect.left + cfg.x * rect.width;
          const baseY = rect.top + cfg.y * rect.height;
          const dx = baseX + m.ox - p.x;
          const dy = baseY + m.oy - p.y;
          const dist = Math.hypot(dx, dy) || 1;

          if (dist < RADIUS) {
            // Squared falloff — a linear one feels rubbery at the edge
            const falloff = (1 - dist / RADIUS) ** 2;
            repelX = (dx / dist) * falloff * STRENGTH;
            repelY = (dy / dist) * falloff * STRENGTH;
          }
        }

        const targetX = idleX + repelX;
        const targetY = idleY + repelY;

        m.vx = (m.vx + (targetX - m.ox) * STIFFNESS) * DAMPING;
        m.vy = (m.vy + (targetY - m.oy) * STIFFNESS) * DAMPING;
        m.ox += m.vx;
        m.oy += m.vy;

        node.style.transform = `translate3d(${m.ox.toFixed(2)}px, ${m.oy.toFixed(2)}px, 0)`;
      }
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onTouch);
      document.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [reduced]);

  const toggle = useCallback((slug: string) => {
    setPinned((cur) => (cur === slug ? null : slug));
  }, []);

  return (
    <section id="stack" className="shell scroll-mt-24 py-20">
      <SectionLabel index="03">stack</SectionLabel>

      <p className="mt-8 max-w-[34rem] text-[0.95rem] leading-[1.7] text-ink-dim">
        Thirty-odd things I have actually shipped with. Hover to name one, click
        to hold it.
      </p>

      {/* Cluster — enhancement for pointer-friendly widths */}
      <div
        ref={boxRef}
        onClick={(e) => {
          if (e.target === e.currentTarget) setPinned(null);
        }}
        className="relative mt-10 hidden aspect-[16/9] max-h-[540px] w-full sm:block"
      >
        {LAYOUT.map((placed, i) => (
          <SkillNode
            key={placed.icon.slug}
            ref={(el) => {
              nodeRefs.current[i] = el;
            }}
            icon={placed.icon}
            x={placed.x}
            y={placed.y}
            size={nodeSize * placed.scale}
            active={pinned === placed.icon.slug}
            dimmed={pinned !== null && pinned !== placed.icon.slug}
            onToggle={() => toggle(placed.icon.slug)}
          />
        ))}
      </div>

      {/* Small screens get the same content as an honest list — no cramped
          cluster, no hidden information. */}
      <ul className="mt-10 flex flex-wrap gap-2 sm:hidden">
        {icons.map((icon) => (
          <li
            key={icon.slug}
            className="flex items-center gap-2 border border-rule px-2.5 py-1.5"
          >
            <svg viewBox="0 0 24 24" width={13} height={13} aria-hidden style={{ fill: `#${icon.hex}` }}>
              <path d={icon.path} />
            </svg>
            <span className="font-mono text-[11px] text-ink-dim">{icon.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

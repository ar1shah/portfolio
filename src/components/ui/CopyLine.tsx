"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  /** Shown before the value, dimmed. Not part of what gets copied. */
  prompt?: string;
  className?: string;
};

export function CopyLine({ value, prompt = "$", className = "" }: Props) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      // Clipboard API is unavailable over plain http and in some embedded
      // webviews. Say so rather than showing a false success.
      setState("failed");
    }
    timer.current = setTimeout(() => setState("idle"), 1800);
  }

  const hint =
    state === "copied" ? "copied" : state === "failed" ? "copy failed" : "copy";

  return (
    <button
      type="button"
      onClick={copy}
      className={`group inline-flex items-center gap-3 font-mono text-[12px] sm:text-[13px] text-ink-dim hover:text-ink transition-colors duration-200 ${className}`}
    >
      <span className="select-none text-ink-dim group-hover:text-ink transition-colors duration-200">
        {prompt}
      </span>
      <span className="text-ink">{value}</span>
      <span
        aria-hidden
        className={`text-[10px] uppercase tracking-[0.14em] transition-colors duration-200 ${
          state === "copied" ? "text-accent" : "text-ink-dim group-hover:text-ink"
        }`}
      >
        [{hint}]
      </span>
      {/* Announced without needing the visual chip to be readable */}
      <span aria-live="polite" className="sr-only">
        {state === "copied"
          ? `Copied ${value} to clipboard`
          : state === "failed"
            ? "Copy failed"
            : ""}
      </span>
    </button>
  );
}

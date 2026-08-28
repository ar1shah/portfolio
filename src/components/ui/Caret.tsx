"use client";

const CARET_CLASS =
  "ml-[2px] inline-block w-[0.52em] h-[0.92em] translate-y-[0.12em] bg-accent";

export function Caret({ blink }: { blink: boolean }) {
  return (
    <span aria-hidden className={`${CARET_CLASS} ${blink ? "animate-caret" : ""}`} />
  );
}

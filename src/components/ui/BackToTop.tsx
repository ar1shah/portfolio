"use client";

export function BackToTop() {
  return (
    <button
      type="button"
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
        })
      }
      className="group inline-flex flex-col items-center gap-2"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-rule text-ink-dim transition-colors duration-200 group-hover:border-accent group-hover:text-accent">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 19V5M12 5l-6 6M12 5l6 6"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="chrome text-ink-dim group-hover:text-ink transition-colors duration-200">
        back to top
      </span>
    </button>
  );
}

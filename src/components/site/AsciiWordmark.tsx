import { profile } from "@/content/profile";

/**
 * Half-block wordmark for ar13.dev. Two rows so it can sit inside a header
 * without becoming a banner — the tradeoff is that it needs the glyphs to
 * land on an exact monospace grid, hence the fixed line-height and the
 * per-glyph padding baked into the strings below.
 *
 * Rows are equal width (28 cols). If you edit one, edit both.
 */
const ROW_TOP = "▄▀█ █▀█ ▄█ ▀▀█   █▀▄ █▀▀ █░█";
const ROW_BOTTOM = "█▀█ █▀▄ ░█ ▄▄█ ▄ █▄▀ ██▄ ▀▄▀";

type Props = {
  /** header: tiny and crisp. footer: the same mark, given room to breathe. */
  variant?: "header" | "footer";
  className?: string;
};

export function AsciiWordmark({ variant = "header", className = "" }: Props) {
  const isHeader = variant === "header";

  return (
    <span className={`inline-flex items-center ${className}`}>
      <span
        aria-hidden
        className={
          isHeader
            ? "hidden sm:block font-mono leading-[1.05] text-[9px] tracking-[0.02em] whitespace-pre text-ink"
            : "block font-mono leading-[1.05] text-[11px] sm:text-[15px] md:text-[18px] tracking-[0.02em] whitespace-pre text-ink-dim"
        }
      >
        {ROW_TOP}
        {"\n"}
        {ROW_BOTTOM}
      </span>

      {/* Below sm the blocks get illegible, so the header falls back to type. */}
      {isHeader && (
        <span
          aria-hidden
          className="sm:hidden font-mono text-[13px] tracking-tight text-ink"
        >
          {profile.handle}
        </span>
      )}

      <span className="sr-only">{profile.handle}</span>
    </span>
  );
}

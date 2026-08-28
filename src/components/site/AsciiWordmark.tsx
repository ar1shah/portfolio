import { profile } from "@/content/profile";

/**
 * figlet "slant" rendering of ar13.dev. Five rows, every one exactly 38
 * columns, so the block is a clean rectangle and positions predictably.
 *
 * Written as plain double-quoted strings with `\` doubled — deliberately
 * NOT String.raw. Row 3 contains a backtick, and escaping a backtick inside
 * a raw template leaves the backslash in the output, which would corrupt
 * the art. Trailing spaces are load-bearing: they keep all five rows the
 * same width.
 */
const ART = [
  "             ________      __         ",
  "  ____ _____<  /__  / ____/ /__ _   __",
  " / __ `/ ___/ / /_ < / __  / _ \\ | / /",
  "/ /_/ / /  / /___/ // /_/ /  __/ |/ / ",
  "\\__,_/_/  /_//____(_)__,_/\\___/|___/  ",
].join("\n");

type Props = {
  /** header: small and crisp. footer: the same mark, given room. */
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
            ? // 38ch * 0.6em advance * 8.5px = ~194px wide, 5 rows = ~43px tall
              "hidden sm:block font-mono text-[8.5px] leading-[1] whitespace-pre text-ink"
            : "block font-mono text-[11px] sm:text-[14px] md:text-[16px] leading-[1] whitespace-pre text-ink-dim"
        }
      >
        {ART}
      </span>

      {/* Below sm the strokes collapse into mush, so the header uses type. */}
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

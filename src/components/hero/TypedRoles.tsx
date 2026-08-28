"use client";

import { useTypedText } from "@/hooks/useTypedText";
import { Caret } from "@/components/ui/Caret";

type Props = {
  phrases: readonly string[];
};

export function TypedRoles({ phrases }: Props) {
  const list = phrases as string[];
  const { text, reduced } = useTypedText(list);

  // The longest phrase reserves the line width so nothing to the right of
  // the cursor moves while it types. The sizing copy carries a caret too —
  // without it the line still jumps by exactly the caret's width whenever
  // the typed phrase is within one character of the longest.
  const longest = list.reduce((a, b) => (b.length > a.length ? b : a), "");

  return (
    <span className="inline-grid align-baseline">
      <span
        aria-hidden
        className="col-start-1 row-start-1 invisible whitespace-pre"
      >
        {longest}
        <Caret blink={false} />
      </span>

      <span className="col-start-1 row-start-1 whitespace-pre">
        {/* Screen readers get one stable phrase, not a character-by-character
            stream of updates. The first role is the canonical one. */}
        <span className="sr-only">{list[0]}</span>
        <span aria-hidden>{text}</span>
        <Caret blink={!reduced} />
      </span>
    </span>
  );
}

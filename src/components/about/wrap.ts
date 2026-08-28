export type Segment = { text: string; accent: boolean };

/**
 * Greedy word wrap to `cols` columns. `atomic`, if given, is treated as a
 * single unbreakable token so it can never straddle a line break — needed
 * here so the accent phrase always prints as one intact run.
 */
export function wrapToColumns(text: string, cols: number, atomic?: string): string[] {
  const words = atomic ? tokenizeWithAtomic(text, atomic) : text.split(" ");

  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= cols || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);

  return lines;
}

/** Splits `words[i]` runs so the atomic phrase re-joins into one token. */
function tokenizeWithAtomic(text: string, atomic: string): string[] {
  const at = text.indexOf(atomic);
  if (at === -1) return text.split(" ");

  const before = text.slice(0, at).trimEnd();
  const after = text.slice(at + atomic.length).trimStart();

  return [
    ...(before ? before.split(" ") : []),
    atomic,
    ...(after ? after.split(" ") : []),
  ];
}

/**
 * Splits one wrapped line into accent / non-accent runs, so the caller can
 * render the accent phrase in a different color without breaking it out of
 * the character-reveal flow. Degrades to a single non-accent run if the
 * phrase isn't on this line, or isn't found at all.
 */
export function segmentLine(line: string, accent: string): Segment[] {
  const at = line.indexOf(accent);
  if (at === -1) return [{ text: line, accent: false }];

  const segments: Segment[] = [];
  if (at > 0) segments.push({ text: line.slice(0, at), accent: false });
  segments.push({ text: accent, accent: true });
  const rest = line.slice(at + accent.length);
  if (rest) segments.push({ text: rest, accent: false });

  return segments;
}

/**
 * `segmentLine`, but truncated to the first `limit` characters of the line —
 * for revealing a line mid-type without breaking the accent run apart.
 * `limit === undefined` returns the full line, unchanged.
 */
export function revealSegments(line: string, accent: string, limit?: number): Segment[] {
  const full = segmentLine(line, accent);
  if (limit === undefined) return full;

  const result: Segment[] = [];
  let remaining = limit;
  for (const seg of full) {
    if (remaining <= 0) break;
    if (seg.text.length <= remaining) {
      result.push(seg);
      remaining -= seg.text.length;
    } else {
      result.push({ text: seg.text.slice(0, remaining), accent: seg.accent });
      remaining = 0;
    }
  }
  return result;
}

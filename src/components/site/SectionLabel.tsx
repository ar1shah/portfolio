type Props = {
  /** Two-digit ordinal, e.g. "01". */
  index: string;
  children: string;
  className?: string;
};

/**
 * Sits deliberately off the content grid — the number hangs left of the
 * text column on wide viewports so the section headers do not line up
 * with everything else.
 */
export function SectionLabel({ index, children, className = "" }: Props) {
  return (
    <div className={`flex items-baseline gap-4 ${className}`}>
      <span className="chrome text-accent">{index}</span>
      <span className="chrome text-ink-dim">{children}</span>
      <span aria-hidden className="flex-1 h-px bg-rule translate-y-[-3px]" />
    </div>
  );
}

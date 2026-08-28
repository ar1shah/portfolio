import { profile } from "@/content/profile";
import { PhotoFrame } from "@/components/hero/PhotoFrame";

/**
 * Splits the intro around its accent phrase so that phrase can be set in
 * Instrument Serif italic. If the phrase is not found the paragraph renders
 * unchanged rather than breaking.
 */
function IntroText() {
  const { intro, introAccent } = profile;
  const at = intro.indexOf(introAccent);

  if (at === -1) return <>{intro}</>;

  return (
    <>
      {intro.slice(0, at)}
      <em className="font-serif italic text-ink">{introAccent}</em>
      {intro.slice(at + introAccent.length)}
    </>
  );
}

export function AboutBlock() {
  return (
    <section className="shell pb-20">
      <div className="hairline grid gap-10 pt-14 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-14 sm:items-center">
        <PhotoFrame />

        <div className="max-w-[34rem]">
          <p className="text-[1.0625rem] leading-[1.75] text-ink-dim">
            <IntroText />
          </p>
        </div>
      </div>
    </section>
  );
}

import { profile } from "@/content/profile";
import { TypedRoles } from "./TypedRoles";
import { PhotoFrame } from "./PhotoFrame";
import { ExternalLink } from "@/components/ui/ExternalLink";

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
      <em className="font-serif italic text-ink">
        {introAccent}
      </em>
      {intro.slice(at + introAccent.length)}
    </>
  );
}

function ArrowLink({
  href,
  children,
  external,
}: {
  href: string;
  children: string;
  external?: boolean;
}) {
  const inner = (
    <>
      <span>{children}</span>
      <span
        aria-hidden
        className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1"
      >
        →
      </span>
    </>
  );
  const cls =
    "group inline-flex items-center gap-2 font-mono text-[13px] text-ink-dim hover:text-ink transition-colors duration-200";

  return external ? (
    <ExternalLink href={href} className={cls}>
      {inner}
    </ExternalLink>
  ) : (
    <a href={href} className={cls} target="_blank" rel="noopener">
      {inner}
    </a>
  );
}

export function Hero() {
  return (
    <section className="shell pt-16 pb-24 sm:pt-24 sm:pb-32">
      <div className="grid gap-14 md:grid-cols-[minmax(0,1fr)_auto] md:gap-20 md:items-start">
        <div className="max-w-[36rem]">
          <p className="chrome text-ink-dim mb-6">
            {profile.location} · Available May 2027
          </p>

          <h1 className="font-sans font-medium tracking-[-0.035em] leading-[0.95] text-[clamp(3rem,9vw,5.25rem)]">
            {profile.name}
          </h1>

          <p className="mt-6 text-[clamp(1.05rem,2.4vw,1.4rem)] text-ink-dim">
            I am a{" "}
            <span className="text-ink">
              <TypedRoles phrases={profile.roles} />
            </span>
          </p>

          <p className="mt-8 text-[1.0625rem] leading-[1.7] text-ink-dim">
            <IntroText />
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <ArrowLink href={profile.links.resume}>Résumé</ArrowLink>
            <ArrowLink href={`mailto:${profile.email}`}>Email</ArrowLink>
            <ArrowLink href={profile.links.github} external>
              GitHub
            </ArrowLink>
          </div>
        </div>

        <div className="md:pt-4 md:justify-self-end">
          <PhotoFrame />
        </div>
      </div>
    </section>
  );
}

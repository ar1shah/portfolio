import { profile } from "@/content/profile";
import { TypedRoles } from "./TypedRoles";
import { AsciiGlobe } from "./AsciiGlobe";
import { ExternalLink } from "@/components/ui/ExternalLink";

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
    "group inline-flex items-center gap-2 border border-rule px-4 py-2.5 font-mono text-[13px] text-ink-dim transition-colors duration-200 hover:border-ink-dim hover:text-ink";

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
    <section id="about" className="shell scroll-mt-28 pt-14 pb-20 sm:pt-20 sm:pb-24">
      <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)] md:gap-16 md:items-center">
        <div className="max-w-[36rem]">
          <p className="chrome text-ink-dim mb-6">{profile.location}</p>

          <h1 className="font-sans font-medium tracking-[-0.035em] leading-[0.95] text-[clamp(3rem,9vw,5.25rem)]">
            {profile.name}
          </h1>

          <p className="mt-6 text-[clamp(1.05rem,2.4vw,1.4rem)] text-ink-dim">
            I am a{" "}
            <span className="text-ink">
              <TypedRoles phrases={profile.roles} />
            </span>
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <ArrowLink href={profile.links.resume}>Résumé</ArrowLink>
            <ArrowLink href={profile.links.github} external>
              GitHub
            </ArrowLink>
          </div>
        </div>

        {/* Decorative. The page reads identically without it. */}
        <AsciiGlobe className="mx-auto w-full max-w-[420px]" />
      </div>
    </section>
  );
}

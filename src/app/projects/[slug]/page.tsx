import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  adjacentCaseStudies,
  caseStudies,
  getProject,
} from "@/content/projects";
import { ExternalLink } from "@/components/ui/ExternalLink";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return caseStudies.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project?.caseStudy) return {};

  return {
    title: project.name,
    description: project.blurb,
    openGraph: {
      title: `${project.name} — ar13.dev`,
      description: project.blurb,
      type: "article",
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = getProject(slug);

  // Projects without a write-up have no page — they link straight to GitHub
  // from the home grid.
  if (!project?.caseStudy) notFound();

  const { caseStudy } = project;
  const { prev, next } = adjacentCaseStudies(slug);

  return (
    <article className="shell py-14 sm:py-20">
      <Link
        href="/#projects"
        className="font-mono text-[12px] text-ink-dim hover:text-ink transition-colors duration-200"
      >
        ← All work
      </Link>

      <header className="mt-12 border-b border-rule pb-10">
        <div className="flex items-baseline justify-between gap-6">
          <h1 className="font-sans text-[clamp(2.25rem,7vw,4rem)] font-medium tracking-[-0.035em] leading-[0.98]">
            {project.name}
          </h1>
          <span className="chrome text-ink-dim shrink-0">{project.year}</span>
        </div>

        <p className="mt-7 max-w-[42rem] text-[1.0625rem] leading-[1.7] text-ink-dim">
          {caseStudy.lede}
        </p>

        <ul className="mt-8 flex flex-wrap gap-x-3 gap-y-2">
          {project.tech.map((t) => (
            <li
              key={t}
              className="font-mono text-[10.5px] tracking-[0.06em] text-ink-dim border border-rule px-2 py-1"
            >
              {t}
            </li>
          ))}
        </ul>

        <div className="mt-9 flex flex-wrap items-center gap-6">
          {project.live && (
            <ExternalLink
              href={project.live}
              className="font-mono text-[12px] text-accent hover:text-ink transition-colors duration-200"
            >
              Live ↗
            </ExternalLink>
          )}
          <ExternalLink
            href={project.repo}
            className="font-mono text-[12px] text-ink hover:text-accent transition-colors duration-200"
          >
            Source ↗
          </ExternalLink>
        </div>
      </header>

      <div className="mt-14 grid gap-y-12 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-x-12">
        {caseStudy.sections.map((section) => (
          <section key={section.label} className="contents">
            <h2 className="chrome text-ink-dim md:pt-1.5">{section.label}</h2>
            <div className="flex flex-col gap-4 max-w-[42rem]">
              {section.body.map((p) => (
                <p key={p} className="text-[1.0625rem] leading-[1.75] text-ink-dim">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      {caseStudy.shots.length > 0 && (
        <div className="mt-20 flex flex-col gap-10">
          {caseStudy.shots.map((shot, i) => (
            <figure key={`${shot.src}-${i}`}>
              <div className="border border-rule bg-raised p-2">
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  width={1600}
                  height={1000}
                  sizes="(max-width: 1180px) 100vw, 1132px"
                  className="w-full h-auto"
                />
              </div>
              {shot.caption && (
                <figcaption className="mt-3 font-mono text-[11px] text-ink-dim">
                  {shot.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}

      <nav
        aria-label="Other case studies"
        className="mt-20 grid gap-6 border-t border-rule pt-8 sm:grid-cols-2"
      >
        {prev && (
          <Link href={`/projects/${prev.slug}`} className="group">
            <span className="chrome text-ink-dim">← Previous</span>
            <p className="mt-2 font-sans text-[1.25rem] font-medium tracking-[-0.02em] transition-colors duration-200 group-hover:text-accent">
              {prev.name}
            </p>
          </Link>
        )}
        {next && (
          <Link href={`/projects/${next.slug}`} className="group sm:text-right">
            <span className="chrome text-ink-dim">Next →</span>
            <p className="mt-2 font-sans text-[1.25rem] font-medium tracking-[-0.02em] transition-colors duration-200 group-hover:text-accent">
              {next.name}
            </p>
          </Link>
        )}
      </nav>
    </article>
  );
}

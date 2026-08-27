import Link from "next/link";
import type { Project } from "@/content/projects";
import { ExternalLink } from "@/components/ui/ExternalLink";

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const hasCase = Boolean(project.caseStudy);

  return (
    <article className="group relative flex flex-col border-t border-rule pt-6 pb-8">
      {/* The accent rule grows across the top on hover. It is the only
          motion on the card — the card itself does not lift or scale. */}
      <span
        aria-hidden
        className="absolute -top-px left-0 h-px w-0 bg-accent transition-[width] duration-500 ease-out group-hover:w-full"
      />

      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-sans text-[1.5rem] font-medium tracking-[-0.02em] leading-tight">
          {hasCase ? (
            <Link
              href={`/projects/${project.slug}`}
              className="transition-colors duration-200 hover:text-accent"
            >
              {project.name}
              {/* Stretches the link over the whole card so the entire cell
                  is clickable, without nesting the action links inside it. */}
              <span className="absolute inset-0" aria-hidden />
            </Link>
          ) : (
            project.name
          )}
        </h3>
        <span className="chrome text-ink-dim shrink-0">
          {String(index + 1).padStart(2, "0")} · {project.year}
        </span>
      </div>

      <p className="mt-3 text-[0.95rem] leading-[1.65] text-ink-dim">
        {project.blurb}
      </p>

      <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-2">
        {project.tech.map((t) => (
          <li
            key={t}
            className="font-mono text-[10.5px] tracking-[0.06em] text-ink-dim border border-rule px-2 py-1"
          >
            {t}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-6 flex items-center gap-6">
        {hasCase && (
          <Link
            href={`/projects/${project.slug}`}
            className="relative z-10 font-mono text-[12px] text-ink hover:text-accent transition-colors duration-200"
          >
            Details →
          </Link>
        )}
        <ExternalLink
          href={project.repo}
          className="relative z-10 font-mono text-[12px] text-ink-dim hover:text-ink transition-colors duration-200"
          aria-label={`${project.name} source on GitHub`}
        >
          Code ↗
        </ExternalLink>
      </div>
    </article>
  );
}

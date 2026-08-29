"use client";

import { useState } from "react";
import { projects } from "@/content/projects";
import { ProjectCard } from "./ProjectCard";

const PER_PAGE = 4;

function ProjectPlaceholder() {
  return (
    <article
      aria-hidden
      className="flex flex-col border-t border-rule pt-6 pb-8 opacity-40"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-sans text-[1.5rem] font-medium tracking-[-0.02em] leading-tight text-ink-dim">
          Coming soon
        </h3>
        <span className="chrome text-ink-dim shrink-0">TBA</span>
      </div>

      <p className="mt-3 text-[0.95rem] leading-[1.65] text-ink-dim">
        More projects are on the way.
      </p>

      <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-2">
        <li className="font-mono text-[10.5px] tracking-[0.06em] text-ink-dim border border-rule px-2 py-1">
          TBA
        </li>
      </ul>

      <div className="mt-auto pt-6 flex items-center gap-6">
        <span className="font-mono text-[12px] text-ink-dim">Details →</span>
        <span className="font-mono text-[12px] text-ink-dim">Code ↗</span>
      </div>
    </article>
  );
}

export function PagedProjects() {
  const pageCount = Math.ceil(projects.length / PER_PAGE);
  const [page, setPage] = useState(0);
  const many = pageCount > 1;

  const start = page * PER_PAGE;
  const pageProjects = projects.slice(start, start + PER_PAGE);
  const placeholderCount = PER_PAGE - pageProjects.length;

  return (
    <>
      <div
        key={page}
        className="mt-12 grid animate-rise gap-x-12 gap-y-2 md:grid-cols-2"
      >
        {pageProjects.map((p, i) => (
          <ProjectCard key={p.slug} project={p} index={start + i} />
        ))}
        {Array.from({ length: placeholderCount }, (_, i) => (
          <ProjectPlaceholder key={`placeholder-${i}`} />
        ))}
      </div>

      {many && (
        <nav
          aria-label="Project pages"
          className="mt-10 flex items-center justify-center gap-4"
        >
          <button
            type="button"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
            aria-label="Previous projects"
            className="font-mono text-[12px] text-ink-dim transition-colors duration-200 hover:text-ink disabled:pointer-events-none disabled:opacity-40"
          >
            ←
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i)}
                aria-label={`Page ${i + 1}`}
                aria-current={page === i ? "true" : undefined}
                className={`h-[3px] transition-[width,background-color] duration-300 ${
                  page === i ? "w-6 bg-accent" : "w-1.5 bg-rule"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={page === pageCount - 1}
            aria-label="Next projects"
            className="font-mono text-[12px] text-ink-dim transition-colors duration-200 hover:text-ink disabled:pointer-events-none disabled:opacity-40"
          >
            →
          </button>

          <span className="sr-only" role="status">
            Page {page + 1} of {pageCount}
          </span>
        </nav>
      )}
    </>
  );
}

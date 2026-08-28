import { projects } from "@/content/projects";
import { ProjectCard } from "./ProjectCard";
import { SectionLabel } from "@/components/site/SectionLabel";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { profile } from "@/content/profile";

export function ProjectGrid() {
  return (
    <section id="projects" className="shell scroll-mt-28 py-20">
      <SectionLabel index="01">projects</SectionLabel>

      <div className="mt-12 grid gap-x-12 gap-y-2 md:grid-cols-2">
        {projects.map((p, i) => (
          <ProjectCard key={p.slug} project={p} index={i} />
        ))}
      </div>

      <div className="mt-10 border-t border-rule pt-6">
        <ExternalLink
          href={profile.links.github}
          className="font-mono text-[12px] text-ink-dim hover:text-ink transition-colors duration-200"
        >
          Everything else on GitHub ↗
        </ExternalLink>
      </div>
    </section>
  );
}

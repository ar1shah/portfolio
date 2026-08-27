import { Hero } from "@/components/hero/Hero";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { Timeline } from "@/components/experience/Timeline";
import { SkillCluster } from "@/components/skills/SkillCluster";

export default function Home() {
  return (
    <>
      <Hero />
      <ProjectGrid />
      <Timeline />
      <SkillCluster />
    </>
  );
}

import { Hero } from "@/components/hero/Hero";
import { AboutBlock } from "@/components/about/AboutBlock";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { Timeline } from "@/components/experience/Timeline";
import { SkillCluster } from "@/components/skills/SkillCluster";

export default function Home() {
  return (
    <>
      <Hero />
      <AboutBlock />
      <ProjectGrid />
      <Timeline />
      <SkillCluster />
    </>
  );
}

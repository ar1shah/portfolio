import { Hero } from "@/components/hero/Hero";
import { AboutBlock } from "@/components/about/AboutBlock";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { Timeline } from "@/components/experience/Timeline";

export default function Home() {
  return (
    <>
      <Hero />
      <AboutBlock />
      <ProjectGrid />
      <Timeline />
    </>
  );
}

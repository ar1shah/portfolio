import { experience } from "@/content/experience";
import { SectionLabel } from "@/components/site/SectionLabel";
import { RoleRow } from "./RoleRow";

export function Timeline() {
  return (
    <section id="experience" className="shell scroll-mt-28 py-20">
      <SectionLabel index="02">experience</SectionLabel>

      <ol className="mt-12">
        {experience.map((role) => (
          <RoleRow key={`${role.company}-${role.start}`} role={role} />
        ))}
      </ol>
    </section>
  );
}

import { features } from "@/site.config";

export type NavItem = {
  /**
   * Section id on the home page, without the hash. Absent on items that
   * point at a real route — those are matched against the pathname instead.
   */
  id?: string;
  href: string;
  label: string;
};

/**
 * Home-page sections. Module-level constant on purpose — useActiveSection
 * observes this array and would rebuild its listeners every render otherwise.
 */
const SECTIONS: readonly Required<NavItem>[] = [
  { id: "about", href: "/#about", label: "about" },
  { id: "projects", href: "/#projects", label: "projects" },
  { id: "experience", href: "/#experience", label: "experience" },
];

/** Standalone routes, each behind its own flag until it's ready to announce. */
const ROUTES: readonly NavItem[] = features.thoughts
  ? [{ href: "/thoughts", label: "thoughts" }]
  : [];

export const NAV: readonly NavItem[] = [...SECTIONS, ...ROUTES];

/** The scroll spy only ever sees home-page sections. */
export const NAV_IDS = SECTIONS.map((n) => n.id);

export type NavItem = {
  /** Section id on the home page, without the hash. */
  id: string;
  href: string;
  label: string;
};

/**
 * Module-level constant on purpose — useActiveSection observes this array
 * and would rebuild its IntersectionObserver every render otherwise.
 */
export const NAV: readonly NavItem[] = [
  { id: "about", href: "/#about", label: "about" },
  { id: "projects", href: "/#projects", label: "projects" },
  { id: "experience", href: "/#experience", label: "experience" },
  { id: "skills", href: "/#skills", label: "skills" },
];

export const NAV_IDS = NAV.map((n) => n.id);

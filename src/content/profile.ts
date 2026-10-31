export const profile = {
  name: "Ari Shah",
  handle: "ar13.dev",
  email: "ari@ar13.dev",

  // Cycled by the hero typing animation. Order matters — the first one
  // is what renders statically under prefers-reduced-motion.
  roles: [
    "Software Engineer",
    "Full Stack Developer",
    "Frontend Developer",
    "CS Student @ UCF",
  ],

  // The em-dash-free, first-person version. No "passionate about
  // crafting". Say the thing plainly. Each entry is its own paragraph —
  // the terminal prints a blank line between them.
  introParagraphs: [
    "hi!",
    "I'm a software engineer and Computer Science student at the University of Central Florida, focused on building tools that solve real problems.",
    "When I'm not programming, you'll probably find me side-questing, traveling the world, or training in MMA.",
  ],

  // Rendered in amber inside the terminal panel — the one accent phrase
  // on the page. Keep it to a couple of words.
  introAccent: "solve real problems",

  // The command the terminal types before printing `intro`. Chrome, not copy.
  introCommand: "cat about.txt",

  location: "Orlando, FL",

  // Printed by the terminal's `skills` command, in this order. Grouped
  // rather than one flat pile so the panel can label the rows. Drawn from
  // what's actually shipped in `projects.ts` plus UCF coursework.
  skills: {
    languages: ["TypeScript", "JavaScript", "Go", "Python", "SQL"],
    frontend: ["React", "Next.js", "Tailwind CSS"],
    backend: ["Node.js", "PostgreSQL", "Supabase", "REST APIs"],
    tools: ["Git", "GitHub Actions", "Linux", "systemd"],
  },

  links: {
    github: "https://github.com/ar1shah",
    linkedin: "https://linkedin.com/in/arishah",
    resume: "/Ari_Shah_Resume.pdf",
  },

  // The Go SSH portfolio. This is the footer's click-to-copy line.
  ssh: "ssh ssh.ar13.dev -p 2222",
} as const;

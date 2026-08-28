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
    "When I'm not programming, you'll probably find me traveling the world, cooking a new recipe, or training MMA.",
  ],

  // Rendered in amber inside the terminal panel — the one accent phrase
  // on the page. Keep it to a couple of words.
  introAccent: "solve real problems",

  // The command the terminal types before printing `intro`. Chrome, not copy.
  introCommand: "cat about.txt",

  location: "Orlando, FL",

  links: {
    github: "https://github.com/ar1shah",
    linkedin: "https://linkedin.com/in/arishah",
    resume: "/Ari_Shah_Resume.pdf",
  },

  // The Go SSH portfolio. This is the footer's click-to-copy line.
  ssh: "ssh ssh.ar13.dev -p 2222",
} as const;

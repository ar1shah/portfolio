export type CaseStudySection = {
  label: string;
  body: string[];
};

export type Shot = {
  src: string;
  alt: string;
  caption?: string;
};

export type Project = {
  slug: string;
  name: string;
  year: string;
  /** One or two lines. Shown on the home grid card. */
  blurb: string;
  tech: string[];
  repo: string;
  live?: string;
  /** Case-study projects get a /projects/[slug] route. */
  caseStudy?: {
    /** Sits under the title on the detail page. Longer than `blurb`. */
    lede: string;
    sections: CaseStudySection[];
    shots: Shot[];
  };
};

export const projects: Project[] = [
  {
    slug: "partsync",
    name: "PartSync",
    year: "2026",
    blurb:
      "Inventory and admin dashboard the SKAPS maintenance crew opens every day to track parts stock, usage, and requests.",
    tech: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS", "Recharts"],
    repo: "https://github.com/ar1shah/PartSync",
    caseStudy: {
      lede: "A maintenance crew was tracking a warehouse of parts through Google Forms and a spreadsheet nobody trusted. PartSync replaced the spreadsheet without asking anyone to change how they already worked.",
      sections: [
        {
          label: "The problem",
          body: [
            "The crew submitted part usage through a Google Form. That form fed a sheet, and the sheet was the inventory — which meant the inventory was whatever the last person to open it said it was.",
            "Nobody knew what was actually in stock until they walked out to the shelf and looked. Reorders happened when someone noticed an empty bin, which is to say, too late.",
          ],
        },
        {
          label: "What I built",
          body: [
            "A Next.js dashboard on Supabase Postgres that owns the inventory outright. Stock decrements automatically as usage comes in, low-stock thresholds fire alerts before a bin empties, and submissions naming a part that does not exist get flagged instead of silently dropped.",
            "Admins get usage analytics in Recharts, a full submission log, and a searchable, filterable catalog that is public to the crew but read-only.",
          ],
        },
        {
          label: "The part that mattered",
          body: [
            "I did not migrate anyone off the Google Form. An Apps Script pushes each submission straight into Supabase, so the crew kept the workflow they already had and the manual data entry just stopped existing.",
            "That decision is the only reason it got adopted. A better tool that requires retraining a working crew is not a better tool.",
          ],
        },
        {
          label: "Access control",
          body: [
            "Row-level security in Postgres, enforced at the database rather than in the app. The public catalog and the admin surface hit the same tables and get different rows back. Admin actions sit behind authentication on top of that.",
          ],
        },
      ],
      shots: [
        {
          src: "/projects/placeholder-wide.svg",
          alt: "PartSync admin dashboard",
          caption: "Admin dashboard — usage analytics and stock levels",
        },
        {
          src: "/projects/placeholder-wide.svg",
          alt: "PartSync parts catalog",
          caption: "Searchable parts catalog",
        },
      ],
    },
  },
  {
    slug: "align",
    name: "Align",
    year: "2025",
    blurb:
      "Full-stack platform matching clients with licensed real estate agents, built during my internship and used to close real deals.",
    tech: ["TypeScript", "React", "Node.js", "PostgreSQL", "REST APIs"],
    repo: "https://github.com/ar1shah/Align",
    caseStudy: {
      lede: "Built as a software developer intern at Align. It connects people looking for a realtor with licensed agents, and it routes the commission when a referral turns into a closing.",
      sections: [
        {
          label: "The problem",
          body: [
            "Agent referrals ran on phone calls and memory. A lead came in, someone decided which agent should get it, and the commission split was tracked in whatever the person handling it preferred.",
            "The parts that broke were the boring ones: leads going to an agent who was not licensed in that county, and referral fees that nobody could reconstruct three months later.",
          ],
        },
        {
          label: "What I built",
          body: [
            "The intake-to-match-to-referral path as one system. Leads come in through a structured form, get matched against agent criteria, and land with a specific agent who is accountable for them.",
            "I implemented the core full-stack architecture — authentication, role-based access control separating clients from agents from staff, and persistent storage so the referral trail survives.",
          ],
        },
        {
          label: "Integrations",
          body: [
            "Third-party APIs handle lead routing and client communication, so a new lead reaches its agent without anyone watching a dashboard for it.",
          ],
        },
        {
          label: "Outcome",
          body: [
            "The platform contributed to five-figure commission revenue across multiple closed deals. It was the first thing I built that had money moving through it, which changes how carefully you write the access-control layer.",
          ],
        },
      ],
      shots: [
        {
          src: "/projects/placeholder-wide.svg",
          alt: "Align lead intake",
          caption: "Lead intake and matching",
        },
      ],
    },
  },
  {
    slug: "redirectguard",
    name: "RedirectGuard",
    year: "2026",
    blurb:
      "Chrome extension that kills the popup tabs streaming and ad-heavy sites open behind your back.",
    tech: ["TypeScript", "Chrome Extensions API"],
    repo: "https://github.com/ar1shah/RedirectGuard",
    caseStudy: {
      lede: "I got tired of clicking play and getting three tabs I did not ask for. Blockers handle ads on the page. They do not reliably stop the tab that opens the moment you click anything.",
      sections: [
        {
          label: "The problem",
          body: [
            "Ad-heavy and streaming sites open new tabs and popups on interaction — a click anywhere on the player becomes a redirect somewhere else. Content blockers work on what is rendered in the page; this happens at the navigation layer, and it slips past.",
          ],
        },
        {
          label: "How it works",
          body: [
            "The extension intercepts new tab and popup creation and checks the destination against a user-defined allowlist before it is allowed to load. Anything not on the list does not open.",
            "The check runs in real time on the destination, not on the originating page — so it holds even when the site rotates the domains it redirects to, which they do constantly.",
          ],
        },
        {
          label: "Auto-protect",
          body: [
            "Manually arming a blocker on every visit defeats the point. You mark a domain once and interception turns itself on whenever you are there.",
          ],
        },
      ],
      shots: [
        {
          src: "/projects/placeholder-wide.svg",
          alt: "RedirectGuard extension popup",
          caption: "Allowlist configuration",
        },
      ],
    },
  },
  {
    slug: "ssh-portfolio",
    name: "SSH Portfolio",
    year: "2026",
    blurb:
      "This portfolio, minus the browser. A Go SSH server that renders a terminal UI with ASCII art.",
    tech: ["Go", "SSH", "Terminal UI", "systemd", "GitHub Actions"],
    repo: "https://github.com/ar1shah/SSH-portfolio",
  },
  {
    slug: "resumemaxx",
    name: "ResumeMaxx",
    year: "2026",
    blurb:
      "Paste a resume and a job description, get a match score and specific feedback on what is missing.",
    tech: ["TypeScript", "React", "OpenAI API"],
    repo: "https://github.com/ar1shah/ResumeMaxx",
  },
  {
    slug: "apollo-bot",
    name: "apollo-bot",
    year: "2026",
    blurb: "A Discord bot. Small, and it does what I needed it to do.",
    tech: ["JavaScript", "Node.js", "Discord API"],
    repo: "https://github.com/ar1shah/apollo-bot",
  },
];

export const caseStudies = projects.filter((p) => p.caseStudy);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** Prev/next nav at the bottom of a case study, wrapping around. */
export function adjacentCaseStudies(slug: string) {
  const i = caseStudies.findIndex((p) => p.slug === slug);
  if (i === -1) return { prev: undefined, next: undefined };
  const len = caseStudies.length;
  return {
    prev: caseStudies[(i - 1 + len) % len],
    next: caseStudies[(i + 1) % len],
  };
}

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
    slug: "cageops",
    name: "CageOps",
    year: "2026",
    blurb:
      "A production-style ML platform that predicts UFC fight outcomes. The domain is the fights; the point is the infrastructure underneath.",
    tech: ["Python", "FastAPI", "Postgres", "Redis", "LightGBM", "Docker"],
    repo: "https://github.com/ar1shah/CageOps",
    caseStudy: {
      lede: "An ML platform that predicts UFC fight outcomes — ingestion pipeline, job queue, point-in-time features, model registry, serving API. The fights are the domain. The infrastructure is the project, and so is being honest about what the model is currently worth.",
      sections: [
        {
          label: "The point",
          body: [
            "Most ML side projects are a notebook that reports a good number. I wanted the parts that come after the notebook: where the data comes from, how features get built without leaking the future, how a model version gets promoted, and how a prediction gets served, cached, and rate-limited.",
            "The data pipeline, the model, and the prediction API are built. The first deploy, Kubernetes, and the retraining loop are scheduled and not written. The roadmap says which is which, because a half-built system that presents itself as finished is worse than one that names its phase.",
          ],
        },
        {
          label: "Features that cannot see the future",
          body: [
            "Every row of features is built only from fights strictly before the fight it describes — career, last-three and last-five rates, streaks, bio. Leakage tests guard that boundary, because the mistake is easy, silent, and flattering: a feature built from a fighter's full history makes a model look excellent right up until it meets a fight that has not happened yet.",
            "Rebuilding the feature tables is one command, and training refuses to run against stale features rather than quietly producing a model nobody can reproduce.",
          ],
        },
        {
          label: "A source that says no",
          body: [
            "The canonical stats site sits behind a bot challenge. I did not bypass it. The resulting five-month gap is filled from English Wikipedia event articles instead — robots-compliant, results only, no per-round stats — with per-source keys so the canonical source always wins where both have a fight.",
            "The cost is written down rather than papered over: those fights count toward a fighter's record but not toward the rate features, and the data-sources doc says exactly which fights are affected and why.",
          ],
        },
        {
          label: "The model loses to the betting favorite",
          body: [
            "LightGBM, time-based splits, scored against two baselines: an experience-and-ranking heuristic, and the betting favorite. It beats the heuristic. It loses to the favorite.",
            "That sentence is in the README, not buried in a notebook. The odds baseline only covers 241 of 553 test fights, so it is not a complete verdict — but a model registry that enforces exactly one active version at the database level is worth building whether or not the model inside it is any good, and knowing this one is not good enough yet is the only thing that makes a next version mean anything.",
          ],
        },
        {
          label: "Workers cannot beat the rate limiter",
          body: [
            "I benchmarked ingestion across worker counts expecting to find a scaling curve. At the polite one-request-per-second interval there isn't one: one worker and four workers both took 680 seconds for 680 requests, and the workers spent 71% and 93% of their time respectively waiting for a limiter slot.",
            "Relaxing the limiter to 100ms gives 2.78x at four workers — which is exactly the ceiling the arithmetic predicts, a 280ms cycle divided by a 100ms interval. So live ingestion throughput is set by politeness, not by worker count. One worker is enough. More workers only pay off for re-parsing from the page cache, which is most of why that cache exists. Every number was measured against a local replay server, never the real site, and the benchmarks doc leads with that caveat.",
          ],
        },
        {
          label: "Serving",
          body: [
            "Training and serving build their model input through one shared module, so the two cannot drift; the API image carries no training code and never installs LightGBM's toolchain. A model manager verifies the active bundle and hot-reloads it by polling, so promoting a version does not mean restarting the service.",
            "Predictions are cached in Redis, keyed by model, feature build, input fingerprint, matchup, and date, and flipped exactly when the same fight is asked about the other way round. A token-bucket limiter runs per client. A k6 load test puts one process at 219 requests/second cold and 1,364 warm, which identifies the process — not the database pool — as the limit, and that is the number the next phase has to move.",
          ],
        },
      ],
      shots: [],
    },
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

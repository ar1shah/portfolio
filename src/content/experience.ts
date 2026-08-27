export type Role = {
  company: string;
  title: string;
  start: string;
  end: string;
  location: string;
  bullets: string[];
  /** Rendered dimmer, below the roles. */
  kind?: "work" | "education";
};

export const experience: Role[] = [
  {
    company: "Delta Group Enterprises",
    title: "Fullstack Software Developer, Contract",
    start: "Aug 2025",
    end: "Jun 2026",
    location: "Orlando, FL",
    kind: "work",
    bullets: [
      "Customized and deployed a white-labeled CRM to run core operations for a wholesale distribution client.",
      "Built a GPT-5-powered chatbot with SMS, cutting manual response time by 40%.",
      "Designed two-way SMS workflows on the Twilio API across 1,200+ monthly customer interactions.",
      "Shipped continuous feature work against requirements that moved as the business did.",
    ],
  },
  {
    company: "Align",
    title: "Software Developer Intern",
    start: "Aug 2024",
    end: "May 2025",
    location: "Orlando, FL",
    kind: "work",
    bullets: [
      "Built and deployed a full-stack platform connecting clients with licensed real estate agents.",
      "Implemented authentication, role-based access control, and persistent storage for the referral trail.",
      "Integrated third-party APIs to automate lead routing and client communication.",
      "Contributed to five-figure commission revenue across multiple deals closed on the platform.",
    ],
  },
  {
    company: "University of Central Florida",
    title: "B.S. Computer Science",
    start: "Aug 2023",
    end: "May 2027",
    location: "Orlando, FL",
    kind: "education",
    bullets: [
      "Coursework: Data Structures & Algorithms, Operating Systems, Database Systems, Algorithms for Machine Learning, OOP.",
      "ISA, ACM, AI@UCF, Knight Hacks, BJJ @ UCF.",
    ],
  },
];

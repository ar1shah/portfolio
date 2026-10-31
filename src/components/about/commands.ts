/**
 * The terminal's command set.
 *
 * Pure: no React, no DOM, no clock. Every command is a function of its
 * args and the panel's column count, which is what lets
 * `scripts/term-check.mts` run the whole set at both widths and assert
 * that no printed row overflows the panel.
 *
 * Imports below are relative and carry their `.ts` extension so that
 * check can load this module directly under
 * `node --experimental-strip-types` — the `@/` alias and extensionless
 * specifiers only resolve inside the bundler.
 *
 * To add or reword a command, edit `commands` near the bottom. A `run`
 * returns one `Segment[]` per printed row. Keep every row inside `cols`;
 * the panel's font-size clamp bottoms out at 11px and will not shrink
 * further to rescue a long line.
 */
import { profile } from "../../content/profile.ts";
import { projects, getProject } from "../../content/projects.ts";
import { experience } from "../../content/experience.ts";
import { wrapToColumns, segmentLine, type Segment } from "./wrap.ts";

/** One printed row per entry. */
export type Rows = Segment[][];

export type Command = {
  name: string;
  aliases?: string[];
  /** One-liner for `help`. Omit to keep the command out of the listing. */
  summary?: string;
  run: (args: string[], cols: number) => Rows;
};

// ── row builders ──────────────────────────────────────────────────────

/** A blank row. An empty block establishes no line box, so it needs the space. */
const BLANK: Segment[] = [{ text: " ", accent: false }];

const plain = (text: string): Segment[] => [{ text, accent: false }];
const dim = (text: string): Segment[] => [{ text, accent: false, dim: true }];

/** Re-tones an already-built run of rows. */
const dimmed = (rows: Rows): Rows => rows.map((row) => row.map((s) => ({ ...s, dim: true })));

const pad = (text: string, width: number) =>
  text + " ".repeat(Math.max(0, width - text.length));

/**
 * Cuts to `width` at a word boundary and marks the cut. Used for the
 * fixed-width blurb column in `projects`, and to defang a long argument
 * before it lands in an error string — a single unbroken token wider
 * than the panel is the one thing `wrapToColumns` cannot break up.
 */
function truncate(text: string, width: number): string {
  if (text.length <= width) return text;
  const cut = text.slice(0, width - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > width / 2 ? cut.slice(0, space) : cut).trimEnd()}\u2026`;
}

/** Wrapped prose. `atomic` keeps an accent phrase intact, as in the intro. */
function prose(text: string, cols: number, indent = "", atomic?: string): Rows {
  const width = Math.max(8, cols - indent.length);
  return wrapToColumns(text, width, atomic).map((line) => {
    const body = atomic ? segmentLine(line, atomic) : plain(line);
    return indent ? [{ text: indent, accent: false }, ...body] : body;
  });
}

/** Dim label column, value wrapped and hanging under itself. */
function field(label: string, width: number, value: string, cols: number): Rows {
  const lines = wrapToColumns(value, Math.max(8, cols - width));
  return lines.map((line, i) => [
    { text: i === 0 ? pad(label, width) : " ".repeat(width), accent: false, dim: true },
    { text: line, accent: false },
  ]);
}

/** Dim label column, value as a single link. Never wraps — keep values short. */
function linkField(label: string, width: number, text: string, href: string): Segment[] {
  return [
    { text: pad(label, width), accent: false, dim: true },
    { text, accent: false, href },
  ];
}

/** `https://github.com/x` reads as noise in a 40-column panel. */
const short = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

/**
 * Joins with a visible middot but a NON-BREAKING space in front of it, so
 * `wrapToColumns` — which breaks on ordinary spaces — can only break AFTER
 * a separator. Without this, a wrapped list starts its continuation lines
 * with a dangling middot.
 */
const bullets = (items: readonly string[]) => items.join("\u00a0\u00b7 ");

// ── commands ──────────────────────────────────────────────────────────

function help(cols: number): Rows {
  const listed = commands.filter((c) => c.summary);
  const width = Math.max(...listed.map((c) => c.name.length)) + 2;

  return [
    ...listed.map((c) => [
      { text: "  ", accent: false },
      { text: pad(c.name, width), accent: true },
      { text: c.summary as string, accent: false, dim: true },
    ]),
    BLANK,
    // A worked example, short enough to survive the 40-column layout on
    // one line — the quoted version wrapped and broke mid-quote.
    ...dimmed(prose("Try: projects partsync", cols)),
    ...dimmed(prose("Also here: ls, cat <file>, pwd, echo.", cols)),
  ];
}

function about(cols: number): Rows {
  return profile.introParagraphs.flatMap((paragraph, i) => {
    const rows = prose(paragraph, cols, "", profile.introAccent);
    return i === 0 ? rows : [BLANK, ...rows];
  });
}

const SLUG_WIDTH = Math.max(...projects.map((p) => p.slug.length)) + 2;
/** Slug column + the four-digit year + the gap before the blurb. */
const LIST_PREFIX = SLUG_WIDTH + 6;

function projectList(cols: number): Rows {
  // Below this the blurb column is too narrow to say anything, so the
  // list drops to slug + year rather than printing three words and an
  // ellipsis on every row.
  const withBlurb = cols >= 48;

  return [
    ...projects.map((p) => {
      const head: Segment[] = [
        { text: pad(p.slug, SLUG_WIDTH), accent: true },
        { text: p.year, accent: false, dim: true },
      ];
      if (!withBlurb) return head;
      return [
        ...head,
        { text: `  ${truncate(p.blurb, cols - LIST_PREFIX)}`, accent: false, dim: true },
      ];
    }),
    BLANK,
    dim("projects <name> for the long version."),
  ];
}

function projectDetail(slug: string, cols: number): Rows {
  const p = getProject(slug.toLowerCase());
  if (!p) {
    return [
      ...prose(`no project named '${truncate(slug, 24)}'.`, cols),
      dim("try 'projects' for the list."),
    ];
  }

  const W = 8;
  const rows: Rows = [
    [
      { text: p.name, accent: true },
      { text: ` \u00b7 ${p.year}`, accent: false, dim: true },
    ],
    ...prose(p.blurb, cols),
    BLANK,
    ...field("  tech", W, p.tech.join(", "), cols),
    linkField("  repo", W, short(p.repo), p.repo),
  ];

  if (p.live) rows.push(linkField("  live", W, short(p.live), p.live));
  if (p.caseStudy) {
    rows.push(linkField("  more", W, `/projects/${p.slug}`, `/projects/${p.slug}`));
  }
  return rows;
}

function experienceList(cols: number): Rows {
  const dates = experience.map((r) => `${r.start} \u2013 ${r.end}`);
  const dateWidth = Math.max(...dates.map((d) => d.length));
  const nameWidth = Math.max(...experience.map((r) => r.company.length));
  // Right-align the dates only when the longest company still clears them
  // with a gap. Otherwise every row stacks, so the column reads
  // consistently down the list instead of switching shape per row.
  const inline = nameWidth + 2 + dateWidth <= cols;

  return [
    ...experience.flatMap((role, i): Rows => [
      ...(i === 0 ? [] : [BLANK]),
      ...(inline
        ? [
            [
              { text: pad(role.company, cols - dateWidth), accent: true },
              { text: dates[i], accent: false, dim: true },
            ] as Segment[],
          ]
        : [[{ text: role.company, accent: true }] as Segment[], dim(`  ${dates[i]}`)]),
      ...prose(role.title, cols, "  "),
      ...dimmed(prose(role.location, cols, "  ")),
    ]),
    BLANK,
    dim("experience <name> for the details."),
  ];
}

function experienceDetail(query: string, cols: number): Rows {
  const q = query.toLowerCase();
  const role = experience.find(
    (r) => r.company.toLowerCase().includes(q) || r.title.toLowerCase().includes(q),
  );
  if (!role) {
    return [
      ...prose(`no entry matching '${truncate(query, 24)}'.`, cols),
      dim("try 'experience' for the list."),
    ];
  }

  return [
    [{ text: role.company, accent: true }],
    ...dimmed(prose(`${role.title} \u00b7 ${role.start} \u2013 ${role.end}`, cols)),
    BLANK,
    ...role.bullets.flatMap((bullet) =>
      wrapToColumns(bullet, Math.max(8, cols - 2)).map((line, i) => [
        { text: i === 0 ? "- " : "  ", accent: false, dim: true },
        { text: line, accent: false },
      ]),
    ),
  ];
}

function skills(cols: number): Rows {
  const groups = Object.entries(profile.skills) as [string, readonly string[]][];
  const width = Math.max(...groups.map(([label]) => label.length)) + 2;
  return groups.flatMap(([label, items]) => field(label, width, bullets(items), cols));
}

function contact(cols: number): Rows {
  const W = 10;
  return [
    linkField("email", W, profile.email, `mailto:${profile.email}`),
    linkField("github", W, short(profile.links.github), profile.links.github),
    linkField("linkedin", W, short(profile.links.linkedin), profile.links.linkedin),
    linkField("resume", W, profile.links.resume.replace(/^\//, ""), profile.links.resume),
    BLANK,
    ...dimmed(prose(`Based in ${profile.location}.`, cols)),
  ];
}

const FILES: Record<string, (cols: number) => Rows> = {
  "about.txt": about,
  "contact.txt": contact,
  "skills.txt": skills,
};

function cat(args: string[], cols: number): Rows {
  const name = args[0];
  if (!name) return [...prose("cat: missing operand", cols), dim("try 'ls'.")];

  const key = name.toLowerCase();
  const file = FILES[key];
  if (file) return file(cols);
  if (key === "resume.pdf") {
    return [...prose("resume.pdf: binary file", cols), dim("try 'resume'.")];
  }
  return prose(`cat: ${truncate(name, 24)}: No such file or directory`, cols);
}

function neofetch(cols: number): Rows {
  const W = 10;
  const art = ["  ___  ", " /   \\ ", " \\___/ ", "       ", "       "];
  const info: [string, string][] = [
    ["role", profile.roles[0]],
    ["school", "UCF, CS '27"],
    ["location", profile.location],
    ["stack", "TypeScript, Go, React"],
    ["shell", "/bin/ar13"],
  ];

  return [
    [
      { text: "       ", accent: false },
      { text: profile.handle, accent: true },
    ],
    dim(`       ${"\u2500".repeat(profile.handle.length)}`),
    ...info.map(([label, value], i): Segment[] => [
      { text: art[i], accent: false, dim: true },
      { text: pad(label, W), accent: false, dim: true },
      { text: truncate(value, Math.max(8, cols - art[i].length - W)), accent: false },
    ]),
  ];
}

export const commands: Command[] = [
  {
    name: "help",
    aliases: ["?", "h"],
    summary: "the list you're reading",
    run: (_args, cols) => help(cols),
  },
  { name: "about", aliases: ["bio"], summary: "the long version", run: (_a, cols) => about(cols) },
  {
    name: "whoami",
    summary: "the short version",
    run: (_args, cols) => [
      [
        { text: profile.name, accent: true },
        { text: ` \u2014 ${profile.roles[0]}`, accent: false },
      ],
      ...prose("CS @ University of Central Florida", cols),
      ...dimmed(prose(profile.location, cols)),
    ],
  },
  {
    name: "projects",
    aliases: ["ps"],
    summary: "what I've shipped",
    // Args are joined with a hyphen so `projects ssh portfolio` finds the
    // `ssh-portfolio` slug as readily as the slug itself.
    run: (args, cols) => (args.length ? projectDetail(args.join("-"), cols) : projectList(cols)),
  },
  {
    name: "experience",
    aliases: ["exp", "work"],
    summary: "where I've worked",
    run: (args, cols) =>
      args.length ? experienceDetail(args.join(" "), cols) : experienceList(cols),
  },
  { name: "skills", aliases: ["stack"], summary: "what I work with", run: (_a, c) => skills(c) },
  { name: "contact", aliases: ["links"], summary: "how to reach me", run: (_a, c) => contact(c) },
  {
    name: "resume",
    aliases: ["cv"],
    summary: "download the PDF",
    run: (_args, cols) => [
      [
        {
          text: profile.links.resume.replace(/^\//, ""),
          accent: false,
          href: profile.links.resume,
        },
      ],
      ...dimmed(prose("Opens in a new tab.", cols)),
    ],
  },
  {
    name: "ssh",
    summary: "portfolio over SSH",
    run: (_args, cols) => [
      [{ text: profile.ssh, accent: true }],
      BLANK,
      ...dimmed(
        prose("The whole thing again, in your own terminal. No browser required.", cols),
      ),
    ],
  },
  // Cleared by the component, which owns the scrollback. The entry exists
  // so `help` lists it and Tab completes it.
  { name: "clear", aliases: ["cls"], summary: "wipe the screen", run: () => [] },

  // Shell furniture. Named in help's footer rather than the table.
  {
    name: "ls",
    run: () => {
      const W = 13;
      return [
        [{ text: pad("about.txt", W) + pad("contact.txt", W) + "skills.txt", accent: false }],
        [
          { text: pad("resume.pdf", W), accent: false },
          { text: pad("projects/", W) + "experience/", accent: true },
        ],
      ];
    },
  },
  { name: "cat", run: cat },
  { name: "pwd", run: () => [plain("/home/ari/about")] },
  { name: "echo", run: (args, cols) => (args.length ? prose(args.join(" "), cols) : [BLANK]) },

  // Easter eggs. No summary, so they stay out of `help`.
  {
    name: "sudo",
    run: (_args, cols) => [
      ...prose(`${profile.name.split(" ")[0].toLowerCase()} is not in the sudoers file.`, cols),
      ...prose("This incident has been reported.", cols),
    ],
  },
  { name: "rm", run: () => [plain("Nice try.")] },
  {
    name: "vim",
    aliases: ["emacs", "nano", "vi"],
    run: (_a, cols) => prose("Nice try. There's no escape here either.", cols),
  },
  {
    name: "exit",
    aliases: ["quit", "logout"],
    run: (_a, cols) => prose("There's no exit. Try 'clear'.", cols),
  },
  {
    name: "hire",
    run: (_args, cols) => [
      ...prose("Open to Summer 2026 internships and new-grad roles.", cols),
      ...dimmed(prose("Start with 'contact'.", cols)),
    ],
  },
  { name: "neofetch", aliases: ["fetch"], run: (_a, cols) => neofetch(cols) },
  {
    name: "man",
    run: (args, cols) =>
      args.length
        ? prose(`no manual entry for ${truncate(args[0], 20)}. try 'help'.`, cols)
        : prose("What manual page do you want? Try 'help'.", cols),
  },
];

export const commandNames: string[] = commands.map((c) => c.name);

// ── dispatch ──────────────────────────────────────────────────────────

export function resolveCommand(input: string): Command | null {
  const name = input.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
  if (!name) return null;
  return commands.find((c) => c.name === name || c.aliases?.includes(name)) ?? null;
}

export function runCommand(input: string, cols: number): Rows {
  const parts = input.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return [];

  const cmd = resolveCommand(input);
  if (!cmd) {
    return [
      ...prose(`bash: ${truncate(parts[0], 24)}: command not found`, cols),
      dim("Try 'help'."),
    ];
  }
  return cmd.run(parts.slice(1), cols);
}

// ── REPL helpers ──────────────────────────────────────────────────────

function commonPrefix(values: string[]): string {
  if (values.length === 0) return "";
  let prefix = values[0];
  for (const value of values.slice(1)) {
    while (prefix && !value.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}

/**
 * Tab completion over command names only — args are content, not a
 * namespace. `matches` comes back so the caller can print the candidates
 * when the prefix is ambiguous, and so it can tell "no match" (leave the
 * keystroke to the browser) from "completed".
 */
export function completeCommand(partial: string): { completed: string; matches: string[] } {
  const value = partial.trimStart();
  if (!value || /\s/.test(value)) return { completed: partial, matches: [] };

  const lower = value.toLowerCase();
  const matches = commandNames.filter((name) => name.startsWith(lower));
  if (matches.length === 0) return { completed: partial, matches: [] };
  if (matches.length === 1) return { completed: `${matches[0]} `, matches };

  const prefix = commonPrefix(matches);
  return { completed: prefix.length > lower.length ? prefix : partial, matches };
}

/**
 * Walks the history cursor. `-1` means "the line being typed"; older
 * entries sit at lower indices. Going newer past the end returns to -1,
 * going older past the start stays put — matching a real shell.
 */
export function historyStep(length: number, index: number, dir: -1 | 1): number {
  if (length === 0) return -1;
  if (index === -1) return dir === -1 ? length - 1 : -1;

  const next = index + dir;
  if (next < 0) return 0;
  if (next > length - 1) return -1;
  return next;
}

# ar13.dev

Personal site. Next.js 16 (App Router), TypeScript, Tailwind v4. Deploys to Vercel as static output.

```bash
npm run dev     # http://localhost:3000
npm run build   # prerenders every route, must pass clean
npm run lint
```

## Editing content

Everything you'd want to change lives in `src/content/`. You should not need to open a component.

| File | Holds |
|---|---|
| `profile.ts` | Name, email, the roles the hero cycles through, intro paragraph, social links, the SSH line |
| `projects.ts` | All six projects, plus the long-form case studies |
| `experience.ts` | Jobs and education for the timeline |
| `photos.ts` | Hero photo + lightbox carousel |

### Swapping in real photos

Drop files into `public/photos/`, then point `photos.ts` at them:

```ts
{ src: "/photos/ari-01.jpg", alt: "Ari at ...", caption: "shanghai, 2025" }
```

The frame is 4:5, so portrait-ish sources look best. Add or remove entries freely — the counter, arrows, and keyboard nav all read from the array length.

Project screenshots work the same way: files into `public/projects/`, paths into the `shots` array of a project's `caseStudy`.

### Adding a project

Append to the `projects` array. Include a `caseStudy` object and it gets a `/projects/<slug>` page automatically — `generateStaticParams` picks it up at build. Leave `caseStudy` off and the card just links to GitHub.

## Design tokens

All in `src/app/globals.css` under `:root`. The accent is one variable:

```css
--accent: #e0a458;   /* amber */
```

Swap it for `#4d7cfe` or `#ff5a1f` and the whole site follows — caret, hover states, section numbers, focus rings.

Text colors are `--ink` and `--ink-dim`. `--rule` is for hairlines only; it does not have enough contrast to be used as a text color.

## Skill icons

`src/components/skills/icon-paths.ts` is generated — don't hand-edit it.

```bash
node scripts/gen-icons.mjs
```

The icon list lives in `scripts/gen-icons.mjs`. Most marks come from the `simple-icons` devDependency; Java, AWS, OpenAI, and Twilio were dropped from current releases over trademark policy, so those four are pinned in `scripts/legacy-icons.json`.

Brands whose real color is near-black (Next.js, Express, Vercel, GitHub) carry a `hex` override so they stay visible against the dark ground.

## Notes on the cluster

`SkillCluster` runs one `requestAnimationFrame` loop writing transforms directly to DOM nodes — deliberately not React state, which would re-render 60 times a second. Layout is a seeded phyllotaxis spiral computed at module load so server and client produce identical markup.

It skips all work when scrolled off-screen, when hidden below the `sm` breakpoint, and when the user prefers reduced motion. Below `sm` the same 30 technologies render as a plain list instead.

## Before going live

- [ ] Real photos + captions in `photos.ts`
- [ ] Real screenshots for the three case studies
- [ ] Confirm `public/Ari_Shah_Resume.pdf` is current
- [ ] Point the Vercel project at `ar13.dev`

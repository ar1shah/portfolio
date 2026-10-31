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

Terminal commands are the one exception: they live in `src/components/about/commands.ts`, because each one is a small formatter over the content above rather than copy on its own. The reply text sits next to the command it belongs to.

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

## The wordmark

figlet **slant** rendering of `ar13.dev`, five rows of exactly 38 columns, in `AsciiWordmark.tsx`. Stored as plain strings with `\` doubled — deliberately not `String.raw`, because row 3 contains a backtick and escaping one inside a raw template leaves the backslash in the output. Trailing spaces are load-bearing.

Renders 194x43px in the header and 365x80px in the footer. Below `sm` the header falls back to plain `ar13.dev` type; the real name is always present for screen readers.

```bash
node scripts/check-art.mjs        # diffs the stored art against the source, byte for byte
```

## The hero globe

A rotating Earth in ASCII, with Orlando pinned in amber.

`globe.ts` is the renderer — pure math, no React, no DOM, and no imports at all (the land mask is passed in), so it can be driven headlessly:

```bash
node --experimental-strip-types scripts/globe-preview.mts 88 48 "81" 0.35
```

**No mesh, no rasterizer.** A sphere can be intersected analytically, so the renderer walks the character grid once and asks what is behind each cell: inside the disc, the front surface is `z = sqrt(1 - x^2 - y^2)`. Un-rotating that point gives a latitude and longitude to look up. One pass, no z-buffer, no overdraw — ~0.3ms per frame.

That is also why a globe survives this medium when a detailed model does not. Its shape is entirely silhouette, and the detail that makes it legible — coastlines — is high-contrast rather than a shaded gradient.

Two things learned the hard way and worth not undoing:

- **Land is confined to the bright end of the ramp** (`LAND_MIN`..`LAND_MAX`). Letting it span the full range makes the globe read as a shaded ball with a gradient smeared over it, and the coastlines lose to the brightness falloff.
- **The accent is spent on exactly one thing** — the home pin, which rotates out of view around the back. Shading the brightest land amber instead just scattered colour over whichever hemisphere was lit.

Ocean is drawn as a faint stipple with a 30-degree graticule, which gives the sphere its curvature without competing with the continents.

### Interaction

The globe drifts on its own (~40s per turn) and is otherwise inert. **It does not track the cursor** — ambient tracking means the thing reacts to you crossing the page on your way to somewhere else, which reads as twitchy. Rotation comes only from an actual drag: press and drag to spin and tilt, flick to send it coasting, and it eases back into the idle drift.

Tilt is clamped short of the poles. `touch-action` is `pan-y`, not `none`: a horizontal swipe spins the globe while a vertical swipe still scrolls the page, so a decorative element can never trap a touch user. Under `prefers-reduced-motion` the idle drift stops entirely but dragging still works — user-initiated movement is fine, unprompted movement is not.

### The land mask

```bash
node scripts/bake-land.mjs 360 180
```

Emits `src/components/hero/land-mask.ts` — one bit per equirectangular cell, packed and base64'd (7.9KB raw, 10.5KB encoded). Source is `world-atlas` land-110m, which is Natural Earth data in the public domain; `topojson-client` and `d3-geo` do the polygon containment. All three are devDependencies — nothing ships but the bitmask.

Real geography rather than hand-drawn continents, because eyeballed coastlines read as subtly wrong without anyone being able to say why. To sanity-check the mask, render it flat: at 33% land with recognizable continents it is right.

Move the pin by editing `MARKER` in `globe.ts`.

## Scroll spy

`useActiveSection` drives the amber underline in the nav. The decision logic is a pure exported function, `pickActive`, tested headlessly:

```bash
node --experimental-strip-types scripts/spy-check.mts
```

It uses scroll events rather than `IntersectionObserver` mainly for the bottom-of-page case: a short final section whose top never crosses the activation line still has to be able to activate, which `rootMargin` does not give cleanly.

**One invariant matters here.** Anchor targets land at the `scroll-mt-28` (112px) on each section, and `ACTIVE_LINE` must sit *below* that. If it sits above, a clicked section lands past the line, fails the test, and the previous section keeps the underline — every nav item highlights the one before it. Do not add a `scroll-padding-top` on `<html>`: it stacks with `scroll-mt` and pushes targets to the sum. `spy-check.mts` asserts the invariant.

## The terminal

The About panel types its intro on scroll, then hands you a live prompt.
`help` lists what it takes.

Commands live in `src/components/about/commands.ts` and are pure — a
function of their arguments and the panel's column count, with no React,
no DOM and no clock. That is what makes them checkable headlessly:

```bash
node --experimental-strip-types scripts/term-check.mts
```

**The width assertion is the point of that check.** The panel sizes its
text with `clamp(10px, 100cqw / (cols * 0.6), 14px)`, which only ever
*shrinks* to avoid overflow and then stops. A row wider than `cols` (40
mobile, 52 desktop) has no way to fit and simply runs off the side, so
every command is run at both widths and every printed row is measured.
Keep new output inside the budget, or wrap it with the `prose` helper.

Two smaller things worth knowing before editing it:

- `useTypedLines` latches `done` permanently, so it cannot drive a REPL.
  It is only ever fed the intro; command output prints instantly, which
  is a deliberate choice as much as a constraint.
- The scrollback stores the *command*, not its rows, and re-renders it at
  the current width. Output printed at 52 columns therefore re-wraps
  instead of overflowing when the window narrows past `lg`.

## Frame-rate independence

All motion is expressed in real time, never per frame. Per-frame constants make speed a function of the display — the hero originally spun 2.5x too fast on a 120Hz panel and nearly 3x on a 165Hz one.

- **Globe**: radians per *second*, with the cursor lean on exponential smoothing (unconditionally stable, frame-rate independent by construction).

```bash
node scripts/motion-check.mjs   # asserts identical motion at 60/90/120/144/165Hz
```

## A warning about verifying this project

The in-editor browser preview does **not** composite frames, and as a result these APIs never fire in it:

| API | Fires in preview? |
|---|---|
| `requestAnimationFrame` | no |
| `ResizeObserver` | no |
| `IntersectionObserver` | no |
| `scroll` events | no |
| `resize` events | no |
| `matchMedia` (reading `.matches`) | yes |
| `matchMedia` `change` events | no |

The `matchMedia` split matters: `.matches` reads correctly on load, so a
reload at each width tests the right branch, but changing the preview's
viewport fires neither `resize` nor a `change` event. Anything that is
supposed to *react* to crossing a breakpoint — the terminal swapping
between 40 and 52 columns, say — looks frozen there and has to be
confirmed in a real browser.

So the globe's rotation, the nav underline, and the header's scroll border cannot be confirmed there — they need a real browser. Anything sizing- or correctness-critical is therefore built on CSS or `matchMedia` rather than on an observer, and the logic behind the rest is extracted into pure functions with headless checks (`scripts/*-check.mts`).

## Before going live

- [ ] Real photos + captions in `photos.ts`
- [ ] Real screenshots for the three case studies
- [ ] Confirm `public/Ari_Shah_Resume.pdf` is current
- [ ] Point the Vercel project at `ar13.dev`

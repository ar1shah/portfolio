---
title: "Placeholder Post"
date: "2026-11-10"
summary: "A scratch post that exercises every element the renderer handles — delete it when the first real one lands."
draft: true
---

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
incididunt ut labore et dolore magna aliqua. This paragraph exists to show what
the reading measure looks like once a line is long enough to wrap, which is the
only way to judge whether the column is comfortable.

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
aliquip ex ea commodo consequat — with an [inline link](https://example.com) and
a bit of `inline code` to check how both sit inside running text.

## A second-level heading

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.

- A list item, short.
- A longer list item that runs past the end of one line so the hanging indent
  and the leading can be checked against the paragraphs above it.
- A third, with `code` inside it.

### A third-level heading

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
doloremque laudantium, totam rem aperiam.

```ts
// Syntax highlighting runs at build time — this ships as plain HTML.
export function readingMinutes(markdown: string): number {
  const words = markdown.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
```

> A blockquote, set in the serif that the site loads and otherwise never uses.
> Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.

1. An ordered item.
2. Another ordered item.

---

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis
praesentium voluptatum deleniti atque corrupti.

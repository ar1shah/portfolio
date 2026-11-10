import type { Element, Root, RootContent } from "hast";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

/**
 * Markdown → HTML, at build time only.
 *
 * Note what is NOT here: `rehype-raw`. `remark-rehype` drops raw HTML from the
 * source by default, so every tag in the output was emitted by this pipeline
 * from our own files. That is what makes `dangerouslySetInnerHTML` safe at the
 * call site. Adding inline HTML support later means `rehype-raw` AND
 * `rehype-sanitize`, together — never the first on its own.
 */

type MaybeParent = Root | RootContent;

function isElement(node: MaybeParent): node is Element {
  return node.type === "element";
}

function hasChildren(node: MaybeParent): node is Root | Element {
  return node.type === "root" || node.type === "element";
}

/**
 * Two touches the standard plugins don't cover: links that leave the site open
 * in a new tab with the usual opener protection, and images load lazily.
 *
 * A plain recursive walk rather than `unist-util-visit` — one more dependency
 * to traverse an object graph is not worth it.
 */
function rehypePolish() {
  return (tree: Root): void => {
    walk(tree);
  };
}

function walk(node: MaybeParent): void {
  if (isElement(node)) {
    const props = (node.properties ??= {});

    if (node.tagName === "a") {
      const href = props.href;
      if (typeof href === "string" && /^https?:\/\//i.test(href)) {
        props.target = "_blank";
        // hast models `rel` as a space-separated list, not a string.
        props.rel = ["noopener", "noreferrer"];
      }
    }

    if (node.tagName === "img") {
      props.loading = "lazy";
      props.decoding = "async";
    }
  }

  if (hasChildren(node)) {
    for (const child of node.children) walk(child);
  }
}

/**
 * Built once at module scope on purpose. rehype-highlight registers ~37
 * highlight.js grammars the first time it runs; rebuilding the pipeline per
 * post would repeat that for every page in the build.
 */
const pipeline = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSlug)
  // No options: v7 records an unknown ```language as a vfile message and
  // leaves the block unhighlighted, so a typo can't fail the build. (The
  // older `ignoreMissing` flag is gone — it no longer has anything to do.)
  .use(rehypeHighlight)
  .use(rehypePolish)
  .use(rehypeStringify);

export async function renderMarkdown(markdown: string): Promise<string> {
  const file = await pipeline.process(markdown);
  // `file.value` is typed `string | Uint8Array`; String(file) is the documented
  // way to read it as text under `strict`.
  return String(file);
}

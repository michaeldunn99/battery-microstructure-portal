import { readFile } from "node:fs/promises";
import path from "node:path";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

function inlineHref(href: string | undefined) {
  if (!href) return href;
  const base = "https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/";
  if (!href.startsWith(base)) return href;
  const destination = href.slice(base.length);
  if (destination.startsWith("scripts/extract_physical_features.py")) {
    const line = destination.match(/#L(\d+)$/)?.[1];
    return line ? `#extractor-L${line}` : "#extractor";
  }
  if (destination === "public/physical_feature_vectors.csv") return "#sample-measurements";
  if (destination === "public/qc_dataset_features.csv") return "#raw-measurements";
  if (destination === "validation/physical-rerun.json") return "#validation-record";
  return href;
}

const markdownComponents: Components = {
  h1: ({ node: _node, ...props }) => (
    <h3 className="mb-6 text-xl font-semibold tracking-tight text-zinc-950" {...props} />
  ),
  h2: ({ node: _node, ...props }) => (
    <h4 className="mb-4 mt-10 border-t border-zinc-200 pt-6 text-xl font-semibold tracking-tight text-zinc-950" {...props} />
  ),
  h3: ({ node: _node, ...props }) => (
    <h4 className="mb-3 mt-7 text-lg font-semibold text-zinc-950" {...props} />
  ),
  p: ({ node: _node, ...props }) => (
    <p className="my-4 text-sm leading-7 text-zinc-700 sm:text-base" {...props} />
  ),
  a: ({ node: _node, ...props }) => (
    <a className="break-words text-zinc-950 underline decoration-zinc-400 underline-offset-4 hover:decoration-zinc-950" {...{ ...props, href: inlineHref(props.href) }} />
  ),
  ul: ({ node: _node, ...props }) => (
    <ul className="my-4 list-disc space-y-3 pl-6 text-sm leading-7 text-zinc-700 sm:text-base" {...props} />
  ),
  ol: ({ node: _node, ...props }) => (
    <ol className="my-4 list-decimal space-y-3 pl-6 text-sm leading-7 text-zinc-700 sm:text-base" {...props} />
  ),
  blockquote: ({ node: _node, ...props }) => (
    <blockquote className="my-5 border-l-2 border-zinc-300 pl-4 text-zinc-600" {...props} />
  ),
  table: ({ node: _node, ...props }) => (
    <div className="my-6 overflow-x-auto rounded-md border border-zinc-200">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm leading-6" {...props} />
    </div>
  ),
  thead: ({ node: _node, ...props }) => (
    <thead className="bg-zinc-50 text-zinc-950" {...props} />
  ),
  th: ({ node: _node, ...props }) => (
    <th scope="col" className="border-b border-zinc-200 px-4 py-3 align-top font-semibold" {...props} />
  ),
  td: ({ node: _node, ...props }) => (
    <td className="border-b border-zinc-200 px-4 py-3 align-top text-zinc-700" {...props} />
  ),
  code: ({ node: _node, className, ...props }) => (
    <code className={`rounded bg-zinc-100 px-1 py-0.5 font-mono text-[0.85em] [overflow-wrap:anywhere] ${className ?? ""}`} {...props} />
  ),
  pre: ({ node: _node, ...props }) => (
    <pre
      tabIndex={0}
      className="my-5 overflow-x-auto rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 [&>code]:block [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-xs [&>code]:[overflow-wrap:normal]"
      {...props}
    />
  ),
};

const sections = {
  preparation: { id: "image-preparation", label: "Image preparation and phase assignment", start: "## Inputs and image preparation", end: "## Feature definitions" },
  calculations: { id: "feature-calculations", label: "Feature calculations and assumptions", start: "### Correlation and porosity uncertainty", end: "## Implementation and application" },
  test: { id: "test-set-procedure", label: "Test-set procedure", start: "## Implementation and application", end: "## Reproducibility" },
} as const;

export default async function PhysicalMethodDetails({ section }: { section: keyof typeof sections }) {
  const markdown = await readFile(path.join(process.cwd(), "PHYSICAL_METHOD.md"), "utf8");
  const { id, label, start, end } = sections[section];
  const from = markdown.indexOf(start);
  const to = markdown.indexOf(end, from + start.length);
  if (from < 0 || to < 0) throw new Error(`Missing method section: ${section}`);
  const content = markdown.slice(from, to).replace(/^## Implementation and application\n/, "");
  return (
    <details id={id} className="scroll-mt-6 rounded-md border border-zinc-200">
      <summary className="cursor-pointer p-4 text-sm font-semibold text-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
        {label}
      </summary>
      <div className="min-w-0 border-t border-zinc-200 p-5 sm:p-6 [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden">
        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]} components={markdownComponents} skipHtml>
          {content}
        </ReactMarkdown>
      </div>
    </details>
  );
}

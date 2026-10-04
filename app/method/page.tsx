import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import ExtractorCodeViewer from "@/components/ExtractorCodeViewer";

export const metadata: Metadata = {
  title: "Physical extraction method | Electrode microstructure analysis",
  description: "Physical feature definitions and the extraction procedure.",
};

export const dynamic = "force-static";
export const runtime = "nodejs";

const markdownComponents: Components = {
  h1: ({ node: _node, ...props }) => (
    <h1 className="mb-6 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl" {...props} />
  ),
  h2: ({ node: _node, ...props }) => (
    <h2 className="mb-4 mt-10 border-t border-zinc-200 pt-6 text-xl font-semibold tracking-tight text-zinc-950" {...props} />
  ),
  h3: ({ node: _node, ...props }) => (
    <h3 className="mb-3 mt-7 text-lg font-semibold text-zinc-950" {...props} />
  ),
  p: ({ node: _node, ...props }) => (
    <p className="my-4 text-sm leading-7 text-zinc-700 sm:text-base" {...props} />
  ),
  a: ({ node: _node, ...props }) => (
    <a className="break-words text-zinc-950 underline decoration-zinc-400 underline-offset-4 hover:decoration-zinc-950" {...props} />
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

export default async function MethodPage() {
  const markdown = await readFile(path.join(process.cwd(), "PHYSICAL_METHOD.md"), "utf8");

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 p-4 sm:p-6 lg:p-10">
      <nav aria-label="Method navigation" className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-5 text-sm">
        <Link href="/" className="text-zinc-700 underline underline-offset-4 hover:text-zinc-950">
          Back to analysis
        </Link>
        <a href="/downloads/physical-method.md" download className="text-zinc-700 underline underline-offset-4 hover:text-zinc-950">
          Download method (Markdown)
        </a>
      </nav>

      <article className="min-w-0 rounded-md border border-zinc-200 bg-paper p-5 sm:p-7 lg:p-9 [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={markdownComponents}
          skipHtml
        >
          {markdown}
        </ReactMarkdown>
      </article>

      <ExtractorCodeViewer />
    </main>
  );
}

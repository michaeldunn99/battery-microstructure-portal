import { readFile } from "node:fs/promises";
import path from "node:path";
import CopyButton from "@/components/CopyButton";

export default async function ExtractorCodeViewer() {
  const source = await readFile(
    path.join(process.cwd(), "scripts", "extract_physical_features.py"),
    "utf8",
  );

  return (
    <section
      id="extractor"
      aria-labelledby="extractor-heading"
      className="space-y-4 rounded-md border border-zinc-200 bg-paper p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h2 id="extractor-heading" className="text-xl font-semibold tracking-tight text-zinc-950">
            Extraction script
          </h2>
          <p className="text-sm leading-6 text-zinc-600">
            Python implementation of the physical feature extraction method.
          </p>
        </div>
        <a
          href="/downloads/extract_physical_features.py"
          download
          className="text-sm text-zinc-700 underline underline-offset-4 hover:text-zinc-950"
        >
          Download Python script
        </a>
      </div>

      <details className="group rounded-md border border-zinc-200">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
          View source code
        </summary>
        <div className="space-y-3 border-t border-zinc-200 p-4">
          <CopyButton text={source} />
          <pre
            tabIndex={0}
            aria-label="Physical feature extraction Python source"
            className="max-h-[38rem] overflow-auto rounded-md border border-zinc-200 bg-zinc-50 p-4 text-xs leading-6 text-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <code>{source}</code>
          </pre>
        </div>
      </details>
    </section>
  );
}

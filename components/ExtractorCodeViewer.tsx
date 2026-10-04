import { readFile } from "node:fs/promises";
import path from "node:path";
import CopyButton from "@/components/CopyButton";

export default async function ExtractorCodeViewer() {
  const source = await readFile(path.join(process.cwd(), "scripts", "extract_physical_features.py"), "utf8");
  return (
    <details id="extractor" className="scroll-mt-6 rounded-md border border-zinc-200">
      <summary className="cursor-pointer p-4 text-sm font-semibold text-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
        Calculation code (Python)
      </summary>
      <div className="space-y-3 border-t border-zinc-200 p-4">
        <p className="text-sm leading-6 text-zinc-600">The executable extraction script. Feature links open the corresponding calculation.</p>
        <CopyButton text={source} />
        <pre tabIndex={0} aria-label="Physical feature extraction Python source" className="max-h-[38rem] overflow-auto rounded-md border border-zinc-200 bg-zinc-50 p-4 text-xs leading-6 text-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
          <code>{source.trimEnd().split("\n").map((line, index) => (
            <span key={index} id={`extractor-L${index + 1}`} className="block min-w-max scroll-mt-8 target:bg-zinc-200 focus:bg-zinc-200 focus:outline-none">
              <span aria-hidden="true" className="mr-5 inline-block w-8 select-none text-right text-zinc-400">{index + 1}</span>{line || " "}{"\n"}
            </span>
          ))}</code>
        </pre>
      </div>
    </details>
  );
}

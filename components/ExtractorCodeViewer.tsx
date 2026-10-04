import { readFile } from "node:fs/promises";
import path from "node:path";
import CopyButton from "@/components/CopyButton";

const scripts = {
  extraction: { filename: "extract_physical_features.py", id: "extractor", label: "Original BSE extraction code (Python)", description: "The original phase segmentation and physical calculations. Feature links open the corresponding calculation; the three-detector experiment preserves these measurement definitions.", codeLabel: "Physical feature extraction Python source" },
  comparison: { filename: "compare_physical_batches.py", id: "comparison-code", label: "Statistical comparison code (Python)", description: "The executable comparison script used to generate the statistical results. It can compare a new batch with the saved reference measurements.", codeLabel: "Physical batch comparison Python source" },
  multichannel: { filename: "run_multichannel_experiment.py", id: "multichannel-code", label: "Three-detector extraction code (Python)", description: "Joint pixel clustering, unchanged physical measurements and a BSE-only control. Each run saves vectors, masks, figures, settings and input hashes.", codeLabel: "Three-detector segmentation and physical extraction Python source" },
} as const;

export default async function ExtractorCodeViewer({ script = "extraction" }: { script?: keyof typeof scripts }) {
  const config = scripts[script];
  const source = await readFile(path.join(process.cwd(), "scripts", config.filename), "utf8");
  return (
    <details id={config.id} className="scroll-mt-6 rounded-md border border-zinc-200">
      <summary className="cursor-pointer p-4 text-sm font-semibold text-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
        {config.label}
      </summary>
      <div className="space-y-3 border-t border-zinc-200 p-4">
        <p className="text-sm leading-6 text-zinc-600">{config.description}</p>
        <CopyButton text={source} />
        <pre tabIndex={0} aria-label={config.codeLabel} className="max-h-[38rem] overflow-auto rounded-md border border-zinc-200 bg-zinc-50 p-4 text-xs leading-6 text-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
          <code>{source.trimEnd().split("\n").map((line, index) => (
            <span key={index} id={`${config.id}-L${index + 1}`} className="block min-w-max scroll-mt-8 target:bg-zinc-200 focus:bg-zinc-200 focus:outline-none">
              <span aria-hidden="true" className="mr-5 inline-block w-8 select-none text-right text-zinc-400">{index + 1}</span>{line || " "}{"\n"}
            </span>
          ))}</code>
        </pre>
      </div>
    </details>
  );
}

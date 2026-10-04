import { readFile } from "node:fs/promises";
import path from "node:path";
import CopyButton from "@/components/CopyButton";

const scripts = {
  multichannel: { filename: "run_multichannel_experiment.py", id: "multichannel-code", label: "Feature extraction code (Python)", description: "The executed script for detector preparation, joint segmentation and physical measurements. The reported vectors use its stacked_three_channel output.", codeLabel: "Feature extraction Python source" },
  assignment: { filename: "assign_multichannel_tests.py", id: "assignment-code", label: "Batch assignment code (Python)", description: "The executed assignment script. The reported confidence bands use the empirical_precision_v2 option specified in the protocol.", codeLabel: "Batch assignment Python source" },
} as const;

export default async function ExtractorCodeViewer({ script = "multichannel" }: { script?: keyof typeof scripts }) {
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

import Image from "next/image";

const figureWidth = 1800;
const figureHeight = 660;
const figureSizes = "(max-width: 640px) calc(100vw - 80px), (max-width: 1024px) calc(100vw - 96px), (max-width: 1280px) calc(100vw - 144px), 1134px";

type SampleFigure = {
  sampleId: string;
  batch: string;
  detector: "ETD" | "SE";
  number?: number;
};

const mainFigures: SampleFigure[] = [
  { sampleId: "4ih2ggld", batch: "Batch 1", detector: "ETD", number: 1 },
];

const additionalFigures: SampleFigure[] = [
  { sampleId: "0grcilhi", batch: "Batch 3", detector: "ETD", number: 2 },
  { sampleId: "rxax5ozo", batch: "Batch 2", detector: "SE" },
];

const testFigures: SampleFigure[] = [
  { sampleId: "0eryguqq", batch: "test_1", detector: "ETD" },
  { sampleId: "3e122cbj", batch: "test_1", detector: "ETD" },
  { sampleId: "4hq27w4c", batch: "test_1", detector: "ETD" },
  { sampleId: "fhwrjtet", batch: "test_1", detector: "ETD" },
  { sampleId: "fn0mhxef", batch: "test_1", detector: "ETD" },
  { sampleId: "fspqbkxl", batch: "test_1", detector: "ETD" },
  { sampleId: "soo2ax3r", batch: "test_1", detector: "ETD" },
  { sampleId: "xrv9xvzb", batch: "test_1", detector: "ETD" },
  { sampleId: "y59rxmxl", batch: "test_1", detector: "ETD" },
];

function FullResolutionView({ src, alt, label }: {
  src: string;
  alt: string;
  label: string;
}) {
  return (
    <details className="mt-3 rounded-md border border-zinc-200">
      <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600">
        Inspect at full resolution
        <span className="sr-only">: {label}</span>
      </summary>
      <p className="px-4 pb-3 text-sm text-zinc-600">Scroll within the image to inspect details.</p>
      <div role="region" aria-label={`${label}, full-resolution image`} tabIndex={0} className="max-h-[70vh] overflow-auto border-t border-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600">
        <Image src={src} width={figureWidth} height={figureHeight} unoptimized className="h-auto w-auto max-w-none" alt={alt} />
      </div>
    </details>
  );
}

function MethodFigure({ sampleId, batch, detector, number }: SampleFigure) {
  const src = `/multichannel/method/${sampleId}.png`;
  const label = `${number ? `Fig. ${number}. ` : ""}${batch}, sample ${sampleId}`;
  const alt = `${batch}, sample ${sampleId}: smoothed BSE, Inlens and ${detector} inputs followed by the saved three-channel pore, graphite and silicon mask.`;

  return (
    <figure>
      <Image src={src} width={figureWidth} height={figureHeight} sizes={figureSizes} className="h-auto w-full" alt={alt} />
      <FullResolutionView src={src} label={label} alt={alt} />
      <figcaption className="mt-3 text-sm leading-6 text-zinc-600">
        <strong className="font-semibold text-zinc-800">{label}.</strong> Detector inputs and the saved joint segmentation. The third detector is {detector}. Silicon-labelled mask boundaries remain provisional.
      </figcaption>
    </figure>
  );
}

function ExpandableFigure({ figure }: { figure: SampleFigure }) {
  return (
    <details className="rounded-md border border-zinc-200">
      <summary className="cursor-pointer p-4 text-sm font-semibold text-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
        {figure.batch}, sample {figure.sampleId}
      </summary>
      <div className="border-t border-zinc-200 p-4">
        <MethodFigure {...figure} />
      </div>
    </details>
  );
}

export default function PhysicalMethodFigures() {
  return (
    <section id="preprocessing-figures" aria-labelledby="preprocessing-figures-heading" className="scroll-mt-6 space-y-5 border-t border-zinc-200 pt-6">
      <div className="space-y-2">
        <h3 id="preprocessing-figures-heading" className="text-base font-semibold text-zinc-950">Three-channel segmentation</h3>
        <p className="max-w-4xl text-sm leading-6 text-zinc-600">Each pixel contributes separately standardized BSE, Inlens and ETD/SE intensities to KMeans. The channels are stacked, not averaged, and retain their original coordinates without automatic registration.</p>
        <p className="max-w-4xl text-sm leading-6 text-zinc-600">The first three panels show detector inputs after Gaussian smoothing (σ = 1 pixel); the fourth shows their joint segmentation. All panels display the same central 900 × 900 pixel window. Percentages use the whole crop, which retains the central 80% of image height. The separate CBD median allocation is not shown.</p>
      </div>

      <div className="space-y-6 divide-y divide-zinc-200">
        {mainFigures.map((figure, index) => (
          <div key={figure.sampleId} className={index > 0 ? "pt-6" : undefined}>
            <MethodFigure {...figure} />
          </div>
        ))}
      </div>

      <div className="space-y-3 border-t border-zinc-200 pt-5">
        <h4 className="text-sm font-semibold text-zinc-800">Additional known samples</h4>
        {additionalFigures.map((figure) => (
          <ExpandableFigure key={figure.sampleId} figure={figure} />
        ))}
      </div>

      <div className="space-y-3 border-t border-zinc-200 pt-5">
        <h4 className="text-sm font-semibold text-zinc-800">Full test set ({testFigures.length} samples)</h4>
        {testFigures.map((figure) => (
          <ExpandableFigure key={figure.sampleId} figure={figure} />
        ))}
      </div>
    </section>
  );
}

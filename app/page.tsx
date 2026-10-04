import CorePhysicalFingerprintHero from "@/components/CorePhysicalFingerprintHero";
import PhysicalFeatureVector from "@/components/PhysicalFeatureVector";
import { loadPhysicalVector, physicalFeatures } from "@/lib/physical-vector";
import Link from "next/link";
import PhysicalMethodFigures from "@/components/PhysicalMethodFigures";
import PhysicalResults from "@/components/PhysicalResults";

export default async function Home() {
  const { example, rawExample, batchValues, count, rows } = await loadPhysicalVector();
  return (
    <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-10 space-y-12">
      <section className="space-y-3 border-b border-zinc-200 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-md text-xs font-semibold bg-zinc-50 text-zinc-700 border border-zinc-200">
            2D microstructure analysis
          </span>
          <span className="px-3 py-1 rounded-md text-xs font-semibold bg-zinc-50 text-zinc-700 border border-zinc-200">
            Electrode cross-sections
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold text-zinc-950 tracking-tight">
          Electrode microstructure analysis
        </h1>
        <p className="text-base sm:text-lg text-zinc-600 max-w-4xl leading-relaxed">
          {count} samples across three batches. Feature definitions, physical measurements and batch results.
        </p>
      </section>
      <section aria-labelledby="abstract-heading" className="space-y-3 border-b border-zinc-200 pb-6">
        <h2 id="abstract-heading" className="text-xl font-semibold">Abstract</h2>
        <p className="max-w-4xl text-sm leading-7 text-zinc-700">We compare electrode cross-sections from three batches using physical measurements of phase area, pore structure and inclusion geometry. Batch 1 has lower mean pore area fraction and vertical pore chord length than the Batch 3 reference. We report the measurements, calculation code and supporting figures. The comparisons are exploratory; phase assignments and batch acceptance criteria require validation.</p>
      </section>
      <section aria-labelledby="introduction-heading" className="space-y-3 rounded-md border border-zinc-200 bg-paper p-6 lg:p-8">
        <h2 id="introduction-heading" className="text-2xl font-semibold tracking-tight lg:text-3xl">1. Introduction</h2>
        <p className="max-w-4xl text-sm leading-7 text-zinc-600">The aim is to identify changes in incoming electrode material relative to an approved baseline. Image-derived fractions, lengths, shapes and spatial variation provide interpretable descriptions of the observed microstructure. We use Batch 3 as the reference and compare Batches 1 and 2. These comparisons describe image differences; they do not by themselves establish a manufacturing defect.</p>
      </section>
      <PhysicalFeatureVector example={example} rawExample={rawExample} />
      <section id="core-factors"><CorePhysicalFingerprintHero batchValues={batchValues} /></section>
      <PhysicalMethodFigures />
      <section id="physical-results"><PhysicalResults rows={rows} features={physicalFeatures.map(({ key, label, unit }) => ({ key, label, unit }))} /></section>
      <section aria-labelledby="discussion-heading" className="space-y-3 rounded-md border border-zinc-200 bg-paper p-6 lg:p-8">
        <h2 id="discussion-heading" className="text-2xl font-semibold tracking-tight lg:text-3xl">4. Discussion and limitations</h2>
        <p className="max-w-4xl text-sm leading-7 text-zinc-600">The observed shifts motivate closer inspection of Batch 1. Sample counts are limited, and the saved results do not establish an acceptance threshold or a causal link to cell performance. Segmentation, image sampling and specimen orientation can affect the measurements.</p>
        <p className="max-w-4xl text-sm leading-7 text-zinc-600">The 14 entries are not independent physical quantities. The vector includes an uncertainty estimate, an anisotropy ratio derived from two other entries, and a CBD allocation tied to pore fraction. These dependencies matter if the vector is used in a statistical model.</p>
      </section>
      <section aria-labelledby="reproducibility-heading" className="space-y-3 rounded-md border border-zinc-200 bg-paper p-6 lg:p-8">
        <h2 id="reproducibility-heading" className="text-2xl font-semibold tracking-tight lg:text-3xl">5. Reproducibility and test-set use</h2>
        <p className="max-w-4xl text-sm leading-7 text-zinc-600">The extraction uses the central 80% of image height, a 0.025 µm/pixel scale, Gaussian σ = 1.0 and three-class Multi-Otsu thresholds calculated for each image.</p>
        <p className="max-w-4xl text-sm leading-7 text-zinc-600">The standalone extractor applies this physical method to a batch of paired BSE and Inlens images. Reuse the same settings and verify acquisition scale before comparing a test set with Batch 3. ImageRep must be available for uncertainty and correlation length; missing dependencies must not produce placeholder measurements.</p>
        <p className="max-w-4xl text-sm leading-7 text-zinc-600">Reproducibility: all 31 samples were rerun with the standalone extractor. All 434 feature values matched the saved measurements to two decimal places.</p>
        <Link className="mr-5 inline-block text-sm text-blue-800 underline underline-offset-4" href="/method">Read the method and calculation code</Link>
        <a className="mr-5 inline-block text-sm text-blue-800 underline underline-offset-4" href="/downloads/extract_physical_features.py" download>Download the extractor</a>
      </section>
    </main>
  );
}

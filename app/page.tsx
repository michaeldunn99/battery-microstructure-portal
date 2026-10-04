import PhysicalInterpretation from "@/components/PhysicalInterpretation";
import PhysicalFeatureVector from "@/components/PhysicalFeatureVector";
import { loadPhysicalVector, physicalFeatures } from "@/lib/physical-vector";
import PhysicalResults from "@/components/PhysicalResults";
import PhysicalMethodDetails from "@/components/PhysicalMethodDetails";
import ReportNavigation from "@/components/ReportNavigation";
import { ReportDownloads, ReportReferences, VerificationDetails } from "@/components/ReportResources";

export default async function Home() {
  const { example, count, rows, rawRows } = await loadPhysicalVector();
  return (
    <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-10 space-y-12">
      <ReportNavigation />
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
          {count} known image pairs across three batches, plus three test image pairs. Physical definitions, measurements and comparisons.
        </p>
      </section>
      <section aria-labelledby="abstract-heading" className="space-y-3 border-b border-zinc-200 pb-6">
        <h2 id="abstract-heading" className="text-xl font-semibold">Abstract</h2>
        <p className="max-w-4xl text-sm leading-7 text-zinc-700">Interpretable detection of supplier-material changes requires measurements that identify how incoming electrode microstructures differ from a reference. We extract 13 physical descriptors from 31 paired electron-microscopy image crops, covering labelled phase area, pore geometry, and bright-inclusion size, shape and spatial variation. Porosity is accompanied by an estimate of image-sampling uncertainty. With Batch 3 as the reference, Batch 1 shows lower mean pore area (9.35% versus 11.16%) and shorter vertical pore chords (0.379 versus 0.421 µm), alongside substantially greater variation in matrix and inclusion area. Batch 2 is closer on pore area, vertical chord length and inclusion aspect ratio, although this pattern does not hold for every descriptor. These measurements provide interpretable candidate features for assigning held-out crops to Batches 1, 2 or 3. The challenge batches were assembled from crops of approximately 15 original electrode images; independent specimens cannot be inferred from crop counts. Batch assignment and confidence calibration remain to be evaluated. The batch labels describe microstructural variation, not material quality or manufacturing acceptance.</p>
      </section>
      <section aria-labelledby="introduction-heading" className="space-y-3 rounded-md border border-zinc-200 bg-paper p-6 lg:p-8">
        <h2 id="introduction-heading" className="text-2xl font-semibold tracking-tight lg:text-3xl">1. Introduction</h2>
        <p className="max-w-4xl text-sm leading-7 text-zinc-600">Batch 3 represents the material promised by the supplier. Batches 1 and 2 contain subsequent, deliberately assembled patterns of variation; neither is labelled better or worse. The challenge evaluates whether each held-out image can be assigned to Batch 1, 2 or 3 with confidence and a physical explanation. Distinguishing Batch 1 from Batch 2 matters as much as distinguishing either from the reference.</p>
        <p className="max-w-4xl text-sm leading-7 text-zinc-600">We compare four feature families: phase area fractions, pore geometry, inclusion size and shape, and inclusion spatial variation. The organisers describe the data as crops from approximately 15 original electrode images, arranged into artificial batches. This is a test of recognising microstructural patterns. Establishing manufacturing acceptance limits or performance on genuinely new material populations would require separate validation.</p>
        <p className="max-w-4xl text-sm leading-7 text-zinc-600">These measurements describe how much of each assigned phase is present, the dimensions and directionality of pore space, and the geometry and distribution of bright inclusions. Each value can be traced to a mask or geometric calculation. Their physical interpretation is limited by the two-dimensional images and the phase assignments; they do not directly measure transport or establish a manufacturing defect.</p>
      </section>
      <PhysicalInterpretation />
      <PhysicalFeatureVector example={example} />
      <section id="physical-results"><PhysicalResults rows={rows} rawRows={rawRows} features={physicalFeatures.map(({ key, label, unit }) => ({ key, label, unit }))} /></section>
      <section aria-labelledby="discussion-heading" className="space-y-3 rounded-md border border-zinc-200 bg-paper p-6 lg:p-8">
        <h2 id="discussion-heading" className="text-2xl font-semibold tracking-tight lg:text-3xl">5. Discussion and limitations</h2>
        <p className="max-w-4xl text-sm leading-7 text-zinc-600">Batch 1 differs in its observed pore measurements and in the spread of matrix and inclusion areas, with two crops accounting for much of the latter. Batch 2 is closer to the reference on several measurements, but cannot be treated as the reference class. These patterns motivate a three-class assignment method that considers individual feature combinations and variability. They do not establish defects or a causal link to cell performance.</p>
        <p className="max-w-4xl text-sm leading-7 text-zinc-600">Crops from the same electrode image may share structure. Validation should hold out entire source images where their identities are known; a random split of crops can overstate performance. The current mean tests assume independent observations and are therefore provisional. Holm adjustment does not correct dependence between observations, segmentation error or dataset construction.</p>
        <p className="max-w-4xl text-sm leading-7 text-zinc-600">The 13 physical descriptors are not independent: the anisotropy ratio is derived from two chord lengths, and the CBD allocation is tied to pore fraction. Porosity uncertainty is reported separately. These dependencies and measurement uncertainties need explicit treatment if a statistical model is fitted.</p>
        <details className="rounded-md border border-zinc-200">
          <summary className="cursor-pointer p-4 text-sm font-semibold text-zinc-800">Scope relative to published electrode analyses</summary>
          <div className="space-y-3 border-t border-zinc-200 p-4 text-sm leading-7 text-zinc-600">
            <p><a href="#ref-polaron" className="text-zinc-900 underline underline-offset-4">Polaron's solid-state electrode case study</a> separates phase identity, interfacial contact, connectivity and transport. It uses segmented images and reconstructed three-dimensional volumes. In solid-state electrodes, contact with solid electrolyte is central; pores do not have the same role as electrolyte-filled pore space in a conventional cell.</p>
            <p>This report measures two-dimensional area fractions, pore chords and correlation scale, and the size, shape and spatial variation of bright inclusions. It does not measure phase-specific interfaces, graphite-particle alignment, three-dimensional connectivity or tortuosity. These are possible extensions requiring additional calculations or validation.</p>
            <p>The literature motivates the physical questions. It does not establish that this particular descriptor set detects manufacturing defects. That claim requires evaluation against independent batch outcomes.</p>
          </div>
        </details>
      </section>
      <section aria-labelledby="reproducibility-heading" className="space-y-3 rounded-md border border-zinc-200 bg-paper p-6 lg:p-8">
        <h2 id="reproducibility-heading" className="text-2xl font-semibold tracking-tight lg:text-3xl">6. Reproducibility and test-set use</h2>
        <p className="max-w-4xl text-sm leading-7 text-zinc-600">The extraction was repeated for all 31 known image pairs; all 434 numerical fields matched the full-precision measurements. The same extractor has now measured the three image pairs in test_1. Their vectors are shown alongside the known batches in Results. This comparison reports physical measurements without assigning class probabilities.</p>
        <div className="overflow-x-auto" role="region" aria-label="Test-set readiness" tabIndex={0}>
          <table className="w-full min-w-[560px] text-left text-sm leading-6">
            <caption className="pb-3 text-left text-zinc-600">What is ready for the held-out images</caption>
            <thead className="border-y border-zinc-200"><tr><th scope="col" className="py-2 pr-5 font-medium">Step</th><th scope="col" className="py-2 font-medium">Current status</th></tr></thead>
            <tbody className="divide-y divide-zinc-200 border-b border-zinc-200">
              <tr><th scope="row" className="py-3 pr-5 font-medium">Physical extraction</th><td className="py-3">Complete for all three test pairs, retaining the original 14 numerical fields.</td></tr>
              <tr><th scope="row" className="py-3 pr-5 font-medium">Reference comparisons</th><td className="py-3">All 13 descriptors compared with Batches 1, 2 and 3 in their measured units.</td></tr>
              <tr><th scope="row" className="py-3 pr-5 font-medium">Batch assignment</th><td className="py-3">Deferred. This report currently compares dimensions directly.</td></tr>
              <tr><th scope="row" className="py-3 pr-5 font-medium">Validation</th><td className="py-3">Parent-image grouping and absolute pixel calibration remain to be confirmed. P-values are not class probabilities.</td></tr>
            </tbody>
          </table>
        </div>
        <PhysicalMethodDetails section="test" />
        <VerificationDetails />
        <ReportDownloads />
      </section>
      <ReportReferences />
    </main>
  );
}

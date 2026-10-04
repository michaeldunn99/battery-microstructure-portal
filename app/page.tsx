import PhysicalInterpretation from "@/components/PhysicalInterpretation";
import PhysicalFeatureVector from "@/components/PhysicalFeatureVector";
import { loadCombinedPhysicalVector } from "@/lib/physical-vector";
import PhysicalResults from "@/components/PhysicalResults";
import PhysicalMethodDetails from "@/components/PhysicalMethodDetails";
import ReportNavigation from "@/components/ReportNavigation";
import { ReportDownloads, ReportReferences, VerificationDetails } from "@/components/ReportResources";
import combinedReport from "@/public/multichannel/summary.json";
import assignments from "@/public/multichannel/test_assignments.json";

export default async function Home() {
  const { example, count } = await loadCombinedPhysicalVector();
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
          {count} known samples across three batches and {combinedReport.test_ids.length} test samples. BSE, Inlens and ETD/SE measurements, methods and comparisons.
        </p>
      </section>
      <section aria-labelledby="abstract-heading" className="space-y-3 border-b border-zinc-200 pb-6">
        <h2 id="abstract-heading" className="text-xl font-semibold">Abstract</h2>
        <p className="max-w-4xl text-sm leading-7 text-zinc-700">We assess electrode-batch similarity using 13 physical descriptors and a porosity uncertainty estimate from {count} labelled crops and {combinedReport.test_ids.length} test samples. Joint segmentation of BSE, Inlens and ETD/SE images measures phase area fractions, pore structure, and silicon-region geometry and spatial variation. Test vectors are assigned to the nearest standardised batch mean. Leave-one-crop-out validation correctly assigns {assignments.known_evaluation.correct} of {count} crops ({(100 * assignments.known_evaluation.accuracy).toFixed(1)}%). Confidence bands report validation precision for each predicted batch. The report provides individual measurements, segmentation figures and reproducible calculations. Segmentation boundaries and crop independence remain unvalidated; manufacturing acceptance criteria have not been established.</p>
      </section>
      <section aria-labelledby="introduction-heading" className="space-y-3 rounded-md border border-zinc-200 bg-paper p-6 lg:p-8">
        <h2 id="introduction-heading" className="text-2xl font-semibold tracking-tight lg:text-3xl">1. Introduction</h2>
        <p className="max-w-4xl text-sm leading-7 text-zinc-600">Batch 3 represents the material promised by the supplier. Batches 1 and 2 contain subsequent, deliberately assembled patterns of variation; neither is labelled better or worse. The challenge evaluates whether each held-out image can be assigned to Batch 1, 2 or 3 with confidence and a physical explanation. Distinguishing Batch 1 from Batch 2 matters as much as distinguishing either from the reference.</p>
        <p className="max-w-4xl text-sm leading-7 text-zinc-600">We compare four feature families: phase area fractions, pore geometry, silicon particle size and shape, and silicon particle spatial variation. The organisers describe the data as crops from approximately 15 original electrode images, arranged into artificial batches. This is a test of recognising microstructural patterns. Establishing manufacturing acceptance limits or performance on genuinely new material populations would require separate validation.</p>
        <p className="max-w-4xl text-sm leading-7 text-zinc-600">These measurements describe how much of each assigned phase is present, the dimensions and directionality of pore space, and the geometry and distribution of silicon particles. Each value can be traced to a mask or geometric calculation. Their physical interpretation is limited by the two-dimensional images and the phase assignments; they do not directly measure transport or establish a manufacturing defect.</p>
        <p className="max-w-4xl text-sm leading-7 text-zinc-600">The same three-detector extraction is applied to known and test samples. Each assignment is accompanied by its measured physical features.</p>
      </section>
      <PhysicalInterpretation />
      <PhysicalFeatureVector example={example} />
      <section id="physical-results"><PhysicalResults /></section>
      <section aria-labelledby="discussion-heading" className="space-y-3 rounded-md border border-zinc-200 bg-paper p-6 lg:p-8">
        <h2 id="discussion-heading" className="text-2xl font-semibold tracking-tight lg:text-3xl">5. Discussion and limitations</h2>
        <p className="max-w-4xl text-sm leading-7 text-zinc-600">With combined segmentation, mean pore area is {combinedReport.measurements.find(feature => feature.key === "porosity_pct")!.batches.map(batch => `${batch.batch.replace("_", " ")}: ${batch.combined.mean.toFixed(2)}%`).join("; ")}. These measurements describe the observed crops. The classifier remains uncertain between Batches 1 and 2: two of the three test assignments with organiser feedback are incorrect. Labels for the other six samples have not been supplied.</p>
        <p className="max-w-4xl text-sm leading-7 text-zinc-600">Bright rims and lines can enter the silicon-labelled class. These boundaries affect area fractions, connected-component geometry and pore measurements. ImageRep uncertainty is conditional on each mask and does not include phase-assignment error. Independently assessed phase boundaries are needed to validate segmentation accuracy.</p>
        <p className="max-w-4xl text-sm leading-7 text-zinc-600">Crops from the same electrode image may share structure. Validation should hold out entire source images where their identities are known; a random split of crops can overstate performance. The current leave-one-crop-out validation may therefore overestimate performance on independent electrode images.</p>
        <p className="max-w-4xl text-sm leading-7 text-zinc-600">The 13 physical descriptors are not independent: the anisotropy ratio is derived from two chord lengths, and the CBD allocation is tied to pore fraction. The current distance rule also includes porosity uncertainty and omits D10. Correlated quantities receive separate contributions, so the inputs do not provide 13 independent pieces of evidence.</p>
        <details className="rounded-md border border-zinc-200">
          <summary className="cursor-pointer p-4 text-sm font-semibold text-zinc-800">Scope relative to published electrode analyses</summary>
          <div className="space-y-3 border-t border-zinc-200 p-4 text-sm leading-7 text-zinc-600">
            <p><a href="#ref-polaron" className="text-zinc-900 underline underline-offset-4">Polaron's solid-state electrode case study</a> separates phase identity, interfacial contact, connectivity and transport. It uses segmented images and reconstructed three-dimensional volumes. In solid-state electrodes, contact with solid electrolyte is central; pores do not have the same role as electrolyte-filled pore space in a conventional cell.</p>
            <p>This report measures two-dimensional area fractions, pore chords and correlation scale, and the size, shape and spatial variation of silicon particles. It does not measure phase-specific interfaces, graphite-particle alignment, three-dimensional connectivity or tortuosity. These are possible extensions requiring additional calculations or validation.</p>
            <p>The literature motivates the physical questions. It does not establish that this particular descriptor set detects manufacturing defects. That claim requires evaluation against independent batch outcomes.</p>
          </div>
        </details>
      </section>
      <section aria-labelledby="reproducibility-heading" className="space-y-3 rounded-md border border-zinc-200 bg-paper p-6 lg:p-8">
        <h2 id="reproducibility-heading" className="text-2xl font-semibold tracking-tight lg:text-3xl">6. Reproducibility and test-set use</h2>
        <p className="max-w-4xl text-sm leading-7 text-zinc-600">All {count} known samples and {combinedReport.test_ids.length} test samples use the same preparation, segmentation and measurement settings. Repeated extraction of three samples reproduces all 42 reported measurement values and three joint masks exactly. Input hashes, software versions, source snapshots and full-precision vectors document the calculations.</p>
        <div className="overflow-x-auto" role="region" aria-label="Test-set readiness" tabIndex={0}>
          <table className="w-full min-w-[560px] text-left text-sm leading-6">
            <caption className="pb-3 text-left text-zinc-600">Complete test-set processing</caption>
            <thead className="border-y border-zinc-200"><tr><th scope="col" className="py-2 pr-5 font-medium">Step</th><th scope="col" className="py-2 font-medium">Current status</th></tr></thead>
            <tbody className="divide-y divide-zinc-200 border-b border-zinc-200">
              <tr><th scope="row" className="py-3 pr-5 font-medium">Physical extraction</th><td className="py-3">Complete for all {combinedReport.test_ids.length} test samples using three-detector segmentation.</td></tr>
              <tr><th scope="row" className="py-3 pr-5 font-medium">Reference comparisons</th><td className="py-3">All 13 descriptors compared with Batches 1, 2 and 3 in their measured units.</td></tr>
              <tr><th scope="row" className="py-3 pr-5 font-medium">Batch assignment</th><td className="py-3">Nearest standardized known-batch mean. Confidence bands and their validation basis are listed with each assignment.</td></tr>
              <tr><th scope="row" className="py-3 pr-5 font-medium">Validation</th><td className="py-3">Leave-one-crop-out checks are provisional because crops can share source images. Class-level validation rates are not individual probabilities.</td></tr>
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

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
          {count} samples across three batches. Feature definitions, physical measurements and batch results.
        </p>
      </section>
      <section aria-labelledby="abstract-heading" className="space-y-3 border-b border-zinc-200 pb-6">
        <h2 id="abstract-heading" className="text-xl font-semibold">Abstract</h2>
        <p className="max-w-4xl text-sm leading-7 text-zinc-700">Detecting changes in incoming electrode material before downstream manufacturing problems arise requires interpretable batch comparisons with explicit treatment of measurement uncertainty. We present a reproducible image-analysis pipeline that extracts 13 descriptors of labelled phase area fractions, pore geometry, and bright-inclusion size, shape and spatial distribution. Porosity estimates include 95% confidence intervals for image-sampling uncertainty, conditional on segmentation. We apply the method to 31 electron-microscopy cross-sections from three batches, using Batch 3 as the reference. Batch 1 has lower mean pore area fraction (9.35% versus 11.16%) and vertical pore chord length (0.379 versus 0.421 µm). Two-sided Welch tests with Holm adjustment find no significant mean differences across the 26 planned comparisons at the 0.05 level. The measurements provide traceable evidence for expert review, but do not establish equivalence. Phase assignments, acceptance and rejection criteria, and performance on unseen batches require independent validation.</p>
      </section>
      <section aria-labelledby="introduction-heading" className="space-y-3 rounded-md border border-zinc-200 bg-paper p-6 lg:p-8">
        <h2 id="introduction-heading" className="text-2xl font-semibold tracking-tight lg:text-3xl">1. Introduction</h2>
        <p className="max-w-4xl text-sm leading-7 text-zinc-600">We ask whether incoming electrode material differs from a reference batch in measurable aspects of its microstructure. We compare Batches 1 and 2 with Batch 3 using four feature families: phase area fractions, pore geometry, inclusion size and shape, and inclusion spatial variation.</p>
        <p className="max-w-4xl text-sm leading-7 text-zinc-600">These measurements describe how much of each assigned phase is present, the dimensions and directionality of pore space, and the geometry and distribution of bright inclusions. Each value can be traced to a mask or geometric calculation. Their physical interpretation is limited by the two-dimensional images and the phase assignments; they do not directly measure transport or establish a manufacturing defect.</p>
      </section>
      <PhysicalInterpretation />
      <PhysicalFeatureVector example={example} />
      <section id="physical-results"><PhysicalResults rows={rows} rawRows={rawRows} features={physicalFeatures.map(({ key, label, unit }) => ({ key, label, unit }))} /></section>
      <section aria-labelledby="discussion-heading" className="space-y-3 rounded-md border border-zinc-200 bg-paper p-6 lg:p-8">
        <h2 id="discussion-heading" className="text-2xl font-semibold tracking-tight lg:text-3xl">5. Discussion and limitations</h2>
        <p className="max-w-4xl text-sm leading-7 text-zinc-600">The observed shifts motivate closer inspection of Batch 1. No estimable feature-mean difference reaches the 0.05 criterion after Holm adjustment across 26 planned comparisons. With seven observations per incoming batch, absence of statistical significance does not establish equivalence. The results do not establish an acceptance threshold or a causal link to cell performance. Segmentation, image sampling and specimen orientation can affect the measurements.</p>
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
        <p className="max-w-4xl text-sm leading-7 text-zinc-600">The extraction was repeated for all 31 samples. All 434 values matched the saved measurements to two decimal places. To compare a new batch, apply the same measurement specification and verify its image scale.</p>
        <PhysicalMethodDetails section="test" />
        <VerificationDetails />
        <ReportDownloads />
      </section>
      <ReportReferences />
    </main>
  );
}

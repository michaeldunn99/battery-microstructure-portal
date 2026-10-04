import verification from "@/validation/physical-rerun.json";
import precisionVerification from "@/validation/physical-full-precision.json";
import combinedSummary from "@/public/multichannel/summary.json";
import combinedRun from "@/validation/multichannel/full-test-run.json";
import combinedVerification from "@/validation/multichannel/validation.json";
import testReproduction from "@/validation/multichannel/full-test-reproduction.json";

const downloads = [
  ["/multichannel/test_assignments.csv", "Test assignments and confidence (CSV)", "All nine images; percentages are class-level validation rates."],
  ["/multichannel/test_1.csv", "Test measurements (CSV)", "All nine images, with 13 physical descriptors and porosity uncertainty at full precision."],
  ["/multichannel/known_batches.csv", "Known-batch measurements (CSV)", "31 known images processed by the same three-detector segmentation."],
  ["/multichannel/summary.json", "Measurement summaries (JSON)", "Known-batch means, sample standard deviations and all nine individual test vectors."],
  ["/multichannel/test_assignments.json", "Assignment measurements and validation (JSON)", "Current confidence policy v2; retained v1 diagnostic gates do not set the displayed bands."],
  ["/multichannel/test_feature_evidence.csv", "Assignment feature evidence (CSV)", "Every assignment input compared with the known batch means."],
  ["/downloads/physical-method.md", "Protocol (Markdown)", "Current measurement and assignment methods, with executable instructions."],
  ["/physical-feature-vector.tex", "Feature vector (LaTeX)", "The combined-method example for Batch 3, sample 0grcilhi; porosity uncertainty is separate."],
] as const;

const calculationDownloads = [
  ["/downloads/assign_multichannel_tests.py", "Batch assignment calculation (Python)", "Repeat known-image validation and test assignment."],
  ["/downloads/run_multichannel_experiment.py", "Three-detector extractor (Python)", "Repeat segmentation, vector extraction and diagnostic figure generation."],
  ["/downloads/multichannel-full-test-run.json", "Complete test extraction record (JSON)", "All nine images: detector input hashes, fitted centroids, settings and software versions."],
  ["/downloads/multichannel-full-test-alignment.json", "Complete test alignment audit (JSON)", "Image grid and detector alignment diagnostics."],
  ["/downloads/multichannel-run.json", "Known-batch extraction record (JSON)", "The 31 known images; initial test records are retained in this run's history."],
  ["/downloads/multichannel-run-source.py", "Known-batch run source (Python)", "The source snapshot recorded with the known-batch extraction."],
  ["/downloads/multichannel-validation.json", "Combined extraction verification (JSON)", "Original-value reproduction and repeated pilot checks."],
] as const;

const archivedDownloads = [
  ["/multichannel/original_known.csv", "Original BSE: known-batch measurements (CSV)", "The original 31 images and 14 physical fields, at full precision."],
  ["/test_1_physical_features.csv", "Original BSE: initial test release (CSV)", "Three historical test vectors; not the current nine-image results."],
  ["/physical_feature_vectors.csv", "Original BSE: presentation vectors (CSV)", "31 known samples, rounded to two decimal places."],
  ["/physical_batch_statistics.json", "Original BSE: mean tests (JSON)", "Historical Welch/Holm mean comparisons, not the current assignment calculation."],
  ["/downloads/extract_physical_features.py", "Original BSE extractor (Python)", "Original segmentation and the shared downstream measurement calculations."],
  ["/downloads/compare_physical_batches.py", "Original BSE: batch mean comparison (Python)", "Reproduce the supplementary statistical comparisons."],
  ["/downloads/physical-rerun.json", "Original BSE verification (JSON)", "Original run settings, dependency versions, input hashes and reproduction checks."],
] as const;

export function VerificationDetails() {
  const knownCount = combinedSummary.batch_counts.reduce((total, batch) => total + batch.n, 0);
  return (
    <details id="validation-record" className="scroll-mt-6 rounded-md border border-zinc-200">
      <summary className="cursor-pointer p-4 text-sm font-semibold text-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">Combined-method verification and software versions</summary>
      <div className="space-y-4 border-t border-zinc-200 p-4 text-sm leading-6 text-zinc-700">
        <p>The current report contains {knownCount} known images and {combinedSummary.test_counts.total} test images. Summary generation checked {combinedSummary.verification.numeric_fields_checked.toLocaleString("en-GB")} numerical entries against the extraction records, with a maximum absolute difference of {combinedSummary.verification.csv_report_max_error}.</p>
        <p>The repeated test extraction reproduced {testReproduction.numerical_values_compared} previously saved values and {Object.keys(testReproduction.mask_sha256_matches).length} masks exactly. These are reproducibility checks, not validation of the assigned material phases.</p>
        <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {Object.entries(combinedRun.versions).map(([name, version]) => <div key={name}><dt className="font-medium">{name}</dt><dd>{version}</dd></div>)}
          <div className="sm:col-span-2"><dt className="font-medium">ImageRep revision</dt><dd className="break-all font-mono text-xs">{combinedRun.imagerep_revision}</dd></div>
        </dl>
        <details className="border-t border-zinc-200 pt-3">
          <summary className="cursor-pointer font-medium">Settings, source hashes and checks</summary>
          <pre tabIndex={0} aria-label="Combined physical extraction settings and verification" className="mt-3 max-h-96 overflow-auto rounded-md border border-zinc-200 bg-zinc-50 p-4 text-xs leading-6"><code>{JSON.stringify({ method: combinedRun.method, sources: combinedSummary.sources, exports: combinedSummary.exports, summaryChecks: combinedSummary.verification, extractionChecks: combinedVerification, repeatedTestChecks: testReproduction }, null, 2)}</code></pre>
        </details>
      </div>
    </details>
  );
}

function OriginalVerificationDetails() {
  return (
    <details className="rounded-md border border-zinc-200">
      <summary className="cursor-pointer p-4 text-sm font-semibold text-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">Original BSE verification and software versions</summary>
      <div className="space-y-4 border-t border-zinc-200 p-4 text-sm leading-6 text-zinc-700">
        <p>{verification.comparison.matched_numeric_values} of {verification.numeric_value_count} values matched across {verification.sample_count} samples at two decimal places. This verifies reproduction of the saved measurements; it does not validate phase assignment or release criteria.</p>
        <p>The full-precision export was also checked across {precisionVerification.sample_count} samples: all {precisionVerification.exact_matches} values matched the saved raw measurements exactly. The default two-decimal export was unchanged for the checked example.</p>
        <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
          <div><dt className="font-medium">Python</dt><dd>{verification.execution.python}</dd></div>
          {Object.entries(verification.execution.dependencies).map(([name, version]) => <div key={name}><dt className="font-medium">{name}</dt><dd>{version}</dd></div>)}
          <div className="sm:col-span-2"><dt className="font-medium">ImageRep revision</dt><dd className="break-all font-mono text-xs">{verification.source.imagerep_commit}</dd></div>
        </dl>
        <details className="border-t border-zinc-200 pt-3">
          <summary className="cursor-pointer font-medium">Run settings and input hashes</summary>
          <pre tabIndex={0} aria-label="Complete physical extraction verification records" className="mt-3 max-h-96 overflow-auto rounded-md border border-zinc-200 bg-zinc-50 p-4 text-xs leading-6"><code>{JSON.stringify({ originalRun: verification, fullPrecisionExport: precisionVerification }, null, 2)}</code></pre>
        </details>
      </div>
    </details>
  );
}

export function ReportDownloads() {
  return (
    <details id="downloads" className="scroll-mt-6 rounded-md border border-zinc-200">
      <summary className="cursor-pointer p-4 text-sm font-semibold text-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">Downloads and repository</summary>
      <div className="space-y-4 border-t border-zinc-200 p-4">
      <p className="text-sm leading-6 text-zinc-600">Current three-detector analysis: 31 known images, nine test images and 14 saved measurement fields per image.</p>
      <ul className="divide-y divide-zinc-200 text-sm">
        {downloads.map(([href, label, description]) => <li key={href} className="py-3"><a href={href} download className="font-medium text-zinc-900 underline underline-offset-4">{label}</a><p className="mt-1 leading-6 text-zinc-600">{description}</p></li>)}
      </ul>
      <details className="rounded-md border border-zinc-200">
        <summary className="cursor-pointer p-4 text-sm font-semibold text-zinc-800">Calculation code and run records</summary>
        <ul className="divide-y divide-zinc-200 border-t border-zinc-200 px-4 text-sm">{calculationDownloads.map(([href, label, description]) => <li key={href} className="py-3"><a href={href} download className="font-medium text-zinc-900 underline underline-offset-4">{label}</a><p className="mt-1 leading-6 text-zinc-600">{description}</p></li>)}</ul>
      </details>
      <details className="rounded-md border border-zinc-200">
        <summary className="cursor-pointer p-4 text-sm font-semibold text-zinc-800">Archive: original BSE analysis</summary>
        <div className="space-y-4 border-t border-zinc-200 p-4">
          <p className="text-sm leading-6 text-zinc-600">Earlier segmentation results retained for reproduction and method comparison. Current tables use the combined measurements above.</p>
          <ul className="divide-y divide-zinc-200 text-sm">{archivedDownloads.map(([href, label, description]) => <li key={href} className="py-3"><a href={href} download className="font-medium text-zinc-900 underline underline-offset-4">{label}</a><p className="mt-1 leading-6 text-zinc-600">{description}</p></li>)}</ul>
          <OriginalVerificationDetails />
        </div>
      </details>
      <p className="text-sm"><a href="https://github.com/michaeldunn99/battery-microstructure-portal" target="_blank" rel="noreferrer" className="font-medium text-zinc-900 underline underline-offset-4">Project repository</a></p>
      </div>
    </details>
  );
}

const references = [
  { id: "ref-moon", label: "Moon et al. (2021)", title: "Interplay between electrochemical reactions and mechanical responses in silicon–graphite anodes and its impact on degradation", journal: "Nature Communications 12, 2714", href: "https://doi.org/10.1038/s41467-021-22662-7", use: "Silicon particle size, expansion and composite degradation; does not validate our segmented boundaries." },
  { id: "ref-otero", label: "Otero et al. (2018)", title: "Design-Considerations regarding Silicon/Graphite and Tin/Graphite Composite Electrodes for Lithium-Ion Batteries", journal: "Scientific Reports 8, 15851", href: "https://doi.org/10.1038/s41598-018-33405-y", use: "Analytical model of initial porosity and expansion tolerance; does not validate a pore-chord threshold." },
  { id: "ref-cabello", label: "Cabello et al. (2020)", title: "Towards a High-Power Si@graphite Anode for Lithium Ion Batteries through a Wet Ball Milling Process", journal: "Molecules 25, 2494", href: "https://doi.org/10.3390/molecules25112494", use: "Processing-dependent silicon agglomeration and distribution; does not calibrate our spatial-variation statistic." },
  { id: "ref-microlib", label: "Kench, Squires, Dahari and Cooper (2022)", title: "MicroLib: A library of 3D microstructures generated from 2D micrographs using SliceGAN", journal: "Scientific Data 9, 645", href: "https://doi.org/10.1038/s41597-022-01744-1", use: "Compares phase fraction, surface-area density and two-point correlation to assess generated microstructures. It does not prescribe our Holm correction or a batch-assignment rule." },
  { id: "ref-equivalence", label: "Yen, Leber and Pibida (2020)", title: "Comparing Instruments", journal: "NIST Technical Note 2106", href: "https://doi.org/10.6028/NIST.TN.2106", use: "Equivalence requires a predefined range of practically acceptable differences. This statistical guidance does not supply electrode acceptance limits." },
  { id: "ref-welch", label: "SciPy", title: "Independent two-sample t-test", journal: "Statistical software documentation", href: "https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.ttest_ind.html", use: "Welch's unequal-variance test and confidence interval for the difference in means." },
  { id: "ref-holm", label: "R Core Team", title: "Adjust P-values for Multiple Comparisons", journal: "stats documentation; Holm (1979)", href: "https://stat.ethz.ch/R-manual/R-devel/library/stats/html/p.adjust.html", use: "Holm adjustment controls family-wise error while allowing dependence between valid tests." },
  { id: "ref-asa", label: "American Statistical Association (2016)", title: "Statement on Statistical Significance and P-Values", journal: "Interpretation guidance", href: "https://www.amstat.org/asa/files/pdfs/P-ValueStatement.pdf", use: "A p-value is not an effect size or a probability of a manufacturing defect. Decisions require scientific context." },
  { id: "ref-zielke", label: "Zielke et al. (2015)", title: "Three-Phase Multiscale Modeling of a LiCoO₂ Cathode: Combining the Advantages of FIB-SEM Imaging and X-Ray Tomography", journal: "Advanced Energy Materials 5, 1401612", href: "https://doi.org/10.1002/aenm.201401612", use: "Physical roles of electrode phases; does not validate our phase segmentation." },
  { id: "ref-ebner", label: "Ebner et al. (2014)", title: "Tortuosity Anisotropy in Lithium-Ion Battery Electrodes", journal: "Advanced Energy Materials 4, 1301278", href: "https://doi.org/10.1002/aenm.201301278", use: "Particle morphology and directional transport; does not equate 2D chords with tortuosity." },
  { id: "ref-muller", label: "Müller et al. (2018)", title: "Quantifying Inhomogeneity of Lithium Ion Battery Electrodes and Its Influence on Electrochemical Performance", journal: "Journal of The Electrochemical Society 165, A339-A344", href: "https://doi.org/10.1149/2.0311802jes", use: "Microstructural heterogeneity in graphite anodes; does not validate a threshold for our silicon particle statistic." },
  { id: "ref-dahari", label: "Dahari et al. (2025)", title: "Prediction of Microstructural Representativity From A Single Image", journal: "Advanced Science", href: "https://doi.org/10.1002/advs.202414149", use: "Porosity representativity and correlation-based uncertainty, conditional on correct segmentation." },
  { id: "ref-mitsch", label: "Mitsch et al. (2014)", title: "Preparation and Characterization of Li-Ion Graphite Anodes Using Synchrotron Tomography", journal: "Materials 7", href: "https://doi.org/10.3390/ma7064455", use: "Ageing changes in tortuosity and surface area despite similar porosity; not a manufacturing-batch validation." },
  { id: "ref-choi", label: "Choi et al. (2023)", title: "Optimization of Pore Characteristics of Graphite-Based Anode for Li-Ion Batteries by Control of the Particle Size Distribution", journal: "Materials 16, 6896", href: "https://doi.org/10.3390/ma16216896", use: "Graphite particle mixtures alter packing and porosity. Our silicon particle sizes are not identified graphite particle sizes." },
  { id: "ref-taiwo", label: "Taiwo et al. (2016)", title: "Comparison of three-dimensional analysis and stereological techniques for quantifying lithium-ion battery electrode microstructures", journal: "Journal of Microscopy", href: "https://doi.org/10.1111/jmi.12389", use: "Scope and limitations of two-dimensional versus three-dimensional measurements." },
  { id: "ref-polaron", label: "Polaron (2026)", title: "Quantifying and Optimising Solid-State Battery Electrodes", journal: "Industrial case study", href: "https://www.polaron.ai/newsroom/quantifying-and-optimising-solid-state-battery-electrodes", use: "Phase-specific interfaces, connectivity and transport from reconstructed solid-state electrodes. A different chemistry and measurement scope from this report." },
  { id: "ref-kelly", label: "Kelly (2007)", title: "Some Aspects of Measurement Error in Linear Regression of Astronomical Data", journal: "The Astrophysical Journal 665, 1489-1506", href: "https://arxiv.org/abs/0705.2774", use: "Example of modelling measurement uncertainties separately from observed values; not an electrode study." },
  { id: "ref-multiotsu", label: "scikit-image", title: "Multi-Otsu thresholding", journal: "Software documentation", href: "https://scikit-image.org/docs/stable/auto_examples/segmentation/plot_multiotsu.html", use: "Intensity-based segmentation." },
  { id: "ref-kmeans", label: "scikit-learn", title: "KMeans", journal: "Software documentation", href: "https://scikit-learn.org/stable/modules/generated/sklearn.cluster.KMeans.html", use: "Joint intensity clustering with explicit initial centroids. Algorithm documentation does not validate our material labels." },
  { id: "ref-regionprops", label: "scikit-image", title: "Region measurements", journal: "Software documentation", href: "https://scikit-image.org/docs/stable/api/skimage.measure.html#skimage.measure.regionprops", use: "Component area, equivalent diameter and ellipse axes." },
  { id: "ref-numpy", label: "NumPy", title: "Standard deviation", journal: "Software documentation", href: "https://numpy.org/doc/stable/reference/generated/numpy.std.html", use: "Population standard deviation used for spatial variation." },
];

export function ReportReferences() {
  return (
    <section aria-labelledby="references-heading" className="space-y-4 border-t border-zinc-200 pt-6 text-sm leading-6 text-zinc-600">
      <h2 id="references-heading" className="text-xl font-semibold text-zinc-950">References</h2>
      <p>The glossary states which physical interpretation each source supports and where our implementation differs.</p>
      <details id="references" className="rounded-md border border-zinc-200 bg-paper">
        <summary className="cursor-pointer p-4 font-semibold text-zinc-800">Electrode studies and measurement sources ({references.length})</summary>
      <ol className="list-decimal space-y-5 border-t border-zinc-200 py-5 pl-10 pr-5">
        {references.map((reference) => (
          <li key={reference.id} id={reference.id} className="scroll-mt-6">
            <p><span className="font-semibold text-zinc-800">{reference.label}.</span> {reference.href ? <a href={reference.href} target="_blank" rel="noreferrer" className="text-zinc-900 underline underline-offset-4">{reference.title}</a> : <span>{reference.title}</span>}. <em>{reference.journal}</em>.</p>
            <p className="mt-1">{reference.use}</p>
          </li>
        ))}
      </ol>
      </details>
    </section>
  );
}

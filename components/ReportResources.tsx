import verification from "@/validation/physical-rerun.json";
import precisionVerification from "@/validation/physical-full-precision.json";

const downloads = [
  ["/test_1_physical_features.csv", "Test image measurements (CSV)", "Three image pairs, each with the original 13 descriptors and porosity uncertainty at full precision."],
  ["/downloads/test-1-run.json", "Test extraction record (JSON)", "Input hashes, extractor settings and ImageRep revision for the three test samples."],
  ["/physical_feature_vectors.csv", "Measurements and uncertainty (CSV)", "31 samples, each with 13 descriptors and a porosity uncertainty estimate, rounded to two decimal places."],
  ["/qc_dataset_features.csv", "Full-precision measurements (CSV)", "The saved physical measurements used for batch comparisons."],
  ["/qc_summary_report.json", "Batch summary (JSON)", "Sample counts and batch means."],
  ["/physical_batch_statistics.json", "Statistical comparisons (JSON)", "Mean differences, pointwise 95% intervals, raw and Holm-adjusted p-values, settings and input hashes."],
  ["/downloads/physical-method.md", "Protocol (Markdown)", "The measurement specification and test-set instructions."],
  ["/downloads/extract_physical_features.py", "Extractor (Python)", "The executable calculation code shown in Methods."],
  ["/downloads/compare_physical_batches.py", "Batch comparison (Python)", "Repeat the statistical analysis or compare a new batch with the reference."],
  ["/downloads/physical-rerun.json", "Verification record (JSON)", "Run settings, dependency versions, input hashes and comparisons."],
  ["/physical-feature-vector.tex", "Feature vector (LaTeX)", "The 13-descriptor vector with its porosity uncertainty reported separately."],
] as const;

export function VerificationDetails() {
  return (
    <details id="validation-record" className="scroll-mt-6 rounded-md border border-zinc-200">
      <summary className="cursor-pointer p-4 text-sm font-semibold text-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">Verification record and software versions</summary>
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
      <ul className="divide-y divide-zinc-200 border-t border-zinc-200 px-4 text-sm">
        {downloads.map(([href, label, description]) => <li key={href} className="py-3"><a href={href} download className="font-medium text-zinc-900 underline underline-offset-4">{label}</a><p className="mt-1 leading-6 text-zinc-600">{description}</p></li>)}
        <li className="py-3"><a href="https://github.com/michaeldunn99/battery-microstructure-portal" target="_blank" rel="noreferrer" className="font-medium text-zinc-900 underline underline-offset-4">Project repository</a><p className="mt-1 leading-6 text-zinc-600">Source code and version history on GitHub.</p></li>
      </ul>
    </details>
  );
}

const references = [
  { id: "ref-microlib", label: "Kench, Squires, Dahari and Cooper (2022)", title: "MicroLib: A library of 3D microstructures generated from 2D micrographs using SliceGAN", journal: "Scientific Data 9, 645", href: "https://doi.org/10.1038/s41597-022-01744-1", use: "Compares phase fraction, surface-area density and two-point correlation to assess generated microstructures. It does not prescribe our Holm correction or a batch-assignment rule." },
  { id: "ref-equivalence", label: "Yen, Leber and Pibida (2020)", title: "Comparing Instruments", journal: "NIST Technical Note 2106", href: "https://doi.org/10.6028/NIST.TN.2106", use: "Equivalence requires a predefined range of practically acceptable differences. This statistical guidance does not supply electrode acceptance limits." },
  { id: "ref-welch", label: "SciPy", title: "Independent two-sample t-test", journal: "Statistical software documentation", href: "https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.ttest_ind.html", use: "Welch's unequal-variance test and confidence interval for the difference in means." },
  { id: "ref-holm", label: "R Core Team", title: "Adjust P-values for Multiple Comparisons", journal: "stats documentation; Holm (1979)", href: "https://stat.ethz.ch/R-manual/R-devel/library/stats/html/p.adjust.html", use: "Holm adjustment controls family-wise error while allowing dependence between valid tests." },
  { id: "ref-asa", label: "American Statistical Association (2016)", title: "Statement on Statistical Significance and P-Values", journal: "Interpretation guidance", href: "https://www.amstat.org/asa/files/pdfs/P-ValueStatement.pdf", use: "A p-value is not an effect size or a probability of a manufacturing defect. Decisions require scientific context." },
  { id: "ref-zielke", label: "Zielke et al. (2015)", title: "Three-Phase Multiscale Modeling of a LiCoO₂ Cathode: Combining the Advantages of FIB-SEM Imaging and X-Ray Tomography", journal: "Advanced Energy Materials 5, 1401612", href: "https://doi.org/10.1002/aenm.201401612", use: "Physical roles of electrode phases; does not validate our phase segmentation." },
  { id: "ref-ebner", label: "Ebner et al. (2014)", title: "Tortuosity Anisotropy in Lithium-Ion Battery Electrodes", journal: "Advanced Energy Materials 4, 1301278", href: "https://doi.org/10.1002/aenm.201301278", use: "Particle morphology and directional transport; does not equate 2D chords with tortuosity." },
  { id: "ref-muller", label: "Müller et al. (2018)", title: "Quantifying Inhomogeneity of Lithium Ion Battery Electrodes and Its Influence on Electrochemical Performance", journal: "Journal of The Electrochemical Society 165, A339-A344", href: "https://doi.org/10.1149/2.0311802jes", use: "Microstructural heterogeneity in graphite anodes; does not validate a threshold for our inclusion statistic." },
  { id: "ref-dahari", label: "Dahari et al. (2025)", title: "Prediction of Microstructural Representativity From A Single Image", journal: "Advanced Science", href: "https://doi.org/10.1002/advs.202414149", use: "Porosity representativity and correlation-based uncertainty, conditional on correct segmentation." },
  { id: "ref-mitsch", label: "Mitsch et al. (2014)", title: "Preparation and Characterization of Li-Ion Graphite Anodes Using Synchrotron Tomography", journal: "Materials 7", href: "https://doi.org/10.3390/ma7064455", use: "Ageing changes in tortuosity and surface area despite similar porosity; not a manufacturing-batch validation." },
  { id: "ref-choi", label: "Choi et al. (2023)", title: "Optimization of Pore Characteristics of Graphite-Based Anode for Li-Ion Batteries by Control of the Particle Size Distribution", journal: "Materials 16, 6896", href: "https://doi.org/10.3390/ma16216896", use: "Graphite particle mixtures alter packing and porosity. Our bright inclusion sizes are not identified graphite particle sizes." },
  { id: "ref-taiwo", label: "Taiwo et al. (2016)", title: "Comparison of three-dimensional analysis and stereological techniques for quantifying lithium-ion battery electrode microstructures", journal: "Journal of Microscopy", href: "https://doi.org/10.1111/jmi.12389", use: "Scope and limitations of two-dimensional versus three-dimensional measurements." },
  { id: "ref-polaron", label: "Polaron (2026)", title: "Quantifying and Optimising Solid-State Battery Electrodes", journal: "Industrial case study", href: "https://www.polaron.ai/newsroom/quantifying-and-optimising-solid-state-battery-electrodes", use: "Phase-specific interfaces, connectivity and transport from reconstructed solid-state electrodes. A different chemistry and measurement scope from this report." },
  { id: "ref-kelly", label: "Kelly (2007)", title: "Some Aspects of Measurement Error in Linear Regression of Astronomical Data", journal: "The Astrophysical Journal 665, 1489-1506", href: "https://arxiv.org/abs/0705.2774", use: "Example of modelling measurement uncertainties separately from observed values; not an electrode study." },
  { id: "ref-multiotsu", label: "scikit-image", title: "Multi-Otsu thresholding", journal: "Software documentation", href: "https://scikit-image.org/docs/stable/auto_examples/segmentation/plot_multiotsu.html", use: "Intensity-based segmentation." },
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
            <p><span className="font-semibold text-zinc-800">{reference.label}.</span> <a href={reference.href} target="_blank" rel="noreferrer" className="text-zinc-900 underline underline-offset-4">{reference.title}</a>. <em>{reference.journal}</em>.</p>
            <p className="mt-1">{reference.use}</p>
          </li>
        ))}
      </ol>
      </details>
    </section>
  );
}

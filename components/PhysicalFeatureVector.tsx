import { physicalFeatures } from "@/lib/physical-vector";
import LatexFormula from "./LatexFormula";

const github = "https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/public";
const calculationLines = [70, 77, 73, 61, 74, 77, 84, 90, 98, 105, 110, 115, 116, 120];
const calculationSource = "https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/provenance/extract_physical_run.py";

export default function PhysicalFeatureVector({ example, rawExample }: { example: Record<string, string>; rawExample: Record<string, string> }) {
  const symbols = String.raw`\phi_{\mathrm{pore}} \\ u_{95} \\ f_{\mathrm{graphite}} \\ f_{\mathrm{CBD}} \\ f_{\mathrm{inclusion}} \\ a_{\mathrm{CLS}} \\ L_y \\ L_x \\ L_x/L_y \\ A_{\mathrm{inclusion}} \\ D_{10} \\ D_{50} \\ D_{90} \\ \sigma_{\mathrm{inclusion}}`;
  const values = physicalFeatures.map((feature) => example[feature.key]).join(String.raw` \\ `);
  const vectorFormula = String.raw`\mathbf{x}_i = \begin{bmatrix} ${symbols} \end{bmatrix}, \qquad \mathbf{x}_{\mathrm{${example.sample_id}}} = \begin{bmatrix} ${values} \end{bmatrix} \in \mathbb{R}^{14}`;
  return (
    <section aria-labelledby="feature-vector-heading" className="space-y-6 rounded-md border border-zinc-200 bg-paper p-6 lg:p-8">
      <div className="space-y-2 border-b border-zinc-200 pb-5">
        <h2 id="feature-vector-heading" className="text-2xl font-semibold tracking-tight lg:text-3xl">2. Methods</h2>
        <p className="max-w-4xl text-sm leading-6 text-zinc-600">One vector per sample: 13 physical descriptors and one porosity uncertainty estimate. Each entry below links to its calculation and saved value.</p>
      </div>

      <figure className="rounded-md border border-zinc-200 p-5">
        <h3 className="text-base font-semibold">Feature vector</h3>
        <div className="overflow-x-auto py-4 text-center text-sm sm:text-base" role="region" aria-label="Symbolic and numerical 14-dimensional physical feature vectors" tabIndex={0}>
          <LatexFormula formula={vectorFormula} displayMode />
        </div>
        <figcaption className="text-sm leading-6 text-zinc-600">Symbols and values share the same order and retain their exported units. The second entry is the porosity interval half-width. This is the unscaled physical vector. <a className="text-blue-800 underline underline-offset-4" href="/physical-feature-vector.tex" download>Download LaTeX</a>.</figcaption>
      </figure>

      <div>
        <h3 className="text-base font-semibold">From image to vector</h3>
        <p className="mt-2 text-sm leading-6 text-zinc-600">The <a className="text-blue-800 underline underline-offset-4" href="https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/provenance/extract_physical_run.py">extraction code</a> uses BSE for phase masks and Inlens for the CBD allocation. The steps below convert these images into physical measurements.</p>
        <ol className="mt-4 grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["1. Prepare", "Take the first image channel, crop to the central 80% of image height and smooth BSE and Inlens with Gaussian σ = 1.0 pixel. Use 0.025 µm/pixel."],
            ["2. Segment", "Fit three-class Multi-Otsu thresholds to each BSE image. Assign dark, middle and bright pixels to pore, graphite and inclusion masks."],
            ["3. Measure", "Count phase pixels; apply ImageRep to the pore mask; sample pore chords; measure inclusion components and variation across 16 tiles."],
            ["4. Export", "Select 14 physical-run fields in the order shown below. Keep full-precision values for comparisons and round to two decimals for presentation."],
          ].map(([title, text]) => (
            <li key={title} className="rounded-md border border-zinc-200 p-4">
              <h4 className="text-sm font-semibold">{title}</h4>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{text}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="overflow-x-auto" role="region" aria-label="Physical feature definitions" tabIndex={0}>
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <caption className="pb-3 text-left text-zinc-600">Example: Batch 3, sample {example.sample_id}. Values are taken directly from the <a className="underline underline-offset-4" href={`${github}/physical_feature_vectors.csv#L2`}>physical export</a>.</caption>
          <thead className="border-y border-zinc-200 bg-zinc-50 text-zinc-700">
            <tr>{["#", "Feature", "Value", "Definition and meaning"].map((label) => <th key={label} scope="col" className="px-3 py-3 font-medium">{label}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 border-b border-zinc-200">
            {physicalFeatures.map((feature, index) => (
              <tr key={feature.key}>
                <td className="px-3 py-4 align-top font-mono text-xs text-zinc-500">{String(index + 1).padStart(2, "0")}</td>
                <th scope="row" className="min-w-[185px] px-3 py-4 align-top font-medium">{feature.label}<span className="mt-1 block text-xs font-normal text-zinc-500">{feature.unit}</span></th>
                <td className="px-3 py-4 align-top font-mono tabular-nums">{example[feature.key]}</td>
                <td className="px-3 py-4 align-top leading-6 text-zinc-600">{feature.definition}<span className="mt-1 flex gap-3 text-xs text-blue-800"><a href={`${calculationSource}#L${calculationLines[index]}`} className="underline underline-offset-4">Source</a><a href={`${github}/qc_dataset_features.csv#L2`} className="underline underline-offset-4">Data</a></span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div id="calculation-record" className="scroll-mt-6 space-y-3 border-t border-zinc-200 pt-5 text-sm leading-6 text-zinc-600">
        <h3 className="text-base font-semibold text-zinc-950">Example: pore anisotropy</h3>
        <p>The horizontal chord ({Number(rawExample.chord_x_um).toFixed(6)} µm) divided by the vertical chord ({Number(rawExample.chord_y_um).toFixed(6)} µm) gives {Number(rawExample.pore_anisotropy).toFixed(6)}, displayed as {example.pore_anisotropy_ratio}. Chord length and correlation length describe different aspects of the pore geometry.</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <a className="text-blue-800 underline underline-offset-4" href="/method">Full method</a>
          <a className="text-blue-800 underline underline-offset-4" href="https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/provenance/extract_physical_run.py">Source code</a>
          <a className="text-blue-800 underline underline-offset-4" href="/physical_feature_vectors.csv" download>Download vector CSV</a>
        </div>
      </div>

      <div className="space-y-2 border-t border-zinc-200 pt-5 text-sm leading-6 text-zinc-600">
        <h3 className="text-base font-semibold text-zinc-950">Method references</h3>
        <p><a className="text-blue-800 underline underline-offset-4" href="https://scikit-image.org/docs/stable/auto_examples/segmentation/plot_multiotsu.html">Multi-Otsu</a> supports intensity-based segmentation. <a className="text-blue-800 underline underline-offset-4" href="https://scikit-image.org/docs/stable/api/skimage.measure.html#skimage.measure.regionprops">Region measurements</a> define particle areas and ellipse axes. <a className="text-blue-800 underline underline-offset-4" href="https://pubmed.ncbi.nlm.nih.gov/40697175/">Dahari et al. (2025)</a> relates two-point correlation to phase-fraction sampling uncertainty. These support the measurement methods, not the accuracy of this particular export or a batch acceptance threshold.</p>
      </div>
    </section>
  );
}

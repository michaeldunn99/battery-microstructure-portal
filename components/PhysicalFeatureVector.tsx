import { physicalFeatures } from "@/lib/physical-vector";
import LatexFormula from "./LatexFormula";
import PhysicalMethodDetails from "./PhysicalMethodDetails";
import ExtractorCodeViewer from "./ExtractorCodeViewer";
import PhysicalMethodFigures from "./PhysicalMethodFigures";
const descriptors = physicalFeatures.filter((feature) => feature.key !== "porosity_ci95_pct");
const calculationLines: Record<(typeof physicalFeatures)[number]["key"], number> = {
  porosity_pct: 123,
  porosity_ci95_pct: 129,
  active_material_pct: 124,
  cbd_pct: 118,
  inclusion_pct: 126,
  char_length_scale_cls_um: 129,
  throat_through_plane_ly_um: 137,
  chord_in_plane_lx_um: 142,
  pore_anisotropy_ratio: 149,
  particle_aspect_ratio: 155,
  particle_d10_um: 162,
  particle_d50_um: 163,
  particle_d90_um: 164,
  slurry_dispersion_index: 166,
};

export default function PhysicalFeatureVector({ example }: { example: Record<string, string> }) {
  const symbols = String.raw`\phi_{\mathrm{pore}} \\ f_{\mathrm{graphite}} \\ f_{\mathrm{CBD}} \\ f_{\mathrm{inclusion}} \\ a_{\mathrm{CLS}} \\ L_y \\ L_x \\ L_x/L_y \\ A_{\mathrm{inclusion}} \\ D_{10} \\ D_{50} \\ D_{90} \\ \sigma_{\mathrm{inclusion}}`;
  const values = descriptors.map((feature) => example[feature.key]).join(String.raw` \\ `);
  const vectorFormula = String.raw`\mathbf{x}_i = \begin{bmatrix} ${symbols} \end{bmatrix}, \qquad \mathbf{x}_{\mathrm{${example.sample_id}}} = \begin{bmatrix} ${values} \end{bmatrix} \in \mathbb{R}^{13}`;
  const uncertaintyFormula = String.raw`\begin{aligned} u_{95} &= ${example.porosity_ci95_pct}\,\text{percentage points} \\ \phi_{\mathrm{pore}} &= ${example.porosity_pct}\% \pm ${example.porosity_ci95_pct}\% \quad (95\%\,\mathrm{CI}) \end{aligned}`;
  return (
    <section id="methods" aria-labelledby="feature-vector-heading" className="space-y-6 rounded-md border border-zinc-200 bg-paper p-6 lg:p-8">
      <div className="space-y-2 border-b border-zinc-200 pb-5">
        <h2 id="feature-vector-heading" className="text-2xl font-semibold tracking-tight lg:text-3xl">3. Methods</h2>
        <p className="max-w-4xl text-sm leading-6 text-zinc-600">One 13-dimensional physical descriptor vector per sample, with porosity uncertainty reported separately. The table defines each descriptor; calculation links expand the relevant code below.</p>
      </div>

      <div>
        <h3 className="text-base font-semibold">From image to vector</h3>
        <p className="mt-2 text-sm leading-6 text-zinc-600">The extraction uses BSE for phase masks and Inlens for the CBD allocation. The steps below convert these images into physical measurements.</p>
        <ol className="mt-4 grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["1. Prepare", "Take the first image channel, crop to the central 80% of image height and smooth BSE and Inlens with Gaussian σ = 1.0 pixel. Use 0.025 µm/pixel."],
            ["2. Segment", "Fit three-class Multi-Otsu thresholds to each BSE image. Assign dark, middle and bright pixels to pore, graphite and inclusion masks."],
            ["3. Measure", "Count phase pixels; apply ImageRep to the pore mask; sample pore chords; measure inclusion components and variation across 16 tiles."],
            ["4. Export", "Save 13 physical descriptors and one porosity uncertainty estimate as a 14-field measurement record, rounded to two decimals. Batch summaries use the saved full-precision results."],
          ].map(([title, text]) => (
            <li key={title} className="rounded-md border border-zinc-200 p-4">
              <h4 className="text-sm font-semibold">{title}</h4>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{text}</p>
            </li>
          ))}
        </ol>
      </div>

      <PhysicalMethodDetails section="preparation" />

      <figure className="rounded-md border border-zinc-200 p-5">
        <h3 className="text-base font-semibold">Physical descriptor vector</h3>
        <div className="overflow-x-auto py-4 text-center text-sm sm:text-base" role="region" aria-label="Symbolic and numerical 13-dimensional physical descriptor vectors" tabIndex={0}>
          <LatexFormula formula={vectorFormula} displayMode />
        </div>
        <figcaption className="text-sm leading-6 text-zinc-600">The descriptors follow the four glossary groups in order. They retain their measured units and are not scaled. Porosity uncertainty accompanies the vector separately; the saved measurement record contains all 14 fields.</figcaption>
      </figure>

      <aside aria-labelledby="porosity-uncertainty-heading" className="rounded-md border border-zinc-200 p-5">
        <h3 id="porosity-uncertainty-heading" className="text-base font-semibold">Uncertainty reported with the vector</h3>
        <div className="overflow-x-auto py-3 text-sm sm:text-base" role="region" aria-label="Porosity and its 95 percent uncertainty interval" tabIndex={0}>
          <LatexFormula formula={uncertaintyFormula} displayMode />
        </div>
        <p className="text-sm leading-6 text-zinc-600">The ± value is the porosity interval half-width, in percentage points. It describes the precision of this estimate, not a separate material property.</p>
      </aside>

      <details id="feature-definitions" className="scroll-mt-6 rounded-md border border-zinc-200">
        <summary className="cursor-pointer p-4 text-sm font-semibold text-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">Physical descriptor definitions (13)</summary>
        <div className="overflow-x-auto border-t border-zinc-200 p-4" role="region" aria-label="Physical feature definitions" tabIndex={0}>
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <caption className="pb-3 text-left text-zinc-600">The 13 physical descriptors in vector order. Example: Batch 3, sample {example.sample_id}, from the <a className="underline underline-offset-4" href="#sample-measurements">saved measurements</a>. Porosity uncertainty is defined separately below.</caption>
          <thead className="border-y border-zinc-200 bg-zinc-50 text-zinc-700">
            <tr>{["Physical descriptor", "Value", "Calculation"].map((label) => <th key={label} scope="col" className="px-3 py-3 font-medium">{label}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 border-b border-zinc-200">
            {descriptors.map((feature) => (
              <tr key={feature.key}>
                <th scope="row" className="min-w-[185px] px-3 py-4 align-top font-medium">{feature.label}<span className="mt-1 block text-xs font-normal text-zinc-500">{feature.unit}</span></th>
                <td className="px-3 py-4 align-top font-mono tabular-nums">{example[feature.key]}</td>
                <td className="px-3 py-4 align-top leading-6 text-zinc-600">{feature.definition}<span className="mt-1 flex gap-3 text-xs text-blue-800"><a href={`#extractor-L${calculationLines[feature.key]}`} aria-label={`Calculation for ${feature.label.toLowerCase()}`} className="underline underline-offset-4">Calculation</a></span></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </details>

      <details id="porosity-uncertainty" className="scroll-mt-6 rounded-md border border-zinc-200">
        <summary className="cursor-pointer p-4 text-sm font-semibold text-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">Porosity uncertainty</summary>
        <div className="space-y-3 border-t border-zinc-200 p-4 text-sm leading-6 text-zinc-600">
          <p>ImageRep estimates an absolute porosity error with confidence 0.95 and target error 0.05. Multiplying its returned absolute error by 100 gives the interval half-width in percentage points, stored as <code className="font-mono text-xs">porosity_ci95_pct</code>.</p>
          <p>The interval estimates how representative the image is of bulk porosity. <a href="#ref-dahari" className="underline underline-offset-4">Dahari et al. (2025)</a> provide the calculation. Measurement-error models such as <a href="#ref-kelly" className="underline underline-offset-4">Kelly (2007)</a> treat uncertainty separately from observed values. Storing an interval alongside the descriptors does not by itself make a predictive model uncertainty-aware.</p>
          <p>A smaller interval indicates a more precise porosity estimate under this model. It does not indicate a better material. The estimate is conditional on the pore mask and does not include segmentation or phase-assignment error.</p>
          <p><a href="#extractor-L129" className="text-blue-800 underline underline-offset-4">Porosity uncertainty calculation</a></p>
        </div>
      </details>


      <PhysicalMethodDetails section="calculations" />
      <div className="space-y-3">
        <h3 className="text-base font-semibold">From measurements to batch comparisons</h3>
        <p className="max-w-4xl text-sm leading-6 text-zinc-600">Compare each test vector with the known batches dimension by dimension, using the original measurement units. Batch summaries describe means and between-image variation. Exploratory Welch tests address mean differences; they do not assign individual images to a batch. The organisers' source-image clarification makes their independence assumption uncertain.</p>
        <PhysicalMethodDetails section="statistics" />
      </div>
      <ExtractorCodeViewer />
      <PhysicalMethodFigures />

    </section>
  );
}

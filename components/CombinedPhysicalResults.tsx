import comparison from "@/public/multichannel/summary.json";

const overviewKeys = new Set([
  "porosity_pct",
  "active_material_pct",
  "inclusion_pct",
  "throat_through_plane_ly_um",
  "particle_aspect_ratio",
]);

const tableHeading = "px-3 py-3 text-left font-medium";
const tableCell = "whitespace-nowrap px-3 py-3 tabular-nums";
const summaryStyle = "cursor-pointer p-4 text-sm font-semibold text-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600";

function batchName(batch: string) {
  return batch.replace("_", " ");
}

export default function CombinedPhysicalResults() {
  const knownCount = comparison.batch_counts.reduce((sum, batch) => sum + batch.n, 0);
  const testIds = [...comparison.test_ids].sort();

  return (
    <section id="three-detector-comparison" aria-labelledby="three-detector-heading" className="scroll-mt-6 space-y-4 border-t border-zinc-200 pt-5">
      <div className="space-y-2">
        <h3 id="three-detector-heading" className="text-lg font-semibold text-zinc-900">Three-detector measurements</h3>
        <p className="max-w-4xl text-sm leading-6 text-zinc-600">
          We repeated the measurements on {knownCount} known images and {comparison.test_ids.length} test images using
          BSE, Inlens and ETD or SE together. The original analysis uses BSE Multi-Otsu phase masks;
          the combined analysis uses three-channel K-means masks. The crop, pixel scale and
          downstream measurement definitions are unchanged.
        </p>
        <p className="max-w-4xl text-sm leading-6 text-zinc-600">
          The change in segmentation substantially increases silicon-labelled area and reduces
          matrix area. Inspection shows additional bright edges and rims entering the silicon mask.
          These are changes in image interpretation, not changes in the specimens or evidence that
          the combined masks are more accurate.
        </p>
      </div>

      <div className="overflow-x-auto" role="region" aria-label="Combined measurements for all nine test images and known batches" tabIndex={0}>
        <table className="w-full min-w-[1900px] border-collapse text-left text-sm">
          <caption className="pb-3 text-left text-sm leading-6 text-zinc-600">
            Combined measurements for all {comparison.test_ids.length} test images. Known batches show mean ± sample standard deviation; each test column is one image. Scroll horizontally to inspect every image.
          </caption>
          <thead className="border-y border-zinc-200 bg-zinc-50 text-zinc-700">
            <tr>
              <th scope="col" className={tableHeading}>Measurement</th>
              {comparison.batch_counts.map(({ batch, n }) => <th key={batch} scope="col" className={tableHeading}>{batchName(batch)}<span className="block text-xs font-normal">n = {n}</span></th>)}
              {testIds.map(id => <th key={id} scope="col" className={`${tableHeading} border-l border-zinc-200`}>Test image<span className="block font-mono text-xs">{id}</span></th>)}
              <th scope="col" className={tableHeading}>Units</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 border-b border-zinc-200 text-zinc-950">
            {comparison.measurements.filter(feature => overviewKeys.has(feature.key)).map(feature => (
              <tr key={feature.key}>
                <th scope="row" className={tableHeading}>{feature.label}</th>
                {feature.batches.map(batch => <td key={batch.batch} className={tableCell}>{batch.combined.mean.toFixed(feature.decimals)} ± {batch.combined.sd.toFixed(feature.decimals)}</td>)}
                {testIds.map(id => <td key={id} className={`${tableCell} border-l border-zinc-200 bg-zinc-50`}>{feature.tests.find(test => test.sample_id === id)!.combined.toFixed(feature.decimals)}</td>)}
                <td className={`${tableCell} text-zinc-600`}>{feature.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <details className="rounded-md border border-zinc-200">
        <summary className={summaryStyle}>All combined measurements: known batches and individual test images</summary>
        <div className="space-y-3 border-t border-zinc-200 p-4">
          <p className="text-sm leading-6 text-zinc-600">
            Known batches show mean ± sample standard deviation between images. Each test column
            contains one image measurement. The 14 rows contain 13 physical descriptors and the
            separate porosity uncertainty half-width.
          </p>
          <div className="overflow-x-auto" role="region" aria-label="All combined measurements for all nine test images" tabIndex={0}>
            <table className="w-full min-w-[1900px] border-collapse text-left text-sm">
              <thead className="border-y border-zinc-200 bg-zinc-50 text-zinc-700">
                <tr>
                  <th scope="col" className={tableHeading}>Measurement</th>
                  <th scope="col" className={tableHeading}>Units</th>
                  {comparison.batch_counts.map(({ batch }) => <th key={batch} scope="col" className={tableHeading}>{batchName(batch)}</th>)}
                  {testIds.map(id => <th key={id} scope="col" className={`${tableHeading} border-l border-zinc-200`}>Test image<span className="block font-mono text-xs">{id}</span></th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 border-b border-zinc-200">
                {comparison.measurements.map(feature => (
                  <tr key={feature.key}>
                    <th scope="row" className={tableHeading}>{feature.label}</th>
                    <td className={`${tableCell} text-zinc-600`}>{feature.unit}</td>
                    {feature.batches.map(batch => <td key={batch.batch} className={tableCell}>{batch.combined.mean.toFixed(feature.decimals)} ± {batch.combined.sd.toFixed(feature.decimals)}</td>)}
                    {testIds.map(id => <td key={id} className={`${tableCell} border-l border-zinc-200 bg-zinc-50`}>{feature.tests.find(test => test.sample_id === id)!.combined.toFixed(feature.decimals)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm leading-6 text-zinc-600">
            Porosity uncertainty is conditional on the chosen mask and does not include the effect
            of changing segmentation. Carbon-binder allocation remains an Inlens median split
            within that mask, not an independently measured phase.
          </p>
          <p className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a href="/multichannel/known_batches.csv" download className="underline underline-offset-4">Known-image measurements (CSV)</a>
            <a href="/multichannel/test_1.csv" download className="underline underline-offset-4">Test-image measurements (CSV)</a>
            <a href="/multichannel/summary.json" download className="underline underline-offset-4">Comparison data (JSON)</a>
          </p>
        </div>
      </details>

      <details className="rounded-md border border-zinc-200">
        <summary className={summaryStyle}>Comparison with the original segmentation</summary>
        <div className="space-y-4 border-t border-zinc-200 p-4">
        <div className="overflow-x-auto" role="region" aria-label="Original and combined batch mean comparison" tabIndex={0}>
          <table className="w-full min-w-[740px] border-collapse text-left text-sm">
            <caption className="pb-3 text-left text-sm leading-6 text-zinc-600">Original → combined batch means. These changes arise from segmentation of the same images.</caption>
            <thead className="border-y border-zinc-200 bg-zinc-50 text-zinc-700">
              <tr><th scope="col" className={tableHeading}>Measurement</th>{comparison.batch_counts.map(({ batch }) => <th key={batch} scope="col" className={tableHeading}>{batchName(batch)}</th>)}<th scope="col" className={tableHeading}>Units</th></tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 border-b border-zinc-200">
              {comparison.measurements.filter(feature => overviewKeys.has(feature.key)).map(feature => <tr key={feature.key}><th scope="row" className={tableHeading}>{feature.label}</th>{feature.batches.map(batch => <td key={batch.batch} className={tableCell}>{batch.original.mean.toFixed(feature.decimals)} → {batch.combined.mean.toFixed(feature.decimals)}</td>)}<td className={`${tableCell} text-zinc-600`}>{feature.unit}</td></tr>)}
            </tbody>
          </table>
        </div>
        </div>
      </details>

      <details className="rounded-md border border-zinc-200">
        <summary className={summaryStyle}>How the assignment comparison was calculated</summary>
        <div className="space-y-3 border-t border-zinc-200 p-4 text-sm leading-6 text-zinc-600">
          <p>
            For each segmentation method, calculate a mean vector for each known batch. Divide each
            input by its sample standard deviation across all 31 known images, then assign a test image to
            the batch mean with the smallest root-mean-square standardised distance. Scaling and batch means use known
            images only. Confirmed test labels are used only to check the assignments.
          </p>
          <p>
            This controlled comparison uses the same 13 inputs for both methods: all 14 saved fields
            except D10, which is constant in the original known data. It therefore includes porosity
            uncertainty and several derived, correlated measurements. It is an exploratory comparison
            of the two segmentations, not a validated independent-feature classifier.
          </p>
          <p>
            No class probabilities or acceptance thresholds are fitted. A nearest batch identifies
            the closest of the three known means; it does not establish equivalence to that batch
            or suitability for manufacturing.
          </p>
        </div>
      </details>
    </section>
  );
}

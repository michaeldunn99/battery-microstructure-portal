import report from "@/public/qc_summary_report.json";
import statistics from "@/public/physical_batch_statistics.json";
import testMeasurements from "@/public/test_1_physical_features.json";
import { physicalFeatures } from "@/lib/physical-vector";
import Image from "next/image";
import PhysicalBatchStatistics from "./PhysicalBatchStatistics";
import PhysicalTableExplorer, { type PhysicalTableProps } from "./PhysicalTableExplorer";

const metrics = [
  { key: "porosity_pct", testKey: "porosity_pct", label: "Pore area fraction", unit: "%", decimals: 2 },
  { key: "matrix_graphite_pct", testKey: "active_material_pct", label: "Graphite-labelled area fraction", unit: "%", decimals: 2 },
  { key: "inclusion_pct", testKey: "inclusion_pct", label: "Inclusion area fraction", unit: "%", decimals: 2 },
  { key: "chord_y_um", testKey: "throat_through_plane_ly_um", label: "Vertical pore chord length", unit: "µm", decimals: 3 },
  { key: "particle_aspect_ratio", testKey: "particle_aspect_ratio", label: "Inclusion aspect ratio", unit: "Dimensionless", decimals: 2 },
] as const;

const batches = ["Batch_3", "Batch_1", "Batch_2"] as const;

function batchStandardDeviation(rawKey: string, batch: typeof batches[number]) {
  const definition = statistics.features.find((feature) => feature.raw_key === rawKey);
  const comparison = statistics.comparisons.find((entry) => entry.batch === (batch === "Batch_3" ? "Batch_1" : batch));
  const feature = comparison?.features.find((entry) => entry.key === definition?.key);
  if (!feature) throw new Error(`Missing batch summary for ${batch}/${rawKey}`);
  return batch === "Batch_3" ? feature.reference_sd : feature.incoming_sd;
}

export default function PhysicalResults({ rows, features, rawRows }: PhysicalTableProps & { rawRows: Record<string, string>[] }) {
  return (
    <section
      aria-labelledby="physical-results-heading"
      className="space-y-6 rounded-md border border-zinc-200 bg-paper p-6 lg:p-8"
    >
      <div className="space-y-2 border-b border-zinc-200 pb-5">
        <h2
          id="physical-results-heading"
          className="text-2xl font-semibold tracking-tight text-zinc-950 lg:text-3xl"
        >
          4. Results
        </h2>
        <p className="max-w-4xl text-sm leading-6 text-zinc-600">
          Relative to Batch 3, Batch 1 has 16.2% lower mean pore area fraction, 10.0% shorter vertical
          pore chords and 8.3% higher inclusion aspect ratio. Batch 2 is closer on these measurements:
          6.6% lower pore area, 2.6% shorter vertical chords and 0.8% lower aspect ratio.
        </p>
        <p className="max-w-4xl text-sm leading-6 text-zinc-600">
          The mean correlation length changes by less than 1% in both batches. The pattern is not uniform:
          Batch 2 is farther from the reference mean for graphite area fraction, pore anisotropy and
          inclusion diameters D50 and D90. These are observed differences, not validated acceptance limits.
        </p>
        <p className="max-w-4xl text-sm leading-6 text-zinc-600">
          The physical run contains {report.total_samples_processed} sample records:
          17 in Batch 3, seven in Batch 1 and seven in Batch 2. Results below use
          the full-precision measurements.
        </p>
      </div>

      <div className="overflow-x-auto" role="region" aria-label="Physical batch summaries and test images" tabIndex={0}>
        <table className="w-full min-w-[1060px] border-collapse text-left text-sm">
          <caption className="pb-3 text-left text-sm text-zinc-600">
            Table 1. Known batches: mean ± sample standard deviation between images. Test columns: individual image measurements from the same extraction, without a between-image standard deviation.
          </caption>
          <thead className="border-y border-zinc-200 bg-zinc-50 text-zinc-700">
            <tr>
              {["Metric", "Batch 3 (reference)", "Batch 1", "Batch 2"].map((heading) => (
                <th key={heading} scope="col" className="px-3 py-3 font-medium">
                  {heading}
                </th>
              ))}
              {testMeasurements.samples.map(sample => <th key={sample.sample_id} scope="col" className="border-l border-zinc-200 bg-zinc-100/60 px-3 py-3 font-medium">Test image<span className="mt-1 block font-mono text-xs">{sample.sample_id}</span></th>)}
              <th scope="col" className="px-3 py-3 font-medium">Units</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 border-b border-zinc-200 text-zinc-950">
            {metrics.map((metric) => (
              <tr key={metric.key}>
                <th scope="row" className="px-3 py-4 font-medium">
                  {metric.label}
                </th>
                {batches.map((batch) => (
                  <td key={batch} className="px-3 py-4 tabular-nums">
                    {report.batch_means[metric.key][batch].toFixed(metric.decimals)} ± {batchStandardDeviation(metric.key, batch).toFixed(metric.decimals)}
                  </td>
                ))}
                {testMeasurements.samples.map(sample => <td key={sample.sample_id} className="border-l border-zinc-200 bg-zinc-50 px-3 py-4 tabular-nums">{sample[metric.testKey].toFixed(metric.decimals)}</td>)}
                <td className="px-3 py-4 text-zinc-600">{metric.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <details id="test-image-measurements" className="scroll-mt-6 rounded-md border border-zinc-200">
        <summary className="cursor-pointer p-4 text-sm font-semibold text-zinc-800">All physical measurements for the three test images</summary>
        <div className="space-y-3 border-t border-zinc-200 p-4">
          <p className="text-sm leading-6 text-zinc-600">The original 13 descriptors and porosity uncertainty, using the same 0.025 µm/pixel setting. These columns describe individual images, not a combined test-batch mean. Absolute image calibration has not been independently verified from the exported TIFF metadata.</p>
          <div className="overflow-x-auto" role="region" aria-label="Complete test image vectors" tabIndex={0}>
            <table className="w-full min-w-[1100px] text-left text-sm tabular-nums">
              <thead className="border-y border-zinc-200"><tr><th scope="col" className="px-3 py-3 font-medium">Measurement</th><th scope="col" className="px-3 py-3 font-medium">Units</th>{batches.map(batch => <th key={batch} scope="col" className="px-3 py-3 font-medium">{batch.replace("_", " ")}</th>)}{testMeasurements.samples.map(sample => <th key={sample.sample_id} scope="col" className="border-l border-zinc-200 bg-zinc-50 px-3 py-3 font-mono text-xs font-medium">{sample.sample_id}</th>)}</tr></thead>
              <tbody className="divide-y divide-zinc-200 border-b border-zinc-200">{physicalFeatures.filter(feature => feature.key !== "porosity_ci95_pct").map(feature => {
                const decimals = feature.unit === "µm" ? 3 : 2;
                return <tr key={feature.key}><th scope="row" className="px-3 py-3 font-medium">{feature.label}</th><td className="px-3 py-3 text-zinc-600">{feature.unit}</td>{batches.map(batch => {
                  const comparison = statistics.comparisons.find(entry => entry.batch === (batch === "Batch_3" ? "Batch_1" : batch))!;
                  const values = comparison.features.find(entry => entry.key === feature.key)!;
                  const mean = batch === "Batch_3" ? values.reference_mean : values.incoming_mean;
                  return <td key={batch} className="whitespace-nowrap px-3 py-3">{mean.toFixed(decimals)} ± {batchStandardDeviation(feature.rawKey, batch).toFixed(decimals)}</td>;
                })}{testMeasurements.samples.map(sample => <td key={sample.sample_id} className="border-l border-zinc-200 bg-zinc-50 px-3 py-3">{sample[feature.key].toFixed(decimals)}</td>)}</tr>;
              })}</tbody>
            </table>
          </div>
          <p className="text-sm leading-6 text-zinc-600">Porosity uncertainty is a 95% interval half-width in percentage points, conditional on the pore mask. It differs from the between-image standard deviations in the batch columns: {testMeasurements.samples.map(sample => `${sample.sample_id}: ±${sample.porosity_ci95_pct.toFixed(2)} percentage points`).join("; ")}.</p>
        </div>
      </details>

      <div className="space-y-2 text-sm leading-6 text-zinc-600">
        <h3 className="text-base font-semibold text-zinc-900">Physical comparison of the test images</h3>
        <p><span className="font-mono text-xs">3e122cbj</span> has 18.43% inclusion area and 72.42% matrix area, resembling the inclusion-rich subset of Batch 1. Its pore area is 9.16%, and its vertical pore chord length is 0.342 µm.</p>
        <p><span className="font-mono text-xs">fn0mhxef</span> is closer to the Batch 2 means for inclusion area (6.54%), matrix area (83.79%) and vertical pore chord length (0.411 µm), but overlaps Batch 3. Its inclusion D90 of 0.623 µm exceeds Batch 2's observed maximum of 0.492 µm and falls within Batch 3's range. The physical measurements leave Batch 2 versus Batch 3 unresolved.</p>
        <p><span className="font-mono text-xs">xrv9xvzb</span> has 12.94% pore area, 81.47% matrix area and a vertical pore chord length of 0.487 µm. Its pore area and chord length lie within the observed Batch 3 ranges and above the observed maxima in Batch 2. This is a descriptive resemblance to the reference, not a confirmed source label.</p>
      </div>

      <figure className="space-y-3">
        <div className="overflow-x-auto">
          <Image
            src="/batch_comparison_qc.png"
            alt="Image-level distributions of pore-labelled area, graphite-labelled matrix, bright inclusions and vertical pore chord length. Batch 1 includes two images with high inclusion fractions and low matrix fractions."
            width={3600}
            height={900}
            unoptimized
            className="h-auto w-full min-w-[960px]"
          />
        </div>
        <figcaption className="text-sm leading-6 text-zinc-600">
          Fig. 3. Physical measurements by batch. Each point is one image pair. Boxes span the 25th to
          75th percentiles; the line is the median. Whiskers extend to the most extreme observations
          within 1.5 interquartile ranges. Batch 3 has 17 observations; Batches 1 and 2 have seven each.
        </figcaption>
      </figure>

      <div className="space-y-3 border-t border-zinc-200 pt-5">
        <h3 className="text-lg font-semibold text-zinc-900">Batch 1 shows greater variation between images</h3>
        <p className="max-w-4xl text-sm leading-6 text-zinc-600">
          Graphite-labelled area has a sample standard deviation of 6.51 percentage points in Batch 1,
          compared with 1.82 in Batch 3. Inclusion area has a standard deviation of 6.58 versus 1.94
          percentage points. These correspond to sample variance ratios of 12.8 and 11.5, respectively.
          Batch 2 has standard deviations of 1.66 and 1.54 percentage points on the same measurements.
        </p>
        <p className="max-w-4xl text-sm leading-6 text-zinc-600">
          Two Batch 1 images, <span className="font-mono text-xs">4ih2ggld</span> and{" "}
          <span className="font-mono text-xs">5n1q8atc</span>, have inclusion fractions of 19.28% and
          20.77%; the largest observed in Batch 3 is 12.36%. The Batch 1 inclusion median remains
          near the reference (7.26% versus 6.95%), so the increased spread is concentrated in a subset
          of images. The low matrix fractions occur in those same two images; these area fractions
          are linked by the segmentation and are not independent findings.
        </p>
        <p className="max-w-4xl text-sm leading-6 text-zinc-600">
          Together with the pore-area and chord shifts, this heterogeneity makes Batch 1 the priority
          for investigation. Review the two images and their phase masks to distinguish material variation
          from preparation or segmentation effects. The variance ratios are descriptive estimates from
          seven images, not validated defect thresholds. The mean tests below do not test this variability.
        </p>
      </div>

      <PhysicalBatchStatistics />

      <details id="sample-measurements" className="scroll-mt-6 rounded-md border border-zinc-200 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-600">
          Sample measurements ({rows.length} samples)
        </summary>
        <div className="mt-4">
          <PhysicalTableExplorer rows={rows} features={features} />
        </div>
      </details>

      <details id="raw-measurements" className="scroll-mt-6 rounded-md border border-zinc-200 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-600">
          Full-precision measurements
        </summary>
        <p className="my-4 text-sm leading-6 text-zinc-600">Unrounded values from the physical run. Scroll within the table to inspect all measurements.</p>
        <div className="max-h-96 overflow-auto rounded-md border border-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600" role="region" aria-label="Full-precision physical measurements" tabIndex={0}>
          <table className="w-full min-w-max text-left text-sm">
            <caption className="sr-only">Full-precision physical measurements for {rawRows.length} samples.</caption>
            <thead className="sticky top-0 bg-paper text-zinc-700">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Batch</th>
                <th scope="col" className="px-4 py-3 font-medium">Sample ID</th>
                {physicalFeatures.map((feature) => (
                  <th key={feature.rawKey} scope="col" className="max-w-64 px-4 py-3 text-right font-medium">
                    {feature.label}<span className="block text-xs font-normal">{feature.unit}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {rawRows.map((row) => (
                <tr key={`${row.batch}/${row.sample_id}`}>
                  <td className="whitespace-nowrap px-4 py-3">{row.batch.replace("_", " ")}</td>
                  <th scope="row" className="px-4 py-3 font-mono text-xs font-normal">{row.sample_id}</th>
                  {physicalFeatures.map((feature) => (
                    <td key={feature.rawKey} className="px-4 py-3 text-right font-mono text-xs tabular-nums">{row[feature.rawKey]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <p className="text-sm leading-6 text-zinc-600">
        Each downloadable measurement record contains 13 physical descriptors and a porosity uncertainty estimate, rounded for presentation.
        Batch means use the full-precision physical results.
      </p>

    </section>
  );
}

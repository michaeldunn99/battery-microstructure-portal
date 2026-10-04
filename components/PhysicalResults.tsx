import report from "@/public/qc_summary_report.json";
import { physicalFeatures } from "@/lib/physical-vector";
import Image from "next/image";
import PhysicalTableExplorer, { type PhysicalTableProps } from "./PhysicalTableExplorer";

const metrics = [
  { key: "porosity_pct", label: "Porosity", unit: "%", decimals: 2 },
  { key: "matrix_graphite_pct", label: "Graphite area fraction", unit: "%", decimals: 2 },
  { key: "inclusion_pct", label: "Inclusion area fraction", unit: "%", decimals: 2 },
  { key: "chord_y_um", label: "Vertical pore chord length", unit: "µm", decimals: 3 },
  { key: "particle_aspect_ratio", label: "Inclusion aspect ratio", unit: "Dimensionless", decimals: 2 },
] as const;

const batches = ["Batch_3", "Batch_1", "Batch_2"] as const;

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
          Batch 1 has lower mean porosity and vertical pore chord length, and higher mean inclusion aspect
          ratio than Batch 3. Batch 2 means are nearer the reference for these
          three measurements.
        </p>
        <p className="max-w-4xl text-sm leading-6 text-zinc-600">
          The physical run contains {report.total_samples_processed} sample records:
          17 in Batch 3, seven in Batch 1 and seven in Batch 2. Results below use
          the full-precision measurements.
        </p>
      </div>

      <div className="overflow-x-auto" role="region" aria-label="Physical batch means" tabIndex={0}>
        <table className="w-full min-w-[620px] border-collapse text-left text-sm">
          <caption className="pb-3 text-left text-sm text-zinc-600">
            Table 1. Mean physical measurements by batch.
          </caption>
          <thead className="border-y border-zinc-200 bg-zinc-50 text-zinc-700">
            <tr>
              {["Metric", "Batch 3 (reference)", "Batch 1", "Batch 2", "Units"].map((heading) => (
                <th key={heading} scope="col" className="px-3 py-3 font-medium">
                  {heading}
                </th>
              ))}
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
                    {report.batch_means[metric.key][batch].toFixed(metric.decimals)}
                  </td>
                ))}
                <td className="px-3 py-4 text-zinc-600">{metric.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <figure className="space-y-3">
        <div className="overflow-x-auto">
          <Image
            src="/batch_comparison_qc.png"
            alt="Image-level distributions of porosity, graphite loading, inclusion fraction and vertical pore chord length for Batch 3, Batch 1 and Batch 2."
            width={3600}
            height={900}
            unoptimized
            className="h-auto w-full min-w-[960px]"
          />
        </div>
        <figcaption className="text-sm leading-6 text-zinc-600">
          Fig. 3. Physical measurements by batch. Each point is one sample; boxes
          show the distribution.
        </figcaption>
      </figure>

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

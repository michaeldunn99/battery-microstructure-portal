import report from "@/public/qc_summary_report.json";
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

export default function PhysicalResults({ rows, features }: PhysicalTableProps) {
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
          3. Results
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

      <PhysicalTableExplorer rows={rows} features={features} />

      <p className="text-sm leading-6 text-zinc-600">
        The downloadable physical vector contains 14 fields rounded for presentation.
        Batch means use the full-precision physical results.
      </p>

      <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-zinc-200 pt-4 text-sm">
        <a
          href="/physical_feature_vectors.csv"
          className="text-blue-800 underline underline-offset-4 hover:no-underline"
        >
          Physical feature vectors (CSV)
        </a>
        <a
          href="/qc_summary_report.json"
          className="text-blue-800 underline underline-offset-4 hover:no-underline"
        >
          Physical summary (JSON)
        </a>
        <a
          href="/qc_dataset_features.csv"
          className="text-blue-800 underline underline-offset-4 hover:no-underline"
        >
          Full-precision measurements (CSV)
        </a>
      </div>
    </section>
  );
}

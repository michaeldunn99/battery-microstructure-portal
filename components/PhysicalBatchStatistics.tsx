import statistics from "@/public/physical_batch_statistics.json";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { physicalFeatures } from "@/lib/physical-vector";

const definitions = new Map(statistics.features.map((feature) => [feature.key, feature]));
const allTests = statistics.comparisons.flatMap((comparison) => comparison.features);
const estimable = allTests.filter((feature) => feature.status === "ok");
const significant = estimable.filter((feature) => feature.p_adjusted !== null && feature.p_adjusted < statistics.method.alpha);

function number(value: number | null, decimals: number) {
  return value === null ? "Not estimable" : value.toFixed(decimals);
}

function pValue(value: number | null) {
  if (value === null) return "Not estimable";
  return value < 0.0001 ? "<0.0001" : value.toFixed(4);
}

export default async function PhysicalBatchStatistics() {
  const raw = await readFile(path.join(process.cwd(), "public", "qc_dataset_features.csv"));
  const hash = createHash("sha256").update(raw).digest("hex");
  const descriptors = physicalFeatures.filter((feature) => feature.key !== "porosity_ci95_pct");
  if (statistics.inputs.reference.sha256 !== hash || statistics.inputs.incoming.sha256 !== hash
    || statistics.features.length !== descriptors.length
    || descriptors.some((feature, index) => statistics.features[index].key !== feature.key || statistics.features[index].raw_key !== feature.rawKey)) {
    throw new Error("Statistical results are out of date. Regenerate them from the current physical measurements and descriptor definitions.");
  }
  return (
    <div id="batch-statistics" className="scroll-mt-6 space-y-4 border-t border-zinc-200 pt-6">
      <h3 className="text-lg font-semibold text-zinc-900">Uncertainty in mean differences</h3>
      <p className="max-w-4xl text-sm leading-6 text-zinc-600">
        <strong className="font-semibold text-zinc-900">Exploratory mean comparisons.</strong>{" "}
        These tests assume independent observations. The organisers describe crops drawn from approximately
        15 source electrode images and assembled into artificial batches; the crop-to-source mapping has not
        been established here. The p-values and intervals are provisional and do not assign a test image to a batch.
      </p>
      <p className="max-w-4xl text-sm leading-6 text-zinc-600">
        Batch 1 has a mean pore-area decrease of 1.81 percentage points (pointwise 95% CI: −3.34 to −0.27).
        This is about 16% below the reference mean. Batch 2 has a smaller decrease of
        0.73 percentage points (95% CI: −2.25 to 0.79). With seven observations per incoming batch,
        these estimates leave substantial uncertainty about the true batch differences. Batch 2 is closer
        on this measurement, but neither batch has demonstrated equivalence.
      </p>
      <h4 className="text-base font-semibold text-zinc-900">Tests for differences</h4>
      <p className="max-w-4xl text-sm leading-6 text-zinc-600">
        {significant.length === 0
          ? "No feature-mean difference meets the Holm-adjusted 0.05 criterion in this analysis. This does not establish batch equivalence or justify acceptance."
          : `${significant.length} feature-mean differences meet the Holm-adjusted 0.05 criterion. Statistical differences require physical interpretation and do not establish a manufacturing defect.`}
        {" "}{estimable.length} of {statistics.method.family_size} planned comparisons are estimable. Both silicon particle D10 comparisons have zero observed variance and cannot support a Welch test.
      </p>
      <p className="max-w-4xl text-sm leading-6 text-zinc-600">
        Differences are incoming minus reference. Intervals are pointwise 95% confidence intervals for those differences.
        Holm adjustment accounts for testing 13 descriptors in each of two batches ({statistics.method.family_size} comparisons),
        reducing the risk of chance findings across the analysis. It adjusts p-values, not measured differences,
        and does not test similarity. <a href="#statistical-method" className="text-zinc-900 underline underline-offset-4">Statistical method and assumptions</a>.
      </p>
      {statistics.comparisons.map((comparison, index) => (
        <details key={comparison.batch} id={`statistics-${comparison.batch.toLowerCase()}`} className="scroll-mt-6 rounded-md border border-zinc-200">
          <summary className="cursor-pointer p-4 text-sm font-semibold text-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
            {comparison.batch.replace("_", " ")} versus {statistics.reference_batch.replace("_", " ")}: {comparison.incoming_n} versus {comparison.reference_n} samples
          </summary>
          <div className="space-y-3 border-t border-zinc-200 p-4">
            <div className="overflow-x-auto" role="region" aria-label={`${comparison.batch.replace("_", " ")} statistical comparisons`} tabIndex={0}>
              <table className="w-full min-w-[1080px] border-collapse text-left text-sm tabular-nums">
                <caption className="pb-3 text-left leading-6 text-zinc-600">Table {index + 2}. {comparison.batch.replace("_", " ")} compared with the reference. Batch summaries show mean ± sample standard deviation. Statistics are calculated before rounding.</caption>
                <thead className="border-y border-zinc-200 bg-zinc-50 text-zinc-700">
                  <tr>{["Descriptor", "Reference mean ± SD", "Incoming mean ± SD", "Difference", "95% CI for difference", "Raw p", "Holm p"].map((label) => <th key={label} scope="col" className="px-3 py-3 align-top font-medium">{label}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 border-b border-zinc-200">
                  {comparison.features.map((feature) => {
                    const definition = definitions.get(feature.key);
                    if (!definition) throw new Error(`Missing statistical feature definition: ${feature.key}`);
                    const decimals = definition.unit === "%" || definition.unit === "percentage points" ? 2 : 3;
                    return (
                      <tr key={feature.key}>
                        <th scope="row" className="px-3 py-3 align-top font-medium text-zinc-900">{definition.label}<span className="mt-1 block text-xs font-normal text-zinc-500">{definition.unit}</span></th>
                        <td className="whitespace-nowrap px-3 py-3 align-top">{number(feature.reference_mean, decimals)} ± {number(feature.reference_sd, decimals)}</td>
                        <td className="whitespace-nowrap px-3 py-3 align-top">{number(feature.incoming_mean, decimals)} ± {number(feature.incoming_sd, decimals)}</td>
                        <td className="whitespace-nowrap px-3 py-3 align-top">{feature.difference > 0 ? "+" : ""}{number(feature.difference, decimals)}</td>
                        <td className="whitespace-nowrap px-3 py-3 align-top">{feature.ci95_low === null || feature.ci95_high === null ? "Not estimable" : `[${number(feature.ci95_low, decimals)}, ${number(feature.ci95_high, decimals)}]`}</td>
                        <td className="whitespace-nowrap px-3 py-3 align-top">{pValue(feature.p_value)}</td>
                        <td className="whitespace-nowrap px-3 py-3 align-top">{pValue(feature.p_adjusted)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs leading-6 text-zinc-600">For area fractions, differences and their intervals are in percentage points. Length differences retain µm; ratios are dimensionless. The porosity uncertainty field is not tested. The complete numerical record is available in Downloads and repository.</p>
          </div>
        </details>
      ))}
    </div>
  );
}

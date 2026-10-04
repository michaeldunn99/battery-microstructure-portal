import results from "@/public/multichannel/test_assignments.json";
import comparison from "@/public/multichannel/summary.json";

type Assignment = typeof results.assignments[number];

const batchOrder = ["Batch_3", "Batch_1", "Batch_2"] as const;
const head = "px-3 py-3 text-left font-medium";
const cell = "px-3 py-3 align-top tabular-nums";
const summaryStyle = "cursor-pointer p-4 text-sm font-semibold text-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600";
const labelledBatches = new Map(comparison.assignments.map(row => [row.sample_id, row.confirmed_batch]));

function batchName(batch: string) {
  return batch.replace("_", " ");
}

function rate(value: number) {
  return `${Number(value.toFixed(1))}%`;
}

function measurement(value: number, unit: string) {
  const formatted = value.toFixed(unit === "µm" ? 3 : 2);
  return unit === "%" ? `${formatted}%` : unit === "ratio" ? formatted : `${formatted} ${unit}`;
}

function PhysicalExplanation({ row }: { row: Assignment }) {
  const examples = row.top_supporting_features.filter(feature => !["cbd_pct", "porosity_ci95_pct"].includes(feature.key)).slice(0, 2);
  return <div className="space-y-1 text-zinc-600">
    {examples.map(feature => {
      const assigned = feature.known_batches[row.assigned_batch as keyof typeof feature.known_batches];
      return <p key={feature.key} className="leading-6">{feature.label}: {measurement(feature.value, feature.unit)}; {batchName(row.assigned_batch)} mean {measurement(assigned.mean, feature.unit)}.</p>;
    })}
    {!row.within_assigned_class_support && <p className="text-xs leading-5">Weak match: outside the known {batchName(row.assigned_batch)} distance limit; {row.leave_one_crop_out_votes[row.assigned_batch as keyof typeof row.leave_one_crop_out_votes]} of 31 refits retain the assignment.</p>}
  </div>;
}

export default function FullTestAssignments() {
  if (results.assignments.some(row => !labelledBatches.has(row.sample_id))) {
    throw new Error("Assignment results and multichannel measurements contain different image IDs");
  }

  return (
    <section id="full-test-assignments" aria-labelledby="full-test-heading" className="scroll-mt-6 space-y-4 border-t border-zinc-200 pt-5">
      <div className="space-y-2">
        <h3 id="full-test-heading" className="text-lg font-semibold text-zinc-900">Test-image assignments and confidence</h3>
        <p className="max-w-4xl text-sm leading-6 text-zinc-600">
          The combined physical measurements assign {results.test_sample_count} images to the nearest known
          batch. Confidence uses the observed validation rate for that predicted batch: High above 70%,
          Medium from 50% to 70%, and Low below 50%. Images assigned to the same batch share the same rate.
        </p>
      </div>

      <div className="overflow-x-auto" role="region" aria-label="All test images: batch assignments and confidence" tabIndex={0}>
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <caption className="pb-3 text-left text-sm leading-6 text-zinc-600">Percentages are class-level leave-one-crop-out validation rates, not individual probabilities.</caption>
            <thead className="border-y border-zinc-200 bg-zinc-50 text-zinc-700">
              <tr>{["Sample ID", "Assigned batch", "Confidence"].map(label => <th key={label} scope="col" className={head}>{label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 border-b border-zinc-200">
              {results.assignments.map(row => <tr key={row.sample_id}>
                <th scope="row" className={`${cell} font-normal`}><span className="font-mono text-xs">{row.sample_id}</span></th>
                <td className={`${cell} whitespace-nowrap`}>{batchName(row.assigned_batch)}</td>
                <td className={`${cell} whitespace-nowrap font-medium`}>{row.confidence} ({rate(row.confidence_pct)})</td>
              </tr>)}
            </tbody>
          </table>
      </div>

      <details className="rounded-md border border-zinc-200">
        <summary className={summaryStyle}>How the confidence ratings were calculated</summary>
        <div className="space-y-4 border-t border-zinc-200 p-4 text-sm leading-6 text-zinc-600">
          <p>
            Omit one of the 31 known image crops, refit scaling and batch means on the other 30, and predict
            the omitted crop. Repeat for every known crop. For each predicted batch, divide correct
            assignments by all assignments to that batch. The table shows the resulting rates and
            the requested reporting bands.
          </p>
          <div className="overflow-x-auto" role="region" aria-label="Validation rates used for confidence ratings" tabIndex={0}>
            <table className="w-full min-w-[620px] border-collapse text-left text-sm">
              <thead className="border-y border-zinc-200 bg-zinc-50"><tr>{["Predicted batch", "Correct / assigned", "Validation rate", "Band", "Band threshold"].map(label => <th key={label} scope="col" className={head}>{label}</th>)}</tr></thead>
              <tbody className="divide-y divide-zinc-200 border-b border-zinc-200">{batchOrder.map(batch => {
                const check = results.known_evaluation.per_class[batch];
                const example = results.assignments.find(row => row.assigned_batch === batch)!;
                return <tr key={batch}><th scope="row" className={head}>{batchName(batch)}</th><td className={cell}>{check.oof_correct_predictions} / {check.oof_prediction_count}</td><td className={cell}>{rate(100 * check.oof_precision)}</td><td className={cell}>{example.confidence}</td><td className={cell}>{example.confidence === "High" ? "> 70%" : example.confidence === "Medium" ? "50% to 70%, inclusive" : "< 50%"}</td></tr>;
              })}</tbody>
            </table>
          </div>
          <p>
            This is an empirical rate for a predicted class, not a calibrated probability for an
            individual image. A strong geometric match and an uncertain validation rate can occur
            together. Refitting stability and distance checks remain diagnostics and do not alter
            these bands. Rates depend on the class composition of the known data.
          </p>
          <p>
            The organisers confirmed <span className="font-mono text-xs">3e122cbj</span> as Batch 2,
            {" "}<span className="font-mono text-xs">fn0mhxef</span> as Batch 1, and
            {" "}<span className="font-mono text-xs">xrv9xvzb</span> as Batch 3. The assignments disagree
            with the first two and agree with the third. These labels were not used to fit the classifier
            or calculate the confidence rates.
          </p>
          <p>
            The rates use small samples and may be optimistic if crops share parent images. The 13
            inputs include correlated pore fraction, carbon-binder allocation and uncertainty fields;
            they are not independent evidence. The six unlabelled images cannot yet be scored for
            accuracy, and the three labelled follow-ups are not a new unseen validation set. Batch
            assignment does not establish manufacturing acceptance.
          </p>
        </div>
      </details>

      <details className="rounded-md border border-zinc-200">
        <summary className={summaryStyle}>Measurements behind each assignment</summary>
        <div className="space-y-4 border-t border-zinc-200 p-4">
          <p className="text-sm leading-6 text-zinc-600">All 13 assignment inputs are shown in their original units against the assigned batch mean and Batch 3 reference mean. The assignment uses their combined standardised distance, rather than any single measurement.</p>
          {results.assignments.map(row => <details key={row.sample_id} className="border-t border-zinc-200 pt-3">
            <summary className="cursor-pointer text-sm text-zinc-800"><span className="font-mono text-xs">{row.sample_id}</span>: {batchName(row.assigned_batch)}</summary>
            <div className="mt-3 text-sm"><PhysicalExplanation row={row} /></div>
            <div className="mt-3 overflow-x-auto" role="region" aria-label={`Physical measurements for ${row.sample_id}`} tabIndex={0}>
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="border-y border-zinc-200 bg-zinc-50"><tr>{["Measurement", "Image value", `${batchName(row.assigned_batch)} mean`, "Batch 3 mean"].map((label, index) => <th key={`${label}-${index}`} scope="col" className={head}>{label}</th>)}</tr></thead>
                <tbody className="divide-y divide-zinc-200 border-b border-zinc-200">{row.features.map(feature => <tr key={feature.key}><th scope="row" className={head}>{feature.label}</th><td className={`${cell} whitespace-nowrap`}>{measurement(feature.value, feature.unit)}</td><td className={`${cell} whitespace-nowrap`}>{measurement(feature.known_batches[row.assigned_batch as keyof typeof feature.known_batches].mean, feature.unit)}</td><td className={`${cell} whitespace-nowrap`}>{measurement(feature.known_batches.Batch_3.mean, feature.unit)}</td></tr>)}</tbody>
              </table>
            </div>
          </details>)}
          <a href="/multichannel/test_assignments.csv" download className="mr-5 inline-block text-sm underline underline-offset-4">Assignment table (CSV)</a>
          <a href="/multichannel/test_assignments.json" download className="inline-block text-sm underline underline-offset-4">Assignment data (JSON)</a>
        </div>
      </details>
    </section>
  );
}

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

function similarityShares(row: Assignment) {
  const exactMatches = batchOrder.filter(batch => row.distances[batch] === 0);
  const nearestDistance = Math.min(...batchOrder.map(batch => row.distances[batch]));
  // Dividing by the nearest distance first gives equivalent, bounded inverse-distance weights.
  const weights = batchOrder.map(batch => exactMatches.length
    ? (exactMatches.includes(batch) ? 1 : 0)
    : nearestDistance / row.distances[batch]);
  const total = weights.reduce((sum, value) => sum + value, 0);
  return Object.fromEntries(batchOrder.map((batch, index) => [batch, weights[index] / total])) as Record<typeof batchOrder[number], number>;
}

// One fixed numeric scale for every cell; rank labels and validation precision are separate.
const similarityStops = [
  { at: 0, rgb: [153, 27, 27] },
  { at: 1 / 6, rgb: [253, 174, 97] },
  { at: 1 / 3, rgb: [240, 253, 244] },
  { at: 1, rgb: [20, 83, 45] },
];
const similarityGradient = `linear-gradient(to right, ${similarityStops.map(stop => `rgb(${stop.rgb.join(", ")}) ${100 * stop.at}%`).join(", ")})`;

function similarityStyle(share: number) {
  const value = Math.min(1, Math.max(0, share));
  const upperIndex = Math.max(1, similarityStops.findIndex(stop => value <= stop.at));
  const low = similarityStops[upperIndex - 1];
  const high = similarityStops[upperIndex];
  const fraction = (value - low.at) / (high.at - low.at);
  const rgb = low.rgb.map((channel, index) => Math.round(channel + (high.rgb[index] - channel) * fraction));
  const linear = rgb.map(value => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  return { backgroundColor: `rgb(${rgb.join(", ")})`, color: luminance > 0.179 ? "#000000" : "#ffffff" };
}

function measurement(value: number, unit: string) {
  const formatted = value.toFixed(unit === "µm" ? 3 : 2);
  return unit === "%" ? `${formatted}%` : unit === "ratio" ? formatted : `${formatted} ${unit}`;
}

function PhysicalExplanation({ row }: { row: Assignment }) {
  const materialFeatures = row.features.filter(feature => !["cbd_pct", "porosity_ci95_pct"].includes(feature.key));
  const examples = [...materialFeatures].filter(feature => feature.assigned_minus_runner_squared_distance_support > 0).sort((a, b) => b.assigned_minus_runner_squared_distance_support - a.assigned_minus_runner_squared_distance_support).slice(0, 2);
  const counter = [...materialFeatures].filter(feature => feature.assigned_minus_runner_squared_distance_support < 0).sort((a, b) => a.assigned_minus_runner_squared_distance_support - b.assigned_minus_runner_squared_distance_support)[0];
  return <div className="space-y-2 text-zinc-600">
    <p className="font-medium text-zinc-800">Measurements supporting the assignment</p>
    {examples.map(feature => {
      const assigned = feature.known_batches[row.assigned_batch as keyof typeof feature.known_batches];
      return <p key={feature.key} className="leading-6">{feature.label}: {measurement(feature.value, feature.unit)}; assigned-batch mean {measurement(assigned.mean, feature.unit)}.</p>;
    })}
    {counter && <p className="leading-6"><span className="font-medium text-zinc-800">Conflicting measurement:</span> {counter.label.toLowerCase()} is {measurement(counter.value, counter.unit)}, compared with the assigned-batch mean of {measurement(counter.known_batches[row.assigned_batch as keyof typeof counter.known_batches].mean, counter.unit)}. This feature favours the closest alternative batch.</p>}
    <p className="pt-2 leading-6"><span className="font-medium text-zinc-800">Standardised distance:</span> {batchOrder.map(batch => `${batchName(batch)}: ${row.distances[batch].toFixed(3)}`).join("; ")}. The smallest distance determines the assignment.</p>
    <p className="leading-6"><span className="font-medium text-zinc-800">Confidence basis:</span> {row.validation_n_correct} of {row.validation_n_predictions} held-out known crops predicted as {batchName(row.assigned_batch)} were correct ({rate(row.confidence_pct)}, {row.confidence}). This rate is shared by every prediction of that batch.</p>
    <p className="leading-6"><span className="font-medium text-zinc-800">Assignment stability:</span> {row.leave_one_crop_out_votes[row.assigned_batch as keyof typeof row.leave_one_crop_out_votes]} of 31 refits retain this image’s assignment. These refits overlap in training data; stability is not a probability of correctness.</p>
    {!row.within_assigned_class_support && <p className="leading-6">Weak match: the distance to {batchName(row.assigned_batch)} exceeds the 95th percentile of distances for held-out known crops belonging to that batch. This is a diagnostic, not a validated rejection threshold.</p>}
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
            the omitted crop. Repeat for every known crop. For example, the rule predicted Batch 3
            for 15 crops; 13 of those were actually Batch 3, giving 86.7%. Each test image assigned
            to Batch 3 receives this same High rating. This is validation precision, not a score
            calculated from that test image’s similarity.
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

      <details id="batch-distances" className="scroll-mt-6 rounded-md border border-zinc-200">
        <summary className={summaryStyle}>How close is each image to the three batches?</summary>
        <div className="space-y-3 border-t border-zinc-200 p-4 text-sm leading-6 text-zinc-600">
          <p>Each value is the root-mean-square distance from the image’s 13 assignment inputs to a batch mean, after dividing each difference by its standard deviation across the 31 known crops. Smaller means closer; zero means an exact match to that mean. These distances are not probabilities.</p>
          <div className="overflow-x-auto" role="region" aria-label="Standardised distances from each test image to all three batch means" tabIndex={0}>
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <caption className="pb-3 text-left text-zinc-600">Cell colour shows relative similarity on one fixed scale: red and orange below 33.3%, pale green at 33.3%, and very dark green at 100%. Shares sum to 100% per image and are not prediction confidence. An outlined cell marks the organiser-confirmed batch where known.</caption>
              <thead className="border-y border-zinc-200 bg-zinc-50"><tr><th scope="col" className={head}>Sample ID</th>{batchOrder.map(batch => <th key={batch} scope="col" className={head}>{batchName(batch)}{batch === "Batch_3" ? " (reference)" : ""}</th>)}</tr></thead>
              <tbody className="divide-y divide-zinc-200 border-b border-zinc-200">{results.assignments.map(row => {
                const shares = similarityShares(row);
                const ordered = [...batchOrder].sort((a, b) => row.distances[a] - row.distances[b]);
                return <tr key={row.sample_id}><th scope="row" className={`${cell} font-mono text-xs font-normal`}>{row.sample_id}</th>{batchOrder.map(batch => {
                  const rank = ordered.findIndex(candidate => row.distances[candidate] === row.distances[batch]);
                  const confirmed = labelledBatches.get(row.sample_id) === batch;
                  const rankStyle = rank === 0 ? "border-green-700 bg-green-50 text-green-950" : rank === 1 ? "border-orange-700 bg-orange-50 text-orange-950" : "border-red-700 bg-red-50 text-red-950";
                  return <td key={batch} style={{ ...similarityStyle(shares[batch]), ...(confirmed ? { boxShadow: "inset 0 0 0 2px #18181b" } : {}) }} className={`${cell} ${batch === row.assigned_batch ? "font-semibold" : ""}`}>
                    <span className="text-base">{rate(100 * shares[batch])}</span><span className={`ml-2 inline-block rounded-sm border px-1.5 py-0.5 text-xs font-medium ${rankStyle}`}>{batch === row.assigned_batch ? "assigned" : rank === 0 ? "equal closest" : rank === 1 ? "2nd closest" : "furthest"}</span>
                    <span className="mt-1 block text-xs font-normal">Distance {row.distances[batch].toFixed(3)}</span>
                    {confirmed && <span className="mt-1 block text-xs font-semibold">Confirmed batch{batch === row.assigned_batch ? " · correct" : " · missed"}</span>}
                  </td>;
                })}</tr>;
              })}</tbody>
            </table>
          </div>
          <div className="max-w-xl space-y-1" aria-label="Relative similarity colour scale: zero percent red, 33.3 percent pale green, 100 percent dark green">
            <div aria-hidden="true" className="h-3 rounded-sm border border-zinc-200" style={{ background: similarityGradient }} />
            <div className="relative h-5 text-xs"><span className="absolute left-0">0%</span><span className="absolute -translate-x-1/2" style={{ left: "33.3333%" }}>33.3% · equal</span><span className="absolute right-0">100%</span></div>
          </div>
          <p className="text-xs leading-5">Relative similarity = (1 / batch distance) divided by the sum of inverse distances to all three batches. Equal distances give 33.3% each. An exact match receives 100%, shared equally if multiple means match exactly. Rank labels identify first, second and third without changing the numeric colour scale. These colours describe relative similarity, not material quality or probability; an image can be relatively closest to one mean and still lie far from all three.</p>
          <details className="border-t border-zinc-200 pt-3">
            <summary className="cursor-pointer font-semibold text-zinc-800">Comparison with confirmed labels (3 samples)</summary>
            <ul className="mt-3 space-y-2">{results.assignments.filter(row => labelledBatches.get(row.sample_id)).map(row => {
              const confirmed = labelledBatches.get(row.sample_id)! as typeof batchOrder[number];
              const correct = confirmed === row.assigned_batch;
              return <li key={row.sample_id}><span className="font-mono text-xs">{row.sample_id}</span>: {correct ? `correctly assigned to ${batchName(confirmed)} (distance ${row.distances[confirmed].toFixed(3)}).` : `assigned to ${batchName(row.assigned_batch)} (distance ${row.distances[row.assigned_batch as typeof batchOrder[number]].toFixed(3)}); confirmed ${batchName(confirmed)} is second closest (${row.distances[confirmed].toFixed(3)}).`}</li>;
            })}</ul>
            <p className="mt-3">Labels for the other six samples are unknown. The confirmed labels annotate this check; they do not change the predictions or similarity scores.</p>
          </details>
          <p>A small difference between distances means the assignment is sensitive to small changes in the vector or batch means. It does not provide a probability of correctness. See the <a href="#batch-assignment-method" className="underline underline-offset-4">distance formula and validation method</a>.</p>
        </div>
      </details>

      <details className="rounded-md border border-zinc-200">
        <summary className={summaryStyle}>Measurements behind each assignment</summary>
        <div className="space-y-4 border-t border-zinc-200 p-4">
          <p className="text-sm leading-6 text-zinc-600">Each image is compared with all three batches using the 13 assignment inputs. Batch entries show mean ± sample standard deviation between known crops. That spread is separate from the image’s porosity uncertainty and the classifier’s confidence rating.</p>
          <p className="text-sm leading-6 text-zinc-600">The explanation selects the two physical measurements contributing most to the distance advantage over the closest alternative, plus the strongest conflicting measurement where present. CBD allocation and uncertainty remain in the calculation but are excluded from these physical examples. All inputs contribute to the assignment; a supporting measurement does not establish electrode performance.</p>
          {results.assignments.map(row => <details key={row.sample_id} className="border-t border-zinc-200 pt-3">
            <summary className="cursor-pointer text-sm text-zinc-800"><span className="font-mono text-xs">{row.sample_id}</span>: {batchName(row.assigned_batch)}, {row.confidence} ({rate(row.confidence_pct)})</summary>
            <div className="mt-3 text-sm"><PhysicalExplanation row={row} /></div>
            <div className="mt-3 overflow-x-auto" role="region" aria-label={`Physical measurements for ${row.sample_id}`} tabIndex={0}>
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <caption className="pb-3 text-left text-xs leading-5 text-zinc-600">Green marks the batch selected by the full vector; individual measurements may favour another batch. Header colour uses the same relative-similarity scale above. Mean ± SD describes known-crop variation, not an acceptance interval.</caption>
                <thead className="border-y border-zinc-200 bg-zinc-50"><tr><th scope="col" className={head}>Measurement</th><th scope="col" className={head}>Image value</th>{batchOrder.map(batch => <th key={batch} scope="col" style={batch === row.assigned_batch ? similarityStyle(similarityShares(row)[batch]) : undefined} className={head}>{batchName(batch)}{batch === "Batch_3" ? " (reference)" : ""}{batch === row.assigned_batch ? " · assigned" : ""}</th>)}</tr></thead>
                <tbody className="divide-y divide-zinc-200 border-b border-zinc-200">{row.features.map(feature => <tr key={feature.key}><th scope="row" className={head}>{feature.label}</th><td className={`${cell} whitespace-nowrap`}>{measurement(feature.value, feature.unit)}</td>{batchOrder.map(batch => <td key={batch} className={`${cell} whitespace-nowrap ${batch === row.assigned_batch ? "bg-green-50 text-green-950" : ""}`}>{feature.known_batches[batch].mean.toFixed(feature.unit === "µm" ? 3 : 2)} ± {measurement(feature.known_batches[batch].sample_sd, feature.unit)}</td>)}</tr>)}</tbody>
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

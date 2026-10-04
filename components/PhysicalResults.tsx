import CombinedPhysicalResults from "./CombinedPhysicalResults";
import FullTestAssignments from "./FullTestAssignments";

export default function PhysicalResults() {
  return (
    <section aria-labelledby="physical-results-heading" className="space-y-6 rounded-md border border-zinc-200 bg-paper p-6 lg:p-8">
      <div className="space-y-2 border-b border-zinc-200 pb-5">
        <h2 id="physical-results-heading" className="text-2xl font-semibold tracking-tight text-zinc-950 lg:text-3xl">4. Results</h2>
        <p className="text-sm leading-6 text-zinc-600">Combined three-detector results for all nine test samples. Assignments and confidence are shown first, followed by the physical measurements.</p>
      </div>
      <FullTestAssignments />
      <CombinedPhysicalResults />
    </section>
  );
}

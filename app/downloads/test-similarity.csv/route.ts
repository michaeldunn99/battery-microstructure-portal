import results from "@/public/multichannel/test_assignments.json";
import comparison from "@/public/multichannel/summary.json";
import { relativeSimilarityShares } from "@/lib/batch-similarity";

export const dynamic = "force-static";

export function GET() {
  const confirmed = new Map(comparison.assignments.map(row => [row.sample_id, row.confirmed_batch]));
  const batches = ["Batch_1", "Batch_2", "Batch_3"] as const;
  const header = ["sample_id", "assigned_batch", "confirmed_batch", ...batches.map(batch => `${batch}_distance`), ...batches.map(batch => `${batch}_relative_similarity_pct`), "confidence", "validation_precision_pct", "similarity_method"];
  const rows = results.assignments.map(row => {
    const shares = relativeSimilarityShares(row.distances);
    return [row.sample_id, row.assigned_batch, confirmed.get(row.sample_id) ?? "", ...batches.map(batch => row.distances[batch]), ...batches.map(batch => 100 * shares[batch]), row.confidence, row.confidence_pct, "normalised_inverse_distance_not_probability"];
  });
  const csv = [header, ...rows].map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\r\n") + "\r\n";
  return new Response(csv, { headers: {
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": 'attachment; filename="test-similarity.csv"',
    "X-Content-Type-Options": "nosniff",
  } });
}

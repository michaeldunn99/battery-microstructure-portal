export const batchOrder = ["Batch_3", "Batch_1", "Batch_2"] as const;
export type Batch = typeof batchOrder[number];

export function relativeSimilarityShares(distances: Record<Batch, number>): Record<Batch, number> {
  if (batchOrder.some(batch => !Number.isFinite(distances[batch]) || distances[batch] < 0)) {
    throw new Error("Batch distances must be finite and nonnegative");
  }
  const exactMatches = batchOrder.filter(batch => distances[batch] === 0);
  const nearestDistance = Math.min(...batchOrder.map(batch => distances[batch]));
  // Bounded weights equivalent to normalising inverse distances.
  const weights = batchOrder.map(batch => exactMatches.length
    ? (exactMatches.includes(batch) ? 1 : 0)
    : nearestDistance / distances[batch]);
  const total = weights.reduce((sum, value) => sum + value, 0);
  return Object.fromEntries(batchOrder.map((batch, index) => [batch, weights[index] / total])) as Record<Batch, number>;
}

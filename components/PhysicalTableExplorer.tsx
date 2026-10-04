"use client";

import { useState } from "react";

export interface PhysicalTableProps {
  rows: Record<string, string>[];
  features: { key: string; label: string; unit: string }[];
}

export default function PhysicalTableExplorer({ rows, features }: PhysicalTableProps) {
  const [batch, setBatch] = useState("all");
  const [search, setSearch] = useState("");
  const [featureKey, setFeatureKey] = useState(features[0].key);
  const [sort, setSort] = useState("sample");
  const feature = features.find((item) => item.key === featureKey)!;
  const filtered = rows.filter((row) => (batch === "all" || row.batch === batch) && row.sample_id.toLowerCase().includes(search.trim().toLowerCase()));
  filtered.sort((a, b) => sort === "sample" ? a.sample_id.localeCompare(b.sample_id) : (Number(a[featureKey]) - Number(b[featureKey])) * (sort === "ascending" ? 1 : -1));
  const control = "mt-1 block w-full rounded-md border border-zinc-300 bg-paper px-3 py-2 text-sm text-zinc-900";

  return (
    <div className="space-y-4 border-t border-zinc-200 pt-6">
      <h3 className="text-lg font-semibold">Sample measurements</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs font-medium text-zinc-700">Batch
          <select value={batch} onChange={(event) => setBatch(event.target.value)} className={control}>
            <option value="all">All batches</option><option value="Batch_3">Batch 3 (reference)</option><option value="Batch_1">Batch 1</option><option value="Batch_2">Batch 2</option>
          </select>
        </label>
        <label className="text-xs font-medium text-zinc-700">Measurement
          <select value={featureKey} onChange={(event) => setFeatureKey(event.target.value)} className={control}>
            {features.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium text-zinc-700">Sample ID
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search samples" className={control} />
        </label>
        <label className="text-xs font-medium text-zinc-700">Order
          <select value={sort} onChange={(event) => setSort(event.target.value)} className={control}>
            <option value="sample">Sample ID</option><option value="ascending">Lowest value first</option><option value="descending">Highest value first</option>
          </select>
        </label>
      </div>
      <p role="status" className="text-xs text-zinc-500">{filtered.length} of {rows.length} samples. Values are rounded for display.</p>
      <div className="max-h-96 overflow-auto rounded-md border border-zinc-200" role="region" aria-label="Filtered physical measurements" tabIndex={0}>
        <table className="w-full min-w-[440px] text-left text-sm">
          <caption className="sr-only">{feature.label} ({feature.unit}), filtered by batch and sample</caption>
          <thead className="sticky top-0 bg-paper"><tr><th scope="col" className="px-4 py-3 font-medium">Batch</th><th scope="col" className="px-4 py-3 font-medium">Sample ID</th><th scope="col" className="px-4 py-3 text-right font-medium">{feature.label} ({feature.unit})</th></tr></thead>
          <tbody className="divide-y divide-zinc-200">
            {filtered.map((row) => <tr key={`${row.batch}/${row.sample_id}`}><td className="px-4 py-3">{row.batch.replace("_", " ")}</td><th scope="row" className="px-4 py-3 font-mono text-xs font-normal">{row.sample_id}</th><td className="px-4 py-3 text-right font-mono tabular-nums">{row[featureKey]}</td></tr>)}
            {filtered.length === 0 && <tr><td colSpan={3} className="px-4 py-6 text-center text-zinc-500">No samples match these filters.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

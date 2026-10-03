"use client";

import React, { useState } from "react";

export default function FeatureReductionGuide() {
  const [activeTab, setActiveTab] = useState<"core" | "all">("core");

  const coreFeatures = [
    {
      name: "1. Active Material Fraction",
      symbol: "Vol_AM (%)",
      role: "Capacity & Energy Density",
      b3: "84.3%",
      b2: "86.2% (+1.8%)",
      b1: "88.0%",
      why: "Determines how much lithium can physically be stored in the electrode. Higher is better, provided pores aren't crushed.",
    },
    {
      name: "2. Total Porosity",
      symbol: "ε (%)",
      role: "Electrolyte Reservoir",
      b3: "11.16%",
      b2: "10.42%",
      b1: "9.35% (-16%)",
      why: "The liquid volume available for liquid ion transfer. Dropping below 9.5% risks severe ion starvation.",
    },
    {
      name: "3. Through-Plane Pore Throat",
      symbol: "L_y (µm)",
      role: "Ionic Bottleneck Detector",
      b3: "0.96 µm",
      b2: "0.93 µm (p=0.47)",
      b1: "0.86 µm (p=0.049)",
      why: "The width of the vertical gaps between graphite flakes. When this pinches shut, tortuosity explodes.",
    },
    {
      name: "4. Particle Aspect Ratio",
      symbol: "A (major/minor)",
      role: "Calendering Strain & Squashing",
      b3: "1.25",
      b2: "1.22 (Normal)",
      b1: "1.38 (Crushed)",
      why: "Measures whether the roller press deformed the flakes flat. Higher values indicate mechanical damage.",
    },
    {
      name: "5. Inclusion Spatial Variance",
      symbol: "σ²_inc",
      role: "Slurry Mixing & Clumping QC",
      b3: "0.0034",
      b2: "0.0038 (Clean)",
      b1: "0.0115 (3x Clumped)",
      why: "Tests whether high-Z silicon/conductive additives were mixed uniformly or clumped into hot-spots.",
    },
  ];

  const derivedFeatures = [
    { name: "Bruggeman Tortuosity Proxy", derivedFrom: "Porosity (ε^-0.5)", reason: "Redundant: exact mathematical function of porosity." },
    { name: "Effective Transport Factor", derivedFrom: "Porosity (ε^1.5)", reason: "Redundant: collinear with total porosity." },
    { name: "10th Percentile Throat (p10)", derivedFrom: "Throat Distribution", reason: "Strongly collinear with mean throat width (r = 0.94)." },
    { name: "90th Percentile Throat (p90)", derivedFrom: "Throat Distribution", reason: "Strongly collinear with mean throat width (r = 0.91)." },
    { name: "Particle Alignment Angle", derivedFrom: "Aspect Ratio", reason: "Correlated with aspect ratio flattening under calendering." },
    { name: "Particle Perimeter Roughness", derivedFrom: "Particle Contours", reason: "Secondary indicator of edge fracture; low variance." },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
            Machine Learning Best Practice
          </span>
          <h3 className="text-xl lg:text-2xl font-bold text-white tracking-tight mt-1">
            Feature Reduction: Avoiding the "Curse of Dimensionality"
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            With N = 31 SEM samples, using 17 features guarantees overfitting. We compress to the 5 Orthogonal Physical Drivers.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("core")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "core"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            The 5 Core Features
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "all"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Eliminated Redundancies
          </button>
        </div>
      </div>

      {activeTab === "core" ? (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="py-2.5 px-3">Feature & Symbol</th>
                <th className="py-2.5 px-3">Physical Role</th>
                <th className="py-2.5 px-3">Batch 3 (Ref)</th>
                <th className="py-2.5 px-3">Batch 2 (Candidate)</th>
                <th className="py-2.5 px-3">Batch 1 (Defective)</th>
                <th className="py-2.5 px-3">Physical Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {coreFeatures.map((f, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-sans font-bold text-white whitespace-nowrap">
                    {f.name} <span className="text-slate-400 font-mono text-[11px] block">{f.symbol}</span>
                  </td>
                  <td className="py-3 px-3 font-sans text-cyan-300">{f.role}</td>
                  <td className="py-3 px-3 text-slate-300">{f.b3}</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">{f.b2}</td>
                  <td className="py-3 px-3 text-rose-400 font-bold">{f.b1}</td>
                  <td className="py-3 px-3 font-sans text-slate-400 max-w-xs">{f.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          <p className="text-xs text-slate-400">
            These features are mechanically useful for exploratory plotting, but mathematically collinear.
            Removing them prevents model weights from destabilizing during automated candidate classification:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {derivedFeatures.map((df, i) => (
              <div key={i} className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{df.name}</span>
                  <span className="text-[10px] text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/50">
                    Collinear with: {df.derivedFrom}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{df.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

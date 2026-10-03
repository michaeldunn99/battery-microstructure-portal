"use client";

import React, { useState } from "react";

interface FingerprintCard {
  id: string;
  name: string;
  symbol: string;
  formula: string;
  method: string;
  physicalMeaning: string;
  howWeExtractedIt: string;
  batch3Baseline: string;
  batch2Candidate: string;
  batch1Defective: string;
  riskThreshold: string;
  badgeColor: string;
  icon: string;
}

const fingerprintCards: FingerprintCard[] = [
  {
    id: "porosity",
    name: "Pore Area Fraction with ImageRep CI",
    symbol: "φ_pore ± CI₉₅%",
    formula: "φ = (1/N) ∑ I_pore(x)  ±  1.96 · σ_ImageRep",
    method: "Multi-Otsu Segmentation + Moving-Block Bootstrap",
    physicalMeaning:
      "The liquid electrolyte reservoir volume. Ions cannot move through solid graphite without liquid electrolyte in the pores to solvate them.",
    howWeExtractedIt:
      "Segmented native-grid SEM cross-sections into pores vs solid matrix, then applied Dahari et al. (2025) ImageRep moving block bootstrap to attach empirical 95% confidence intervals, proving whether batch differences are real or statistical sampling noise.",
    batch3Baseline: "11.16% ± 1.48%",
    batch2Candidate: "10.42% ± 1.36%",
    batch1Defective: "9.35% ± 1.25%",
    riskThreshold: "Under 9.5% triggers salt precipitation and lithium plating under fast charging.",
    badgeColor: "bg-cyan-950 text-cyan-400 border-cyan-800",
    icon: "💧",
  },
  {
    id: "directional-cls",
    name: "Two-Point Correlation S₂(r) & Directional CLS",
    symbol: "S₂(r) & a_x, a_y",
    formula: "S₂(r) = ℱ⁻¹{|ℱ{M(x)}|²}  ⟹  a_y, a_x",
    method: "2D Fast Fourier Transform (FFT) Autocovariance & Ray-Casting",
    physicalMeaning:
      "Quantifies spatial pore arrangement and directional alignment. Not just how much void space exists, but whether vertical ion highways are open or choked off.",
    howWeExtractedIt:
      "Computed the 2D FFT autocovariance of the pore indicator mask to extract the spatial correlation decay length. Supplemented with orthogonal ray-casting to isolate through-plane pore throat (a_y) versus in-plane chord (a_x).",
    batch3Baseline: "a_y = 0.42 µm, a_x = 0.47 µm (Ratio 1.12)",
    batch2Candidate: "a_y = 0.41 µm, a_x = 0.45 µm (Ratio 1.10)",
    batch1Defective: "a_y = 0.36 µm, a_x = 0.41 µm (Ratio 1.14, constricted)",
    riskThreshold: "Through-plane throat constriction under 0.38 µm causes an 8× ionic tortuosity spike.",
    badgeColor: "bg-emerald-950 text-emerald-400 border-emerald-800",
    icon: "↔️",
  },
  {
    id: "particle-size",
    name: "Particle Size Quantiles",
    symbol: "D₁₀ / D₅₀ / D₉₀",
    formula: "d = √(4A / π)  ⟹  Quantiles 10%, 50%, 90%",
    method: "Distance-Transform Watershed Splitting + Equivalent Diameter",
    physicalMeaning:
      "The polydispersity and grain size distribution of the active graphite flakes. Determines the solid-state lithium diffusion path length.",
    howWeExtractedIt:
      "Applied Euclidean distance-transform watershed segmentation to separate touching graphite particles, followed by equivalent circle diameter measurement across thousands of individual flakes per field of view.",
    batch3Baseline: "D₁₀: 0.09 µm | D₅₀: 0.14 µm | D₉₀: 0.42 µm",
    batch2Candidate: "D₁₀: 0.09 µm | D₅₀: 0.13 µm | D₉₀: 0.41 µm",
    batch1Defective: "D₁₀: 0.09 µm | D₅₀: 0.14 µm | D₉₀: 0.47 µm",
    riskThreshold: "Oversized particles (D₉₀ > 0.8 µm) cause mechanical cracking during lithiation expansion.",
    badgeColor: "bg-purple-950 text-purple-400 border-purple-800",
    icon: "🔬",
  },
  {
    id: "particle-aspect",
    name: "Particle Aspect Ratio & Flake Deformation",
    symbol: "Aspect Ratio (A)",
    formula: "A = Major Axis / Minor Axis  (via regionprops)",
    method: "Inertial Second-Moment Ellipse Fitting",
    physicalMeaning:
      "Measures mechanical flattening and alignment of anisotropic graphite flakes induced by calender roller-press tonnage.",
    howWeExtractedIt:
      "Fitted equivalent bounding ellipses to each segmented active material grain and calculated the ratio of principal moments of inertia.",
    batch3Baseline: "2.58 ± 0.17",
    batch2Candidate: "2.56 ± 0.13",
    batch1Defective: "2.78 ± 0.25 (Severely squashed)",
    riskThreshold: "Aspect ratio > 2.70 indicates severe over-calendering and microstructural shear damage.",
    badgeColor: "bg-amber-950 text-amber-400 border-amber-800",
    icon: "📐",
  },
  {
    id: "interfacial-length",
    name: "Specific Interfacial Length",
    symbol: "L_A (µm⁻¹)",
    formula: "L_A = Boundary Length / Total Valid Image Area",
    method: "Sub-Pixel Pixel-Edge Adjacency Counting",
    physicalMeaning:
      "The electrochemically active surface perimeter where liquid electrolyte contacts solid graphite, enabling charge-transfer reactions.",
    howWeExtractedIt:
      "Counted adjacent pixel pairs of differing phase appearances (pore vs. solid) across row and column boundaries, scaled by the verified 0.020 µm/pixel magnification, divided by the total valid cross-sectional area.",
    batch3Baseline: "0.485 µm⁻¹",
    batch2Candidate: "0.492 µm⁻¹",
    batch1Defective: "0.412 µm⁻¹ (Loss of reactive boundary)",
    riskThreshold: "Low interfacial length (<0.43 µm⁻¹) starves the cell of charge-transfer area, causing polarization.",
    badgeColor: "bg-rose-950 text-rose-400 border-rose-800",
    icon: "⚡",
  },
];

export default function CorePhysicalFingerprintHero() {
  const [selectedId, setSelectedId] = useState<string>("porosity");
  const activeCard = fingerprintCards.find((c) => c.id === selectedId) || fingerprintCards[0];

  return (
    <div className="bg-slate-900/95 border-2 border-cyan-500/30 rounded-3xl p-6 lg:p-10 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 border-b border-slate-800 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-700 uppercase tracking-wider">
              Executive Summary • Core Microstructural Fingerprint
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              5 Physical Drivers Extracted
            </span>
          </div>

          <a
            href="/graphite_electrode_fingerprint_features.csv"
            download
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Clean Vectors (CSV)
          </a>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-4">
          The 5 Physical Factors We Extracted — And How We Extracted Them
        </h2>
        <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-4xl leading-relaxed">
          When inspecting our battery electrodes, we avoid opaque black-box embeddings. Instead, we extract
          five peer-reviewed, orthogonal physical factors with direct electrochemical meaning—grounded in 
          2D cross-sectional SEM physics and verified representativity statistics.
        </p>
      </div>

      {/* Tab Navigation of the 5 Factors */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mt-6">
        {fingerprintCards.map((card) => {
          const isSelected = card.id === selectedId;
          return (
            <button
              key={card.id}
              onClick={() => setSelectedId(card.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? "bg-cyan-950/80 border-cyan-400 shadow-md shadow-cyan-950/50 ring-1 ring-cyan-400"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{card.icon}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider block truncate ${isSelected ? "text-cyan-300" : "text-slate-400"}`}>
                  Factor {fingerprintCards.indexOf(card) + 1}
                </span>
              </div>
              <h4 className={`text-xs font-bold mt-1 line-clamp-1 ${isSelected ? "text-white" : "text-slate-300"}`}>
                {card.name.split(" ")[0]} {card.name.split(" ")[1]}
              </h4>
              <span className="text-[11px] font-mono text-cyan-400 block mt-0.5">
                {card.symbol.split("&")[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Factor Detail Showcase */}
      <div className="relative z-10 mt-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-6 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{activeCard.icon}</span>
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold block">
                  Physical Factor 0{fingerprintCards.indexOf(activeCard) + 1}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
                  {activeCard.name}
                </h3>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-cyan-300">
                Formula: {activeCard.formula}
              </span>
              <span className="text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                Method: {activeCard.method}
              </span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 text-right min-w-[200px]">
            <span className="text-[11px] text-slate-400 block font-medium">Batch 3 (Baseline)</span>
            <span className="text-lg font-bold font-mono text-emerald-400 block mt-0.5">
              {activeCard.batch3Baseline}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Gold Standard Calibration</span>
          </div>
        </div>

        {/* Deep Dive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                1. What This Factor Means Physically in a Battery
              </h4>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/80">
                {activeCard.physicalMeaning}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                2. How We Extracted It from Raw SEM Cross-Sections
              </h4>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/80">
                {activeCard.howWeExtractedIt}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                3. Batch-to-Batch Comparison Across 31 Real Samples
              </h4>
              <div className="grid grid-cols-3 gap-2 mt-1.5 text-center">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] text-slate-400 block">Batch 3 Baseline</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono mt-1 block">
                    {activeCard.batch3Baseline}
                  </span>
                  <span className="text-[9px] text-emerald-500 font-semibold mt-0.5 block">Approved Standard</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] text-slate-400 block">Batch 2 Candidate</span>
                  <span className="text-xs font-bold text-cyan-400 font-mono mt-1 block">
                    {activeCard.batch2Candidate}
                  </span>
                  <span className="text-[9px] text-cyan-500 font-semibold mt-0.5 block">High Loading Pass</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] text-slate-400 block">Batch 1 Defective</span>
                  <span className="text-xs font-bold text-rose-400 font-mono mt-1 block">
                    {activeCard.batch1Defective}
                  </span>
                  <span className="text-[9px] text-rose-500 font-semibold mt-0.5 block">Over-Calendered Fail</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                4. Failure Mode & Industrial Acceptance Threshold
              </h4>
              <div className="mt-1.5 p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 leading-relaxed">
                <strong className="text-amber-300">Defect Risk: </strong>
                {activeCard.riskThreshold}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

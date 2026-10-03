"use client";

import React, { useState } from "react";
import LatexFormula from "@/components/LatexFormula";

interface FingerprintCard {
  id: string;
  factorNum: string;
  name: string;
  latexSymbol: string;
  latexFormula: string;
  method: string;
  physicalMeaning: string;
  howWeExtractedIt: string;
  batch3Baseline: string;
  batch2Candidate: string;
  batch1Defective: string;
  riskThreshold: string;
  iconPath: React.ReactNode;
}

const fingerprintCards: FingerprintCard[] = [
  {
    id: "porosity",
    factorNum: "01",
    name: "Pore Area Fraction with ImageRep CI",
    latexSymbol: "\\phi_{\\text{pore}} \\pm \\text{CI}_{95\\%}",
    latexFormula: "\\phi = \\frac{1}{N} \\sum_{i=1}^N I_{\\text{pore}}(x_i) \\;\\pm\\; 1.96 \\cdot \\sigma_{\\text{ImageRep}}",
    method: "Multi-Otsu Segmentation + Moving-Block Bootstrap",
    physicalMeaning:
      "The liquid electrolyte reservoir volume. Lithium ions cannot migrate across the solid graphite matrix without liquid electrolyte in the pores to solvate them.",
    howWeExtractedIt:
      "Segmented native-grid SEM cross-sections into pores vs solid matrix, then applied Dahari et al. (2025) ImageRep moving block bootstrap to attach empirical 95% confidence intervals, proving whether batch differences are real or statistical sampling noise.",
    batch3Baseline: "11.16% ± 1.48%",
    batch2Candidate: "10.42% ± 1.36%",
    batch1Defective: "9.35% ± 1.25%",
    riskThreshold: "Porosity below 9.5% starves the cell of liquid electrolyte, triggering rapid salt precipitation and lithium dendrite plating under 1C+ charging.",
    iconPath: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    id: "directional-cls",
    factorNum: "02",
    name: "Two-Point Correlation S₂(r) & Directional CLS",
    latexSymbol: "S_2(\\mathbf{r}) \\implies a_y, a_x",
    latexFormula: "S_2(\\mathbf{r}) = \\mathcal{F}^{-1}\\left\\{ |\\mathcal{F}\\{M(\\mathbf{x})\\}|^2 \\right\\} \\implies a_y,\\, a_x",
    method: "2D Fast Fourier Transform (FFT) Autocovariance & Ray-Casting",
    physicalMeaning:
      "Quantifies spatial pore arrangement and directional alignment. Not just how much void space exists, but whether vertical ion highways through the electrode thickness are open or choked off.",
    howWeExtractedIt:
      "Computed the 2D FFT autocovariance of the pore indicator mask to extract the spatial correlation decay length. Supplemented with orthogonal ray-casting to isolate through-plane pore throat (a_y) versus in-plane chord (a_x).",
    batch3Baseline: "a_y = 0.42 µm, a_x = 0.47 µm (Ratio 1.12)",
    batch2Candidate: "a_y = 0.41 µm, a_x = 0.45 µm (Ratio 1.10)",
    batch1Defective: "a_y = 0.36 µm, a_x = 0.41 µm (Ratio 1.14, constricted)",
    riskThreshold: "Through-plane throat constriction under 0.38 µm chokes liquid ion flux, producing an 8× ionic tortuosity surge and dangerous overpotentials.",
    iconPath: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    id: "particle-size",
    factorNum: "03",
    name: "Particle Size Quantiles",
    latexSymbol: "D_{10},\\, D_{50},\\, D_{90}",
    latexFormula: "d_{\\text{eq}} = \\sqrt{\\frac{4A}{\\pi}} \\implies Q_{0.10},\\, Q_{0.50},\\, Q_{0.90}",
    method: "Distance-Transform Watershed Splitting + Equivalent Diameter",
    physicalMeaning:
      "The polydispersity and grain size distribution of the active graphite flakes. Sets the solid-state lithium diffusion path length.",
    howWeExtractedIt:
      "Applied Euclidean distance-transform watershed segmentation to separate touching graphite particles, followed by equivalent circle diameter measurement across thousands of individual flakes per field of view.",
    batch3Baseline: "D₁₀: 0.09 µm | D₅₀: 0.14 µm | D₉₀: 0.42 µm",
    batch2Candidate: "D₁₀: 0.09 µm | D₅₀: 0.13 µm | D₉₀: 0.41 µm",
    batch1Defective: "D₁₀: 0.09 µm | D₅₀: 0.14 µm | D₉₀: 0.47 µm",
    riskThreshold: "Oversized particles (D₉₀ > 0.8 µm) create severe core-shell concentration gradients that crack graphite flakes during lithiation expansion.",
    iconPath: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: "particle-aspect",
    factorNum: "04",
    name: "Particle Aspect Ratio & Flake Deformation",
    latexSymbol: "\\mathcal{A} = \\frac{a_{\\text{major}}}{b_{\\text{minor}}}",
    latexFormula: "\\mathcal{A} = \\frac{a_{\\text{major}}}{b_{\\text{minor}}} \\quad \\left(\\text{derived via } \\mu_{20}, \\mu_{02}, \\mu_{11}\\right)",
    method: "Inertial Second-Moment Ellipse Fitting",
    physicalMeaning:
      "Measures mechanical flattening and planar reorientation of anisotropic graphite flakes induced by calender roller-press tonnage.",
    howWeExtractedIt:
      "Fitted equivalent bounding ellipses to each segmented active material grain and calculated the ratio of principal moments of inertia.",
    batch3Baseline: "2.58 ± 0.17",
    batch2Candidate: "2.56 ± 0.13",
    batch1Defective: "2.78 ± 0.25 (Severely squashed)",
    riskThreshold: "Aspect ratio > 2.70 proves excessive calender compression: flakes pancake horizontally, closing off through-plane pores and promoting surface plating.",
    iconPath: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
      </svg>
    ),
  },
  {
    id: "interfacial-length",
    factorNum: "05",
    name: "Specific Interfacial Length",
    latexSymbol: "L_A \\; [\\mu\\text{m}^{-1}]",
    latexFormula: "L_A = \\frac{\\sum_{\\langle i, j \\rangle} \\ell_{ij} \\cdot \\Delta x}{A_{\\text{valid}}} \\quad [\\mu\\text{m}^{-1}]",
    method: "Sub-Pixel Pixel-Edge Adjacency Counting",
    physicalMeaning:
      "The electrochemically active surface perimeter where liquid electrolyte contacts solid graphite, enabling charge-transfer electrochemical reactions.",
    howWeExtractedIt:
      "Counted adjacent pixel pairs of differing phase appearances (pore vs. solid) across row and column boundaries, scaled by the verified 0.020 µm/pixel magnification, divided by the total valid cross-sectional area.",
    batch3Baseline: "0.485 µm⁻¹",
    batch2Candidate: "0.492 µm⁻¹",
    batch1Defective: "0.412 µm⁻¹ (Loss of reactive boundary)",
    riskThreshold: "Low interfacial length (<0.43 µm⁻¹) starves the cell of charge-transfer boundary, causing excessive polarization during high-current discharges.",
    iconPath: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
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
              5 Orthogonal Drivers
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
          Which Physical Features Did We Extract — How We Mapped to Them & Why
        </h2>
        <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-4xl leading-relaxed">
          Every feature in our dataset maps deterministically from calibrated 2D cross-sectional SEM pixels (0.020 µm/pixel) 
          to a physical transport mechanism in an operating battery. We do not use uninterpretable neural network embeddings. 
          Here are the 5 core physical descriptors, exactly how each was extracted, and why it governs battery performance.
        </p>
      </div>

      {/* Tab Navigation of the 5 Factors */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-6">
        {fingerprintCards.map((card) => {
          const isSelected = card.id === selectedId;
          return (
            <button
              key={card.id}
              onClick={() => setSelectedId(card.id)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? "bg-cyan-950/80 border-cyan-400 shadow-md shadow-cyan-950/50 ring-1 ring-cyan-400"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`p-1.5 rounded-lg border ${
                  isSelected
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                    : "bg-slate-900 border-slate-800 text-slate-400"
                }`}>
                  {card.iconPath}
                </span>
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${isSelected ? "text-cyan-300" : "text-slate-500"}`}>
                  Factor {card.factorNum}
                </span>
              </div>
              <h4 className={`text-xs font-bold mt-2.5 line-clamp-1 ${isSelected ? "text-white" : "text-slate-300"}`}>
                {card.name.split(" ")[0]} {card.name.split(" ")[1]}
              </h4>
              <div className="mt-1 text-xs text-cyan-400 overflow-hidden">
                <LatexFormula formula={card.latexSymbol} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Factor Detail Showcase */}
      <div className="relative z-10 mt-6 bg-slate-950/90 border border-slate-800 rounded-2xl p-6 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-800 pb-6">
          <div className="flex-1 min-w-[280px]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-700/60 text-cyan-400">
                {activeCard.iconPath}
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold block">
                  PHYSICAL FACTOR {activeCard.factorNum}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
                  {activeCard.name}
                </h3>
              </div>
            </div>

            {/* LaTeX Formula Highlight Card */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 shadow-inner flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400 font-semibold uppercase tracking-wider">Formula:</span>
                <div className="text-sm sm:text-base text-cyan-300 font-medium">
                  <LatexFormula formula={activeCard.latexFormula} displayMode={false} />
                </div>
              </div>

              <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <span className="text-slate-500 font-medium">Method: </span>
                {activeCard.method}
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-right min-w-[220px]">
            <span className="text-xs text-slate-400 block font-medium">Batch 3 (Baseline Calibration)</span>
            <span className="text-xl font-bold font-mono text-emerald-400 block mt-1">
              {activeCard.batch3Baseline}
            </span>
            <span className="text-[11px] text-emerald-500 font-semibold block mt-0.5">Approved Industry Standard</span>
          </div>
        </div>

        {/* Deep Dive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                1. Why We Extracted It (Electrochemical & Physical Meaning)
              </h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                {activeCard.physicalMeaning}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                2. How We Mapped to It from Raw SEM Pixels (Extraction Method)
              </h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                {activeCard.howWeExtractedIt}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                3. Batch-to-Batch Comparison Across 31 Real Samples
              </h4>
              <div className="grid grid-cols-3 gap-2.5 mt-2 text-center">
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
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                4. Failure Mode & Industrial Acceptance Threshold
              </h4>
              <div className="mt-2 p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 leading-relaxed">
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

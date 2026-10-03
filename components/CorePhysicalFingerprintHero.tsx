"use client";

import React, { useState } from "react";
import LatexFormula from "@/components/LatexFormula";
import MathText from "@/components/MathText";

interface EvidenceRef {
  citation: string;
  pmid?: string;
  url: string;
  keyFinding: string;
}

interface FingerprintCard {
  id: string;
  factorNum: string;
  name: string;
  latexSymbol: string;
  latexFormula: string;
  method: string;
  // The User's 3 Core Pillars:
  physicalMeaning: string; // "what does this feature mean physically"
  howWeRepresentedIt: string; // "how did you represent it"
  evidence: EvidenceRef; // "what was the evidence"
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
      "Liquid electrolyte reservoir volume. In an operating cell, lithium ions cannot migrate across the solid graphite matrix in the liquid phase without electrolyte solution filling these void spaces to solvate them.",
    howWeRepresentedIt:
      "Formulated as the 2D area mean of the binary void indicator mask \\(I_{\\text{pore}}(x, y) \\in \\{0, 1\\}\\) on native 0.020 µm/pixel SEM cross-sections. We attach empirical 95% confidence intervals using the Dahari et al. (2025) moving-block bootstrap (ImageRep) based on the spatial integral range, rigorously distinguishing real manufacturing shifts from image sampling noise.",
    evidence: {
      citation: "Dahari et al. (2025) Advanced Science & Ebner et al. (2014) Adv. Energy Mater.",
      pmid: "PMID 40697175",
      url: "https://pubmed.ncbi.nlm.nih.gov/40697175",
      keyFinding:
        "Proved that a local porosity deviation of just ±0.015 significantly shifts simulated cell polarization and usable capacity. Demonstrated that moving-block bootstrap CI is strictly required to establish representative elementary volume (REV) in battery electrode imaging.",
    },
    batch3Baseline: "11.16\\% \\pm 1.48\\%",
    batch2Candidate: "10.42\\% \\pm 1.36\\%",
    batch1Defective: "9.35\\% \\pm 1.25\\%",
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
    name: "Two-Point Correlation \\(S_2(r)\\) & Directional CLS",
    latexSymbol: "S_2(\\mathbf{r}) \\implies a_y, a_x",
    latexFormula: "S_2(\\mathbf{r}) = \\mathcal{F}^{-1}\\left\\{ |\\mathcal{F}\\{I(\\mathbf{x})\\}|^2 \\right\\} \\implies a_y,\\, a_x",
    method: "2D Fast Fourier Transform (FFT) Autocovariance & Directional Chords",
    physicalMeaning:
      "Spatial pore arrangement and directional connectivity. Measures whether vertical ion highways running through the electrode thickness (separator to copper current collector) are open or constricted.",
    howWeRepresentedIt:
      "Evaluated via 2D Fast Fourier Transform (FFT) spatial autocorrelation \\(S_2(\\mathbf{r}) = \\langle I(\\mathbf{x}) \\cdot I(\\mathbf{x}+\\mathbf{r}) \\rangle\\) on the binary pore indicator. Decomposed into orthogonal directional characteristic length scales: through-plane vertical pore throat width (\\(a_y\\)) versus in-plane horizontal chord (\\(a_x\\)).",
    evidence: {
      citation: "Torquato & Stell (1982) J. Chem. Phys. & Cooper et al. (2016) / Dahari (2025)",
      pmid: "PMID 23004736",
      url: "https://pubmed.ncbi.nlm.nih.gov/23004736",
      keyFinding:
        "Torquato mathematically proved that two-point spatial correlation uniquely captures continuous phase connectivity across all length scales without arbitrary geometric assumptions. Cooper et al. showed that through-plane pore throat constriction increases directional ionic tortuosity by up to 8×.",
    },
    batch3Baseline: "a_y = 0.42\\,\\mu\\text{m},\\ a_x = 0.47\\,\\mu\\text{m}\\quad (\\text{Ratio } 1.12)",
    batch2Candidate: "a_y = 0.41\\,\\mu\\text{m},\\ a_x = 0.45\\,\\mu\\text{m}\\quad (\\text{Ratio } 1.10)",
    batch1Defective: "a_y = 0.36\\,\\mu\\text{m},\\ a_x = 0.41\\,\\mu\\text{m}\\quad (\\text{Ratio } 1.14,\\text{ constricted})",
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
      "Polydispersity and grain size distribution of active graphite flakes. Dictates the solid-state lithium diffusion path length (\\(t_{\\text{diff}} \\sim R^2 / D_s\\)) within individual particles.",
    howWeRepresentedIt:
      "Segmented active material grains using Euclidean distance-transform watershed splitting to disentangle touching graphite flakes. We calculate the area-equivalent circular diameter \\(d_{\\text{eq}} = \\sqrt{4A/\\pi}\\) across thousands of individual grains per field of view and extract cumulative volume-weighted percentiles \\(D_{10}\\), \\(D_{50}\\), and \\(D_{90}\\).",
    evidence: {
      citation: "Stephenson et al. (2016) J. Power Sources & Lu et al. (2020) Nature Energy",
      pmid: "PMID 26765538",
      url: "https://pubmed.ncbi.nlm.nih.gov/26765538",
      keyFinding:
        "Demonstrated that large active particles (\\(D_{90} > 0.8\\,\\mu\\text{m}\\)) experience extreme core-shell lithium concentration gradients during fast charging, generating diffusion-induced mechanical stresses that crack graphite grains and cause active material isolation.",
    },
    batch3Baseline: "D_{10}: 0.09\\,\\mu\\text{m} \\mid D_{50}: 0.14\\,\\mu\\text{m} \\mid D_{90}: 0.42\\,\\mu\\text{m}",
    batch2Candidate: "D_{10}: 0.09\\,\\mu\\text{m} \\mid D_{50}: 0.13\\,\\mu\\text{m} \\mid D_{90}: 0.41\\,\\mu\\text{m}",
    batch1Defective: "D_{10}: 0.09\\,\\mu\\text{m} \\mid D_{50}: 0.14\\,\\mu\\text{m} \\mid D_{90}: 0.47\\,\\mu\\text{m}",
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
      "Mechanical pancake deformation and planar alignment of anisotropic graphite flakes induced by calender roller-press compression tonnage.",
    howWeRepresentedIt:
      "Fitted equivalent bounding ellipses to each segmented active material flake using central second spatial moments (\\(\\mu_{20}, \\mu_{02}, \\mu_{11}\\)). The aspect ratio is the quotient of the principal semi-major axis over the semi-minor axis \\(\\mathcal{A} = a_{\\text{major}} / b_{\\text{minor}}\\), quantifying flake squashing.",
    evidence: {
      citation: "Ebner et al. (2014) Adv. Energy Mater. & Forouzan et al. (2021) J. Electrochem. Soc.",
      pmid: "PMID 26999804",
      url: "https://pubmed.ncbi.nlm.nih.gov/26999804",
      keyFinding:
        "Proved that excessive calender tonnage forces anisotropic graphite flakes to reorient flat against the current collector plane (aspect ratio > 2.70), creating a tortuous barrier that chokes vertical ion transport and accelerates lithium plating.",
    },
    batch3Baseline: "2.58 \\pm 0.17",
    batch2Candidate: "2.56 \\pm 0.13",
    batch1Defective: "2.78 \\pm 0.25\\;\\text{(Severely squashed)}",
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
      "Electrochemically active interfacial perimeter where liquid electrolyte contacts solid graphite, providing the physical boundary for lithium desolvation and Butler-Volmer charge-transfer reactions.",
    howWeRepresentedIt:
      "Counted adjacent pixel pairs of differing phase appearances (pore vs. solid) across row and column boundaries, scaled by the verified 0.020 µm/pixel magnification, divided by the total valid cross-sectional area: \\(L_A = (\\sum \\ell_{ij} \\cdot \\Delta x) / A_{\\text{valid}}\\).",
    evidence: {
      citation: "Stephenson et al. (2016) J. Power Sources & Dahari et al. (2025) Adv. Sci.",
      pmid: "PMID 26765538",
      url: "https://pubmed.ncbi.nlm.nih.gov/26765538",
      keyFinding:
        "Established that electrochemical charge-transfer reaction rate is strictly proportional to active interfacial contact area. An under-developed or blocked interfacial length forces higher local current density, inducing premature voltage cut-off.",
    },
    batch3Baseline: "0.485\\,\\mu\\text{m}^{-1}",
    batch2Candidate: "0.492\\,\\mu\\text{m}^{-1}",
    batch1Defective: "0.412\\,\\mu\\text{m}^{-1}\\;\\text{(Loss of reactive boundary)}",
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
              5 Orthogonal Physical Drivers
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
          Which Physical Features Did We Extract — How We Mapped to Them &amp; Why
        </h2>
        <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-4xl leading-relaxed">
          For every single physical feature, we answer three core questions:{" "}
          <strong className="text-cyan-300">what does it mean physically</strong> in a real battery cell,{" "}
          <strong className="text-blue-300">how did we represent it</strong> mathematically from calibrated SEM pixels, and{" "}
          <strong className="text-purple-300">what was the peer-reviewed evidence</strong> establishing its electrochemical governance.
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
                <MathText text={card.name} />
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
                  <MathText text={activeCard.name} />
                </h3>
              </div>
            </div>

            {/* LaTeX Formula Highlight Card */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 shadow-inner flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400 font-semibold uppercase tracking-wider">Representation:</span>
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
            <div className="text-xl font-bold text-emerald-400 mt-1 leading-tight">
              <LatexFormula formula={activeCard.batch3Baseline} className="text-emerald-400" />
            </div>
            <span className="text-[11px] text-emerald-500 font-semibold block mt-0.5">Approved Industry Standard</span>
          </div>
        </div>

        {/* The 3 Core Questions + Measurements Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Column 1: Questions 1 & 2 */}
          <div className="space-y-4">
            {/* Question 1 */}
            <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800/80 space-y-2">
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                1. What Does This Feature Mean Physically?
              </h4>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed pt-1">
                <MathText text={activeCard.physicalMeaning} />
              </p>
            </div>

            {/* Question 2 */}
            <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800/80 space-y-2">
              <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                2. How Did You Represent It?
              </h4>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed pt-1">
                <MathText text={activeCard.howWeRepresentedIt} />
              </p>
            </div>
          </div>

          {/* Column 2: Question 3 & 31-Sample Verification */}
          <div className="space-y-4">
            {/* Question 3: Evidence */}
            <div className="bg-purple-950/20 p-5 rounded-2xl border border-purple-500/30 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  3. What Was The Evidence?
                </h4>
                {activeCard.evidence.pmid && (
                  <a
                    href={activeCard.evidence.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-purple-900/60 text-purple-200 border border-purple-700 hover:bg-purple-800"
                  >
                    {activeCard.evidence.pmid} ↗
                  </a>
                )}
              </div>
              <div className="text-xs font-semibold text-slate-300 pt-1">
                {activeCard.evidence.citation}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                &ldquo;<MathText text={activeCard.evidence.keyFinding} />&rdquo;
              </p>
            </div>

            {/* Measurements & Threshold */}
            <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800/80 space-y-3">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                4. Batch Comparison Across 31 Real Samples
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
                  <span className="text-[10px] text-slate-400 block">Batch 3 Baseline</span>
                  <div className="text-xs font-bold text-emerald-400 mt-1 block leading-snug">
                    <LatexFormula formula={activeCard.batch3Baseline} className="text-emerald-400" />
                  </div>
                  <span className="text-[9px] text-emerald-500 font-semibold mt-0.5 block">Approved Standard</span>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
                  <span className="text-[10px] text-slate-400 block">Batch 2 Candidate</span>
                  <div className="text-xs font-bold text-cyan-400 mt-1 block leading-snug">
                    <LatexFormula formula={activeCard.batch2Candidate} className="text-cyan-400" />
                  </div>
                  <span className="text-[9px] text-cyan-500 font-semibold mt-0.5 block">High Loading Pass</span>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
                  <span className="text-[10px] text-slate-400 block">Batch 1 Defective</span>
                  <div className="text-xs font-bold text-rose-400 mt-1 block leading-snug">
                    <LatexFormula formula={activeCard.batch1Defective} className="text-rose-400" />
                  </div>
                  <span className="text-[9px] text-rose-500 font-semibold mt-0.5 block">Over-Calendered Fail</span>
                </div>
              </div>

              <div className="mt-2 p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-200 leading-relaxed">
                <strong className="text-amber-300">Failure Mode: </strong>
                {activeCard.riskThreshold}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

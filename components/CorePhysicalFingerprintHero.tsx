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
    name: "Pore area fraction with ImageRep CI",
    latexSymbol: "\\phi_{\\text{pore}} \\pm \\text{CI}_{95\\%}",
    latexFormula: "\\phi = \\frac{1}{N} \\sum_{i=1}^N I_{\\text{pore}}(x_i) \\;\\pm\\; 1.96 \\cdot \\sigma_{\\text{ImageRep}}",
    method: "Multi-Otsu Segmentation + Moving-Block Bootstrap",
    physicalMeaning:
      "Pore space available for liquid electrolyte. Electrolyte in these voids supports lithium-ion transport through the electrode.",
    howWeRepresentedIt:
      "The 2D area mean of the binary void indicator mask \\(I_{\\text{pore}}(x, y) \\in \\{0, 1\\}\\) on native 0.020 µm/pixel SEM cross-sections. 95% confidence intervals use the Dahari et al. (2025) moving-block bootstrap (ImageRep) based on the spatial integral range to estimate image sampling uncertainty.",
    evidence: {
      citation: "Dahari et al. (2025) Advanced Science & Ebner et al. (2014) Adv. Energy Mater.",
      pmid: "PMID 40697175",
      url: "https://pubmed.ncbi.nlm.nih.gov/40697175",
      keyFinding:
        "Porosity changes of ±0.015 can affect simulated cell polarization and usable capacity. Moving-block bootstrap intervals can help assess representative elementary volume (REV) in electrode images.",
    },
    batch3Baseline: "11.16\\% \\pm 1.48\\%",
    batch2Candidate: "10.42\\% \\pm 1.36\\%",
    batch1Defective: "9.35\\% \\pm 1.25\\%",
    riskThreshold: "Porosity below 9.5% may limit electrolyte availability and increase the risk of salt precipitation or lithium plating under 1C+ charging.",
    iconPath: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    id: "directional-cls",
    factorNum: "02",
    name: "Two-point correlation \\(S_2(r)\\) & directional CLS",
    latexSymbol: "S_2(\\mathbf{r}) \\implies a_y, a_x",
    latexFormula: "S_2(\\mathbf{r}) = \\mathcal{F}^{-1}\\left\\{ |\\mathcal{F}\\{I(\\mathbf{x})\\}|^2 \\right\\} \\implies a_y,\\, a_x",
    method: "2D Fast Fourier Transform (FFT) Autocovariance & Directional Chords",
    physicalMeaning:
      "Spatial pore arrangement and directional length scales. These describe pore structure through the electrode thickness, from separator to copper current collector.",
    howWeRepresentedIt:
      "Evaluated via 2D Fast Fourier Transform (FFT) spatial autocorrelation \\(S_2(\\mathbf{r}) = \\langle I(\\mathbf{x}) \\cdot I(\\mathbf{x}+\\mathbf{r}) \\rangle\\) on the binary pore indicator. Decomposed into principal directional characteristic length scales: through-plane vertical pore throat width (\\(a_y\\)) versus in-plane horizontal chord (\\(a_x\\)).",
    evidence: {
      citation: "Torquato & Stell (1982) J. Chem. Phys. & Cooper et al. (2016) / Dahari (2025)",
      pmid: "PMID 23004736",
      url: "https://pubmed.ncbi.nlm.nih.gov/23004736",
      keyFinding:
        "Two-point spatial correlation describes phase arrangement across length scales. Through-plane pore throat constriction can increase directional ionic tortuosity, by up to 8× in the cited work.",
    },
    batch3Baseline: "a_y = 0.42\\,\\mu\\text{m},\\ a_x = 0.47\\,\\mu\\text{m}\\quad (\\text{Ratio } 1.12)",
    batch2Candidate: "a_y = 0.41\\,\\mu\\text{m},\\ a_x = 0.45\\,\\mu\\text{m}\\quad (\\text{Ratio } 1.10)",
    batch1Defective: "a_y = 0.36\\,\\mu\\text{m},\\ a_x = 0.41\\,\\mu\\text{m}\\quad (\\text{Ratio } 1.14)",
    riskThreshold: "Through-plane throat widths below 0.38 µm may restrict ion transport. The proposed mechanism links an 8× increase in ionic tortuosity to higher overpotential.",
    iconPath: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    id: "particle-size",
    factorNum: "03",
    name: "Particle size quantiles",
    latexSymbol: "D_{10},\\, D_{50},\\, D_{90}",
    latexFormula: "d_{\\text{eq}} = \\sqrt{\\frac{4A}{\\pi}} \\implies Q_{0.10},\\, Q_{0.50},\\, Q_{0.90}",
    method: "Distance-Transform Watershed Splitting + Equivalent Diameter",
    physicalMeaning:
      "Polydispersity and grain size distribution of active graphite flakes. Relates to the solid-state lithium diffusion path length (\\(t_{\\text{diff}} \\sim R^2 / D_s\\)) within individual particles.",
    howWeRepresentedIt:
      "Segmented active material grains using Euclidean distance-transform watershed splitting to separate touching graphite flakes. The area-equivalent circular diameter \\(d_{\\text{eq}} = \\sqrt{4A/\\pi}\\) is calculated for individual grains per field of view to obtain cumulative volume-weighted percentiles \\(D_{10}\\), \\(D_{50}\\), and \\(D_{90}\\).",
    evidence: {
      citation: "Stephenson et al. (2016) J. Power Sources & Lu et al. (2020) Nature Energy",
      pmid: "PMID 26765538",
      url: "https://pubmed.ncbi.nlm.nih.gov/26765538",
      keyFinding:
        "Large active particles (\\(D_{90} > 0.8\\,\\mu\\text{m}\\)) can develop core-shell lithium concentration gradients during fast charging, producing diffusion-induced stresses that may crack graphite grains and isolate active material.",
    },
    batch3Baseline: "D_{10}: 0.09\\,\\mu\\text{m} \\mid D_{50}: 0.14\\,\\mu\\text{m} \\mid D_{90}: 0.42\\,\\mu\\text{m}",
    batch2Candidate: "D_{10}: 0.09\\,\\mu\\text{m} \\mid D_{50}: 0.13\\,\\mu\\text{m} \\mid D_{90}: 0.41\\,\\mu\\text{m}",
    batch1Defective: "D_{10}: 0.09\\,\\mu\\text{m} \\mid D_{50}: 0.14\\,\\mu\\text{m} \\mid D_{90}: 0.47\\,\\mu\\text{m}",
    riskThreshold: "Particles with D₉₀ > 0.8 µm may develop core-shell concentration gradients and mechanical stress during lithiation.",
    iconPath: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: "particle-aspect",
    factorNum: "04",
    name: "Particle aspect ratio",
    latexSymbol: "\\mathcal{A} = \\frac{a_{\\text{major}}}{b_{\\text{minor}}}",
    latexFormula: "\\mathcal{A} = \\frac{a_{\\text{major}}}{b_{\\text{minor}}} \\quad \\left(\\text{derived via } \\mu_{20}, \\mu_{02}, \\mu_{11}\\right)",
    method: "Inertial Second-Moment Ellipse Fitting",
    physicalMeaning:
      "Graphite flake shape and planar alignment, which may change under calender compression.",
    howWeRepresentedIt:
      "Fitted equivalent bounding ellipses to each segmented active material flake using central second spatial moments (\\(\\mu_{20}, \\mu_{02}, \\mu_{11}\\)). The aspect ratio is the quotient of the principal semi-major axis over the semi-minor axis \\(\\mathcal{A} = a_{\\text{major}} / b_{\\text{minor}}\\), describing flake elongation in the image plane.",
    evidence: {
      citation: "Ebner et al. (2014) Adv. Energy Mater. & Forouzan et al. (2021) J. Electrochem. Soc.",
      pmid: "PMID 26999804",
      url: "https://pubmed.ncbi.nlm.nih.gov/26999804",
      keyFinding:
        "Calender compression can align graphite flakes with the current collector plane. An aspect ratio > 2.70 may indicate deformation associated with reduced through-plane ion transport and increased plating risk.",
    },
    batch3Baseline: "2.58 \\pm 0.17",
    batch2Candidate: "2.56 \\pm 0.13",
    batch1Defective: "2.78 \\pm 0.25",
    riskThreshold: "Aspect ratio > 2.70 may indicate flake deformation or alignment associated with calender compression and reduced through-plane pore space.",
    iconPath: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
      </svg>
    ),
  },
  {
    id: "interfacial-length",
    factorNum: "05",
    name: "Specific interfacial length",
    latexSymbol: "L_A \\; [\\mu\\text{m}^{-1}]",
    latexFormula: "L_A = \\frac{\\sum_{\\langle i, j \\rangle} \\ell_{ij} \\cdot \\Delta x}{A_{\\text{valid}}} \\quad [\\mu\\text{m}^{-1}]",
    method: "Sub-Pixel Pixel-Edge Adjacency Counting",
    physicalMeaning:
      "Pore–graphite boundary length in the image. Electrolyte contact at this boundary supports lithium desolvation and charge transfer.",
    howWeRepresentedIt:
      "Counted adjacent pixel pairs of differing phase appearances (pore vs. solid) across row and column boundaries, scaled by the 0.020 µm/pixel calibration, divided by the total valid cross-sectional area: \\(L_A = (\\sum \\ell_{ij} \\cdot \\Delta x) / A_{\\text{valid}}\\).",
    evidence: {
      citation: "Stephenson et al. (2016) J. Power Sources & Dahari et al. (2025) Adv. Sci.",
      pmid: "PMID 26765538",
      url: "https://pubmed.ncbi.nlm.nih.gov/26765538",
      keyFinding:
        "Charge-transfer reaction rate depends on active interfacial contact area. Reduced accessible interface can increase local current density and contribute to earlier voltage cut-off.",
    },
    batch3Baseline: "0.485\\,\\mu\\text{m}^{-1}",
    batch2Candidate: "0.492\\,\\mu\\text{m}^{-1}",
    batch1Defective: "0.412\\,\\mu\\text{m}^{-1}",
    riskThreshold: "Interfacial length <0.43 µm⁻¹ may indicate less accessible charge-transfer boundary and increased polarization during high-current discharge.",
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
    <div className="bg-paper border border-zinc-200 rounded-md p-6 lg:p-10 relative overflow-hidden">
      

      {/* Header */}
      <div className="relative z-10 border-b border-zinc-200 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-md text-xs font-semibold bg-zinc-50 text-zinc-700 border border-zinc-300 uppercase tracking-wider">
              Physical descriptors
            </span>
          </div>

          <a
            href="/graphite_electrode_fingerprint_features.csv"
            download
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold text-zinc-950 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download values (CSV)
          </a>
        </div>

        <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-950 tracking-tight mt-4">
          Physical descriptors
        </h2>
        <p className="text-sm sm:text-base text-zinc-800 mt-2 max-w-4xl leading-relaxed">
          For each descriptor:{" "}
          <strong className="text-zinc-700">physical meaning</strong> in the electrode,{" "}
          <strong className="text-zinc-700">measurement</strong> from SEM images, and{" "}
          <strong className="text-zinc-700">literature</strong> supporting its interpretation.
        </p>
      </div>

      {/* Tab Navigation of the 5 Factors */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-6">
        {fingerprintCards.map((card) => {
          const isSelected = card.id === selectedId;
          return (
            <button
              key={card.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedId(card.id)}
              className={`p-3.5 rounded-md border text-left transition-colors ${
                isSelected
                  ? "bg-zinc-50 border-zinc-400    "
                  : "bg-paper border-zinc-200 hover:border-zinc-300 text-zinc-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`p-1.5 rounded-md border ${
                  isSelected
                    ? "bg-zinc-100 border-zinc-400 text-zinc-700"
                    : "bg-paper border-zinc-200 text-zinc-600"
                }`}>
                  {card.iconPath}
                </span>
                <span className={`text-[10px] font-mono font-semibold uppercase tracking-wider ${isSelected ? "text-zinc-700" : "text-zinc-500"}`}>
                  Descriptor {card.factorNum}
                </span>
              </div>
              <h4 className={`text-xs font-semibold mt-2.5 line-clamp-2 ${isSelected ? "text-zinc-950" : "text-zinc-800"}`}>
                <MathText text={card.name} />
              </h4>
              <div className="mt-1 text-xs text-zinc-700 overflow-hidden">
                <LatexFormula formula={card.latexSymbol} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Factor Detail Showcase */}
      <div className="relative z-10 mt-6 bg-paper border border-zinc-200 rounded-md p-6 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-zinc-200 pb-6">
          <div className="flex-1 min-w-[280px]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-md bg-zinc-50 border border-zinc-300 text-zinc-700">
                {activeCard.iconPath}
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-700 font-semibold block">
                  DESCRIPTOR {activeCard.factorNum}
                </span>
                <h3 className="text-xl sm:text-2xl font-semibold text-zinc-950 tracking-tight mt-0.5">
                  <MathText text={activeCard.name} />
                </h3>
              </div>
            </div>

            {/* LaTeX Formula Highlight Card */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="px-4 py-2.5 rounded-md bg-paper border border-zinc-200 flex items-center gap-3">
                <span className="text-xs font-mono text-zinc-600 font-semibold uppercase tracking-wider">Formula:</span>
                <div className="text-sm sm:text-base text-zinc-700 font-medium">
                  <LatexFormula formula={activeCard.latexFormula} displayMode={false} />
                </div>
              </div>

              <div className="px-3 py-2 rounded-md bg-paper border border-zinc-200 text-xs text-zinc-800">
                <span className="text-zinc-500 font-medium">Method: </span>
                {activeCard.method}
              </div>
            </div>
          </div>

          <div className="bg-paper border border-zinc-200 rounded-md p-4 text-right min-w-[220px]">
            <span className="text-xs text-zinc-600 block font-medium">Batch 3 (reference)</span>
            <div className="text-xl font-semibold text-zinc-700 mt-1 leading-tight">
              <LatexFormula formula={activeCard.batch3Baseline} className="text-zinc-700" />
            </div>
            <span className="text-[11px] text-zinc-700 font-semibold block mt-0.5">Reference</span>
          </div>
        </div>

        {/* The 3 Core Questions + Measurements Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Column 1: Questions 1 & 2 */}
          <div className="space-y-4">
            {/* Question 1 */}
            <div className="bg-paper p-5 rounded-md border border-zinc-200 space-y-2">
              <h4 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-md bg-zinc-100" />
                Meaning
              </h4>
              <p className="text-xs sm:text-sm text-zinc-800 leading-relaxed pt-1">
                <MathText text={activeCard.physicalMeaning} />
              </p>
            </div>

            {/* Question 2 */}
            <div className="bg-paper p-5 rounded-md border border-zinc-200 space-y-2">
              <h4 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-md bg-zinc-100" />
                Measurement
              </h4>
              <p className="text-xs sm:text-sm text-zinc-800 leading-relaxed pt-1">
                <MathText text={activeCard.howWeRepresentedIt} />
              </p>
            </div>
          </div>

          {/* Column 2: Question 3 & 31-Sample Verification */}
          <div className="space-y-4">
            {/* Question 3: Evidence */}
            <div className="bg-zinc-50 p-5 rounded-md border border-zinc-200 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-md bg-zinc-100" />
                  Literature
                </h4>
                {activeCard.evidence.pmid && (
                  <a
                    href={activeCard.evidence.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-zinc-50 text-zinc-700 border border-zinc-300 hover:bg-zinc-100"
                  >
                    {activeCard.evidence.pmid} ↗
                  </a>
                )}
              </div>
              <div className="text-xs font-semibold text-zinc-800 pt-1">
                {activeCard.evidence.citation}
              </div>
              <p className="text-xs text-zinc-800 leading-relaxed italic">
                <MathText text={activeCard.evidence.keyFinding} />
              </p>
            </div>

            {/* Measurements & Threshold */}
            <div className="bg-paper p-5 rounded-md border border-zinc-200 space-y-3">
              <h4 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-md bg-zinc-100" />
                Batch comparison
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-paper border border-zinc-200 rounded-md p-2.5">
                  <span className="text-[10px] text-zinc-600 block">Batch 3</span>
                  <div className="text-xs font-semibold text-zinc-700 mt-1 block leading-snug">
                    <LatexFormula formula={activeCard.batch3Baseline} className="text-zinc-700" />
                  </div>
                  <span className="text-[9px] text-zinc-700 font-semibold mt-0.5 block">Reference</span>
                </div>
                <div className="bg-paper border border-zinc-200 rounded-md p-2.5">
                  <span className="text-[10px] text-zinc-600 block">Batch 2</span>
                  <div className="text-xs font-semibold text-zinc-700 mt-1 block leading-snug">
                    <LatexFormula formula={activeCard.batch2Candidate} className="text-zinc-700" />
                  </div>
                  <span className="text-[9px] text-zinc-700 font-semibold mt-0.5 block">Candidate</span>
                </div>
                <div className="bg-paper border border-zinc-200 rounded-md p-2.5">
                  <span className="text-[10px] text-zinc-600 block">Batch 1</span>
                  <div className="text-xs font-semibold text-zinc-700 mt-1 block leading-snug">
                    <LatexFormula formula={activeCard.batch1Defective} className="text-zinc-700" />
                  </div>
                  <span className="text-[9px] text-zinc-700 font-semibold mt-0.5 block">Comparison</span>
                </div>
              </div>

              <div className="mt-2 p-3 rounded-md bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-700 leading-relaxed">
                <strong className="text-zinc-700">Interpretation: </strong>
                {activeCard.riskThreshold}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

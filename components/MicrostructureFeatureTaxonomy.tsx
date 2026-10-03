"use client";

import MathText from "./MathText";
import React, { useState } from "react";

interface TaxonomyFeature {
  name: string;
  definition: string;
  interpretation: string;
  measurementGroup: "geometry" | "spatial";
  twoDFeasible: string;
  difficulty: "Low" | "Medium" | "High" | "Low–medium";
  robustness: string;
  caveats: string;
  pmids: { pmid: string; url: string; note: string }[];
}

const taxonomyData: TaxonomyFeature[] = [
  {
    name: "Phase/pore area fraction (per phase, with CI)",
    definition: "\\(\\phi = \\text{mean of indicator};\\;\\text{CI from ImageRep}\\)",
    interpretation: "Composition, porosity, loading or compaction",
    measurementGroup: "geometry",
    twoDFeasible: "Yes",
    difficulty: "Low",
    robustness: "High for \\(\\phi\\); depends on threshold",
    caveats:
      "CI assumes perfect segmentation. Area fraction is not volume fraction without isotropy; 2D ambiguity noted.",
    pmids: [
      { pmid: "40697175", url: "https://pubmed.ncbi.nlm.nih.gov/40697175", note: "Dahari et al. (2025) ImageRep" },
      { pmid: "26999804", url: "https://pubmed.ncbi.nlm.nih.gov/26999804", note: "Ebner et al. (3D Tomography)" },
      { pmid: "32350275", url: "https://pubmed.ncbi.nlm.nih.gov/32350275", note: "Lu et al. (Porosity Quantification)" },
    ],
  },
  {
    name: "CBD: active-material ratio",
    definition: "\\(\\frac{\\phi_{\\text{CBD}}}{\\phi_{\\text{AM}}}\\)",
    interpretation: "Formulation or mixing shift",
    measurementGroup: "spatial",
    twoDFeasible: "Only if CBD is separable in SEM",
    difficulty: "Medium",
    robustness: "Low–medium",
    caveats:
      "CBD can be difficult to segment. Uncertainty in both phase fractions affects the ratio.",
    pmids: [
      { pmid: "34707110", url: "https://pubmed.ncbi.nlm.nih.gov/34707110", note: "Forouzan et al. (CBD Segmentation)" },
      { pmid: "37256681", url: "https://pubmed.ncbi.nlm.nih.gov/37256681", note: "Trembacki et al. (CBD Mesoscale)" },
    ],
  },
  {
    name: "Full TPC \\(S_2(r)\\), one curve per phase",
    definition: "\\(S_2(r) = P(x\\text{ and }x+r\\text{ both in phase})\\)",
    interpretation: "Spatial organisation at all scales",
    measurementGroup: "spatial",
    twoDFeasible: "Yes",
    difficulty: "Low",
    robustness: "Medium–high",
    caveats:
      "Needs calibration to compare across magnifications. Degenerate (different microstructures can have similar \\(S_2\\)).",
    pmids: [
      { pmid: "40697175", url: "https://pubmed.ncbi.nlm.nih.gov/40697175", note: "Dahari et al. (2025) FFT TPC" },
      { pmid: "23004736", url: "https://pubmed.ncbi.nlm.nih.gov/23004736", note: "Torquato & Stell (Heterogeneous Media)" },
    ],
  },
  {
    name: "CLS \\(a_2\\) from TPC (per phase)",
    definition: "\\(a_2 = \\sqrt{\\frac{\\bar{X}\\cdot\\operatorname{Var}}{\\phi(1-\\phi)}}\\;\\text{via }\\Psi\\)",
    interpretation: "Correlation length; sets uncertainty on \\(\\phi\\)",
    measurementGroup: "spatial",
    twoDFeasible: "Yes",
    difficulty: "Low–medium",
    robustness: "Medium",
    caveats:
      "Derived from the integral range of TPC; sensitive to noise at large lag distance r.",
    pmids: [
      { pmid: "40697175", url: "https://pubmed.ncbi.nlm.nih.gov/40697175", note: "Dahari et al. (2025) CLS Derivation" },
    ],
  },
  {
    name: "Equivalent-diameter distribution (quantiles \\(D_{10}/D_{50}/D_{90}\\)) of solid particles",
    definition: "\\(d = \\sqrt{\\frac{4A}{\\pi}}\\;\\text{per connected component}\\)",
    interpretation: "Particle size and polydispersity",
    measurementGroup: "geometry",
    twoDFeasible: "Yes, but touching particles merge",
    difficulty: "Medium",
    robustness: "Medium",
    caveats:
      "Needs watershed splitting; 2D sectioning truncates 3D particles (Wicksell's corpuscle problem), so 2D size is negatively biased.",
    pmids: [
      { pmid: "26999804", url: "https://pubmed.ncbi.nlm.nih.gov/26999804", note: "Ebner et al. (Particle Sizing)" },
      { pmid: "32350275", url: "https://pubmed.ncbi.nlm.nih.gov/32350275", note: "Lu et al. (Particle Statistics)" },
      { pmid: "26765538", url: "https://pubmed.ncbi.nlm.nih.gov/26765538", note: "Stephenson et al. (Particle Mechanics)" },
    ],
  },
  {
    name: "Specific interfacial length (pore–solid)",
    definition: "\\(L_A = \\frac{\\text{boundary length}}{\\text{image area}}\\)",
    interpretation: "Surface available for reaction or contact",
    measurementGroup: "geometry",
    twoDFeasible: "Yes",
    difficulty: "Low",
    robustness: "Medium",
    caveats:
      "Pixel-staircase bias; resolution-dependent; its statistical representativity is currently unvalidated across magnifications.",
    pmids: [
      { pmid: "40697175", url: "https://pubmed.ncbi.nlm.nih.gov/40697175", note: "Dahari et al. (Interfacial Lengths)" },
      { pmid: "26765538", url: "https://pubmed.ncbi.nlm.nih.gov/26765538", note: "Stephenson et al. (Interface Flux)" },
    ],
  },
  {
    name: "Largest-connected-component fraction (pore, CBD)",
    definition: "\\(\\mathrm{LCC} = \\frac{\\text{largest component area}}{\\text{total phase area}}\\)",
    interpretation: "Connectivity proxy for transport",
    measurementGroup: "geometry",
    twoDFeasible: "Yes",
    difficulty: "Low",
    robustness: "Low–medium",
    caveats:
      "2D planar connectivity can underestimate 3D percolation. Resolution can shift apparent connectivity thresholds.",
    pmids: [
      { pmid: "26999804", url: "https://pubmed.ncbi.nlm.nih.gov/26999804", note: "Ebner et al. (Percolation)" },
      { pmid: "27456201", url: "https://pubmed.ncbi.nlm.nih.gov/27456201", note: "Cooper et al. (TauFactor Percolation)" },
    ],
  },
  {
    name: "Anisotropy of TPC (directional ratio of CLS)",
    definition: "\\(\\frac{a_x}{a_y}\\;\\text{from directional }S_2\\)",
    interpretation: "Alignment from coating and calendering",
    measurementGroup: "spatial",
    twoDFeasible: "Yes",
    difficulty: "Low",
    robustness: "Medium",
    caveats:
      "Image orientation relative to the coating or calendering direction must be fixed and registered before measurement.",
    pmids: [
      { pmid: "40697175", url: "https://pubmed.ncbi.nlm.nih.gov/40697175", note: "Dahari et al. (Directional TPC)" },
    ],
  },
];

export default function MicrostructureFeatureTaxonomy() {
  const [filter, setFilter] = useState<"ALL" | "geometry" | "spatial">("ALL");

  const filtered =
    filter === "ALL"
      ? taxonomyData
      : taxonomyData.filter((d) => d.measurementGroup === filter);

  return (
    <div className="bg-paper border border-zinc-200 rounded-md p-6 lg:p-8">
      <div className="border-b border-zinc-200 pb-5">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-zinc-50 text-zinc-700 border border-zinc-200">
            Descriptors
          </span>
          <span className="text-xs text-zinc-500 font-mono">
            2D measurements
          </span>
        </div>
        <h2 className="text-2xl lg:text-3xl font-semibold text-zinc-950 tracking-tight">
          Descriptor definitions
        </h2>
        <p className="text-sm text-zinc-600 mt-1 max-w-4xl leading-relaxed">
          Definitions, physical interpretations and limitations of eight 2D microstructural metrics.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mt-5 mb-4">
        <span className="text-xs text-zinc-600 mr-2">Measurement type:</span>
        <button
          type="button"
          aria-pressed={filter === "ALL"}
          onClick={() => setFilter("ALL")}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
            filter === "ALL"
              ? "bg-zinc-100 text-zinc-950"
              : "bg-paper text-zinc-600 hover:text-zinc-950"
          }`}
        >
          All (8)
        </button>
        <button
          type="button"
          aria-pressed={filter === "geometry"}
          onClick={() => setFilter("geometry")}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
            filter === "geometry"
              ? "bg-zinc-100 text-zinc-950"
              : "bg-paper text-zinc-600 hover:text-zinc-950"
          }`}
        >
          Fractions, size &amp; interfaces
        </button>
        <button
          type="button"
          aria-pressed={filter === "spatial"}
          onClick={() => setFilter("spatial")}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
            filter === "spatial"
              ? "bg-zinc-100 text-zinc-950"
              : "bg-paper text-zinc-600 hover:text-zinc-950"
          }`}
        >
          Ratios &amp; spatial correlation
        </button>
      </div>

      {/* Responsive Table / Cards */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-zinc-200 bg-paper text-zinc-600 font-mono">
              <th className="py-3 px-3">Feature</th>
              <th className="py-3 px-3">Definition</th>
              <th className="py-3 px-3">Interpretation</th>
              <th className="py-3 px-2 text-center">Type</th>
              <th className="py-3 px-2 text-center">2D Feasible</th>
              <th className="py-3 px-2 text-center">Difficulty</th>
              <th className="py-3 px-3">Robustness</th>
              <th className="py-3 px-4">Limitations</th>
              <th className="py-3 px-3">References (PMID)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 font-normal">
            {filtered.map((item, idx) => (
              <tr
                key={idx}
                className="hover:bg-zinc-100 transition-colors align-top"
              >
                {/* Feature Name */}
                <td className="py-3 px-3 font-semibold text-zinc-950">
                  <MathText text={item.name} />
                </td>

                {/* Mathematical Definition */}
                <td className="py-3 px-3 font-mono text-zinc-700">
                  <MathText text={item.definition} />
                </td>

                {/* Interpretation */}
                <td className="py-3 px-3 text-zinc-800">
                  <MathText text={item.interpretation} />
                </td>

                {/* Measurement group */}
                <td className="py-3 px-2 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                      item.measurementGroup === "geometry"
                        ? "bg-zinc-50 text-zinc-700 border border-zinc-200"
                        : "bg-zinc-50 text-zinc-700 border border-zinc-200"
                    }`}
                  >
                    {item.measurementGroup === "geometry" ? "Fraction / size / interface" : "Ratio / correlation"}
                  </span>
                </td>

                {/* 2D Feasible */}
                <td className="py-3 px-2 text-center text-zinc-800">
                  {item.twoDFeasible}
                </td>

                {/* Difficulty */}
                <td className="py-3 px-2 text-center text-zinc-600 font-mono">
                  {item.difficulty}
                </td>

                {/* Robustness */}
                <td className="py-3 px-3 text-zinc-800">
                  <MathText text={item.robustness} />
                </td>

                {/* Caveats */}
                <td className="py-3 px-4 text-zinc-700 text-[11px] leading-relaxed max-w-xs">
                  <MathText text={item.caveats} />
                </td>

                {/* Clickable PubMed Links */}
                <td className="py-3 px-3 space-y-1">
                  {item.pmids.map((p, pIdx) => (
                    <a
                      key={pIdx}
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      title={p.note}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-700 hover:text-zinc-700 underline block"
                    >
                      PMID {p.pmid} ↗
                    </a>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

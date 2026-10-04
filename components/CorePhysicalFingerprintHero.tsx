"use client";

import React, { useState } from "react";
import LatexFormula from "@/components/LatexFormula";
import MathText from "@/components/MathText";

interface EvidenceRef {
  citation: string;
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
  calculationLine: number;
  physicalMeaning: string;
  measurementDefinition: string;
  evidence: EvidenceRef;
  limitations: string;
  iconPath: React.ReactNode;
}

interface CorePhysicalFingerprintHeroProps {
  batchValues: Record<string, {
    batch3Baseline: string;
    batch2Candidate: string;
    batch1Defective: string;
  }>;
}

const fingerprintCards: FingerprintCard[] = [
  {
    id: "porosity",
    factorNum: "01",
    name: "Pore area fraction",
    latexSymbol: "\\phi_{\\text{pore}}",
    latexFormula: "\\phi_{\\text{pore}} = \\frac{A_{\\text{pore}}}{A_{\\text{analysed}}}",
    method: "Per-image BSE multi-Otsu segmentation",
    calculationLine: 47,
    physicalMeaning:
      "Fraction of analysed image area assigned to pores. The physical interpretation depends on the phase assignment and the sampled section.",
    measurementDefinition:
      "Keep the central 80% of image height and apply Gaussian smoothing with sigma 1.0 pixels. Fit three-class multi-Otsu thresholds to each BSE image. Porosity is the fraction of cropped pixels below the lower threshold. ImageRep uncertainty is reported separately.",
    evidence: {
      citation: "Dahari et al. (2025), Advanced Science",
      url: "https://pubmed.ncbi.nlm.nih.gov/40697175",
      keyFinding:
        "ImageRep estimates phase-fraction sampling uncertainty from the two-point correlation of a segmented image. It does not validate the segmentation.",
    },
    limitations: "Thresholds are fitted separately to each image. The pore assignment requires review; its area fraction alone does not establish accessibility or transport.",
    iconPath: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    id: "directional-cls",
    factorNum: "02",
    name: "Correlation scale and image-axis chords",
    latexSymbol: "S_2(r),\\ a,\\ L_y,\\ L_x",
    latexFormula: "S_2(\\mathbf{r}) = \\langle I(\\mathbf{x})I(\\mathbf{x}+\\mathbf{r})\\rangle",
    method: "Two-point correlation and mean chord lengths",
    calculationLine: 77,
    physicalMeaning:
      "Correlation scale summarises spatial dependence in a segmented phase. Directional chord lengths describe contiguous runs along the image axes.",
    measurementDefinition:
      "ImageRep make_error_prediction uses confidence=0.95 and target_error=0.05 for pore-mask CLS and uncertainty. Chords are calculated separately from runs in every 40th column and row. Lengths use 0.025 µm/pixel; anisotropy is mean x chord divided by mean y chord. CLS comes from spatial correlation, not the chord calculation.",
    evidence: {
      citation: "Dahari et al. (2025), Advanced Science",
      url: "https://pubmed.ncbi.nlm.nih.gov/40697175",
      keyFinding:
        "The paper relates two-point correlation and characteristic length scale to phase-fraction sampling uncertainty. This supports the correlation-scale interpretation.",
    },
    limitations: "Calling image y through-plane requires confirmed specimen orientation. Chord length is not a pore-throat diameter, and these 2D summaries do not determine 3D connectivity.",
    iconPath: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    id: "particle-size",
    factorNum: "03",
    name: "Inclusion size quantiles",
    latexSymbol: "D_{10},\\, D_{50},\\, D_{90}",
    latexFormula: "d_{\\text{eq}} = \\sqrt{\\frac{4A}{\\pi}} \\implies Q_{0.10},\\, Q_{0.50},\\, Q_{0.90}",
    method: "Equivalent-circle diameter and quantiles",
    calculationLine: 105,
    physicalMeaning:
      "Size distribution of connected regions in the bright BSE inclusion mask. Each region's area is expressed as the diameter of an equivalent circle.",
    measurementDefinition:
      "Label the inclusion mask and retain regions of at least 10 pixels. Convert each equivalent-circle diameter using 0.025 µm/pixel. Compute unweighted D10, D50 and D90 percentiles across those regions.",
    evidence: {
      citation: "scikit-image, regionprops documentation",
      url: "https://scikit-image.org/docs/stable/api/skimage.measure.html#skimage.measure.regionprops",
      keyFinding:
        "The equivalent-diameter property defines a circle with the same area as a labelled region.",
    },
    limitations: "These are inclusion-mask components, not graphite grains. Touching regions remain connected. Results depend on thresholding, section geometry and the assumed pixel scale.",
    iconPath: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: "particle-aspect",
    factorNum: "04",
    name: "Inclusion aspect ratio",
    latexSymbol: "\\overline{\\mathcal{A}}",
    latexFormula: "\\overline{\\mathcal{A}} = \\frac{1}{n}\\sum_{i=1}^n\\frac{a_i}{\\max(b_i,1)}",
    method: "Mean ratio of second-moment ellipse axes",
    calculationLine: 105,
    physicalMeaning:
      "Mean elongation of bright BSE inclusion components in the image plane. It describes the shape of thresholded regions rather than graphite-flake deformation.",
    measurementDefinition:
      "Retain inclusion components of at least 10 pixels with positive minor-axis length. For each, divide major-axis length by max(minor-axis length, 1 pixel). Take the unweighted mean of those ratios.",
    evidence: {
      citation: "scikit-image, regionprops documentation",
      url: "https://scikit-image.org/docs/stable/api/skimage.measure.html#skimage.measure.regionprops",
      keyFinding:
        "Major and minor axis lengths describe an ellipse with the same normalised second central moments as the labelled region.",
    },
    limitations: "The one-pixel denominator floor affects thin regions. Thresholding and section orientation affect the result; aspect ratio alone does not establish deformation or cracking.",
    iconPath: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
      </svg>
    ),
  },
  {
    id: "inclusion-dispersion",
    factorNum: "05",
    name: "Inclusion spatial variation",
    latexSymbol: "\\sigma_{\\text{tile}}\\;[\\text{pp}]",
    latexFormula: "\\sigma_{\\text{tile}} = \\sqrt{\\frac{1}{16}\\sum_{j=1}^{16}(p_j-\\bar p)^2}",
    method: "Standard deviation across a 4 × 4 grid",
    calculationLine: 120,
    physicalMeaning:
      "Variation in inclusion-mask coverage across one image. Larger values indicate less uniform area coverage at the chosen tile scale.",
    measurementDefinition:
      "Split the inclusion mask into 16 tiles using a 4 × 4 grid. Calculate inclusion area percentage in each tile, then use np.std with ddof=0. The result is a standard deviation in percentage points.",
    evidence: {
      citation: "NumPy, standard-deviation definition",
      url: "https://numpy.org/doc/stable/reference/generated/numpy.std.html",
      keyFinding:
        "With ddof=0, NumPy divides the sum of squared deviations by the number of values before taking its square root.",
    },
    limitations: "This statistic depends on the tile scale, crop and inclusion threshold. It describes spatial area variation and does not identify a mixing mechanism.",
    iconPath: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

export default function CorePhysicalFingerprintHero({ batchValues }: CorePhysicalFingerprintHeroProps) {
  const [selectedId, setSelectedId] = useState<string>("porosity");
  const activeCard = fingerprintCards.find((c) => c.id === selectedId) || fingerprintCards[0];
  const activeValues = batchValues[activeCard.id];
  const rawValuesUrl = "https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/public/qc_dataset_features.csv";
  const calculationUrl = `https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/provenance/extract_physical_run.py#L${activeCard.calculationLine}`;

  return (
    <div className="bg-paper border border-zinc-200 rounded-md p-6 lg:p-10 relative overflow-hidden">
      

      {/* Header */}
      <div className="relative z-10 border-b border-zinc-200 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-md text-xs font-semibold bg-zinc-50 text-zinc-700 border border-zinc-300 uppercase tracking-wider">
              Physical interpretation
            </span>
          </div>

          <a
            href="/physical_feature_vectors.csv"
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
          Physical interpretation
        </h2>
        <p className="text-sm sm:text-base text-zinc-800 mt-2 max-w-4xl leading-relaxed">
          Five groups explain selected entries in the physical feature vector.
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
                  Group {card.factorNum}
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
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-md bg-zinc-50 border border-zinc-300 text-zinc-700">
                {activeCard.iconPath}
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-700 font-semibold block">
                  GROUP {activeCard.factorNum}
                </span>
                <h3 className="text-xl sm:text-2xl font-semibold text-zinc-950 tracking-tight mt-0.5">
                  <MathText text={activeCard.name} />
                </h3>
              </div>
            </div>

            {/* LaTeX Formula Highlight Card */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="max-w-full overflow-x-auto px-4 py-2.5 rounded-md bg-paper border border-zinc-200 flex items-center gap-3">
                <span className="text-xs font-mono text-zinc-600 font-semibold uppercase tracking-wider">Formula:</span>
                <div className="text-sm sm:text-base text-zinc-700 font-medium">
                  <LatexFormula formula={activeCard.latexFormula} displayMode={false} />
                </div>
              </div>

              <div className="px-3 py-2 rounded-md bg-paper border border-zinc-200 text-xs text-zinc-800">
                <span className="text-zinc-500 font-medium">Measurement definition: </span>
                {activeCard.method}
              </div>
            </div>
          </div>

          <div className="max-w-full overflow-x-auto bg-paper border border-zinc-200 rounded-md p-4 text-right min-w-0">
            <span className="text-xs text-zinc-600 block font-medium">Batch 3 (reference)</span>
            <div className="text-xl font-semibold text-zinc-700 mt-1 leading-tight">
              <LatexFormula formula={activeValues.batch3Baseline} className="text-zinc-700" />
            </div>
            <span className="text-[11px] text-zinc-700 font-semibold block mt-0.5">Sample means</span>
          </div>
        </div>

        {/* Equal-size interpretation panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 auto-rows-fr gap-6 mt-6">
            {/* Question 1 */}
            <div className="min-w-0 bg-paper p-5 rounded-md border border-zinc-200 space-y-2">
              <h4 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-md bg-zinc-100" />
                Meaning
              </h4>
              <p className="text-xs sm:text-sm text-zinc-800 leading-relaxed pt-1">
                <MathText text={activeCard.physicalMeaning} />
              </p>
            </div>

            {/* Question 2 */}
            <div className="min-w-0 bg-paper p-5 rounded-md border border-zinc-200 space-y-2">
              <h4 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-md bg-zinc-100" />
                Measurement definition
              </h4>
              <p className="text-xs sm:text-sm text-zinc-800 leading-relaxed pt-1">
                <MathText text={activeCard.measurementDefinition} />
              </p>
              <div className="space-y-2 border-t border-zinc-200 pt-3 text-xs leading-relaxed">
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  <a href={calculationUrl} target="_blank" rel="noreferrer" className="text-zinc-700 underline underline-offset-2">
                    Source
                  </a>
                  <a href={rawValuesUrl} target="_blank" rel="noreferrer" className="text-zinc-700 underline underline-offset-2">
                    Data
                  </a>
                </div>
              </div>
            </div>
            {/* Question 3: Evidence */}
            <div className="min-w-0 bg-zinc-50 p-5 rounded-md border border-zinc-200 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-md bg-zinc-100" />
                  Literature
                </h4>
                {activeCard.evidence.url && (
                  <a
                    href={activeCard.evidence.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-zinc-50 text-zinc-700 border border-zinc-300 hover:bg-zinc-100"
                  >
                    Method reference ↗
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
            <div className="min-w-0 bg-paper p-5 rounded-md border border-zinc-200 space-y-3">
              <h4 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-md bg-zinc-100" />
                Sample means
              </h4>
              <div className="grid grid-cols-1 gap-2 text-center">
                <div className="min-w-0 overflow-x-auto bg-paper border border-zinc-200 rounded-md p-2.5">
                  <span className="text-[10px] text-zinc-600 block">Batch 3</span>
                  <div className="text-xs font-semibold text-zinc-700 mt-1 block leading-snug">
                    <LatexFormula formula={activeValues.batch3Baseline} className="text-zinc-700" />
                  </div>
                  <span className="text-[9px] text-zinc-700 font-semibold mt-0.5 block">Reference</span>
                </div>
                <div className="min-w-0 overflow-x-auto bg-paper border border-zinc-200 rounded-md p-2.5">
                  <span className="text-[10px] text-zinc-600 block">Batch 2</span>
                  <div className="text-xs font-semibold text-zinc-700 mt-1 block leading-snug">
                    <LatexFormula formula={activeValues.batch2Candidate} className="text-zinc-700" />
                  </div>
                  <span className="text-[9px] text-zinc-700 font-semibold mt-0.5 block">Candidate</span>
                </div>
                <div className="min-w-0 overflow-x-auto bg-paper border border-zinc-200 rounded-md p-2.5">
                  <span className="text-[10px] text-zinc-600 block">Batch 1</span>
                  <div className="text-xs font-semibold text-zinc-700 mt-1 block leading-snug">
                    <LatexFormula formula={activeValues.batch1Defective} className="text-zinc-700" />
                  </div>
                  <span className="text-[9px] text-zinc-700 font-semibold mt-0.5 block">Comparison</span>
                </div>
              </div>

              <div className="mt-2 p-3 rounded-md bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-700 leading-relaxed">
                <strong className="text-zinc-700">Limitations: </strong>
                {activeCard.limitations}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}

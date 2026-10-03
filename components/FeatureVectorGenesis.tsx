"use client";

import LatexFormula from "./LatexFormula";
import MathText from "./MathText";
import React, { useState } from "react";

interface FeatureDetail {
  id: string;
  category: string;
  name: string;
  formula: string;
  derivation: string;
  physicalMeaning: string;
  batteryImpact: string;
  b3Val: string;
  b2Val: string;
  b1Val: string;
  riskIfOutOfSpec: string;
}

const features: FeatureDetail[] = [
  {
    id: "matrix_graphite_pct",
    category: "Active Material Phase",
    name: "Matrix Graphite Loading",
    formula: "\\(\\frac{A_{\\text{graphite}}}{A_{\\text{total}}}\\times 100\\)",
    derivation: "Pixel area fraction of segmented graphite active material matrix.",
    physicalMeaning: "Cross-sectional area fraction of graphite, which can reversibly store lithium ions (\\(\\mathrm{LiC}_6\\)).",
    batteryImpact: "Graphite loading contributes to electrode capacity; accessible capacity also depends on utilisation and transport.",
    b3Val: "79.58% (Total AM 84.3%)",
    b2Val: "81.42% (+1.84% Total)",
    b1Val: "83.21% (+3.68% Total)",
    riskIfOutOfSpec: "Lower loading may reduce capacity; higher loading may reduce pore space.",
  },
  {
    id: "porosity_pct",
    category: "Pore Network",
    name: "Total Porosity (\\(\\varepsilon\\))",
    formula: "\\(\\frac{A_{\\text{pore}}}{A_{\\text{total}}}\\times 100\\)",
    derivation: "Ratio of thresholded pore pixels to total cross-section area.",
    physicalMeaning: "Cross-sectional void fraction, representing space that may be filled by electrolyte containing \\(\\mathrm{LiPF}_6\\) salt.",
    batteryImpact: "Pore space accommodates electrolyte. Ion transport also depends on pore connectivity and geometry.",
    b3Val: "11.16% (sample 13.43%)",
    b2Val: "10.42%",
    b1Val: "9.35% (-16.2%)",
    riskIfOutOfSpec: "Porosity below 9.5% may indicate reduced electrolyte space. Charging behaviour also depends on connectivity and operating conditions.",
  },
  {
    id: "open_pore_pct",
    category: "Pore Network",
    name: "Percolating Open Porosity",
    formula: "\\(\\frac{A_{\\text{connected pore}}}{A_{\\text{total}}}\\times 100\\)",
    derivation: "Morphological flood-fill connectivity analysis from top surface to bottom collector.",
    physicalMeaning: "Fraction of the segmented pore area connected across the image.",
    batteryImpact: "Connected pores provide transport paths. Connectivity measured in a 2D section may differ from the 3D network.",
    b3Val: "100.0% of voids connected",
    b2Val: "100.0% of voids connected",
    b1Val: "99.7% connected",
    riskIfOutOfSpec: "Disconnected regions may limit electrolyte access to active material.",
  },
  {
    id: "chord_y_um",
    category: "Pore Morphology",
    name: "Through-Plane Throat Width (\\(L_y\\))",
    formula: "\\(\\langle L_y\\rangle = \\frac{1}{N}\\sum y_{\\text{runlength}}\\)",
    derivation: "Vertical ray-casting chord length distribution along the thickness axis (Y-axis).",
    physicalMeaning: "Mean vertical extent of segmented pore regions in the image.",
    batteryImpact: "Describes pore dimensions along the electrode thickness, which can influence ion transport.",
    b3Val: "0.96 µm (sample 0.53 µm)",
    b2Val: "0.93 µm (p = 0.47)",
    b1Val: "0.86 µm (p = 0.049)",
    riskIfOutOfSpec: "Chord widths below 0.88 µm occur alongside an 8x increase in synthetic-volume tortuosity in this comparison.",
  },
  {
    id: "chord_x_um",
    category: "Pore Morphology",
    name: "In-Plane Chord Length (\\(L_x\\))",
    formula: "\\(\\langle L_x\\rangle = \\frac{1}{N}\\sum x_{\\text{runlength}}\\)",
    derivation: "Horizontal ray-casting chord length distribution parallel to the foil plane (X-axis).",
    physicalMeaning: "Mean pore length running parallel to the current collector.",
    batteryImpact: "Describes pore dimensions parallel to the current collector.",
    b3Val: "0.62 µm",
    b2Val: "0.64 µm",
    b1Val: "0.78 µm",
    riskIfOutOfSpec: "Higher in-plane and lower through-plane chord lengths may indicate preferential pore alignment or compaction.",
  },
  {
    id: "pore_anisotropy",
    category: "Pore Morphology",
    name: "Pore Structural Anisotropy",
    formula: "\\(\\frac{L_x}{L_y}\\)",
    derivation: "Ratio of horizontal chord length to vertical chord length.",
    physicalMeaning: "Ratio of pore chord lengths along the two image axes.",
    batteryImpact: "Describes directional differences in pore geometry that may affect transport.",
    b3Val: "1.17",
    b2Val: "1.19",
    b1Val: "1.52",
    riskIfOutOfSpec: "Values > 1.35 indicate longer horizontal than vertical chords; their transport effect requires further analysis.",
  },
  {
    id: "particle_aspect_ratio",
    category: "Particle Mechanics",
    name: "Particle Aspect Ratio (A)",
    formula: "\\(\\frac{\\text{Major axis}}{\\text{Minor axis}}\\)",
    derivation: "Equivalent ellipse fitting on connected graphite particle components.",
    physicalMeaning: "Elongation of segmented graphite particles in the cross-section.",
    batteryImpact: "Changes may reflect particle morphology, section orientation, or calendering.",
    b3Val: "1.25",
    b2Val: "1.22",
    b1Val: "1.38",
    riskIfOutOfSpec: "Higher aspect ratios may indicate elongation or deformation; this metric does not establish cracking or delamination.",
  },
  {
    id: "slurry_heterogeneity",
    category: "Slurry Rheology",
    name: "Inclusion Spatial Variance (\\(\\sigma^2_{\\text{inc}}\\))",
    formula: "\\(\\frac{\\operatorname{Var}(\\text{count}_{\\text{quadrat}})}{\\operatorname{Mean}(\\text{count}_{\\text{quadrat}})}\\)",
    derivation: "8x8 spatial quadrat sampling of carbon-black / binder / additive particle centroids.",
    physicalMeaning: "Spatial variation in the detected inclusion population.",
    batteryImpact: "Non-uniform additive distribution may affect electronic connectivity.",
    b3Val: "0.0034 (Index 4.05)",
    b2Val: "0.0038",
    b1Val: "0.0115 (3.4x baseline)",
    riskIfOutOfSpec: "Clustering may produce local variation in conductivity and active-material utilisation.",
  },
  {
    id: "tau_through_plane",
    category: "3D Transport (Modal GPU)",
    name: "3D Through-Plane Tortuosity (\\(\\tau_z\\))",
    formula: "\\(\\tau_z = \\frac{\\varepsilon D_0}{D_{\\text{eff},z}}\\)",
    derivation: "Steady-state finite-difference diffusion solved on synthetic 3D volumes using TauFactor on Modal A10G.",
    physicalMeaning: "Estimated through-plane transport resistance factor in the synthetic 3D pore network.",
    batteryImpact: "Higher tortuosity implies lower effective diffusivity under the simulation assumptions.",
    b3Val: "8.94",
    b2Val: "10.57",
    b1Val: "70.78 (8x baseline)",
    riskIfOutOfSpec: "The estimate of 70.8 indicates restricted transport in the synthetic volume; cell behaviour depends on operating conditions.",
  },
  {
    id: "macmullin_number",
    category: "3D Transport (Modal GPU)",
    name: "MacMullin Number (\\(N_M\\))",
    formula: "\\(N_M = \\frac{\\tau_z}{\\varepsilon} = \\frac{R_{\\text{porous}}}{R_{\\text{bulk}}}\\)",
    derivation: "Ratio of estimated electrolyte resistance in the synthetic pore network to bulk electrolyte resistance.",
    physicalMeaning: "Estimated increase in electrolyte resistance due to the pore network.",
    batteryImpact: "Relates to resistive heating at a given current (\\(P = I^2R\\)).",
    b3Val: "80.1",
    b2Val: "101.5",
    b1Val: "757.0 (9.5x baseline)",
    riskIfOutOfSpec: "High \\(N_M\\) indicates higher estimated electrolyte resistance, which may increase resistive losses.",
  },
];

export default function FeatureVectorGenesis() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Active Material Phase", "Pore Network", "Pore Morphology", "Particle Mechanics", "Slurry Rheology", "3D Transport (Modal GPU)"];

  const filteredFeatures =
    selectedCategory === "All"
      ? features
      : features.filter((f) => f.category === selectedCategory);

  return (
    <div className="bg-paper border border-zinc-200 rounded-md p-6 lg:p-8">
      {/* Header */}
      <div className="border-b border-zinc-200 pb-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-zinc-50 text-zinc-700 border border-zinc-200">
            Method
          </span>
          <span className="text-xs text-zinc-500 font-mono">SEM feature extraction</span>
        </div>
        <h2 className="text-2xl lg:text-3xl font-semibold text-zinc-950 tracking-tight">
          Feature vector construction
        </h2>
        <p className="text-sm text-zinc-600 mt-1 max-w-4xl leading-relaxed">
          The pipeline extracts morphological measurements from SEM images and estimates transport properties on synthetic 3D structures.
        </p>
      </div>

      {/* 5-Stage Genesis Pipeline Flowchart */}
      <div className="my-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
        <div className="bg-paper border border-zinc-200 rounded-md p-3.5 flex flex-col justify-between">
          <div>
            <span className="font-mono text-zinc-700 font-semibold block mb-1">STAGE 1</span>
            <h4 className="font-semibold text-zinc-950 text-sm">SEM Acquisition</h4>
            <p className="text-zinc-600 mt-1">Cross-section BIB-SEM at 0.02 µm/px with In-Lens (pores) + ESB/BSE (phases).</p>
          </div>
          <span className="text-[10px] text-zinc-700 mt-2 font-mono">Two detector signals</span>
        </div>

        <div className="bg-paper border border-zinc-200 rounded-md p-3.5 flex flex-col justify-between">
          <div>
            <span className="font-mono text-zinc-700 font-semibold block mb-1">STAGE 2</span>
            <h4 className="font-semibold text-zinc-950 text-sm">Calibration</h4>
            <p className="text-zinc-600 mt-1">Gaussian σ=0.7 + destriping W=31 + plane polynomial + fixed quantiles (0.1%, 99.9%).</p>
          </div>
          <span className="text-[10px] text-zinc-700 mt-2 font-mono">Image normalisation</span>
        </div>

        <div className="bg-paper border border-zinc-200 rounded-md p-3.5 flex flex-col justify-between">
          <div>
            <span className="font-mono text-zinc-700 font-semibold block mb-1">STAGE 3</span>
            <h4 className="font-semibold text-zinc-950 text-sm">3-Phase Masks</h4>
            <p className="text-zinc-600 mt-1">Multi-Otsu semantic segmentation into Pores (0), Graphite (1), and Additives (2).</p>
          </div>
          <span className="text-[10px] text-zinc-700 mt-2 font-mono">Phase fractions</span>
        </div>

        <div className="bg-paper border border-zinc-200 rounded-md p-3.5 flex flex-col justify-between">
          <div>
            <span className="font-mono text-zinc-700 font-semibold block mb-1">STAGE 4</span>
            <h4 className="font-semibold text-zinc-950 text-sm">Morphometrics</h4>
            <p className="text-zinc-600 mt-1">Horizontal and vertical chord sampling (<LatexFormula formula={"L_y, L_x"} />), ellipse aspect ratios (A), 8x8 quadrat variance.</p>
          </div>
          <span className="text-[10px] text-zinc-700 mt-2 font-mono">2D geometry</span>
        </div>

        <div className="bg-paper border border-zinc-200 rounded-md p-3.5 flex flex-col justify-between">
          <div>
            <span className="font-mono text-zinc-700 font-semibold block mb-1">STAGE 5</span>
            <h4 className="font-semibold text-zinc-950 text-sm">3D transport estimate</h4>
            <p className="text-zinc-600 mt-1">Synthetic 3D volumes and finite-difference diffusion using TauFactor on A10G GPUs.</p>
          </div>
          <span className="text-[10px] text-zinc-700 mt-2 font-mono">Estimated <LatexFormula formula={"\\tau_z"} /></span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap items-center gap-1.5 pb-4 border-b border-zinc-200">
        <span className="text-xs text-zinc-600 mr-2">Feature group:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              selectedCategory === cat
                ? "bg-zinc-100 text-zinc-950 shadow"
                : "bg-paper text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {filteredFeatures.map((f) => (
          <div
            key={f.id}
            className="bg-paper border border-zinc-200 rounded-md p-5 flex flex-col justify-between hover:border-zinc-300 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold text-zinc-700 uppercase tracking-wider">
                  {f.category}
                </span>
                <span className="text-[11px] font-mono text-zinc-500">{f.id}</span>
              </div>
              <h3 className="text-base font-semibold text-zinc-950 mt-1"><MathText text={f.name} /></h3>
              <p className="font-mono text-xs text-zinc-700 mt-0.5"><MathText text={f.formula} /></p>

              <div className="mt-3 space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-zinc-800">Method: </span>
                  <span className="text-zinc-600">{f.derivation}</span>
                </div>
                <div>
                  <span className="font-semibold text-zinc-800">Physical meaning: </span>
                  <span className="text-zinc-600"><MathText text={f.physicalMeaning} /></span>
                </div>
                <div>
                  <span className="font-semibold text-zinc-700">Battery relevance: </span>
                  <span className="text-zinc-800"><MathText text={f.batteryImpact} /></span>
                </div>
              </div>
            </div>

            {/* Batch Values & Risk Callout */}
            <div className="mt-4 pt-3 border-t border-zinc-200">
              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono mb-2">
                <div className="bg-paper rounded px-2 py-1">
                  <span className="text-zinc-500 block text-[9px]">Batch 3 (Ref)</span>
                  <span className="text-zinc-800 font-semibold">{f.b3Val}</span>
                </div>
                <div className="bg-zinc-50 border border-zinc-200 rounded px-2 py-1">
                  <span className="text-zinc-700 block text-[9px]">Batch 2 (Candidate)</span>
                  <span className="text-zinc-700 font-semibold">{f.b2Val}</span>
                </div>
                <div className="bg-zinc-50 border border-zinc-200 rounded px-2 py-1">
                  <span className="text-zinc-700 block text-[9px]">Batch 1 (Defective)</span>
                  <span className="text-zinc-700 font-semibold">{f.b1Val}</span>
                </div>
              </div>

              <div className="text-[11px] bg-paper rounded px-2.5 py-1.5 text-zinc-700 flex items-start gap-1.5">
                <span className="font-semibold">Interpretation:</span>
                <span><MathText text={f.riskIfOutOfSpec} /></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

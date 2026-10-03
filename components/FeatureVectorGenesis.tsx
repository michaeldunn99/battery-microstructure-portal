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
    physicalMeaning: "Physical volume fraction of active host material capable of reversibly storing lithium ions (\\(\\mathrm{LiC}_6\\)).",
    batteryImpact: "Directly sets gravimetric and volumetric cell capacity (mAh/cm³). Higher allows longer EV range.",
    b3Val: "79.58% (Total AM 84.3%)",
    b2Val: "81.42% (+1.84% Total)",
    b1Val: "83.21% (+3.68% Total)",
    riskIfOutOfSpec: "Too low = underpowered cell; too high = over-densified matrix with crushed pore channels.",
  },
  {
    id: "porosity_pct",
    category: "Pore Network",
    name: "Total Porosity (\\(\\varepsilon\\))",
    formula: "\\(\\frac{A_{\\text{pore}}}{A_{\\text{total}}}\\times 100\\)",
    derivation: "Ratio of thresholded pore pixels to total cross-section area.",
    physicalMeaning: "The total liquid void volume filled by liquid organic electrolyte containing dissolved \\(\\mathrm{LiPF}_6\\) salt.",
    batteryImpact: "Acts as the liquid ion reservoir. Determines how many free lithium ions are immediately available for transport.",
    b3Val: "11.16% (sample 13.43%)",
    b2Val: "10.42%",
    b1Val: "9.35% (-16.2%)",
    riskIfOutOfSpec: "Dropping below 9.5% causes total ionic starvation during fast charging, triggering immediate Li plating.",
  },
  {
    id: "open_pore_pct",
    category: "Pore Network",
    name: "Percolating Open Porosity",
    formula: "\\(\\frac{A_{\\text{connected pore}}}{A_{\\text{total}}}\\times 100\\)",
    derivation: "Morphological flood-fill connectivity analysis from top surface to bottom collector.",
    physicalMeaning: "The fraction of pores that form continuous, open tunnels vs. isolated dead-end voids.",
    batteryImpact: "Only open pores conduct ions. Closed pores trap dead electrolyte that contributes weight but zero power.",
    b3Val: "100.0% of voids connected",
    b2Val: "100.0% of voids connected",
    b1Val: "99.7% (Dead ends forming)",
    riskIfOutOfSpec: "Dead-end voids cause local inactive spots and rapid capacity fade.",
  },
  {
    id: "chord_y_um",
    category: "Pore Morphology",
    name: "Through-Plane Throat Width (\\(L_y\\))",
    formula: "\\(\\langle L_y\\rangle = \\frac{1}{N}\\sum y_{\\text{runlength}}\\)",
    derivation: "Vertical ray-casting chord length distribution along the thickness axis (Y-axis).",
    physicalMeaning: "The mean physical clearance of the vertical gaps between horizontally aligned graphite flakes.",
    batteryImpact: "The direct physical gatekeeper for ions migrating from separator to current collector foil.",
    b3Val: "0.96 µm (sample 0.53 µm)",
    b2Val: "0.93 µm (p = 0.47, Intact)",
    b1Val: "0.86 µm (p = 0.049, Choked)",
    riskIfOutOfSpec: "Constriction below 0.88 µm chokes vertical flux, causing an 8x explosion in tortuosity.",
  },
  {
    id: "chord_x_um",
    category: "Pore Morphology",
    name: "In-Plane Chord Length (\\(L_x\\))",
    formula: "\\(\\langle L_x\\rangle = \\frac{1}{N}\\sum x_{\\text{runlength}}\\)",
    derivation: "Horizontal ray-casting chord length distribution parallel to the foil plane (X-axis).",
    physicalMeaning: "Mean pore length running parallel to the current collector.",
    batteryImpact: "Ions can easily travel sideways along graphite flake faces, but this does not advance them toward the collector.",
    b3Val: "0.62 µm",
    b2Val: "0.64 µm",
    b1Val: "0.78 µm (Stretched flat)",
    riskIfOutOfSpec: "High in-plane chord combined with low through-plane chord proves particles were mechanically crushed.",
  },
  {
    id: "pore_anisotropy",
    category: "Pore Morphology",
    name: "Pore Structural Anisotropy",
    formula: "\\(\\frac{L_x}{L_y}\\)",
    derivation: "Ratio of horizontal chord length to vertical chord length.",
    physicalMeaning: "Geometric flattening ratio of the liquid pores.",
    batteryImpact: "Quantifies how much easier it is for an ion to move horizontally vs. vertically through the electrode thickness.",
    b3Val: "1.17",
    b2Val: "1.19 (Isotropic)",
    b1Val: "1.52 (High Anisotropy)",
    riskIfOutOfSpec: "Values > 1.35 signify preferential horizontal alignment that blocks vertical battery charging.",
  },
  {
    id: "particle_aspect_ratio",
    category: "Particle Mechanics",
    name: "Particle Aspect Ratio (A)",
    formula: "\\(\\frac{\\text{Major axis}}{\\text{Minor axis}}\\)",
    derivation: "Equivalent ellipse fitting on connected graphite particle components.",
    physicalMeaning: "Shape deformation of graphite flakes. Flakes start spherical/ovoid and flatten under calendering pressure.",
    batteryImpact: "Indicates mechanical strain applied during roller-press calendering.",
    b3Val: "1.25",
    b2Val: "1.22 (Intact)",
    b1Val: "1.38 (Crushed)",
    riskIfOutOfSpec: "High aspect ratio indicates cracked flake edges and delamination from the copper current collector.",
  },
  {
    id: "slurry_heterogeneity",
    category: "Slurry Rheology",
    name: "Inclusion Spatial Variance (\\(\\sigma^2_{\\text{inc}}\\))",
    formula: "\\(\\frac{\\operatorname{Var}(\\text{count}_{\\text{quadrat}})}{\\operatorname{Mean}(\\text{count}_{\\text{quadrat}})}\\)",
    derivation: "8x8 spatial quadrat sampling of carbon-black / binder / additive particle centroids.",
    physicalMeaning: "Dispersion quality of high-Z conductive additives and binder throughout the slurry.",
    batteryImpact: "Ensures uniform electronic percolation. If additives clump, isolated active particles lose electrical contact.",
    b3Val: "0.0034 (Index 4.05)",
    b2Val: "0.0038 (Uniform)",
    b1Val: "0.0115 (3.4x Clumped)",
    riskIfOutOfSpec: "Agglomeration creates non-conductive dead zones, causing localized over-heating and hot-spots.",
  },
  {
    id: "tau_through_plane",
    category: "3D Transport (Modal GPU)",
    name: "3D Through-Plane Tortuosity (\\(\\tau_z\\))",
    formula: "\\(\\tau_z = \\frac{\\varepsilon D_0}{D_{\\text{eff},z}}\\)",
    derivation: "Steady-state finite difference Laplace diffusion solver on 3D synthesized volumes via TauFactor on Modal A10G.",
    physicalMeaning: "The true effective path resistance factor for lithium ions migrating vertically through the 3D electrode.",
    batteryImpact: "The master metric of battery fast-charging capability and cell internal resistance (IR drop).",
    b3Val: "8.94",
    b2Val: "10.57 (Near Baseline)",
    b1Val: "70.78 (8x Bottleneck)",
    riskIfOutOfSpec: "Spike to 70.8 causes massive cell overpotential, severe lithium plating, and catastrophic safety failure.",
  },
  {
    id: "macmullin_number",
    category: "3D Transport (Modal GPU)",
    name: "MacMullin Number (\\(N_M\\))",
    formula: "\\(N_M = \\frac{\\tau_z}{\\varepsilon} = \\frac{R_{\\text{porous}}}{R_{\\text{bulk}}}\\)",
    derivation: "Ratio of electrical/ionic resistance of electrolyte inside the porous electrode to pure electrolyte.",
    physicalMeaning: "Total macroscopic transport resistance penalty of the porous electrode matrix.",
    batteryImpact: "Governs ohmic heat generation during fast charge/discharge (\\(P = I^2R\\)).",
    b3Val: "80.1",
    b2Val: "101.5 (Excellent)",
    b1Val: "757.0 (9.5x Ohmic Heat)",
    riskIfOutOfSpec: "High \\(N_M\\) causes rapid cell overheating and battery thermal management system shutdown.",
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
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-xl">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800">
            Genesis & Physical Meaning
          </span>
          <span className="text-xs text-slate-500 font-mono">From SEM Pixels to Electrochemistry</span>
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
          How We Built the Feature Vector & What Every Feature Means Physically
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-4xl leading-relaxed">
          Our feature vector is not an arbitrary statistical construct. It was engineered from first principles
          across a 5-stage pipeline to quantify every phase of electrode manufacturing: from slurry mixing,
          to roller calendering compaction, to electrochemical ion transport during fast charging.
        </p>
      </div>

      {/* 5-Stage Genesis Pipeline Flowchart */}
      <div className="my-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
        <div className="bg-slate-950/80 border border-cyan-900/40 rounded-xl p-3.5 flex flex-col justify-between">
          <div>
            <span className="font-mono text-cyan-400 font-bold block mb-1">STAGE 1</span>
            <h4 className="font-bold text-white text-sm">SEM Acquisition</h4>
            <p className="text-slate-400 mt-1">Cross-section BIB-SEM at 0.02 µm/px with In-Lens (pores) + ESB/BSE (phases).</p>
          </div>
          <span className="text-[10px] text-cyan-500 mt-2 font-mono">Raw Dual-Signal</span>
        </div>

        <div className="bg-slate-950/80 border border-cyan-900/40 rounded-xl p-3.5 flex flex-col justify-between">
          <div>
            <span className="font-mono text-cyan-400 font-bold block mb-1">STAGE 2</span>
            <h4 className="font-bold text-white text-sm">Calibration</h4>
            <p className="text-slate-400 mt-1">Gaussian σ=0.7 + destriping W=31 + plane polynomial + fixed quantiles (0.1%, 99.9%).</p>
          </div>
          <span className="text-[10px] text-cyan-500 mt-2 font-mono">Instrument Invariant</span>
        </div>

        <div className="bg-slate-950/80 border border-cyan-900/40 rounded-xl p-3.5 flex flex-col justify-between">
          <div>
            <span className="font-mono text-cyan-400 font-bold block mb-1">STAGE 3</span>
            <h4 className="font-bold text-white text-sm">3-Phase Masks</h4>
            <p className="text-slate-400 mt-1">Multi-Otsu semantic segmentation into Pores (0), Graphite (1), and Additives (2).</p>
          </div>
          <span className="text-[10px] text-cyan-500 mt-2 font-mono">Phase Quantitation</span>
        </div>

        <div className="bg-slate-950/80 border border-cyan-900/40 rounded-xl p-3.5 flex flex-col justify-between">
          <div>
            <span className="font-mono text-cyan-400 font-bold block mb-1">STAGE 4</span>
            <h4 className="font-bold text-white text-sm">Morphometrics</h4>
            <p className="text-slate-400 mt-1">Orthogonal ray chord sampling (<LatexFormula formula={"L_y, L_x"} />), ellipse aspect ratios (A), 8x8 quadrat variance.</p>
          </div>
          <span className="text-[10px] text-cyan-500 mt-2 font-mono">2D Geometrical Tensor</span>
        </div>

        <div className="bg-slate-950/80 border border-emerald-900/40 rounded-xl p-3.5 flex flex-col justify-between">
          <div>
            <span className="font-mono text-emerald-400 font-bold block mb-1">STAGE 5</span>
            <h4 className="font-bold text-white text-sm">Modal 3D Solve</h4>
            <p className="text-slate-400 mt-1">Continuous 3D synthesis & finite-difference Laplace diffusion via TauFactor on A10G GPUs.</p>
          </div>
          <span className="text-[10px] text-emerald-500 mt-2 font-mono">Ground Truth <LatexFormula formula={"\\tau_z"} /></span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap items-center gap-1.5 pb-4 border-b border-slate-800">
        <span className="text-xs text-slate-400 mr-2">Filter by Physical Dimension:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === cat
                ? "bg-cyan-600 text-white shadow"
                : "bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800"
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
            className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  {f.category}
                </span>
                <span className="text-[11px] font-mono text-slate-500">{f.id}</span>
              </div>
              <h3 className="text-base font-bold text-white mt-1"><MathText text={f.name} /></h3>
              <p className="font-mono text-xs text-emerald-400/90 mt-0.5"><MathText text={f.formula} /></p>

              <div className="mt-3 space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-slate-300">How It Was Made: </span>
                  <span className="text-slate-400">{f.derivation}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-300">Physical Meaning: </span>
                  <span className="text-slate-400"><MathText text={f.physicalMeaning} /></span>
                </div>
                <div>
                  <span className="font-semibold text-cyan-300">Electrochemical & Battery Impact: </span>
                  <span className="text-slate-300"><MathText text={f.batteryImpact} /></span>
                </div>
              </div>
            </div>

            {/* Batch Values & Risk Callout */}
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono mb-2">
                <div className="bg-slate-900/80 rounded px-2 py-1">
                  <span className="text-slate-500 block text-[9px]">Batch 3 (Ref)</span>
                  <span className="text-slate-200 font-bold">{f.b3Val}</span>
                </div>
                <div className="bg-emerald-950/30 border border-emerald-900/40 rounded px-2 py-1">
                  <span className="text-emerald-400/80 block text-[9px]">Batch 2 (Candidate)</span>
                  <span className="text-emerald-300 font-bold">{f.b2Val}</span>
                </div>
                <div className="bg-rose-950/30 border border-rose-900/40 rounded px-2 py-1">
                  <span className="text-rose-400/80 block text-[9px]">Batch 1 (Defective)</span>
                  <span className="text-rose-300 font-bold">{f.b1Val}</span>
                </div>
              </div>

              <div className="text-[11px] bg-slate-900/90 rounded px-2.5 py-1.5 text-amber-300/90 flex items-start gap-1.5">
                <span className="font-bold">⚠️ Failure Risk:</span>
                <span><MathText text={f.riskIfOutOfSpec} /></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

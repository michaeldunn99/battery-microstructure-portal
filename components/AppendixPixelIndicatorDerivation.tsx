"use client";

import React, { useState } from "react";
import LatexFormula from "@/components/LatexFormula";

export default function AppendixPixelIndicatorDerivation() {
  const [activeTab, setActiveTab] = useState<"math" | "physics" | "code" | "sources">("math");

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-10 shadow-2xl relative overflow-hidden">
      {/* Decorative gradient accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 border-b border-slate-800 pb-6">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-950 text-purple-300 border border-purple-700 uppercase tracking-wider">
            Technical Appendix • Phase Segmentation Mechanics
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            Deterministic Binary Indicator Function
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800">
            HR-Dv2 / sem_physics.py
          </span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
          Appendix: Mathematical Definition &amp; Provenance of the Indicator Function
        </h2>
        <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-4xl leading-relaxed">
          Every physical metric in our dataset originates from the binary phase indicator function{" "}
          <span className="font-mono text-cyan-300 font-semibold"><LatexFormula formula={"I(x,y)\\in\\{0,1\\}"} /></span>.
          Below is the exact mathematical formulation, physical contrast mechanism, code implementation, 
          and literature provenance explaining literally what determines whether a pixel is assigned 0 or 1.
        </p>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-6">
          <button
            onClick={() => setActiveTab("math")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "math"
                ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                : "bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            1. Mathematical Formulation
          </button>
          <button
            onClick={() => setActiveTab("physics")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "physics"
                ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                : "bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            2. Physical Contrast Mechanism
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "code"
                ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                : "bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            3. Algorithmic Pipeline &amp; Code
          </button>
          <button
            onClick={() => setActiveTab("sources")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "sources"
                ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                : "bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            4. Literature Grounding &amp; Citations
          </button>
        </div>
      </div>

      {/* Tab 1: Mathematical Formulation */}
      {activeTab === "math" && (
        <div className="relative z-10 mt-6 space-y-6">
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-6 lg:p-8 space-y-6">
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              The Deterministic Binary Assignment Equation
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed">
              At native spatial resolution (<span className="text-cyan-300 font-mono">0.020 µm/pixel</span>), 
              the indicator function <span className="font-mono text-cyan-300"><LatexFormula formula={"I_{\\text{pore}}(x,y)"} /></span> partitions the cross-section
              into void space versus solid active matrix:
            </p>

            {/* LaTeX Display Formula */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-cyan-500/30 shadow-inner flex flex-col items-center justify-center gap-3">
              <div className="text-base sm:text-xl text-cyan-300 font-medium overflow-x-auto py-2">
                <LatexFormula formula={"I_{\\text{pore}}(x, y) = \\begin{cases} 1 & \\text{if } (x, y) \\in \\mathcal{W}_{\\text{pore}} \\;\\land\\; \\mathcal{S}(x, y) \\ge \\tau_{\\text{supp}} \\;\\land\\; (x, y) \\notin \\partial\\mathcal{B} \\;\\land\\; \\mathcal{V}(x, y) \\\\ 0 & \\text{otherwise (solid graphite, CBD, boundary, or artifact)} \\end{cases}"} />
              </div>
            </div>

            {/* Sub-Variables breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="font-bold text-cyan-400 font-mono block">1. Seed Criterion (Core Initializer)</span>
                <p className="text-slate-300 leading-relaxed">
                  Pixels initialized as definite pore seeds must simultaneously satisfy darkness and smoothness:
                </p>
                <div className="py-2 text-cyan-200">
                  <LatexFormula formula={"\\text{Seed}(x, y) = \\Big( g(x, y) < t_1 - \\Delta \\Big) \\;\\land\\; \\Big( \\|\\nabla g(x, y)\\| \\le \\gamma_1 \\Big)"} />
                </div>
                <p className="text-slate-400">
                  Where <span className="text-slate-200 font-mono"><LatexFormula formula={"g(x,y)"} /></span> is normalized grayscale intensity,{" "}
                  <span className="text-slate-200 font-mono"><LatexFormula formula={"t_1"} /></span> is the multi-Otsu void threshold,{" "}
                  <span className="text-slate-200 font-mono"><LatexFormula formula={"\\Delta = 0.025"} /></span> is the security margin, and{" "}
                  <span className="text-slate-200 font-mono"><LatexFormula formula={"\\gamma_1"} /></span> is the 40th percentile gradient ceiling.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="font-bold text-cyan-400 font-mono block">2. Watershed Basin Growth <LatexFormula formula={"\\mathcal{W}_{\\text{pore}}"} /></span>
                <p className="text-slate-300 leading-relaxed">
                  Seed markers expand across adjacent pixels along the topographic gradient surface:
                </p>
                <div className="py-2 text-cyan-200">
                  <LatexFormula formula={"\\mathcal{W}\\big(\\|\\nabla g\\|, \\text{Seeds}\\big) \\implies \\text{Boundary stops at } \\max \\|\\nabla g\\|"} />
                </div>
                <p className="text-slate-400">
                  Watershed expansion stops where the spatial gradient reaches its local inflection ridge, marking 
                  the physical edge of a solid graphite grain.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="font-bold text-purple-400 font-mono block">3. Heuristic Support Score <LatexFormula formula={"\\mathcal{S}(x,y)\\ge 0.35"} /></span>
                <p className="text-slate-300 leading-relaxed">
                  To prevent ambiguous bleeding, every pixel must exceed minimum support:
                </p>
                <div className="py-2 text-purple-200">
                  <LatexFormula formula={"\\mathcal{S}(x, y) = \\sqrt{\\frac{t_1 + \\Delta - g(x, y)}{2\\Delta} \\cdot \\frac{\\gamma_2 - \\|\\nabla g(x, y)\\|}{\\gamma_2 - \\gamma_1}} \\cdot \\left(1 - \\frac{d_{\\text{seed}}}{d_{\\max}}\\right)"} />
                </div>
                <p className="text-slate-400">
                  If support drops below <span className="text-purple-300 font-mono">0.35</span>, or the pixel is farther than 96 pixels from a seed, 
                  it is flagged as unvalidated and set to 0.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="font-bold text-amber-400 font-mono block">4. Boundary &amp; Artifact Exclusion</span>
                <p className="text-slate-300 leading-relaxed">
                  Eliminates mixed-pixel partial volume effects along phase edges:
                </p>
                <div className="py-2 text-amber-200">
                  <LatexFormula formula={"(x, y) \\notin \\partial\\mathcal{B} \\quad \\text{and} \\quad \\mathcal{V}(x, y) = \\text{True}"} />
                </div>
                <p className="text-slate-400">
                  A 1-pixel morphological dilation along all phase transitions (<span className="text-amber-300 font-mono"><LatexFormula formula={"\\partial\\mathcal{B}"} /></span>)
                  is excluded to ensure no optical halo or beam-skirting artifact inflates porosity.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Physical Contrast Mechanism */}
      {activeTab === "physics" && (
        <div className="relative z-10 mt-6 space-y-6">
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-6 lg:p-8 space-y-6">
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Physical Origin of Electron Contrast in Cross-Sectional Battery SEM
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed">
              Why does an electron microscope produce the intensities we observe? Electrodes are argon-ion cross-sectioned 
              and back-filled with low-density epoxy resin. When the primary electron beam (3–5 kV) rasters the plane, 
              each constituent responds with distinct physics:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-400 uppercase">Phase 01</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                    I = 1 (Pore)
                  </span>
                </div>
                <h4 className="text-base font-bold text-white">Empty Void / Epoxy Resin</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-cyan-300">Signal: Dark / Near-Black &amp; Flat.</strong><br />
                  Epoxy resin consists of light elements (C, H, O) with near-zero backscatter coefficient. 
                  Open cavities trap emitted secondary electrons inside deep wells (Faraday-cage effect), yielding 
                  extremely low signal:
                </p>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300">
                  <LatexFormula formula={"g(x,y)<0.28,\\;\\|\\nabla g\\|\\le 0.04"} />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-400 uppercase">Phase 02</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    I = 0 (Active Material)
                  </span>
                </div>
                <h4 className="text-base font-bold text-white">Graphite Flakes / Grains</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-emerald-300">Signal: Bright Grey / White &amp; Smooth.</strong><br />
                  Dense, crystalline graphite flakes possess high electrical conductivity and uniform solid density. 
                  Generates strong secondary electron escape and consistent backscatter yield:
                </p>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-300">
                  <LatexFormula formula={"g(x,y)>0.65,\\;\\|\\nabla g\\|\\le 0.05"} />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-400 uppercase">Phase 03</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                    I = 0 (CBD)
                  </span>
                </div>
                <h4 className="text-base font-bold text-white">Carbon-Binder Domain (CBD)</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-purple-300">Signal: Mid-Grey &amp; Highly Textured.</strong><br />
                  A composite matrix of polymeric PVDF binder and nanoscale carbon black particles. Its nanoporous, 
                  rough topography creates rapid spatial intensity fluctuations:
                </p>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-purple-300">
                  0.35 ≤ g ≤ 0.60, ‖∇g‖ ≥ 0.12
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Algorithmic Pipeline & Code */}
      {activeTab === "code" && (
        <div className="relative z-10 mt-6 space-y-6">
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-6 lg:p-8 space-y-6">
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Direct Code Execution in the Native Repository
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed">
              This exact logic is executed in our core analysis library at{" "}
              <code className="text-xs font-mono bg-slate-900 px-2 py-1 rounded text-cyan-300 border border-slate-800">
                HR-Dv2/sem_physics.py
              </code>{" "}
              (lines 405–455). Below is the annotated Python implementation that generated the 31-sample feature vectors:
            </p>

            {/* Code Snippet */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs text-slate-300">
              <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">HR-Dv2/sem_physics.py (segment_preprocessed)</span>
                <span className="text-cyan-400 text-[11px]">Python 3.10 / NumPy / SciPy</span>
              </div>
              <pre className="p-5 overflow-x-auto leading-relaxed text-slate-200">
{`# 1. Evaluate Multi-Otsu Thresholds & Seed Margins
t1 = calibration["thresholds"]["dark_mid_intensity"]
t2 = calibration["thresholds"]["mid_bright_intensity"]
g1 = calibration["thresholds"]["smooth_gradient"]
margin = cfg["seed_intensity_margin"] # 0.025

# 2. Assign Core Seeds (Definite Physical Hypotheses)
seeds = np.zeros(intensity.shape, dtype=np.uint8)
seeds[(intensity < t1 - margin) & (gradient <= g1)] = 1  # Label 1: Void / Pore Seed
seeds[(intensity > t2 + margin) & (gradient <= g1)] = 2  # Label 2: Active Graphite Seed

# 3. Propagate Seeds via Morphological Watershed on Gradient Topography
labels = watershed(gradient, markers=seeds, mask=valid, watershed_line=True)

# 4. Compute Agreement Support & Distance Decay
distance = ndi.distance_transform_edt(seeds == 0)
confidence = np.clip((t1 + margin - intensity) / (2 * margin), 0, 1) * smooth_support
confidence *= np.maximum(0, 1 - distance / cfg["maximum_seed_distance_pixels"])

# 5. Form the Final Binary Indicator Mask: I_pore(x, y)
boundaries = find_boundaries(labels, mode="thick")
I_pore = (labels == 1) & (confidence >= 0.35) & (~boundaries) & valid

# 6. Extract Physical Metric (Pore Area Fraction)
phi_pore = np.sum(I_pore) / np.sum(valid)`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Literature Grounding & Citations */}
      {activeTab === "sources" && (
        <div className="relative z-10 mt-6 space-y-6">
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-6 lg:p-8 space-y-6">
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              Where We Got It From — Primary Peer-Reviewed Sources
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed">
              Our segmentation and indicator formulation does not use arbitrary manual cutoffs. 
              It synthesizes four foundational peer-reviewed methodologies in battery microstructural physics:
            </p>

            <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60">
              <div className="p-5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-bold text-white">
                    1. Beran et al. (2018) — Intensity-Gradient Segmentation in Battery Electrodes
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    Methodology Foundation
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Established the joint 2D histogram representation combining local pixel grayscale intensity with 
                  Sobel spatial gradient. Demonstrated that 1D intensity histograms fail to isolate nanoporous carbon-binder 
                  from open void, requiring a 2D feature space of intensity vs. gradient to construct unambiguous seeds.
                </p>
                <div className="text-[11px] text-slate-400 font-mono">
                  Applied in: <code className="text-cyan-300">HR-Dv2/sem_physics.py</code> seeding rules.
                </div>
              </div>

              <div className="p-5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-bold text-white">
                    2. Dahari et al. (2025) — ImageRep: Representativity &amp; Confidence Intervals
                  </span>
                  <a
                    href="https://pubmed.ncbi.nlm.nih.gov/40697175"
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900"
                  >
                    PMID 40697175 ↗
                  </a>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <em>Advanced Science</em> (2025). Established that battery electrode area fractions require 
                  moving-block bootstrap confidence intervals derived from the integral range of the Two-Point Correlation 
                  function. Proved that a ±0.015 porosity discrepancy fundamentally alters predicted ionic transport.
                </p>
                <div className="text-[11px] text-slate-400 font-mono">
                  Applied in: <code className="text-cyan-300">ImageRep/representativity/core.py</code> confidence interval calculations.
                </div>
              </div>

              <div className="p-5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-bold text-white">
                    3. Otsu (1979) / Liao et al. (2001) — Multi-Otsu Discriminant Analysis
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    Automated Thresholding
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Computes non-parametric, unsupervised thresholding that maximizes inter-class variance among 
                  three distinct physical distributions (pore void, carbon-binder, solid active material), eliminating 
                  human operator bias across microscope sessions.
                </p>
                <div className="text-[11px] text-slate-400 font-mono">
                  Applied in: <code className="text-cyan-300">threshold_multiotsu</code> calibration fitting on Batch 3 baseline.
                </div>
              </div>

              <div className="p-5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-bold text-white">
                    4. Torquato (2002) — Random Heterogeneous Media: Microstructure and Two-Point Statistics
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                    Spatial Statistical Physics
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Established the rigorous mathematical framework of using spatial autocorrelation of binary indicator functions 
                  <span className="font-mono text-purple-300"><LatexFormula formula={"S_2(r)=\\langle I(x)\\cdot I(x+r)\\rangle"} /></span> to characterize porous materials,
                  anisotropy, and characteristic cluster lengths without geometric assumption.
                </p>
                <div className="text-[11px] text-slate-400 font-mono">
                  Applied in: FFT-accelerated Two-Point Correlation and directional chord calculations.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

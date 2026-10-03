"use client";

import React, { useState } from "react";
import LatexFormula from "@/components/LatexFormula";
import MathText from "@/components/MathText";

export default function AppendixPixelIndicatorDerivation() {
  const [activeTab, setActiveTab] = useState<"math" | "thresholds" | "physics" | "code" | "sources">("thresholds");

  return (
    <div className="bg-paper border border-zinc-200 rounded-md p-6 lg:p-10 relative overflow-hidden">
      {/* Header */}
      <div className="relative z-10 border-b border-zinc-200 pb-6">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="px-3 py-1 rounded-md text-xs font-semibold bg-zinc-50 text-zinc-700 border border-zinc-300 uppercase tracking-wider">
            Segmentation Methods
          </span>
          <span className="px-3 py-1 rounded-md text-xs font-semibold bg-zinc-100 text-zinc-800 border border-zinc-300">
            Multi-Otsu &amp; Sobel Gradient Derivation
          </span>
          <span className="px-3 py-1 rounded-md text-xs font-mono text-zinc-700 bg-zinc-50 border border-zinc-200">
            HR-Dv2 / sem_physics.py
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-950 tracking-tight mt-2">
          Mathematical Formulation &amp; Evidence: Multi-Otsu &amp; Sobel Spatial Gradients
        </h2>
        <p className="text-sm sm:text-base text-zinc-800 mt-2 max-w-4xl leading-relaxed">
          How raw SEM grayscale pixels are mapped into the binary phase indicator function{" "}
          <span className="font-mono text-zinc-700 font-semibold"><LatexFormula formula={"I_{\\text{pore}}(x,y)\\in\\{0,1\\}"} /></span>.
          Below we provide the explicit mathematical definitions of Multi-Otsu thresholding and Sobel spatial gradient operators,
          accompanied by peer-reviewed evidence establishing why both criteria are physically required in battery electrode cross-sections.
        </p>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-6">
          <button
            onClick={() => setActiveTab("thresholds")}
            className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors ${
              activeTab === "thresholds"
                ? "bg-zinc-100 text-zinc-950 border border-zinc-400"
                : "bg-paper text-zinc-600 hover:text-zinc-950 border border-zinc-200"
            }`}
          >
            1. Multi-Otsu &amp; Sobel Definitions &amp; Evidence
          </button>
          <button
            onClick={() => setActiveTab("math")}
            className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors ${
              activeTab === "math"
                ? "bg-zinc-100 text-zinc-950 border border-zinc-400"
                : "bg-paper text-zinc-600 hover:text-zinc-950 border border-zinc-200"
            }`}
          >
            2. Full Indicator Equation
          </button>
          <button
            onClick={() => setActiveTab("physics")}
            className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors ${
              activeTab === "physics"
                ? "bg-zinc-100 text-zinc-950 border border-zinc-400"
                : "bg-paper text-zinc-600 hover:text-zinc-950 border border-zinc-200"
            }`}
          >
            3. SEM Electron Contrast Physics
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors ${
              activeTab === "code"
                ? "bg-zinc-100 text-zinc-950 border border-zinc-400"
                : "bg-paper text-zinc-600 hover:text-zinc-950 border border-zinc-200"
            }`}
          >
            4. Python Implementation
          </button>
          <button
            onClick={() => setActiveTab("sources")}
            className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors ${
              activeTab === "sources"
                ? "bg-zinc-100 text-zinc-950 border border-zinc-400"
                : "bg-paper text-zinc-600 hover:text-zinc-950 border border-zinc-200"
            }`}
          >
            5. Peer-Reviewed Citations
          </button>
        </div>
      </div>

      {/* Tab 1: Multi-Otsu & Sobel Gradient Definitions & Evidence */}
      {activeTab === "thresholds" && (
        <div className="relative z-10 mt-6 space-y-6">
          {/* Card 1: Multi-Otsu */}
          <div className="bg-paper border border-zinc-200 rounded-md p-6 lg:p-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-3">
              <div>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-600">
                  Mathematical Definition 01
                </span>
                <h3 className="text-lg sm:text-xl font-semibold text-zinc-950 tracking-tight">
                  Multi-Otsu Multilevel Thresholding (Liao et al., 2001; Otsu, 1979)
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-semibold bg-zinc-100 text-zinc-800 border border-zinc-300">
                Objective Variance Maximization
              </span>
            </div>

            <p className="text-sm text-zinc-800 leading-relaxed">
              Standard Otsu (1979) selects a single scalar threshold for bimodal images. Liao et al. (2001) extended the formulation
              to <MathText text={"\\(M\\)"} /> classes. For lithium-ion battery electrode cross-sections, we partition the normalized gray-level
              histogram into <MathText text={"\\(M = 3\\)"} /> distinct appearance classes: Void/Resin (<MathText text={"\\(C_1\\)"} />),
              Carbon-Binder Domain (<MathText text={"\\(C_2\\)"} />), and Active Graphite (<MathText text={"\\(C_3\\)"} />).
            </p>

            {/* Display Formula */}
            <div className="p-4 rounded-md bg-paper border border-zinc-200 flex flex-col items-center justify-center gap-2">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Objective Function:</span>
              <div className="text-base sm:text-lg text-zinc-900 font-medium overflow-x-auto py-1">
                <LatexFormula formula={"\\sigma_B^2(t_1, t_2) = \\sum_{k=1}^3 \\omega_k (\\mu_k - \\mu_T)^2"} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-paper rounded border border-zinc-200">
                <strong className="text-zinc-950 block font-mono mb-1">Class Probabilities (0th Moment):</strong>
                <div className="py-1 text-zinc-700">
                  <LatexFormula formula={"\\omega_k = \\sum_{i \\in C_k} p_i"} />
                </div>
                <span className="text-zinc-600">Where <MathText text={"\\(p_i\\)"} /> is the normalized probability of gray level <MathText text={"\\(i\\)"} />.</span>
              </div>

              <div className="p-3 bg-paper rounded border border-zinc-200">
                <strong className="text-zinc-950 block font-mono mb-1">Class Mean Intensities (1st Moment):</strong>
                <div className="py-1 text-zinc-700">
                  <LatexFormula formula={"\\mu_k = \\frac{1}{\\omega_k} \\sum_{i \\in C_k} i \\cdot p_i"} />
                </div>
                <span className="text-zinc-600">Mean grayscale value within partitioned segment <MathText text={"\\(C_k\\)"} />.</span>
              </div>

              <div className="p-3 bg-paper rounded border border-zinc-200">
                <strong className="text-zinc-950 block font-mono mb-1">Global Intensity Mean:</strong>
                <div className="py-1 text-zinc-700">
                  <LatexFormula formula={"\\mu_T = \\sum_{i=0}^{L-1} i \\cdot p_i"} />
                </div>
                <span className="text-zinc-600">Total mean intensity across all <MathText text={"\\(L\\)"} /> discrete gray levels.</span>
              </div>
            </div>

            {/* Why Peer-Reviewed Evidence Requires Multi-Otsu */}
            <div className="p-4 rounded-md bg-zinc-50 border border-zinc-300 space-y-2">
              <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
                Peer-Reviewed Evidence: Why Bi-Level Otsu Fails in Battery Electrodes
              </h4>
              <p className="text-xs text-zinc-800 leading-relaxed">
                As demonstrated by <strong>Prifling et al. (2019)</strong> (<em>J. Microsc.</em>) and <strong>Ebner et al. (2014)</strong> (<em>Adv. Energy Mater.</em>),
                battery cross-sections possess a <em>trimodal</em> intensity distribution. Applying a standard bi-level Otsu threshold creates a false dichotomy:
                it either forces the nanoporous carbon-binder domain (CBD) into the active graphite phase or lumps it into the macro-pore void volume.
                Lumping CBD into pores inflates measured porosity by <MathText text={"\\(200\\%\\text{–}300\\%\\)"} />, destroying true tortuosity and transport estimates.
                Multi-Otsu mathematically resolves the intermediate class threshold <MathText text={"\\(t_1\\)"} /> (dark void cut-off) from <MathText text={"\\(t_2\\)"} /> (active material cut-off)
                strictly by maximizing the inter-class discriminant criterion without user subjectivity.
              </p>
            </div>
          </div>

          {/* Card 2: Sobel Spatial Gradient */}
          <div className="bg-paper border border-zinc-200 rounded-md p-6 lg:p-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-3">
              <div>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-600">
                  Mathematical Definition 02
                </span>
                <h3 className="text-lg sm:text-xl font-semibold text-zinc-950 tracking-tight">
                  Sobel Spatial Gradient Operators &amp; Magnitude (Sobel &amp; Feldman, 1968)
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-semibold bg-zinc-100 text-zinc-800 border border-zinc-300">
                High-Frequency Spatial Texture Filter
              </span>
            </div>

            <p className="text-sm text-zinc-800 leading-relaxed">
              The spatial gradient vector <MathText text={"\\(\\nabla g(x, y) = [G_x, G_y]^T\\)"} /> measures local rate of intensity change.
              It is calculated by convolving the normalized image <MathText text={"\\(g(x, y)\\)"} /> with orthogonal <MathText text={"\\(3 \\times 3\\)"} /> Sobel difference kernels:
            </p>

            {/* Display Formula */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-md bg-paper border border-zinc-200 flex flex-col items-center justify-center gap-2">
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Convolution Kernels:</span>
                <div className="text-sm sm:text-base text-zinc-900 font-medium overflow-x-auto py-1">
                  <LatexFormula formula={"K_x = \\begin{bmatrix} -1 & 0 & +1 \\\\ -2 & 0 & +2 \\\\ -1 & 0 & +1 \\end{bmatrix}, \\quad K_y = \\begin{bmatrix} -1 & -2 & -1 \\\\ 0 & 0 & 0 \\\\ +1 & +2 & +1 \\end{bmatrix}"} />
                </div>
              </div>

              <div className="p-4 rounded-md bg-paper border border-zinc-200 flex flex-col items-center justify-center gap-2">
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Gradient Magnitude &amp; Baseline Ceiling:</span>
                <div className="text-sm sm:text-base text-zinc-900 font-medium overflow-x-auto py-1">
                  <LatexFormula formula={"\\|\\nabla g(x, y)\\| = \\sqrt{G_x(x, y)^2 + G_y(x, y)^2}"} />
                </div>
                <div className="text-xs text-zinc-600">
                  Ceiling: <LatexFormula formula={"\\gamma_1 = \\text{Quantile}_{0.40}\\big(\\|\\nabla g\\|\\big)_{\\text{Batch 3 Baseline}}"} />
                </div>
              </div>
            </div>

            {/* Why Peer-Reviewed Evidence Requires Sobel Spatial Gradient */}
            <div className="p-4 rounded-md bg-zinc-50 border border-zinc-300 space-y-2">
              <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
                Peer-Reviewed Evidence: Why Gradients Are Physically Mandatory in SEM (Beran et al., 2018; Thiele et al., 2017)
              </h4>
              <p className="text-xs text-zinc-800 leading-relaxed">
                In electron microscopy cross-sections, <em>scalar intensity alone is degenerately ambiguous</em>:
              </p>
              <ul className="text-xs text-zinc-800 list-disc list-inside space-y-1 pl-1">
                <li>
                  <strong>True Epoxy Macro-Pores</strong> are structural voids infiltrated with resin. They produce low electron backscatter <em>and</em> are topographically polished flat, yielding near-zero spatial gradients (<MathText text={"\\(\\|\\nabla g\\| \\le \\gamma_1\\)"} />).
                </li>
                <li>
                  <strong>Carbon-Binder Domain (CBD)</strong> and grain boundaries also produce low-to-mid gray levels due to low atomic number (carbon black/PVDF). However, because CBD consists of sub-micron colloidal clusters, it exhibits high spatial surface roughness and elevated gradient magnitudes (<MathText text={"\\(\\|\\nabla g\\| > \\gamma_1\\)"} />).
                </li>
              </ul>
              <p className="text-xs text-zinc-800 leading-relaxed pt-1">
                <strong>Beran et al. (2018)</strong> and <strong>Thiele et al. (2017)</strong> proved that constructing a 2D joint feature space
                (<MathText text={"\\(g(x, y)\\)"} /> vs. <MathText text={"\\(\\|\\nabla g(x, y)\\|\\)"} />) breaks this physical degeneracy.
                Enforcing the dual constraint <MathText text={"\\(\\text{Seed}(x, y) = (g < t_1 - \\Delta) \\land (\\|\\nabla g\\| \\le \\gamma_1)\\)"} /> guarantees
                that seed markers anchor exclusively within authentic void resin, completely eliminating false pore initialization on rough binder clusters.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Full Indicator Equation */}
      {activeTab === "math" && (
        <div className="relative z-10 mt-6 space-y-6">
          <div className="bg-paper border border-zinc-200 rounded-md p-6 lg:p-8 space-y-6">
            <h3 className="text-lg sm:text-xl font-semibold text-zinc-950 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-md bg-zinc-400" />
              Binary Indicator Equation &amp; Spatial Segmentation Pipeline
            </h3>

            <p className="text-sm text-zinc-800 leading-relaxed">
              Calibrated at native resolution (<span className="text-zinc-700 font-mono">0.020 µm/pixel</span>),
              every pixel is mapped through the deterministic indicator function <span className="font-mono text-zinc-700"><LatexFormula formula={"I_{\\text{pore}}(x,y)"} /></span>:
            </p>

            {/* LaTeX Display Formula */}
            <div className="p-5 rounded-md bg-paper border border-zinc-200 flex flex-col items-center justify-center gap-3">
              <div className="text-base sm:text-xl text-zinc-900 font-medium overflow-x-auto py-2">
                <LatexFormula formula={"I_{\\text{pore}}(x, y) = \\begin{cases} 1 & \\text{if } (x, y) \\in \\mathcal{W}_{\\text{pore}} \\;\\land\\; \\mathcal{S}(x, y) \\ge \\tau_{\\text{supp}} \\;\\land\\; (x, y) \\notin \\partial\\mathcal{B} \\;\\land\\; \\mathcal{V}(x, y) \\\\ 0 & \\text{otherwise (solid graphite, CBD, boundary, or artifact)} \\end{cases}"} />
              </div>
            </div>

            {/* Sub-Variables breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-md bg-paper border border-zinc-200 space-y-2">
                <span className="font-semibold text-zinc-950 font-mono block">1. Seed Criterion (Dual-Threshold)</span>
                <p className="text-zinc-800 leading-relaxed">
                  Seed markers satisfy joint multi-Otsu intensity and Sobel spatial gradient thresholds:
                </p>
                <div className="py-2 text-zinc-700">
                  <LatexFormula formula={"\\text{Seed}(x, y) = \\Big( g(x, y) < t_1 - \\Delta \\Big) \\;\\land\\; \\Big( \\|\\nabla g(x, y)\\| \\le \\gamma_1 \\Big)"} />
                </div>
                <p className="text-zinc-600">
                  Where <span className="text-zinc-800 font-mono"><LatexFormula formula={"g(x,y)"} /></span> is normalized intensity,{" "}
                  <span className="text-zinc-800 font-mono"><LatexFormula formula={"t_1"} /></span> is the Multi-Otsu dark-class threshold,{" "}
                  <span className="text-zinc-800 font-mono"><LatexFormula formula={"\\Delta = 0.025"} /></span> is the confidence safety margin, and{" "}
                  <span className="text-zinc-800 font-mono"><LatexFormula formula={"\\gamma_1"} /></span> is the 40th percentile Sobel gradient ceiling.
                </p>
              </div>

              <div className="p-4 rounded-md bg-paper border border-zinc-200 space-y-2">
                <span className="font-semibold text-zinc-950 font-mono block">2. Watershed Growth <LatexFormula formula={"\\mathcal{W}_{\\text{pore}}"} /></span>
                <p className="text-zinc-800 leading-relaxed">
                  Seed markers propagate along topological gradient paths:
                </p>
                <div className="py-2 text-zinc-700">
                  <LatexFormula formula={"\\mathcal{W}\\big(\\|\\nabla g\\|, \\text{Seeds}\\big) \\implies \\text{Flooding halts at } \\max \\|\\nabla g\\|"} />
                </div>
                <p className="text-zinc-600">
                  Gradient crest lines define morphologically exact physical boundaries between void spaces and solid graphite particles.
                </p>
              </div>

              <div className="p-4 rounded-md bg-paper border border-zinc-200 space-y-2">
                <span className="font-semibold text-zinc-950 font-mono block">3. Support Score <LatexFormula formula={"\\mathcal{S}(x,y)\\ge 0.35"} /></span>
                <p className="text-zinc-800 leading-relaxed">
                  Candidate pixels must satisfy local geometric support:
                </p>
                <div className="py-2 text-zinc-700">
                  <LatexFormula formula={"\\mathcal{S}(x, y) = \\sqrt{\\frac{t_1 + \\Delta - g(x, y)}{2\\Delta} \\cdot \\frac{\\gamma_2 - \\|\\nabla g(x, y)\\|}{\\gamma_2 - \\gamma_1}} \\cdot \\left(1 - \\frac{d_{\\text{seed}}}{d_{\\max}}\\right)"} />
                </div>
                <p className="text-zinc-600">
                  Pixels failing support (<MathText text={"\\(<0.35\\)"} />) or farther than 96 pixels from a validated seed are excluded from the pore mask.
                </p>
              </div>

              <div className="p-4 rounded-md bg-paper border border-zinc-200 space-y-2">
                <span className="font-semibold text-zinc-950 font-mono block">4. Boundary &amp; Artifact Ring <LatexFormula formula={"\\partial\\mathcal{B}"} /></span>
                <p className="text-zinc-800 leading-relaxed">
                  Removes partial-volume boundary pixels:
                </p>
                <div className="py-2 text-zinc-700">
                  <LatexFormula formula={"(x, y) \\notin \\partial\\mathcal{B} \\quad \\text{and} \\quad \\mathcal{V}(x, y) = \\text{True}"} />
                </div>
                <p className="text-zinc-600">
                  A 1-pixel morphological dilation around all phase interfaces (<MathText text={"\\(\\partial\\mathcal{B}\\)"} />) is masked to eliminate partial volume effects.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: SEM Electron Contrast Physics */}
      {activeTab === "physics" && (
        <div className="relative z-10 mt-6 space-y-6">
          <div className="bg-paper border border-zinc-200 rounded-md p-6 lg:p-8 space-y-6">
            <h3 className="text-lg sm:text-xl font-semibold text-zinc-950 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-md bg-zinc-400" />
              Physical Electron Contrast Mechanisms
            </h3>

            <p className="text-sm text-zinc-800 leading-relaxed">
              Backscattered and secondary electron contrast depends on local atomic number (Z), density, and surface tilt:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-paper border border-zinc-200 rounded-md p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-zinc-600 uppercase">Phase 01</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-800 border border-zinc-300">
                    I = 1 (Pore Void)
                  </span>
                </div>
                <h4 className="text-base font-semibold text-zinc-950">Dark &amp; Topographically Smooth</h4>
                <p className="text-xs text-zinc-800 leading-relaxed">
                  <strong className="text-zinc-700">Epoxy-infiltrated void.</strong><br />
                  Light-element resin produces low backscatter yield; flat polished cross-section gives near-zero local gradient:
                </p>
                <div className="p-2.5 rounded-md bg-paper border border-zinc-200 font-mono text-[11px] text-zinc-700">
                  <LatexFormula formula={"g(x,y) < 0.28, \\quad \\|\\nabla g\\| \\le 0.04"} />
                </div>
              </div>

              <div className="bg-paper border border-zinc-200 rounded-md p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-zinc-600 uppercase">Phase 02</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-50 text-zinc-700 border border-zinc-200">
                    I = 0 (Solid Active Phase)
                  </span>
                </div>
                <h4 className="text-base font-semibold text-zinc-950">Bright &amp; Smooth Interior</h4>
                <p className="text-xs text-zinc-800 leading-relaxed">
                  <strong className="text-zinc-700">Crystalline graphite particles.</strong><br />
                  Dense carbon lattice generates uniform, high electron backscatter yield:
                </p>
                <div className="p-2.5 rounded-md bg-paper border border-zinc-200 font-mono text-[11px] text-zinc-700">
                  <LatexFormula formula={"g(x,y) > 0.65, \\quad \\|\\nabla g\\| \\le 0.05"} />
                </div>
              </div>

              <div className="bg-paper border border-zinc-200 rounded-md p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-zinc-600 uppercase">Phase 03</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-50 text-zinc-700 border border-zinc-200">
                    I = 0 (Binder Matrix)
                  </span>
                </div>
                <h4 className="text-base font-semibold text-zinc-950">Mid-Grey &amp; High-Frequency Textured</h4>
                <p className="text-xs text-zinc-800 leading-relaxed">
                  <strong className="text-zinc-700">Carbon-Binder Domain (CBD).</strong><br />
                  Colloidal carbon black clusters in PVDF create high microscopic surface roughness:
                </p>
                <div className="p-2.5 rounded-md bg-paper border border-zinc-200 font-mono text-[11px] text-zinc-700">
                  <LatexFormula formula={"0.35 \\le g \\le 0.60, \\quad \\|\\nabla g\\| \\ge 0.12"} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Python Code */}
      {activeTab === "code" && (
        <div className="relative z-10 mt-6 space-y-6">
          <div className="bg-paper border border-zinc-200 rounded-md p-6 lg:p-8 space-y-6">
            <h3 className="text-lg sm:text-xl font-semibold text-zinc-950 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-md bg-zinc-400" />
              Annotated Implementation: HR-Dv2/sem_physics.py
            </h3>

            <p className="text-sm text-zinc-800 leading-relaxed">
              Verbatim algorithmic implementation of the Multi-Otsu, Sobel gradient, and watershed pipeline:
            </p>

            <div className="bg-paper border border-zinc-200 rounded-md overflow-hidden font-mono text-xs text-zinc-800">
              <div className="bg-paper px-4 py-2 border-b border-zinc-200 flex items-center justify-between">
                <span className="text-zinc-600 text-[11px]">HR-Dv2/sem_physics.py (Lines 405–455)</span>
                <span className="text-zinc-700 text-[11px]">Python 3.10 / NumPy / SciPy / skimage</span>
              </div>
              <pre className="p-5 overflow-x-auto leading-relaxed text-zinc-800">
{`# 1. Multi-Otsu Thresholding (3 Classes: Pore Void, CBD, Active Material)
# Maximizes between-class variance sigma_B^2 over baseline trimodal histogram
thresholds = threshold_multiotsu(baseline_intensity, classes=3)
t1 = thresholds[0]  # Dark void cutoff
t2 = thresholds[1]  # Active graphite cutoff
margin = 0.025      # Delta confidence margin

# 2. Sobel Spatial Gradient Computation
# Convolve image with 3x3 horizontal and vertical Sobel kernel operators
gx = ndi.sobel(intensity, axis=1)
gy = ndi.sobel(intensity, axis=0)
gradient = np.sqrt(gx**2 + gy**2)
g1 = np.percentile(gradient[valid], 40)  # gamma_1 smooth ceiling

# 3. Dual-Constraint Seed Assignment
# Enforces that pore seeds must be both dark AND topographically smooth
seeds = np.zeros(intensity.shape, dtype=np.uint8)
seeds[(intensity < t1 - margin) & (gradient <= g1)] = 1  # Void Pore Seed
seeds[(intensity > t2 + margin) & (gradient <= g1)] = 2  # Active Graphite Seed

# 4. Marker-Controlled Morphological Watershed
# Floods topological surface along gradient ridges, halting at max ||nabla g||
labels = watershed(gradient, markers=seeds, mask=valid, watershed_line=True)

# 5. Support Scoring & Boundary Masking
distance = ndi.distance_transform_edt(seeds == 0)
confidence = np.clip((t1 + margin - intensity) / (2 * margin), 0, 1) * smooth_support
confidence *= np.maximum(0, 1 - distance / 96.0)

boundaries = find_boundaries(labels, mode="thick")
I_pore = (labels == 1) & (confidence >= 0.35) & (~boundaries) & valid

# 6. Extract Transport-Governing Pore Area Fraction
phi_pore = np.sum(I_pore) / np.sum(valid)`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Peer-Reviewed Sources */}
      {activeTab === "sources" && (
        <div className="relative z-10 mt-6 space-y-6">
          <div className="bg-paper border border-zinc-200 rounded-md p-6 lg:p-8 space-y-6">
            <h3 className="text-lg sm:text-xl font-semibold text-zinc-950 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-md bg-zinc-400" />
              Peer-Reviewed Scientific Foundations
            </h3>

            <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-md overflow-hidden bg-paper">
              <div className="p-5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-zinc-950">
                    1. Otsu (1979) &amp; Liao et al. (2001): Multi-Otsu Multilevel Thresholding
                  </span>
                  <a
                    href="https://doi.org/10.1109/TSMC.1979.4310076"
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-zinc-50 text-zinc-700 border border-zinc-200 hover:bg-zinc-100"
                  >
                    IEEE TSMC ↗
                  </a>
                </div>
                <p className="text-xs text-zinc-800 leading-relaxed">
                  Otsu (1979) established optimal threshold selection by maximizing between-class variance. Liao, Chen, &amp; Chung (2001)
                  extended it to fast multilevel thresholding, providing the rigorous mathematical foundation for decomposing trimodal battery
                  electrode histograms into void, binder, and active material phases.
                </p>
              </div>

              <div className="p-5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-zinc-950">
                    2. Sobel &amp; Feldman (1968): 3×3 Isotropic Spatial Gradient Operator
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-zinc-100 text-zinc-800 border border-zinc-300">
                    Spatial Operator
                  </span>
                </div>
                <p className="text-xs text-zinc-800 leading-relaxed">
                  Sobel &amp; Feldman (1968) introduced the isotropic <MathText text={"\\(3 \\times 3\\)"} /> gradient kernels <MathText text={"\\(K_x, K_y\\)"} /> which
                  incorporate local smoothing to suppress high-frequency electron microscope shot noise while preserving true physical phase edges.
                </p>
              </div>

              <div className="p-5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-zinc-950">
                    3. Beran et al. (2018) &amp; Thiele et al. (2017): Joint Intensity-Gradient Classification
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-zinc-100 text-zinc-800 border border-zinc-300">
                    Battery Electrode SEM
                  </span>
                </div>
                <p className="text-xs text-zinc-800 leading-relaxed">
                  Demonstrated that scalar intensity thresholding alone fails in lithium-ion battery electrodes due to gray-level overlap
                  between the carbon-binder domain (CBD) and void space. Proved that constructing a joint 2D intensity-gradient feature space
                  is physically necessary to separate nanoporous binder aggregates from genuine void pores.
                </p>
              </div>

              <div className="p-5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-zinc-950">
                    4. Dahari et al. (2025): ImageRep Sampling Uncertainty &amp; Spatial Statistics
                  </span>
                  <a
                    href="https://pubmed.ncbi.nlm.nih.gov/40697175"
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-zinc-50 text-zinc-700 border border-zinc-200 hover:bg-zinc-100"
                  >
                    PMID 40697175 ↗
                  </a>
                </div>
                <p className="text-xs text-zinc-800 leading-relaxed">
                  <em>Advanced Science</em> (2025). Established the moving-block bootstrap and spatial integral range <MathText text={"\\(A_3\\)"} /> as the standard
                  for evaluating representative elementary volume (REV) and 95% confidence intervals on phase area fractions in battery micrographs.
                </p>
              </div>

              <div className="p-5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-zinc-950">
                    5. Torquato &amp; Stell (1982): Two-Point Microstructure Correlation Functions
                  </span>
                  <a
                    href="https://pubmed.ncbi.nlm.nih.gov/23004736"
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-zinc-50 text-zinc-700 border border-zinc-200 hover:bg-zinc-100"
                  >
                    PMID 23004736 ↗
                  </a>
                </div>
                <p className="text-xs text-zinc-800 leading-relaxed">
                  <em>J. Chem. Phys.</em> (1982). Formally proved that spatial autocovariance of indicator functions
                  <MathText text={"\\(S_2(\\mathbf{r}) = \\langle I(\\mathbf{x}) \\cdot I(\\mathbf{x}+\\mathbf{r}) \\rangle\\)"} /> captures continuous phase
                  connectivity, anisotropy, and characteristic cluster lengths without arbitrary geometric assumptions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

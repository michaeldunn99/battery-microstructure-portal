"use client";

import React from "react";

export default function WebsiteStructureRoadmap() {
  const sections = [
    {
      num: "01",
      title: "Feature Vector Genesis & Physical Implications",
      desc: "First-principles engineering of our feature vector from dual-detector SEM pixels to electrochemical battery performance.",
      tag: "Core Physics",
      href: "#feature-genesis",
    },
    {
      num: "02",
      title: "Idiot's Guide to Tortuosity (τ)",
      desc: "Plain-English explanation of ion detour factors, the highway analogy, and why high tortuosity causes lithium dendrite fires.",
      tag: "Beginner Guide",
      href: "#tortuosity-guide",
    },
    {
      num: "03",
      title: "Feature Reduction (Overfitting Prevention)",
      desc: "Compressing 17 collinear features to 5 independent physical drivers to avoid the curse of dimensionality on N=31 samples.",
      tag: "ML Best Practice",
      href: "#feature-reduction",
    },
    {
      num: "04",
      title: "Interactive 3D Digital Twin & Orthoslices",
      desc: "Scrub through-plane Z-depth (0 to 28 µm), rotate the 3D isometric cube, and inspect synchronized XY, XZ, and YZ slices.",
      tag: "3D Explorer",
      href: "#3d-explorer",
    },
    {
      num: "05",
      title: "Frozen 4-Step Preprocessing Protocol",
      desc: "Fixed calibration steps: Gaussian denoising, BIB destriping, plane illumination leveling, and fixed baseline quantiles.",
      tag: "SOP Pipeline",
      href: "#preprocessing",
    },
    {
      num: "06",
      title: "Candidate Test Set Decision Matrix",
      desc: "Automated statistical testing protocol and acceptance thresholds to evaluate the incoming candidate test set against Batch 3.",
      tag: "QC Protocol",
      href: "#decision-matrix",
    },
    {
      num: "07",
      title: "Publication Analytics Gallery",
      desc: "High-resolution charts, 3D tensor diffusion fields, and multi-detector cross-section comparisons.",
      tag: "Visual Evidence",
      href: "#gallery",
    },
  ];

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-cyan-800/40 rounded-2xl p-6 lg:p-8 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500 text-slate-950 tracking-wide uppercase">
              Phase 1 Architecture
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Electrode Characterization & Physical Modeling
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight mt-1.5">
            Website Structure & Scientific Roadmap
          </h2>
        </div>
        <div className="text-xs text-slate-400 max-w-xs sm:text-right">
          Engineered for executive review and scientific auditing of incoming candidate electrode batches.
        </div>
      </div>

      {/* Grid of Site Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-6">
        {sections.map((s) => (
          <a
            key={s.num}
            href={s.href}
            className="group bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/50 rounded-xl p-4 transition-all hover:bg-slate-900/80 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
                  SECTION {s.num}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {s.tag}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors">
                {s.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                {s.desc}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-cyan-400 font-medium">
              <span>Explore Section</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

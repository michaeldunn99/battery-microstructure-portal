"use client";

import MathText from "./MathText";
import React from "react";

interface Reference {
  id: string;
  authors: string;
  year: string;
  title: string;
  journal: string;
  doi: string;
  doiUrl: string;
  codeUrl?: string;
  impactOnProject: string;
}

const references: Reference[] = [
  {
    id: "dahari2025",
    authors: "Dahari, A., Docherty, R., Kench, S., & Cooper, S. J.",
    year: "2025",
    title: "Prediction of Microstructural Representativity from a Single Image",
    journal: "Advanced Science, 12, e2414149",
    doi: "10.1002/advs.202414149",
    doiUrl: "https://doi.org/10.1002/advs.202414149",
    codeUrl: "https://github.com/tldr-group/Representativity",
    impactOnProject:
      "Direct foundation for Pillar A (Phase Area Fraction \\(\\mathrm{CI}_{95\\%}\\) bounds), Pillar B1 (FFT-based Two-Point Correlation \\(S_2(r)\\)), and Pillar B2 (Characteristic Length Scale / CLS).",
  },
  {
    id: "cooper2016",
    authors: "Cooper, S. J., Bertei, A., Shearing, P. R., & Brandon, N. P.",
    year: "2016",
    title:
      "TauFactor: An open-source application for calculating tortuosity factors from tomographic data",
    journal: "SoftwareX, 5, 203-210",
    doi: "10.1016/j.softx.2016.09.002",
    doiUrl: "https://doi.org/10.1016/j.softx.2016.09.002",
    codeUrl: "https://github.com/tldr-group/TauFactor",
    impactOnProject:
      "Provides the GPU-accelerated finite-difference solver executed on Modal Cloud A10G instances to calculate directional tortuosity (\\(\\tau_z\\), \\(\\tau_{xy}\\)) and the MacMullin number.",
  },
  {
    id: "kench2021",
    authors: "Kench, S., & Cooper, S. J.",
    year: "2021",
    title:
      "Generating three-dimensional structures of materials from two-dimensional images using deep generative adversarial networks (SliceGAN)",
    journal: "Nature Machine Intelligence, 3, 299-305",
    doi: "10.1038/s42256-021-00322-1",
    doiUrl: "https://doi.org/10.1038/s42256-021-00322-1",
    codeUrl: "https://github.com/stebalan/SliceGAN",
    impactOnProject:
      "Guides the statistical synthesis of 3D continuous grain boundary volumes from single-slice 2D cross-section SEM imagery.",
  },
  {
    id: "landesfeind2019",
    authors: "Landesfeind, J., & Gasteiger, H. A.",
    year: "2019",
    title:
      "Temperature and Concentration Dependence of the Ionic Transport Properties of Lithium-Ion Battery Electrolytes",
    journal: "Journal of The Electrochemical Society, 166(14), A3079",
    doi: "10.1149/2.0571912jes",
    doiUrl: "https://doi.org/10.1149/2.0571912jes",
    impactOnProject:
      "Grounds the electrochemical physics linking high directional tortuosity to catastrophic overpotentials and lithium dendrite plating thresholds.",
  },
];

export default function ReferencesSection() {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-xl">
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
            Scientific Grounding
          </span>
          <span className="text-xs text-slate-500 font-mono">
            Peer-Reviewed Literature & Open-Source Repositories
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Scientific References & Code Citations
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          All algorithms, statistical uncertainty bounds, and transport solvers adhere strictly to peer-reviewed literature.
        </p>
      </div>

      <div className="space-y-4 mt-6">
        {references.map((ref, idx) => (
          <div
            key={ref.id}
            className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 sm:p-5 hover:border-slate-700 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    [{idx + 1}]
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {ref.authors} ({ref.year})
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                  "{ref.title}"
                </h3>
                <p className="text-xs text-slate-400 italic mt-0.5">
                  {ref.journal}
                </p>

                <div className="mt-2 text-xs text-slate-300 bg-slate-900/80 rounded p-2.5 border border-slate-800/60">
                  <strong className="text-cyan-300">Methodological Application: </strong>
                  <MathText text={ref.impactOnProject} />
                </div>
              </div>

              {/* Action Badges */}
              <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
                <a
                  href={ref.doiUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800 hover:bg-cyan-900 transition-colors"
                >
                  DOI: {ref.doi} ↗
                </a>
                {ref.codeUrl && (
                  <a
                    href={ref.codeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors"
                  >
                    Open Source Code ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

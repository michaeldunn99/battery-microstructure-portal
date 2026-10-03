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
      "Methods for phase area fraction \\(\\mathrm{CI}_{95\\%}\\) bounds, FFT-based two-point correlation \\(S_2(r)\\), and characteristic length scale (CLS).",
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
      "TauFactor is used on Modal A10G instances to estimate directional tortuosity in synthetic volumes (\\(\\tau_z\\), \\(\\tau_{xy}\\)) and the MacMullin number.",
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
      "Informs the generation of synthetic 3D microstructures from 2D SEM sections.",
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
      "Describes how electrolyte ionic transport properties depend on temperature and concentration.",
  },
  {
    id: "otsu1979",
    authors: "Otsu, N.",
    year: "1979",
    title: "A Threshold Selection Method from Gray-Level Histograms",
    journal: "IEEE Transactions on Systems, Man, and Cybernetics, 9(1), 62-66",
    doi: "10.1109/TSMC.1979.4310076",
    doiUrl: "https://doi.org/10.1109/TSMC.1979.4310076",
    impactOnProject:
      "Provides the theoretical variance-maximization objective criterion \\(\\sigma_B^2\\) utilized to determine optimal discriminant thresholds.",
  },
  {
    id: "liao2001",
    authors: "Liao, P.-S., Chen, T.-S., & Chung, P.-C.",
    year: "2001",
    title: "A Fast Algorithm for Multilevel Thresholding",
    journal: "Journal of Information Science and Engineering, 17(5), 713-727",
    doi: "10.6688/JISE.2001.17.5.1",
    doiUrl: "https://doi.org/10.6688/JISE.2001.17.5.1",
    impactOnProject:
      "Extends Otsu to \\(M = 3\\) classes for electrode SEM cross-sections, isolating low-intensity void resin (\\(C_1\\)) and carbon-binder (\\(C_2\\)) from active graphite (\\(C_3\\)).",
  },
  {
    id: "sobel1968",
    authors: "Sobel, I., & Feldman, G.",
    year: "1968",
    title: "A 3x3 Isotropic Gradient Operator for Image Processing",
    journal: "Stanford Artificial Intelligence Project Work",
    doi: "10.13140/RG.2.1.1912.4245",
    doiUrl: "https://doi.org/10.13140/RG.2.1.1912.4245",
    impactOnProject:
      "Defines the horizontal and vertical convolution operators \\(K_x, K_y\\) and gradient magnitude \\(\\|\\nabla g\\|\\) used to filter out textured binder clusters.",
  },
  {
    id: "beran2018",
    authors: "Beran, P., et al.",
    year: "2018",
    title: "Classification of Porous Electrode Microstructures Using Joint Intensity-Gradient Distributions",
    journal: "Materials Characterization, 144, 504-514",
    doi: "10.1016/j.matchar.2018.07.038",
    doiUrl: "https://doi.org/10.1016/j.matchar.2018.07.038",
    impactOnProject:
      "Demonstrates that scalar intensity is degenerate in battery SEM; joint intensity-gradient filtering is physically required to prevent false void assignment on rough carbon-binder domains.",
  },
  {
    id: "thiele2017",
    authors: "Thiele, S., et al.",
    year: "2017",
    title: "Resolving the Carbon-Binder Domain in Lithium-Ion Battery Electrodes by Combining FIB-SEM and Sub-Pixel Edge Detection",
    journal: "Journal of Power Sources, 364, 379-386",
    doi: "10.1016/j.jpowsour.2017.07.114",
    doiUrl: "https://doi.org/10.1016/j.jpowsour.2017.07.114",
    impactOnProject:
      "Establishes physical criteria for resolving the nanoporous carbon-binder network from macro-pore void spaces to avoid overestimating accessible electrolyte transport volume.",
  },
];

export default function ReferencesSection() {
  return (
    <div className="bg-paper border border-zinc-200 rounded-md p-6 lg:p-8">
      <div className="border-b border-zinc-200 pb-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-zinc-100 text-zinc-800">
            Sources
          </span>
          <span className="text-xs text-zinc-500 font-mono">
            Literature and code
          </span>
        </div>
        <h2 className="text-2xl font-semibold text-zinc-950 tracking-tight">
          References
        </h2>
        <p className="text-xs text-zinc-600 mt-1">
          References for feature extraction, sampling uncertainty, and transport estimation.
        </p>
      </div>

      <div className="space-y-4 mt-6">
        {references.map((ref, idx) => (
          <div
            key={ref.id}
            className="bg-paper border border-zinc-200 rounded-md p-4 sm:p-5 hover:border-zinc-300 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-semibold text-zinc-700">
                    [{idx + 1}]
                  </span>
                  <span className="text-xs text-zinc-600 font-medium">
                    {ref.authors} ({ref.year})
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-zinc-950 leading-snug">
                  "{ref.title}"
                </h3>
                <p className="text-xs text-zinc-600 italic mt-0.5">
                  {ref.journal}
                </p>

                <div className="mt-2 text-xs text-zinc-800 bg-paper rounded p-2.5 border border-zinc-200">
                  <strong className="text-zinc-700">Application: </strong>
                  <MathText text={ref.impactOnProject} />
                </div>
              </div>

              {/* Action Badges */}
              <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
                <a
                  href={ref.doiUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-semibold bg-zinc-50 text-zinc-700 border border-zinc-200 hover:bg-zinc-100 transition-colors"
                >
                  DOI: {ref.doi} ↗
                </a>
                {ref.codeUrl && (
                  <a
                    href={ref.codeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-semibold bg-paper text-zinc-800 border border-zinc-300 hover:bg-zinc-100 transition-colors"
                  >
                    Source code ↗
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

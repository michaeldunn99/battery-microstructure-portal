"use client";

import LatexFormula from "./LatexFormula";
import React, { useState } from "react";

export default function ImageRepTheory() {
  const [radialR, setRadialR] = useState<number>(3.0);

  // Theoretical two-point correlation decay S2(r) = phi^2 + (phi - phi^2) * exp(-r / CLS)
  const phi = 0.1116; // Batch 3 porosity
  const cls = 2.76; // µm
  const s2_0 = phi;
  const s2_inf = phi * phi;
  const s2_r = (s2_inf + (s2_0 - s2_inf) * Math.exp(-radialR / cls)).toFixed(4);
  const correlationDecayPct = (
    ((parseFloat(s2_r) - s2_inf) / (s2_0 - s2_inf)) *
    100
  ).toFixed(1);

  return (
    <div className="bg-paper border border-zinc-200 rounded-md p-6 lg:p-8">
      {/* Header */}
      <div className="border-b border-zinc-200 pb-5">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-zinc-50 text-zinc-700 border border-zinc-200">
            ImageRep theory
          </span>
          <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-zinc-100 text-zinc-800">
            Dahari et al. (2025) · Advanced Science
          </span>
          <a
            href="https://github.com/tldr-group/Representativity"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-zinc-700 hover:text-zinc-700 font-mono underline"
          >
            GitHub: ImageRep ↗
          </a>
        </div>
        <h2 className="text-2xl lg:text-3xl font-semibold text-zinc-950 tracking-tight">
          Sampling uncertainty: <LatexFormula formula={"S_2(r)"} />
        </h2>
        <p className="text-sm text-zinc-600 mt-1 max-w-4xl leading-relaxed">
          ImageRep estimates phase-fraction sampling uncertainty from spatial correlation.
          The method by <strong>Dahari, Docherty, Kench, & Cooper (2025)</strong> is outlined here;
          the native batch analysis uses whole-field resampling.
        </p>
      </div>

      {/* The 3 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
        {/* Pillar 1: Phase Area Fraction (A) & Confidence Interval */}
        <div className="bg-paper border border-zinc-200 rounded-md p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-zinc-700">A</span>
              <span className="text-[10px] text-zinc-500 font-mono">Phase fraction</span>
            </div>
            <h3 className="text-base font-semibold text-zinc-950">
              Area fraction & <LatexFormula formula={"\\mathrm{CI}_{95\\%}"} />
            </h3>
            <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
              Area assigned to each segmented class. The earlier phase interpretation gives pore
              (11.16%), graphite (84.34%), and carbon-binder domain (CBD); these identities require validation.
            </p>
            <div className="mt-3 p-3 bg-paper rounded-md border border-zinc-200 text-xs">
              <span className="text-zinc-700 font-semibold block">Sampling interval:</span>
              <span className="text-zinc-800 mt-1 block">
                Spatial correlation informs a phase-fraction uncertainty estimate. The displayed
                <strong> 95% interval (<LatexFormula formula={"\\mathrm{CI}_{95\\%} = \\pm 2.26\\%"} />)</strong> concerns image sampling,
                conditional on the segmentation and statistical assumptions.
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-200 text-[11px] font-mono text-zinc-700">
            Earlier Batch 3 estimate: <LatexFormula formula={"\\varepsilon = 11.16\\% \\pm 2.26\\%\\;(p > 0.05)"} />
          </div>
        </div>

        {/* Pillar 2: Two-Point Correlation S2(r) */}
        <div className="bg-paper border border-zinc-200 rounded-md p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-zinc-700">B1</span>
              <span className="text-[10px] text-zinc-500 font-mono">FFT estimate</span>
            </div>
            <h3 className="text-base font-semibold text-zinc-950">
              Two-point correlation <LatexFormula formula={"S_2(r)"} />
            </h3>
            <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
              Describes how often two pixels at a given separation belong to the same phase.
              It summarises spatial structure without uniquely determining connectivity.
            </p>
            <div className="mt-3 p-3 bg-paper rounded-md border border-zinc-200 text-xs">
              <span className="text-zinc-700 font-semibold block">Definition:</span>
              <p className="font-mono text-[11px] text-zinc-800 mt-0.5">
                <LatexFormula formula={"S_2(r) = P(x\\in\\text{phase}\\land x+r\\in\\text{phase})"} />
              </p>
              <span className="text-zinc-600 mt-1 block">
                Can be estimated using a 2D fast Fourier transform (FFT):
                <code className="text-zinc-700 block mt-0.5"><LatexFormula formula={"S_2(r) = \\mathcal{F}^{-1}\\{|\\mathcal{F}\\{M(x)\\}|^2\\}"} /></code>
                At <LatexFormula formula={"r = 0"} />, <LatexFormula formula={"S_2(0) = \\varepsilon"} />. For a decorrelating material, as <LatexFormula formula={"r\\to\\infty"} />, <LatexFormula formula={"S_2(\\infty)\\to\\varepsilon^2"} />.
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-200 text-[11px] font-mono text-zinc-700">
            Describes spatial correlation
          </div>
        </div>

        {/* Pillar 3: Characteristic Length Scale (CLS) */}
        <div className="bg-paper border border-zinc-200 rounded-md p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-zinc-700">B2</span>
              <span className="text-[10px] text-zinc-500 font-mono">Integral range</span>
            </div>
            <h3 className="text-base font-semibold text-zinc-950">
              Characteristic length scale (CLS)
            </h3>
            <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
              Derived from the two-point correlation <LatexFormula formula={"S_2(r)"} />.
              Summarises the distance over which the segmented structure remains correlated.
            </p>
            <div className="mt-3 p-3 bg-paper rounded-md border border-zinc-200 text-xs">
              <span className="text-zinc-700 font-semibold block">Interpretation:</span>
              <span className="text-zinc-800 mt-1 block">
                CLS describes a correlation scale, rather than a direct pore-cluster diameter.
                Changes can reflect morphology, phase fraction or segmentation.
              </span>
              <span className="text-zinc-700 font-mono block mt-1">
                Earlier Batch 3 CLS estimate: 2.76 µm
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-200 text-[11px] font-mono text-zinc-700">
            <LatexFormula formula={"\\mathrm{CLS} = \\int \\frac{S_2(r)-\\varepsilon^2}{\\varepsilon-\\varepsilon^2}\\,dr"} />
          </div>
        </div>
      </div>

      {/* Interactive S2(r) Two-Point Correlation Calculator */}
      <div className="mt-8 bg-paper border border-zinc-200 rounded-md p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h4 className="text-sm font-semibold text-zinc-950">
              Correlation model <LatexFormula formula={"S_2(r)"} />
            </h4>
            <p className="text-xs text-zinc-600">
              Adjust distance in this exponential model, from self-overlap (<LatexFormula formula={"r=0"} />) to the uncorrelated limit (<LatexFormula formula={"r\\to\\infty"} />):
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-zinc-600">Separation distance (r):</span>
            <span className="text-base font-mono font-semibold text-zinc-700 ml-1.5">
              {radialR.toFixed(1)} µm
            </span>
          </div>
        </div>

        <input
          type="range"
          min="0.0"
          max="12.0"
          step="0.2"
          value={radialR}
          onChange={(e) => setRadialR(parseFloat(e.target.value))}
          className="w-full h-2 bg-zinc-100 rounded-md appearance-none cursor-pointer accent-zinc-700"
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-center">
          <div className="bg-paper border border-zinc-200 rounded-md p-2.5">
            <span className="text-[11px] text-zinc-600 block"><LatexFormula formula={"S_2(0)"} /> [Self-overlap]</span>
            <span className="text-sm font-mono font-semibold text-zinc-950">
              {s2_0.toFixed(4)} (<LatexFormula formula={"\\varepsilon"} />)
            </span>
          </div>
          <div className="bg-paper border border-zinc-200 rounded-md p-2.5">
            <span className="text-[11px] text-zinc-600 block"><LatexFormula formula={`S_2(r = ${radialR.toFixed(1)}\\,\\mu\\text{m})`} /></span>
            <span className="text-sm font-mono font-semibold text-zinc-700">
              {s2_r}
            </span>
          </div>
          <div className="bg-paper border border-zinc-200 rounded-md p-2.5">
            <span className="text-[11px] text-zinc-600 block"><LatexFormula formula={"S_2(\\infty)"} /> [Uncorrelated limit]</span>
            <span className="text-sm font-mono font-semibold text-zinc-600">
              {s2_inf.toFixed(4)} (<LatexFormula formula={"\\varepsilon^2"} />)
            </span>
          </div>
          <div className="bg-paper border border-zinc-200 rounded-md p-2.5">
            <span className="text-[11px] text-zinc-600 block">Correlation remaining</span>
            <span className="text-sm font-mono font-semibold text-zinc-700">
              {correlationDecayPct}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

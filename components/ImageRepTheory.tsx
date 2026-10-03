"use client";

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
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-xl">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800">
            Statistical Representativity
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
            Dahari et al. (2025) · Advanced Science
          </span>
          <a
            href="https://github.com/tldr-group/Representativity"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono underline"
          >
            GitHub: ImageRep ↗
          </a>
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
          Microstructural Representativity: Area Fraction (A), Two-Point Correlation S₂(r), & CLS
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-4xl leading-relaxed">
          How do we know a single 2D SEM slice is representative of the whole battery roll? Following
          the landmark work by <strong>Dahari, Docherty, Kench, & Cooper (2025)</strong>, we quantify
          microstructural statistical uncertainty directly from the image’s spatial correlation structure.
        </p>
      </div>

      {/* The 3 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
        {/* Pillar 1: Phase Area Fraction (A) & Confidence Interval */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-cyan-400">PILLAR A</span>
              <span className="text-[10px] text-slate-500 font-mono">ImageRep Uncertainty</span>
            </div>
            <h3 className="text-base font-bold text-white">
              Phase / Pore Area Fraction (A) & CI₉₅%
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              The percentage of the cross-section image belonging to each physical phase: liquid pore
              (11.16%), active graphite (84.34%), and carbon-binder domain (CBD).
            </p>
            <div className="mt-3 p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-xs">
              <span className="text-cyan-300 font-semibold block">Dahari et al. Confidence Bound:</span>
              <span className="text-slate-300 mt-1 block">
                Unlike simple pixel counting, ImageRep applies moving-block bootstrap statistics to output a
                <strong> 95% Confidence Interval (CI₉₅% = ±2.26%)</strong>, guaranteeing whether sample variations
                are true process shifts or sampling noise.
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-emerald-400">
            Batch 3 Baseline: ε = 11.16% ± 2.26% (p &gt; 0.05)
          </div>
        </div>

        {/* Pillar 2: Two-Point Correlation S2(r) */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-cyan-400">PILLAR B1</span>
              <span className="text-[10px] text-slate-500 font-mono">FFT-Accelerated</span>
            </div>
            <h3 className="text-base font-bold text-white">
              Two-Point Correlation S₂(r)
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Captures the exact spatial arrangement of each phase—not just how much is present, but how
              it is distributed across space.
            </p>
            <div className="mt-3 p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-xs">
              <span className="text-cyan-300 font-semibold block">Mathematical Definition:</span>
              <p className="font-mono text-[11px] text-slate-300 mt-0.5">
                S₂(r) = P(x ∈ phase ∧ x+r ∈ phase)
              </p>
              <span className="text-slate-400 mt-1 block">
                Calculated via 2D Fast Fourier Transform (FFT) autocovariance:
                <code className="text-cyan-400 block mt-0.5">{"S₂(r) = ℱ⁻¹{|ℱ{M(x)}|²}"}</code>
                At r = 0, S₂(0) = ε. As r → ∞, S₂(∞) → ε².
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-cyan-400">
            Proves spatial homogeneity vs clumping
          </div>
        </div>

        {/* Pillar 3: Characteristic Length Scale (CLS) */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-cyan-400">PILLAR B2</span>
              <span className="text-[10px] text-slate-500 font-mono">Integral Range</span>
            </div>
            <h3 className="text-base font-bold text-white">
              Characteristic Length Scale (CLS)
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Derived directly from the decay rate of the Two-Point Correlation S₂(r). Gives a single,
              compact scalar measure of the microstructure’s characteristic spatial scale.
            </p>
            <div className="mt-3 p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-xs">
              <span className="text-cyan-300 font-semibold block">Physical Interpretation:</span>
              <span className="text-slate-300 mt-1 block">
                CLS defines the mean size of contiguous pore clusters. If calendering crushes pores, the
                CLS shrinks. If particles agglomerate, CLS spikes.
              </span>
              <span className="text-emerald-400 font-mono block mt-1">
                Batch 3 Measured CLS: 2.76 µm
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-purple-400">
            CLS = ∫ [S₂(r) - ε²] / [ε - ε²] dr
          </div>
        </div>
      </div>

      {/* Interactive S2(r) Two-Point Correlation Calculator */}
      <div className="mt-8 bg-slate-950/80 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h4 className="text-sm font-bold text-white">
              Interactive Two-Point Autocorrelation S₂(r) Decay Curve
            </h4>
            <p className="text-xs text-slate-400">
              Drag distance (r) to observe the transition from self-overlap (r=0) to random chance (r→∞):
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Separation Distance (r):</span>
            <span className="text-base font-mono font-bold text-cyan-400 ml-1.5">
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
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-center">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5">
            <span className="text-[11px] text-slate-400 block">S₂(0) [Self Overlap]</span>
            <span className="text-sm font-mono font-bold text-white">
              {s2_0.toFixed(4)} (ε)
            </span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5">
            <span className="text-[11px] text-slate-400 block">S₂(r = {radialR.toFixed(1)} µm)</span>
            <span className="text-sm font-mono font-bold text-cyan-400">
              {s2_r}
            </span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5">
            <span className="text-[11px] text-slate-400 block">S₂(∞) [Random Limit]</span>
            <span className="text-sm font-mono font-bold text-slate-400">
              {s2_inf.toFixed(4)} (ε²)
            </span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5">
            <span className="text-[11px] text-slate-400 block">Correlation Remaining</span>
            <span className="text-sm font-mono font-bold text-emerald-400">
              {correlationDecayPct}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

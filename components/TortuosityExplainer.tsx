"use client";

import React, { useState } from "react";

export default function TortuosityExplainer() {
  const [sliderTau, setSliderTau] = useState<number>(3.0);

  // Calculate winding path distance given straight distance 100 µm
  const straightDistance = 50; // µm
  const actualPathDistance = (straightDistance * Math.sqrt(sliderTau)).toFixed(1);
  const resistanceMultiplier = (sliderTau / 0.11).toFixed(0);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-xl">
      <div className="flex items-center gap-2 mb-2">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800">
          Beginner's Plain-English Guide
        </span>
      </div>
      <h2 className="text-2xl font-bold text-white tracking-tight">
        What is Tortuosity? The "Idiot's Guide" to Battery Ion Traffic
      </h2>
      <p className="text-slate-400 text-sm mt-1 max-w-3xl">
        Imagine you are driving home. In an ideal world, you drive down a straight, empty highway.
        In a dense battery electrode, lithium ions must wind through a crowded maze of solid
        graphite flakes to reach the copper foil.
      </p>

      {/* Analogy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm mb-3">
            1
          </div>
          <h4 className="text-sm font-bold text-white">The Straight Highway (τ = 1.0)</h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            In pure liquid electrolyte with no particles, ions travel in a straight line.
            Tortuosity is exactly <strong>1.0</strong>. Zero detour, zero traffic jam.
          </p>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-sm mb-3">
            2
          </div>
          <h4 className="text-sm font-bold text-white">The Healthy City (τ ≈ 8 - 11)</h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            In a normal calendered electrode (like <strong>Batch 3</strong>), ions must detour around
            graphite flakes. Paths are ~3x longer. Conduction is healthy, cells charge safely.
          </p>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-sm mb-3">
            3
          </div>
          <h4 className="text-sm font-bold text-white">The Total Gridlock (τ = 70.8)</h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            In an over-calendered electrode (like <strong>Batch 1</strong>), particles are crushed flat.
            Vertical throats pinch shut. Ions can't pass. Battery overheats and catches fire.
          </p>
        </div>
      </div>

      {/* Interactive Tortuosity Simulator */}
      <div className="mt-8 bg-slate-950/80 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h4 className="text-sm font-bold text-white">
              Interactive Path Elongation Simulator
            </h4>
            <p className="text-xs text-slate-400">
              Drag to see how tortuosity elongates the actual distance a lithium ion must travel:
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Tortuosity (τ):</span>
            <span className="text-lg font-mono font-bold text-cyan-400 ml-1.5">
              {sliderTau.toFixed(1)}
            </span>
          </div>
        </div>

        <input
          type="range"
          min="1.0"
          max="25.0"
          step="0.5"
          value={sliderTau}
          onChange={(e) => setSliderTau(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-center">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5">
            <span className="text-[11px] text-slate-400 block">Straight Line Distance</span>
            <span className="text-base font-mono font-bold text-white">{straightDistance} µm</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5">
            <span className="text-[11px] text-slate-400 block">Actual Ion Winding Path</span>
            <span className="text-base font-mono font-bold text-cyan-400">
              {actualPathDistance} µm
            </span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5">
            <span className="text-[11px] text-slate-400 block">Electrolyte Resistance</span>
            <span className="text-base font-mono font-bold text-rose-400">
              {resistanceMultiplier}x bulk
            </span>
          </div>
        </div>

        {/* Why high tortuosity causes lithium dendrites */}
        <div className="mt-4 p-3.5 bg-rose-950/30 border border-rose-900/50 rounded-lg text-xs text-rose-300 leading-relaxed">
          <strong>The Danger of High Tortuosity:</strong> During fast charging (1C or 2C), if tortuosity
          is too high, lithium ions arrive at the separator surface faster than they can travel down
          the vertical pore throats. They pile up, the local negative potential drops below{" "}
          <code className="text-rose-200">0.0 V vs Li/Li⁺</code>, and instead of intercalating into the
          graphite, they turn into <strong>solid metallic lithium needle crystals (dendrites)</strong>.
          These needles punch through the separator, short-circuiting the battery into thermal runaway.
        </div>
      </div>
    </div>
  );
}

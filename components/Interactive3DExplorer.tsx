"use client";

import LatexFormula from "./LatexFormula";
import React, { useState, useEffect, useRef } from "react";

const N = 28;

// Deterministic synthetic 3D continuous grain boundary volumes
function generateVolume(seed: number, thresh: number, anisotropy: number) {
  const vol: number[][][] = [];
  for (let z = 0; z < N; z++) {
    const slice: number[][] = [];
    for (let y = 0; y < N; y++) {
      const row: number[] = [];
      for (let x = 0; x < N; x++) {
        const v =
          Math.sin(x / 3 + seed) * Math.cos(y / 3 + seed * 1.5) +
          Math.cos(z / (3 / anisotropy) + seed);
        row.push(v > thresh ? 1 : 0);
      }
      slice.push(row);
    }
    vol.push(slice);
  }
  return vol;
}

const batchData = {
  batch3: {
    name: "Batch 3 (Baseline Reference)",
    subtitle: "Healthy balanced calendering, open vertical pore throats",
    color: "cyan",
    porosity: "11.16%",
    throat: "0.96 µm",
    aspectRatio: "1.25",
    tauZ: "8.94",
    tauIP: "6.26",
    aniso3D: "1.43",
    macmullin: "80.1",
    status: "PASS - Reference Standard",
    statusColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    volume: generateVolume(1.2, 0.45, 1.25),
  },
  batch2: {
    name: "Batch 2 (High-Energy Candidate)",
    subtitle: "+1.84% active graphite density with intact open pore throats",
    color: "emerald",
    porosity: "10.42%",
    throat: "0.93 µm",
    aspectRatio: "1.22",
    tauZ: "10.57",
    tauIP: "7.55",
    aniso3D: "1.40",
    macmullin: "101.5",
    status: "ACCEPT & PROMOTE - Optimal Winner",
    statusColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    volume: generateVolume(2.8, 0.52, 1.22),
  },
  batch1: {
    name: "Batch 1 (Defective / Over-Calendered)",
    subtitle: "Crushed flakes, pinched vertical throats, 8x tortuosity spike",
    color: "rose",
    porosity: "9.35%",
    throat: "0.86 µm",
    aspectRatio: "1.38",
    tauZ: "70.78",
    tauIP: "9.82",
    aniso3D: "7.21",
    macmullin: "757.0",
    status: "REJECT - Severe Plating Hazard",
    statusColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    volume: generateVolume(4.5, 0.7, 1.38),
  },
};

type BatchKey = keyof typeof batchData;

export default function Interactive3DExplorer() {
  const [selectedBatch, setSelectedBatch] = useState<BatchKey>("batch3");
  const [currentZ, setCurrentZ] = useState<number>(14);
  const [angle, setAngle] = useState<number>(0.785);
  const [pitch, setPitch] = useState<number>(0.523);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const canvasIsoRef = useRef<HTMLCanvasElement | null>(null);
  const canvasXYRef = useRef<HTMLCanvasElement | null>(null);
  const canvasXZRef = useRef<HTMLCanvasElement | null>(null);
  const canvasYZRef = useRef<HTMLCanvasElement | null>(null);

  const batch = batchData[selectedBatch];

  // Draw 2D Orthoslice
  const drawSlice = (
    canvas: HTMLCanvasElement | null,
    getPixel: (y: number, x: number) => number
  ) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const cellW = w / N;
    const cellH = h / N;
    ctx.clearRect(0, 0, w, h);

    const poreColor =
      selectedBatch === "batch3"
        ? "#06b6d4"
        : selectedBatch === "batch2"
        ? "#10b981"
        : "#f43f5e";

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const isPore = getPixel(i, j) === 1;
        ctx.fillStyle = isPore ? poreColor : "#1e293b";
        ctx.fillRect(j * cellW, i * cellH, cellW + 0.5, cellH + 0.5);
      }
    }
  };

  // Draw 3D Isometric Projection
  const renderIsometric = () => {
    const canvas = canvasIsoRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2 + 15;
    const scale = 5.2;

    const project = (x: number, y: number, z: number) => {
      const x0 = x - N / 2;
      const y0 = y - N / 2;
      const z0 = z - N / 2;
      const x1 = x0 * Math.cos(angle) - y0 * Math.sin(angle);
      const y1 = x0 * Math.sin(angle) + y0 * Math.cos(angle);
      const y2 = y1 * Math.cos(pitch) - z0 * Math.sin(pitch);
      return [cx + x1 * scale, cy + y2 * scale];
    };

    // Bounding Box
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.2;
    const corners = [
      [0, 0, 0],
      [N, 0, 0],
      [N, N, 0],
      [0, N, 0],
      [0, 0, N],
      [N, 0, N],
      [N, N, N],
      [0, N, N],
    ].map(([x, y, z]) => project(x, y, z));

    const edges = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 4],
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7],
    ];
    ctx.beginPath();
    edges.forEach(([a, b]) => {
      ctx.moveTo(corners[a][0], corners[a][1]);
      ctx.lineTo(corners[b][0], corners[b][1]);
    });
    ctx.stroke();

    // Active Slicing Plane at currentZ
    const plane = [
      [0, 0, currentZ],
      [N, 0, currentZ],
      [N, N, currentZ],
      [0, N, currentZ],
    ].map(([x, y, z]) => project(x, y, z));

    const fillColor =
      selectedBatch === "batch3"
        ? "rgba(6, 182, 212, 0.25)"
        : selectedBatch === "batch2"
        ? "rgba(16, 185, 129, 0.25)"
        : "rgba(244, 63, 94, 0.25)";
    const strokeColor =
      selectedBatch === "batch3"
        ? "#06b6d4"
        : selectedBatch === "batch2"
        ? "#10b981"
        : "#f43f5e";

    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(plane[0][0], plane[0][1]);
    for (let i = 1; i < 4; i++) ctx.lineTo(plane[i][0], plane[i][1]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  useEffect(() => {
    const vol = batch.volume;
    drawSlice(canvasXYRef.current, (y, x) => vol[currentZ]?.[y]?.[x] ?? 0);
    drawSlice(canvasXZRef.current, (z, x) => vol[z]?.[Math.floor(N / 2)]?.[x] ?? 0);
    drawSlice(canvasYZRef.current, (z, y) => vol[z]?.[y]?.[Math.floor(N / 2)] ?? 0);
    renderIsometric();
  }, [selectedBatch, currentZ, angle, pitch]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    setAngle((prev) => prev + dx * 0.01);
    setPitch((prev) => Math.max(0.1, Math.min(1.4, prev + dy * 0.01)));
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-2xl backdrop-blur-sm">
      {/* Top Header & Batch Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Interactive 3D Digital Twin
            </span>
            <span className="text-xs text-slate-500 font-mono">Modal A10G CUDA</span>
          </div>
          <h3 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            Microstructure & Orthoslice Volume Explorer
          </h3>
          <p className="text-sm text-slate-400 mt-0.5">{batch.subtitle}</p>
        </div>

        {/* 3-Way Batch Toggle */}
        <div className="flex flex-wrap items-center bg-slate-950 border border-slate-800 p-1.5 rounded-xl gap-1">
          <button
            onClick={() => setSelectedBatch("batch3")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedBatch === "batch3"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-950"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            Batch 3 (Baseline)
          </button>
          <button
            onClick={() => setSelectedBatch("batch2")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedBatch === "batch2"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            Batch 2 (Candidate)
          </button>
          <button
            onClick={() => setSelectedBatch("batch1")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedBatch === "batch1"
                ? "bg-rose-600 text-white shadow-md shadow-rose-950"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            Batch 1 (Defective)
          </button>
        </div>
      </div>

      {/* Main Grid: Isometric 3D + Orthoslices */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: 3D Isometric Cube */}
        <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300">
              3D Isometric Cube & Slicing Plane
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Rotation: {Math.round(((angle * 180) / Math.PI) % 360)}°
            </span>
          </div>

          <div
            className="relative flex-1 min-h-[300px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <canvas ref={canvasIsoRef} width={340} height={300} className="w-full h-full" />
            <div className="absolute bottom-2 left-2 bg-slate-900/90 border border-slate-800 rounded px-2 py-0.5 text-[10px] text-slate-400 pointer-events-none">
              Click & drag to rotate cube
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded ${
                  selectedBatch === "batch3"
                    ? "bg-cyan-400"
                    : selectedBatch === "batch2"
                    ? "bg-emerald-400"
                    : "bg-rose-400"
                }`}
              ></span>
              <span>Liquid Pores</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-slate-700"></span>
              <span>Graphite Matrix</span>
            </div>
          </div>
        </div>

        {/* Right Column: Depth Slider + 3 Orthoslices + Telemetry */}
        <div className="lg:col-span-7 space-y-5">
          {/* Z-Slider */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Through-Plane Depth Navigation
              </span>
              <span className="text-sm font-mono font-bold text-white">
                Z = {currentZ} µm / 28 µm
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="27"
              value={currentZ}
              onChange={(e) => setCurrentZ(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1.5 font-mono">
              <span>Z = 0 µm (Separator / Interface)</span>
              <span>Z = 28 µm (Current Collector Foil)</span>
            </div>
          </div>

          {/* 3 Orthogonal Cross-Sections */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* XY Cut */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col items-center">
              <span className="text-xs font-semibold text-slate-300 mb-2">XY In-Plane Slice</span>
              <div className="w-[140px] h-[140px] bg-slate-950 rounded border border-slate-800 overflow-hidden flex items-center justify-center">
                <canvas ref={canvasXYRef} width={140} height={140} />
              </div>
              <span className="text-[10px] text-slate-500 mt-2">Horizontal plane at Z</span>
            </div>

            {/* XZ Cut */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col items-center">
              <span className="text-xs font-semibold text-slate-300 mb-2">XZ Through-Plane Cut</span>
              <div className="w-[140px] h-[140px] bg-slate-950 rounded border border-slate-800 overflow-hidden flex items-center justify-center">
                <canvas ref={canvasXZRef} width={140} height={140} />
              </div>
              <span className="text-[10px] text-slate-500 mt-2">Vertical pore throats</span>
            </div>

            {/* YZ Cut */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col items-center">
              <span className="text-xs font-semibold text-slate-300 mb-2">YZ Transverse Cut</span>
              <div className="w-[140px] h-[140px] bg-slate-950 rounded border border-slate-800 overflow-hidden flex items-center justify-center">
                <canvas ref={canvasYZRef} width={140} height={140} />
              </div>
              <span className="text-[10px] text-slate-500 mt-2">Side cross-section</span>
            </div>
          </div>

          {/* KPI Dashboard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 block">Porosity (ε)</span>
              <span className="text-lg font-bold font-mono text-white">{batch.porosity}</span>
              <span className="text-[10px] text-slate-400 block">Total void</span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 block">Throat Width (Ly)</span>
              <span className="text-lg font-bold font-mono text-white">{batch.throat}</span>
              <span className="text-[10px] text-slate-400 block">Through-plane</span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 block">Tortuosity (<LatexFormula formula={"\\tau_z"} />)</span>
              <span
                className={`text-lg font-bold font-mono ${
                  selectedBatch === "batch1" ? "text-rose-400" : "text-cyan-400"
                }`}
              >
                {batch.tauZ}
              </span>
              <span className="text-[10px] text-slate-400 block">Through-plane</span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 block">MacMullin (<LatexFormula formula="N_M" />)</span>
              <span
                className={`text-lg font-bold font-mono ${
                  selectedBatch === "batch1" ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                {batch.macmullin}
              </span>
              <span className="text-[10px] text-slate-400 block">Resistance ratio</span>
            </div>
          </div>

          <div
            className={`border rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center justify-between ${batch.statusColor}`}
          >
            <span>Verdict: {batch.status}</span>
            <span className="font-mono text-[11px]">3D Anisotropy: {batch.aniso3D}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

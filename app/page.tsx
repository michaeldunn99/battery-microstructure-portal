import Image from "next/image";
import Interactive3DExplorer from "@/components/Interactive3DExplorer";
import TortuosityExplainer from "@/components/TortuosityExplainer";
import FeatureReductionGuide from "@/components/FeatureReductionGuide";

export default function Home() {
  return (
    <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-10 space-y-12">
      {/* Header & Hero */}
      <section className="space-y-4 border-b border-slate-800 pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800">
            Battery Microstructure QC Platform
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-800">
            Rudolf-Schwarz Holdings Ltd
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
            Modal Cloud A10G GPU Powered
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Battery Electrode Microstructure & Transport Portal
        </h1>
        <p className="text-base sm:text-lg text-slate-400 max-w-4xl leading-relaxed">
          Comprehensive characterization system for lithium-ion battery electrodes. Combining
          deterministic 2D cross-section SEM image analysis, 3D grain-boundary reconstruction, and
          true directional tortuosity solving on cloud GPUs to evaluate production batches and incoming
          candidate materials.
        </p>

        {/* Quick KPI Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 block font-medium">Batch 3 (Baseline)</span>
            <span className="text-2xl font-bold font-mono text-white mt-1 block">τ_z = 8.94</span>
            <span className="text-xs text-emerald-400 font-medium">Healthy open transport</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 block font-medium">Batch 2 (Candidate)</span>
            <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">τ_z = 10.57</span>
            <span className="text-xs text-cyan-400 font-medium">+1.84% Energy Density</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 block font-medium">Batch 1 (Defective)</span>
            <span className="text-2xl font-bold font-mono text-rose-400 mt-1 block">τ_z = 70.78</span>
            <span className="text-xs text-rose-400 font-medium">Choked / Plating hazard</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 block font-medium">Modal A10G Compute</span>
            <span className="text-2xl font-bold font-mono text-cyan-400 mt-1 block">13.85s</span>
            <span className="text-xs text-slate-400 font-medium">Parallel 3-batch tensor solve</span>
          </div>
        </div>
      </section>

      {/* 1. What is Tortuosity? Plain-English Beginner Guide */}
      <section id="tortuosity-guide">
        <TortuosityExplainer />
      </section>

      {/* 2. Feature Reduction: Avoiding Overfitting */}
      <section id="feature-reduction">
        <FeatureReductionGuide />
      </section>

      {/* 3. Interactive 3D Digital Twin & Orthoslice Explorer */}
      <section id="3d-explorer">
        <Interactive3DExplorer />
      </section>

      {/* 4. The 4-Step Preprocessing Pipeline */}
      <section id="preprocessing" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-xl">
        <div className="pb-4 border-b border-slate-800">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800">
            Standard Operating Procedure
          </span>
          <h3 className="text-xl lg:text-2xl font-bold text-white tracking-tight mt-1">
            Frozen 4-Step Preprocessing Pipeline
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Every image is preprocessed identically with fixed baseline calibration to eliminate instrumentation drift.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <span className="text-xs font-bold text-cyan-400 block">Step 1</span>
            <h4 className="text-sm font-bold text-white mt-1">Gaussian Denoising</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Fixed σ = 0.7 kernel removes high-frequency detector shot noise while preserving sharp grain boundaries.
            </p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <span className="text-xs font-bold text-cyan-400 block">Step 2</span>
            <h4 className="text-sm font-bold text-white mt-1">Directional Destriping</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Row-by-row moving median filter (window = 31) eliminates Broad Ion Beam (BIB) curtaining artifacts.
            </p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <span className="text-xs font-bold text-cyan-400 block">Step 3</span>
            <h4 className="text-sm font-bold text-white mt-1">Illumination Plane Flattening</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              2D polynomial plane subtraction on 256x256 grid tiles removes macroscopic detector tilt and vignetting.
            </p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <span className="text-xs font-bold text-cyan-400 block">Step 4</span>
            <h4 className="text-sm font-bold text-white mt-1">Fixed Quantile Rescaling</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Quantiles (0.1% and 99.9%) fitted once on Batch 3 baseline and frozen across all future candidate images.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Production Decision Matrix for Incoming Candidate Test Set */}
      <section id="decision-matrix" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-xl">
        <div className="pb-4 border-b border-slate-800">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
            Acceptance Protocol
          </span>
          <h3 className="text-xl lg:text-2xl font-bold text-white tracking-tight mt-1">
            Incoming Candidate Test Set Decision Matrix
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated criteria for evaluating unknown incoming candidate batches against Batch 3 baseline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-950/60 border border-emerald-500/20 rounded-xl p-5">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Outcome A</span>
            <h4 className="text-base font-bold text-white mt-1">ACCEPT & PROMOTE (Optimal)</h4>
            <ul className="text-xs text-slate-400 mt-3 space-y-1.5 list-disc list-inside">
              <li>Active loading ≥ 86.0% (p &lt; 0.05 boost)</li>
              <li>Through-plane throat ≥ 0.90 µm (p &gt; 0.05)</li>
              <li>3D tortuosity τ_z ≤ 12.0 (Modal A10G)</li>
              <li><strong>Result:</strong> Boosts cell capacity with zero plating risk.</li>
            </ul>
          </div>

          <div className="bg-slate-950/60 border border-slate-700 rounded-xl p-5">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">Outcome B</span>
            <h4 className="text-base font-bold text-white mt-1">PASS (Equivalent Standard)</h4>
            <ul className="text-xs text-slate-400 mt-3 space-y-1.5 list-disc list-inside">
              <li>All 5 core features match Batch 3 baseline</li>
              <li>No statistically significant deviations (p &gt; 0.05)</li>
              <li>3D tortuosity τ_z between 8.0 and 12.0</li>
              <li><strong>Result:</strong> Approved for direct production release.</li>
            </ul>
          </div>

          <div className="bg-slate-950/60 border border-rose-500/20 rounded-xl p-5">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">Outcome C</span>
            <h4 className="text-base font-bold text-white mt-1">REJECT (Manufacturing Defect)</h4>
            <ul className="text-xs text-slate-400 mt-3 space-y-1.5 list-disc list-inside">
              <li>Throat constricted &lt; 0.88 µm (p &lt; 0.05)</li>
              <li>Particle aspect ratio &gt; 1.35 (crushed flakes)</li>
              <li>Inclusion spatial variance &gt; 0.0080 (clumped)</li>
              <li>3D tortuosity τ_z &gt; 20.0 (electrolyte bottleneck)</li>
              <li><strong>Result:</strong> Reject roll; halt calender line for recalibration.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. Publication Visualizations Gallery */}
      <section id="gallery" className="space-y-6">
        <div>
          <h3 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            High-Resolution Microstructure Analytics Gallery
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Publication-grade figures generated from the multi-batch characterization dataset.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white">
                3D Microstructure & Orthoslice Tensor Visualization
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Orthoslice cube, 3D electrolyte highway, concentration field, and through-plane cross-sections.
              </p>
            </div>
            <div className="relative aspect-[3/2] w-full bg-slate-950">
              <Image
                src="/microstructure_3d_visualization.png"
                alt="3D Microstructure Visualization"
                fill
                className="object-contain"
              />
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white">
                Multi-Batch Morphological Quality Control Dashboard
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Porosity distributions, pore throat violin plots, aspect ratios, and inclusion spatial variance.
              </p>
            </div>
            <div className="relative aspect-[3/2] w-full bg-slate-950">
              <Image
                src="/batch_comparison_qc.png"
                alt="Batch Comparison QC Dashboard"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

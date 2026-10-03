import CorePhysicalFingerprintHero from "@/components/CorePhysicalFingerprintHero";
import MicrostructureFeatureTaxonomy from "@/components/MicrostructureFeatureTaxonomy";
import FeatureVectorGenesis from "@/components/FeatureVectorGenesis";
import ImageRepTheory from "@/components/ImageRepTheory";
import AppendixPixelIndicatorDerivation from "@/components/AppendixPixelIndicatorDerivation";
import ReferencesSection from "@/components/ReferencesSection";

export default function Home() {
  return (
    <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-10 space-y-12">
      {/* Streamlined Header */}
      <section className="space-y-3 border-b border-slate-800 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800">
            Battery Microstructure QC Platform
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-800">
            Rudolf-Schwarz Holdings Ltd
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
            Calibrated 0.020 µm/pixel SEM Cross-Sections
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Battery Electrode Microstructure Characterization
        </h1>
        <p className="text-base sm:text-lg text-slate-400 max-w-4xl leading-relaxed">
          Physics-grounded quality control for battery electrode manufacturing. We extract 
          interpretable physical descriptors from high-resolution cross-sectional SEM images, 
          map them through calibrated statistical pipelines, and evaluate their direct impact on 
          electrochemical battery performance.
        </p>
      </section>

      {/* 1. PRIMARY SECTION: Which Physical Features We Extracted, How We Mapped To Them, and Why */}
      <section id="core-factors">
        <CorePhysicalFingerprintHero />
      </section>

      {/* 2. Microstructure Feature Dictionary & Evidence Matrix */}
      <section id="taxonomy-matrix">
        <MicrostructureFeatureTaxonomy />
      </section>

      {/* 3. Feature Vector Genesis: Why Physical Metrics Over Black-Box Models */}
      <section id="feature-genesis">
        <FeatureVectorGenesis />
      </section>

      {/* 4. Dahari et al. (2025) ImageRep: Confidence Intervals & Representativity */}
      <section id="imagerep-theory">
        <ImageRepTheory />
      </section>

      {/* 5. Technical Appendix: Mathematical Definition & Provenance of the Binary Indicator Function */}
      <section id="appendix-indicator">
        <AppendixPixelIndicatorDerivation />
      </section>

      {/* 6. Scientific References & Literature Citations */}
      <section id="references">
        <ReferencesSection />
      </section>
    </main>
  );
}

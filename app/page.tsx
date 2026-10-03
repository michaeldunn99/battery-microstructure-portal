import CorePhysicalFingerprintHero from "@/components/CorePhysicalFingerprintHero";
import MicrostructureFeatureTaxonomy from "@/components/MicrostructureFeatureTaxonomy";
import FeatureVectorGenesis from "@/components/FeatureVectorGenesis";
import ImageRepTheory from "@/components/ImageRepTheory";
import AppendixPixelIndicatorDerivation from "@/components/AppendixPixelIndicatorDerivation";
import ReferencesSection from "@/components/ReferencesSection";

export default function Home() {
  return (
    <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-10 space-y-12">
      <section className="space-y-3 border-b border-zinc-200 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-md text-xs font-semibold bg-zinc-50 text-zinc-700 border border-zinc-200">
            2D microstructure analysis
          </span>
          <span className="px-3 py-1 rounded-md text-xs font-semibold bg-zinc-50 text-zinc-700 border border-zinc-200">
            Electrode cross-sections
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold text-zinc-950 tracking-tight">
          Electrode microstructure analysis
        </h1>
        <p className="text-base sm:text-lg text-zinc-600 max-w-4xl leading-relaxed">
          Physical measurements from SEM cross-sections, compared across batches. Each descriptor
          includes its definition, measurement method and interpretation.
        </p>
      </section>
      <section id="core-factors"><CorePhysicalFingerprintHero /></section>
      <section id="taxonomy-matrix"><MicrostructureFeatureTaxonomy /></section>
      <section id="feature-genesis"><FeatureVectorGenesis /></section>
      <section id="imagerep-theory"><ImageRepTheory /></section>
      <section id="appendix-indicator"><AppendixPixelIndicatorDerivation /></section>
      <section id="references"><ReferencesSection /></section>
    </main>
  );
}

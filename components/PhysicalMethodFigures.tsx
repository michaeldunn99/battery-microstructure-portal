export default function PhysicalMethodFigures() {
  return (
    <section className="space-y-6 rounded-md border border-zinc-200 bg-paper p-6 lg:p-8" aria-labelledby="physical-figures-heading">
      <div className="border-b border-zinc-200 pb-5">
        <h2 id="physical-figures-heading" className="text-2xl font-semibold tracking-tight">Physical analysis figures</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">Saved illustrations from the physical analysis: detector images, thresholding and segmentation sensitivity.</p>
      </div>
      <figure>
        <a href="/segmentation_batch1_demo.png" aria-label="Open full-resolution segmentation figure">
          <Image src="/segmentation_batch1_demo.png" width={3200} height={800} unoptimized className="h-auto w-full" alt="Raw BSE and Inlens crops followed by binary Otsu and three-class Multi-Otsu segmentation." />
        </a>
        <figcaption className="mt-3 text-sm leading-relaxed text-zinc-600"><strong className="font-semibold text-zinc-800">Fig. 1. Image-to-mask mapping.</strong> Raw BSE and Inlens images alongside binary and multi-level thresholding outputs. Click the figure to inspect the original.</figcaption>
      </figure>
      <figure className="border-t border-zinc-200 pt-6">
        <a href="/porosity_validation_dashboard.png" aria-label="Open full-resolution porosity sensitivity figure">
          <Image src="/porosity_validation_dashboard.png" width={3170} height={1742} unoptimized className="h-auto w-full" alt="Porosity example with raw BSE, intensity histogram, segmented mask, Inlens overlay, local profile and sensitivity to threshold selection." />
        </a>
        <figcaption className="mt-3 text-sm leading-relaxed text-zinc-600"><strong className="font-semibold text-zinc-800">Fig. 2. Porosity and threshold sensitivity.</strong> An illustrative field showing mask construction, detector comparison and the dependence of estimated porosity on threshold selection. The values describe this example, not the batch means.</figcaption>
      </figure>
      <details className="border-t border-zinc-200 pt-4">
        <summary className="cursor-pointer text-sm font-semibold text-zinc-800">Additional detector comparison</summary>
        <figure className="mt-4">
          <a href="/multimodal_detector_fusion.png" aria-label="Open full-resolution detector comparison">
            <Image src="/multimodal_detector_fusion.png" width={3491} height={2180} unoptimized className="h-auto w-full" alt="BSE, Inlens and ETD views with a combined image, example segmentation and detector intensity scatter plot." />
          </a>
          <figcaption className="mt-3 text-sm leading-relaxed text-zinc-600">Comparison of detector contrast and an example multi-detector segmentation. Phase names retain the assignments used in the original figure.</figcaption>
        </figure>
      </details>
    </section>
  );
}
import Image from "next/image";

import Image from "next/image";

function FullResolutionView({ src, width, height, alt, label }: {
  src: string;
  width: number;
  height: number;
  alt: string;
  label: string;
}) {
  return (
    <details className="mt-3 rounded-md border border-zinc-200">
      <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600">
        Inspect at full resolution
        <span className="sr-only">: {label}</span>
      </summary>
      <p className="px-4 pb-3 text-xs text-zinc-600">Scroll within the image to inspect details.</p>
      <div role="region" aria-label={`${label}, full-resolution image`} tabIndex={0} className="max-h-[70vh] overflow-auto border-t border-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600">
        <Image src={src} width={width} height={height} unoptimized className="h-auto w-auto max-w-none" alt={alt} />
      </div>
    </details>
  );
}

export default function PhysicalMethodFigures() {
  return (
    <details id="preprocessing-figures" className="scroll-mt-6 rounded-md border border-zinc-200">
      <summary className="cursor-pointer p-4 text-sm font-semibold text-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">Preprocessing figures</summary>
      <div className="space-y-6 border-t border-zinc-200 p-4">
      <figure>
        <Image src="/segmentation_batch1_demo.png" width={3200} height={800} unoptimized className="h-auto w-full" alt="Raw BSE and Inlens crops followed by binary Otsu and three-class Multi-Otsu segmentation." />
        <FullResolutionView src="/segmentation_batch1_demo.png" width={3200} height={800} label="Fig. 1. Image-to-mask mapping" alt="Full-resolution raw BSE and Inlens crops alongside binary Otsu and three-class Multi-Otsu segmentation." />
        <figcaption className="mt-3 text-sm leading-relaxed text-zinc-600"><strong className="font-semibold text-zinc-800">Fig. 1. Image-to-mask mapping.</strong> Raw BSE and Inlens images alongside binary and multi-level thresholding outputs.</figcaption>
      </figure>
      <figure className="border-t border-zinc-200 pt-6">
        <Image src="/porosity_validation_dashboard.png" width={3170} height={1742} unoptimized className="h-auto w-full" alt="Porosity example with raw BSE, intensity histogram, segmented mask, Inlens overlay, local profile and sensitivity to threshold selection." />
        <FullResolutionView src="/porosity_validation_dashboard.png" width={3170} height={1742} label="Fig. 2. Porosity and threshold sensitivity" alt="Full-resolution porosity example with raw BSE, intensity histogram, segmented mask, Inlens overlay, local profile and threshold sensitivity." />
        <figcaption className="mt-3 text-sm leading-relaxed text-zinc-600"><strong className="font-semibold text-zinc-800">Fig. 2. Porosity and threshold sensitivity.</strong> An illustrative field showing mask construction, detector comparison and the dependence of estimated porosity on threshold selection. The values describe this example, not the batch means.</figcaption>
      </figure>
      <details className="border-t border-zinc-200 pt-4">
        <summary className="cursor-pointer text-sm font-semibold text-zinc-800">Additional detector comparison</summary>
        <figure className="mt-4">
          <Image src="/multimodal_detector_fusion.png" width={3491} height={2180} unoptimized className="h-auto w-full" alt="BSE, Inlens and ETD views with a combined image, example segmentation and detector intensity scatter plot." />
          <FullResolutionView src="/multimodal_detector_fusion.png" width={3491} height={2180} label="Additional detector comparison" alt="Full-resolution BSE, Inlens and ETD views with a combined image, example segmentation and detector intensity scatter plot." />
          <figcaption className="mt-3 text-sm leading-relaxed text-zinc-600">Comparison of detector contrast and an example multi-detector segmentation. Phase names retain the assignments used in the original figure.</figcaption>
        </figure>
      </details>
      </div>
    </details>
  );
}

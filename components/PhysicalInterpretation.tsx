import LatexFormula from "./LatexFormula";

const families = [
  {
    id: "phase-fractions",
    title: "Phase area fractions",
    label: "(a)",
    measurements: "Pore, graphite, carbon-binder and silicon particle area fractions.",
    performance: "The balance of active material, pore space and conductive material affects how much charge an electrode can store and how ions and electrons reach reaction sites. In a liquid-electrolyte electrode, pore space accommodates the ionic conductor, while solid active material supplies storage sites. More porosity is therefore not automatically better: transport and active-material loading must both be considered.",
    definition: "A phase is a distinct material or pore region, such as graphite or void space. Its area fraction is the percentage of the image assigned to it.",
    meaning: "An electrode contains solid material and void space. In a conventional liquid-electrolyte cell, electrolyte in the pores carries ions; active material stores lithium; conductive carbon provides electronic connections. Area fractions describe how much of each assigned region is visible in a cross-section. The project lead identifies the silicon particles as silicon active material; their area fraction is not silicon weight fraction.",
    terms: [
      ["Phase", "A distinguishable constituent or region. Here, phase names are interpretations of image-intensity classes, rather than independently confirmed chemical identities."],
      ["Area fraction", "The share of the analysed two-dimensional image assigned to a region. It is not a mass fraction or a directly measured three-dimensional volume fraction."],
      ["Porosity", "The area fraction assigned to pore space in this report."],
      ["Carbon-binder domain (CBD)", "Conductive carbon and polymer binder associated with particle contacts. Our CBD value is an intensity-based allocation within the dark mask."],
    ],
    evidence: [
      ["#ref-moon", "Moon et al. (2021)", "Silicon expansion and electrochemical–mechanical interactions affect degradation in silicon–graphite composites, motivating separate tracking of silicon content."],
      ["#ref-zielke", "Zielke et al. (2015)", "In reconstructed LiCoO₂ cathodes, pore space, active material and carbon-binder regions serve distinct ionic transport, lithium-storage and electronic transport roles. Including carbon-binder nanoporosity changed the calculated ionic conduction."],
      ["#ref-choi", "Choi et al. (2023)", "Experiments with graphite particle-size mixtures linked changes in packing and porosity with changes in electrochemical behaviour."],
    ],
    evidenceScope: "These studies motivate measuring phase proportions. They do not validate our image-intensity labels, CBD allocation or a batch acceptance threshold.",
    calculation: "Retain the central 80% of image rows and smooth both detector images with a Gaussian filter (σ = 1 pixel). Three-class Multi-Otsu fits two thresholds, T₁ and T₂, separately to each smoothed BSE image. Only BSE defines the three main masks; the paired Inlens image subdivides the pore-labelled mask. The assignment rule stays fixed across batches; the threshold values can change between images.",
    formula: String.raw`f_k = 100\,\frac{N_k}{N_{\mathrm{crop}}}\;[\%]`,
    boundary: "Pore, graphite and silicon particle fractions sum to 100%. CBD is a subset of the pore-labelled area, so adding it again would double count. The median split has not been independently calibrated as a binder measurement.",
    calculationLink: "#extractor-L113",
  },
  {
    id: "pore-geometry",
    title: "Pore structure",
    label: "(b)",
    measurements: "Correlation length scale, horizontal and vertical pore chords, and chord anisotropy.",
    performance: "Ion transport depends on how pore space is arranged and connected, not only on its amount. Direction-dependent pathways can produce different transport resistance through the electrode thickness and along its plane, affecting rate capability. Our chords describe visible directional geometry; they do not measure transport resistance or tortuosity. The correlation scale characterises spatial organisation and representativity, rather than providing a direct performance score.",
    definition: "The scale and directional organisation of the empty regions visible between solid material.",
    meaning: "The pore network provides space for electrolyte. Its geometry affects how ions can move through an electrode. We describe the patterns visible in a cross-section, including whether pore runs are longer horizontally or vertically.",
    terms: [
      ["Chord length", "The length of an uninterrupted straight segment through a pore in the image. It describes a line through the void, not a pore diameter or a three-dimensional throat."],
      ["Anisotropy", "A difference with direction. Here it is the ratio of mean horizontal to mean vertical pore chord length."],
      ["Correlation length", "A spatial scale derived from how pore labels co-vary at separated positions. It is distinct from the mean chord length."],
      ["Tortuosity", "The transport penalty associated with the geometry of connected paths. It is not measured by this two-dimensional analysis."],
    ],
    evidence: [
      ["#ref-otero", "Otero et al. (2018)", "An analytical composite-electrode model identifies initial porosity and expansion tolerance as design factors. It does not validate our pore chords as a measure of silicon expansion."],
      ["#ref-ebner", "Ebner et al. (2014)", "Tomography and diffusion simulations linked particle shape and alignment to direction-dependent tortuosity, showing why transport cannot be described by porosity alone."],
      ["#ref-mitsch", "Mitsch et al. (2014)", "Graphite-anode tomography found different tortuosity and surface area in aged and pristine material despite similar porosity."],
      ["#ref-dahari", "Dahari et al. (2025)", "The two-point correlation function was used to estimate phase-fraction representativity. This supports our correlation length and porosity interval, rather than a direct performance prediction."],
    ],
    evidenceScope: "The transport studies motivate measuring pore geometry. They do not establish that our two-dimensional chord lengths or chord ratio measure tortuosity or predict rate capability.",
    calculation: "On the pore mask, measure uninterrupted runs along every 40th row and column. Multiply pixel lengths by 0.025 µm/pixel and take the mean in each direction. Divide the horizontal mean by the vertical mean. ImageRep separately calculates the correlation length scale from the same mask.",
    formula: String.raw`L_x=s\,\overline{\ell_x},\qquad L_y=s\,\overline{\ell_y},\qquad R=L_x/L_y`,
    boundary: "A longer chord does not establish better transport. These measurements do not recover three-dimensional connectivity or tortuosity. Interpreting image x and y as electrode directions requires known specimen orientation.",
    calculationLink: "#extractor-L137",
  },
  {
    id: "inclusion-geometry",
    title: "Silicon particle size and shape",
    label: "(c)",
    measurements: "Silicon particle aspect ratio and equivalent-diameter percentiles D10, D50 and D90.",
    performance: "The size and shape of identified electrode particles can affect packing and pore geometry, with consequences for transport. Silicon particle size has been linked to degradation in silicon–graphite anodes. Our size and shape measurements describe the segmented regions, not their cycling performance.",
    definition: "The dimensions and elongation of connected silicon particle regions in the image.",
    meaning: "A silicon particle region is a connected component of the bright mask. Size and shape measurements describe this population so that batches can be compared even when their total bright area is similar. Here they are interpreted as silicon using the project lead’s identification, rather than brightness alone.",
    terms: [
      ["Equivalent diameter", "The diameter of a circle with the same area as a segmented region."],
      ["D10, D50 and D90", "The diameters below which 10%, 50% and 90% of the measured objects fall. Every retained object contributes one observation."],
      ["Aspect ratio", "The major-axis length divided by the minor-axis length of an ellipse fitted to an object's shape. Larger values indicate more elongated regions."],
    ],
    evidence: [
      ["#ref-moon", "Moon et al. (2021)", "Silicon particle size and graphite hardness affected degradation in silicon–graphite anodes; this supports distinguishing silicon-region size from graphite-particle size."],
      ["#ref-choi", "Choi et al. (2023)", "Changing the size distribution of identified graphite particles altered packing, porosity and electrochemical behaviour in fabricated anodes."],
      ["#ref-ebner", "Ebner et al. (2014)", "Particle shape and fabrication-induced alignment were linked to directional tortuosity using tomography and diffusion simulations."],
    ],
    evidenceScope: "Silicon size may be relevant to degradation, but our 2D regions may contain merged particles. Silicon aspect ratio remains exploratory; no performance or damage threshold is established.",
    calculation: "Label connected components in the bright mask and retain components of at least 10 pixels. Convert their areas to equivalent-circle diameters and calculate unweighted diameter percentiles. Average major-axis/minor-axis ratios, with a one-pixel minimum denominator and zero minor axes excluded.",
    formula: String.raw`d_{\mathrm{eq}}=s\sqrt{\frac{4A}{\pi}},\qquad \overline{A_r}=\operatorname{mean}\!\left(\frac{a}{\max(b,1)}\right)`,
    boundary: "A is component area in pixels; a and b are ellipse axes in pixels. These objects are not separated by watershed, so touching regions may form one component. No defect threshold is inferred from their geometry.",
    calculationLink: "#extractor-L152",
  },
  {
    id: "spatial-variation",
    title: "Silicon particle spatial variation",
    label: "(d)",
    measurements: "Standard deviation of local silicon particle area fractions across 16 image regions.",
    performance: "Spatially uneven electrode microstructure can create local differences in transport and reaction conditions, so equal average composition does not guarantee equal electrochemical behaviour. Our statistic asks whether silicon coverage is uniform across an image. It is a screening measurement of heterogeneity, not a validated predictor of current distribution, capacity or a mixing defect.",
    definition: "How unevenly silicon particles is distributed across different parts of an image.",
    meaning: "Two cross-sections can contain the same overall silicon particle fraction but distribute it differently: one relatively evenly, the other in concentrated regions. A spatial measurement captures this difference in local silicon coverage. It does not measure binder distribution or identify why clustering occurred.",
    terms: [
      ["Local area fraction", "The percentage of one image region occupied by the silicon particle mask."],
      ["Spatial variation", "Differences in local area fraction between regions. This describes uneven coverage, rather than uncertainty in the overall mean."],
      ["Percentage points", "The units of differences between percentages. Variation from 5% to 8% is a difference of 3 percentage points."],
    ],
    evidence: [
      ["#ref-cabello", "Cabello et al. (2020)", "Wet ball milling conditions affected silicon agglomeration and distribution. This motivates examining silicon coverage, but does not validate our 4 × 4 statistic as a processing diagnosis."],
      ["#ref-muller", "Müller et al. (2018)", "Tomography and electrochemical simulations of commercial graphite anodes showed uneven current distributions and higher local overpotentials in heterogeneous structures compared with a more uniform comparison."],
    ],
    evidenceScope: "This supports examining spatial heterogeneity. It does not validate our 4 × 4 silicon-particle statistic as a predictor of current distribution, capacity, mixing defects or failure.",
    calculation: "Divide the silicon particle mask into 4 × 4 tiles. Compute the silicon particle area percentage in each tile, then take the population standard deviation of the 16 percentages (ddof = 0).",
    formula: String.raw`\sigma_{\mathrm{inc}}=\sqrt{\frac{1}{16}\sum_{j=1}^{16}(f_j-\overline f)^2}`,
    boundary: "This value depends on the tile size, image crop and segmentation. Higher variation indicates less uniform local coverage at that scale; it does not identify the manufacturing cause.",
    calculationLink: "#extractor-L166",
  },
] as const;

const linkStyle = "text-zinc-900 underline underline-offset-4";
const summaryStyle = "cursor-pointer py-2 text-sm font-medium text-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4";

export default function PhysicalInterpretation() {
  return (
    <section aria-labelledby="physical-interpretation-heading" className="space-y-6 rounded-md border border-zinc-200 bg-paper p-6 lg:p-8">
      <div className="space-y-2 border-b border-zinc-200 pb-5">
        <h2 id="physical-interpretation-heading" className="text-2xl font-semibold tracking-tight text-zinc-950 lg:text-3xl">2. Physical interpretation and glossary</h2>
        <p className="max-w-4xl text-sm leading-6 text-zinc-600">What the electrode characteristics mean, why we measured them, and how each measurement was obtained.</p>
      </div>
      <div className="max-w-4xl space-y-3 text-sm leading-7 text-zinc-600">
        <h3 className="text-lg font-semibold text-zinc-900">Overall rationale</h3>
        <p>A single number such as porosity cannot fully describe an electrode, because microstructure can change in ways one measure misses. The current report covers phase composition, pore organisation, silicon particle size and shape, and silicon particle spatial variation. These complementary families target different aspects of the microstructure (our interpretation).</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>2D estimates of 3D properties can be biased and orientation-dependent. Tortuosity and 3D connectivity cannot be recovered reliably from these sections. Compare batches in the same orientation (our interpretation). <a href="#ref-taiwo" className={linkStyle}>Taiwo et al.</a></li>
          <li>Representativity is property-specific: an image representative for phase fraction need not be representative for interface. <a href="#ref-dahari" className={linkStyle}>Dahari et al.</a></li>
          <li>Uncertainty estimates assume perfect segmentation; segmentation error can exceed finite-image sampling error. <a href="#ref-dahari" className={linkStyle}>Dahari et al.</a></li>
        </ul>
      </div>
      <div className="divide-y divide-zinc-200">
        {families.map((family) => (
          <article id={family.id} key={family.id} className="min-w-0 scroll-mt-6 py-5 first:pt-0 last:pb-0">
            <h3 className="text-lg font-semibold text-zinc-900">{family.label} {family.title}</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600">{family.definition}</p>
            <p className="mb-3 mt-2 text-xs leading-6 text-zinc-500">{family.measurements}</p>
            <details className="border-t border-zinc-200">
              <summary className={summaryStyle}>Physical meaning</summary>
              <div className="max-w-4xl space-y-4 pb-4 text-sm leading-6 text-zinc-600">
                <p>{family.meaning}</p>
                <dl className="space-y-3">{family.terms.map(([term, meaning]) => <div key={term}><dt className="font-semibold text-zinc-800">{term}</dt><dd>{meaning}</dd></div>)}</dl>
              </div>
            </details>
            <details className="border-t border-zinc-200">
              <summary className={summaryStyle}>Relevance to electrode performance</summary>
              <div className="max-w-4xl space-y-4 pb-4 text-sm leading-6 text-zinc-600">
                <p>{family.performance}</p>
                <div className="space-y-2 border-t border-zinc-200 pt-3">
                  <h4 className="font-semibold text-zinc-800">Literature basis</h4>
                  {family.evidence.map(([href, label, finding]) => <p key={href}>{finding} <a className={linkStyle} href={href}>{label}</a>.</p>)}
                  <p><span className="font-semibold text-zinc-800">Scope for this analysis:</span> {family.evidenceScope}</p>
                </div>
              </div>
            </details>
            <details className="border-t border-zinc-200">
              <summary className={summaryStyle}>{family.id === "phase-fractions" ? "How we defined and measured each phase" : "How we calculated it"}</summary>
              <div className="max-w-4xl space-y-4 pb-2 text-sm leading-6 text-zinc-600">
                <p>{family.calculation}</p>
                {family.id === "phase-fractions" && <>
                  <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Phase assignment rules">
                    <table className="w-full min-w-[480px] border-collapse text-left text-sm">
                      <caption className="sr-only">Operational definitions of the image regions used for area fractions.</caption>
                      <thead className="border-y border-zinc-200 text-zinc-800"><tr><th scope="col" className="py-2 pr-4 font-medium">Reported region</th><th scope="col" className="py-2 font-medium">Pixel assignment</th></tr></thead>
                      <tbody className="divide-y divide-zinc-200 border-b border-zinc-200">
                        <tr><th scope="row" className="py-2 pr-4 font-medium">Pore-labelled area</th><td className="py-2">BSE intensity below T₁.</td></tr>
                        <tr><th scope="row" className="py-2 pr-4 font-medium">Graphite-labelled matrix</th><td className="py-2">BSE intensity at least T₁ and below T₂.</td></tr>
                        <tr><th scope="row" className="py-2 pr-4 font-medium">Silicon particles</th><td className="py-2">BSE intensity at least T₂; identified as silicon by the project lead; not chemically verified by this intensity rule.</td></tr>
                        <tr><th scope="row" className="py-2 pr-4 font-medium">Carbon-binder allocation</th><td className="py-2">Within the pore-labelled area, Inlens intensity above its median. Pixels at or below that median form the open-pore subset.</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <p>For every reported region, divide its pixel count by the full cropped image area and multiply by 100. Reported porosity uses the entire dark BSE mask, including the CBD allocation; it does not use only the open-pore subset.</p>
                </>}
                <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={`${family.title} calculation`}><LatexFormula formula={family.formula} displayMode /></div>
                <p>{family.boundary}</p>
                {family.id === "inclusion-geometry" && <p>The geometric definitions follow the <a className={linkStyle} href="#ref-regionprops">region measurement definitions</a> in scikit-image.</p>}
                <a className={linkStyle} href={family.calculationLink}>View calculation code</a>
              </div>
            </details>
          </article>
        ))}
      </div>
      <p className="text-sm leading-6 text-zinc-600">These four families contain 13 physical descriptors. Porosity uncertainty is reported alongside them as information about measurement precision. <a className={linkStyle} href="#ref-taiwo">Taiwo et al. (2016)</a> explain why two-dimensional sections cannot resolve all three-dimensional geometry and connectivity.</p>
    </section>
  );
}

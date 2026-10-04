# Website link audit

## Before consolidation

Audit date: 4 October 2026. This inventory records the website before the inline-method consolidation. It covers the active homepage, all five physical-interpretation tabs, the additional-figure disclosure, and the `/method` page. Unmounted legacy components are excluded. Images without an enclosing link, buttons, and browser developer controls are not links.

The homepage rendered **49 anchor elements with 31 distinct literal hrefs** in its default tab. The other four tabs add one distinct destination, the NumPy standard-deviation reference, for **32 homepage destinations** across all tab states. The method page rendered **15 anchors with 13 distinct hrefs**. Across both pages and all tab states there were **43 distinct literal hrefs**: 11 local URLs, 27 GitHub URLs and five other external URLs. The PubMed URLs with and without a trailing slash are counted separately, although they identify the same article.

### 1. Local links: 11 destinations

| # | Exact href | Visible label or accessible name | Location and purpose |
| --- | --- | --- | --- |
| 1 | `/method` | Full method; Read the method and calculation code | Homepage Methods example and Reproducibility. Two links leave the report for its detailed procedure. |
| 2 | `/` | Back to analysis | Method-page navigation. |
| 3 | `/downloads/physical-method.md` | Download method (Markdown) | Method-page navigation; canonical procedure download. |
| 4 | `/downloads/extract_physical_features.py` | Download the extractor; Download Python script | Homepage Reproducibility and method-page extraction-script panel. |
| 5 | `/physical-feature-vector.tex` | Download LaTeX | Feature-vector caption. |
| 6 | `/physical_feature_vectors.csv` | Download vector CSV; Download values (CSV); Physical feature vectors (CSV) | Methods example, Physical interpretation header and Results footer. Same file under three labels; only the first two links have a `download` attribute. |
| 7 | `/qc_summary_report.json` | Physical summary (JSON) | Results footer; summary data. |
| 8 | `/qc_dataset_features.csv` | Full-precision measurements (CSV) | Results footer; full-precision physical measurements. |
| 9 | `/segmentation_batch1_demo.png` | Open full-resolution segmentation figure | Figure 1 image link; leaves the page to open the PNG. |
| 10 | `/porosity_validation_dashboard.png` | Open full-resolution porosity sensitivity figure | Figure 2 image link; leaves the page to open the PNG. |
| 11 | `/multimodal_detector_fusion.png` | Open full-resolution detector comparison | Image link inside Additional detector comparison; leaves the page to open the PNG. |

### 2. Archived calculation source: 15 destinations

The following links target the same archived calculation file with different line fragments. Feature definitions use the label **Source**. Physical-interpretation panels also use **Source**, with a destination selected by the active tab.

| # | Exact href | Label and location | Calculation identified |
| --- | --- | --- | --- |
| 12 | `https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/provenance/extract_physical_run.py` | extraction code in From image to vector; Source code in anisotropy example | Entire archived calculation file. |
| 13 | `https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/provenance/extract_physical_run.py#L47` | Source in pore-area interpretation tab | Central crop. |
| 14 | `https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/provenance/extract_physical_run.py#L61` | Source for carbon-binder allocation | Inlens median within pore mask. |
| 15 | `https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/provenance/extract_physical_run.py#L70` | Source for pore area fraction | Pore-mask mean. |
| 16 | `https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/provenance/extract_physical_run.py#L73` | Source for graphite area fraction | Matrix-mask mean. |
| 17 | `https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/provenance/extract_physical_run.py#L74` | Source for inclusion area fraction | Inclusion-mask mean. |
| 18 | `https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/provenance/extract_physical_run.py#L77` | Source for porosity uncertainty and characteristic length; Source in correlation/chord tab | ImageRep call and adjacent outputs. |
| 19 | `https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/provenance/extract_physical_run.py#L84` | Source for vertical pore chord length | Column scans. |
| 20 | `https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/provenance/extract_physical_run.py#L90` | Source for horizontal pore chord length | Row scans. |
| 21 | `https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/provenance/extract_physical_run.py#L98` | Source for pore anisotropy | Horizontal/vertical mean-chord ratio. |
| 22 | `https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/provenance/extract_physical_run.py#L105` | Source for inclusion aspect ratio; Source in size and aspect-ratio tabs | Start of component morphometry. |
| 23 | `https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/provenance/extract_physical_run.py#L110` | Source for inclusion diameter D10 | Equivalent diameters; D10 itself is calculated at line 114. |
| 24 | `https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/provenance/extract_physical_run.py#L115` | Source for inclusion diameter D50 | Median diameter. |
| 25 | `https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/provenance/extract_physical_run.py#L116` | Source for inclusion diameter D90 | 90th-percentile diameter. |
| 26 | `https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/provenance/extract_physical_run.py#L120` | Source for inclusion spatial variation; Source in spatial-variation tab | Four-by-four tile calculation. |

### 3. Current extraction script: six destinations

These occur in the canonical method rendered on `/method`, rather than the homepage's archived-source links.

| # | Exact href | Label | Purpose |
| --- | --- | --- | --- |
| 27 | `https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/extract_physical_features.py` | extraction code; Extraction code | Full standalone extractor, linked twice in the method. |
| 28 | `https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/extract_physical_features.py#L70` | image preparation and thresholding | Start of single-image extraction function. |
| 29 | `https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/extract_physical_features.py#L113` | mask definitions | Phase masks. |
| 30 | `https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/extract_physical_features.py#L129` | uncertainty calculation | ImageRep call. |
| 31 | `https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/extract_physical_features.py#L137` | chord and component calculations | Start of pore-chord scans; component calculation follows. |
| 32 | `https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/extract_physical_features.py#L166` | dispersion calculation | Four-by-four spatial grid. |

### 4. GitHub data and records: six destinations

| # | Exact href | Label and location | Purpose |
| --- | --- | --- | --- |
| 33 | `https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/public/physical_feature_vectors.csv#L2` | physical export in feature-table caption | Example row in rounded vector CSV. |
| 34 | `https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/public/physical_feature_vectors.csv` | feature CSV in method introduction; Feature data in method footer | Same rounded CSV already offered as a local download. |
| 35 | `https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/public/qc_dataset_features.csv#L2` | Data in every feature-definition row, repeated 14 times | Same complete example row for all 14 entries. |
| 36 | `https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/public/qc_dataset_features.csv` | Data in each interpretation tab; Full-precision results in method footer | Same full-precision CSV already offered locally. |
| 37 | `https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/validation/physical-rerun.json` | validation record in method Reproducibility | Parameters, dependency versions, input hashes and rerun comparison. |
| 38 | `https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/provenance/README.md` | Calculation archive in method footer | Archive explanation, separate from the current runnable extractor. |

### 5. External methodological references: five literal destinations

| # | Exact href | Label and location | Purpose |
| --- | --- | --- | --- |
| 39 | `https://scikit-image.org/docs/stable/auto_examples/segmentation/plot_multiotsu.html` | Multi-Otsu in Method references | Segmentation documentation. |
| 40 | `https://scikit-image.org/docs/stable/api/skimage.measure.html#skimage.measure.regionprops` | Region measurements in Method references; Method reference ↗ in size and aspect-ratio tabs | Component geometry documentation. |
| 41 | `https://pubmed.ncbi.nlm.nih.gov/40697175/` | Dahari et al. (2025) in Method references | ImageRep article. |
| 42 | `https://pubmed.ncbi.nlm.nih.gov/40697175` | Method reference ↗ in pore-area and correlation/chord tabs | The same ImageRep article, without a trailing slash. |
| 43 | `https://numpy.org/doc/stable/reference/generated/numpy.std.html` | Method reference ↗ in spatial-variation tab | Definition of population standard deviation. |

### Findings and checks

- The active homepage tree is `app/page.tsx` → `PhysicalFeatureVector`, `CorePhysicalFingerprintHero`, `PhysicalMethodFigures`, and `PhysicalResults` → `PhysicalTableExplorer`. The layout and table explorer add no links. The separate method page renders `PHYSICAL_METHOD.md` and `ExtractorCodeViewer`.
- The main problem is duplicated navigation and indistinct labels. Fourteen identical **Data** links leave the page to show the same CSV row. **Source** may lead to any of 14 archived line locations, while the separate method links to the current extractor. The same vector download has three labels, and the same measurements are linked both locally and through GitHub.
- Methodological explanation, code, raw data, downloads and citations are mixed together. Internal report content can be inline and expandable. External references can remain ordinary citations, while file downloads can be grouped once.
- All 11 local destinations returned HTTP 200 from `http://localhost:3000` during this audit. All seven linked static files exist under `public`. The two download routes serve canonical local files. These checks do not establish the state of any deployed website.
- All linked repository files exist locally. Every numbered source anchor exists in its corresponding file. No out-of-range source anchor was found. Some are broad section starts rather than exact expressions: pore interpretation points to the crop, D10 points to equivalent diameters, and image preparation points to the extraction function declaration.
- Third-party availability and GitHub response status were not checked in this audit. Source anchors were checked against the local files corresponding to the pushed implementation.
- Existing application routes before consolidation: `/`, `/method`, and `/downloads/[file]`, with downloads restricted to `physical-method.md` and `extract_physical_features.py`. Static public assets are separate from application routes.

## After consolidation

Audit date: 4 October 2026. This section records the final glossary and uncertainty presentation, superseding the intermediate inline-method layout.

The report is a single page, ordered **Abstract → Introduction → Physical interpretation and glossary → Methods → Results → Discussion → Reproducibility → References**. The glossary has four full-width entries, labelled (a) to (d) for the broad physical groups. Each has separate **Physical meaning**, **Relevance to electrode performance** and **How we calculated it** disclosures. Individual descriptor definitions do not have letter labels. The worked chord-ratio example has been removed. The single Methods section presents a **13-dimensional physical descriptor vector** and reports its porosity uncertainty separately. The unchanged CSV measurement record retains all 14 numerical fields.

The final rendered page contains **58 anchor elements with 48 distinct literal hrefs**: **28 locations in the same report, seven file downloads and 13 external destinations**. The external destinations comprise 12 centrally listed references and one project repository. There are no report links to a separate methods page, raw image page, archived calculation file or GitHub data viewer. The old `/method` route redirects to `/#image-preparation` for compatibility. The increased number of citations reflects the expanded physical glossary; report explanation and calculation navigation stay on the same page.

### Final link inventory: 48 destinations

The inventory includes links inside every collapsed disclosure. There are no interpretation-tab states in the current layout.

#### Inline literature references: 10 destinations

| # | Exact href | Visible label | Location and purpose |
| --- | --- | --- | --- |
| 1 | `#ref-zielke` | Zielke et al. (2015) | Phase area fractions: Relevance to electrode performance. Opens the corresponding item in the inline References disclosure. |
| 2 | `#ref-choi` | Choi et al. (2023) | Phase area fractions and Inclusion size and shape: Relevance to electrode performance. Opens the corresponding item in the inline References disclosure. |
| 3 | `#ref-ebner` | Ebner et al. (2014) | Pore structure and Inclusion size and shape: Relevance to electrode performance. Opens the corresponding item in the inline References disclosure. |
| 4 | `#ref-dahari` | Dahari et al. (2025) | Pore structure: Relevance to electrode performance; Methods: Porosity uncertainty. Opens the corresponding item in the inline References disclosure. |
| 5 | `#ref-mitsch` | Mitsch et al. (2014) | Pore structure: Relevance to electrode performance. Opens the corresponding item in the inline References disclosure. |
| 6 | `#ref-regionprops` | region measurement definitions | Inclusion size and shape: How we calculated it. Supports geometric definitions, not an electrode-performance claim. Opens the corresponding item in the inline References disclosure. |
| 7 | `#ref-muller` | Müller et al. (2018) | Inclusion spatial variation: Relevance to electrode performance. Opens the corresponding item in the inline References disclosure. |
| 8 | `#ref-taiwo` | Taiwo et al. (2016) | Glossary closing note on two-dimensional measurement scope. Opens the corresponding item in the inline References disclosure. |
| 9 | `#ref-kelly` | Kelly (2007) | Methods: Porosity uncertainty. Opens the corresponding item in the inline References disclosure. |
| 10 | `#ref-polaron` | Polaron's solid-state electrode case study | Discussion: Scope relative to published electrode analyses. Opens the corresponding item in the inline References disclosure. |

#### Inline code and measurements: 18 destinations

| # | Exact href | Visible label | Location and purpose |
| --- | --- | --- | --- |
| 11 | `#extractor-L70` | image preparation and thresholding | Image preparation disclosure. Opens the single-image extraction function. |
| 12 | `#extractor-L113` | View calculation code; mask definitions | Phase-fraction calculation disclosure and image preparation disclosure. Opens phase masks. |
| 13 | `#extractor-L118` | Calculation | Carbon-binder allocation definition. Opens the Inlens median and CBD allocation. |
| 14 | `#extractor-L123` | Calculation | Pore-area fraction definition. Opens the pore-mask mean. |
| 15 | `#extractor-L124` | Calculation | Graphite area-fraction definition. Opens the matrix-mask mean. |
| 16 | `#extractor-L126` | Calculation | Inclusion area-fraction definition. Opens the inclusion-mask mean. |
| 17 | `#extractor-L129` | Calculation; Porosity uncertainty calculation; uncertainty calculation | Correlation-scale definition, Porosity uncertainty and feature-calculation disclosures. Opens the ImageRep call. |
| 18 | `#extractor-L137` | View calculation code; Calculation; chord and component calculations | Pore-structure calculation disclosure, vertical-chord definition and feature-calculation disclosure. Opens column scans. |
| 19 | `#extractor-L142` | Calculation | Horizontal-chord definition. Opens row scans. |
| 20 | `#extractor-L149` | Calculation | Pore-anisotropy definition. Opens the horizontal/vertical mean-chord ratio. |
| 21 | `#extractor-L152` | View calculation code | Inclusion-geometry calculation disclosure. Opens component labelling and measurements. |
| 22 | `#extractor-L155` | Calculation | Inclusion-aspect-ratio definition. Opens the axis-ratio calculation. |
| 23 | `#extractor-L162` | Calculation | Inclusion D10 definition. Opens the tenth percentile. |
| 24 | `#extractor-L163` | Calculation | Inclusion D50 definition. Opens the median. |
| 25 | `#extractor-L164` | Calculation | Inclusion D90 definition. Opens the ninetieth percentile. |
| 26 | `#extractor-L166` | View calculation code; Calculation; dispersion calculation | Spatial-variation calculation disclosure, descriptor definition and feature-calculation disclosure. Opens four-by-four tile measurements. |
| 27 | `#extractor` | extraction code | Test-set procedure. Opens the complete inline script. |
| 28 | `#sample-measurements` | saved measurements | Descriptor-table caption. Opens the sample explorer in Results. |

Each descriptor-row Calculation link also has an accessible label naming its descriptor. Code links reveal the Calculation code disclosure and scroll to the numbered source line. The saved-measurements link reveals the Results explorer.

#### Downloads: seven destinations

All downloads are offered once in **Downloads and repository**, and all seven links explicitly have a `download` attribute.

| # | Exact href | Visible label | Contents |
| --- | --- | --- | --- |
| 29 | `/physical_feature_vectors.csv` | Measurements and uncertainty (CSV) | 31 samples with 13 descriptors and one porosity uncertainty estimate, rounded to two decimal places. |
| 30 | `/qc_dataset_features.csv` | Full-precision measurements (CSV) | Full-precision physical measurements used for batch comparisons. |
| 31 | `/qc_summary_report.json` | Batch summary (JSON) | Sample counts and batch means. |
| 32 | `/downloads/physical-method.md` | Protocol (Markdown) | Canonical measurement protocol and test-set instructions. |
| 33 | `/downloads/extract_physical_features.py` | Extractor (Python) | Executable script displayed inline in Methods. |
| 34 | `/downloads/physical-rerun.json` | Verification record (JSON) | Run settings, software versions, input hashes and reproduction results. |
| 35 | `/physical-feature-vector.tex` | Feature vector (LaTeX) | The 13-descriptor column vector with porosity uncertainty reported separately. |

#### External destinations: 13 destinations

The repository is linked once in Downloads and repository. Each other external URL appears once in the centralized References disclosure; the glossary cites its inline reference anchor. External links open a separate browser tab.

| # | Exact href | Visible label | Location / source |
| --- | --- | --- | --- |
| 36 | `https://github.com/michaeldunn99/battery-microstructure-portal` | Project repository | Downloads and repository; project source and version history. |
| 37 | `https://doi.org/10.1002/aenm.201401612` | Three-Phase Multiscale Modeling of a LiCoO₂ Cathode: Combining the Advantages of FIB-SEM Imaging and X-Ray Tomography | References: Zielke et al. (2015); electrode-phase roles. |
| 38 | `https://doi.org/10.1002/aenm.201301278` | Tortuosity Anisotropy in Lithium-Ion Battery Electrodes | References: Ebner et al. (2014); morphology and directional transport. |
| 39 | `https://doi.org/10.1149/2.0311802jes` | Quantifying Inhomogeneity of Lithium Ion Battery Electrodes and Its Influence on Electrochemical Performance | References: Müller et al. (2018); graphite-electrode heterogeneity. |
| 40 | `https://doi.org/10.1002/advs.202414149` | Prediction of Microstructural Representativity From A Single Image | References: Dahari et al. (2025); image representativity. |
| 41 | `https://doi.org/10.3390/ma7064455` | Preparation and Characterization of Li-Ion Graphite Anodes Using Synchrotron Tomography | References: Mitsch et al. (2014); ageing-related geometry changes. |
| 42 | `https://doi.org/10.3390/ma16216896` | Optimization of Pore Characteristics of Graphite-Based Anode for Li-Ion Batteries by Control of the Particle Size Distribution | References: Choi et al. (2023); graphite mixtures and packing. |
| 43 | `https://doi.org/10.1111/jmi.12389` | Comparison of three-dimensional analysis and stereological techniques for quantifying lithium-ion battery electrode microstructures | References: Taiwo et al. (2016); stereology and three-dimensional analysis. |
| 44 | `https://www.polaron.ai/newsroom/quantifying-and-optimising-solid-state-battery-electrodes` | Quantifying and Optimising Solid-State Battery Electrodes | References: Polaron (2026); industrial solid-state-electrode case study, explicitly distinguished from this report. |
| 45 | `https://arxiv.org/abs/0705.2774` | Some Aspects of Measurement Error in Linear Regression of Astronomical Data | References: Kelly (2007); measurement-error modelling, explicitly identified as an astronomy study. |
| 46 | `https://scikit-image.org/docs/stable/auto_examples/segmentation/plot_multiotsu.html` | Multi-Otsu thresholding | References: scikit-image segmentation documentation. |
| 47 | `https://scikit-image.org/docs/stable/api/skimage.measure.html#skimage.measure.regionprops` | Region measurements | References: scikit-image geometric definitions. |
| 48 | `https://numpy.org/doc/stable/reference/generated/numpy.std.html` | Standard deviation | References: NumPy population standard deviation. |

### Expandable controls

The page has **30 native disclosure controls**, including nested controls:

- Twelve glossary disclosures: physical meaning, relevance to electrode performance, and calculation content for each of four groups. The broad groups are labelled (a) to (d); individual descriptors are named without letter labels.
- Six Methods disclosures: image preparation, 13 descriptor definitions, porosity uncertainty, calculation assumptions, code, and preprocessing figures.
- Four figure disclosures nested within preprocessing: three full-resolution inspectors and the additional detector comparison.
- Two Results disclosures: the sample explorer and full-precision table.
- One Discussion disclosure: scope relative to published electrode analyses.
- Four Reproducibility disclosures: test-set procedure, verification record, nested run settings/input hashes, and downloads.
- One References disclosure containing the 12 sources.

Image inspection expands inside the report instead of navigating to a PNG. Citation hashes reveal the References disclosure; code and measurement hashes reveal their containing disclosures. The report has no separate Full method control or duplicated methods page content.

### Final checks and evidence

- All **28 local hash destinations** exist in the rendered HTML. No duplicate element IDs were found.
- Every linked calculation line exists in the current standalone extractor. The page has no links to archived source files.
- The live heading order matches the report sequence above. The legacy `CorePhysicalFingerprintHero` is not mounted.
- The active Methods component and downloadable LaTeX specify a 13-dimensional descriptor vector, with porosity uncertainty separate. The canonical method and download labels distinguish this from the preserved 14-field measurement record. No active claim of a 14-dimensional physical vector was found.
- The old `/method` route returned HTTP 307 to `/#image-preparation`; that target exists in the report.
- All seven downloads returned HTTP 200 on the development server after restart. The verification download matched `validation/physical-rerun.json` byte for byte. It was also independently checked on the production server at `http://localhost:3107/downloads/physical-rerun.json` with the same result. This resolves the earlier development-server route-cache 404. Final deployment and browser checks remain separate from this source/link audit.
- The user-authorized Amass API was used to verify the Mitsch, Choi, Taiwo and Goel/Thornton source records against supplied notes. The active bibliography uses the first three; verification of a source does not mean all proposed measurements from those notes were implemented. Only public bibliographic fields were retained in the research results, with no credentials included.
- Source descriptions state their scope. They do not present the CBD intensity split, bright-inclusion geometry or four-by-four spatial statistic as externally validated defect diagnostics. Polaron's solid-state case study and Kelly's measurement-error model are identified as different contexts.
- Each performance disclosure now pairs specific published findings with their citations and states the scope of those findings for this analysis. The software reference for component geometry belongs under calculations. The report does not infer that unidentified bright inclusions share the performance relationships reported for identified electrode particles.
- Browser checks confirmed four labelled groups, functioning literature and calculation links, keyboard focus on expanded summaries, 13 descriptor rows, 31 raw measurement rows, and no missing hash destinations or maths-rendering errors. Mobile inspection found no page overflow. The production build, TypeScript check and both existing maths-rendering tests passed.

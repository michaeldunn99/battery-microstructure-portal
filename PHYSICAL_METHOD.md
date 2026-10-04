# Physical feature extraction method

Each sample is described by **13 physical descriptors and an associated porosity uncertainty estimate**, stored as 14 numerical fields. The current report uses joint BSE, Inlens and ETD/SE segmentation for 31 known crops (seven in Batch 1, seven in Batch 2 and seventeen in the Batch 3 reference) and nine test samples. Full-precision [known vectors](/multichannel/known_batches.csv) and [test vectors](/multichannel/test_1.csv) use the same measurement definitions. The uncertainty estimate accompanies the descriptors; it is not a calibrated assignment probability.

## Inputs and image preparation

Each sample has corresponding BSE, Inlens and ETD detector images; four known samples use the name SE for the third detector. The main report uses joint three-detector segmentation; original BSE segmentation is retained as a control. SE occupies the third-channel position where supplied; this convention does not establish identical acquisition settings.

Both methods select the first stored intensity channel, retain the central 80% of image rows (`int(0.1*h):int(0.9*h)`) and keep every column. Gaussian smoothing uses `sigma=1.0` and `preserve_range=True` separately for each included detector. The pixel-size setting is **0.025 µm/pixel**. It has not been independently verified from the exported TIFF metadata.

### Joint three-detector segmentation

At each image coordinate, stack the three smoothed intensities into a three-component pixel vector: BSE, Inlens and ETD/SE. This is a joint representation of matching pixels, not an average image or a reconstruction in three spatial dimensions.

1. Verify complete detector triplets and equal pixel grids. The initial 34-sample alignment audit found estimated shifts below 0.685 native pixels per axis and no obvious field mismatch in the inspected test overlays. This supports pixelwise stacking without proving subpixel alignment. No images are warped, shifted or resampled.
2. Standardize each smoothed channel within its own full crop: subtract its mean and divide by its population standard deviation (`ddof=0`). Thus each detector has equal weight in the clustering distance. A constant or nonfinite channel stops extraction.
3. Sample up to 100,000 pixel coordinates without replacement using seed 42. Initialize three centroids from the mean sampled vectors within the original BSE Multi-Otsu classes.
4. Fit [K-means](https://scikit-learn.org/stable/modules/generated/sklearn.cluster.KMeans.html) with three clusters, `n_init=1`, `random_state=42`, `max_iter=300`, `tol=1e-4` and the Lloyd algorithm. Assign every cropped pixel to its nearest fitted centroid. Numerical centroids are fitted separately for each sample; the algorithm and settings stay fixed across batches and tests.
5. Order fitted cluster centroids by their BSE coordinate and label them pore, graphite matrix and silicon, from lowest to highest BSE intensity. Apply the same physical calculations to these new masks.

A **BSE-only K-means control** uses the same sampled coordinates, initialization procedure and fitting settings with only one intensity input. Comparing it with the original Multi-Otsu output separates the algorithm change from the addition of detector channels.

The Inlens median split is retained inside each method's pore mask. CBD therefore remains approximately half that mask by construction; adding detectors does not make CBD an independently identified phase. All pore geometry and ImageRep calculations use the full pore mask, including this allocation.

The new preprocessing figures are outputs from these calculations. Their top row shows corresponding smoothed detector windows; the bottom row shows original Multi-Otsu, BSE-only K-means and three-detector K-means masks. Figures display a central 900 × 900 pixel window; measurements use the full crop. Review shows additional bright edges and lines entering the silicon-labelled class in some combined masks. These boundaries require validation before claiming improved phase accuracy. [Inspect the masks](#preprocessing-figures) or expand the [three-detector calculation code](#multichannel-code).

### Original BSE control

Multi-Otsu with three classes determines two thresholds independently for each denoised BSE image. The algorithm and its settings are fixed; the numerical thresholds are fitted per image. Destriping, plane correction and reference-fitted intensity quantiles are not part of this calculation. See [image preparation and thresholding](https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/extract_physical_features.py#L70).

### Original BSE control: phase assignment

Here, a phase mask is an operational image-intensity assignment. The project lead identifies the bright material as silicon; intensity clustering alone does not validate its boundaries. Two thresholds fitted separately to each smoothed BSE image define three mutually exclusive masks:

- Pore: `BSE < T_pore`.
- Graphite-labelled matrix: `T_pore <= BSE < T_inc`.
- Silicon-labelled material: `BSE >= T_inc`.

Within the pore mask, the median Inlens intensity divides pixels into `open_pore` at or below the median and `cbd` above it. **CBD is a median-split estimate**, approximately half the pore fraction, rather than an independently calibrated binder measurement. All area fractions use the full cropped image as denominator. Reported porosity is the entire dark BSE mask, including the CBD allocation, not only the open-pore subset.

The masks satisfy `porosity = open_pore + cbd` and `porosity + matrix + inclusion = 100%`. CBD is therefore a subdivision of the pore-labelled region and must not be added to the latter three as another independent composition fraction. See [mask definitions](https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/extract_physical_features.py#L113).

## Feature definitions

The table follows the CSV column order. Here, `s` is pixel size and `A` is component area in pixels. All three segmentation conditions use these same downstream definitions. The original extractor has a two-decimal presentation export and a `--full-precision` option. Combined-run exports retain full precision. Legacy column names containing `inclusion` or `particle` refer to the silicon-labelled mask.

| # | Exported column | Units | Calculation and interpretation |
| --- | --- | --- | --- |
| 1 | `porosity_pct` | % of cropped area | `100 × mean(pore_mask)`; segmentation-assigned pore coverage. |
| 2 | `porosity_ci95_pct` | Percentage points | `100 × ImageRep abs_err`; 95% uncertainty half-width for the pore-area estimate, conditional on the mask. |
| 3 | `active_material_pct` | % of cropped area | `100 × mean(matrix_mask)`; segmentation-assigned graphite-labelled coverage. |
| 4 | `cbd_pct` | % of cropped area | `100 × mean(pore_mask AND Inlens > pore_median)`; median-split estimate within the pore-labelled region. |
| 5 | `inclusion_pct` | % of cropped area | `100 × mean(silicon_mask)`; area assigned to the silicon-labelled class by the specified segmentation. |
| 6 | `char_length_scale_cls_um` | µm | `ImageRep integral_range × s`; spatial correlation scale of the pore mask. |
| 7 | `throat_through_plane_ly_um` | µm | Mean pore run length from every 40th column, multiplied by `s`. |
| 8 | `chord_in_plane_lx_um` | µm | Mean pore run length from every 40th row, multiplied by `s`. |
| 9 | `pore_anisotropy_ratio` | Dimensionless | Horizontal mean chord divided by vertical mean chord; directional difference in pore extent. |
| 10 | `particle_aspect_ratio` | Dimensionless | Mean `major_axis / max(minor_axis, 1 pixel)` for inclusion components with area ≥ 10 pixels and positive minor axis. |
| 11 | `particle_d10_um` | µm | 10th percentile of inclusion-component `sqrt(4A / π) × s`, using components with area ≥ 10 pixels. |
| 12 | `particle_d50_um` | µm | Median of the same component-diameter list; each component contributes one observation. |
| 13 | `particle_d90_um` | µm | 90th percentile of the same component-diameter list. |
| 14 | `slurry_dispersion_index` | Percentage points | Population standard deviation of inclusion-area percentages across a 4 × 4 partition; spatial variation in inclusion coverage. |

### Correlation and porosity uncertainty

ImageRep is called as `make_error_prediction(pore_mask.astype(int), confidence=0.95, target_error=0.05)`. The implementation obtains periodic FFT two-point correlation, reduces it to a characteristic length scale and integrates the prediction interval with model error enabled. The exported quantities are `integral_range × s` and `abs_err × 100`. This is a correlation-based uncertainty calculation, not a moving-block bootstrap.

`target_error=0.05` specifies a relative error target used by ImageRep; it does not force each measured interval to ±5%. The interval describes representativity conditional on the segmentation and does not include phase-assignment error. An ImageRep calculation failure stops extraction rather than substituting a confidence interval. See [uncertainty calculation](https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/extract_physical_features.py#L129).

### Pore chords and particle geometry

Pore runs are identified by padding each sampled binary scan with zeros and pairing positive and negative transitions. `end − start` gives the run length in pixels, including runs truncated by the crop boundary. Empty chord lists become zero; anisotropy becomes one when the vertical mean is zero. The physical meanings of the exported through-plane and in-plane labels depend on the image orientation.

Particle geometry is measured on **inclusion connected components**, using `skimage.measure.label` and `regionprops`. It does not measure segmented graphite flakes. Components smaller than 10 pixels are excluded. Diameter quantiles use one observation per component, without volume weighting or watershed separation. Empty diameter lists become zero, and an empty aspect-ratio list becomes one. These fallback values should be reviewed when interpreting a sample. See [chord and component calculations](https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/extract_physical_features.py#L137).

For the spatial dispersion measurement, `np.array_split` divides the inclusion mask into 4 × 4 tiles. The inclusion percentage is calculated within each tile, followed by `np.std(tile_percentages, ddof=0)`. This produces a standard deviation in percentage points. See [dispersion calculation](https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/extract_physical_features.py#L166).

## Statistical batch comparison

### Purpose and scope

The organisers define Batch 3 as the supplier reference and Batches 1 and 2 as different patterns of microstructural variation, not better or worse material. We report dimension-wise measurements and an exploratory nearest-batch-mean assignment. The mean-difference tests below apply only to the original BSE-derived vectors; they are supplementary analyses, not the batch-assignment rule.

The organisers also state that the supplied data comprise crops from approximately 15 electrode images, arranged into artificial batches. Batch folders and detector-matched sample IDs are known, but a crop-to-parent-image mapping has not been found in the available files or TIFF descriptions. Treating every crop as an independent specimen is therefore unverified. Source-image groups should be kept together in any future validation split.

### Original BSE analysis: tests for differences

We compare each of the 13 physical descriptors with the Batch 3 reference. One paired BSE/Inlens acquisition contributes one observation; pixels, particles and detector channels are not additional replicates. This report uses 17 reference observations and seven observations from each incoming batch. The porosity confidence-interval field is excluded from hypothesis testing because it describes measurement precision.

### Mean differences and confidence intervals

For each feature, we report the mean and sample standard deviation in both batches. The effect is the difference in original units, **incoming minus reference**. A difference between two area percentages is expressed in percentage points. The two-sided null hypothesis is equal population means. We use [Welch's t-test](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.ttest_ind.html), which allows unequal variances:

$$
\Delta = \bar{x}_{\mathrm{incoming}}-\bar{x}_{\mathrm{reference}},\qquad
SE = \sqrt{\frac{s_{\mathrm{incoming}}^2}{n_{\mathrm{incoming}}}+\frac{s_{\mathrm{reference}}^2}{n_{\mathrm{reference}}}},\qquad t=\frac{\Delta}{SE}.
$$

The 95% interval for the mean difference is $\Delta\pm t_{0.975,\nu}SE$, with Welch-Satterthwaite degrees of freedom. Standard deviations use $n-1$ in the denominator. These are **pointwise intervals**, not simultaneous intervals across all features. Calculations use unrounded measurements; only displayed values are rounded.

### Variation between images

We also describe the distributions using individual image values, medians, interquartile ranges and sample standard deviations. A reported variance ratio is $s_{\mathrm{incoming}}^2/s_{\mathrm{reference}}^2$, calculated before rounding. These ratios describe the observed spread; they are not variance-test p-values or validated QC limits. The boxplot is reproduced from the full-precision CSV with `scripts/plot_physical_batches.py`.

Welch's test permits unequal variances but tests the means only. Greater spread increases uncertainty in the estimated mean and can also be a QC signal in its own right. Batch 1 has two images with high inclusion area and low matrix area, accounting for much of its increased spread. These linked fractions should not be counted as independent confirmation. Image preparation, segmentation and material heterogeneity are alternative explanations to examine before attributing a manufacturing cause.

### Multiple comparisons

We report raw p-values and [Holm-adjusted p-values](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/p.adjust.html). The family comprises all 13 descriptors for every incoming batch requested in one analysis: **26 tests here**, including both Batch 1 and Batch 2. Holm's procedure controls family-wise error at 0.05 under valid individual tests, including when descriptors are correlated. We use adjusted p-values for significance statements. A separately specified single test batch has 13 comparisons; this does not control false alarms over an indefinite sequence of future batches.

Holm orders the p-values from smallest to largest and compares them sequentially with `0.05/26`, `0.05/25`, and so on, stopping at the first failure. It limits false-positive mean-difference claims across the family. It does not alter the physical measurements, test their similarity, or correct dependence between crops.

This adjustment is an analysis choice for the supplementary mean tests. It is not prescribed by the Kench and Cooper papers examined here. [ImageRep, by Dahari, Docherty, Kench and Cooper](https://doi.org/10.1002/advs.202414149), estimates phase-fraction representativity from spatial correlation. [MicroLib, by Kench, Squires, Dahari and Cooper](https://doi.org/10.1038/s41597-022-01744-1), compares phase fraction, surface-area density and two-point correlation to assess generated microstructures. These support physical measurement and sampling assessment; neither establishes our batch-classification procedure or manufacturing thresholds.

### Assumptions and interpretation

Inference assumes independent, representative sample observations. Given the organisers' source-image clarification, the numerical p-values and confidence intervals are provisional. If several image fields come from one specimen, aggregate them by specimen or use a hierarchical analysis before applying a batch test. Sample identifiers alone do not establish independence. With seven incoming observations, estimates are sensitive to outliers and departures from the t-test model. The test concerns the mean, not every aspect of a distribution.

The ImageRep interval estimates uncertainty within an image conditional on its segmentation. The Welch interval estimates uncertainty in a difference between batch means from variation across observations. **ImageRep intervals are not propagated into the Welch test.** Segmentation error is not included in either interval.

A small p-value is evidence against equal means under the test assumptions. A large p-value does not establish equivalence or justify acceptance. Effect size, uncertainty, physical relevance and validated manufacturing tolerances must also inform a QC decision, as emphasised by the [ASA statement](https://www.amstat.org/asa/files/pdfs/P-ValueStatement.pdf). This comparison does not produce an accept/reject verdict. Fewer than two observations in either batch or zero combined variance produces an unavailable test; missing or nonfinite measurements stop the comparison. Unavailable tests retain their place in the adjustment family.

For a future manufacturing-equivalence claim, acceptable differences must be specified before testing, as explained in [NIST's comparison guidance](https://doi.org/10.6028/NIST.TN.2106). No such tolerances or equivalence result are established here.

The [comparison script](https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/compare_physical_batches.py) records means, standard deviations, differences, intervals, p-values, adjustment settings, input hashes and software versions.

## Implementation and application

### Whole-record similarity comparison

For each segmentation method, calculate batch means and the sample standard deviation across all 31 known images for every input (`ddof=1`). Assign a test vector to the batch with the smallest root-mean-square standardized distance:

$$
d_b=\sqrt{\frac{1}{p}\sum_{j=1}^{p}\left(\frac{x_j-\bar{x}_{bj}}{s_j}\right)^2}.
$$

The controlled before/after comparison uses the same 13 numerical inputs in both methods: all 14 saved fields except D10, which is constant in the original known data. This exploratory whole-record comparison includes porosity uncertainty and derived quantities; it is distinct from the 13-descriptor physical vector, which excludes uncertainty and includes D10. Correlated and derived inputs can influence the distance more than once. No feature weights or segmentation settings were tuned to the test labels.

Known and test vectors must come from the same segmentation method. Each method uses its own known-image scaling. Distances from different methods are not directly comparable confidence scores. This rule is a nearest-centroid comparison, not interpolation or a calibrated probability model.

The three initial test assignments remain 3e122cbj → Batch 1, fn0mhxef → Batch 2 and xrv9xvzb → Batch 3 under both segmentations. The supplied organiser feedback identifies them as Batch 2, Batch 1 and Batch 3 respectively. These labels were available before the combined-method evaluation and are used only to describe errors, not to fit batch centroids.

### Assignment confidence

Leave out each known crop in turn, refit scaling and batch means using the remaining 30 crops, and assign the omitted crop. The rule correctly assigns 18 of 31 crops (58.1%). For each predicted batch, the reported percentage is the number of correct predictions divided by all predictions of that batch:

| Predicted batch | Correct / predicted | Validation rate | Confidence band |
| --- | --- | --- | --- |
| Batch 1 | 3 / 6 | 50.0% | Medium |
| Batch 2 | 2 / 10 | 20.0% | Low |
| Batch 3 | 13 / 15 | 86.7% | High |

The requested reporting bands are High above 70%, Medium from 50% to 70% inclusive, and Low below 50%. These are small-sample, class-level validation rates, not calibrated probabilities for individual test images. Images assigned to the same batch receive the same rate. Shared parent images could make crop-level validation optimistic. Distance margins, refitting stability and distance limits are retained as diagnostics, but do not change these reporting bands. None of these quantities establishes manufacturing acceptance.

### Completed test extraction

All nine test samples have corresponding BSE, Inlens and ETD images. They are processed individually with the same combined segmentation, geometric calculations and pixel-size setting as the known samples. They do not contribute to batch centroids or feature scaling.

The complete test folder now contains nine samples: the initial three and six additional samples. All nine have been processed with the combined method. The results table shows each image separately alongside the known-batch mean and sample standard deviation. No standard deviation is attached to a single test image. Its ImageRep porosity interval remains a separate estimate of sampling uncertainty conditional on segmentation. Test measurements are exported at full precision; image hashes, settings and the ImageRep revision are recorded in `validation/multichannel/full-test-run.json`.

### Apply the same extraction to new images

For the three-detector analysis, arrange images in a named folder under a data directory, with filenames `img_<sample>_BSE.tif`, `img_<sample>_Inlens.tif` and `img_<sample>_ETD.tif` (or `_SE.tif`). Run from the portal repository with NumPy, SciPy, scikit-image, scikit-learn, Matplotlib, Pillow and ImageRep available:

```bash
python scripts/run_multichannel_experiment.py \
  --data-dir /path/to/data \
  --batch-name test_1 \
  --imagerep-path /path/to/ImageRep \
  --run-dir /path/to/new-run
```

The run directory must be new. Omitting `--batch-name` repeats the known Batch_1, Batch_2 and Batch_3 folders plus test_1. The output includes original, control and combined vectors, full-crop label masks and matched diagnostic figures. Image hashes, fitted centroids, normalization settings, software versions and source snapshots are saved. If a sample has a previous original export, its 14 fields must reproduce within `1e-10`; new IDs are explicitly recorded as having no previous export. Use the `stacked_three_channel` rows for combined-method assignments.

To reproduce the saved assignments, first evaluate and record the rule with known data, then apply it to the test vectors using the same output directory:

```bash
python scripts/assign_multichannel_tests.py \
  --known-csv public/multichannel/known_batches.csv \
  --confidence-policy empirical_precision_v2 \
  --output-dir /path/to/new-assignments

python scripts/assign_multichannel_tests.py \
  --known-csv public/multichannel/known_batches.csv \
  --test-csv public/multichannel/test_1.csv \
  --confidence-policy empirical_precision_v2 \
  --output-dir /path/to/new-assignments
```

The script saves assignments, feature contributions, fitted centroids, validation predictions, input hashes and the fixed specification. It requires NumPy. For newly extracted images, pass the new run's `features.csv` as `--test-csv`; only combined-method rows are selected.

The original BSE extraction remains available for reproducing the original report tables:

The [extraction code](https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/extract_physical_features.py) accepts a batch directory, pixel size, ImageRep checkout and output path. From the portal repository directory:

```bash
python scripts/extract_physical_features.py \
  --batch-dir /path/to/test-set \
  --batch-name Test_Set \
  --pixel-size-um 0.025 \
  --imagerep-path /path/to/ImageRep \
  --full-precision \
  --output-csv /path/to/new-physical-features.csv
```

To process one sample, add `--sample-id 0grcilhi` and point the batch directory to its image files. The `--full-precision` option preserves unrounded values for statistics; the default remains the two-decimal presentation export. Existing output is protected unless `--overwrite` is supplied. The output status is `EVALUATE`; measurement extraction does not assign a manufacturing release decision.

Use one measurement specification for the reference and test batches: the same crop, scale, smoothing, segmentation specification, median split, scan spacing, component filters, spatial partition and ImageRep settings. Record image identifiers, calibration, dependencies and ImageRep revision. Compare individual sample values and batch distributions against Batch 3. Numerical acceptance limits require separate validation against manufacturing requirements.

Preserve all 13 descriptors and the accompanying uncertainty. Do not pool unrelated held-out samples into a single batch mean or infer that one test image must belong to each known batch.

### Optional comparison of an identified batch

If the incoming samples are known to represent one batch and independent sampling is established, compare that batch against the saved reference, with NumPy and SciPy installed. This is not the operation used for individual test-image assignment:

```bash
python scripts/compare_physical_batches.py \
  --reference-csv public/qc_dataset_features.csv \
  --reference-batch Batch_3 \
  --incoming-csv /path/to/new-physical-features.csv \
  --incoming-batch Test_Set \
  --output-json /path/to/new-batch-comparison.json
```

The script accepts both the original raw column names and the extractor's column names. Use unique sample identifiers and preserve the reference measurements, feature list and analysis settings before inspecting the test batch. At least two independent observations are needed per batch for a test. Do not choose features or thresholds after seeing the new results.

To reproduce the archived original BSE mean comparison:

```bash
python scripts/compare_physical_batches.py \
  --reference-csv public/qc_dataset_features.csv \
  --reference-batch Batch_3 \
  --incoming-batch Batch_1 \
  --incoming-batch Batch_2 \
  --output-json /path/to/physical-batch-statistics.json
```

## Reproducibility

The initial three-detector comparison processed all 31 known and three initial test samples under three segmentation conditions. All 476 original numerical values reproduced exactly, and the six pilot samples reproduced all 252 values and 18 masks in the full run. Original numerical tables and their supplementary Welch/Holm statistics remain separate from the combined exports. Source hashes, settings and per-image comparisons are available in the combined extraction record.

The complete nine-sample test run produced 378 values across the three segmentation conditions. Repeating the initial three samples reproduced all 126 values, nine masks and three diagnostic figures exactly. All nine detector triplets have equal grids; the alignment audit recorded no review flags. This checks numerical reproducibility and image correspondence, not the accuracy of material boundaries or batch assignment.

The original BSE extractor was run on all 31 known samples: 17 from Batch 3, seven from Batch 1 and seven from Batch 2. All 434 feature values matched the saved measurements to two decimal places, with no differences. Parameters, dependency versions and input hashes are recorded in the [validation record](https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/validation/physical-rerun.json).

The original BSE full-precision export was separately checked on all 31 known samples: all 434 values matched the saved raw measurements exactly. The default two-decimal CSV strings were unchanged for sample `0grcilhi`. This check is recorded in `validation/physical-full-precision.json`.

The original BSE statistical output contains 26 planned tests, of which 24 are estimable. Inclusion D10 is constant in all three batches; both D10 comparisons have null test statistics and p-values, while retaining their Holm adjustment slots. No adjusted p-value is below 0.05. Numerical tests check Welch statistics and confidence intervals against SciPy, known Holm adjustments, constant-valued data, input validation and both raw and extractor column names.

For the archived original BSE method, sample `0grcilhi` produced:

`13.43, 2.26, 79.58, 6.71, 6.99, 2.76, 0.53, 0.62, 1.17, 2.35, 0.09, 0.14, 0.34, 4.05`.

Its horizontal and vertical mean chords satisfy `0.6151298268974701 / 0.5269602106495027 = 1.1673174073983579`, exported as anisotropy `1.17`. Reproducing these measurements does not validate the phase assignments or establish manufacturing acceptance limits.

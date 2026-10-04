# Physical feature extraction method

Each sample is described by **13 physical descriptors and an associated porosity uncertainty estimate**. The physical descriptor vector has 13 dimensions; the saved measurement record retains all 14 numerical fields, with the uncertainty in the second column. Storing an uncertainty estimate alongside the descriptors does not itself define an uncertainty-aware prediction model. The dataset contains 31 samples: seven from Batch 1, seven from Batch 2 and seventeen from the Batch 3 reference. The [feature CSV](https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/public/physical_feature_vectors.csv) records these values with batch and sample identifiers.

## Inputs and image preparation

The calculation uses paired BSE and Inlens images with matching pixel grids. It selects the first intensity channel, retains the central 80% of image rows (`int(0.1*h):int(0.9*h)`) and keeps every column. Gaussian smoothing is applied to both images with `sigma=1.0` and `preserve_range=True`. The pixel-size setting for the reported values is **0.025 µm/pixel**.

Multi-Otsu with three classes determines two thresholds independently for each denoised BSE image. The algorithm and its settings are fixed; the numerical thresholds are fitted per image. Destriping, plane correction and reference-fitted intensity quantiles are not part of this calculation. See [image preparation and thresholding](https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/extract_physical_features.py#L70).

## Phase assignment

Here, a phase is an operational image-intensity class. The labels assign a physical interpretation to each region; they are not independently confirmed chemical identities. Two thresholds fitted separately to each smoothed BSE image define three mutually exclusive masks:

- Pore: `BSE < T_pore`.
- Graphite-labelled matrix: `T_pore <= BSE < T_inc`.
- Bright inclusion of unconfirmed composition: `BSE >= T_inc`.

Within the pore mask, the median Inlens intensity divides pixels into `open_pore` at or below the median and `cbd` above it. **CBD is a median-split estimate**, approximately half the pore fraction, rather than an independently calibrated binder measurement. All area fractions use the full cropped image as denominator. Reported porosity is the entire dark BSE mask, including the CBD allocation, not only the open-pore subset.

The masks satisfy `porosity = open_pore + cbd` and `porosity + matrix + inclusion = 100%`. CBD is therefore a subdivision of the pore-labelled region and must not be added to the latter three as another independent composition fraction. See [mask definitions](https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/extract_physical_features.py#L113).

## Feature definitions

The table follows the CSV column order. Here, `s` is pixel size and `A` is component area in pixels. Values are exported to two decimal places by default; `--full-precision` preserves unrounded values for statistics.

| # | Exported column | Units | Calculation and interpretation |
| --- | --- | --- | --- |
| 1 | `porosity_pct` | % of cropped area | `100 × mean(pore_mask)`; threshold-assigned pore coverage. |
| 2 | `porosity_ci95_pct` | Percentage points | `100 × ImageRep abs_err`; 95% uncertainty half-width for the pore-area estimate, conditional on the mask. |
| 3 | `active_material_pct` | % of cropped area | `100 × mean(matrix_mask)`; middle-intensity area assigned to graphite. |
| 4 | `cbd_pct` | % of cropped area | `100 × mean(pore_mask AND Inlens > pore_median)`; median-split estimate within the pore-labelled region. |
| 5 | `inclusion_pct` | % of cropped area | `100 × mean(inclusion_mask)`; upper-intensity BSE coverage. |
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

The organisers define Batch 3 as the supplier reference and Batches 1 and 2 as different patterns of microstructural variation, not better or worse material. The challenge ultimately requires a batch assignment for each held-out image, with confidence and an explanation. The current report compares physical measurements dimension by dimension. Mean-difference tests are supplementary analyses, not a batch-assignment rule.

The organisers also state that the supplied data comprise crops from approximately 15 electrode images, arranged into artificial batches. Batch folders and detector-matched sample IDs are known, but a crop-to-parent-image mapping has not been found in the available files or TIFF descriptions. Treating every crop as an independent specimen is therefore unverified. Source-image groups should be kept together in any future validation split.

### Current analysis: tests for differences

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

### Completed test extraction

The `test_1` directory contains three samples, each with BSE, Inlens and ETD detector images. We extracted one vector for each ID: `3e122cbj`, `fn0mhxef` and `xrv9xvzb`. The original calculation uses BSE and Inlens; ETD is not an input to these physical descriptors. All three samples used the same crop, smoothing, segmentation, geometry settings and 0.025 µm/pixel setting as the known data. The absolute scale could not be independently confirmed from the exported TIFF metadata.

The results table shows each test image separately alongside the known-batch mean and sample standard deviation. No standard deviation is attached to a single test image. Its ImageRep porosity interval remains a separate estimate of sampling uncertainty conditional on segmentation. Test measurements are exported at full precision; image hashes, settings and the ImageRep revision are recorded in `validation/test-1-run.json`.

### Apply the same extraction to new images

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

Use one measurement specification for the reference and test batches: the same crop, scale, smoothing, per-image thresholding rule, median split, scan spacing, component filters, spatial partition and ImageRep settings. Record image identifiers, calibration, dependencies and ImageRep revision. Compare individual sample values and batch distributions against Batch 3. Numerical acceptance limits require separate validation against manufacturing requirements.

Review each test image across the original dimensions before choosing a similarity or classification rule. Preserve all 13 descriptors and the accompanying uncertainty. Do not pool unrelated held-out samples into a single batch mean or infer that one test image must belong to each known batch.

### Optional comparison of an identified batch

If the incoming samples are known to represent one batch and independent sampling is established, compare that batch against the saved reference, with NumPy and SciPy installed. This is not the operation used for the three individually unlabelled test images:

```bash
python scripts/compare_physical_batches.py \
  --reference-csv public/qc_dataset_features.csv \
  --reference-batch Batch_3 \
  --incoming-csv /path/to/new-physical-features.csv \
  --incoming-batch Test_Set \
  --output-json /path/to/new-batch-comparison.json
```

The script accepts both the original raw column names and the extractor's column names. Use unique sample identifiers and preserve the reference measurements, feature list and analysis settings before inspecting the test batch. At least two independent observations are needed per batch for a test. Do not choose features or thresholds after seeing the new results.

To reproduce the current report's joint comparison:

```bash
python scripts/compare_physical_batches.py \
  --reference-csv public/qc_dataset_features.csv \
  --reference-batch Batch_3 \
  --incoming-batch Batch_1 \
  --incoming-batch Batch_2 \
  --output-json /path/to/physical-batch-statistics.json
```

## Reproducibility

The extractor was run on all 31 samples: 17 from Batch 3, seven from Batch 1 and seven from Batch 2. All 434 feature values matched the saved measurements to two decimal places, with no differences. Parameters, dependency versions and input hashes are recorded in the [validation record](https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/validation/physical-rerun.json).

The full-precision export was separately checked on all 31 samples: all 434 values matched the saved raw measurements exactly. The default two-decimal CSV strings were unchanged for sample `0grcilhi`. This check is recorded in `validation/physical-full-precision.json`.

The statistical output contains 26 planned tests, of which 24 are estimable. Inclusion D10 is constant in all three batches; both D10 comparisons have null test statistics and p-values, while retaining their Holm adjustment slots. No adjusted p-value is below 0.05. Numerical tests check Welch statistics and confidence intervals against SciPy, known Holm adjustments, constant-valued data, input validation and both raw and extractor column names.

For example, sample `0grcilhi` produced:

`13.43, 2.26, 79.58, 6.71, 6.99, 2.76, 0.53, 0.62, 1.17, 2.35, 0.09, 0.14, 0.34, 4.05`.

Its horizontal and vertical mean chords satisfy `0.6151298268974701 / 0.5269602106495027 = 1.1673174073983579`, exported as anisotropy `1.17`. Reproducing these measurements does not validate the phase assignments or establish manufacturing acceptance limits.

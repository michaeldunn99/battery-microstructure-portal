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

We compare each of the 13 physical descriptors with the Batch 3 reference. One paired BSE/Inlens acquisition contributes one observation; pixels, particles and detector channels are not additional replicates. This report uses 17 reference observations and seven observations from each incoming batch. The porosity confidence-interval field is excluded from hypothesis testing because it describes measurement precision.

### Mean differences and confidence intervals

For each feature, we report the mean and sample standard deviation in both batches. The effect is the difference in original units, **incoming minus reference**. A difference between two area percentages is expressed in percentage points. The two-sided null hypothesis is equal population means. We use [Welch's t-test](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.ttest_ind.html), which allows unequal variances:

$$
\Delta = \bar{x}_{\mathrm{incoming}}-\bar{x}_{\mathrm{reference}},\qquad
SE = \sqrt{\frac{s_{\mathrm{incoming}}^2}{n_{\mathrm{incoming}}}+\frac{s_{\mathrm{reference}}^2}{n_{\mathrm{reference}}}},\qquad t=\frac{\Delta}{SE}.
$$

The 95% interval for the mean difference is $\Delta\pm t_{0.975,\nu}SE$, with Welch-Satterthwaite degrees of freedom. Standard deviations use $n-1$ in the denominator. These are **pointwise intervals**, not simultaneous intervals across all features. Calculations use unrounded measurements; only displayed values are rounded.

### Multiple comparisons

We report raw p-values and [Holm-adjusted p-values](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/p.adjust.html). The family comprises all 13 descriptors for every incoming batch requested in one analysis: **26 tests here**, including both Batch 1 and Batch 2. Holm's procedure controls family-wise error at 0.05 under valid individual tests, including when descriptors are correlated. We use adjusted p-values for significance statements. A separately specified single test batch has 13 comparisons; this does not control false alarms over an indefinite sequence of future batches.

### Assumptions and interpretation

Inference assumes independent, representative sample observations. If several image fields come from one specimen, aggregate them by specimen or use a hierarchical analysis before applying a batch test. Sample identifiers alone do not establish independence. With seven incoming observations, estimates are sensitive to outliers and departures from the t-test model. The test concerns the mean, not every aspect of a distribution.

The ImageRep interval estimates uncertainty within an image conditional on its segmentation. The Welch interval estimates uncertainty in a difference between batch means from variation across observations. **ImageRep intervals are not propagated into the Welch test.** Segmentation error is not included in either interval.

A small p-value is evidence against equal means under the test assumptions. A large p-value does not establish equivalence or justify acceptance. Effect size, uncertainty, physical relevance and validated manufacturing tolerances must also inform a QC decision, as emphasised by the [ASA statement](https://www.amstat.org/asa/files/pdfs/P-ValueStatement.pdf). This comparison does not produce an accept/reject verdict. Fewer than two observations in either batch or zero combined variance produces an unavailable test; missing or nonfinite measurements stop the comparison. Unavailable tests retain their place in the adjustment family.

The [comparison script](https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/compare_physical_batches.py) records means, standard deviations, differences, intervals, p-values, adjustment settings, input hashes and software versions.

## Implementation and application

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

Compare the new batch against the saved reference, with NumPy and SciPy installed:

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

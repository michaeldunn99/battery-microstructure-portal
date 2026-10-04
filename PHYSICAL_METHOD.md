# Physical feature extraction and batch assignment

The current analysis uses joint BSE, Inlens and ETD/SE segmentation for **31 known crops and nine test crops**. Each sample has 13 physical descriptors and a separate porosity uncertainty estimate, stored as 14 numerical fields. Known batches contain seven, seven and seventeen crops for Batches 1, 2 and 3 respectively. Batch 3 is the supplier reference; batch identity is not a manufacturing-quality label.

## Inputs and image preparation

### Detector images and crop

Match BSE, Inlens and ETD images by sample identifier. Four known samples use the filename label SE for the third detector; this naming convention does not establish identical acquisition settings. Require equal pixel grids and inspect detector correspondence before stacking. No automatic registration or resampling is applied.

Select the first stored intensity channel, retain rows `int(0.1*h):int(0.9*h)` and every column, then smooth each detector with Gaussian `sigma=1.0`, `preserve_range=True`. The pixel-size setting is **0.025 µm/pixel**; it has not been independently verified from the TIFF metadata. [Image preparation code](https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/run_multichannel_experiment.py#L67).

### Joint segmentation

1. Standardize each smoothed detector within its full crop by subtracting its mean and dividing by its population standard deviation (`ddof=0`). Each pixel becomes a three-component vector of standardized BSE, Inlens and ETD/SE intensities.
2. Select up to 100,000 pixel coordinates without replacement using NumPy seed 42. Three-class Multi-Otsu on the smoothed BSE image provides initial labels. Initialize each joint centroid as the mean sampled vector in its BSE class.
3. Fit three-cluster K-means using those centroids, `n_init=1`, `random_state=42`, `max_iter=300`, `tol=1e-4` and the Lloyd algorithm. Assign every cropped pixel to its nearest fitted centroid.
4. Order the fitted centroids by their BSE coordinate. Label the clusters pore, graphite matrix and silicon from lowest to highest BSE centroid intensity.

Centroids and channel normalization are fitted separately to each image. The algorithm, initialization rule and settings stay fixed for known and test images. Constant or nonfinite channels, missing initialization classes, collapsed clusters or reaching the iteration limit stop extraction. [Segmentation code](https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/run_multichannel_experiment.py#L92).

### Phase definitions and carbon-binder allocation

The three clusters are mutually exclusive **image-based phase assignments**. The project lead identifies the bright material as silicon; the intensity rule does not validate every segmented boundary. Every phase fraction uses the full cropped image as its denominator.

Within the pore-labelled mask, calculate the median smoothed Inlens intensity. Pixels above this median form the carbon-binder allocation (`CBD`); pixels at or below it form the open-pore subset. CBD is approximately half the pore area by construction and is not an independently calibrated binder measurement.

The masks satisfy `pore = open_pore + CBD` and `pore + graphite + silicon = 100%`. CBD must not be added again as a fourth independent composition fraction. All pore geometry and ImageRep calculations use the entire pore-labelled mask, including the CBD allocation. [Mask measurement code](https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/run_multichannel_experiment.py#L131).

The method figures show four panels: smoothed BSE, Inlens, ETD/SE and the joint segmentation mask. They display matched central 900 × 900 pixel windows; measurements use the full crop. Additional rims and lines can enter the silicon-labelled class. These boundaries require validation before a segmented component can be treated as an individual particle. [Inspect the segmentation](#preprocessing-figures).

## Feature definitions

The table follows the saved CSV column order. Here, `s = 0.025 µm/pixel` and `A` is component area in pixels. Exports retain full precision. Column names containing `inclusion` or `particle` refer to the silicon-labelled mask.

| # | Exported column | Units | Calculation |
| --- | --- | --- | --- |
| 1 | `porosity_pct` | % of cropped area | `100 × mean(pore_mask)`. |
| 2 | `porosity_ci95_pct` | Percentage points | `100 × ImageRep abs_err`; conditional 95% porosity uncertainty half-width. |
| 3 | `active_material_pct` | % of cropped area | `100 × mean(graphite_mask)`. |
| 4 | `cbd_pct` | % of cropped area | `100 × mean(pore_mask AND Inlens > pore_median)`. |
| 5 | `inclusion_pct` | % of cropped area | `100 × mean(silicon_mask)`. |
| 6 | `char_length_scale_cls_um` | µm | `ImageRep integral_range × s`; pore spatial correlation scale. |
| 7 | `throat_through_plane_ly_um` | µm | Mean pore run length from every 40th column, multiplied by `s`. |
| 8 | `chord_in_plane_lx_um` | µm | Mean pore run length from every 40th row, multiplied by `s`. |
| 9 | `pore_anisotropy_ratio` | Dimensionless | Horizontal mean chord divided by vertical mean chord. |
| 10 | `particle_aspect_ratio` | Dimensionless | Mean `major_axis / max(minor_axis, 1 pixel)` for retained components with positive minor axis. |
| 11 | `particle_d10_um` | µm | 10th percentile of component `sqrt(4A / π) × s`, using components of at least 10 pixels. |
| 12 | `particle_d50_um` | µm | Median of the same component-diameter list. |
| 13 | `particle_d90_um` | µm | 90th percentile of the same component-diameter list. |
| 14 | `slurry_dispersion_index` | Percentage points | Population standard deviation of silicon-area percentages across a 4 × 4 partition. |

### Correlation and porosity uncertainty

Call ImageRep as `make_error_prediction(pore_mask.astype(int), confidence=0.95, target_error=0.05)`. Its spatial-correlation model returns `integral_range` and `abs_err`; export these as `integral_range × s` and `abs_err × 100`. The implementation uses periodic FFT two-point correlation and includes its model-error correction. This is a correlation-based calculation.

`target_error=0.05` is a relative error target, not a requirement that every interval equal ±5%. The interval estimates image representativity conditional on the segmentation and excludes phase-assignment error. A failed or nonfinite calculation stops extraction. [ImageRep call](https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/run_multichannel_experiment.py#L138); [Dahari et al.](https://doi.org/10.1002/advs.202414149).

### Pore chords and silicon-region geometry

Pad each sampled binary scan with zeros and pair positive and negative transitions; `end − start` gives the pore run length in pixels. Runs truncated by the crop boundary are included. Empty chord lists return zero, and anisotropy returns one if the vertical mean is zero. Horizontal and vertical refer to image axes; interpreting them as electrode directions requires known specimen orientation. These are two-dimensional chords, not three-dimensional pore throats or tortuosity. [Chord calculation](https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/run_multichannel_experiment.py#L139).

Label silicon-mask components using `skimage.measure.label` and measure them with `regionprops`. Retain components of at least 10 pixels. Diameter percentiles give equal weight to each retained component; no watershed separation or volume weighting is applied. Aspect ratios exclude zero minor axes and use a one-pixel minimum denominator. Empty diameter lists return zero and an empty aspect-ratio list returns one. Review these fallback values when interpreting a sample. [Component calculation](https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/run_multichannel_experiment.py#L149).

For spatial variation, `np.array_split` divides the silicon mask into 4 × 4 tiles. Calculate silicon coverage as a percentage within each tile, then use `np.std(tile_percentages, ddof=0)`. This measures local area-fraction variation in percentage points, not a validated mixing or processing defect. [Spatial calculation](https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/run_multichannel_experiment.py#L153).

## Implementation and application

### Nearest-batch assignment

The fixed classifier uses **13 assignment inputs: all 14 saved fields except D10**. This is different from the 13 physical descriptors: it includes porosity uncertainty and excludes D10. The inputs retain correlated phase fractions, the CBD allocation and derived chord anisotropy; equal numerical weights do not make them independent physical evidence.

Fit one mean vector per known batch and calculate each input's sample standard deviation across all 31 known crops (`ddof=1`). Assign each test vector to the batch with the smallest root-mean-square standardized distance:

$$
d_b=\sqrt{\frac{1}{13}\sum_{j=1}^{13}\left(\frac{x_j-\bar{x}_{bj}}{s_j}\right)^2}.
$$

Known and test vectors must use the same three-detector segmentation. Scaling and batch means use known crops only; no test label enters fitting. An exact distance tie selects the first batch in the fixed order Batch 1, Batch 2, Batch 3. The rule identifies the closest known batch mean, not manufacturing equivalence. [Assignment calculation](https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/assign_multichannel_tests.py#L120).

For the website comparison, the **relative similarity share** is $(1/d_b)/\sum_k(1/d_k)$. These inverse-distance scores sum to 100% across the three batches. Equal distances give one third each; zero-distance matches share all the weight equally. All cells use one fixed numerical colour scale: red at zero, orange at one sixth, pale green at one third and dark green at 100%. Separate green, orange and red text annotations identify first, second and third rank. Outlined cells identify supplied organiser labels, independently of the predicted assignment. This display transformation preserves the nearest-mean assignment and is not a calibrated probability or validation confidence.

### Assignment validation and confidence

Leave out one known crop, refit scaling and batch means on the other 30, then classify the omitted crop. Repeat for all 31 crops. The fixed rule correctly assigns **18 of 31 crops (58.1% accuracy; 49.3% balanced accuracy)**. For each predicted batch, divide correct assignments by all assignments to that batch:

| Predicted batch | Correct / predicted | Observed validation rate | Confidence band |
| --- | --- | --- | --- |
| Batch 1 | 3 / 6 | 50.0% | Medium |
| Batch 2 | 2 / 10 | 20.0% | Low |
| Batch 3 | 13 / 15 | 86.7% | High |

The reporting bands are **High above 70%, Medium from 50% to 70% inclusive, and Low below 50%**. They summarize class-level observed precision, not calibrated probabilities for individual images. Images assigned to the same batch share the same rate. Rates depend on the validation class composition and small sample counts.

Distance margins, agreement across 31 crop-omission refits and the assigned class's empirical distance envelope are retained as diagnostics. They do not change these reporting bands. [Validation calculation](https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/assign_multichannel_tests.py#L156); [reporting thresholds](https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/assign_multichannel_tests.py#L209).

The organisers describe crops from approximately 15 source electrode images, arranged into batches. A crop-to-parent mapping has not been established for this analysis, so crop-level validation may be optimistic. Future validation should hold out entire source images when that mapping is known.

Supplied labels identify `3e122cbj` as Batch 2, `fn0mhxef` as Batch 1 and `xrv9xvzb` as Batch 3. The classifier assigns them to Batches 1, 2 and 3 respectively. These labels were available before the complete test evaluation and were not used to fit the classifier or calculate its confidence rates. Labels for the other six images have not been supplied. Batch assignment and its confidence band do not establish manufacturing acceptance.

### Apply the pipeline to new images

Arrange detector triplets in a named folder under a data directory: `img_<sample>_BSE.tif`, `img_<sample>_Inlens.tif` and `img_<sample>_ETD.tif` (or `_SE.tif`). Check detector correspondence and use the same acquisition scale and specimen orientation as the reference.

Run from the portal repository with NumPy, SciPy, scikit-image, scikit-learn, Matplotlib, Pillow and the recorded ImageRep checkout available:

```bash
python scripts/run_multichannel_experiment.py \
  --data-dir /path/to/data \
  --batch-name test_1 \
  --imagerep-path /path/to/ImageRep \
  --run-dir /path/to/new-extraction
```

Use a new run directory. The reported method is identified by `variant=stacked_three_channel` in `features.csv`. Extraction retains full-precision measurements, full-crop masks, diagnostic figures, input hashes, fitted segmentation centroids, settings, software versions and source snapshots. Diagnostic outputs do not change which variant the classifier selects.

First evaluate and record the assignment rule using known data, then apply it to the extracted test vectors in the same assignment output directory:

```bash
python scripts/assign_multichannel_tests.py \
  --known-csv public/multichannel/known_batches.csv \
  --confidence-policy empirical_precision_v2 \
  --output-dir /path/to/new-assignments

python scripts/assign_multichannel_tests.py \
  --known-csv public/multichannel/known_batches.csv \
  --test-csv /path/to/new-extraction/features.csv \
  --confidence-policy empirical_precision_v2 \
  --output-dir /path/to/new-assignments
```

The assignment script requires NumPy and selects only combined-method rows. It checks the fixed 31-known-crop cohort, distinct known/test identifiers, finite inputs and positive training standard deviations. It records the fitted centroids, validation predictions, feature contributions and a frozen method signature. Reusing an output directory with a changed source, specification or known input is rejected. To reproduce the reported nine assignments, use `public/multichannel/test_1.csv` as `--test-csv`.

## Reproducibility

The current known and test exports contain 40 samples and 560 physical measurement fields. The assignment record retains its input hashes and exact source hash. All nine test samples have matching detector grids; the alignment audit reports no review flags. This supports image correspondence without proving subpixel registration or chemically accurate phase boundaries.

Use the saved run records to recover exact dependency versions, ImageRep revision, input hashes and per-image settings. The complete test extraction record is `validation/multichannel/full-test-run.json`; current assignments and validation predictions are in `public/multichannel/test_assignments.json`. Numerical reproduction verifies calculations, not material identity, predictive calibration or manufacturing performance.

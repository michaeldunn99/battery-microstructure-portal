# Physical feature extraction method

Each sample is described by **13 physical descriptors and an associated porosity uncertainty estimate**. The physical descriptor vector has 13 dimensions; the saved measurement record retains all 14 numerical fields, with the uncertainty in the second column. Storing an uncertainty estimate alongside the descriptors does not itself define an uncertainty-aware prediction model. The dataset contains 31 samples: seven from Batch 1, seven from Batch 2 and seventeen from the Batch 3 reference. The [feature CSV](https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/public/physical_feature_vectors.csv) records these values with batch and sample identifiers.

## Inputs and image preparation

The calculation uses paired BSE and Inlens images with matching pixel grids. It selects the first intensity channel, retains the central 80% of image rows (`int(0.1*h):int(0.9*h)`) and keeps every column. Gaussian smoothing is applied to both images with `sigma=1.0` and `preserve_range=True`. The pixel-size setting for the reported values is **0.025 µm/pixel**.

Multi-Otsu with three classes determines two thresholds independently for each denoised BSE image. The algorithm and its settings are fixed; the numerical thresholds are fitted per image. Destriping, plane correction and reference-fitted intensity quantiles are not part of this calculation. See [image preparation and thresholding](https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/extract_physical_features.py#L70).

## Phase assignment

The BSE thresholds define three masks:

- Pore: `BSE < T_pore`.
- Matrix: `T_pore <= BSE < T_inc`.
- Inclusion: `BSE >= T_inc`.

Within the pore mask, the median Inlens intensity divides pixels into `open_pore` at or below the median and `cbd` above it. **CBD is a median-split estimate**, approximately half the pore fraction, rather than an independently calibrated binder measurement. All area fractions use the full cropped image as denominator. The phase names express the physical interpretation assigned to the intensity regions.

The masks satisfy `porosity = open_pore + cbd` and `porosity + matrix + inclusion = 100%`. CBD is therefore a subdivision of the pore-labelled region and must not be added to the latter three as another independent composition fraction. See [mask definitions](https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/extract_physical_features.py#L113).

## Feature definitions

The table follows the CSV column order. Here, `s` is pixel size and `A` is component area in pixels. Values are exported to two decimal places.

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

## Implementation and application

The [extraction code](https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/scripts/extract_physical_features.py) accepts a batch directory, pixel size, ImageRep checkout and output path. From the portal repository directory:

```bash
python scripts/extract_physical_features.py \
  --batch-dir /path/to/test-set \
  --batch-name Test_Set \
  --pixel-size-um 0.025 \
  --imagerep-path /path/to/ImageRep \
  --output-csv /path/to/new-physical-features.csv
```

To process one sample, add `--sample-id 0grcilhi` and point the batch directory to its image files. Existing output is protected unless `--overwrite` is supplied. The output status is `EVALUATE`; measurement extraction does not assign a manufacturing release decision.

Use one measurement specification for the reference and test batches: the same crop, scale, smoothing, per-image thresholding rule, median split, scan spacing, component filters, spatial partition and ImageRep settings. Record image identifiers, calibration, dependencies and ImageRep revision. Compare individual sample values and batch distributions against Batch 3. Numerical acceptance limits require separate validation against manufacturing requirements.

## Reproducibility

The extractor was run on all 31 samples: 17 from Batch 3, seven from Batch 1 and seven from Batch 2. All 434 feature values matched the saved measurements to two decimal places, with no differences. Parameters, dependency versions and input hashes are recorded in the [validation record](https://github.com/michaeldunn99/battery-microstructure-portal/blob/main/validation/physical-rerun.json).

For example, sample `0grcilhi` produced:

`13.43, 2.26, 79.58, 6.71, 6.99, 2.76, 0.53, 0.62, 1.17, 2.35, 0.09, 0.14, 0.34, 4.05`.

Its horizontal and vertical mean chords satisfy `0.6151298268974701 / 0.5269602106495027 = 1.1673174073983579`, exported as anisotropy `1.17`. Reproducing these measurements does not validate the phase assignments or establish manufacturing acceptance limits.

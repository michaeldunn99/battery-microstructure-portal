# Historical physical extraction commands

These files preserve the exact Python `-c` arguments recovered with `shlex` from the four specified session-log steps. Each file has a source-step identifier and SHA-256 of the original Python argument. Recovery checked Python syntax and exact text preservation without executing the commands or changing saved measurements.

| Source | Session / step | Purpose |
| --- | --- | --- |
| [extract_physical_run.py](extract_physical_run.py) | `1d25a9a7-3136-498a-a8db-b4635e0d0ebc`, 179 | Original full-precision physical extraction and historical QC labels. |
| [export_fingerprint_step438.py](export_fingerprint_step438.py) | `5649c85d-3d33-4f9c-bad6-eb841d3b5996`, 438 | Initial pandas-based selection and rounding of 14 numerical fields. |
| [export_fingerprint_step440.py](export_fingerprint_step440.py) | Same session, 440 | Standard-library export of 14 numerical fields formatted to two decimal places. |
| [append_interface_step472.py](append_interface_step472.py) | Same session, 472 | Subsequent addition of a fifteenth numerical field from a different source or fallback. |

The files retain original relative paths, batch IDs, print statements and output-writing behaviour. They are archival commands, not a general test-set CLI. Step 179 requires the analysis workspace containing `ImageRep/`, `data/`, `tmp/data_audit/inventory.json` and `output/`. Its original launcher requested `numpy<2.0`, scipy, matplotlib, tifffile, pillow, scikit-image, scikit-learn and pandas through `uv`; exact installed package versions were not recorded in the command.

## Why the fifteenth field is excluded

The current physical vector comprises the 14 values selected by step 440. The historical 15-value CSV remains unchanged as an audit artifact.

Step 472 reads `metrics.geometry.specific_interfacial_length.value` from `output/sem-native/all-images/images/*/metadata.json` and multiplies it by 50, assuming a pixel-to-length scale of 0.020 µm/pixel. The 14 physical measurements instead use 0.025 µm/pixel. The append does not validate the metadata units or scale.

For each field ID, step 472 keeps the first metadata value encountered by an unsorted glob. Although it stores detector-specific keys, its final CSV lookup uses only the field ID. It therefore does not choose a detector explicitly. Metadata read errors are silently skipped.

If a field has no available metadata value, the command uses `2 × (porosity_pct / 100) / throat_through_plane_ly_um`, calculated from already-rounded CSV values. A nonpositive vertical chord produces the constant `0.45`. The selected value is formatted to four decimal places; its source, detector and fallback status are not recorded in the CSV.

This appended field is not a pore-boundary measurement from the recovered physical extractor. The proposed standalone example in the supplied transcript instead counts pore-mask edges at 0.025 µm/pixel, which changes the estimator. That replacement was not used for source recovery. The original append is preserved here for provenance and is excluded from the physical analysis.

## Calculation anchors

- Preparation and masks: [extraction line 25](extract_physical_run.py#L25), including central crop, σ = 1.0, per-image Multi-Otsu and the Inlens median split.
- ImageRep call and returned values: [extraction line 77](extract_physical_run.py#L77).
- Scan-run chords: [extraction line 83](extract_physical_run.py#L83).
- Inclusion component morphology: [extraction line 105](extract_physical_run.py#L105).
- Standard deviation of 4 × 4 inclusion-area percentages: [extraction line 120](extract_physical_run.py#L120).
- Historical QC rules: [extraction line 153](extract_physical_run.py#L153).
- Fourteen-field presentation mapping: [step 440 line 39](export_fingerprint_step440.py#L39).
- Interface selection and fallback: [step 472 line 7](append_interface_step472.py#L7).

The [physical method](../../PHYSICAL_METHOD.md) describes the retained measurements and the reproduction procedure.

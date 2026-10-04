# Electrode microstructure analysis

A scientific report for the Polaron materials-manufacturing challenge. The report describes physical measurements from 31 known image pairs in Batches 1, 2 and 3, plus three held-out image pairs in `test_1`.

Batch 3 is the supplier reference. Batches 1 and 2 represent different microstructural patterns, not confirmed defective or acceptable material. The organisers assembled artificial batches from crops of approximately 15 electrode images.

## Measurements

The physical extractor produces 13 descriptors and a separate porosity uncertainty estimate from paired BSE and Inlens images. The same settings were used for the known data and the three test samples. ETD is not used in this calculation. The report compares phase area, pore geometry, inclusion geometry and inclusion spatial variation in their measured units.

The original known measurements were reproduced: 434 of 434 full-precision numerical values matched. The complete specification and executable commands are in [PHYSICAL_METHOD.md](PHYSICAL_METHOD.md). Test measurements are in [test_1_physical_features.csv](public/test_1_physical_features.csv), with an [extraction record](validation/test-1-run.json).

## Interpretation

The website compares individual test vectors with known-batch summaries. Similarity scoring and batch assignment are deferred. The supplementary Welch/Holm analysis tests feature means, not class membership. Its independence assumption is unresolved because the source-image mapping is unavailable. No validated acceptance, rejection or electrochemical-performance claim follows from these results.

Legacy native-image and synthetic-3D assets remain in the repository but are not part of the current physical report.

## Run the report

```bash
npm install
npm run dev -- --port 3000
```

Production build: `npm run build`.

## Reproduce the batch figure

With NumPy, SciPy and Matplotlib installed:

```bash
python scripts/plot_physical_batches.py --input-csv public/qc_dataset_features.csv --output /path/to/batch-comparison.png
```

## Checks

```bash
python -m unittest discover -s tests -p 'test_physical*.py'
node --test tests/math-rendering.cjs
```

The Python checks require NumPy, SciPy, Pillow and scikit-image. The extraction itself also requires the ImageRep checkout and its dependencies, as recorded in the verification record.

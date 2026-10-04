# Electrode microstructure analysis

A scientific report for the Polaron materials-manufacturing challenge. The current analysis measures 31 known images in Batches 1, 2 and 3 and all nine test images, using matched BSE, Inlens and ETD or SE detector channels.

Batch 3 is the reference. Batches 1 and 2 represent different microstructural patterns, not confirmed defective or acceptable material. The source-image mapping for individual crops is unavailable.

## Measurements

Three-channel K-means produces pore, graphite and silicon-labelled masks. The extractor saves 13 physical descriptors and a separate porosity uncertainty estimate for each image. The report describes phase area, pore geometry, silicon-labelled component geometry and spatial variation in their measured units.

Current data: [31 known vectors](public/multichannel/known_batches.csv), [nine test vectors](public/multichannel/test_1.csv), [assignments and confidence](public/multichannel/test_assignments.csv), and the [complete test extraction record](validation/multichannel/full-test-run.json). The [method](PHYSICAL_METHOD.md) specifies preprocessing, segmentation, measurements and reproduction commands. The [LaTeX example](public/physical-feature-vector.tex) uses the combined-method vector for Batch 3 image `0grcilhi`.

Repeated extraction of three samples reproduced all 42 reported measurement values and three joint segmentation masks exactly. Run records also contain diagnostic variants, whose larger verification totals cover those additional calculations.

## Interpretation

Assignments use the nearest batch mean after scaling by sample standard deviations across the known images. The fixed comparison uses all 14 saved fields except D10, including porosity uncertainty and correlated derived measurements.

Confidence is the observed leave-one-image-out precision for the predicted class: Batch 1 is Medium (50%, 3/6), Batch 2 Low (20%, 2/10), and Batch 3 High (86.7%, 13/15). Bands are High above 70%, Medium from 50% to 70%, and Low below 50%. These are class-level validation rates, not calibrated probabilities for individual images or manufacturing acceptance decisions. Crop dependence and unvalidated phase boundaries remain limitations.

## Run the report

```bash
npm install
npm run dev -- --port 3000
```

Production build: `npm run build`.

## Reproduce the assignments

With NumPy installed, use a new output directory. First evaluate the known images, then apply the recorded rule to all nine test vectors:

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

## Checks

```bash
python -m unittest discover -s tests -p 'test_physical*.py'
node --test tests/math-rendering.cjs
```

The Python checks require NumPy, SciPy, Pillow and scikit-image. Three-detector extraction additionally uses scikit-learn, Matplotlib and ImageRep. Exact versions and input hashes are saved with the extraction records.

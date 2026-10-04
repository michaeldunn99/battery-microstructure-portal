#!/usr/bin/env python3
"""extract_physical_features.py

Extract the original 14-value physical fingerprint from paired BSE/Inlens images.

The output contains 13 descriptors and the ImageRep confidence-interval value.
It preserves the original physical extraction algorithm and does not calculate
interfacial length or assign a manufacturing verdict.
"""

from __future__ import annotations

import argparse
import csv
import importlib
import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from skimage.filters import gaussian, threshold_multiotsu
from skimage.measure import label, regionprops

IMAGEREP_PATH = Path(__file__).resolve().parents[2] / "ImageRep"

FEATURE_COLUMNS = [
    "porosity_pct",
    "porosity_ci95_pct",
    "active_material_pct",
    "cbd_pct",
    "inclusion_pct",
    "char_length_scale_cls_um",
    "throat_through_plane_ly_um",
    "chord_in_plane_lx_um",
    "pore_anisotropy_ratio",
    "particle_aspect_ratio",
    "particle_d10_um",
    "particle_d50_um",
    "particle_d90_um",
    "slurry_dispersion_index",
]


def load_imagerep(imagerep_path: str | Path | None = None):
    """Require ImageRep rather than substituting fabricated measurements."""
    source = Path(imagerep_path or IMAGEREP_PATH).expanduser().resolve()
    if not (source / "representativity" / "core.py").is_file():
        raise RuntimeError(
            f"ImageRep is unavailable at {source}. Provide its repository directory "
            "with --imagerep-path (or imagerep_path= when calling the extractor)."
        )
    if str(source) not in sys.path:
        sys.path.insert(0, str(source))
    try:
        imagerep = importlib.import_module("representativity.core")
    except ImportError as exc:
        raise RuntimeError(
            f"Cannot import ImageRep from {source}: {exc}. Install its dependencies "
            "before extraction; no substitute CLS or confidence interval is produced."
        ) from exc
    if Path(imagerep.__file__).resolve() != source / "representativity" / "core.py":
        raise RuntimeError(
            "A different ImageRep installation is already imported. Run extraction "
            f"in a fresh Python process using {source}."
        )
    return imagerep


def extract_single_image(
    bse_path: str | Path,
    inlens_path: str | Path,
    pixel_size_um: float = 0.025,
    *,
    imagerep_path: str | Path | None = None, full_precision: bool = False,
) -> dict:
    """Extract 14 physical values; raise if inputs or ImageRep are unavailable."""
    if not math.isfinite(pixel_size_um) or pixel_size_um <= 0:
        raise ValueError("pixel_size_um must be finite and greater than zero.")
    imagerep = load_imagerep(imagerep_path)
    # 1. Load images (first channel)
    with Image.open(bse_path) as image:
        bse_raw = np.array(image)
    if bse_raw.ndim == 3:
        bse_raw = bse_raw[:, :, 0]

    with Image.open(inlens_path) as image:
        inlens_raw = np.array(image)
    if inlens_raw.ndim == 3:
        inlens_raw = inlens_raw[:, :, 0]

    if bse_raw.ndim != 2 or inlens_raw.ndim != 2:
        raise ValueError("BSE and Inlens inputs must be two-dimensional image channels.")
    if bse_raw.shape != inlens_raw.shape:
        raise ValueError(
            f"BSE and Inlens shapes differ: {bse_raw.shape} versus {inlens_raw.shape}."
        )
    h, w = bse_raw.shape
    # 80% central vertical crop to remove SEM data/scale banners
    crop_bse = bse_raw[int(0.10 * h) : int(0.90 * h), :]
    crop_inlens = inlens_raw[int(0.10 * h) : int(0.90 * h), :]
    if not crop_bse.size:
        raise ValueError("The central 80% image crop is empty.")

    # 2. Gaussian smoothing
    denoised_bse = gaussian(crop_bse, sigma=1.0, preserve_range=True)
    denoised_inlens = gaussian(crop_inlens, sigma=1.0, preserve_range=True)

    # 3. Multi-Otsu 3-phase segmentation on BSE
    thresholds = threshold_multiotsu(denoised_bse, classes=3)
    t_pore, t_inc = thresholds[0], thresholds[1]

    raw_pore_mask = denoised_bse < t_pore
    matrix_mask = (denoised_bse >= t_pore) & (denoised_bse < t_inc)
    inc_mask = denoised_bse >= t_inc

    # 4. CBD Inlens median heuristic
    inlens_pore_median = np.median(denoised_inlens[raw_pore_mask])
    open_pore_mask = raw_pore_mask & (denoised_inlens <= inlens_pore_median)
    cbd_mask = raw_pore_mask & (denoised_inlens > inlens_pore_median)

    # Phase fractions (%)
    phi_pore = float(np.mean(raw_pore_mask)) * 100.0
    phi_matrix = float(np.mean(matrix_mask)) * 100.0
    phi_cbd = float(np.mean(cbd_mask)) * 100.0
    phi_inc = float(np.mean(inc_mask)) * 100.0

    # 5. ImageRep 2-point auto-correlation / uncertainty
    repr_res = imagerep.make_error_prediction(
        raw_pore_mask.astype(int), confidence=0.95, target_error=0.05
    )
    pore_cls_um = float(repr_res["integral_range"] * pixel_size_um)
    ci95_abs_pct = float(repr_res["abs_err"] * 100.0)

    # 6. Directional Chord Lengths (sampled every 40 px)
    y_chords, x_chords = [], []
    for col in range(0, raw_pore_mask.shape[1], 40):
        diffs = np.diff(np.concatenate(([0], raw_pore_mask[:, col].astype(int), [0])))
        starts, ends = np.where(diffs == 1)[0], np.where(diffs == -1)[0]
        y_chords.extend((ends - starts) * pixel_size_um)

    for row in range(0, raw_pore_mask.shape[0], 40):
        diffs = np.diff(np.concatenate(([0], raw_pore_mask[row, :].astype(int), [0])))
        starts, ends = np.where(diffs == 1)[0], np.where(diffs == -1)[0]
        x_chords.extend((ends - starts) * pixel_size_um)

    mean_chord_y = float(np.mean(y_chords)) if y_chords else 0.0
    mean_chord_x = float(np.mean(x_chords)) if x_chords else 0.0
    anisotropy = float(mean_chord_x / mean_chord_y) if mean_chord_y > 0 else 1.0

    # 7. Inclusion particle sizing & morphology
    inc_labeled = label(inc_mask)
    props = [p for p in regionprops(inc_labeled) if p.area >= 10]
    eq_diams = [p.equivalent_diameter_area * pixel_size_um for p in props]
    aspect_ratios = [
        p.axis_major_length / max(p.axis_minor_length, 1)
        for p in props
        if p.axis_minor_length > 0
    ]

    ar_mean = float(np.mean(aspect_ratios)) if aspect_ratios else 1.0
    d10 = float(np.percentile(eq_diams, 10)) if eq_diams else 0.0
    d50 = float(np.percentile(eq_diams, 50)) if eq_diams else 0.0
    d90 = float(np.percentile(eq_diams, 90)) if eq_diams else 0.0

    # 8. Slurry heterogeneity (4x4 spatial grid)
    tiles_y = np.array_split(inc_mask, 4, axis=0)
    tile_means = [np.mean(t) * 100.0 for ty in tiles_y for t in np.array_split(ty, 4, axis=1)]
    slurry_heterogeneity = float(np.std(tile_means))

    return {
        "porosity_pct": phi_pore if full_precision else round(phi_pore, 2),
        "porosity_ci95_pct": ci95_abs_pct if full_precision else round(ci95_abs_pct, 2),
        "active_material_pct": phi_matrix if full_precision else round(phi_matrix, 2),
        "cbd_pct": phi_cbd if full_precision else round(phi_cbd, 2),
        "inclusion_pct": phi_inc if full_precision else round(phi_inc, 2),
        "char_length_scale_cls_um": pore_cls_um if full_precision else round(pore_cls_um, 2),
        "throat_through_plane_ly_um": mean_chord_y if full_precision else round(mean_chord_y, 2),
        "chord_in_plane_lx_um": mean_chord_x if full_precision else round(mean_chord_x, 2),
        "pore_anisotropy_ratio": anisotropy if full_precision else round(anisotropy, 2),
        "particle_aspect_ratio": ar_mean if full_precision else round(ar_mean, 2),
        "particle_d10_um": d10 if full_precision else round(d10, 2),
        "particle_d50_um": d50 if full_precision else round(d50, 2),
        "particle_d90_um": d90 if full_precision else round(d90, 2),
        "slurry_dispersion_index": slurry_heterogeneity if full_precision else round(slurry_heterogeneity, 2),
    }


def main():
    parser = argparse.ArgumentParser(description="Extract 14-value physical fingerprints (13 descriptors and one ImageRep CI value).")
    parser.add_argument("--batch-dir", type=str, required=True, help="Path to batch directory containing TIFF images")
    parser.add_argument("--batch-name", type=str, required=True, help="Name of batch (e.g. Batch_Test)")
    parser.add_argument("--pixel-size-um", type=float, default=0.025, help="Isotropic pixel spacing in um")
    parser.add_argument("--output-csv", type=str, default="test_batch_features.csv", help="Output CSV path")
    parser.add_argument("--imagerep-path", type=Path, default=IMAGEREP_PATH, help="ImageRep repository directory (default: workspace ImageRep)")
    parser.add_argument("--sample-id", type=str, help="Process only this sample ID (e.g. 0grcilhi)")
    parser.add_argument("--overwrite", action="store_true", help="Allow replacement of an existing output CSV")
    parser.add_argument("--full-precision", action="store_true", help="Preserve unrounded measurements for statistical comparison")
    args = parser.parse_args()

    if not math.isfinite(args.pixel_size_um) or args.pixel_size_um <= 0:
        parser.error("--pixel-size-um must be finite and greater than zero.")
    output_path = Path(args.output_csv).expanduser()
    if output_path.exists() and not args.overwrite:
        parser.error(f"Output already exists: {output_path}. Use --overwrite to replace it.")
    batch_path = Path(args.batch_dir)
    bse_files = sorted(batch_path.glob("*_BSE.tif"))
    if args.sample_id:
        bse_files = [
            path for path in bse_files
            if path.stem.removeprefix("img_").removesuffix("_BSE") == args.sample_id
        ]
    if not bse_files:
        parser.error(f"No matching *_BSE.tif images found in {batch_path}.")

    pairs = [
        (path, path.with_name(path.name.removesuffix("_BSE.tif") + "_Inlens.tif"))
        for path in bse_files
    ]
    missing = [str(inlens) for _, inlens in pairs if not inlens.is_file()]
    if missing:
        parser.error("Missing paired Inlens input(s): " + ", ".join(missing))

    print(f"Processing {len(bse_files)} samples for {args.batch_name}...")
    rows = []
    for bse_file, inlens_file in pairs:
        sample_id = bse_file.stem.removeprefix("img_").removesuffix("_BSE")
        try:
            res = extract_single_image(
                bse_file, inlens_file, pixel_size_um=args.pixel_size_um,
                imagerep_path=args.imagerep_path, full_precision=args.full_precision,
            )
        except (OSError, ValueError, RuntimeError, ImportError) as exc:
            parser.error(f"Extraction failed for {sample_id}: {exc}")
        res["batch"] = args.batch_name
        res["sample_id"] = sample_id
        res["qc_verdict"] = "EVALUATE"
        rows.append(res)
        print(f"  Processed {sample_id}: Porosity={res['porosity_pct']}%, ChordY={res['throat_through_plane_ly_um']} um")

    # Write only after every selected image succeeds. Exclusive creation also
    # protects an existing CSV if another process creates it during extraction.
    cols = ["batch", "sample_id", *FEATURE_COLUMNS, "qc_verdict"]
    try:
        with output_path.open("w" if args.overwrite else "x", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=cols)
            writer.writeheader()
            for row in rows:
                writer.writerow({
                    **row,
                    **{column: row[column] if args.full_precision else f"{row[column]:.2f}" for column in FEATURE_COLUMNS},
                })
    except OSError as exc:
        parser.error(f"Cannot write output CSV: {exc}")
    print(f"\nExtraction complete! Saved {len(rows)} samples to {output_path}")


if __name__ == "__main__":
    main()

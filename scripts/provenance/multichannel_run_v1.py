#!/usr/bin/env python3
"""Separate three-detector segmentation experiment; original exports are read-only."""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
from pathlib import Path
import platform
import shutil
import subprocess
import sys

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.colors import ListedColormap
from matplotlib.patches import Patch
import numpy as np
from PIL import Image
import sklearn
import scipy
import skimage
import PIL
from sklearn.cluster import KMeans
from skimage.filters import gaussian, threshold_multiotsu
from skimage.measure import label, regionprops
from threadpoolctl import threadpool_limits

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "portal/scripts"))
from extract_physical_features import FEATURE_COLUMNS, load_imagerep
from compare_physical_batches import FEATURES

PIXEL_SIZE = .025
VARIANTS = ["original_bse_otsu", "bse_kmeans_control", "stacked_three_channel"]
PHASES = ["Pore-labelled", "Graphite-labelled", "Silicon-labelled"]
COLOURS = ["#202020", "#b7bbc0", "#bd8b43"]


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def inventory(data_dir):
    rows = []
    for batch in ["Batch_1", "Batch_2", "Batch_3", "test_1"]:
        for bse in sorted((data_dir / batch).glob("img_*_BSE.tif")):
            sample = bse.stem.removeprefix("img_").removesuffix("_BSE")
            inlens = bse.with_name(f"img_{sample}_Inlens.tif")
            thirds = [bse.with_name(f"img_{sample}_{name}.tif") for name in ["ETD", "SE"]]
            thirds = [p for p in thirds if p.exists()]
            if not inlens.exists() or len(thirds) != 1:
                raise ValueError(f"Expected BSE/Inlens and exactly one ETD or SE file: {sample}")
            rows.append({"sample_id": sample, "batch": batch, "paths": [bse, inlens, thirds[0]],
                         "third_channel": thirds[0].stem.rsplit("_", 1)[1]})
    if not rows:
        raise ValueError("No samples found")
    return rows


def load_channels(paths):
    images, shapes = [], []
    for path in paths:
        with Image.open(path) as im:
            raw = np.array(im)
        if raw.ndim == 3:
            raw = raw[:, :, 0]
        if raw.ndim != 2:
            raise ValueError(f"Expected a 2D intensity image: {path}")
        shapes.append(raw.shape)
        h = raw.shape[0]
        images.append(gaussian(raw[int(.1*h):int(.9*h), :], sigma=1.0, preserve_range=True))
    if len(set(shapes)) != 1:
        raise ValueError("Channels have different pixel grids; no automatic resize or registration is performed")
    return images, shapes[0]


def otsu_mask(bse):
    low, high = threshold_multiotsu(bse, classes=3)
    labels = np.zeros(bse.shape, dtype=np.uint8)
    labels[bse >= low] = 1
    labels[bse >= high] = 2
    return labels, [float(low), float(high)]


def clustered_mask(channels, original, seed=42, max_pixels=100_000):
    means = np.array([im.mean() for im in channels])
    scales = np.array([im.std(ddof=0) for im in channels])
    if not np.isfinite(scales).all() or np.any(scales <= 0):
        raise ValueError("A detector image is constant or nonfinite")
    flat = [im.ravel() for im in channels]
    sampled_indices = np.random.default_rng(seed).choice(original.size, min(max_pixels, original.size), replace=False)
    sampled = (np.column_stack([im[sampled_indices] for im in flat]) - means) / scales
    sampled_labels = original.ravel()[sampled_indices]
    if set(sampled_labels) != {0, 1, 2}:
        raise ValueError("The sampled pixels do not contain all three initial BSE classes")
    initial = np.array([sampled[sampled_labels == phase].mean(axis=0) for phase in range(3)])
    model = KMeans(n_clusters=3, init=initial, n_init=1, random_state=seed,
                   max_iter=300, tol=1e-4, algorithm="lloyd").fit(sampled)
    if model.n_iter_ >= 300:
        raise ValueError("Clustering reached the iteration limit")
    if len(set(model.labels_)) != 3:
        raise ValueError("Clustering did not retain three distinct classes")
    # Map joint clusters to the same intensity-based interpretation as the original.
    order = np.argsort(model.cluster_centers_[:, 0], kind="stable")
    mapping = np.empty(3, dtype=np.uint8)
    mapping[order] = np.arange(3)
    labels = np.empty(original.size, dtype=np.uint8)
    for start in range(0, labels.size, 250_000):
        end = min(start + 250_000, labels.size)
        pixels = (np.column_stack([im[start:end] for im in flat]) - means) / scales
        labels[start:end] = mapping[model.predict(pixels)]
    return labels.reshape(original.shape), {
        "channel_means": means.tolist(), "channel_population_sd": scales.tolist(),
        "initial_normalised_centres_in_original_phase_order": initial.tolist(),
        "normalised_cluster_centres_in_phase_order": model.cluster_centers_[order].tolist(),
        "raw_cluster_centres_in_phase_order": (model.cluster_centers_[order] * scales + means).tolist(),
        "sampled_pixels": len(sampled_indices), "seed": seed, "iterations": int(model.n_iter_),
        "normalisation": "Per-image mean and population SD; each included channel has equal weight",
        "initialisation": "Means of sampled pixels in the original three BSE Multi-Otsu masks",
        "phase_mapping": "Increasing BSE cluster-centre intensity: pore, graphite, silicon",
    }


def measure_masks(labels, inlens, core):
    """Original downstream calculations, with the segmentation masks as inputs."""
    pore, matrix, silicon = labels == 0, labels == 1, labels == 2
    if not 0 < pore.mean() < 1:
        raise ValueError("Pore mask cannot be empty or fill the image")
    median = np.median(inlens[pore])
    cbd = pore & (inlens > median)
    uncertainty = core.make_error_prediction(pore.astype(int), confidence=.95, target_error=.05)
    chords = []
    for axis in ["y", "x"]:
        lines = (pore[:, col] for col in range(0, pore.shape[1], 40)) if axis == "y" else (pore[row, :] for row in range(0, pore.shape[0], 40))
        lengths = []
        for line in lines:
            diffs = np.diff(np.concatenate(([0], line.astype(int), [0])))
            starts, ends = np.where(diffs == 1)[0], np.where(diffs == -1)[0]
            lengths.extend((ends - starts) * PIXEL_SIZE)
        chords.append(float(np.mean(lengths)) if lengths else 0.0)
    ly, lx = chords
    props = [p for p in regionprops(label(silicon)) if p.area >= 10]
    diameters = [p.equivalent_diameter_area * PIXEL_SIZE for p in props]
    ratios = [p.axis_major_length / max(p.axis_minor_length, 1) for p in props if p.axis_minor_length > 0]
    d10, d50, d90 = np.percentile(diameters, [10, 50, 90]) if diameters else [0., 0., 0.]
    tiles = [100*np.mean(tile) for band in np.array_split(silicon, 4, axis=0) for tile in np.array_split(band, 4, axis=1)]
    values = [100*float(pore.mean()), 100*float(uncertainty["abs_err"]),
              100*float(matrix.mean()), 100*float(cbd.mean()), 100*float(silicon.mean()),
              PIXEL_SIZE*float(uncertainty["integral_range"]), ly, lx, lx/ly if ly > 0 else 1.,
              float(np.mean(ratios)) if ratios else 1., float(d10), float(d50), float(d90), float(np.std(tiles, ddof=0))]
    if not np.isfinite(values).all():
        raise ValueError("A physical calculation returned a nonfinite value")
    return dict(zip(FEATURE_COLUMNS, values))


def saved_features():
    result = {}
    aliases = {f["key"]: f["raw_key"] for f in FEATURES}
    aliases["porosity_ci95_pct"] = "ci95_abs_pct"
    for filename, canonical in [("qc_dataset_features.csv", False), ("test_1_physical_features.csv", True)]:
        with (ROOT / "portal/public" / filename).open(newline="") as handle:
            for row in csv.DictReader(handle):
                result[row["sample_id"]] = {key: float(row[key if canonical else aliases[key]]) for key in FEATURE_COLUMNS}
    return result


def mask_comparison(original, candidate):
    output = {"changed_pixel_fraction": float(np.mean(original != candidate))}
    for k, name in enumerate(["pore", "graphite", "silicon"]):
        a, b = original == k, candidate == k
        output[name + "_iou"] = float(np.sum(a & b) / np.sum(a | b))
        output[name + "_dice"] = float(2 * np.sum(a & b) / (np.sum(a) + np.sum(b)))
        output[name + "_changed_pixel_fraction"] = float(np.mean(a != b))
    return output


def draw_masks(row, channels, masks, measurements, output):
    # Display a fixed centre window; segmentation and measurements use the full crop.
    h, w = channels[0].shape
    size = min(900, h, w)
    y, x = (h-size)//2, (w-size)//2
    view = (slice(y, y+size), slice(x, x+size))
    fig, axes = plt.subplots(2, 3, figsize=(12, 9.8))
    for ax, im, name in zip(axes[0], channels, ["BSE", "Inlens", row["third_channel"]]):
        ax.imshow(im[view], cmap="gray", vmin=float(im.min()), vmax=float(im.max()))
        ax.set_title(name, fontweight="bold")
    for ax, mask, variant, title in zip(axes[1], masks, VARIANTS,
                                      ["Original BSE Multi-Otsu", "BSE-only clustering control", "Three-channel clustering"]):
        value = measurements[variant]
        ax.imshow(mask[view], cmap=ListedColormap(COLOURS), vmin=0, vmax=2, interpolation="nearest")
        ax.set_title(f"{title}\nPore {value['porosity_pct']:.2f}%; silicon {value['inclusion_pct']:.2f}%", fontsize=11)
    for ax in axes.flat:
        ax.set_axis_off()
    fig.suptitle(f"{row['batch']} / {row['sample_id']}: matched detector views and masks", fontsize=14, fontweight="bold")
    fig.legend(handles=[Patch(facecolor=c, label=p) for c, p in zip(COLOURS, PHASES)],
               loc="lower center", bbox_to_anchor=(.5, .055), ncol=3, frameon=False)
    fig.text(.5, .022, f"Same central {size} × {size} pixel display window. Percentages use the entire {h} × {w} pixel crop.\nIntensity clusters are candidate phase masks; CBD median allocation is not shown.", ha="center", fontsize=9)
    fig.subplots_adjust(left=.025, right=.975, top=.94, bottom=.13, wspace=.04, hspace=.12)
    fig.savefig(output, dpi=150, facecolor="white")
    plt.close(fig)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-dir", type=Path, default=ROOT / "data")
    parser.add_argument("--run-dir", type=Path, required=True)
    parser.add_argument("--sample-id", action="append", default=[])
    args = parser.parse_args()
    if args.run_dir.exists():
        parser.error("Run directory already exists; choose a new directory")
    rows = inventory(args.data_dir)
    if args.sample_id:
        rows = [r for r in rows if r["sample_id"] in args.sample_id]
        if set(args.sample_id) != {r["sample_id"] for r in rows}:
            parser.error("Requested sample not found")
    args.run_dir.mkdir(parents=True)
    (args.run_dir / "figures").mkdir()
    (args.run_dir / "masks").mkdir()
    original_values = saved_features()
    core = load_imagerep(ROOT / "ImageRep")
    source_files = [Path(__file__), ROOT / "portal/scripts/extract_physical_features.py",
                    ROOT / "portal/scripts/compare_physical_batches.py", Path(core.__file__)]
    source_dir = args.run_dir / "source_snapshot"
    source_dir.mkdir()
    source_hashes = {str(p): digest(p) for p in source_files}
    for path in source_files:
        shutil.copy2(path, source_dir / path.name)
    imagerep_revision = subprocess.check_output(["git", "-C", str(ROOT / "ImageRep"), "rev-parse", "HEAD"], text=True).strip()
    records, features = [], []
    for index, row in enumerate(rows):
        print(f"[{index+1}/{len(rows)}] {row['batch']}/{row['sample_id']} ({row['third_channel']})", flush=True)
        channels, native_shape = load_channels(row["paths"])
        original, thresholds = otsu_mask(channels[0])
        # Validate the unchanged downstream calculation against saved full precision.
        baseline = measure_masks(original, channels[1], core)
        errors = {key: abs(baseline[key] - original_values[row["sample_id"]][key]) for key in FEATURE_COLUMNS}
        if max(errors.values()) > 1e-10:
            raise ValueError(f"Original-method reproduction failed for {row['sample_id']}: {errors}")
        with threadpool_limits(limits=1):
            bse, bse_fit = clustered_mask(channels[:1], original)
            stacked, stack_fit = clustered_mask(channels, original)
        masks = [original, bse, stacked]
        measured = {VARIANTS[0]: baseline, VARIANTS[1]: measure_masks(bse, channels[1], core),
                    VARIANTS[2]: measure_masks(stacked, channels[1], core)}
        for variant, mask in zip(VARIANTS, masks):
            features.append({"batch": row["batch"], "sample_id": row["sample_id"],
                             "third_channel": row["third_channel"], "variant": variant, **measured[variant]})
            Image.fromarray(mask).save(args.run_dir / "masks" / f"{row['sample_id']}_{variant}.png")
        draw_masks(row, channels, masks, measured, args.run_dir / "figures" / f"{row['sample_id']}.png")
        records.append({"batch": row["batch"], "sample_id": row["sample_id"], "third_channel": row["third_channel"],
                        "input_files": [{"path": str(p), "sha256": digest(p)} for p in row["paths"]],
                        "native_shape": list(native_shape), "crop_shape": list(original.shape),
                        "original_thresholds": thresholds, "original_max_absolute_feature_error": max(errors.values()),
                        "fits": {VARIANTS[1]: bse_fit, VARIANTS[2]: stack_fit}, "measurements": measured,
                        "agreement_with_original": {VARIANTS[1]: mask_comparison(original, bse), VARIANTS[2]: mask_comparison(original, stacked)},
                        "added_channel_effect": mask_comparison(bse, stacked)})
        (args.run_dir / "progress.json").write_text(json.dumps(records, allow_nan=False) + "\n")
        print("  pore fractions: " + ", ".join(f"{v}={measured[v]['porosity_pct']:.2f}%" for v in VARIANTS), flush=True)
    with (args.run_dir / "features.csv").open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["batch", "sample_id", "third_channel", "variant", *FEATURE_COLUMNS])
        writer.writeheader()
        writer.writerows(features)
    report = {"experiment": "Three-channel intensity segmentation v1", "status": "Exploratory side experiment; original results unchanged",
              "method": {"pixel_size_um": PIXEL_SIZE, "crop": "central 80% rows, all columns", "gaussian_sigma_px": 1,
                         "third_channel": "ETD or SE, treated as the third detector at the user's direction",
                         "registration": "No registration or resampling; matched pixel grids assumed, separate alignment audit",
                         "clustering": "Three KMeans intensity classes; per-image channel z-scores; 100000 sampled pixels; BSE Multi-Otsu initial centres; seed42; n_init1",
                         "downstream": "Same 14 saved physical fields, including the separate heuristic Inlens median CBD allocation",
                         "silicon": "Bright phase identified as silicon by the user; intensity-derived boundaries still require validation",
                         "agreement": "Mask IoU, Dice and changed-pixel fractions measure agreement, not accuracy against ground truth",
                         "test_labels": "Not used in segmentation, measurement or settings"},
              "script_sha256": digest(__file__), "original_extractor_sha256": digest(ROOT / "portal/scripts/extract_physical_features.py"),
              "source_hashes": source_hashes, "imagerep_revision": imagerep_revision,
              "versions": {"python": platform.python_version(), "numpy": np.__version__, "sklearn": sklearn.__version__,
                           "scipy": scipy.__version__, "skimage": skimage.__version__, "pillow": PIL.__version__,
                           "matplotlib": matplotlib.__version__},
              "samples": records}
    (args.run_dir / "report.json").write_text(json.dumps(report, indent=2, allow_nan=False) + "\n")
    print(f"Wrote {len(rows)} × 3 feature records to {args.run_dir}")


if __name__ == "__main__":
    main()

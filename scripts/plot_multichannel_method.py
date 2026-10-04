#!/usr/bin/env python3
"""Plot detector inputs and saved joint masks without repeating segmentation.

Run from the bio-hack workspace:
  uv run --offline --with 'numpy<2.0,scipy,matplotlib,pillow,scikit-image' \
    python portal/scripts/plot_multichannel_method.py
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import platform
import sys

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.colors import ListedColormap
from matplotlib.patches import Patch
import numpy as np
from PIL import Image
import PIL
import skimage
from skimage.filters import gaussian

WORKSPACE = Path(__file__).resolve().parents[2]
KNOWN_IDS = ("4ih2ggld", "0grcilhi", "rxax5ozo")
TEST_IDS = ("0eryguqq", "3e122cbj", "4hq27w4c", "fhwrjtet", "fn0mhxef",
            "fspqbkxl", "soo2ax3r", "xrv9xvzb", "y59rxmxl")
COLOURS = ("#202020", "#b7bbc0", "#bd8b43")
PHASES = ("Pore-labelled", "Graphite-labelled", "Silicon-labelled")


def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def draw_sample(run_dir, record, output_dir):
    sample_id = record["sample_id"]
    channels = []
    for source in record["input_files"]:
        path = Path(source["path"])
        if sha256(path) != source["sha256"]:
            raise ValueError(f"Input changed since extraction: {path}")
        with Image.open(path) as image:
            raw = np.asarray(image)
        if raw.ndim == 3:
            raw = raw[:, :, 0]
        h = raw.shape[0]
        channels.append(gaussian(raw[int(.1*h):int(.9*h), :], sigma=1.0, preserve_range=True))

    mask_path = run_dir / "masks" / f"{sample_id}_stacked_three_channel.png"
    with Image.open(mask_path) as image:
        mask = np.asarray(image)
    expected_shape = tuple(record["crop_shape"])
    if any(channel.shape != expected_shape for channel in channels) or mask.shape != expected_shape:
        raise ValueError(f"Input/mask crop mismatch: {sample_id}")
    if set(np.unique(mask)) != {0, 1, 2}:
        raise ValueError(f"Expected three saved mask labels: {sample_id}")
    values = record["measurements"]["stacked_three_channel"]
    for label, key in enumerate(("porosity_pct", "active_material_pct", "inclusion_pct")):
        if abs(100 * float(np.mean(mask == label)) - values[key]) > 1e-10:
            raise ValueError(f"Saved mask and measurement disagree: {sample_id}/{key}")

    h, w = mask.shape
    size = min(900, h, w)
    y, x = (h-size)//2, (w-size)//2
    view = (slice(y, y+size), slice(x, x+size))
    fig, axes = plt.subplots(1, 4, figsize=(12, 4.4))
    for axis, channel, title in zip(axes[:3], channels, ("(a) BSE", "(b) Inlens", f"(c) {record['third_channel']}")):
        axis.imshow(channel[view], cmap="gray", vmin=float(channel.min()), vmax=float(channel.max()))
        axis.set_title(title, fontsize=11, fontweight="bold")
    axes[3].imshow(mask[view], cmap=ListedColormap(COLOURS), vmin=0, vmax=2, interpolation="nearest")
    axes[3].set_title("(d) Joint mask", fontsize=11, fontweight="bold")
    for axis in axes:
        axis.set_axis_off()
    batch = record["batch"].replace("Batch_", "Batch ")
    fig.suptitle(f"{batch} / {sample_id}: detector inputs and joint segmentation", fontsize=13, fontweight="bold", y=.97)
    fig.legend(handles=[Patch(facecolor=colour, label=phase) for colour, phase in zip(COLOURS, PHASES)],
               loc="lower center", bbox_to_anchor=(.5, .115), ncol=3, frameon=False, fontsize=10)
    fig.text(.5, .025,
             f"Central {size} × {size} pixel window. Full-crop area: pore {values['porosity_pct']:.2f}%, "
             f"graphite {values['active_material_pct']:.2f}%, silicon {values['inclusion_pct']:.2f}%.\n"
             f"Full crop: {h} × {w} pixels. Detector views are Gaussian-smoothed (σ = 1 pixel). CBD allocation is not shown.",
             ha="center", fontsize=8.5)
    fig.subplots_adjust(left=.015, right=.985, bottom=.235, top=.865, wspace=.045)
    output = output_dir / f"{sample_id}.png"
    fig.savefig(output, dpi=150, facecolor="white")
    plt.close(fig)
    with Image.open(output) as image:
        dimensions = list(image.size)
    if dimensions != [1800, 660]:
        raise ValueError(f"Unexpected figure dimensions: {dimensions}")
    return {
        "sample_id": sample_id, "batch": record["batch"], "third_channel": record["third_channel"],
        "run_report": str(run_dir / "report.json"), "run_report_sha256": sha256(run_dir / "report.json"),
        "inputs": record["input_files"], "saved_mask": str(mask_path), "saved_mask_sha256": sha256(mask_path),
        "crop_shape": list(expected_shape), "display_window_yx": [y, x, size, size],
        "output": output.name, "output_sha256": sha256(output), "dimensions_width_height": dimensions,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    base = WORKSPACE / "experiments/multichannel_segmentation_v1"
    parser.add_argument("--known-run-dir", type=Path, default=base / "results")
    parser.add_argument("--test-run-dir", type=Path, default=base / "full_test")
    parser.add_argument("--output-dir", type=Path, default=WORKSPACE / "portal/public/multichannel/method")
    parser.add_argument("--overwrite", action="store_true")
    args = parser.parse_args()
    if args.output_dir.exists() and any(args.output_dir.iterdir()) and not args.overwrite:
        parser.error("Output directory is not empty; choose another or use --overwrite")
    args.output_dir.mkdir(parents=True, exist_ok=True)
    records = []
    for run_dir, sample_ids in ((args.known_run_dir, KNOWN_IDS), (args.test_run_dir, TEST_IDS)):
        report = json.loads((run_dir / "report.json").read_text())
        samples = {record["sample_id"]: record for record in report["samples"]}
        for sample_id in sample_ids:
            records.append(draw_sample(run_dir, samples[sample_id], args.output_dir))
            print(f"Plotted {sample_id}", flush=True)
    provenance = {
        "method": "Three smoothed detector views and the existing stacked_three_channel mask; no segmentation or feature extraction rerun",
        "display_preparation": "First stored channel, central 80% of rows, full width, Gaussian sigma1 preserve_range=True; each detector displayed using its full-crop min/max",
        "mask_labels": {"0": "pore-labelled", "1": "graphite-labelled", "2": "silicon-labelled"},
        "script": str(Path(__file__).resolve()), "script_sha256": sha256(__file__), "arguments": sys.argv[1:],
        "versions": {"python": platform.python_version(), "numpy": np.__version__, "matplotlib": matplotlib.__version__,
                     "pillow": PIL.__version__, "skimage": skimage.__version__},
        "figures": records,
    }
    (args.output_dir / "provenance.json").write_text(json.dumps(provenance, indent=2) + "\n")
    print(f"Verified {len(records)} figures at 1800 × 660 pixels")


if __name__ == "__main__":
    main()

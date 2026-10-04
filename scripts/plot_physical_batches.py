#!/usr/bin/env python3
"""Reproduce the physical batch distributions from unrounded measurements."""

import argparse
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

from compare_physical_batches import read_measurements


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input-csv", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--overwrite", action="store_true")
    args = parser.parse_args()
    if args.output.resolve() == args.input_csv.resolve():
        parser.error("Output must not overwrite the input CSV")
    if args.output.exists() and not args.overwrite:
        parser.error("Output exists; use --overwrite to replace it")
    measurements = read_measurements(args.input_csv)
    batches = ["Batch_3", "Batch_1", "Batch_2"]
    metrics = [
        ("porosity_pct", "Pore-labelled area", "Area fraction (%)"),
        ("active_material_pct", "Graphite-labelled matrix", "Area fraction (%)"),
        ("inclusion_pct", "Bright inclusions", "Area fraction (%)"),
        ("throat_through_plane_ly_um", "Vertical pore chord length", "Mean chord length (µm)"),
    ]
    colors = ["#89919c", "#b97373", "#6f94b4"]
    plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 9,
                         "axes.spines.top": False, "axes.spines.right": False})
    fig, axes = plt.subplots(1, 4, figsize=(16, 4), layout="constrained")
    rng = np.random.default_rng(2026)
    # Reuse each image's horizontal jitter in all panels for visual consistency.
    jitter = [rng.uniform(-0.055, 0.055, len(measurements[b])) for b in batches]
    for ax, (key, title, unit) in zip(axes, metrics):
        data = [[row[key] for row in measurements[b].values()] for b in batches]
        boxes = ax.boxplot(data, widths=0.5, patch_artist=True, showfliers=False,
                           whis=1.5, medianprops={"color": "#24262a", "linewidth": 1.4})
        for box, color in zip(boxes["boxes"], colors):
            box.set_facecolor(color)
            box.set_alpha(0.5)
        for i, (values, color) in enumerate(zip(data, colors)):
            ax.scatter(i + 1 + jitter[i], values, s=24, c=color,
                       edgecolors="#30343a", linewidths=0.6, zorder=3)
        ax.set_title(title, fontweight="semibold", pad=12)
        ax.set_ylabel(unit)
        ax.set_xticks([1, 2, 3], ["Batch 3\nReference · n = 17", "Batch 1\nn = 7", "Batch 2\nn = 7"])
        ax.grid(axis="y", color="#e4e4e7", linestyle=":")
        ax.set_axisbelow(True)
    fig.savefig(args.output, dpi=225, facecolor="white")
    plt.close(fig)
    print(f"Wrote {args.output}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Build the website's fixed, descriptive three-detector comparison.

Uses Python's standard library. Measurements are checked against the experiment
record before export. Confirmed test labels are displayed only after assignment.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
from pathlib import Path
import statistics


FEATURES = [
    ("porosity_pct", "Pore area fraction", "%", 2),
    ("porosity_ci95_pct", "Porosity uncertainty half-width", "percentage points", 2),
    ("active_material_pct", "Graphite-labelled area fraction", "%", 2),
    ("cbd_pct", "Carbon-binder allocation", "%", 2),
    ("inclusion_pct", "Silicon-labelled area fraction", "%", 2),
    ("char_length_scale_cls_um", "Pore correlation length scale", "µm", 3),
    ("throat_through_plane_ly_um", "Vertical pore chord length", "µm", 3),
    ("chord_in_plane_lx_um", "Horizontal pore chord length", "µm", 3),
    ("pore_anisotropy_ratio", "Pore chord anisotropy", "ratio", 3),
    ("particle_aspect_ratio", "Silicon-labelled component aspect ratio", "ratio", 2),
    ("particle_d10_um", "Silicon-labelled component diameter D10", "µm", 3),
    ("particle_d50_um", "Silicon-labelled component diameter D50", "µm", 3),
    ("particle_d90_um", "Silicon-labelled component diameter D90", "µm", 3),
    ("slurry_dispersion_index", "Silicon-labelled area spatial variation", "percentage points", 2),
]
BATCHES = ["Batch_3", "Batch_1", "Batch_2"]
ORIGINAL = "original_bse_otsu"
COMBINED = "stacked_three_channel"
VARIANTS = [ORIGINAL, "bse_kmeans_control", COMBINED]
OUTPUTS = ["original_known.csv", "known_batches.csv", "test_1.csv", "summary.json"]


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def estimates(values):
    return {"mean": statistics.mean(values), "sd": statistics.stdev(values)}


def load_measurements(run_dir):
    report = json.loads((run_dir / "report.json").read_text())
    with (run_dir / "features.csv").open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        columns = reader.fieldnames
        rows = list(reader)
    expected_columns = ["batch", "sample_id", "third_channel", "variant"] + [f[0] for f in FEATURES]
    if columns != expected_columns:
        raise ValueError("Unexpected measurement columns or order")
    samples = {(s["batch"], s["sample_id"]): s for s in report["samples"]}
    if len(samples) != len(report["samples"]):
        raise ValueError("Duplicate sample in experiment record")
    identities = set()
    for row in rows:
        identity = (row["batch"], row["sample_id"], row["variant"])
        if identity in identities or None in row or any(v is None for v in row.values()):
            raise ValueError("Duplicate or malformed measurement row")
        identities.add(identity)
        source = samples[identity[:2]]
        if row["variant"] not in VARIANTS or row["third_channel"] != source["third_channel"]:
            raise ValueError("Variant or detector metadata disagree")
        for key, _, _, _ in FEATURES:
            value = float(row[key])
            if not math.isfinite(value) or value != source["measurements"][row["variant"]][key]:
                raise ValueError(f"CSV and experiment record disagree: {identity}/{key}")
    expected = {(batch, sample_id, variant) for batch, sample_id in samples for variant in VARIANTS}
    if identities != expected:
        raise ValueError("Missing sample or segmentation variant")
    return rows, columns, report


def merge_test_measurements(original_rows, test_rows, original_report, test_report):
    """Keep the 31 known images fixed and replace the test records with a full run."""
    if original_report["method"] != test_report["method"]:
        raise ValueError("Known and test runs use different measurement settings")
    if any(row["batch"] in BATCHES for row in test_rows):
        raise ValueError("The test run must not contain known-batch training rows")
    known_rows = [row for row in original_rows if row["batch"] in BATCHES]
    previous_tests = [row for row in original_rows if row["batch"] not in BATCHES]
    test_index = {(r["batch"], r["sample_id"], r["variant"]): r for r in test_rows}
    known_ids = {r["sample_id"] for r in known_rows}
    if known_ids & {r["sample_id"] for r in test_rows}:
        raise ValueError("A test image duplicates a known training image")
    for previous in previous_tests:
        repeated = test_index.get((previous["batch"], previous["sample_id"], previous["variant"]))
        if repeated is None:
            raise ValueError("The full test run must retain all previously reported test images")
        if repeated["third_channel"] != previous["third_channel"] or any(
            float(repeated[key]) != float(previous[key]) for key, _, _, _ in FEATURES
        ):
            raise ValueError("A previously reported test measurement has changed")
    return known_rows + test_rows


def assignments(rows, variant):
    # Use the same fixed inputs for both methods. D10 is constant in the original
    # known data; exclude it in both, rather than changing inputs by method.
    keys = [f[0] for f in FEATURES if f[0] != "particle_d10_um"]
    known = [r for r in rows if r["variant"] == variant and r["batch"] in BATCHES]
    tests = [r for r in rows if r["variant"] == variant and r["batch"] not in BATCHES]
    scales = {key: statistics.stdev(float(r[key]) for r in known) for key in keys}
    if any(scale <= 0 for scale in scales.values()):
        raise ValueError("A comparison input has zero known-data variance")
    centres = {batch: {key: statistics.mean(float(r[key]) for r in known if r["batch"] == batch)
                       for key in keys} for batch in BATCHES}
    outputs = {}
    for row in tests:
        distances = {batch: math.sqrt(statistics.mean(((float(row[key]) - centre[key]) / scales[key]) ** 2
                                                    for key in keys)) for batch, centre in centres.items()}
        nearest = min(distances, key=distances.get)
        outputs[row["sample_id"]] = {"assignment": nearest, "distances": distances}
    return outputs, {"feature_keys": keys, "known_sample_sd": scales, "batch_means": centres}


def build_summary(rows, report, labels):
    index = {(r["variant"], r["batch"], r["sample_id"]): r for r in rows}
    known = [r for r in rows if r["variant"] == COMBINED and r["batch"] in BATCHES]
    tests = sorted((r for r in rows if r["variant"] == COMBINED and r["batch"] not in BATCHES),
                   key=lambda row: (row["sample_id"] not in labels, row["sample_id"]))
    counts = {batch: sum(r["batch"] == batch for r in known) for batch in BATCHES}
    if counts != {"Batch_3": 17, "Batch_1": 7, "Batch_2": 7} or not tests:
        raise ValueError("Unexpected sample counts for this fixed comparison")
    if not set(labels).issubset({r["sample_id"] for r in tests}) or any(b not in BATCHES for b in labels.values()):
        raise ValueError("Confirmed labels do not match the supplied test images")
    labelled_ids = [r["sample_id"] for r in tests if r["sample_id"] in labels]
    unlabelled_ids = [r["sample_id"] for r in tests if r["sample_id"] not in labels]
    summaries = []
    for key, label, unit, decimals in FEATURES:
        batch_values = []
        for batch in BATCHES:
            values = {name: estimates([float(r[key]) for r in rows if r["variant"] == variant and r["batch"] == batch])
                      for name, variant in [("original", ORIGINAL), ("combined", COMBINED)]}
            batch_values.append({"batch": batch, "n": counts[batch], **values})
        summaries.append({"key": key, "label": label, "unit": unit, "decimals": decimals,
                          "batches": batch_values,
                          "tests": [{"sample_id": r["sample_id"], "original": float(index[(ORIGINAL, r["batch"], r["sample_id"])][key]),
                                     "combined": float(r[key])} for r in tests]})
    original_assignments, original_model = assignments(rows, ORIGINAL)
    combined_assignments, combined_model = assignments(rows, COMBINED)
    return {
        "schema_version": 2,
        "scope": f"Exploratory comparison on 31 known images, {len(labelled_ids)} labelled follow-up images and {len(unlabelled_ids)} additional images without supplied labels",
        "batch_counts": [{"batch": batch, "n": counts[batch]} for batch in BATCHES],
        "test_ids": [r["sample_id"] for r in tests],
        "test_counts": {"total": len(tests), "labelled_follow_up": len(labelled_ids), "unlabelled": len(unlabelled_ids)},
        "test_groups": [{"key": "labelled_follow_up", "label": "Previously labelled images", "sample_ids": labelled_ids},
                        {"key": "unlabelled", "label": "Additional images without supplied labels", "sample_ids": unlabelled_ids}],
        "method": report["method"],
        "measurements": summaries,
        "assignment_method": {"rule": "Nearest centroid by RMS standardised distance", "scale": "Sample SD across the 31 known images, fitted separately for each segmentation method",
                              "inputs": "All 14 saved fields except D10; includes porosity uncertainty and derived fields",
                              "confidence": "Uncalibrated; distances are not class probabilities or acceptance criteria",
                              "label_use": "Confirmed labels are used only for comparison after predictions",
                              "original_model": original_model, "combined_model": combined_model},
        "assignments": [{"sample_id": r["sample_id"], "original": original_assignments[r["sample_id"]],
                         "combined": combined_assignments[r["sample_id"]], "confirmed_batch": labels.get(r["sample_id"]),
                         "label_status": "labelled_follow_up" if r["sample_id"] in labels else "not_supplied"}
                        for r in tests],
    }, known, tests


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run-dir", type=Path, default=Path("../experiments/multichannel_segmentation_v1/results"))
    parser.add_argument("--test-run-dir", type=Path, help="Complete additional run containing all test images; known images remain from --run-dir")
    parser.add_argument("--labels", type=Path, default=Path("validation/test-1-labels.json"))
    parser.add_argument("--output-dir", type=Path, default=Path("public/multichannel"))
    parser.add_argument("--overwrite", action="store_true")
    args = parser.parse_args()
    if not args.overwrite and any((args.output_dir / name).exists() for name in OUTPUTS):
        parser.error("Output exists; use --overwrite to regenerate the fixed report")
    rows, columns, report = load_measurements(args.run_dir)
    numeric_values_checked = len(rows) * len(FEATURES)
    test_sources = {}
    if args.test_run_dir:
        test_rows, test_columns, test_report = load_measurements(args.test_run_dir)
        if test_columns != columns:
            raise ValueError("Known and test measurement columns differ")
        numeric_values_checked += len(test_rows) * len(FEATURES)
        rows = merge_test_measurements(rows, test_rows, report, test_report)
        test_sources = {"test_features_csv_sha256": digest(args.test_run_dir / "features.csv"),
                        "test_report_json_sha256": digest(args.test_run_dir / "report.json")}
    label_record = json.loads(args.labels.read_text())
    summary, known, tests = build_summary(rows, report, label_record["labels"])
    summary["sources"] = {"features_csv_sha256": digest(args.run_dir / "features.csv"),
                          "report_json_sha256": digest(args.run_dir / "report.json"),
                          "confirmed_labels_sha256": digest(args.labels), "generator_sha256": digest(Path(__file__)), **test_sources}
    summary["verification"] = {"samples": len(rows) // 3, "variants_per_sample": 3,
                               "numeric_fields_checked": numeric_values_checked, "csv_report_max_error": 0}
    args.output_dir.mkdir(parents=True, exist_ok=True)
    for name, records in [("known_batches.csv", known), ("test_1.csv", tests)]:
        with (args.output_dir / name).open("w", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=columns)
            writer.writeheader()
            writer.writerows(records)
    original_columns = [key for key in columns if key != "variant"]
    with (args.output_dir / "original_known.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=original_columns)
        writer.writeheader()
        writer.writerows({key: row[key] for key in original_columns} for row in rows
                         if row["variant"] == ORIGINAL and row["batch"] in BATCHES)
    summary["exports"] = {name: digest(args.output_dir / name) for name in OUTPUTS if name.endswith(".csv")}
    (args.output_dir / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2, allow_nan=False) + "\n")
    print(f"Wrote {len(known)} known and {len(tests)} test measurements; checked {numeric_values_checked} values against the experiment records.")


if __name__ == "__main__":
    main()

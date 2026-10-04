#!/usr/bin/env python3
"""Compare physical descriptors using Welch tests; no training or QC verdict.

Run all intended batch comparisons together to define one Holm testing family.
Input rows are image/sample summaries, not pixels or segmented components.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import platform
from pathlib import Path

import numpy as np
import scipy
from scipy import stats

FEATURES = [
  {"key":"porosity_pct","raw_key":"porosity_pct","label":"Pore area fraction","unit":"%"},
  {"key":"active_material_pct","raw_key":"matrix_graphite_pct","label":"Graphite area fraction","unit":"%"},
  {"key":"cbd_pct","raw_key":"cbd_pct","label":"Carbon-binder allocation","unit":"%"},
  {"key":"inclusion_pct","raw_key":"inclusion_pct","label":"Inclusion area fraction","unit":"%"},
  {"key":"char_length_scale_cls_um","raw_key":"pore_cls_um","label":"Characteristic length scale","unit":"µm"},
  {"key":"throat_through_plane_ly_um","raw_key":"chord_y_um","label":"Vertical pore chord length","unit":"µm"},
  {"key":"chord_in_plane_lx_um","raw_key":"chord_x_um","label":"Horizontal pore chord length","unit":"µm"},
  {"key":"pore_anisotropy_ratio","raw_key":"pore_anisotropy","label":"Pore anisotropy","unit":"ratio"},
  {"key":"particle_aspect_ratio","raw_key":"particle_aspect_ratio","label":"Inclusion aspect ratio","unit":"ratio"},
  {"key":"particle_d10_um","raw_key":"particle_d10_um","label":"Inclusion diameter D10","unit":"µm"},
  {"key":"particle_d50_um","raw_key":"particle_d50_um","label":"Inclusion diameter D50","unit":"µm"},
  {"key":"particle_d90_um","raw_key":"particle_d90_um","label":"Inclusion diameter D90","unit":"µm"},
  {"key":"slurry_dispersion_index","raw_key":"slurry_heterogeneity","label":"Inclusion spatial variation","unit":"percentage points"}
]


def read_measurements(path: Path) -> dict[str, dict[str, dict[str, float]]]:
    """Read either raw or canonical columns, rejecting conflicting aliases."""
    batches: dict[str, dict[str, dict[str, float]]] = {}
    with path.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        columns = reader.fieldnames or []
        if len(columns) != len(set(columns)):
            raise ValueError(f"{path.name}: duplicate column names")
        if not {"batch", "sample_id"}.issubset(columns):
            raise ValueError(f"{path.name}: batch and sample_id columns are required")
        aliases = {}
        for feature in FEATURES:
            names = list(dict.fromkeys([feature["key"], feature["raw_key"]]))
            aliases[feature["key"]] = [name for name in names if name in columns]
            if not aliases[feature["key"]]:
                raise ValueError(f"{path.name}: missing feature {feature['key']}")
        for line, row in enumerate(reader, start=2):
            if None in row or any(value is None for value in row.values()):
                raise ValueError(f"{path.name}:{line}: inconsistent column count")
            batch, sample = row["batch"].strip(), row["sample_id"].strip()
            if not batch or not sample:
                raise ValueError(f"{path.name}:{line}: empty batch or sample_id")
            samples = batches.setdefault(batch, {})
            if sample in samples:
                raise ValueError(f"{path.name}: duplicate sample_id {batch}/{sample}")
            values = {}
            for key, names in aliases.items():
                try:
                    candidates = [float(row[name]) for name in names]
                except ValueError as exc:
                    raise ValueError(f"{path.name}:{line}: invalid or missing {key}") from exc
                if not all(math.isfinite(value) for value in candidates):
                    raise ValueError(f"{path.name}:{line}: nonfinite {key}")
                if len(set(candidates)) != 1:
                    raise ValueError(f"{path.name}:{line}: ambiguous aliases for {key}")
                values[key] = candidates[0]
            samples[sample] = values
    if not batches:
        raise ValueError(f"{path.name}: no measurement rows")
    return batches


def compare_feature(reference: list[float], incoming: list[float], key: str) -> dict:
    """Estimate an incoming-minus-reference difference and pointwise 95% CI."""
    n_ref, n_inc = len(reference), len(incoming)
    # Exact constant samples can acquire round-off variance via np.mean/std.
    # Preserve their true zero variance rather than generating a spurious test.
    ref_constant, inc_constant = len(set(reference)) == 1, len(set(incoming)) == 1
    ref_mean = float(reference[0]) if ref_constant else float(np.mean(reference))
    inc_mean = float(incoming[0]) if inc_constant else float(np.mean(incoming))
    ref_sd = (0.0 if ref_constant else float(np.std(reference, ddof=1))) if n_ref >= 2 else None
    inc_sd = (0.0 if inc_constant else float(np.std(incoming, ddof=1))) if n_inc >= 2 else None
    result = {
        "key": key,
        "reference_mean": ref_mean, "reference_sd": ref_sd,
        "incoming_mean": inc_mean, "incoming_sd": inc_sd,
        "difference": inc_mean - ref_mean,
        "ci95_low": None, "ci95_high": None,
        "t_statistic": None, "degrees_of_freedom": None,
        "p_value": None, "p_adjusted": None,
        "status": "not_estimable", "reason": None,
    }
    if n_ref < 2 or n_inc < 2:
        result["reason"] = "At least two independent samples per batch are required."
        return result
    ref_term, inc_term = ref_sd**2 / n_ref, inc_sd**2 / n_inc
    se2 = ref_term + inc_term
    if se2 == 0:
        result["reason"] = "Both sample variances are zero; Welch standard error is zero."
        return result
    df = se2**2 / (ref_term**2 / (n_ref - 1) + inc_term**2 / (n_inc - 1))
    se = math.sqrt(se2)
    statistic = result["difference"] / se
    margin = float(stats.t.ppf(0.975, df)) * se
    result.update(
        ci95_low=result["difference"] - margin,
        ci95_high=result["difference"] + margin,
        t_statistic=statistic, degrees_of_freedom=df,
        p_value=float(2 * stats.t.sf(abs(statistic), df)),
        status="ok",
    )
    if not all(math.isfinite(value) for value in result.values() if isinstance(value, float)):
        raise ValueError(f"Numerical overflow while comparing {key}")
    return result


def holm_adjust(p_values: list[float | None]) -> list[float | None]:
    """Holm FWER adjustment, reserving unavailable tests as p=1 slots.

    Unavailable tests are returned as null, never as observed p-values.
    Holm does not require independence between the descriptor tests.
    """
    if any(p is not None and (not math.isfinite(p) or not 0 <= p <= 1) for p in p_values):
        raise ValueError("p-values must be finite probabilities or None")
    order = sorted(range(len(p_values)), key=lambda index: 1 if p_values[index] is None else p_values[index])
    adjusted: list[float | None] = [None] * len(p_values)
    previous = 0.0
    for rank, index in enumerate(order):
        value = 1.0 if p_values[index] is None else p_values[index]
        previous = max(previous, min(1.0, (len(p_values) - rank) * value))
        if p_values[index] is not None:
            adjusted[index] = previous
    return adjusted


def compare_batches(reference_path: Path, incoming_path: Path, reference_batch: str,
                    incoming_batches: list[str]) -> dict:
    if not incoming_batches or len(set(incoming_batches)) != len(incoming_batches):
        raise ValueError("Specify at least one distinct incoming batch; duplicates are not allowed")
    if reference_batch in incoming_batches:
        raise ValueError("Self-comparison with the reference batch is not allowed")
    reference_data = read_measurements(reference_path)
    incoming_data = reference_data if incoming_path.resolve() == reference_path.resolve() else read_measurements(incoming_path)
    if reference_batch not in reference_data:
        raise ValueError(f"Reference batch {reference_batch} is absent")
    reference = reference_data[reference_batch]
    comparisons = []
    for batch in incoming_batches:
        if batch not in incoming_data:
            raise ValueError(f"Incoming batch {batch} is absent")
        incoming = incoming_data[batch]
        overlap = reference.keys() & incoming.keys()
        if overlap:
            raise ValueError(f"Reference and incoming sample IDs overlap: {', '.join(sorted(overlap))}")
        features = [compare_feature(
            [row[feature["key"]] for row in reference.values()],
            [row[feature["key"]] for row in incoming.values()], feature["key"],
        ) for feature in FEATURES]
        comparisons.append({"batch": batch, "reference_n": len(reference),
                            "incoming_n": len(incoming), "features": features})
    all_tests = [feature for batch in comparisons for feature in batch["features"]]
    for feature, adjusted in zip(all_tests, holm_adjust([test["p_value"] for test in all_tests])):
        feature["p_adjusted"] = adjusted
    return {
        "schema_version": 1,
        "method": {
            "test": "Welch t-test", "alternative": "two-sided", "confidence_level": 0.95,
            "multiple_testing": "Holm", "adjustment_scope": "All 13 descriptors across all requested incoming batches",
            "family_size": len(all_tests), "alpha": 0.05,
            "unit_of_analysis": "One image/sample feature vector",
            "assumptions": [
                "Image/sample rows are independent within and between batches; this is an unverified sampling assumption.",
                "Welch inference allows unequal variances; small samples require approximately normal sample-level distributions.",
                "Confidence intervals are pointwise, not simultaneous; Holm adjusts p-values only.",
                "Porosity uncertainty is excluded from the 13 descriptors and is not propagated in these tests.",
                "Unavailable tests retain slots in the Holm family and return null p-values.",
                "Statistical differences do not establish defects, equivalence, or manufacturing acceptance criteria.",
            ],
        },
        "inputs": {
            "reference": {"filename": reference_path.name, "sha256": hashlib.sha256(reference_path.read_bytes()).hexdigest()},
            "incoming": {"filename": incoming_path.name, "sha256": hashlib.sha256(incoming_path.read_bytes()).hexdigest()},
        },
        "reference_batch": reference_batch, "features": FEATURES, "comparisons": comparisons,
        "software": {"python": platform.python_version(), "numpy": np.__version__, "scipy": scipy.__version__},
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--reference-csv", type=Path, required=True)
    parser.add_argument("--reference-batch", default="Batch_3")
    parser.add_argument("--incoming-csv", type=Path)
    parser.add_argument("--incoming-batch", action="append", required=True)
    parser.add_argument("--output-json", type=Path, required=True)
    parser.add_argument("--overwrite", action="store_true")
    args = parser.parse_args()
    incoming_path = args.incoming_csv or args.reference_csv
    try:
        if args.output_json.resolve() in {args.reference_csv.resolve(), incoming_path.resolve()}:
            raise ValueError("Output must not overwrite an input CSV")
        report = compare_batches(args.reference_csv, incoming_path, args.reference_batch, args.incoming_batch)
        output = json.dumps(report, indent=2, ensure_ascii=False, allow_nan=False) + "\n"
        with args.output_json.open("w" if args.overwrite else "x", encoding="utf-8") as handle:
            handle.write(output)
    except (ValueError, OSError) as exc:
        parser.error(str(exc))
    print(f"Wrote {report['method']['family_size']} descriptor comparisons to {args.output_json}")


if __name__ == "__main__":
    main()

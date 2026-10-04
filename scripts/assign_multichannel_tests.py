#!/usr/bin/env python3
"""Assign multichannel physical vectors with a fixed, transparent centroid rule.

First run without --test-csv to freeze the method and evaluate known crops.
Then supply --test-csv with the same output directory. No test labels are used.
Confidence bands describe heuristic assignment support, never probabilities or
manufacturing acceptance. All evaluation remains provisional at crop level.
"""
from __future__ import annotations

import argparse
import csv
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import platform

import numpy as np


CLASSES = ("Batch_1", "Batch_2", "Batch_3")
VARIANT = "stacked_three_channel"
FEATURES = (
    ("porosity_pct", "Pore-labelled area fraction", "%"),
    ("porosity_ci95_pct", "Porosity uncertainty half-width", "percentage points"),
    ("active_material_pct", "Graphite-labelled area fraction", "%"),
    ("cbd_pct", "Carbon-binder allocation", "%"),
    ("inclusion_pct", "Silicon-labelled area fraction", "%"),
    ("char_length_scale_cls_um", "Pore correlation length", "µm"),
    ("throat_through_plane_ly_um", "Vertical pore chord", "µm"),
    ("chord_in_plane_lx_um", "Horizontal pore chord", "µm"),
    ("pore_anisotropy_ratio", "Horizontal/vertical pore chord ratio", "ratio"),
    ("particle_aspect_ratio", "Silicon-labelled domain aspect ratio", "ratio"),
    ("particle_d50_um", "Silicon-labelled domain diameter D50", "µm"),
    ("particle_d90_um", "Silicon-labelled domain diameter D90", "µm"),
    ("slurry_dispersion_index", "Silicon-labelled area spatial variation", "percentage points"),
)
KEYS = tuple(item[0] for item in FEATURES)
# Fixed before inspecting the full test vectors. These are design choices,
# not empirically calibrated probability cutoffs or optimized hyperparameters.
THRESHOLDS = {
    "High": {"oof_precision_min": 0.85, "oof_prediction_count_min": 5,
             "relative_margin_min": 0.25, "leave_one_crop_out_agreement_min": 0.90},
    "Medium": {"oof_precision_min": 0.60, "oof_prediction_count_min": 5,
               "relative_margin_min": 0.10, "leave_one_crop_out_agreement_min": 0.75},
}
SUPPORT_QUANTILE = 0.95
POLICIES = ("conservative_v1", "empirical_precision_v2")
CONFIDENCE_POLICY_V2 = {
    "requested_by": "User", "threshold_source": "Explicit user instruction; no outcome-based threshold search",
    "revision_context": "Reporting bands revised after the v1 assignment summary. The fitted classifier, features and assignments are unchanged.",
    "score": "100 * correctly assigned known crops / all known crops predicted as the assigned class in leave-one-crop-out evaluation",
    "score_scope": "Class-level observed validation precision; not an individual calibrated probability",
    "thresholds": {"High": "strictly greater than70%", "Medium": "50% through70%, inclusive", "Low": "below50%"},
    "other_checks": "Distance margin, omission agreement and empirical support envelope remain diagnostics and do not change this user-defined band",
}
LIMITATIONS = [
    "The ratings are heuristic assignment support, not calibrated probabilities.",
    "Known crops may share original images; parent-image groups are unavailable. Leave-one-crop-out evaluation can therefore be optimistic.",
    "Per-class precision estimates are based on few crop predictions and unknown test class proportions.",
    "Thirteen equally standardized exported fields retain correlated and derived variables, including porosity uncertainty and the carbon-binder allocation. They are not thirteen independent physical mechanisms.",
    "The support envelope is an empirical distance summary, not a conformal prediction region or a 95% probability statement.",
    "Leave-one-crop-out agreement measures sensitivity to individual known crops, not correctness or uncertainty in phase boundaries.",
    "Silicon-labelled mask boundaries remain unvalidated and can include rims or lines; pore chords do not establish three-dimensional transport.",
    "Three earlier test identities have already been revealed. This is not an untouched external validation exercise; test labels are nevertheless excluded from fitting and confidence calculations.",
    "Batch identity does not establish manufacturing quality. No accept or reject decision is produced.",
]


def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def canonical_hash(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":"),
                                     allow_nan=False).encode()).hexdigest()


def write_json(path, value):
    Path(path).write_text(json.dumps(value, indent=2, allow_nan=False) + "\n")


def read_vectors(path, *, known):
    """Read only the requested method and split; never read test-label columns."""
    records = []
    with Path(path).open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        header = reader.fieldnames or []
        required = {"batch", "sample_id", "variant", *KEYS}
        if len(header) != len(set(header)) or not required.issubset(header):
            raise ValueError("Unique CSV columns including batch, sample_id, variant and all13 fixed fields are required")
        seen = set()
        for row in reader:
            if None in row or any(value is None for value in row.values()):
                raise ValueError("Malformed CSV row")
            if row["variant"] != VARIANT:
                continue
            batch = row["batch"].strip()
            if known and batch not in CLASSES:
                continue
            if not known and batch in CLASSES:
                raise ValueError("Test input includes known-batch rows; provide the separate test extraction")
            sample = row["sample_id"].strip()
            if not sample or sample in seen:
                raise ValueError("Sample IDs must be nonempty and unique within the selected variant")
            seen.add(sample)
            values = [float(row[key]) for key in KEYS]
            if not np.isfinite(values).all():
                raise ValueError(f"Nonfinite vector: {sample}")
            records.append({"sample_id": sample, "batch": batch,
                            "third_channel": row.get("third_channel", ""), "values": values})
    if not records:
        raise ValueError("No vectors for the selected method and split")
    if known and (len(records) != 31 or {label: sum(r["batch"] == label for r in records)
                                          for label in CLASSES} != {"Batch_1": 7, "Batch_2": 7, "Batch_3": 17}):
        raise ValueError("This frozen study requires the original31 known crops (7,7,17)")
    return records


def fit_rule(x, y):
    mean = x.mean(axis=0)
    scale = x.std(axis=0, ddof=1)
    if not np.isfinite(scale).all() or np.any(scale <= 0):
        raise ValueError("All13 frozen fields must have positive training sample SD")
    centers = np.stack([x[y == label].mean(axis=0) for label in CLASSES])
    return {"mean": mean, "scale": scale, "centroids": centers}


def distances(rule, x):
    x = np.atleast_2d(x)
    squared = ((x[:, None, :] - rule["centroids"][None, :, :]) / rule["scale"]) ** 2
    return np.sqrt(squared.mean(axis=2)), squared


def relative_margin(values):
    order = np.argsort(values, kind="stable")
    best, runner = order[:2]
    # Equal zero distances are an exact tie, not maximal alignment.
    margin = float((values[runner] - values[best]) / values[runner]) if values[runner] > 0 else 0.0
    return int(best), int(runner), margin


def wilson_interval(correct, total):
    """Descriptive binomial interval only; shared parent crops violate its model."""
    if total == 0:
        return [None, None]
    z = 1.959963984540054
    p = correct / total
    denominator = 1 + z * z / total
    center = (p + z * z / (2 * total)) / denominator
    half = z * np.sqrt(p * (1 - p) / total + z * z / (4 * total * total)) / denominator
    return [float(center - half), float(center + half)]


def evaluate_known(records):
    x = np.array([r["values"] for r in records])
    y = np.array([r["batch"] for r in records])
    rows, omission_rules = [], []
    matrix = np.zeros((3, 3), dtype=int)
    for i, record in enumerate(records):
        keep = np.arange(len(records)) != i
        rule = fit_rule(x[keep], y[keep])
        omission_rules.append(rule)
        ds, _ = distances(rule, x[i])
        best, runner, margin = relative_margin(ds[0])
        actual = CLASSES.index(record["batch"])
        matrix[actual, best] += 1
        rows.append({"sample_id": record["sample_id"], "actual_batch": record["batch"],
                     "assigned_batch": CLASSES[best], "runner_up": CLASSES[runner],
                     "correct": best == actual, "relative_margin": margin,
                     "true_class_distance": float(ds[0, actual]),
                     "distances": dict(zip(CLASSES, ds[0].tolist()))})
    per_class = {}
    for j, label in enumerate(CLASSES):
        n_predicted, n_actual, correct = int(matrix[:, j].sum()), int(matrix[j].sum()), int(matrix[j, j])
        true_distances = [r["true_class_distance"] for r in rows if r["actual_batch"] == label]
        per_class[label] = {"actual_crop_count": n_actual, "oof_prediction_count": n_predicted,
                            "oof_correct_predictions": correct,
                            "oof_precision": correct / n_predicted if n_predicted else None,
                            "oof_recall": correct / n_actual,
                            "descriptive_binomial_precision_interval95": wilson_interval(correct, n_predicted),
                            "true_class_loo_distance_quantile95": float(np.quantile(true_distances, SUPPORT_QUANTILE, method="linear")),
                            "true_class_loo_distances": true_distances}
    evaluation = {"class_order": list(CLASSES), "confusion_matrix_actual_rows_predicted_columns": matrix.tolist(),
                  "correct": int(matrix.trace()), "crop_count": len(records),
                  "accuracy": float(matrix.trace() / len(records)),
                  "balanced_accuracy": float(np.mean(matrix.diagonal() / matrix.sum(axis=1))),
                  "per_class": per_class, "predictions": rows,
                  "precision_interval_note": "Wilson intervals assume independent Bernoulli outcomes; shown descriptively only because crop dependence is unresolved.",
                  "evaluation_scope": "Fixed-rule leave-one-known-crop-out; scaling and centroids refitted using the other30 crops in each fold."}
    return evaluation, fit_rule(x, y), omission_rules


def confidence_band(precision, count, margin, stability, within_support):
    checks = {}
    for name, thresholds in THRESHOLDS.items():
        checks[name] = {
            "class_oof_precision": precision is not None and precision >= thresholds["oof_precision_min"],
            "class_oof_prediction_count": count >= thresholds["oof_prediction_count_min"],
            "relative_margin": margin >= thresholds["relative_margin_min"],
            "leave_one_crop_out_agreement": stability >= thresholds["leave_one_crop_out_agreement_min"],
            "within_assigned_class_support": bool(within_support),
        }
    band = next((name for name in THRESHOLDS if all(checks[name].values())), "Low")
    return band, checks


def precision_rating(precision):
    if precision is None:
        return "Low"
    return "High" if precision > 0.70 else "Medium" if precision >= 0.50 else "Low"


def assign_tests(test, known, evaluation, rule, omission_rules, policy="conservative_v1"):
    x = np.array([r["values"] for r in test])
    known_x = np.array([r["values"] for r in known])
    known_y = np.array([r["batch"] for r in known])
    ds, squared = distances(rule, x)
    omission_predictions = np.array([np.argmin(distances(r, x)[0], axis=1) for r in omission_rules])
    assignments = []
    for i, record in enumerate(test):
        best, runner, margin = relative_margin(ds[i])
        label = CLASSES[best]
        validation = evaluation["per_class"][label]
        stability = float(np.mean(omission_predictions[:, i] == best))
        envelope = validation["true_class_loo_distance_quantile95"]
        inside = bool(ds[i, best] <= envelope)
        band, checks = confidence_band(validation["oof_precision"], validation["oof_prediction_count"], margin, stability, inside)
        # The summed contributions equal runner-up squared RMS distance minus
        # assigned squared RMS distance. Positive values favour the assignment.
        support = (squared[i, runner] - squared[i, best]) / len(KEYS)
        features = []
        for j, (key, name, unit) in enumerate(FEATURES):
            summaries = {}
            for batch in CLASSES:
                values = known_x[known_y == batch, j]
                summaries[batch] = {"mean": float(values.mean()), "sample_sd": float(values.std(ddof=1)),
                                    "min": float(values.min()), "max": float(values.max())}
            features.append({"key": key, "label": name, "unit": unit, "value": record["values"][j],
                             "known_batches": summaries,
                             "assigned_minus_runner_squared_distance_support": float(support[j]),
                             "standardized_difference_from_assigned_mean": float((x[i, j] - rule["centroids"][best, j]) / rule["scale"][j]),
                             "difference_from_batch3_mean": float(x[i, j] - rule["centroids"][2, j])})
        ranked = sorted(features, key=lambda f: f["assigned_minus_runner_squared_distance_support"], reverse=True)
        positive = [f for f in ranked if f["assigned_minus_runner_squared_distance_support"] > 0][:5]
        counter = [f for f in reversed(ranked) if f["assigned_minus_runner_squared_distance_support"] < 0][:3]
        record_out = {"sample_id": record["sample_id"], "third_channel": record["third_channel"],
                      "assigned_batch": label, "runner_up": CLASSES[runner],
                      "confidence": band, "confidence_meaning": "Heuristic assignment support, not probability or QC release",
                      "distances": dict(zip(CLASSES, ds[i].tolist())),
                      "relative_margin": margin,
                      "squared_distance_margin": float(ds[i, runner] ** 2 - ds[i, best] ** 2),
                      "leave_one_crop_out_agreement": stability,
                      "leave_one_crop_out_votes": {label_: int(np.sum(omission_predictions[:, i] == j)) for j, label_ in enumerate(CLASSES)},
                      "assigned_class_oof_precision": validation["oof_precision"],
                      "assigned_class_oof_prediction_count": validation["oof_prediction_count"],
                      "assigned_class_support_distance95": envelope,
                      "within_assigned_class_support": inside,
                      "confidence_checks": checks,
                      "unmet_medium_conditions": [key for key, passed in checks["Medium"].items() if not passed],
                      "top_supporting_features": positive,
                      "top_counter_features": counter,
                      "features": features,
                      "manufacturing_decision": "Not evaluated"}
        if policy == "empirical_precision_v2":
            precision = validation["oof_precision"]
            correct = validation["oof_correct_predictions"]
            total = validation["oof_prediction_count"]
            votes = record_out["leave_one_crop_out_votes"][label]
            explanation = (f"{correct} of {total} held-out known crops assigned to {label.replace('_', ' ')} were correctly identified "
                           f"({100 * precision:.1f}%). This is a class-level validation rate, not an individual probability. "
                           f"{votes} of 31 crop-omission refits retained this assignment.")
            if margin < 0.10:
                explanation += f" The nearest alternatives are close (relative distance margin {100 * margin:.1f}%)."
            if not inside:
                explanation += " This image is outside the assigned class's empirical distance envelope."
            record_out.update({"diagnostic_confidence_v1": band, "confidence": precision_rating(precision),
                               "confidence_meaning": "User-defined band of class-level observed validation precision; not individual probability",
                               "confidence_pct": 100 * precision,
                               "validation_rate_pct": 100 * precision,
                               "validation_n_correct": correct, "validation_n_predictions": total,
                               "explanation": explanation})
        if not np.isclose(sum(f["assigned_minus_runner_squared_distance_support"] for f in features),
                          record_out["squared_distance_margin"], rtol=1e-10, atol=1e-12):
            raise AssertionError("Feature contributions do not sum to the squared-distance margin")
        assignments.append(record_out)
    return assignments


def export_assignment_csv(path, assignments, policy="conservative_v1"):
    if policy == "empirical_precision_v2":
        fields = ["sample_id", "assigned_batch", "confidence", "validation_rate_pct", "explanation"]
        with Path(path).open("w", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=fields)
            writer.writeheader()
            writer.writerows({key: record[key] for key in fields} for record in assignments)
        return
    fields = ["sample_id", "third_channel", "assigned_batch", "runner_up", "confidence",
              "distance_Batch_1", "distance_Batch_2", "distance_Batch_3", "relative_margin",
              "leave_one_crop_out_agreement", "assigned_class_oof_precision", "assigned_class_oof_prediction_count",
              "assigned_class_support_distance95", "within_assigned_class_support", "unmet_medium_conditions",
              "top_supporting_features", *KEYS]
    with Path(path).open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for assignment in assignments:
            row = {key: assignment[key] for key in fields if key in assignment}
            row.update({f"distance_{label}": assignment["distances"][label] for label in CLASSES})
            row.update({f["key"]: f["value"] for f in assignment["features"]})
            row["unmet_medium_conditions"] = "; ".join(assignment["unmet_medium_conditions"])
            row["top_supporting_features"] = "; ".join(f'{f["label"]}: {f["value"]:.6g} {f["unit"]}' for f in assignment["top_supporting_features"])
            writer.writerow(row)


def export_feature_csv(path, assignments):
    fields = ["sample_id", "assigned_batch", "runner_up", "feature", "label", "unit", "value",
              "assigned_minus_runner_squared_distance_support", "difference_from_batch3_mean"]
    fields += [f"{batch}_{measure}" for batch in CLASSES for measure in ("mean", "sample_sd", "min", "max")]
    with Path(path).open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for record in assignments:
            for feature in record["features"]:
                row = {key: record[key] for key in ("sample_id", "assigned_batch", "runner_up")}
                row.update({key: feature[key] for key in ("label", "unit", "value", "assigned_minus_runner_squared_distance_support", "difference_from_batch3_mean")})
                row["feature"] = feature["key"]
                for batch, summary in feature["known_batches"].items():
                    row.update({f"{batch}_{key}": value for key, value in summary.items()})
                writer.writerow(row)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--known-csv", type=Path, required=True)
    parser.add_argument("--test-csv", type=Path)
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--confidence-policy", choices=POLICIES, default="conservative_v1")
    args = parser.parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    specification = {
        "method": "Fixed nearest batch centroid using equally standardized RMS distance",
        "segmentation_variant": VARIANT, "class_order": list(CLASSES),
        "features": [{"key": key, "label": label, "unit": unit} for key, label, unit in FEATURES],
        "excluded_field": "particle_d10_um, omitted in both methods to retain the previously compared common13 fields",
        "scaling": "Sample standard deviation (ddof=1) across known training crops only; refitted inside each leave-one-out fold",
        "tie_rule": "First class in Batch_1, Batch_2, Batch_3 order; exact ties have zero relative margin",
        "relative_margin_formula": "(runner_up_distance - nearest_distance) / runner_up_distance; zero for an all-zero tie",
        "confidence_thresholds": THRESHOLDS,
        "confidence_combination": "Every condition must pass; High checked before Medium; otherwise Low",
        "support_envelope": "Assigned-class distance <=95th percentile (linear interpolation) of known true-class leave-one-crop-out distances",
        "stability": "Fraction of31 leave-one-known-crop-out refits retaining the full-fit assignment",
        "feature_contributions": "(runner-up squared standardized deviation minus assigned squared standardized deviation)/13; sum equals runner-up squared RMS distance minus assigned squared RMS distance",
        "limitations": LIMITATIONS,
    }
    specification["confidence_policy"] = args.confidence_policy
    if args.confidence_policy == "empirical_precision_v2":
        specification["confidence_policy_v2"] = CONFIDENCE_POLICY_V2
        specification["diagnostic_thresholds_v1"] = specification.pop("confidence_thresholds")
        specification["confidence_thresholds"] = CONFIDENCE_POLICY_V2["thresholds"]
        specification["confidence_combination"] = "Band the class-level observed validation precision using the user's cutoffs; geometry diagnostics do not alter the band"
    freeze_path = args.output_dir / "frozen_method.json"
    signature = {"specification_sha256": canonical_hash(specification), "known_csv_sha256": sha256(args.known_csv),
                 "script_sha256": sha256(__file__)}
    if freeze_path.exists():
        frozen = json.loads(freeze_path.read_text())
        if frozen["signature"] != signature:
            raise ValueError("Frozen method/source/known input changed; use a separate versioned output directory, never silently retune")
    else:
        if args.test_csv:
            raise ValueError("Freeze and evaluate using known data first: run once without --test-csv")
        frozen = {"frozen_utc": datetime.now(timezone.utc).isoformat(), "signature": signature,
                  "specification": specification, "runtime": {"python": platform.python_version(), "numpy": np.__version__}}
        write_json(freeze_path, frozen)
    known = read_vectors(args.known_csv, known=True)
    evaluation, rule, omission_rules = evaluate_known(known)
    write_json(args.output_dir / "known_evaluation.json", evaluation)
    with (args.output_dir / "known_loo.csv").open("w", newline="") as handle:
        fields = ["sample_id", "actual_batch", "assigned_batch", "runner_up", "correct", "relative_margin", "true_class_distance"] + [f"distance_{label}" for label in CLASSES]
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for record in evaluation["predictions"]:
            row = {key: record[key] for key in fields if key in record}
            row.update({f"distance_{label}": value for label, value in record["distances"].items()})
            writer.writerow(row)
    fitted = {key: value.tolist() for key, value in rule.items()}
    fitted.update({"feature_order": list(KEYS), "class_order": list(CLASSES), "known_sample_ids": [r["sample_id"] for r in known]})
    write_json(args.output_dir / "fitted_centroids.json", fitted)
    print(json.dumps({"known_correct": evaluation["correct"], "known_total": evaluation["crop_count"],
                      "accuracy": evaluation["accuracy"], "balanced_accuracy": evaluation["balanced_accuracy"],
                      "per_class": {key: {field: value for field, value in values.items() if field != "true_class_loo_distances"}
                                    for key, values in evaluation["per_class"].items()}}, indent=2))
    if not args.test_csv:
        return
    test = read_vectors(args.test_csv, known=False)
    if set(r["sample_id"] for r in known) & set(r["sample_id"] for r in test):
        raise ValueError("Known and test sample IDs overlap")
    assignments = assign_tests(test, known, evaluation, rule, omission_rules, args.confidence_policy)
    result = {"frozen_method": frozen, "test_csv_sha256": sha256(args.test_csv),
              "test_sample_count": len(test), "known_evaluation": evaluation,
              "assignment_counts": {label: sum(r["assigned_batch"] == label for r in assignments) for label in CLASSES},
              "confidence_counts": {level: sum(r["confidence"] == level for r in assignments) for level in ("High", "Medium", "Low")},
              "assignments": assignments}
    if args.confidence_policy == "empirical_precision_v2":
        result["confidence_policy_v2"] = CONFIDENCE_POLICY_V2
    write_json(args.output_dir / "assignments.json", result)
    export_assignment_csv(args.output_dir / "assignments.csv", assignments, args.confidence_policy)
    export_feature_csv(args.output_dir / "feature_evidence.csv", assignments)
    print(json.dumps({"test_samples": len(test), "assignment_counts": result["assignment_counts"],
                      "confidence_counts": result["confidence_counts"]}, indent=2))


if __name__ == "__main__":
    main()

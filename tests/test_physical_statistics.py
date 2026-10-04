"""Numerical and input-contract tests for the physical batch comparison CLI."""

import csv
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

import numpy as np
from scipy import stats

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "compare_physical_batches.py"
spec = importlib.util.spec_from_file_location("physical_statistics", SCRIPT)
comparison = importlib.util.module_from_spec(spec)
spec.loader.exec_module(comparison)


class NumericalTests(unittest.TestCase):
    def test_welch_matches_scipy_with_unequal_sample_sizes_and_variances(self):
        reference = [1.2, 1.9, 2.4, 2.9, 3.2, 3.9, 4.0]
        incoming = [2.1, 5.5, 6.1, 9.7]
        result = comparison.compare_feature(reference, incoming, "test")
        expected = stats.ttest_ind(incoming, reference, equal_var=False)
        interval = expected.confidence_interval(confidence_level=0.95)
        for actual, target in [
            (result["p_value"], expected.pvalue),
            (result["t_statistic"], expected.statistic),
            (result["degrees_of_freedom"], expected.df),
            (result["ci95_low"], interval.low),
            (result["ci95_high"], interval.high),
            (result["reference_sd"], np.std(reference, ddof=1)),
            (result["incoming_sd"], np.std(incoming, ddof=1)),
            (result["difference"], np.mean(incoming) - np.mean(reference)),
        ]:
            self.assertAlmostEqual(actual, target, places=12)
        self.assertEqual(result["status"], "ok")

    def test_unavailable_statistics_are_null(self):
        for reference, incoming in [([1.0], [2.0, 3.0]), ([1.0, 1.0], [2.0, 2.0])]:
            with self.subTest(reference=reference, incoming=incoming):
                result = comparison.compare_feature(reference, incoming, "test")
                self.assertEqual(result["status"], "not_estimable")
                self.assertIsNotNone(result["reason"])
                for field in ["ci95_low", "ci95_high", "t_statistic", "degrees_of_freedom", "p_value", "p_adjusted"]:
                    self.assertIsNone(result[field])
                self.assertIsNotNone(result["difference"])

    def test_one_zero_variance_is_estimable(self):
        result = comparison.compare_feature([1.0, 1.0, 1.0], [2.0, 3.0, 4.0], "test")
        self.assertEqual(result["status"], "ok")
        self.assertAlmostEqual(result["degrees_of_freedom"], 2.0)

    def test_constant_decimal_measurements_do_not_create_roundoff_p_values(self):
        value = 0.09356025796273888
        result = comparison.compare_feature([value] * 17, [value] * 7, "particle_d10_um")
        self.assertEqual(result["reference_sd"], 0.0)
        self.assertEqual(result["incoming_sd"], 0.0)
        self.assertEqual(result["difference"], 0.0)
        self.assertEqual(result["status"], "not_estimable")
        self.assertIsNone(result["p_value"])

    def test_holm_known_values_ties_and_missing_slot(self):
        np.testing.assert_allclose(comparison.holm_adjust([0.04, 0.01, 0.03, 0.2]), [0.09, 0.04, 0.09, 0.2])
        np.testing.assert_allclose(comparison.holm_adjust([0.01, 0.01, 0.03]), [0.03, 0.03, 0.03])
        adjusted = comparison.holm_adjust([0.01, None, 0.04])
        self.assertIsNone(adjusted[1])
        np.testing.assert_allclose([adjusted[0], adjusted[2]], [0.03, 0.08])
        self.assertEqual(comparison.holm_adjust([None, None]), [None, None])
        for invalid in [float("nan"), float("inf"), -0.01, 1.01]:
            with self.assertRaises(ValueError):
                comparison.holm_adjust([invalid])


class InputAndCliTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)

    def rows(self, batch="Batch_3", count=3, start=0):
        return [{"batch": batch, "sample_id": f"{batch}-{i}", **{
            feature["key"]: start + j + 0.1 * i
            for j, feature in enumerate(comparison.FEATURES)
        }} for i in range(count)]

    def write(self, name, rows, raw=False):
        aliases = {feature["key"]: feature["raw_key"] for feature in comparison.FEATURES}
        prepared = [{aliases.get(key, key) if raw else key: value for key, value in row.items()} for row in rows]
        path = self.root / name
        with path.open("w", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=list(prepared[0]))
            writer.writeheader()
            writer.writerows(prepared)
        return path

    def test_raw_and_canonical_inputs_produce_identical_measurements(self):
        rows = self.rows() + self.rows("Batch_1", start=1) + self.rows("Batch_2", start=2)
        raw = self.write("raw.csv", rows, raw=True)
        canonical = self.write("canonical.csv", rows)
        same = comparison.compare_batches(raw, raw, "Batch_3", ["Batch_1", "Batch_2"])
        separate = comparison.compare_batches(raw, canonical, "Batch_3", ["Batch_1", "Batch_2"])
        self.assertEqual(same["comparisons"], separate["comparisons"])
        self.assertEqual(same["method"]["family_size"], 26)
        self.assertEqual(len(same["features"]), 13)
        self.assertNotIn("porosity_ci95_pct", [feature["key"] for feature in same["features"]])
        json.dumps(same, allow_nan=False)

    def test_rejects_invalid_values_ids_and_aliases(self):
        for invalid in ["", "not-a-number", "NaN", "inf", "-inf"]:
            rows = self.rows()
            rows[0]["porosity_pct"] = invalid
            with self.subTest(invalid=invalid), self.assertRaises(ValueError):
                comparison.read_measurements(self.write("invalid.csv", rows))
        rows = self.rows()
        rows[1]["sample_id"] = rows[0]["sample_id"]
        with self.assertRaisesRegex(ValueError, "duplicate sample_id"):
            comparison.read_measurements(self.write("duplicate.csv", rows))
        for identifier in ["batch", "sample_id"]:
            rows = self.rows()
            rows[0][identifier] = " "
            with self.assertRaisesRegex(ValueError, "empty batch or sample_id"):
                comparison.read_measurements(self.write("empty.csv", rows))
        rows = self.rows()
        for row in rows:
            row["matrix_graphite_pct"] = row["active_material_pct"] + 1
        with self.assertRaisesRegex(ValueError, "ambiguous aliases"):
            comparison.read_measurements(self.write("aliases.csv", rows))
        for row in rows:
            row["matrix_graphite_pct"] = row["active_material_pct"]
        self.assertEqual(len(comparison.read_measurements(self.write("same-alias.csv", rows))["Batch_3"]), 3)

    def test_rejects_missing_features_and_malformed_csv(self):
        rows = self.rows()
        for row in rows:
            del row["particle_d50_um"]
        with self.assertRaisesRegex(ValueError, "missing feature"):
            comparison.read_measurements(self.write("missing.csv", rows))
        for data, error in [("batch,batch,sample_id\na,b,c\n", "duplicate column"), ("x,y\na,b\n", "columns are required")]:
            path = self.root / "malformed.csv"
            path.write_text(data)
            with self.assertRaisesRegex(ValueError, error):
                comparison.read_measurements(path)
        path = self.write("uneven.csv", self.rows())
        path.write_text(path.read_text() + "Batch_1,too-short\n")
        with self.assertRaisesRegex(ValueError, "column count"):
            comparison.read_measurements(path)

    def test_rejects_invalid_batch_selection_and_overlapping_samples(self):
        path = self.write("input.csv", self.rows() + self.rows("Batch_1"))
        for batches in [[], ["Batch_3"], ["missing"], ["Batch_1", "Batch_1"]]:
            with self.subTest(batches=batches), self.assertRaises(ValueError):
                comparison.compare_batches(path, path, "Batch_3", batches)
        rows = self.rows("Batch_1")
        rows[0]["sample_id"] = "Batch_3-0"
        incoming = self.write("overlap.csv", rows)
        with self.assertRaisesRegex(ValueError, "IDs overlap"):
            comparison.compare_batches(path, incoming, "Batch_3", ["Batch_1"])

    def test_cli_is_deterministic_and_requires_explicit_overwrite(self):
        source = self.write("source.csv", self.rows() + self.rows("Batch_1"), raw=True)
        output = self.root / "result.json"
        command = [sys.executable, str(SCRIPT), "--reference-csv", str(source),
                   "--incoming-batch", "Batch_1", "--output-json", str(output)]
        first = subprocess.run(command, capture_output=True, text=True)
        self.assertEqual(first.returncode, 0, first.stderr)
        original = output.read_bytes()
        second = subprocess.run(command, capture_output=True, text=True)
        self.assertNotEqual(second.returncode, 0)
        self.assertEqual(output.read_bytes(), original)
        overwrite = subprocess.run(command + ["--overwrite"], capture_output=True, text=True)
        self.assertEqual(overwrite.returncode, 0, overwrite.stderr)
        self.assertEqual(output.read_bytes(), original)
        source_bytes = source.read_bytes()
        protected = subprocess.run(command[:-1] + [str(source), "--overwrite"], capture_output=True, text=True)
        self.assertNotEqual(protected.returncode, 0)
        self.assertEqual(source.read_bytes(), source_bytes)


if __name__ == "__main__":
    unittest.main()

"""Verify optional unrounded extraction and stable default CSV serialization."""

import csv
import importlib.util
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import unittest

import numpy as np
from PIL import Image

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "extract_physical_features.py"
spec = importlib.util.spec_from_file_location("physical_extraction", SCRIPT)
extractor = importlib.util.module_from_spec(spec)
spec.loader.exec_module(extractor)


class ExtractionPrecisionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.directory = tempfile.TemporaryDirectory()
        cls.root = Path(cls.directory.name)
        cls.batch = cls.root / "images"
        cls.batch.mkdir()
        y, x = np.indices((137, 163))
        bse = np.full((137, 163), 120, dtype=np.uint8)
        bse[(x // 19 + y // 23) % 4 == 0] = 20
        bse[(x // 29 + y // 31) % 7 == 2] = 230
        inlens = ((3 * x + 2 * y) % 251).astype(np.uint8)
        cls.bse = cls.batch / "img_synthetic_BSE.tif"
        cls.inlens = cls.batch / "img_synthetic_Inlens.tif"
        Image.fromarray(bse).save(cls.bse)
        Image.fromarray(inlens).save(cls.inlens)
        cls.imagerep = cls.root / "imagerep"
        package = cls.imagerep / "representativity"
        package.mkdir(parents=True)
        (package / "__init__.py").write_text("")
        (package / "core.py").write_text(
            "def make_error_prediction(mask, confidence, target_error):\n"
            "    assert confidence == 0.95 and target_error == 0.05\n"
            "    assert mask.ndim == 2 and mask.min() == 0 and mask.max() == 1\n"
            "    return {'integral_range': 12.34567, 'abs_err': 0.0123456789}\n"
        )

    @classmethod
    def tearDownClass(cls):
        for name in ("representativity.core", "representativity"):
            sys.modules.pop(name, None)
        if str(cls.imagerep) in sys.path:
            sys.path.remove(str(cls.imagerep))
        cls.directory.cleanup()

    def extract(self, full_precision=False):
        return extractor.extract_single_image(
            self.bse, self.inlens, imagerep_path=self.imagerep,
            full_precision=full_precision,
        )

    def run_cli(self, full_precision=False):
        output = self.root / ("full.csv" if full_precision else "default.csv")
        command = [sys.executable, str(SCRIPT), "--batch-dir", str(self.batch),
                   "--batch-name", "Batch_Test", "--imagerep-path", str(self.imagerep),
                   "--sample-id", "synthetic", "--output-csv", str(output), "--overwrite"]
        if full_precision:
            command.append("--full-precision")
        result = subprocess.run(command, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        with output.open(newline="") as handle:
            reader = csv.DictReader(handle)
            rows = list(reader)
            self.assertEqual(reader.fieldnames, ["batch", "sample_id", *extractor.FEATURE_COLUMNS, "qc_verdict"])
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["batch"], "Batch_Test")
        self.assertEqual(rows[0]["sample_id"], "synthetic")
        return rows[0]

    def test_full_precision_preserves_calculated_values_and_default_rounds(self):
        precise, rounded = self.extract(True), self.extract()
        self.assertEqual(list(precise), extractor.FEATURE_COLUMNS)
        self.assertEqual(len(precise), 14)
        self.assertEqual(precise["char_length_scale_cls_um"], 12.34567 * 0.025)
        self.assertEqual(precise["porosity_ci95_pct"], 0.0123456789 * 100)
        self.assertGreater(sum(precise[key] != rounded[key] for key in precise), 8)
        for key in extractor.FEATURE_COLUMNS:
            self.assertEqual(rounded[key], round(precise[key], 2), key)

    def test_cli_full_precision_round_trips_all_features(self):
        row, precise = self.run_cli(True), self.extract(True)
        for key in extractor.FEATURE_COLUMNS:
            self.assertEqual(float(row[key]), precise[key], key)

    def test_cli_default_keeps_two_decimal_format(self):
        row, rounded = self.run_cli(), self.extract()
        for key in extractor.FEATURE_COLUMNS:
            self.assertIsNotNone(re.fullmatch(r"-?\d+\.\d{2}", row[key]), key)
            self.assertEqual(row[key], f"{rounded[key]:.2f}", key)


if __name__ == "__main__":
    unittest.main()

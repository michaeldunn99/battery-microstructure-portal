import { readFile } from "node:fs/promises";
import path from "node:path";

export const physicalFeatures = [
  { key: "porosity_pct", rawKey: "porosity_pct", label: "Pore area fraction", unit: "%", definition: "Pore-labelled area / image area × 100. Describes the area assigned to voids." },
  { key: "porosity_ci95_pct", rawKey: "ci95_abs_pct", label: "Porosity uncertainty", unit: "percentage points", definition: "ImageRep absolute error × 100, with confidence 0.95 and target error 0.05. Reports the porosity interval half-width." },
  { key: "active_material_pct", rawKey: "matrix_graphite_pct", label: "Graphite area fraction", unit: "%", definition: "Graphite-labelled area / image area × 100. Describes the assigned active-material fraction." },
  { key: "cbd_pct", rawKey: "cbd_pct", label: "Carbon-binder allocation", unit: "%", definition: "Pore-mask pixels above the median Inlens intensity / analysed area × 100. This heuristic assigns approximately half the pore area to CBD." },
  { key: "inclusion_pct", rawKey: "inclusion_pct", label: "Silicon particle area fraction", unit: "%", definition: "Silicon-labelled area / image area × 100. Describes bright regions; their chemistry is not established by this value." },
  { key: "char_length_scale_cls_um", rawKey: "pore_cls_um", label: "Characteristic length scale", unit: "µm", definition: "ImageRep integral_range × 0.025 µm/pixel, calculated from the binary pore mask. Describes the spatial correlation scale." },
  { key: "throat_through_plane_ly_um", rawKey: "chord_y_um", label: "Vertical pore chord length", unit: "µm", definition: "Mean uninterrupted pore run along image y, sampling every 40th column at 0.025 µm/pixel. A 2D chord, not a 3D throat width." },
  { key: "chord_in_plane_lx_um", rawKey: "chord_x_um", label: "Horizontal pore chord length", unit: "µm", definition: "Mean uninterrupted pore run along image x, sampling every 40th row at 0.025 µm/pixel." },
  { key: "pore_anisotropy_ratio", rawKey: "pore_anisotropy", label: "Pore anisotropy", unit: "ratio", definition: "Horizontal / vertical mean chord length. Values above 1 indicate longer horizontal chords." },
  { key: "particle_aspect_ratio", rawKey: "particle_aspect_ratio", label: "Silicon particle aspect ratio", unit: "ratio", definition: "Mean ellipse major axis / max(minor axis, 1 pixel), excluding zero minor axes. Calculated on silicon particle components of at least 10 pixels." },
  { key: "particle_d10_um", rawKey: "particle_d10_um", label: "Silicon particle diameter D10", unit: "µm", definition: "10th percentile of area-equivalent diameter, d = √(4A/π), for silicon particle components of at least 10 pixels. Each component has equal weight." },
  { key: "particle_d50_um", rawKey: "particle_d50_um", label: "Silicon particle diameter D50", unit: "µm", definition: "Median area-equivalent diameter of the same silicon particle components. This measures silicon particles, not graphite flakes." },
  { key: "particle_d90_um", rawKey: "particle_d90_um", label: "Silicon particle diameter D90", unit: "µm", definition: "90th percentile of the same unweighted silicon-particle-diameter distribution. Describes its larger objects." },
  { key: "slurry_dispersion_index", rawKey: "slurry_heterogeneity", label: "Silicon particle spatial variation", unit: "percentage points", definition: "Population standard deviation of silicon particle area percentages across a 4 × 4 grid. Describes local variation, not count variance / mean." },
] as const;

type Row = Record<string, string>;
export type BatchValues = Record<string, { batch3Baseline: string; batch2Candidate: string; batch1Defective: string }>;

async function readTable(filename: string): Promise<Row[]> {
  const text = await readFile(path.join(process.cwd(), "public", filename), "utf8");
  const [header, ...lines] = text.trim().split(/\r?\n/);
  const keys = header.split(",");
  return lines.map((line) => {
    const values = line.split(",");
    if (values.length !== keys.length) throw new Error(`Invalid row in ${filename}`);
    return Object.fromEntries(keys.map((key, index) => [key, values[index]]));
  });
}

export async function loadPhysicalVector() {
  const [rows, rawRows] = await Promise.all([
    readTable("physical_feature_vectors.csv"),
    readTable("qc_dataset_features.csv"),
  ]);
  const rawByImage = new Map(rawRows.map((row) => [`${row.batch}/${row.sample_id}`, row]));
  for (const row of rows) {
    const raw = rawByImage.get(`${row.batch}/${row.sample_id}`);
    if (!raw) throw new Error(`Missing physical source for ${row.sample_id}`);
    for (const feature of physicalFeatures) {
      if (!Number.isFinite(Number(row[feature.key]))) throw new Error(`Invalid ${feature.key}`);
      if (feature.rawKey && Math.abs(Number(row[feature.key]) - Number(raw[feature.rawKey])) > 0.00501) {
        throw new Error(`Physical exports disagree: ${row.sample_id}/${feature.key}`);
      }
    }
  }
  const example = rows.find((row) => row.batch === "Batch_3" && row.sample_id === "0grcilhi");
  if (!example) throw new Error("Missing example physical vector");
  return { example, count: rows.length, rows, rawRows };
}

export async function loadCombinedPhysicalVector() {
  const rows = await readTable("multichannel/known_batches.csv");
  const exampleRow = rows.find(row => row.batch === "Batch_3" && row.sample_id === "0grcilhi");
  if (!exampleRow) throw new Error("Missing combined physical vector");
  const example = { ...exampleRow };
  for (const feature of physicalFeatures) {
    const value = Number(example[feature.key]);
    if (!Number.isFinite(value)) throw new Error(`Invalid combined ${feature.key}`);
    example[feature.key] = value.toFixed(feature.unit === "µm" ? 3 : 2);
  }
  return { example, count: rows.length };
}

# Recovered Python -c argument from session 1d25a9a7-3136-498a-a8db-b4635e0d0ebc, step 179.
# Extracted using shlex; algorithm and fixed paths preserved. Not executed during recovery.
# Original argument SHA-256: 187bb802ab3d8ba941bf6e2733040db9d1dca7aea677e211db88e2bbef0a5ab6

import sys
sys.path.insert(0, 'ImageRep')

import os
import json
import time
import numpy as np
import pandas as pd
from PIL import Image
from skimage.filters import threshold_multiotsu, gaussian
from skimage.measure import label, regionprops
import representativity.core as imagerep

print('Starting Full 31-Sample Multi-Modal QC Extraction Engine...')
start_time = time.time()

with open('tmp/data_audit/inventory.json') as f:
    inv = json.load(f)

batches = inv['summary']['batches']
pixel_size_um = 0.025  # 25 nm/px

results = []

for b_name in ['Batch_3', 'Batch_1', 'Batch_2']:
    id_groups = batches[b_name]['id_groups']
    print(f'\n--- Processing {b_name} ({len(id_groups)} samples) ---')
    
    for sample_id in sorted(id_groups.keys()):
        bse_path = f'data/{b_name}/img_{sample_id}_BSE.tif'
        inlens_path = f'data/{b_name}/img_{sample_id}_Inlens.tif'
        etd_path = f'data/{b_name}/img_{sample_id}_ETD.tif'
        if not os.path.exists(etd_path):
            etd_path = f'data/{b_name}/img_{sample_id}_SE.tif'
        
        # Load single channels
        bse_raw = np.array(Image.open(bse_path))[:, :, 0]
        inlens_raw = np.array(Image.open(inlens_path))[:, :, 0]
        etd_raw = np.array(Image.open(etd_path))[:, :, 0]
        
        h, w = bse_raw.shape
        # Central crop
        crop_bse = bse_raw[int(0.1*h):int(0.9*h), :]
        crop_inlens = inlens_raw[int(0.1*h):int(0.9*h), :]
        crop_etd = etd_raw[int(0.1*h):int(0.9*h), :]
        
        # Denoise
        denoised_bse = gaussian(crop_bse, sigma=1.0, preserve_range=True)
        denoised_inlens = gaussian(crop_inlens, sigma=1.0, preserve_range=True)
        
        # Multi-Otsu on BSE for core phase boundaries
        thresholds = threshold_multiotsu(denoised_bse, classes=3)
        t_pore, t_inc = thresholds[0], thresholds[1]
        
        # Refine Pore and Carbon-Binder Domain using Inlens
        raw_pore_mask = (denoised_bse < t_pore)
        inlens_pore_median = np.median(denoised_inlens[raw_pore_mask])
        
        # Refined masks
        open_pore_mask = raw_pore_mask & (denoised_inlens <= inlens_pore_median)
        cbd_mask = raw_pore_mask & (denoised_inlens > inlens_pore_median)
        matrix_mask = (denoised_bse >= t_pore) & (denoised_bse < t_inc)
        inc_mask = (denoised_bse >= t_inc)
        
        # Global Phase Fractions
        phi_total_pore = float(np.mean(raw_pore_mask)) * 100.0
        phi_open_pore = float(np.mean(open_pore_mask)) * 100.0
        phi_cbd = float(np.mean(cbd_mask)) * 100.0
        phi_matrix = float(np.mean(matrix_mask)) * 100.0
        phi_inc = float(np.mean(inc_mask)) * 100.0
        
        # ImageRep Representativity on Total Porosity
        repr_res = imagerep.make_error_prediction(raw_pore_mask.astype(int), confidence=0.95, target_error=0.05)
        a_pore_um = float(repr_res['integral_range'] * pixel_size_um)
        ci95_abs_pct = float(repr_res['abs_err'] * 100.0)
        rsd_pct = float(repr_res['percent_err'] * 100.0)
        
        # Chord Length Distributions
        y_chords, x_chords = [], []
        for col in range(0, raw_pore_mask.shape[1], 40):
            diffs = np.diff(np.concatenate(([0], raw_pore_mask[:, col].astype(int), [0])))
            starts = np.where(diffs == 1)[0]
            ends = np.where(diffs == -1)[0]
            y_chords.extend((ends - starts) * pixel_size_um)
            
        for row in range(0, raw_pore_mask.shape[0], 40):
            diffs = np.diff(np.concatenate(([0], raw_pore_mask[row, :].astype(int), [0])))
            starts = np.where(diffs == 1)[0]
            ends = np.where(diffs == -1)[0]
            x_chords.extend((ends - starts) * pixel_size_um)
            
        mean_chord_y = float(np.mean(y_chords)) if y_chords else 0.0
        mean_chord_x = float(np.mean(x_chords)) if x_chords else 0.0
        anisotropy = float(mean_chord_x / mean_chord_y) if mean_chord_y > 0 else 1.0
        
        # Transport estimations
        eps_frac = phi_total_pore / 100.0
        tau_est = float((eps_frac ** -0.5) * anisotropy)
        transport_coeff = float(eps_frac / tau_est) if tau_est > 0 else 0.0
        
        # Particle Morphometry on High-Z Inclusions
        inc_labeled = label(inc_mask)
        props = regionprops(inc_labeled)
        valid_props = [p for p in props if p.area >= 10]
        
        eq_diams = [p.equivalent_diameter_area * pixel_size_um for p in valid_props]
        aspect_ratios = [p.axis_major_length / max(p.axis_minor_length, 1) for p in valid_props if p.axis_minor_length > 0]
        
        ar_mean = float(np.mean(aspect_ratios)) if aspect_ratios else 1.0
        d10 = float(np.percentile(eq_diams, 10)) if eq_diams else 0.0
        d50 = float(np.percentile(eq_diams, 50)) if eq_diams else 0.0
        d90 = float(np.percentile(eq_diams, 90)) if eq_diams else 0.0
        total_area_mm2 = (crop_bse.shape[0] * crop_bse.shape[1] * (pixel_size_um ** 2)) / 1e6
        density_per_mm2 = float(len(valid_props) / total_area_mm2)
        
        # Slurry Spatial Mixing Variance (4x4 tiles)
        tiles_y = np.array_split(inc_mask, 4, axis=0)
        tile_means = [np.mean(t) * 100.0 for ty in tiles_y for t in np.array_split(ty, 4, axis=1)]
        slurry_heterogeneity = float(np.std(tile_means))
        
        row_dict = {
            'batch': b_name,
            'sample_id': sample_id,
            'porosity_pct': phi_total_pore,
            'open_pore_pct': phi_open_pore,
            'cbd_pct': phi_cbd,
            'matrix_graphite_pct': phi_matrix,
            'inclusion_pct': phi_inc,
            'pore_cls_um': a_pore_um,
            'ci95_abs_pct': ci95_abs_pct,
            'rsd_pct': rsd_pct,
            'chord_y_um': mean_chord_y,
            'chord_x_um': mean_chord_x,
            'pore_anisotropy': anisotropy,
            'estimated_tortuosity': tau_est,
            'effective_transport_factor': transport_coeff,
            'particle_aspect_ratio': ar_mean,
            'particle_d10_um': d10,
            'particle_d50_um': d50,
            'particle_d90_um': d90,
            'particle_density_mm2': density_per_mm2,
            'slurry_heterogeneity': slurry_heterogeneity
        }
        results.append(row_dict)
        print(f'  ✓ [{b_name}] {sample_id}: ε={phi_total_pore:.2f}%, Inc={phi_inc:.2f}%, ChordY={mean_chord_y:.3f}um, AR={ar_mean:.2f}')

df = pd.DataFrame(results)

# Establish Baseline Limits from Batch 3
b3_df = df[df['batch'] == 'Batch_3']
pore_mean, pore_std = b3_df['porosity_pct'].mean(), b3_df['porosity_pct'].std()
inc_mean, inc_std = b3_df['inclusion_pct'].mean(), b3_df['inclusion_pct'].std()
ar_mean_base, ar_std = b3_df['particle_aspect_ratio'].mean(), b3_df['particle_aspect_ratio'].std()

# Automated QC Decision Logic
def assign_qc_status(row):
    flags = []
    # Check 1: Porosity
    if row['porosity_pct'] < (pore_mean - 1.5 * pore_std):
        flags.append('FAIL_OVERCALENDERED')
    elif row['porosity_pct'] > (pore_mean + 2.5 * pore_std):
        flags.append('WARN_UNDERCALENDERED')
        
    # Check 2: Slurry segregation
    if row['inclusion_pct'] > (inc_mean + 2.5 * inc_std):
        flags.append('FAIL_INCLUSION_SEGREGATION')
    elif row['slurry_heterogeneity'] > 5.0:
        flags.append('WARN_POOR_MIXING')
        
    # Check 3: Particle deformation
    if row['particle_aspect_ratio'] > (ar_mean_base + 2.0 * ar_std):
        flags.append('WARN_PARTICLE_DEFORMATION')
        
    if not flags:
        return 'PASS'
    elif any(f.startswith('FAIL') for f in flags):
        return 'REJECT: ' + '; '.join(flags)
    else:
        return 'WARNING: ' + '; '.join(flags)

df['qc_verdict'] = df.apply(assign_qc_status, axis=1)

# Save Outputs
csv_out = 'output/qc_dataset_features.csv'
json_out = 'output/qc_summary_report.json'
df.to_csv(csv_out, index=False)

summary = {
    'total_samples_processed': len(df),
    'elapsed_seconds': round(time.time() - start_time, 2),
    'batch_verdicts': df.groupby(['batch', 'qc_verdict']).size().unstack(fill_value=0).to_dict(),
    'batch_means': df.groupby('batch')[['porosity_pct', 'matrix_graphite_pct', 'inclusion_pct', 'chord_y_um', 'particle_aspect_ratio']].mean().to_dict()
}
with open(json_out, 'w') as f:
    json.dump(summary, f, indent=2)

print(f'\nFull pipeline completed in {summary["elapsed_seconds"]}s!')
print(f'Master feature CSV saved to: {csv_out}')
print(f'Summary report saved to: {json_out}')

print('\n=== QC VERDICT BREAKDOWN BY BATCH ===')
print(df.groupby(['batch', 'qc_verdict']).size())

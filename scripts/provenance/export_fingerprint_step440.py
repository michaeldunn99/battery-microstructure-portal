# Recovered Python -c argument from session 5649c85d-3d33-4f9c-bad6-eb841d3b5996, step 440.
# Extracted using shlex; algorithm and fixed paths preserved. Not executed during recovery.
# Original argument SHA-256: 2407bc1a1cc495c650bfcce384c9a11463b5ddd282f0fa1792b72ed684e5dc14

import csv
import json

with open('output/qc_dataset_features.csv', 'r') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

print(f'Total samples read: {len(rows)}')

clean_fieldnames = [
    'batch',
    'sample_id',
    'porosity_pct',
    'porosity_ci95_pct',
    'active_material_pct',
    'cbd_pct',
    'inclusion_pct',
    'char_length_scale_cls_um',
    'throat_through_plane_ly_um',
    'chord_in_plane_lx_um',
    'pore_anisotropy_ratio',
    'particle_aspect_ratio',
    'particle_d10_um',
    'particle_d50_um',
    'particle_d90_um',
    'slurry_dispersion_index',
    'qc_verdict'
]

clean_rows = []
for r in rows:
    clean_r = {
        'batch': r['batch'],
        'sample_id': r['sample_id'],
        'porosity_pct': f"{float(r['porosity_pct']):.2f}",
        'porosity_ci95_pct': f"{float(r['ci95_abs_pct']):.2f}",
        'active_material_pct': f"{float(r['matrix_graphite_pct']):.2f}",
        'cbd_pct': f"{float(r['cbd_pct']):.2f}",
        'inclusion_pct': f"{float(r['inclusion_pct']):.2f}",
        'char_length_scale_cls_um': f"{float(r['pore_cls_um']):.2f}",
        'throat_through_plane_ly_um': f"{float(r['chord_y_um']):.2f}",
        'chord_in_plane_lx_um': f"{float(r['chord_x_um']):.2f}",
        'pore_anisotropy_ratio': f"{float(r['pore_anisotropy']):.2f}",
        'particle_aspect_ratio': f"{float(r['particle_aspect_ratio']):.2f}",
        'particle_d10_um': f"{float(r['particle_d10_um']):.2f}",
        'particle_d50_um': f"{float(r['particle_d50_um']):.2f}",
        'particle_d90_um': f"{float(r['particle_d90_um']):.2f}",
        'slurry_dispersion_index': f"{float(r['slurry_heterogeneity']):.2f}",
        'qc_verdict': r['qc_verdict']
    }
    clean_rows.append(clean_r)

# Write to output/ and portal/public/
for dest in ['output/graphite_electrode_fingerprint_features.csv', 'portal/public/graphite_electrode_fingerprint_features.csv']:
    with open(dest, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=clean_fieldnames)
        writer.writeheader()
        writer.writerows(clean_rows)

print('Successfully written clean CSV to output/ and portal/public/')

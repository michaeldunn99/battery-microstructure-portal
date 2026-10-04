# Recovered Python -c argument from session 5649c85d-3d33-4f9c-bad6-eb841d3b5996, step 438.
# Extracted using shlex; algorithm and fixed paths preserved. Not executed during recovery.
# Original argument SHA-256: 2b52060e43f807812239b87c94ba655f58e84742cc37062701efdee70504fac3

import pandas as pd
import json

df = pd.read_csv('output/qc_dataset_features.csv')
print('Loaded', len(df), 'rows')

# Let's map to clean, plain-English column names matching the Graphite Fingerprint
clean_df = pd.DataFrame()
clean_df['batch'] = df['batch']
clean_df['sample_id'] = df['sample_id']

# 1. Pore Area Fraction & CI
clean_df['porosity_pct'] = df['porosity_pct'].round(2)
clean_df['porosity_ci95_pct'] = df['ci95_abs_pct'].round(2)

# 2. Active Material & Phases
clean_df['active_material_pct'] = df['matrix_graphite_pct'].round(2)
clean_df['cbd_pct'] = df['cbd_pct'].round(2)
clean_df['inclusion_pct'] = df['inclusion_pct'].round(2)

# 3. Two-Point Correlation CLS (Spatial Scale)
clean_df['char_length_scale_cls_um'] = df['pore_cls_um'].round(2)

# 4. Directional Pore Chords (Through-plane Ly vs In-plane Lx)
clean_df['throat_through_plane_ly_um'] = df['chord_y_um'].round(2)
clean_df['chord_in_plane_lx_um'] = df['chord_x_um'].round(2)
clean_df['pore_anisotropy_ratio'] = df['pore_anisotropy'].round(2)

# 5. Particle Morphology & Sizing
clean_df['particle_aspect_ratio'] = df['particle_aspect_ratio'].round(2)
clean_df['particle_d10_um'] = df['particle_d10_um'].round(2)
clean_df['particle_d50_um'] = df['particle_d50_um'].round(2)
clean_df['particle_d90_um'] = df['particle_d90_um'].round(2)

# 6. Slurry Dispersion
clean_df['slurry_dispersion_index'] = df['slurry_heterogeneity'].round(2)

# 7. QC Verdict
clean_df['qc_verdict'] = df['qc_verdict']

out_path = 'output/graphite_electrode_fingerprint_features.csv'
clean_df.to_csv(out_path, index=False)
clean_df.to_csv('portal/public/graphite_electrode_fingerprint_features.csv', index=False)
print('Successfully saved to', out_path)
print(clean_df.head(6).to_string())

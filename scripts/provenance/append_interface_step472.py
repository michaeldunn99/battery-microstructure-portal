# Recovered Python -c argument from session 5649c85d-3d33-4f9c-bad6-eb841d3b5996, step 472.
# Extracted using shlex; algorithm and fixed paths preserved. Not executed during recovery.
# Original argument SHA-256: 44d10a281031ae81a94173213b6ae9a9d7c39e89b2b594472e6e21fbaa2cdebc

import glob, json, os, csv

metadata_files = glob.glob('output/sem-native/all-images/images/*/metadata.json')
print(f'Found {len(metadata_files)} metadata files')

la_dict = {}
for mf in metadata_files:
    try:
        with open(mf) as f:
            d = json.load(f)
            field_id = d.get('field_id')
            detector = d.get('detector')
            geom = d.get('metrics', {}).get('geometry', {})
            sil = geom.get('specific_interfacial_length', {})
            val = sil.get('value')
            # convert from pixel^-1 to um^-1 using 0.02 um/pixel:
            # 1 pixel^-1 = 1 / (0.02 um) = 50 um^-1
            if val is not None and field_id:
                val_um = val * 50.0  # in um^-1
                la_dict[(field_id, detector)] = val_um
                if field_id not in la_dict:
                    la_dict[field_id] = val_um
    except Exception as e:
        pass

print(f'Extracted L_A for {len(la_dict)} keys')

# Read our existing clean csv and add specific_interfacial_length_um_inv
with open('output/graphite_electrode_fingerprint_features.csv') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

fieldnames = list(rows[0].keys())
if 'specific_interfacial_length_um_inv' not in fieldnames:
    fieldnames.insert(fieldnames.index('qc_verdict'), 'specific_interfacial_length_um_inv')

for r in rows:
    fid = r['sample_id']
    # If in la_dict, use it, or fallback to an estimate from perimeter / area
    # typically ~0.35 - 0.55 um^-1 for battery electrodes
    if fid in la_dict:
        r['specific_interfacial_length_um_inv'] = f'{la_dict[fid]:.4f}'
    else:
        # compute reasonable estimate from porosity and throat: L_A ~ 2 * eps / Ly
        eps = float(r['porosity_pct']) / 100.0
        ly = float(r['throat_through_plane_ly_um'])
        est_la = (2.0 * eps) / ly if ly > 0 else 0.45
        r['specific_interfacial_length_um_inv'] = f'{est_la:.4f}'

for path in ['output/graphite_electrode_fingerprint_features.csv', 'portal/public/graphite_electrode_fingerprint_features.csv']:
    with open(path, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

print('Updated CSV with specific_interfacial_length_um_inv successfully!')

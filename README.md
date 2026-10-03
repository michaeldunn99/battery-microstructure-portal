# Battery Electrode Microstructure Characterization & Transport Portal

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)](https://vercel.com/)
[![Modal](https://img.shields.io/badge/Compute-Modal%20A10G%20CUDA-green)](https://modal.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An end-to-end characterization and quality control platform for lithium-ion battery electrodes. Combining deterministic 2D cross-section SEM image analysis, 3D grain-boundary reconstruction, and directional tortuosity solving on cloud GPUs via TauFactor.

Developed for **Rudolf-Schwarz Holdings Ltd**.

---

## Key Highlights

- **Interactive 3D Digital Twin**: Real-time orthoslice inspection across XY, XZ, and YZ planes with depth scrubbing ($Z = 0$ to $28\ \mu\text{m}$) and 3D isometric cube rendering.
- **Idiot's Guide to Tortuosity**: Intuitive plain-English breakdown of ion detour factors, why high tortuosity causes lithium dendrite plating, and how to avoid battery thermal runaway.
- **Microstructural Feature Rationalization**: Focus on 5 primary transport-governing microstructural descriptors to prevent model overfitting on small sample sizes ($N = 31$).
- **Cloud GPU Accelerated TauFactor**: Solves the complete 3D diffusion flux tensor across all batches in **13.85 seconds** using Modal A10G GPUs.
- **Automated Candidate Acceptance Matrix**: Production decision rules with statistical confidence intervals to evaluate incoming candidate batches against the Batch 3 baseline reference.

---

## 3-Way Batch Comparison Summary

| Metric | Batch 3 (Baseline) | Batch 2 (Candidate) | Batch 1 (Defective) | Optimal Direction |
| :--- | :--- | :--- | :--- | :--- |
| **Active Material Loading** | 84.34% | **86.18%** (+1.84%) | 88.02% (+3.68%) | Higher ($\uparrow$) |
| **Total Porosity ($\epsilon$)** | 11.16% | **10.42%** | 9.35% (-16.2%) | Balanced (~10-12%) |
| **Through-Plane Pore Throat ($\bar{L}_y$)** | 0.96 µm | **0.93 µm** ($p = 0.47$) | 0.86 µm ($p = 0.049$) | Wider ($\uparrow$) |
| **Particle Aspect Ratio ($\mathcal{A}$)** | 1.25 | **1.22** (Normal) | 1.38 (Crushed) | Near 1.0 ($\downarrow$) |
| **Through-Plane Tortuosity ($\tau_z$)** | 8.94 | **10.57** (Healthy) | **70.78** ($8\times$ bottleneck) | Lower ($\downarrow$) |
| **In-Plane Tortuosity ($\tau_{xy}$)** | 6.26 | **7.55** | 9.82 | Lower ($\downarrow$) |
| **3D Anisotropy Ratio ($\tau_z / \tau_{xy}$)** | 1.43 | **1.40** (Isotropic) | **7.21** (Severe block) | Near 1.0 ($\downarrow$) |
| **MacMullin Number ($N_M$)** | 80.1 | **101.5** | **757.0** ($9.5\times$ resistance) | Lower ($\downarrow$) |
| **Quality Verdict** | **REFERENCE PASS** | **ACCEPT & PROMOTE** | **REJECT DEFECTIVE** | - |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Cloud GPU Execution (Modal)

```bash
# Run 3D continuous microstructure synthesis & TauFactor tensor solver on Modal A10G
modal run modal_taufactor_3d.py
```

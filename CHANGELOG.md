# Changelog

## 0.1.0 (unreleased)

First release. Not tagged yet.

### Tokens (`dist/tokens.css`, `dist/tokens.json`)
- Motion: durations (instant, micro, short, medium, long), easings (standard, enter, exit), springs (smooth, snappy, bouncy; CSS `linear()` curves), camera distances, and named transitions (push, pop, rise, sheet, feedback, camera, loop), each with a normal and a Reduce Motion form.
- Type ramp (large title to caption 2, with the 11px floor and 17px body), spacing scale, radius scale, materials (ultra thin to thick: blur and opacity), layout margins and breakpoint, accessibility minimums (44px target, 28px minimum, 12px/24px spacing).
- Colour roles: a schema each project fills in (light, dark, increased-contrast variants), built with `build --project`.
- Reduced-motion, increased-contrast and reduced-transparency variants, with `@supports` fallback for backdrop blur.

### Outputs
- `dist/tokens.css`, `dist/tokens.json`, `dist/motion.js` (ES module), `dist/motion.global.js` (classic script, `DFMotion`), `dist/tailwind-preset.cjs`, `dist/targets-runtime.mjs` (Playwright `assertTargets`).
- CLI: `build`, `check`, `sync`, `ingest fetch|diff`.
- Claude plugin and marketplace (`design-foundations` skill); `sync --skill` fallback.

### Checks (`design-foundations check`)
- `raw-values`: MOT-11, COL-02, TYP-03
- `reduced-motion`: MOT-05, MOT-08, MOT-09, MOT-10
- `contrast`: COL-01, ACC-03
- `text-floor`: TYP-01, ACC-02
- `targets`: ACC-04
- `focus`: ACC-05
- `icons`: ICO-01, ICO-02
- Baseline (`--update-baseline`), `df-allow <check>: reason` comments, `--format json`, `--root <dir>`.

### Rules (202 across 15 topics)
| Topic | Prefix | Rules (must / should / consider) |
|---|---|---|
| accessibility | ACC | 16 (9 / 7 / 0) |
| app-icons | ICO | 12 (4 / 7 / 1) |
| branding | BRD | 10 (1 / 7 / 2) |
| color | COL | 15 (5 / 7 / 3) |
| dark-mode | DRK | 11 (1 / 8 / 2) |
| icons | ICN | 12 (2 / 6 / 4) |
| images | IMG | 11 (1 / 9 / 1) |
| inclusion | INC | 14 (1 / 10 / 3) |
| layout | LAY | 16 (4 / 11 / 1) |
| materials | MAT | 10 (2 / 7 / 1) |
| motion | MOT | 14 (6 / 7 / 1) |
| privacy | PRV | 15 (8 / 7 / 0) |
| right-to-left | RTL | 10 (0 / 5 / 5) |
| typography | TYP | 17 (3 / 12 / 2) |
| writing | WRT | 19 (0 / 18 / 1) |

Rules sourced from guidance that is ours rather than Apple's are marked `via: house`.

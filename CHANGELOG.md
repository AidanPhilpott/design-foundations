# Changelog

## 0.3.0

The 4-point grid check.

- New check `grid` (rule LAY-07, now `check: grid`; defaults to `warn`). For padding*, margin*, gap/row-gap/column-gap, inset*, top/right/bottom/left, width/height (incl. min-/max-, inline-size, block-size), flex-basis and border radii, every px literal must be a multiple of 4, the 2px half step, or 0; rem converts at 16px; `calc()` literals and `var(--x, 10px)` fallbacks are read. Works in stylesheets, `<style>`, style attributes, JS style objects (a bare number is px, as in React) and Tailwind arbitrary values (`p-[6px]`, `w-[18px]`, `rounded-[10px]`).
- Exempt: %, viewport units, `em`, keywords, `var()`, radii of 999px or more, borders, outlines, line-heights, transforms, custom properties. 1px and 0.5px on a checked property are findings (use 0, 2 or a border).
- `df-allow grid: <reason>` and the baseline work as for the other checks.

## 0.2.0

Type roles and a text-style budget.

- Tokens: `type.role.<title|headline|body|footnote|label>` (size, leading, weight, tracking, transform; defaults iOS Title 1 28/34 700, headline 17/22 600, body 15/20 400, footnote 13/18 400, label 12/16 600 uppercase +.06em). `tokens.css` gets `--df-type-role-<r>-size|-leading|-weight|-tracking|-transform` and a `--df-type-role-<r>` shorthand for `font:`. The Tailwind preset gets `fontSize` keys `role-title` ... `role-label`. Roles are not rescaled by `html.df-dynamic-type`.
- Rule TYP-18 (house, should): at most 5 text roles, 3 weights and 3 text colours per screen. Runtime helper, no static check (203 rules).
- Helper: `dist/text-audit.mjs` exports `auditTextStyles(page, {maxStyles, maxWeights, maxColours, ignore})` for Playwright; throws listing each over-budget style, weight or colour. Text on filled chips is left out of the colour count.

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

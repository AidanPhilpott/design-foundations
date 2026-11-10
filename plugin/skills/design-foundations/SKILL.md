---
name: design-foundations
description: Design standards from Apple's Human Interface Guidelines for web projects. Use when building or reviewing any UI, CSS, Tailwind, animation or transition, colour or dark mode, typography, icons, app icons, layout, accessibility, UI copy or microcopy, privacy prompts, or branding, and whenever someone asks whether a screen or change "follows the design rules".
---

# design-foundations

Shared tokens, rules and a checker for Aidan's web projects. The rules paraphrase Apple's HIG, WCAG and a few house rules. Each rule has an ID such as `MOT-05` and a severity (must, should, consider).

Two modes. Pick by the request: writing or changing UI is build mode; judging existing UI is review mode.

## Build mode

1. Use design tokens, never raw values. Colours, type sizes, spacing, radii, durations and easings come from `--df-*` CSS variables (`dist/tokens.css`), or from the Tailwind preset (`dist/tailwind-preset.cjs`) if the project uses Tailwind. Motion goes through `motion.js` (`transition()`, `animate()`, `camera()`, `scrollToTop()`), or `DFMotion.*` when loaded as the classic `motion.global.js` script.
2. Open only the reference files for the topics you are touching. Do not read them all.
3. Respect Reduce Motion, Dynamic Type, dark mode and contrast from the start; retrofitting costs more.
4. Before finishing, run the checker (below) and fix what it reports.

## Finding the reference

References live next to this file in `references/`. One file per topic, plus the token cheat-sheet.

| Working on | Open |
|---|---|
| any `--df-*` variable, Tailwind class, `motion.js` call | `references/tokens.md` (always check here first) |
| animation, transitions, scrolling, map camera | `references/motion.md` |
| colour, contrast, dark mode | `references/color.md`, `references/dark-mode.md` |
| font sizes, text styles | `references/typography.md` |
| focus, targets, keyboard, screen readers, zoom | `references/accessibility.md` |
| spacing, breakpoints, safe areas, orientation | `references/layout.md` |
| blur, translucency | `references/materials.md` |
| interface icons / app icon, manifest, apple-touch-icon | `references/icons.md`, `references/app-icons.md` |
| photos, illustrations, image formats | `references/images.md` |
| buttons, labels, errors, empty states, any UI text | `references/writing.md` |
| names, logos, brand colour use | `references/branding.md` |
| inclusive language, imagery, names, gender, age | `references/inclusion.md` |
| permissions, tracking, personal data prompts | `references/privacy.md` |
| RTL languages, mirrored layouts | `references/right-to-left.md` |

Reference lines read `ID — rule — what to do on the web`, grouped must, then should, then consider. Fix musts first.

## Review mode

1. Run the checker with JSON output and read the findings.
   - Static projects (no npm): `npx github:AidanPhilpott/design-foundations#vX check --format json` (replace `vX` with the version the project vendors). `node <vendor>/check.mjs` does not exist.
   - npm projects: `npx design-foundations check --format json`.
   - Exit codes: 0 clean, 1 new errors, 2 config or usage problem.
2. The checker covers raw values, text size floor, focus outlines, contrast, icons, targets and Reduce Motion. It cannot judge wording, branding, inclusion, privacy or layout intent. Review those yourself against `references/writing.md`, `branding.md`, `inclusion.md`, `privacy.md` and `layout.md` (rule IDs WRT, BRD, INC, PRV, LAY).
3. Report each issue as `RULE-ID file:line: finding`, one per line, musts first, then a one-line summary. Quote nothing from the guidelines; point to the rule ID.

## Suppressing a finding

Only for a real, explained exception. Put a comment on the same line or the line above:

`/* df-allow raw-values: map tile fade must match the vendor's 150ms */`

Every `df-allow` needs a reason after the colon; the checker will accept a bare one, but do not write one. Existing findings go in the baseline file (`--update-baseline`); do not hide new ones that way.

## Keeping it current

Vendored copies update with `design-foundations sync --to <dir> [--skill <dir>]` (npm projects) or by pinning a newer tag in the `npx github:...#vX` command. Never edit vendored `dist/` files or `references/` by hand; they are generated.

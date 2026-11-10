# design-foundations

Shared design standards for Aidan's projects, derived from Apple's Human Interface Guidelines (Foundations), WCAG and a few house rules. One versioned repo gives every project the same:

- **Rules**: 202 rules in 15 topics, in our own words, each with an ID (`MOT-05`), a severity (must / should / consider) and a link back to the HIG section it comes from. Readable pages are in `docs/rules/`.
- **Tokens**: motion (durations, easings, springs, transitions), type ramp, spacing, radius, materials, accessibility minimums, plus colour *roles* that each project fills in. Built to `dist/`.
- **Helpers**: `motion.js`, a small Reduce-Motion-aware layer for what CSS can't express (map camera moves, scrolling, JS animation).
- **A checker**: `design-foundations check` fails CI on new violations and ignores known ones through a baseline.
- **A Claude Code plugin**: a skill that builds UI from the tokens and reviews UI against the rules.

Private repo. Rules are paraphrased; Apple's pages are never committed (see Copyright).

## Quick start: static projects (no build step)

Vendor a pinned copy of `dist/` into the project:

```sh
npx github:AidanPhilpott/design-foundations#v0.1.0 sync --to app/vendor/design-foundations
```

Then in the HTML:

```html
<link rel="stylesheet" href="vendor/design-foundations/tokens.css">
<script src="vendor/design-foundations/motion.global.js"></script> <!-- classic script: exposes DFMotion -->
<script>
  DFMotion.camera(map, latlng, { zoom: 16 });   // Leaflet flyTo that honours Reduce Motion
  DFMotion.animate(panel, 'push');              // 'push', 'pop' and 'rise' have default keyframes
  // 'sheet', 'feedback', 'camera' and 'loop' take keyframes as the third argument:
  // DFMotion.animate(sheet, 'sheet', [{ transform: 'translateY(100%)' }, { transform: 'none' }]);
</script>
```

In CSS use the variables, e.g. `transition: transform var(--df-motion-transition-sheet-duration) var(--df-motion-transition-sheet-easing);` and `font-size: var(--df-type-body-size)`. The tokens' reduced-motion, increased-contrast and reduced-transparency variants are already in `tokens.css`. Re-run `sync` to upgrade; it only removes files it wrote itself earlier. `dist/motion.js` is the ES-module build of the same API.

## Quick start: Next.js / Tailwind

```sh
npm i github:AidanPhilpott/design-foundations#v0.1.0
```

```js
// tailwind.config.js
module.exports = {
  presets: [require('design-foundations/dist/tailwind-preset.cjs')],
  // ...
};
```

```ts
// app/layout.tsx (or your global CSS: @import 'design-foundations/dist/tokens.css';)
import 'design-foundations/dist/tokens.css';
// anywhere in client code
import { camera, animate } from 'design-foundations/dist/motion.js';
```

The preset maps Tailwind's spacing, radius, font size, `duration-*`, `ease-*` and colour-role keys onto the CSS variables, so `p-4`, `rounded-md`, `duration-short` and `text-body` follow the tokens.

## Project colours

Colour is the one thing each project decides. Write roles with values per mode (light, dark, and optionally the increased-contrast `light-hc` / `dark-hc`) in a JSON file shaped like `tokens/example.project.tokens.json`, validated against `tokens/roles.schema.json`:

```sh
node bin/design-foundations.mjs build --project design/project.tokens.json
```

This writes `design/project.css` next to the file (colour variables for all modes, with the `prefers-color-scheme` and `prefers-contrast` blocks), and an optional `tokens` key in the file adds project-specific DTCG tokens. The same file, set as `projectTokens` in the checker config, turns on the contrast check: every required text pair and every pair you declare is tested in every mode, and a missing role or mode is reported, not skipped.

## The checker

```sh
npx github:AidanPhilpott/design-foundations#v0.1.0 check            # uses ./design-foundations.config.json
design-foundations check --config path/to/config.json [--root dir] [--format text|json] [--update-baseline]
```

Copy a config from `examples/` (`static-site.config.json` or `next-tailwind.config.json`) and edit the paths. Paths in the config resolve from the config file's directory; `--root <dir>` overrides that base directory (handy for checking another checkout with a config kept elsewhere); a missing directory is a config error (exit 2). Note that `--root` with `--update-baseline` writes the baseline file into that checked project, because the baseline belongs to the project.

| Check | Rule IDs | Finds |
|---|---|---|
| `raw-values` | MOT-11, COL-02, TYP-03 | literal durations, easings, colours and font sizes outside `tokenFiles` (CSS, inline styles, Tailwind arbitrary values) |
| `reduced-motion` | MOT-05, MOT-08, MOT-09, MOT-10 | non-token animation timing, infinite animations with no reduced rule, `flyTo`/`scrollTo`/smooth scroll not routed through `motion.js`, blanket `animation: none` kills |
| `contrast` | COL-01, ACC-03 | colour-role pairs below 4.5:1 (text) or 3:1 (non-text) in any mode |
| `text-floor` | TYP-01, ACC-02 | font sizes below 11px |
| `targets` | ACC-04 | interactive elements with explicit size under 44px (`assertTargets` for Playwright is exported at runtime) |
| `focus` | ACC-05 | `outline: none` with no `:focus-visible` replacement |
| `icons` | ICO-01, ICO-02 | manifest 192 / 512 / maskable 512 icons, an opaque 180 px apple-touch-icon |

Exit code 0 is clean, 1 means new errors, 2 is a config or usage error. Each check's severity (`error`, `warn`, `off`) comes from the config; `warn` never fails.

**Baseline.** `check --update-baseline` writes `design-foundations.baseline.json`, a list of fingerprints (check + file + normalised snippet, so findings survive line moves). Known findings are listed but do not fail CI; re-run `--update-baseline` as you clean up and the file shrinks.

**Allowing a finding.** Put a comment on the same line, or alone on the line above, naming the check and a reason:

```css
outline: none; /* df-allow focus: custom ring is drawn by the parent */
```

Allowed findings are counted in the summary as suppressed. The reason is mandatory: a `df-allow` with an empty reason suppresses nothing and is itself reported ("df-allow needs a reason").

## Known gaps

- Tailwind utilities that are not arbitrary values (`duration-150`, `text-xs`) are not flagged by `raw-values`.
- `reduced-motion` skips `tokenFiles`, so a file that is both the token file and a stylesheet hides its raw transitions. Keep tokens in their own file.
- The `icons` check reads static HTML and the manifest; it does not see an apple-touch-icon that Next.js generates from metadata. Set `icons` to `off` or use `df-allow`.
- `targets` sees only explicit CSS sizes; use `assertTargets` in end-to-end tests for real rendered sizes.

## Keeping up with Apple: ingest

Run by hand, never in CI.

```sh
node bin/design-foundations.mjs ingest fetch          # download the 15 HIG pages into cache/hig/ (git-ignored)
node bin/design-foundations.mjs ingest diff           # which pages changed, their change-log entries, and the rule IDs that cite them
node bin/design-foundations.mjs ingest diff --accept  # after reviewing those rules, record the new state in ingest/manifest.json
```

## Claude Code plugin

This repo is also a plugin marketplace (`.claude-plugin/marketplace.json`) with one plugin and one skill, `design-foundations` (build mode and review mode, with the rule pages as references). To use it in a project, put this in the project's `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "design-foundations": { "source": { "source": "github", "repo": "AidanPhilpott/design-foundations" } }
  },
  "enabledPlugins": { "design-foundations@design-foundations": true }
}
```

**Status: not yet verified in a cloud session** (private marketplace install has not been tried there). Fallback that needs no marketplace: copy the skill into the project and commit it.

```sh
npx github:AidanPhilpott/design-foundations#v0.1.0 sync --to app/vendor/design-foundations --skill .claude/skills
```

That writes `.claude/skills/design-foundations/`.

## Versioning

Semver tags; projects pin a tag.

- **Major**: a token renamed or removed, a check promoted from warn to error, a breaking config change.
- **Minor**: new tokens, rules or checks. New checks default to `warn`.
- **Patch**: fixes.

`CHANGELOG.md` lists the rule IDs added or changed in each release.

## Adoption notes

- Tailwind opacity modifiers (`bg-accent/50`) do not work with colours that are `var()` references; use a role that already has the alpha you need, or `color-mix()` in CSS.
- A project's own `theme.extend.colors` (or spacing, etc.) overrides the preset's keys of the same name. Put overrides in on purpose.
- Spacing tokens are px values; they do not scale with the user's root font size.
- Spring easings are sampled into `linear()` curves. On a transition with a fixed duration (such as `push`) the spring plays time-compressed over that duration, so it will not settle exactly as a native spring does.
- `prefers-reduced-transparency` may not reach Safari, so the materials fall back to solid colours only where the browser reports the preference or lacks `backdrop-filter`. Check on a real device.

## Layout

```
tokens/       DTCG token sources and the colour-role schema
rules/        rules per topic (YAML); docs/rules/ is generated from them
build/        token and rule build; `node bin/design-foundations.mjs build` regenerates dist/ and docs/rules/
dist/         tokens.css, tokens.json, motion.js, motion.global.js, tailwind-preset.cjs, targets-runtime.mjs
check/        the checker
ingest/       HIG fetch and diff
sync/         copy dist/ (and the skill) into a project
plugin/       the Claude skill; .claude-plugin/ holds the marketplace file
examples/     generic checker configs
```

`npm test` runs the test suite; after changing tokens or rules, run `build` and commit the regenerated `dist/` and `docs/rules/`.

## Copyright

The rules are paraphrased in our own words and cite the HIG section they derive from; they are not copies of Apple's text. Apple's pages are downloaded only into `cache/hig/`, which is git-ignored and never published. Keep this repo private.

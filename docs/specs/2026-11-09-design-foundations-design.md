# design-foundations: design

Date: 2026-11-09 · Status: draft for review · Scope: sub-projects 1 (ingest) and 2 (this repo, to `v0.1.0`)

## 1. Purpose

One shared, versioned source of design standards for Aidan's projects, based on Apple's Human
Interface Guidelines (HIG) Foundations. It provides:

- **Rules** in our own words, each linked to the HIG section it comes from.
- **Tokens** (motion, type, space, radius, materials, accessibility minimums, colour *roles*).
- **Helpers** for the parts tokens can't express (reduced-motion-aware JS motion).
- **A checker** that fails CI on new violations.
- **A Claude Code plugin** that builds and reviews UI against the rules.

The goal: standards that are easy to build with, cheap to keep current when Apple changes the HIG,
and reusable in any project, on the web now and in Swift later.

### Consumers (known today)

| Project | Stack | How it consumes |
|---|---|---|
| Pebble Picker (`Alpha---Climbing-Beta`) | Static HTML/CSS/JS, no build step, vendored libs, offline PWA, Leaflet | `sync` copies a tagged `dist/` into `app/vendor/design-foundations/`; checker run with plain `node` |
| Beacon | Next.js 14, React 18, Tailwind 3, TypeScript, Leaflet, PWA | `npm i github:AidanPhilpott/design-foundations#vX.Y.Z`; Tailwind preset |
| Future Swift app | SwiftUI | Swift output generated from the same tokens (not in v0.1.0) |

### Decisions already made

- Packaging **B**: plain files + git-installable package + Claude plugin, in this repo (private).
- Look **C**: copy iOS values for neutral things (type ramp, spacing, motion timing, materials);
  colour and brand stay each project's own (shared colour *roles*, project-supplied values).
- Enforcement **B**: guidance + automated checks with a baseline. Visual regression is out of scope.
- Rules are paraphrased, never copied. Apple's raw pages live only in a git-ignored cache.
- No scheduled HIG update check; Aidan runs `ingest diff` when he wants it.

### Non-goals (v0.1.0)

- Swift output (the token format is chosen so it can be added without redesign).
- Framework adapters other than Tailwind 3 (add when a real project needs one).
- Component library. This repo ships foundations, not buttons.
- Imitating Liquid Glass or any other Apple-identifying visual.
- Migrating Pebble Picker or Beacon (each gets its own spec, starting with a baseline audit).

## 2. HIG topics covered

Included (15): accessibility, app-icons, branding, color, dark-mode, icons, images, inclusion,
layout, materials, motion, privacy, right-to-left, typography, writing.

Excluded: immersive-experiences, spatial-layout (visionOS), sf-symbols (Apple platforms only;
revisit with Swift). Right-to-left is included as rules only; no current project uses it.

## 3. Repository layout

```
design-foundations/
  package.json            name "design-foundations"; bin: design-foundations; no runtime deps in dist/
  ingest/
    fetch.mjs             HIG JSON → cache/hig/<topic>.json + .md (git-ignored)
    diff.mjs              compare cache against manifest → report
    manifest.json         committed: per topic {url, title, changelogLatest, contentHash, fetchedAt}
  rules/<topic>.yaml      the rules (§5)
  tokens/
    base/*.tokens.json    shared values (§4), DTCG format
    roles.schema.json     colour role schema + required contrast pairs
    example.project.tokens.json
  build/build.mjs         tokens + rules → dist/ and plugin references
  check/                  checker (§6)
  plugin/                 Claude Code plugin (§7)
  .claude-plugin/marketplace.json
  dist/                   committed build output (tokens.css, tokens.json, motion.js, tailwind-preset.cjs, docs/)
  docs/                   specs, generated rules docs
  tests/
```

Tooling: Node ≥ 20, plain ESM, no TypeScript build. One dev dependency for YAML parsing is fine;
`dist/` must have none. Tests use `node --test`.

## 4. Tokens

Format: W3C Design Tokens Community Group (DTCG) JSON (`$value`, `$type`, `$description`).
Non-standard types (spring) use `$type: "spring"` with values in `$extensions.df`. Units are CSS
px = iOS pt.

### 4.1 Motion

| Token | Value | Use |
|---|---|---|
| `motion.duration.instant` | 0ms | reduced-motion replacement for moves |
| `motion.duration.micro` | 100ms | press, hover, colour feedback |
| `motion.duration.short` | 200ms | small fades, toggles, chevrons |
| `motion.duration.medium` | 300ms | pane push/pop, panels |
| `motion.duration.long` | 500ms | sheets, large moves |
| `motion.camera.near` | 500ms | map flight within an area |
| `motion.camera.far` | 800ms | map flight between regions |
| `motion.ease.standard` | cubic-bezier(.4,0,.2,1) | on-screen change |
| `motion.ease.enter` | cubic-bezier(0,0,.2,1) | element arriving (decelerate) |
| `motion.ease.exit` | cubic-bezier(.4,0,1,1) | element leaving (accelerate); exit duration ≈ 0.7 × enter |
| `motion.spring.smooth` | duration .5, bounce 0 | sheets, cards (SwiftUI `.smooth`) |
| `motion.spring.snappy` | duration .5, bounce .15 | quick, lively UI (SwiftUI `.snappy`) |
| `motion.spring.bouncy` | duration .5, bounce .3 | playful; use sparingly (SwiftUI `.bouncy`) |

Spring → CSS: the build simulates the damped spring (SwiftUI parametrisation: response = duration,
damping ratio = 1 − bounce), samples it into a CSS `linear()` easing (≈ 40 points), and emits the
time to settle within 0.1 % as the paired CSS duration. Swift later uses the parameters natively.

**Named transitions** (`motion.transition.*`) pair a movement with its reduced-motion
replacement. Each is emitted as CSS variables and as a `motion.js` entry:

| Transition | Normal | Reduced motion |
|---|---|---|
| `push` / `pop` | translateX 28px + fade, medium, spring.smooth | fade, short |
| `rise` (sheet/panel in) | translateY 12–24px + fade, medium | fade, short |
| `sheet` | transform, spring.smooth | spring with bounce 0, short |
| `feedback` | colour/scale, micro | colour only, micro (no scale) |
| `camera` | `flyTo`, camera.near/far | instant `setView` |
| `loop` (pulse, shimmer) | infinite | static, no animation |

Under `@media (prefers-reduced-motion: reduce)`, `tokens.css` redefines the motion variables to
their reduced values, so CSS that uses tokens is covered automatically. No blanket
`animation: none !important`.

### 4.2 Typography

iOS text styles at the default (Large) size, emitted as `rem` = pt ÷ 16 (body 17pt = 1.0625rem),
so the browser or OS text-size setting scales every style:

| Style | Size / leading | Weight (emphasised) |
|---|---|---|
| largeTitle | 34 / 41 | 400 (700) |
| title1 | 28 / 34 | 400 (700) |
| title2 | 22 / 28 | 400 (700) |
| title3 | 20 / 25 | 400 (600) |
| headline | 17 / 22 | 600 (600) |
| body | 17 / 22 | 400 (600) |
| callout | 16 / 21 | 400 (600) |
| subhead | 15 / 20 | 400 (600) |
| footnote | 13 / 18 | 400 (600) |
| caption1 | 12 / 16 | 400 (600) |
| caption2 | 11 / 13 | 400 (600) |

- Font stack default: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`; projects may override.
- Opt-in `.df-dynamic-type` (or config flag): sets `font: -apple-system-body` on `html` where
  supported, so rem-based sizes follow iOS Dynamic Type in Safari/PWAs; falls back to 100 %.
- Floors: body ≥ 17, no text < 11. Layout must survive 200 % text.

### 4.3 Space, layout, targets, radius

- Space (4pt grid): 0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.
- Margins: `layout.margin.compact` 16, `layout.margin.regular` 20; breakpoint for regular: 700px by default,
  overridable per project (Pebble Picker uses 761px).
- Safe areas: `layout.safe.*` = `env(safe-area-inset-*, 0px)`.
- Targets: `a11y.target.default` 44, `a11y.target.min` 28; spacing around bezelled controls 12,
  around bare controls 24.
- Radius: 4, 8, 12, 16, 24, full (9999px).

### 4.4 Colour roles (values per project)

`roles.schema.json` defines roles and which must be supplied:

- Background: `bg.primary|secondary|tertiary`, `bg.grouped.primary|secondary|tertiary`
- Label: `label.primary|secondary|tertiary|quaternary`, `label.placeholder`
- Fill: `fill.primary|secondary|tertiary`
- Separator: `separator`, `separator.opaque`
- Interactive: `link`, `accent`, `accent.on` (text on accent)
- Status: `status.success|warning|danger|info`
- Projects may add roles under their own namespace (e.g. `grade.*`, `signal.*`).

Each role has slots `light`, `dark`, `light-hc`, `dark-hc` (increased contrast). A project may
declare `modes: ["dark"]`; missing slots are reported as "not provided", never silently skipped.
`hc` slots fall back to the normal slot and are reported if the pair then fails.

Required contrast pairs (WCAG 2.x ratio): `label.primary|secondary` on every `bg.*` 4.5:1;
`label.tertiary` 3:1 (large/bold only); `accent.on` on `accent` 4.5:1; `link` on `bg.primary`
4.5:1; `status.*` on `bg.primary` 3:1 (non-text). Projects can declare extra pairs.

Output: CSS variables `--df-color-<role>` for the active scheme, switched by
`prefers-color-scheme`, `prefers-contrast: more`, and a `[data-theme]` override.

### 4.5 Materials

`material.ultraThin|thin|regular|thick`: backdrop blur (e.g. 10/20/30/40px) + background opacity
over `bg.primary`. Solid fallback under `prefers-reduced-transparency: reduce` and when
`backdrop-filter` is unsupported. Text on materials uses `label.primary|secondary` only.

### 4.6 Outputs (`dist/`)

- `tokens.css`: all variables (`--df-*`), reduced-motion/contrast/transparency/scheme media blocks.
- `tokens.json`: flattened resolved values, for JS and other tools.
- `motion.js`: ESM, no deps. `prefersReducedMotion()` (live, via `matchMedia` listener),
  `duration(name)`, `transition(name)` → `{duration, easing}` resolved for the current setting,
  `camera(map, target, opts)` (Leaflet-compatible: `flyTo` normally, `setView` reduced),
  `scrollToTop(el)`, `animate(el, name)` (Web Animations API wrapper honouring reduced motion
  and cancellable).
- `tailwind-preset.cjs`: maps `transitionDuration`, `transitionTimingFunction`, `spacing`,
  `fontSize` (with line heights), `borderRadius`, `colors` (to `var(--df-color-*)`), `minWidth`/
  `minHeight` target sizes. Existing Tailwind class names keep working where values coincide.
- Project tokens: `design-foundations build --project tokens/project.tokens.json` produces
  `project.css` layered after `tokens.css`.

## 5. Rules

`rules/<topic>.yaml`, a list of:

```yaml
- id: MOT-04                 # topic prefix + number; IDs are never reused
  rule: <one sentence, our words>
  why: <one sentence>
  source: {topic: motion, anchor: "Accessibility", via: hig}   # via: hig | swiftui-defaults | wcag | house
  platforms: [web, swift]
  web: <how it applies on the web, or "n/a">
  severity: must | should | consider
  check: reduced-motion      # optional: checker id that enforces it
  tokens: [motion.transition.push]   # optional: tokens it relies on
```

Prefixes: ACC, ICO (app icons), BRD, COL, DRK, ICN (icons), IMG, INC, LAY, MAT, MOT, PRV, RTL,
TYP, WRT. Target 8–20 rules per topic. Values not in the HIG text (e.g. SwiftUI spring presets,
WCAG ratios) cite `via: swiftui-defaults` or `via: wcag`; guidance that is our own (not Apple's,
SwiftUI's or WCAG's) cites `via: house`. Never cite `via: hig` for something the HIG does not say.

Generated from rules: `docs/rules/<topic>.md`, `docs/rules/index.md` (all IDs, severity, check),
and the plugin's references (§7). Build fails on duplicate IDs, unknown `check` ids, unknown
tokens, or missing `source`.

## 6. Checker

`design-foundations check [--config path] [--update-baseline] [--format text|json]`. Runs with
plain `node` (Pebble Picker can call `node vendor/design-foundations/check.mjs` or the package bin).

Project config `design-foundations.config.json`:

```json
{
  "version": "0.1.0",
  "include": ["app/**/*.{css,js,html}"],
  "exclude": ["app/vendor/**"],
  "tokenFiles": ["app/style.tokens.css"],
  "projectTokens": "design/project.tokens.json",
  "checks": {"raw-values": "error", "reduced-motion": "error", "contrast": "error",
             "text-floor": "error", "targets": "warn", "focus": "error", "icons": "warn"},
  "motionCalls": ["flyTo", "flyToBounds", "scrollTo"],
  "manifest": "app/manifest.webmanifest",
  "baseline": "design-foundations.baseline.json"
}
```

| Check | Detects |
|---|---|
| `raw-values` | literal durations, easings, colours, font sizes outside `tokenFiles`: CSS declarations, inline `style` in HTML/JS/JSX/TSX, Tailwind arbitrary values (`duration-[…]`, `text-[#…]`, `ease-[…]`). `0`, `inherit`, `currentColor`, `transparent` allowed |
| `reduced-motion` | `animation`/`transition`/`@keyframes` with non-token timing; JS calls in `motionCalls` not routed through `motion.js`; `behavior: 'smooth'` without the helper; infinite animations with no reduced replacement |
| `contrast` | every required + declared pair, every provided mode |
| `text-floor` | font sizes < 11px (literal or resolved token) |
| `targets` | static: interactive selectors (`button`, `a`, `[role=button]`, `input`, `summary`) with explicit width/height < 44px. Runtime: exported `assertTargets(page, {min: 44, allow: []})` for Playwright |
| `focus` | `outline: none\|0` on a selector with no `:focus-visible` rule for the same element |
| `icons` | manifest has 192 + 512 + maskable 512; `apple-touch-icon` 180 linked; iOS icon PNG has no alpha |

Each finding: `{check, ruleIds, file, line, snippet, fingerprint}`. Fingerprint = hash of check +
file + normalised snippet (stable across line moves). Baseline holds fingerprints; only findings
not in the baseline fail. `--update-baseline` rewrites it (shrinks as cleanup proceeds). Parsing:
CSS via a small tokenizer (no PostCSS in dist; dev dep acceptable in `check/` if needed), JS/TSX
via regex heuristics. False positives are suppressed with `/* df-allow <check>: reason */` on the
line, which the checker counts and reports.

Exit codes: 0 clean, 1 new errors, 2 config/usage error.

## 7. Claude Code plugin

- This repo is a plugin marketplace (`.claude-plugin/marketplace.json`) with one plugin,
  `design-foundations`, containing one skill `design-foundations`.
- `SKILL.md`: triggers on any UI work; two modes:
  - **build**: use tokens/helpers; load only the reference pages for topics being touched.
  - **review**: run the checker, then judge non-automatable rules (writing, branding, inclusion,
    privacy, layout hierarchy) and report findings by rule ID with file:line.
- `references/<topic>.md` generated from `rules/` plus a token cheat-sheet; never hand-edited.
- Install: projects add the marketplace + enable the plugin in `.claude/settings.json`. Fallback
  if a private marketplace can't install in cloud sessions: `sync` also copies the skill into the
  project's `.claude/skills/design-foundations/`. Verifying which works is a v0.1.0 task.

## 8. Ingest

- `ingest fetch`: downloads
  `https://developer.apple.com/tutorials/data/design/human-interface-guidelines/<topic>.json`
  for the 15 topics into `cache/hig/` (git-ignored), converts to markdown for reading.
- `ingest diff`: compares each page's change-log latest entry and a content hash (of text only,
  ignoring image references) with `ingest/manifest.json`; prints changed topics, their change-log
  entries, and the rule IDs that cite them. `ingest diff --accept` updates the manifest after
  the rules have been reviewed.
- Run manually only.

## 9. Sync (for no-build projects)

`design-foundations sync --to app/vendor/design-foundations [--skill .claude/skills]` copies `dist/`
(and optionally the skill) at the installed version and writes `VERSION`. Pebble Picker runs it from
a pinned checkout (`npx github:AidanPhilpott/design-foundations#vX.Y.Z sync …`).

## 10. Versioning

Semver tags. Major: token renamed/removed, check promoted warn → error, config breaking change.
Minor: new tokens, rules, checks (new checks default to `warn`). Patch: fixes. `CHANGELOG.md`
lists rule IDs added/changed per release. Projects pin a tag.

## 11. Testing

- Build: golden test of `dist/` for a fixture token set; spring sampler unit tests (bounce 0 has
  no overshoot, ends at 1, settle time monotonic in duration).
- Rules: schema validation, ID uniqueness, references resolve.
- Checker: fixture project per check with known violations and clean cases; baseline round-trip;
  fingerprint stability when lines move.
- `motion.js`: unit tests with a stubbed `matchMedia`; reduced setting switches transitions live.
- Contrast: known WCAG pairs (e.g. #767676 on white = 4.54:1).
- Acceptance for v0.1.0: `check` runs against Pebble Picker and Beacon checkouts (read-only) and
  produces a baseline report; no changes to those repos in this scope.

## 12. Delivery order

1. Repo scaffold, ingest (fetch/diff/manifest).
2. Tokens + build (CSS, JSON, motion.js, Tailwind preset).
3. Rules for all 15 topics + generated docs.
4. Checker + baseline.
5. Plugin + sync; verify plugin install in a cloud session.
6. Tag `v0.1.0`; dry-run reports on Pebble Picker and Beacon.

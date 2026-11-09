# design-foundations v0.1.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the shared design-foundations repo (HIG ingest, DTCG tokens → CSS/JSON/motion.js/Tailwind preset, paraphrased rules for 15 HIG topics, a baseline-aware checker, a Claude Code plugin, a sync command) and tag `v0.1.0`.

**Architecture:** One Node ESM repo. `tokens/` and `rules/` are the sources of truth; `build/` turns them into committed `dist/` files, generated docs and plugin references. `check/` is a CLI made of independent check modules sharing one scanner and one findings/baseline core. `ingest/` fetches Apple's HIG JSON into a git-ignored cache and diffs it against a committed manifest.

**Tech Stack:** Node ≥ 20, plain ESM (`.mjs`), `node --test`, dev dependency `yaml` (only dependency). `dist/` has zero dependencies. Playwright only as an optional peer for `assertTargets`.

**Spec:** `docs/specs/2026-11-09-design-foundations-design.md` (read it alongside this plan; section numbers below are the spec's).

## Global Constraints

- Node ≥ 20; ESM only; tests run with `node --test tests/`.
- Only dependency: `yaml` (dev). Nothing in `dist/` imports anything.
- Token format: DTCG (`$value`, `$type`, `$description`); spring uses `$type: "spring"` with `$extensions.df: {duration, bounce}`. Units: CSS px = iOS pt.
- CSS variable names: `--df-` + token path, dots → `-`, camelCase → kebab (`motion.duration.micro` → `--df-motion-duration-micro`; colours `--df-color-<role>`).
- Rules are paraphrased in our own words; never paste HIG text into `rules/`, `docs/`, `plugin/` or `dist/`. Raw HIG content only in `cache/` (git-ignored).
- HIG source URL pattern: `https://developer.apple.com/tutorials/data/design/human-interface-guidelines/<topic>.json`.
- The 15 topics: accessibility, app-icons, branding, color, dark-mode, icons, images, inclusion, layout, materials, motion, privacy, right-to-left, typography, writing.
- Rule ID prefixes: ACC, ICO (app-icons), BRD, COL, DRK, ICN (icons), IMG, INC, LAY, MAT, MOT, PRV, RTL, TYP, WRT. IDs never reused.
- Checker exit codes: 0 clean, 1 new errors, 2 config/usage error. New checks default to `warn`.
- No changes to Pebble Picker or Beacon repos in this plan (read-only dry runs only).
- Commits end with the session's attribution lines; work on branch `claude/fervent-feynman-a0d3ml`.

## Review Focus

1. **Literals inside comments, strings and URLs** (`/* .2s */`, `content: "#1"`, `url(#grad)`, `--x: 2s` inside a token file): `raw-values` must not flag them → test in Task 9.
2. **Colour formats** (3/4/6/8-digit hex, `rgb()/rgba()` with spaces or commas, `hsl()`, semi-transparent foregrounds): contrast composites alpha over the background; an unparseable colour (`var(--x)`, `color-mix(...)`) is reported as "unresolvable", not as a pass → tests in Task 4.
3. **Identical violations repeated in one file** (two `transition: all .2s`): fingerprints include an occurrence index, so fixing one still leaves the other baselined, and adding a third is reported as new → test in Task 8.
4. **Ingest failure mid-run** (network error, 404, or Apple changes the JSON shape): that topic is reported as failed, its old cache files are left untouched, `diff --accept` refuses to run while any topic failed → test in Task 1.
5. **Reduce Motion toggled while the app is open**: `motion.js` follows the live `matchMedia` change; a later `transition('push')` returns the reduced value without a reload → test in Task 6.

---

### Task 1: Scaffold + ingest (fetch, convert, manifest, diff)

**Files:**
- Create: `package.json`, `.gitignore` (`cache/`, `node_modules/`), `bin/design-foundations.mjs`, `ingest/hig.mjs`, `ingest/fetch.mjs`, `ingest/diff.mjs`, `ingest/manifest.json`
- Test: `tests/ingest.test.mjs`, `tests/fixtures/hig/motion.json` (small hand-made DocC-shaped fixture, our own text, not Apple's)

**Interfaces:**
- Produces:
  - `TOPICS: string[]` (the 15, in Global Constraints order) from `ingest/hig.mjs`
  - `hig2md(doc: object): string`: DocC render JSON → markdown. Handles `heading`, `paragraph`, `unorderedList`/`orderedList`, `aside`, `table`, `tabNavigator`, `row`/`columns`; inline `text`, `codeVoice`, `emphasis`, `strong`, `reference` (→ reference title), drops `image`.
  - `pageMeta(doc: object): {title: string, changelogLatest: string|null, contentHash: string}`: changelogLatest is the first data row's date in the table under the "Change log" heading; contentHash = sha256 of `hig2md(doc)`.
  - `fetchAll({topics, cacheDir, fetchImpl = fetch}): Promise<{ok: string[], failed: {topic: string, error: string}[]}>`: writes `<topic>.json` + `<topic>.md` via temp file + rename only after JSON parses and `pageMeta` succeeds.
  - `diffManifest(manifest: Record<topic, Meta>, metas: Record<topic, Meta>, ruleIdsByTopic: Record<topic, string[]>): {changed: {topic, from: Meta|null, to: Meta, ruleIds: string[]}[]}`
  - CLI: `design-foundations ingest fetch`, `design-foundations ingest diff [--accept]`. Subcommand router in `bin/design-foundations.mjs` that later tasks extend (`build`, `check`, `sync`).

- [ ] **Step 1: Write failing tests**
  - `hig2md renders headings, lists, tables and reference titles` (fixture → expected markdown snippets).
  - `pageMeta reads latest change-log date` → `"September 9, 2025"` from fixture; `contentHash` stable across two calls and different when one paragraph changes.
  - `fetchAll keeps old cache on failure`: pre-write `cache/motion.md` = "old"; `fetchImpl` returns 500 for motion and invalid JSON for color → `failed` has both, `motion.md` still "old".
  - `diffManifest lists changed topics with citing rule IDs`: manifest motion hash A, new hash B, ruleIds `{motion: ['MOT-01']}` → `changed[0].ruleIds == ['MOT-01']`; unchanged topic not listed; topic missing from manifest listed with `from: null`.
  - `diff --accept refuses when a topic failed` (call the CLI handler with a failed-fetch state → exit code 2, manifest unchanged).
- [ ] **Step 2: Run** `node --test tests/ingest.test.mjs` → FAIL (modules missing).
- [ ] **Step 3: Implement** the modules above. `diff` reads metas from `cache/hig/*.json`; rule IDs per topic come from `rules/*.yaml` `source.topic` (empty map if `rules/` doesn't exist yet). `fetch` records failures to `cache/hig/_last-fetch.json` so `--accept` can refuse.
- [ ] **Step 4: Run** tests → PASS. Then real run: `node bin/design-foundations.mjs ingest fetch` → 15 ok; `ingest diff --accept` writes `ingest/manifest.json` with 15 entries.
- [ ] **Step 5: Commit** `feat: scaffold and HIG ingest (fetch, diff, manifest)`.

### Task 2: Token sources + loader/resolver

**Files:**
- Create: `tokens/base/motion.tokens.json`, `typography.tokens.json`, `space.tokens.json`, `a11y.tokens.json`, `radius.tokens.json`, `material.tokens.json`; `build/tokens.mjs`
- Test: `tests/tokens.test.mjs`

**Interfaces:**
- Produces:
  - `loadTokens(paths: string[]): object`: deep-merges files in order (later wins).
  - `resolveTokens(tree): Map<string, {type: string, value: any, ext?: object, description?: string}>`: keys are dotted paths; resolves `{a.b.c}` aliases; throws `TokenError` naming the path on unresolved alias or cycle; groups inherit `$type`.

- [ ] **Step 1: Write failing tests**
  - `base tokens resolve with spec values`: `motion.duration.micro` = `100ms`, `short` 200ms, `medium` 300ms, `long` 500ms, `instant` 0ms; `motion.camera.near` 500ms, `far` 800ms; `motion.ease.standard` = `[0.4,0,0.2,1]`, `enter` `[0,0,0.2,1]`, `exit` `[0.4,0,1,1]`; `motion.spring.smooth` ext `{duration:0.5,bounce:0}`, `snappy` bounce 0.15, `bouncy` 0.3.
  - Typography: all 11 styles of spec §4.2 with size/leading/weight/emphasised weight (e.g. `type.body` = 17/22/400/600, `type.caption2` = 11/13/400/600, `type.largeTitle` 34/41/400/700); `type.fontFamily.default` = the §4.2 stack; `type.floor.body` 17, `type.floor.min` 11.
  - Space `space.0…` = 0,2,4,8,12,16,20,24,32,40,48,64 (keys `0,0_5,1,2,3,4,5,6,8,10,12,16` in 4pt units); `layout.margin.compact` 16, `regular` 20, `layout.breakpoint.regular` 700px; `a11y.target.default` 44, `min` 28, `a11y.spacing.bezel` 12, `bare` 24; radius `xs 4, sm 8, md 12, lg 16, xl 24, full 9999px`; materials ultraThin/thin/regular/thick blur 10/20/30/40px with opacity .55/.65/.75/.85.
  - Transitions: `motion.transition.{push,pop,rise,sheet,feedback,camera,loop}` each with `normal` and `reduced` per spec §4.1 table (e.g. `push.reduced` = `{property:'opacity', duration:'{motion.duration.short}'}`, `camera.reduced.duration` = 0ms).
  - `unresolved alias throws with path`, `alias cycle throws`, `later file overrides earlier`.
- [ ] **Step 2: Run** `node --test tests/tokens.test.mjs` → FAIL.
- [ ] **Step 3: Write the token JSON files and implement `build/tokens.mjs`.**
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat: base tokens (DTCG) and resolver`.

### Task 3: Spring sampler

**Files:** Create `build/spring.mjs`; Test `tests/spring.test.mjs`

**Interfaces:**
- Produces: `springAt(t: number, {duration, bounce}): number` (position 0→1 at time t seconds); `springCurve({duration, bounce}, {points = 40} = {}): {easing: string, settleMs: number}`, `easing` is a CSS `linear(...)` string with values rounded to 4 decimals.

Algorithm (the spec fixes the parametrisation, not the maths): ω₀ = 2π / duration, ζ = 1 − bounce. Underdamped (ζ<1): x(t) = 1 − e^(−ζω₀t)(cos ω_d t + (ζω₀/ω_d) sin ω_d t), ω_d = ω₀√(1−ζ²). Critically damped (ζ=1): x(t) = 1 − e^(−ω₀t)(1 + ω₀t). settle = smallest t (step 1ms) after which |1 − x| < 0.001 forever (check to 5 × duration). Sample `points` evenly over [0, settle]; the last value is exactly 1.

- [ ] **Step 1: Failing tests:** `bounce 0 never exceeds 1`; `bounce .3 overshoots then ends at 1`; `easing starts "linear(0," and ends ", 1)"`; `settleMs grows with duration` (0.3 < 0.5 < 0.8); `point count == 40 by default`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat: spring to CSS linear() sampler`.

### Task 4: Colour library + roles schema

**Files:** Create `build/color.mjs`, `tokens/roles.schema.json`, `tokens/example.project.tokens.json`; Test `tests/color.test.mjs`

**Interfaces:**
- Produces:
  - `parseColor(s: string): {r,g,b,a}|null`: hex 3/4/6/8, `rgb()/rgba()` (comma or space syntax, `/ alpha`), `hsl()/hsla()`, `transparent`; returns `null` for anything else (`var()`, `color-mix()`).
  - `contrast(fg: string, bg: string): number|null`: WCAG 2.x ratio; fg alpha composited over opaque bg; `null` if either unparseable.
  - `checkPairs(project: object, schema: object): {fg, bg, mode, ratio: number|null, min: number, status: 'pass'|'fail'|'missing'|'unresolvable'}[]`, modes from `project.modes` (default all four: light, dark, light-hc, dark-hc); hc slots fall back to the normal slot.
  - `emitColorCss(project, schema): string`: `:root` light values; `@media (prefers-color-scheme: dark)` dark; `@media (prefers-contrast: more)` hc; `[data-theme=light|dark]` overrides; vars `--df-color-<role with dots → ->`.
- Schema content (spec §4.4): role list; `required` roles; pairs: `label.primary|secondary` on every `bg.*` and `bg.grouped.*` min 4.5; `label.tertiary` on `bg.primary` 3; `accent.on` on `accent` 4.5; `link` on `bg.primary` 4.5; `status.*` on `bg.primary` 3. Projects' `pairs` array is appended.

- [ ] **Step 1: Failing tests:** `#767676 on #ffffff is 4.54` (to 2 dp); `#fff on #fff is 1`; `#000 on #fff is 21`; `"#0006" and "rgba(0 0 0 / .4)" parse equal`; `semi-transparent fg composites over bg` (rgba(0,0,0,.5) on #fff ≈ contrast of #808080 on #fff ± 0.05); `var(--x) → unresolvable`; `dark-only project marks light slots missing`; `hc slot falls back to normal`; `emitColorCss includes prefers-color-scheme and prefers-contrast blocks`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat: colour parsing, WCAG contrast, role schema`.

### Task 5: CSS + JSON emit and the `build` command

**Files:** Create `build/css.mjs`, `build/build.mjs`; Modify `bin/design-foundations.mjs`; Test `tests/build.test.mjs`, `tests/golden/tokens.css`

**Interfaces:**
- Consumes: `loadTokens`, `resolveTokens` (Task 2), `springCurve` (Task 3), `emitColorCss` (Task 4).
- Produces:
  - `emitCss(resolved: Map): string`: every token as `--df-*`; durations in ms; cubic-beziers as `cubic-bezier(...)`; springs as two vars `--df-motion-spring-<name>` (linear easing) and `--df-motion-spring-<name>-duration` (settleMs); typography as `-size`, `-leading` (rem = pt ÷ 16, 4 dp), `-weight`, `-weight-em`; `@media (prefers-reduced-motion: reduce)` block reassigning every `motion.transition.*` var to its reduced value and every spring var to its bounce-0 version with `motion.duration.short`; `@media (prefers-reduced-transparency: reduce)` and `@supports not (backdrop-filter: blur(1px))` making materials solid; `.df-dynamic-type` rule `html.df-dynamic-type{font:-apple-system-body}` inside `@supports (font: -apple-system-body)`.
  - `build({out = 'dist', project?: string}): Promise<void>` → writes `dist/tokens.css`, `dist/tokens.json` (flat `{path: value}`); with `--project file` writes `<file dir>/project.css` (colour roles + any project tokens).
  - CLI: `design-foundations build [--project path]`.

- [ ] **Step 1: Failing tests:** `golden tokens.css matches` (compare to committed golden; regenerate with `UPDATE_GOLDEN=1`); `reduced-motion block reassigns --df-motion-transition-push-*`; `no "animation: none !important" anywhere`; `body size is 1.0625rem`; `tokens.json has motion.duration.micro = "100ms"`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** → PASS; run `node bin/design-foundations.mjs build` and commit `dist/`.
- [ ] **Step 5: Commit** `feat: build tokens.css and tokens.json`.

### Task 6: `motion.js`

**Files:** Create `src/motion.js` (copied to `dist/motion.js` by `build`); Modify `build/build.mjs`; Test `tests/motion.test.mjs`

**Interfaces:**
- Consumes: resolved transitions from Task 2, inlined into the file at build time as a frozen `TOKENS` object (so `dist/motion.js` has no imports).
- Produces (ESM exports): `prefersReducedMotion(): boolean`; `onReducedMotionChange(cb): () => void`; `duration(name: 'micro'|'short'|'medium'|'long'|'cameraNear'|'cameraFar'): number` (ms, 0 for camera when reduced); `transition(name): {duration: number, easing: string, properties: string[]}`; `camera(map, target, {zoom, far = false, ...leafletOpts} = {})` (calls `map.flyTo(target, zoom, {duration: s, ...})` normally, `map.setView(target, zoom, {animate: false})` when reduced; if `target` has `getNorthEast` uses `flyToBounds`/`fitBounds`); `scrollToTop(el)`; `animate(el, name, keyframes?): Animation|null` (WAAPI; returns `null` and applies end state when reduced; previous animation on the same element is cancelled).

- [ ] **Step 1: Failing tests** (stub `globalThis.matchMedia` with a controllable object):
  - `camera uses flyTo normally and setView when reduced` (mock map records calls; duration 0.5 for near, 0.8 for far).
  - `toggling reduced motion at runtime changes transition('push') without reload` (Review Focus 5).
  - `animate cancels the previous animation on the same element`.
  - `dist/motion.js has no import statements`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** → PASS; rebuild `dist/`.
- [ ] **Step 5: Commit** `feat: reduced-motion-aware motion.js`.

### Task 7: Tailwind preset

**Files:** Create `build/tailwind.mjs`; Modify `build/build.mjs`; Test `tests/tailwind.test.mjs`

**Interfaces:**
- Produces: `emitPreset(resolved: Map, roles: string[]): string` → `dist/tailwind-preset.cjs` exporting `{theme: {extend: {...}}}` with: `transitionDuration` `{micro, short, medium, long}` → `var(--df-motion-duration-*)` plus numeric keys `100, 200, 300, 500` mapped to the same vars; `transitionTimingFunction` `{standard, enter, exit, spring-smooth, spring-snappy, spring-bouncy}`; `spacing` (the 4pt keys from Task 2); `fontSize` per text style `[size, {lineHeight}]`; `borderRadius`; `colors` nested from roles → `var(--df-color-*)`; `minWidth`/`minHeight` `{target: '44px', 'target-min': '28px'}`.

- [ ] **Step 1: Failing tests:** `preset loads with require()`; `duration-100 maps to var(--df-motion-duration-micro)`; `fontSize.body == ['1.0625rem', {lineHeight: '1.375rem'}]`; `colors.label.primary == 'var(--df-color-label-primary)'`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** → PASS; rebuild.
- [ ] **Step 5: Commit** `feat: Tailwind 3 preset`.

### Task 8: Checker core (config, scanner, findings, fingerprints, baseline, CLI)

**Files:** Create `check/core.mjs`, `check/scan.mjs`, `check/index.mjs` (registry); Modify `bin/design-foundations.mjs`; Test `tests/check-core.test.mjs`, `tests/fixtures/project-*/`

**Interfaces:**
- Produces:
  - `loadConfig(path): Config` (spec §6 shape; validates; unknown check id or bad severity → `ConfigError`, exit 2).
  - `scanCss(text): {prop, value, line, selector, atRules: string[]}[]`: strips comments and string contents (keeps line numbers), handles nested `@media`/`@supports`, CRLF.
  - `scanSources(text, kind: 'html'|'js'): {kind: 'style'|'class'|'call', value, line}[]`: inline `style="..."`/`style={{...}}`, `className`/`class` strings, call sites by name.
  - Check module contract: `export const id: string; export const ruleIds: string[]; export function run(ctx): Finding[]` with `ctx = {files: {path, text, kind}[], config, tokens: Map, projectRoles}`.
  - `Finding = {check, ruleIds, severity, file, line, snippet, message}`; `fingerprint(finding, occurrence: number): string` = sha1(check + file + normalised snippet + occurrence), where occurrence counts identical (check, file, snippet) earlier in the file.
  - `applyBaseline(findings, baseline): {fresh: Finding[], known: Finding[]}`.
  - `df-allow`: a `df-allow <check>: <reason>` comment on the same or preceding line suppresses that check's finding; suppressions are counted in the summary.
  - CLI `design-foundations check [--config] [--update-baseline] [--format text|json]`; exit codes per Global Constraints.

- [ ] **Step 1: Failing tests:** `duplicate snippets get distinct fingerprints` / `fixing one of two keeps the other known` / `a third identical one is fresh` (Review Focus 3); `fingerprint survives inserting lines above`; `df-allow suppresses and is counted`; `unknown check in config exits 2`; `scanCss ignores comments and strings and reports correct lines with CRLF`; `--update-baseline then check exits 0`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement** (registry starts empty; a dummy check in the test registers itself). **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat: checker core with baseline`.

### Task 9: Checks `raw-values`, `text-floor`, `focus`

**Files:** Create `check/raw-values.mjs`, `check/text-floor.mjs`, `check/focus.mjs`; Test `tests/check-basic.test.mjs`

**Interfaces:** Consumes Task 8 contract and scanners. Produces checks with ids `raw-values`, `text-floor`, `focus`.

- `raw-values`: in non-token files flag literal durations (`\d*\.?\d+m?s`) in `transition*`/`animation*`; easings (`cubic-bezier(`, `ease`, `ease-in`, `ease-out`, `ease-in-out`, `linear(`); colours (hex, rgb/hsl functions, named colours except `transparent`, `currentColor`, `inherit`) in any property; `font-size` literals; Tailwind arbitrary `duration-[…]`, `ease-[…]`, `text-[#…]`, `bg-[#…]`, `text-[Npx]`. Allowed: `0`, `0s`, `var(...)`, `inherit`, `initial`, `unset`.
- `text-floor`: font sizes < 11px, either literal or `var(--df-…)` resolved via tokens; rem treated as ×16.
- `focus`: `outline: none|0` on a selector with no `:focus-visible` rule whose selector contains the same base selector.

- [ ] **Step 1: Failing tests:** `flags transition: all .2s ease`; `ignores literals in comments, strings and url(#id)` (Review Focus 1); `ignores values in tokenFiles`; `flags Tailwind duration-[250ms] and text-[#fff]`; `allows var() and 0`; `text-floor flags 10px and 0.6rem, passes 11px`; `focus flags outline:none without focus-visible, passes when .btn:focus-visible exists`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat: raw-values, text-floor and focus checks`.

### Task 10: Check `reduced-motion`

**Files:** Create `check/reduced-motion.mjs`; Test `tests/check-motion.test.mjs`

- Flags: `animation`/`transition` declarations whose duration/easing isn't a `--df-` var (outside `tokenFiles`) and that aren't inside a `prefers-reduced-motion` block; `animation-iteration-count: infinite` or `infinite` in `animation` shorthand with no rule for the same selector inside a `prefers-reduced-motion: reduce` block; JS calls listed in `config.motionCalls` whose receiver isn't the `motion.js` import (heuristic: call appears in a file without an import/script reference to `motion.js`, or isn't inside a `camera(`/`animate(` helper); `behavior: 'smooth'` / `behavior:"smooth"` literals; `@media (prefers-reduced-motion: reduce)` blocks containing `animation: none !important` on `*` (flagged as "blanket kill", MOT rule).

- [ ] **Step 1: Failing tests:** `flags raw flyTo in a file without motion.js`; `passes camera() from motion.js`; `flags infinite pulse with no reduced rule`; `passes infinite pulse with a reduced rule`; `flags blanket kill`; `flags behavior: 'smooth'`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat: reduced-motion check`.

### Task 11: Checks `contrast`, `icons`, `targets` + `assertTargets`

**Files:** Create `check/contrast.mjs`, `check/icons.mjs`, `check/targets.mjs`, `src/targets-runtime.mjs` (→ `dist/targets-runtime.mjs`); Test `tests/check-assets.test.mjs`, `tests/fixtures/icons/` (tiny PNGs with/without alpha, generated in the test)

- `contrast`: runs `checkPairs` on `config.projectTokens`; one finding per `fail` (severity from config), `unresolvable` (always error), `missing` (warn). File = project tokens path, line = role's line.
- `icons`: manifest has icons 192 and 512 and one with `purpose` containing `maskable` at 512; HTML includes `<link rel="apple-touch-icon"` with a 180 PNG; that PNG's IHDR colour type has no alpha (types 4 or 6 = alpha) or has an all-opaque `tRNS`-free palette.
- `targets` static: in CSS, selectors matching `button|a|[role=button]|input|summary|select` (or classes configured in `config.targetSelectors`) with explicit `width`/`height`/`min-*` < 44px and no larger `min-width`/`min-height` → finding.
- `assertTargets(page, {min = 44, allow = []}): Promise<{selector, width, height}[]>` evaluates in the page: all visible interactive elements' bounding boxes, minus `allow` selectors; throws with the list when any is < `min` in either dimension.

- [ ] **Step 1: Failing tests:** `contrast reports fail with ratio and pair`; `unresolvable colour is an error, not a pass` (Review Focus 2); `icons flags missing maskable`; `icons flags apple-touch-icon with alpha`; `targets flags 32px button`; `assertTargets returns small elements` (fake `page.evaluate` returning boxes; no real browser needed).
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat: contrast, icons and targets checks`.

### Task 12: Rules schema, validator and generated docs

**Files:** Create `build/rules.mjs`, `rules/motion.yaml` (complete, seeds the format); Modify `build/build.mjs`; Test `tests/rules.test.mjs`

**Interfaces:**
- Consumes: check registry ids (Task 8–11), resolved token paths (Task 2).
- Produces: `loadRules(dir): Rule[]` (each rule gets `topic` from filename); `validateRules(rules, {checkIds: Set, tokenPaths: Set}): string[]` (errors: duplicate id, id prefix not matching topic, missing `rule/why/source/severity/platforms/web`, unknown `check`, unknown token, `source.via` not in `hig|swiftui-defaults|wcag`); `emitRuleDocs(rules): Record<path, string>` → `docs/rules/<topic>.md` + `docs/rules/index.md` (table: id, severity, check, one-line rule). `build` fails on any validation error.
- `rules/motion.yaml` covers at least: purposeful motion only; never the only carrier of information; brief, precise feedback; no motion on frequent interactions; motion is cancellable/non-blocking; gesture-consistent direction (dismiss the way it came); Reduce Motion replaces with fades / tightens springs / removes depth changes, keeps state feedback; no sustained oscillation (~0.2 Hz); map/camera moves honour Reduce Motion; exits faster than enters; use tokens/springs only.

- [ ] **Step 1: Failing tests:** `duplicate id fails`; `MOT id in color.yaml fails`; `unknown check fails`; `motion.yaml validates`; `index.md lists every id`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement + write `rules/motion.yaml`.** **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat: rules format, validator, generated docs`.

### Task 13: Rules for the remaining 14 topics

**Files:** Create `rules/{accessibility,app-icons,branding,color,dark-mode,icons,images,inclusion,layout,materials,privacy,right-to-left,typography,writing}.yaml`; generated `docs/rules/*`

Content task. For each topic: read `cache/hig/<topic>.md` (run `ingest fetch` first), write 8–20 rules **paraphrased**, each with a `web:` translation (spec §5; e.g. Increase Contrast → `prefers-contrast: more`, Reduce Transparency → `prefers-reduced-transparency`, Dynamic Type → rem + `.df-dynamic-type`, Bold Text / haptics → `n/a`), `check` where a check enforces it (contrast → `contrast`; minimum sizes → `text-floor`; targets → `targets`; app icon set → `icons`; focus → `focus`), and `tokens` where relevant. Skip visionOS/tvOS/watchOS-only guidance; keep macOS-only guidance only if it applies to desktop web.

- [ ] **Step 1: Write the 14 files.**
- [ ] **Step 2: Verify:** `node bin/design-foundations.mjs build` passes validation; `node --test tests/` passes; spot-check: no sentence of 12+ consecutive words matches the cache (`node scripts/overlap.mjs` — create this small script: n-gram overlap between `rules/*.yaml` text and `cache/hig/*.md`, prints any 12-gram match; expected: none).
- [ ] **Step 3: Commit** `feat: rules for all 15 HIG topics`.

### Task 14: Claude plugin, marketplace, sync

**Files:** Create `.claude-plugin/marketplace.json`, `plugin/.claude-plugin/plugin.json`, `plugin/skills/design-foundations/SKILL.md`, `build/plugin.mjs`, `sync/sync.mjs`; generated `plugin/skills/design-foundations/references/<topic>.md` + `tokens.md`; Modify `bin/design-foundations.mjs`, `build/build.mjs`; Test `tests/sync.test.mjs`

**Interfaces:**
- Produces: `emitPluginRefs(rules, resolved): Record<path, string>` (per topic: rules grouped by severity with id, rule, web; `tokens.md`: cheat-sheet of every `--df-*` var, Tailwind class and `motion.js` export); `sync({to, skill?: string, version}): Promise<void>` copies `dist/*` → `to/`, writes `to/VERSION`; with `skill` copies `plugin/skills/design-foundations` → `<skill>/design-foundations`.
- `SKILL.md` (hand-written): description triggers on any UI/CSS/animation/copy/icon/colour work; **build mode**: use `--df-*` vars/preset/`motion.js`, never raw values, open only the reference files for touched topics; **review mode**: run `design-foundations check --format json`, then review judgement rules (WRT, BRD, INC, PRV, LAY) and report `RULE-ID file:line: finding`. Mention `df-allow` needs a reason.
- `marketplace.json`: one plugin `design-foundations`, source `./plugin`.

- [ ] **Step 1: Failing tests:** `sync copies dist and writes VERSION`; `sync with --skill copies SKILL.md and references`; `generated references contain every rule id`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** → PASS; rebuild.
- [ ] **Step 5: Commit** `feat: Claude plugin and sync`.

### Task 15: README, CHANGELOG, dry runs, tag v0.1.0

**Files:** Create `README.md` (replace stub), `CHANGELOG.md`, `examples/pebble-picker.config.json`, `examples/beacon.config.json`

- [ ] **Step 1: README:** what it is, install for static (`npx github:AidanPhilpott/design-foundations#v0.1.0 sync --to app/vendor/design-foundations`) and Next/Tailwind (`npm i github:…#v0.1.0`, `presets: [require('design-foundations/dist/tailwind-preset.cjs')]`, import `tokens.css`), project tokens, `check` + baseline + `df-allow`, `ingest fetch/diff`, plugin install (`.claude/settings.json` `extraKnownMarketplaces` + `enabledPlugins`) and the `sync --skill` fallback, versioning policy (spec §10).
- [ ] **Step 2: Dry runs (read-only):** with the example configs, run `check --format json` against `/home/user/Alpha---Climbing-Beta` and `/home/user/beacon`, writing the outputs (counts per check and rule) to `docs/dry-runs/2026-11-pebble-picker.md` and `…-beacon.md`. Expected: runs without crashing; Pebble Picker shows the known raw durations, duplicate keyframes' raw values, blanket reduced-motion kill, raw `flyTo`; Beacon shows raw `100ms` transitions and the blanket kill. Do not modify either repo.
- [ ] **Step 3: Plugin install check:** in a scratch dir, add the marketplace in `.claude/settings.json` and confirm the skill loads in a cloud session (start a session via the remote tools or ask Aidan to open one); record the result in README (works / use `sync --skill`).
- [ ] **Step 4: Final verification:** `node --test tests/` all pass; `node bin/design-foundations.mjs build` leaves `git status` clean (dist up to date).
- [ ] **Step 5: Commit, push, tag** `v0.1.0` (`git tag v0.1.0 && git push origin v0.1.0` after the branch is merged to `main` with Aidan's OK).

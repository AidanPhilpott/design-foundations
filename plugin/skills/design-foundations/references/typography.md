<!-- generated from rules/*.yaml and the base tokens by `design-foundations build` — do not edit -->

# Typography

Each line: `ID — rule — what to do on the web`. Details and sources: docs/rules/typography.md.

## Must

TYP-01 — Set no text smaller than 11 points, and give running text the 17-point body size. — Nothing below 0.6875rem (11px at default size), and paragraphs and descriptions use the body style at 1.0625rem; the text-floor check flags smaller literals and tokens.
TYP-03 — Take every font size, line height and weight from the type style tokens instead of writing raw values. — Write var(--df-type-&lt;style&gt;-size), -leading and -weight (or the Tailwind fontSize keys) rather than px or rem literals; the raw-values check reports literals.
TYP-07 — Make the layout adapt to every text size up to the largest accessibility sizes, with containers that grow instead of clipping. — No fixed height on anything that holds text (use min-height and padding), let rows wrap, and check at 200% zoom and at the largest iOS accessibility size with .df-dynamic-type on.

## Should

TYP-02 — Use regular weight or heavier for interface text, and go larger than usual if a typeface is thin. — Keep font-weight at 400 or above (500 to 700 for emphasis); a thin display face is allowed only at title sizes.
TYP-04 — Express hierarchy through the named text styles, varying size, weight and label colour, and keep their relative order when text is resized. — Page titles use title1 or largeTitle, section headings headline, content body, metadata subhead or footnote; emphasis uses the style's -weight-em value, and rem sizing keeps the ratios when text grows.
TYP-05 — Stick to one typeface family, with at most one more for a clear purpose. — Use the default family token everywhere; a monospace stack only for codes or coordinates.
TYP-06 — Use the system font through the platform's own font names rather than bundling copies of it. — font-family var(--df-type-font-family-default), which starts with system-ui and -apple-system; never serve SF Pro or New York as web font files.
TYP-08 — Keep truncation to a minimum as text grows, letting labels wrap and offering a way to read anything that is still shortened. — Prefer wrapping to text-overflow ellipsis; where a line clamp stays (long route descriptions), the full text is one tap away on a detail view.
TYP-09 — At large text sizes, stack side-by-side items vertically and reduce the number of columns. — Write breakpoints and container queries in em or rem so they react to text size, and let flex rows wrap so metadata drops below the title.
TYP-10 — Scale meaningful icons along with the text around them. — Size inline and button icons in em (for example width and height 1.25em) instead of px.
TYP-11 — Keep the order of information the same at every text size, with the most important elements still at the top. — Reflow at large sizes by stacking, never by moving titles or primary actions below secondary content or reordering with CSS order.
TYP-13 — Give long passages roomy line spacing and keep tight leading for one or two lines in height-limited rows. — Use each style's -leading variable; descriptions and approach text keep at least body leading, and only one- or two-line list rows may set a tighter line-height.
TYP-14 — A custom typeface must scale and respond to accessibility settings the same way the system font does. — Custom @font-face families still use the rem type tokens, load with font-display swap, and fall back to the system stack.
TYP-15 — Honour the Bold Text setting by making text weights heavier when it is on. — n/a, browsers do not expose the iOS Bold Text setting; prefers-contrast more can raise weights as a partial stand-in.
TYP-16 — Let the iOS text size setting reach the web app, not only the browser zoom. — Add the df-dynamic-type class to html; where Safari supports font -apple-system-body the root becomes the user's body size and tokens.css redefines every type token as pt ÷ 17 rem, so body is exactly 1rem, and elsewhere the root stays at 100%.
TYP-18 — A screen uses at most 5 text roles, 3 font weights and 3 text colours; chips, map marks and icons are not text roles. — Build text from the --df-type-role-* tokens (title, headline, body, footnote, label) and run auditTextStyles(page, {maxStyles: 5, maxWeights: 3, maxColours: 3, ignore}) from dist/text-audit.mjs on every screen; list chips, map marks and icon glyphs in ignore. Runtime helper, no static check.

## Consider

TYP-12 — When text grows, let the content people came for grow first, while compact chrome may grow more modestly. — Titles, descriptions and data use rem tokens without limits; tab and map-control labels may cap growth with min() as long as browser zoom still enlarges them to 200%.
TYP-17 — Try text where it will really be read, and fix hard-to-read spots with more size, more contrast or a more legible face. — Check labels over map imagery and on sheets in sunlight on a phone; raise the style or move text onto a material rather than adding text shadows.

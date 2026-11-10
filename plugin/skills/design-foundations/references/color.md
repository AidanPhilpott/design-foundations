<!-- generated from rules/*.yaml and the base tokens by `design-foundations build` — do not edit -->

# Color

Each line: `ID — rule — what to do on the web`. Details and sources: docs/rules/color.md.

## Must

COL-01 — Text needs a contrast ratio of at least 4.5:1 with its background, and only large text, meaning 24 CSS px and up or bold at about 19 CSS px and up, may drop to 3:1. — The contrast check holds label.primary and label.secondary on every bg.* role, accent.on on accent and link on bg.primary to 4.5:1, and label.tertiary to 3:1, so tertiary labels are allowed only on large text (at least 1.5rem regular, or 1.1667rem at weight 700), in light, dark and both increased-contrast modes; the HIG's 18pt and any-bold thresholds are looser than WCAG AA and do not apply here.
COL-02 — Take every colour from a semantic role token instead of writing raw colour values in components. — Use var(--df-color-&lt;role&gt;) or the Tailwind preset colour classes; hex, rgb() and hsl() literals belong only in the project colour file.
COL-03 — Never let colour be the only way to tell things apart, show that something is interactive, or carry essential information. — Grade dots also print the grade or number, In, Watch and Out signals also show a word or icon, chart series differ in shape or label too, and links inside text are underlined.
COL-04 — Give each colour a single meaning across the app, and keep the interactive colour off anything that cannot be tapped. — The accent and link roles are used only on controls and links; static headings, labels and decoration use label.* or a project namespace instead.
COL-06 — Give every colour role a light value, a dark value and a stronger increased-contrast version of each. — Fill the light, dark, light-hc and dark-hc slots for each role in the project colour file; tokens.css switches them on prefers-color-scheme, prefers-contrast and data-theme.

## Should

COL-05 — Reserve the status roles for state, each with one fixed meaning in every screen, and never use them as decoration or branding. — status.success, status.warning, status.danger and status.info carry only their own meaning; domain scales such as difficulty grade bands or a go/no-go signal get their own namespace (grade.*, signal.*) rather than borrowing status.*.
COL-07 — Make the increased-contrast variants clearly stronger than the normal ones, and make sure the high-contrast scheme passes even if the default scheme falls short. — In the hc slots push labels toward pure black or white, darken separators to opaque lines and deepen accent; verify by emulating the prefers-contrast media feature in browser devtools.
COL-08 — Use each role only for the purpose its name states, never borrowing one for a different job because the shade happens to fit. — No separator as a text colour, no label.secondary as a background, no bg.* on text; add a project role when nothing fits.
COL-09 — Show layering with the background roles, putting primary behind the whole view, secondary on groups inside it and tertiary on groups within those. — Page and map chrome use bg.primary, cards and sheets bg.secondary, rows inside a card bg.tertiary; settings-style grouped lists use the bg.grouped.* set instead.
COL-10 — Rank text by importance with the label roles, from primary for main content down to tertiary and quaternary for the least important. — Titles and body use label.primary, metadata such as grade source or walk time label.secondary, hints label.tertiary, and placeholder text in inputs label.placeholder.
COL-11 — Check the palette in bright daylight and in the dark, on more than one real device. — Look at grade colours, map pins and signal badges on a phone outside at midday and in a dark room, and on both an iPhone and a desktop screen.
COL-12 — Adjust the colours of nearby interface when the artwork or imagery behind it changes character. — When the basemap switches to satellite, controls and labels over it switch to a dark scheme or sit on a material, so they stay legible on both.

## Consider

COL-13 — Consider how colours read in other cultures before using them to signal good or bad. — Pair status colour with words and icons (see COL-03) so the meaning never depends on a cultural reading.
COL-14 — When people can pick a colour, use the platform colour picker. — Use input type="color" (or a short list of named swatches) for a list or tag colour, not a hand-built picker.
COL-15 — Embed an sRGB colour profile in images, and use wide-gamut P3 colour only as an enhancement with an sRGB fallback. — Export PNG and JPEG with an embedded sRGB profile; write color(display-p3 ...) only inside @media (color-gamut: p3), after an sRGB declaration of the same property.

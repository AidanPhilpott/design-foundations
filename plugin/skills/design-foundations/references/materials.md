<!-- generated from rules/*.yaml and the base tokens by `design-foundations build` — do not edit -->

# Materials

Each line: `ID — rule — what to do on the web`. Details and sources: docs/rules/materials.md.

## Must

MAT-01 — Turn every translucent surface solid when Reduce Transparency is on or when the browser cannot blur. — Build materials only from the --df-material-* variables, which tokens.css sets to 0px blur and opacity 1 under @media (prefers-reduced-transparency: reduce) and when neither backdrop-filter nor -webkit-backdrop-filter is supported; Safari and iOS PWAs may not expose prefers-reduced-transparency, so where it is unsupported make text-heavy surfaces solid by default, and never hard-code a fallback that stays translucent.
MAT-05 — Put only primary or secondary label colours on a material, never the fainter tertiary or quaternary ones. — Text on --df-material-* surfaces uses label.primary or label.secondary; hints that would normally be label.tertiary move off the material or step up to secondary.

## Should

MAT-02 — Use a material for surfaces that float above content, such as bars, map controls and sheets, so the layer below still shows through faintly. — The header, tab bar, map control clusters and partial sheets over the map use a material; list rows and cards inside a scrolling page stay on solid bg.* roles.
MAT-03 — Pick a material by its purpose and the legibility it must give, not by the tint it adds. — Choose among ultraThin, thin, regular and thick by how much text sits on the surface; to change colour, change the role behind it, not the material's opacity.
MAT-04 — Use thicker materials under text and fine detail, and thinner ones only where keeping the background visible matters more. — Sheets and popovers holding paragraphs use regular or thick; a small icon-only map control may use thin; ultraThin is for surfaces without text.
MAT-06 — Draw fills and dividers on a material with the fill and separator roles, which are meant to sit on translucent surfaces. — Segmented controls, search fields and dividers on a material use fill.primary to fill.tertiary and separator, not solid bg.* colours.
MAT-07 — Judge legibility on a material against the brightest and busiest content that can appear behind it. — Test controls over the lightest and darkest satellite tiles and over photos; if text fails anywhere, move to a thicker material or a solid fill.
MAT-08 — Take blur and opacity from the material tokens, layered over the background role, rather than writing ad-hoc backdrop filters. — Write backdrop-filter: blur(var(--df-material-regular-blur)) with the -webkit- prefix for older Safari, and a background of color-mix(in srgb, var(--df-color-bg-primary) calc(var(--df-material-regular-opacity) * 100%), transparent).
MAT-09 — Under Increase Contrast, give material surfaces a visible edge or make them solid. — Inside @media (prefers-contrast: more) add a 1px border in separator.opaque to material surfaces, or raise their opacity to 1.

## Consider

MAT-10 — Keep translucent, blurred surfaces to the few places that benefit from them. — Limit backdrop-filter to the persistent chrome and the current sheet; never blur many list items or large scrolling regions.

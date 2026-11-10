<!-- generated from rules/*.yaml by `design-foundations build` — do not edit -->

# Materials rules

Our own wording. Rules marked HIG paraphrase the Apple Human Interface Guidelines (https://developer.apple.com/design/human-interface-guidelines/materials);
WCAG, SwiftUI-defaults and house rules come from those sources or from this project.

## MAT-01 (must)

Turn every translucent surface solid when Reduce Transparency is on or when the browser cannot blur.

- Why: Blurred, see-through backgrounds lower legibility for people who asked for less transparency.
- Web: Build materials only from the --df-material-* variables, which tokens.css sets to 0px blur and opacity 1 under @media (prefers-reduced-transparency: reduce) and when neither backdrop-filter nor -webkit-backdrop-filter is supported; Safari and iOS PWAs may not expose prefers-reduced-transparency, so where it is unsupported make text-heavy surfaces solid by default, and never hard-code a fallback that stays translucent.
- Platforms: web, swift
- Source: house rule (related: [HIG › Materials › Standard materials](https://developer.apple.com/design/human-interface-guidelines/materials))
- Tokens: `material.ultraThin.blur`, `material.ultraThin.opacity`, `material.thin.blur`, `material.thin.opacity`, `material.regular.blur`, `material.regular.opacity`, `material.thick.blur`, `material.thick.opacity`

## MAT-02 (should)

Use a material for surfaces that float above content, such as bars, map controls and sheets, so the layer below still shows through faintly.

- Why: A hint of what is underneath keeps people oriented while the surface separates controls from content.
- Web: The header, tab bar, map control clusters and partial sheets over the map use a material; list rows and cards inside a scrolling page stay on solid bg.* roles.
- Platforms: web, swift
- Source: [HIG › Materials › Materials](https://developer.apple.com/design/human-interface-guidelines/materials)

## MAT-03 (should)

Pick a material by its purpose and the legibility it must give, not by the tint it adds.

- Why: How a material looks shifts with settings and with the content behind it, so its colour is not a stable design choice.
- Web: Choose among ultraThin, thin, regular and thick by how much text sits on the surface; to change colour, change the role behind it, not the material's opacity.
- Platforms: web, swift
- Source: [HIG › Materials › Standard materials](https://developer.apple.com/design/human-interface-guidelines/materials)

## MAT-04 (should)

Use thicker materials under text and fine detail, and thinner ones only where keeping the background visible matters more.

- Why: More opacity buys contrast, while more translucency preserves context, and text needs the former.
- Web: Sheets and popovers holding paragraphs use regular or thick; a small icon-only map control may use thin; ultraThin is for surfaces without text.
- Platforms: web, swift
- Source: [HIG › Materials › Standard materials](https://developer.apple.com/design/human-interface-guidelines/materials)
- Tokens: `material.thick.opacity`, `material.regular.opacity`, `material.thin.opacity`, `material.ultraThin.opacity`

## MAT-05 (must)

Put only primary or secondary label colours on a material, never the fainter tertiary or quaternary ones.

- Why: The background behind a material keeps changing, so faint text that passes on one spot fails on the next.
- Web: Text on --df-material-* surfaces uses label.primary or label.secondary; hints that would normally be label.tertiary move off the material or step up to secondary.
- Platforms: web, swift
- Source: house rule (related: [HIG › Materials › iOS, iPadOS](https://developer.apple.com/design/human-interface-guidelines/materials))

## MAT-06 (should)

Draw fills and dividers on a material with the fill and separator roles, which are meant to sit on translucent surfaces.

- Why: Opaque greys on a material look like holes and break the layered effect.
- Web: Segmented controls, search fields and dividers on a material use fill.primary to fill.tertiary and separator, not solid bg.* colours.
- Platforms: web, swift
- Source: [HIG › Materials › iOS, iPadOS](https://developer.apple.com/design/human-interface-guidelines/materials)

## MAT-07 (should)

Judge legibility on a material against the brightest and busiest content that can appear behind it.

- Why: Text that reads well over plain ground can disappear over snow, sky or a dense photo.
- Web: Test controls over the lightest and darkest satellite tiles and over photos; if text fails anywhere, move to a thicker material or a solid fill.
- Platforms: web, swift
- Source: house rule (related: [HIG › Materials › Standard materials](https://developer.apple.com/design/human-interface-guidelines/materials))

## MAT-08 (should)

Take blur and opacity from the material tokens, layered over the background role, rather than writing ad-hoc backdrop filters.

- Why: Shared values keep surfaces consistent and let accessibility settings switch them in one place.
- Web: Write backdrop-filter: blur(var(--df-material-regular-blur)) with the -webkit- prefix for older Safari, and a background of color-mix(in srgb, var(--df-color-bg-primary) calc(var(--df-material-regular-opacity) * 100%), transparent).
- Platforms: web, swift
- Source: house rule (related: [HIG › Materials › Standard materials](https://developer.apple.com/design/human-interface-guidelines/materials))
- Tokens: `material.regular.blur`, `material.regular.opacity`

## MAT-09 (should)

Under Increase Contrast, give material surfaces a visible edge or make them solid.

- Why: People who ask for more contrast need floating surfaces to stand clearly apart from what lies behind them.
- Web: Inside @media (prefers-contrast: more) add a 1px border in separator.opaque to material surfaces, or raise their opacity to 1.
- Platforms: web, swift
- Source: house rule (related: [HIG › Materials › Standard materials](https://developer.apple.com/design/human-interface-guidelines/materials))

## MAT-10 (consider)

Keep translucent, blurred surfaces to the few places that benefit from them.

- Why: Too much translucency is visually noisy, and every blurred layer costs battery and frame rate on phones.
- Web: Limit backdrop-filter to the persistent chrome and the current sheet; never blur many list items or large scrolling regions.
- Platforms: web, swift
- Source: house rule (related: [HIG › Materials › Standard materials](https://developer.apple.com/design/human-interface-guidelines/materials))

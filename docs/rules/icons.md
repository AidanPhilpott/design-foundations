<!-- generated from rules/*.yaml by `design-foundations build` — do not edit -->

# Icons rules

Our own wording. Rules marked HIG paraphrase the Apple Human Interface Guidelines (https://developer.apple.com/design/human-interface-guidelines/icons);
WCAG, SwiftUI-defaults and house rules come from those sources or from this project.

## ICN-01 (must)

Give every icon-only control an accessible name that says what it does, and hide icons that sit beside a visible label from assistive technology.

- Why: A screen reader cannot describe a picture, and announcing both the icon and its label is just noise.
- Web: An icon-only button carries aria-label="Save to list" and its svg carries aria-hidden="true"; when text follows the icon, the svg keeps aria-hidden="true" and the button needs no aria-label; the HIG asks for labels on custom icons, and hiding an icon that sits beside visible text is house advice.
- Platforms: web, swift
- Source: [HIG › Icons › Best practices](https://developer.apple.com/design/human-interface-guidelines/icons)

## ICN-02 (must)

Icons that carry information rather than trigger an action, such as hazard or style pictographs, also need a text equivalent.

- Why: Meaning that lives only in a small picture is lost to screen reader users and to anyone who has not learned the symbol.
- Web: Give informational SVGs role="img" with an aria-label (Sit start, Dangerous fall) or pair them with visible text, and keep a legend reachable from wherever the pictographs appear.
- Platforms: web, swift
- Source: WCAG 2.2 › 1.1.1 Non-text Content (see also [HIG › Icons](https://developer.apple.com/design/human-interface-guidelines/icons))

## ICN-03 (should)

Choose a highly simplified icon with a familiar metaphor tied directly to the action or content it stands for.

- Why: Extra detail makes a glyph harder to read at small sizes, and an unfamiliar metaphor has to be learned.
- Web: One idea per glyph at 20 to 24 px; if a glyph needs explaining, add a text label instead of more detail.
- Platforms: web, swift
- Source: [HIG › Icons › Best practices](https://developer.apple.com/design/human-interface-guidelines/icons)

## ICN-04 (should)

Use the widely known symbol for common actions instead of inventing a new one.

- Why: People already know what a magnifying glass, a plus, a trash can or three dots mean, so they can act without reading.
- Web: Magnifier for search, plus for add, trash for delete, ellipsis for more, an x for close, a box with an upward arrow for share on Apple devices and three shortening lines or a funnel for filter; in SwiftUI use the matching SF Symbols.
- Platforms: web, swift
- Source: [HIG › Icons › Standard icons](https://developer.apple.com/design/human-interface-guidelines/icons)

## ICN-05 (should)

Draw all interface icons as one family with the same grid, level of detail, stroke weight and viewpoint.

- Why: Mixed icon styles look accidental and make some icons seem more important than others.
- Web: One SVG set on a shared viewBox (24 units) with a single stroke-width and line cap; nudge a visually heavy glyph a little smaller so it reads at the same size as the rest; do not mix icon libraries.
- Platforms: web, swift
- Source: [HIG › Icons › Best practices](https://developer.apple.com/design/human-interface-guidelines/icons)

## ICN-06 (should)

Ship interface icons as vectors that take their colour from the surrounding text.

- Why: A vector stays sharp at every pixel density without extra files, and inheriting colour keeps icons correct in dark mode and high contrast.
- Web: Inline SVG or an SVG sprite with fill or stroke set to currentColor, sized in em (1em to 1.25em) so it grows with the text as TYP-10 asks; no PNG glyphs.
- Platforms: web, swift
- Source: [HIG › Icons › Best practices](https://developer.apple.com/design/human-interface-guidelines/icons)

## ICN-07 (consider)

Match an icon's visual weight to the weight of the text next to it unless one of them is meant to stand out.

- Why: Equal weights give a label and its icon the same emphasis, so neither looks out of place.
- Web: Thicken the stroke a step for icons beside semibold or bold labels; SwiftUI symbols follow the font weight automatically.
- Platforms: web, swift
- Source: [HIG › Icons › Best practices](https://developer.apple.com/design/human-interface-guidelines/icons)

## ICN-08 (should)

Give each icon a single meaning throughout the app, and never reuse a glyph for an unrelated action.

- Why: Once people learn a symbol they act on it without thinking, so a second meaning causes mistakes.
- Web: Keep an icon map in the project (for example bookmark always means save to a list, flag always means report an issue).
- Platforms: web, swift
- Source: house rule (related: [HIG › Icons › Best practices](https://developer.apple.com/design/human-interface-guidelines/icons))

## ICN-09 (consider)

Centre asymmetric icons by eye rather than by their bounding box, building any correction into the asset's padding.

- Why: A glyph that is heavier on one side looks off-centre when its box is centred, and small shifts change how polished the interface feels.
- Web: Shift the paths inside the SVG viewBox so that centring the element with flexbox already looks right; no per-use margin hacks.
- Platforms: web, swift
- Source: [HIG › Icons › Best practices](https://developer.apple.com/design/human-interface-guidelines/icons)

## ICN-10 (consider)

Add a separate selected-state icon only when the control does not already show selection in another way.

- Why: Standard tab bars, toolbars and toggles mark selection for you, and a second icon set doubles the maintenance.
- Web: Show the selected tab or toggle with the accent role and aria-current="page" or aria-pressed="true"; a filled variant of the glyph is optional, never the only signal.
- Platforms: web, swift
- Source: [HIG › Icons › Best practices](https://developer.apple.com/design/human-interface-guidelines/icons)

## ICN-11 (should)

Draw people in icons as gender-neutral figures and avoid images that only some cultures will recognise.

- Why: Icons should welcome everyone, and a figure or gesture that means nothing, or something rude, elsewhere excludes people.
- Web: Use a neutral person outline for account and climber glyphs; avoid hand gestures and culture-specific objects as metaphors.
- Platforms: web, swift
- Source: [HIG › Icons › Best practices](https://developer.apple.com/design/human-interface-guidelines/icons)

## ICN-12 (consider)

Put letters inside an icon only when they are the clearest way to show the idea, and then localise them.

- Why: Characters in a glyph tie it to one language and script.
- Web: Prefer abstract lines to suggest text; an icon that shows lines of text gets a mirrored version for right-to-left pages (see RTL-08).
- Platforms: web, swift
- Source: [HIG › Icons › Best practices](https://developer.apple.com/design/human-interface-guidelines/icons)

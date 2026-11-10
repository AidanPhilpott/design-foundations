<!-- generated from rules/*.yaml and the base tokens by `design-foundations build` — do not edit -->

# Icons

Each line: `ID — rule — what to do on the web`. Details and sources: docs/rules/icons.md.

## Must

ICN-01 — Give every icon-only control an accessible name that says what it does, and hide icons that sit beside a visible label from assistive technology. — An icon-only button carries aria-label="Save to list" and its svg carries aria-hidden="true"; when text follows the icon, the svg keeps aria-hidden="true" and the button needs no aria-label; the HIG asks for labels on custom icons, and hiding an icon that sits beside visible text is house advice.
ICN-02 — Icons that carry information rather than trigger an action, such as hazard or style pictographs, also need a text equivalent. — Give informational SVGs role="img" with an aria-label (Sit start, Dangerous fall) or pair them with visible text, and keep a legend reachable from wherever the pictographs appear.

## Should

ICN-03 — Choose a highly simplified icon with a familiar metaphor tied directly to the action or content it stands for. — One idea per glyph at 20 to 24 px; if a glyph needs explaining, add a text label instead of more detail.
ICN-04 — Use the widely known symbol for common actions instead of inventing a new one. — Magnifier for search, plus for add, trash for delete, ellipsis for more, an x for close, a box with an upward arrow for share on Apple devices and three shortening lines or a funnel for filter; in SwiftUI use the matching SF Symbols.
ICN-05 — Draw all interface icons as one family with the same grid, level of detail, stroke weight and viewpoint. — One SVG set on a shared viewBox (24 units) with a single stroke-width and line cap; nudge a visually heavy glyph a little smaller so it reads at the same size as the rest; do not mix icon libraries.
ICN-06 — Ship interface icons as vectors that take their colour from the surrounding text. — Inline SVG or an SVG sprite with fill or stroke set to currentColor, sized in em (1em to 1.25em) so it grows with the text as TYP-10 asks; no PNG glyphs.
ICN-08 — Give each icon a single meaning throughout the app, and never reuse a glyph for an unrelated action. — Keep an icon map in the project (for example bookmark always means save to a list, flag always means report an issue).
ICN-11 — Draw people in icons as gender-neutral figures and avoid images that only some cultures will recognise. — Use a neutral person outline for account and climber glyphs; avoid hand gestures and culture-specific objects as metaphors.

## Consider

ICN-07 — Match an icon's visual weight to the weight of the text next to it unless one of them is meant to stand out. — Thicken the stroke a step for icons beside semibold or bold labels; SwiftUI symbols follow the font weight automatically.
ICN-09 — Centre asymmetric icons by eye rather than by their bounding box, building any correction into the asset's padding. — Shift the paths inside the SVG viewBox so that centring the element with flexbox already looks right; no per-use margin hacks.
ICN-10 — Add a separate selected-state icon only when the control does not already show selection in another way. — Show the selected tab or toggle with the accent role and aria-current="page" or aria-pressed="true"; a filled variant of the glyph is optional, never the only signal.
ICN-12 — Put letters inside an icon only when they are the clearest way to show the idea, and then localise them. — Prefer abstract lines to suggest text; an icon that shows lines of text gets a mirrored version for right-to-left pages (see RTL-08).

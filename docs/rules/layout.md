<!-- generated from rules/*.yaml by `design-foundations build` — do not edit -->

# Layout rules

Our own wording. Rules marked HIG paraphrase the Apple Human Interface Guidelines (https://developer.apple.com/design/human-interface-guidelines/layout);
WCAG, SwiftUI-defaults and house rules come from those sources or from this project.

## LAY-01 (must)

Keep content and controls inside the safe area, clear of notches, the home indicator, rounded corners and browser bars.

- Why: Anything under a hardware cutout or system bar is hidden or impossible to tap.
- Web: Set viewport-fit=cover in the viewport meta and pad fixed headers, tab bars, bottom sheets and map controls with env(safe-area-inset-top|right|bottom|left, 0px); full-bleed maps and imagery may extend underneath.
- Platforms: web, swift
- Source: [HIG › Layout › Guides and safe areas](https://developer.apple.com/design/human-interface-guidelines/layout)

## LAY-02 (should)

Arrange each screen by importance, placing what matters most at the top and on the leading side.

- Why: People scan in reading order, so position is the first signal of priority.
- Web: On an area or climb page the name, grade and key action come first; secondary details such as history and sources follow; use logical properties (inline-start) so the leading side flips in right-to-left text.
- Platforms: web, swift
- Source: [HIG › Layout › Visual hierarchy](https://developer.apple.com/design/human-interface-guidelines/layout)

## LAY-03 (should)

Leave about 12 points around controls with a visible bezel and about 24 points around bare icons or text controls.

- Why: Spacing is as important as size in preventing taps on the wrong control.
- Web: Separate adjacent bordered buttons and chips by the bezel spacing token and bare icon buttons by the bare spacing token, measured from their visible edges (gap or margin).
- Platforms: web, swift
- Source: [HIG › Accessibility › Mobility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- Tokens: `a11y.spacing.bezel`, `a11y.spacing.bare`

## LAY-04 (must)

Base layout decisions on the space actually available, never on the device type or its orientation.

- Why: The same device can show the app at many widths, in split view, a resized window or landscape.
- Web: Switch layouts with width media or container queries at the regular breakpoint token (700px by default, overridable per project, for example 761px in Pebble Picker); no user-agent sniffing and no orientation queries for layout.
- Platforms: web, swift
- Source: [HIG › Layout › Size classes](https://developer.apple.com/design/human-interface-guidelines/layout)
- Tokens: `layout.breakpoint.regular`

## LAY-05 (must)

Offer the same functions at every size, changing only how much of it is visible at once.

- Why: People should not lose a feature because they rotated the phone or narrowed a window.
- Web: A wide screen may show a side panel next to the map where a phone uses a sheet or a More menu, but both reach every action.
- Platforms: web, swift
- Source: [HIG › Layout › Size classes](https://developer.apple.com/design/human-interface-guidelines/layout)

## LAY-06 (should)

Use the standard side margins, 16 points in compact widths and 20 points in regular widths.

- Why: Consistent margins align content with the system and other apps and keep text off the screen edge.
- Web: Pad page content inline by the compact margin token below the regular breakpoint and by the regular margin token above it, added to the safe-area inset rather than replacing it.
- Platforms: web, swift
- Source: house rule (related: [HIG › Layout › Guides and safe areas](https://developer.apple.com/design/human-interface-guidelines/layout))
- Tokens: `layout.margin.compact`, `layout.margin.regular`, `layout.breakpoint.regular`

## LAY-07 (should)

Keep spacing on the 4-point grid by taking every gap, padding and margin from the space scale.

- Why: A shared rhythm makes screens look orderly and keeps spacing consistent across both apps.
- Web: Write var(--df-space-*) or the Tailwind spacing keys from the preset instead of arbitrary pixel values.
- Platforms: web, swift
- Source: house rule (related: [HIG › Layout › Visual hierarchy](https://developer.apple.com/design/human-interface-guidelines/layout))
- Tokens: `space.0`, `space.0_5`, `space.1`, `space.2`, `space.3`, `space.4`, `space.5`, `space.6`, `space.8`, `space.10`, `space.12`, `space.16`

## LAY-08 (should)

Align items to shared edges for easy scanning, and indent only to show that an item belongs beneath the one above.

- Why: People read aligned things as peers and indented things as children, so stray offsets suggest a false hierarchy.
- Web: List rows share one leading text edge; problem variations indent under their parent problem by one step of the space scale.
- Platforms: web, swift
- Source: [HIG › Layout › Visual hierarchy](https://developer.apple.com/design/human-interface-guidelines/layout)

## LAY-09 (should)

Group related items and set unrelated ones apart using whitespace, a shared container or a separator.

- Why: Visible groups tell people which controls and facts belong together.
- Web: Put each wall's problems in one card on bg.secondary, divide rows with the separator role, and leave a larger space step between groups than within them.
- Platforms: web, swift
- Source: [HIG › Layout › Visual hierarchy](https://developer.apple.com/design/human-interface-guidelines/layout)

## LAY-10 (should)

Show the essentials first and reveal detail on request.

- Why: A screen with everything open at once makes finding any one thing slow.
- Web: Use details and summary, expandable sections or a sheet for long approach notes, full FA history and per-problem variations; the collapsed state still names what is inside.
- Platforms: web, swift
- Source: [HIG › Layout › Visual hierarchy](https://developer.apple.com/design/human-interface-guidelines/layout)

## LAY-11 (should)

Make controls look distinct from content, and let full-screen content run underneath bars and floating controls.

- Why: Clear separation tells people what they can operate, while edge-to-edge content keeps the view open.
- Web: The map fills the viewport under the header and tab bar; buttons over it sit on a material or solid fill with a separator edge (see MAT-02).
- Platforms: web, swift
- Source: [HIG › Layout › Visual hierarchy](https://developer.apple.com/design/human-interface-guidelines/layout)

## LAY-12 (must)

Size full-height panes and sheets by the visible viewport so browser toolbars and the on-screen keyboard never cover their controls.

- Why: In mobile browsers a plain viewport-height unit can extend behind the toolbar and hide the bottom of the screen.
- Web: Use 100dvh (with a 100vh fallback first) for full-height layouts and cap sheets with max-height in dvh; dvh ignores the iOS keyboard, so keep controls above it with window.visualViewport resize and scroll events, and add interactive-widget=resizes-content to the viewport meta for Chromium.
- Platforms: web
- Source: house rule (related: [HIG › Layout › Guides and safe areas](https://developer.apple.com/design/human-interface-guidelines/layout))

## LAY-13 (should)

Make the layout work in every orientation and window size, even if one orientation is the main use.

- Why: People rotate phones, resize desktop browsers and split screens, and expect the app to stay familiar.
- Web: Do not set orientation in the web manifest unless the app truly cannot work otherwise; test a short landscape phone height, where sheets must scroll.
- Platforms: web, swift
- Source: [HIG › Layout › Adaptability](https://developer.apple.com/design/human-interface-guidelines/layout)

## LAY-14 (should)

Test the smallest and largest layouts first, then the sizes, languages and text settings in between.

- Why: Clipping and overlap show up first at the extremes.
- Web: Check 320 CSS px wide (small iPhone with Display Zoom), a landscape phone, a wide desktop window, 200% text and long translated strings in responsive devtools and on a real phone.
- Platforms: web, swift
- Source: [HIG › Layout › Adaptability](https://developer.apple.com/design/human-interface-guidelines/layout)

## LAY-15 (consider)

When background art or imagery meets a new aspect ratio, scale it to fill rather than stretching or boxing it.

- Why: Distorted or letterboxed artwork looks broken and wastes the screen.
- Web: Give background and hero images object-fit cover (or background-size cover) with a sensible object-position, never a forced width and height alone; images whose edges carry information, such as topos with marked lines, use contain.
- Platforms: web, swift
- Source: [HIG › Layout › Adaptability](https://developer.apple.com/design/human-interface-guidelines/layout)

## LAY-16 (should)

On wide screens, limit how long a line of running text can get instead of letting it span the whole window.

- Why: Very long lines make it hard for the eye to find the start of the next one.
- Web: Give paragraphs and description blocks max-inline-size around 70ch (centred or leading-aligned in the column), while maps, tables and images may still use the full width.
- Platforms: web, swift
- Source: [HIG › Layout › Guides and safe areas](https://developer.apple.com/design/human-interface-guidelines/layout)

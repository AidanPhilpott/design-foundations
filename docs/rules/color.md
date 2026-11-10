<!-- generated from rules/*.yaml by `design-foundations build` — do not edit -->

# Color rules

Our own wording. Rules marked HIG paraphrase the Apple Human Interface Guidelines (https://developer.apple.com/design/human-interface-guidelines/color);
WCAG, SwiftUI-defaults and house rules come from those sources or from this project.

## COL-01 (must)

Text needs a contrast ratio of at least 4.5:1 with its background, and only large text, meaning 24 CSS px and up or bold at about 19 CSS px and up, may drop to 3:1.

- Why: Faint text is unreadable for people with low vision and for everyone in sunlight or on a dim screen.
- Web: The contrast check holds label.primary and label.secondary on every bg.* role, accent.on on accent and link on bg.primary to 4.5:1, and label.tertiary to 3:1, so tertiary labels are allowed only on large text (at least 1.5rem regular, or 1.1667rem at weight 700), in light, dark and both increased-contrast modes; the HIG's 18pt and any-bold thresholds are looser than WCAG AA and do not apply here.
- Platforms: web, swift
- Source: WCAG 2.2 › 1.4.3 Contrast (Minimum) (see also [HIG › Color](https://developer.apple.com/design/human-interface-guidelines/color))
- Check: `contrast`

## COL-02 (must)

Take every colour from a semantic role token instead of writing raw colour values in components.

- Why: Roles let one change of theme, mode or contrast setting update the whole interface consistently.
- Web: Use var(--df-color-&lt;role&gt;) or the Tailwind preset colour classes; hex, rgb() and hsl() literals belong only in the project colour file.
- Platforms: web, swift
- Source: [HIG › Color › System colors](https://developer.apple.com/design/human-interface-guidelines/color)
- Check: `raw-values`

## COL-03 (must)

Never let colour be the only way to tell things apart, show that something is interactive, or carry essential information.

- Why: People with colour blindness, and anyone on a washed-out screen, would lose the meaning.
- Web: Grade dots also print the grade or number, In, Watch and Out signals also show a word or icon, chart series differ in shape or label too, and links inside text are underlined.
- Platforms: web, swift
- Source: [HIG › Color › Inclusive color](https://developer.apple.com/design/human-interface-guidelines/color)

## COL-04 (must)

Give each colour a single meaning across the app, and keep the interactive colour off anything that cannot be tapped.

- Why: When the same hue marks both buttons and plain text, people stop trusting it to show what is clickable.
- Web: The accent and link roles are used only on controls and links; static headings, labels and decoration use label.* or a project namespace instead.
- Platforms: web, swift
- Source: [HIG › Color › Best practices](https://developer.apple.com/design/human-interface-guidelines/color)

## COL-05 (should)

Reserve the status roles for state, each with one fixed meaning in every screen, and never use them as decoration or branding.

- Why: Success, warning, danger and info colours only work as signals if they always mean the same thing.
- Web: status.success, status.warning, status.danger and status.info carry only their own meaning; domain scales such as Pebble Picker grade bands or Beacon signals get their own namespace (grade.*, signal.*) rather than borrowing status.*.
- Platforms: web, swift
- Source: house rule (related: [HIG › Color › Best practices](https://developer.apple.com/design/human-interface-guidelines/color))

## COL-06 (must)

Give every colour role a light value, a dark value and a stronger increased-contrast version of each.

- Why: People switch appearance and turn on Increase Contrast, and a role missing a variant breaks in exactly those settings.
- Web: Fill the light, dark, light-hc and dark-hc slots for each role in the project colour file; tokens.css switches them on prefers-color-scheme, prefers-contrast and data-theme.
- Platforms: web, swift
- Source: [HIG › Color › Best practices](https://developer.apple.com/design/human-interface-guidelines/color)

## COL-07 (should)

Make the increased-contrast variants clearly stronger than the normal ones, and make sure the high-contrast scheme passes even if the default scheme falls short.

- Why: People who turn on Increase Contrast need a difference they can actually see, not a token adjustment.
- Web: In the hc slots push labels toward pure black or white, darken separators to opaque lines and deepen accent; verify by emulating the prefers-contrast media feature in browser devtools.
- Platforms: web, swift
- Source: [HIG › Accessibility › Vision](https://developer.apple.com/design/human-interface-guidelines/accessibility)

## COL-08 (should)

Use each role only for the purpose its name states, never borrowing one for a different job because the shade happens to fit.

- Why: Roles are tuned for their job in every mode, so a separator used as text or a label used as a fill will fail somewhere.
- Web: No separator as a text colour, no label.secondary as a background, no bg.* on text; add a project role when nothing fits.
- Platforms: web, swift
- Source: [HIG › Color › System colors](https://developer.apple.com/design/human-interface-guidelines/color)

## COL-09 (should)

Show layering with the background roles, putting primary behind the whole view, secondary on groups inside it and tertiary on groups within those.

- Why: A steady step from one background level to the next tells people how content is nested.
- Web: Page and map chrome use bg.primary, cards and sheets bg.secondary, rows inside a card bg.tertiary; settings-style grouped lists use the bg.grouped.* set instead.
- Platforms: web, swift
- Source: [HIG › Color › iOS, iPadOS](https://developer.apple.com/design/human-interface-guidelines/color)

## COL-10 (should)

Rank text by importance with the label roles, from primary for main content down to tertiary and quaternary for the least important.

- Why: A small set of consistent text tones builds hierarchy without extra sizes or weights.
- Web: Titles and body use label.primary, metadata such as grade source or walk time label.secondary, hints label.tertiary, and placeholder text in inputs label.placeholder.
- Platforms: web, swift
- Source: [HIG › Color › iOS, iPadOS](https://developer.apple.com/design/human-interface-guidelines/color)

## COL-11 (should)

Check the palette in bright daylight and in the dark, on more than one real device.

- Why: Sunlight mutes colour and darkness makes it glare, and these apps are used outdoors.
- Web: Look at grade colours, map pins and signal badges on a phone outside at midday and in a dark room, and on both an iPhone and a desktop screen.
- Platforms: web, swift
- Source: [HIG › Color › Best practices](https://developer.apple.com/design/human-interface-guidelines/color)

## COL-12 (should)

Adjust the colours of nearby interface when the artwork or imagery behind it changes character.

- Why: Chrome that suits a light street map can vanish over dark satellite imagery, or the reverse.
- Web: When the basemap switches to satellite, controls and labels over it switch to a dark scheme or sit on a material, so they stay legible on both.
- Platforms: web, swift
- Source: [HIG › Color › Best practices](https://developer.apple.com/design/human-interface-guidelines/color)

## COL-13 (consider)

Consider how colours read in other cultures before using them to signal good or bad.

- Why: Red means danger in some places and good fortune in others, so colour alone can send the wrong message.
- Web: Pair status colour with words and icons (see COL-03) so the meaning never depends on a cultural reading.
- Platforms: web, swift
- Source: [HIG › Color › Inclusive color](https://developer.apple.com/design/human-interface-guidelines/color)

## COL-14 (consider)

When people can pick a colour, use the platform colour picker.

- Why: The built-in picker is familiar, accessible and keeps colours people saved elsewhere.
- Web: Use input type="color" (or a short list of named swatches) for a list or tag colour, not a hand-built picker.
- Platforms: web, swift
- Source: [HIG › Color › Best practices](https://developer.apple.com/design/human-interface-guidelines/color)

## COL-15 (consider)

Embed an sRGB colour profile in images, and use wide-gamut P3 colour only as an enhancement with an sRGB fallback.

- Why: Untagged or P3-only assets shift or clip on many displays.
- Web: Export PNG and JPEG with an embedded sRGB profile; write color(display-p3 ...) only inside @media (color-gamut: p3), after an sRGB declaration of the same property.
- Platforms: web, swift
- Source: [HIG › Color › Color management](https://developer.apple.com/design/human-interface-guidelines/color)

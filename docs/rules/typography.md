<!-- generated from rules/*.yaml by `design-foundations build` — do not edit -->

# Typography rules

Our own wording. Rules marked HIG paraphrase the Apple Human Interface Guidelines (https://developer.apple.com/design/human-interface-guidelines/typography);
WCAG, SwiftUI-defaults and house rules come from those sources or from this project.

## TYP-01 (must)

Set no text smaller than 11 points, and give running text the 17-point body size.

- Why: These iOS defaults are the smallest sizes most people can read comfortably on a phone.
- Web: Nothing below 0.6875rem (11px at default size), and paragraphs and descriptions use the body style at 1.0625rem; the text-floor check flags smaller literals and tokens.
- Platforms: web, swift
- Source: [HIG › Accessibility › Vision](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- Check: `text-floor`
- Tokens: `type.floor.min`, `type.floor.body`, `type.body`, `type.caption2`

## TYP-02 (should)

Use regular weight or heavier for interface text, and go larger than usual if a typeface is thin.

- Why: Ultralight, thin and light weights break up at small sizes and on low-contrast screens.
- Web: Keep font-weight at 400 or above (500 to 700 for emphasis); a thin display face is allowed only at title sizes.
- Platforms: web, swift
- Source: [HIG › Typography › Ensuring legibility](https://developer.apple.com/design/human-interface-guidelines/typography)

## TYP-03 (must)

Take every font size, line height and weight from the type style tokens instead of writing raw values.

- Why: One shared scale keeps hierarchy consistent and lets text resize everywhere at once.
- Web: Write var(--df-type-<style>-size), -leading and -weight (or the Tailwind fontSize keys) rather than px or rem literals; the raw-values check reports literals.
- Platforms: web, swift
- Source: house rule (related: [HIG › Typography › Using system fonts](https://developer.apple.com/design/human-interface-guidelines/typography))
- Check: `raw-values`
- Tokens: `type.largeTitle`, `type.title1`, `type.title2`, `type.title3`, `type.headline`, `type.body`, `type.callout`, `type.subhead`, `type.footnote`, `type.caption1`, `type.caption2`

## TYP-04 (should)

Express hierarchy through the named text styles, varying size, weight and label colour, and keep their relative order when text is resized.

- Why: A predictable scale lets people see at a glance what is a title, what is content and what is detail.
- Web: Page titles use title1 or largeTitle, section headings headline, content body, metadata subhead or footnote; emphasis uses the style's -weight-em value, and rem sizing keeps the ratios when text grows.
- Platforms: web, swift
- Source: [HIG › Typography › Conveying hierarchy](https://developer.apple.com/design/human-interface-guidelines/typography)
- Tokens: `type.largeTitle`, `type.title1`, `type.headline`, `type.body`, `type.subhead`, `type.footnote`

## TYP-05 (should)

Stick to one typeface family, with at most one more for a clear purpose.

- Why: Every extra face weakens the hierarchy and makes the interface feel stitched together.
- Web: Use the default family token everywhere; a monospace stack only for codes or coordinates.
- Platforms: web, swift
- Source: [HIG › Typography › Conveying hierarchy](https://developer.apple.com/design/human-interface-guidelines/typography)
- Tokens: `type.fontFamily.default`

## TYP-06 (should)

Use the system font through the platform's own font names rather than bundling copies of it.

- Why: The system face is tuned per size and language, and Apple's fonts are not licensed for embedding in web apps.
- Web: font-family var(--df-type-font-family-default), which starts with system-ui and -apple-system; never serve SF Pro or New York as web font files.
- Platforms: web, swift
- Source: [HIG › Typography › Using system fonts](https://developer.apple.com/design/human-interface-guidelines/typography)
- Tokens: `type.fontFamily.default`

## TYP-07 (must)

Make the layout adapt to every text size up to the largest accessibility sizes, with containers that grow instead of clipping.

- Why: People who enlarge text need the whole screen to keep working, not only the paragraphs.
- Web: No fixed height on anything that holds text (use min-height and padding), let rows wrap, and check at 200% zoom and at the largest iOS accessibility size with .df-dynamic-type on.
- Platforms: web, swift
- Source: [HIG › Typography › Supporting Dynamic Type](https://developer.apple.com/design/human-interface-guidelines/typography)

## TYP-08 (should)

Keep truncation to a minimum as text grows, letting labels wrap and offering a way to read anything that is still shortened.

- Why: An ellipsis can hide exactly the words someone enlarged the text to read.
- Web: Prefer wrapping to text-overflow ellipsis; where a line clamp stays (long route descriptions), the full text is one tap away on a detail view.
- Platforms: web, swift
- Source: [HIG › Typography › Supporting Dynamic Type](https://developer.apple.com/design/human-interface-guidelines/typography)

## TYP-09 (should)

At large text sizes, stack side-by-side items vertically and reduce the number of columns.

- Why: Inline extras such as icons, grades and times crowd text into overlap or truncation when space runs out.
- Web: Write breakpoints and container queries in em or rem so they react to text size, and let flex rows wrap so metadata drops below the title.
- Platforms: web, swift
- Source: [HIG › Typography › Supporting Dynamic Type](https://developer.apple.com/design/human-interface-guidelines/typography)

## TYP-10 (should)

Scale meaningful icons along with the text around them.

- Why: An icon that stays small while its label doubles becomes the hardest thing on screen to read.
- Web: Size inline and button icons in em (for example width and height 1.25em) instead of px.
- Platforms: web, swift
- Source: [HIG › Typography › Supporting Dynamic Type](https://developer.apple.com/design/human-interface-guidelines/typography)

## TYP-11 (should)

Keep the order of information the same at every text size, with the most important elements still at the top.

- Why: Rearranging the screen at large sizes makes people lose track of what they were reading.
- Web: Reflow at large sizes by stacking, never by moving titles or primary actions below secondary content or reordering with CSS order.
- Platforms: web, swift
- Source: [HIG › Typography › Supporting Dynamic Type](https://developer.apple.com/design/human-interface-guidelines/typography)

## TYP-12 (consider)

When text grows, let the content people came for grow first, while compact chrome may grow more modestly.

- Why: People enlarge text to read the content, not to make every tab label and badge enormous.
- Web: Titles, descriptions and data use rem tokens without limits; tab and map-control labels may cap growth with min() as long as browser zoom still enlarges them to 200%.
- Platforms: web, swift
- Source: [HIG › Typography › Conveying hierarchy](https://developer.apple.com/design/human-interface-guidelines/typography)

## TYP-13 (should)

Give long passages roomy line spacing and keep tight leading for one or two lines in height-limited rows.

- Why: Generous spacing helps the eye find the next line, while tight leading on three or more lines becomes a wall of text.
- Web: Use each style's -leading variable; descriptions and approach text keep at least body leading, and only one- or two-line list rows may set a tighter line-height.
- Platforms: web, swift
- Source: [HIG › Typography › Using system fonts](https://developer.apple.com/design/human-interface-guidelines/typography)
- Tokens: `type.body`, `type.callout`, `type.footnote`

## TYP-14 (should)

A custom typeface must scale and respond to accessibility settings the same way the system font does.

- Why: A brand font that ignores text size settings undoes the accessibility work of the rest of the app.
- Web: Custom @font-face families still use the rem type tokens, load with font-display swap, and fall back to the system stack.
- Platforms: web, swift
- Source: [HIG › Typography › Using custom fonts](https://developer.apple.com/design/human-interface-guidelines/typography)

## TYP-15 (should)

Honour the Bold Text setting by making text weights heavier when it is on.

- Why: Some people with low vision rely on heavier strokes to read at all.
- Web: n/a, browsers do not expose the iOS Bold Text setting; prefers-contrast more can raise weights as a partial stand-in.
- Platforms: swift
- Source: [HIG › Typography › Using custom fonts](https://developer.apple.com/design/human-interface-guidelines/typography)

## TYP-16 (should)

Let the iOS text size setting reach the web app, not only the browser zoom.

- Why: Many iPhone users set their preferred size once in Settings and expect every app to follow it.
- Web: Add the df-dynamic-type class to html, which sets font -apple-system-body where Safari supports it so every rem token follows Dynamic Type, and falls back to 100%.
- Platforms: web
- Source: house rule (related: [HIG › Typography › Supporting Dynamic Type](https://developer.apple.com/design/human-interface-guidelines/typography))
- Tokens: `type.body`

## TYP-17 (consider)

Try text where it will really be read, and fix hard-to-read spots with more size, more contrast or a more legible face.

- Why: Type that is fine on a desk can fail outdoors, over imagery or at arm's length.
- Web: Check labels over map imagery and on sheets in sunlight on a phone; raise the style or move text onto a material rather than adding text shadows.
- Platforms: web, swift
- Source: [HIG › Typography › Ensuring legibility](https://developer.apple.com/design/human-interface-guidelines/typography)

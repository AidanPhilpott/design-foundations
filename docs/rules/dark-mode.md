<!-- generated from rules/*.yaml by `design-foundations build` — do not edit -->

# Dark Mode rules

Our own wording. Rules marked HIG paraphrase the Apple Human Interface Guidelines (https://developer.apple.com/design/human-interface-guidelines/dark-mode);
WCAG, SwiftUI-defaults and house rules come from those sources or from this project.

## DRK-01 (should)

Follow the appearance people chose for the whole device and avoid a separate in-app appearance setting, but if one is unavoidable, make System its default.

- Why: A separate switch in the app is one more thing to set, and an app that ignores the system choice looks broken.
- Web: Let prefers-color-scheme drive tokens.css and offer no theme switch by default; if a data-theme override must exist, it starts at System and is stored per person, never forced at load.
- Platforms: web, swift
- Source: [HIG › Dark Mode › Best practices](https://developer.apple.com/design/human-interface-guidelines/dark-mode)

## DRK-02 (must)

Design and ship both appearances as equals, and switch between them live when the setting changes while the app is open.

- Why: With the automatic schedule the appearance can flip at dusk in the middle of a session.
- Web: Colours come from CSS variables under media queries rather than a theme read once on load; any colour set from JS (map styles, canvas, inline SVG) listens to matchMedia change events.
- Platforms: web, swift
- Source: [HIG › Dark Mode › Best practices](https://developer.apple.com/design/human-interface-guidelines/dark-mode)

## DRK-03 (should)

Treat dark colours as their own considered palette rather than an inversion of the light one.

- Why: Dark backgrounds need dimmer surfaces and brighter foregrounds, and many hues must change by different amounts.
- Web: Set each role's dark slot by hand in the project colour file; no filter invert() or computed inversions of the light theme.
- Platforms: web, swift
- Source: [HIG › Dark Mode › Dark Mode colors](https://developer.apple.com/design/human-interface-guidelines/dark-mode)

## DRK-04 (should)

Keep text contrast at 4.5:1 or better in dark appearance too, and aim for about 7:1 for small text in custom colours.

- Why: Light text on near-black can lose legibility quickly, and the extra margin protects the smallest sizes.
- Web: The contrast check covers the dark and dark-hc modes at the required pairs; for caption and footnote text in a project colour, target 7:1 in dark.
- Platforms: web, swift
- Source: [HIG › Dark Mode › Dark Mode colors](https://developer.apple.com/design/human-interface-guidelines/dark-mode)

## DRK-05 (should)

Test dark appearance with Reduce Transparency and Increase Contrast turned on, each alone and then both at once.

- Why: These combinations are where dark text on dark surfaces tends to break.
- Web: In browser devtools emulate prefers-color-scheme dark with prefers-contrast more and prefers-reduced-transparency reduce in each combination, then repeat on an iPhone for Increase Contrast; Safari may not expose prefers-reduced-transparency, so an iPhone with Reduce Transparency on does not prove the transparency fallback works.
- Platforms: web, swift
- Source: [HIG › Dark Mode › Best practices](https://developer.apple.com/design/human-interface-guidelines/dark-mode)

## DRK-06 (should)

Declare that the page supports both schemes, so built-in form controls, scrollbars and text fields switch along with it.

- Why: Native controls left in light mode on a dark page glare and can be hard to read.
- Web: Set color-scheme light dark on :root (or meta name="color-scheme"), and style inputs with role tokens rather than drawing text fields yourself.
- Platforms: web
- Source: [HIG › Dark Mode › Text](https://developer.apple.com/design/human-interface-guidelines/dark-mode)

## DRK-07 (should)

Make sure interface icons and full-colour images look right in both appearances, providing a separate version where one does not.

- Why: An icon that reads well on white can disappear on black, or need an edge it lacks.
- Web: Draw monochrome SVG icons with currentColor; for raster art that fails in one mode, serve a second file with picture and source media set to prefers-color-scheme dark.
- Platforms: web, swift
- Source: [HIG › Dark Mode › Icons and images](https://developer.apple.com/design/human-interface-guidelines/dark-mode)

## DRK-08 (consider)

Tone down large white areas in images shown in dark appearance.

- Why: A bright white photo background glows against a dark interface and strains the eyes.
- Web: In dark mode give white-background images such as topo scans a slight dim (filter brightness around 0.9) without touching photos whose content must stay true.
- Platforms: web, swift
- Source: [HIG › Dark Mode › Dark Mode colors](https://developer.apple.com/design/human-interface-guidelines/dark-mode)

## DRK-09 (should)

In dark appearance, make surfaces raised above the main view, such as sheets and popovers, a little lighter than the view beneath.

- Why: Shadows barely show on black, so brightness is what separates the layers.
- Web: In the dark slots let bg.secondary be lighter than bg.primary, and put sheets, popovers and menus on bg.secondary rather than relying on box-shadow.
- Platforms: web, swift
- Source: [HIG › Dark Mode › iOS, iPadOS](https://developer.apple.com/design/human-interface-guidelines/dark-mode)

## DRK-10 (consider)

Use a dark-only interface only in rare cases, such as a screen centred on immersive photos or imagery.

- Why: Outside media viewing, people expect their own appearance choice to be honoured.
- Web: A full-screen satellite or photo viewer may stay dark (declare color-scheme dark there); lists, settings and detail pages follow the system.
- Platforms: web, swift
- Source: [HIG › Dark Mode › Best practices](https://developer.apple.com/design/human-interface-guidelines/dark-mode)

## DRK-11 (should)

Give the browser and installed PWA chrome a theme colour for each appearance.

- Why: A light status bar above a dark app, or the reverse, looks like a glitch.
- Web: Add two meta name="theme-color" tags with media set to prefers-color-scheme light and dark, using each mode's bg.primary value.
- Platforms: web
- Source: house rule (related: [HIG › Dark Mode › Best practices](https://developer.apple.com/design/human-interface-guidelines/dark-mode))

<!-- generated from rules/*.yaml and the base tokens by `design-foundations build` — do not edit -->

# Dark Mode

Each line: `ID — rule — what to do on the web`. Details and sources: docs/rules/dark-mode.md.

## Must

DRK-02 — Design and ship both appearances as equals, and switch between them live when the setting changes while the app is open. — Colours come from CSS variables under media queries rather than a theme read once on load; any colour set from JS (map styles, canvas, inline SVG) listens to matchMedia change events.

## Should

DRK-01 — Follow the appearance people chose for the whole device and avoid a separate in-app appearance setting, but if one is unavoidable, make System its default. — Let prefers-color-scheme drive tokens.css and offer no theme switch by default; if a data-theme override must exist, it starts at System and is stored per person, never forced at load.
DRK-03 — Treat dark colours as their own considered palette rather than an inversion of the light one. — Set each role's dark slot by hand in the project colour file; no filter invert() or computed inversions of the light theme.
DRK-04 — Keep text contrast at 4.5:1 or better in dark appearance too, and aim for about 7:1 for small text in custom colours. — The contrast check covers the dark and dark-hc modes at the required pairs; for caption and footnote text in a project colour, target 7:1 in dark.
DRK-05 — Test dark appearance with Reduce Transparency and Increase Contrast turned on, each alone and then both at once. — In browser devtools emulate prefers-color-scheme dark with prefers-contrast more and prefers-reduced-transparency reduce in each combination, then repeat on an iPhone for Increase Contrast; Safari may not expose prefers-reduced-transparency, so an iPhone with Reduce Transparency on does not prove the transparency fallback works.
DRK-06 — Declare that the page supports both schemes, so built-in form controls, scrollbars and text fields switch along with it. — Set color-scheme light dark on :root (or meta name="color-scheme"), and style inputs with role tokens rather than drawing text fields yourself.
DRK-07 — Make sure interface icons and full-colour images look right in both appearances, providing a separate version where one does not. — Draw monochrome SVG icons with currentColor; for raster art that fails in one mode, serve a second file with picture and source media set to prefers-color-scheme dark.
DRK-09 — In dark appearance, make surfaces raised above the main view, such as sheets and popovers, a little lighter than the view beneath. — In the dark slots let bg.secondary be lighter than bg.primary, and put sheets, popovers and menus on bg.secondary rather than relying on box-shadow.
DRK-11 — Give the browser and installed PWA chrome a theme colour for each appearance. — Add two meta name="theme-color" tags with media set to prefers-color-scheme light and dark, using each mode's bg.primary value.

## Consider

DRK-08 — Tone down large white areas in images shown in dark appearance. — In dark mode give white-background images such as scanned diagrams a slight dim (filter brightness around 0.9) without touching photos whose content must stay true.
DRK-10 — Use a dark-only interface only in rare cases, such as a screen centred on immersive photos or imagery. — A full-screen satellite or photo viewer may stay dark (declare color-scheme dark there); lists, settings and detail pages follow the system.

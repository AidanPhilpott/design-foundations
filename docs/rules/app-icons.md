<!-- generated from rules/*.yaml by `design-foundations build` — do not edit -->

# App Icons rules

Our own wording. Rules marked HIG paraphrase the Apple Human Interface Guidelines (https://developer.apple.com/design/human-interface-guidelines/app-icons);
WCAG, SwiftUI-defaults and house rules come from those sources or from this project.

## ICO-01 (must)

List a 192 px and a 512 px PNG icon in the web app manifest, plus a separate 512 px icon marked maskable.

- Why: Chromium browsers want both sizes before offering to install the app, and Android launchers crop a maskable icon into their own shape instead of shrinking a square onto a plate.
- Web: icons in manifest.webmanifest hold {"sizes": "192x192"}, {"sizes": "512x512"} and a second 512 entry with "purpose": "maskable"; keep the maskable artwork in its own file rather than one entry marked "any maskable", which would show the padding wherever the plain icon is used; the icons check runs only when config.manifest is set and verifies that a 192x192 entry, a 512x512 entry and a 512x512 entry whose purpose includes maskable exist and that local src files exist, so it accepts a single any maskable entry and does not test PNG type or real pixel size, which stay manual review.
- Platforms: web
- Source: house rule (related: [HIG › App Icons › Specifications](https://developer.apple.com/design/human-interface-guidelines/app-icons))
- Check: `icons`

## ICO-02 (must)

Link a 180 px apple-touch-icon PNG with a fully opaque, full-bleed background.

- Why: iPhone Home Screen web apps use this file, and iOS paints any transparent pixels black.
- Web: A link element with rel="apple-touch-icon" and href="apple-touch-icon-180.png" in every HTML entry page, saved as RGB with no alpha channel; recent Safari falls back to manifest icons only when no such link exists, so still provide it; the icons check flags only when no HTML file has the link, and for each linked local file verifies that it is a 180x180 PNG with no alpha channel, so a link on every entry page and full-bleed artwork stay manual review.
- Platforms: web
- Source: house rule (related: [HIG › App Icons › Layer design](https://developer.apple.com/design/human-interface-guidelines/app-icons))
- Check: `icons`

## ICO-03 (must)

Keep the main subject of the icon centred and well inside the edges, so no mask can clip it.

- Why: Corners are rounded and circles are cut differently on each device, and only the middle survives all of them.
- Web: In the maskable icon, keep everything that matters within the central circle whose radius is 40% of the icon width, and fill the rest with background; preview it under circle and squircle masks.
- Platforms: web, swift
- Source: [HIG › App Icons › Icon shape](https://developer.apple.com/design/human-interface-guidelines/app-icons)

## ICO-04 (must)

Never show Apple hardware or other trademarked products in the icon.

- Why: Those designs are protected, and devices in an icon also date quickly.
- Web: No phone, watch or laptop silhouettes in the manifest icons or favicon.
- Platforms: web, swift
- Source: [HIG › App Icons › Design](https://developer.apple.com/design/human-interface-guidelines/app-icons)

## ICO-05 (should)

Draw the icon as one square master at 1024 px with square, unrounded edges, and let each platform apply its own mask.

- Why: The system rounds or crops the corners itself, and artwork that arrives already rounded ends up with doubled or jagged edges.
- Web: Export every manifest, apple-touch-icon and favicon size from the same square source (a small build script can export them all); never bake rounded corners or a circle cut-out into the PNGs.
- Platforms: web, swift
- Source: [HIG › App Icons › Icon shape](https://developer.apple.com/design/human-interface-guidelines/app-icons)

## ICO-06 (should)

Build the icon around one simple idea with few shapes on a plain background.

- Why: Fine detail turns to noise at Home Screen and tab sizes, while a single bold shape is recognised at a glance.
- Web: Check the design at 32 px and 16 px as well as 512 px; a solid colour or gentle gradient behind one mark is enough.
- Platforms: web, swift
- Source: [HIG › App Icons › Design](https://developer.apple.com/design/human-interface-guidelines/app-icons)

## ICO-07 (should)

Leave words out of the icon unless a letter or wordmark is central to the brand, and never add instructions or labels such as New.

- Why: Text in an icon is too small to read, cannot be translated or read aloud, and repeats the name already printed beneath it.
- Web: Let the manifest short_name (about 12 characters or fewer, so launchers do not truncate it) and apple-mobile-web-app-title carry the name instead of the artwork.
- Platforms: web, swift
- Source: [HIG › App Icons › Design](https://developer.apple.com/design/human-interface-guidelines/app-icons)

## ICO-08 (should)

Use a drawn illustration rather than a photograph or screenshot, and avoid hairline strokes and tiny sharp corners.

- Why: Photos and copied interface lose their meaning when shrunk, and very thin details vanish on low-resolution sizes.
- Web: The PNGs are rendered from vector artwork with strokes thick enough to survive the 16 px favicon.
- Platforms: web, swift
- Source: [HIG › App Icons › Design](https://developer.apple.com/design/human-interface-guidelines/app-icons)

## ICO-09 (should)

Do not paint drop shadows, glows, bevels, gloss or blur into the icon artwork.

- Why: The platform adds its own lighting and depth, and baked-in effects look static, clash with it and get clipped by masks.
- Web: Flat or gently layered artwork only; any depth comes from overlapping solid shapes, not raster effects.
- Platforms: web, swift
- Source: [HIG › App Icons › Visual effects](https://developer.apple.com/design/human-interface-guidelines/app-icons)

## ICO-10 (should)

Show the same icon design wherever the app appears, from the browser tab to the Home Screen.

- Why: One consistent mark lets people find the app quickly and never mistake it for two different apps.
- Web: Favicon, manifest icons, apple-touch-icon and any sign-in or store artwork come from one source; the favicon may drop small details but keeps the same shape and colours.
- Platforms: web, swift
- Source: [HIG › App Icons › Design](https://developer.apple.com/design/human-interface-guidelines/app-icons)

## ICO-11 (should)

Provide an SVG favicon with a small PNG or ICO fallback.

- Why: A vector favicon stays sharp in any tab or bookmark size, and the fallback covers browsers whose SVG favicon support is missing or recent.
- Web: A link with rel="icon", href="favicon.ico" and sizes="32x32", followed by one with rel="icon", href="icon.svg" and type="image/svg+xml"; the sizes attribute stops Chromium preferring the ICO, and Safari support for SVG favicons is new enough that the fallback must stay.
- Platforms: web
- Source: house rule (related: [HIG › App Icons › Layer design](https://developer.apple.com/design/human-interface-guidelines/app-icons))

## ICO-12 (consider)

Keep the icon's core features recognisable when the system shows it darkened or tinted.

- Why: People who switch the Home Screen to a dark or tinted look still need to spot the app by its shape.
- Web: The manifest has no standard field for dark or tinted variants yet, and iOS may derive them from the web clip icon itself, so give the mark strong shape contrast that survives a single-colour treatment; in SwiftUI apps supply the dark and tinted variants.
- Platforms: web, swift
- Source: [HIG › App Icons › Appearances](https://developer.apple.com/design/human-interface-guidelines/app-icons)

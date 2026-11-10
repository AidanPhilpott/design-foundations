<!-- generated from rules/*.yaml by `design-foundations build` — do not edit -->

# Images rules

Our own wording. Rules marked HIG paraphrase the Apple Human Interface Guidelines (https://developer.apple.com/design/human-interface-guidelines/images);
WCAG, SwiftUI-defaults and house rules come from those sources or from this project.

## IMG-01 (must)

Give every informative image a text alternative that conveys its content or purpose, and mark purely decorative images as such.

- Why: People who cannot see the image get nothing from it unless its meaning is also available as text.
- Web: alt describes what the image shows or does (Topo of the Apron boulders with problems 16 to 21 marked), alt="" on decoration, and never a file name; in SwiftUI use accessibilityLabel or Image(decorative:).
- Platforms: web, swift
- Source: WCAG 2.2 › 1.1.1 Non-text Content (see also [HIG › Images](https://developer.apple.com/design/human-interface-guidelines/images))

## IMG-02 (should)

Supply every bitmap at the pixel densities of the screens it will appear on, which for iPhone means 2x and 3x.

- Why: An image delivered at one density looks blurry on sharper screens.
- Web: Use srcset with x descriptors for fixed-size images and w descriptors plus sizes for fluid ones, so the browser picks the right file; photos are usually fine at 2x, small UI bitmaps need 3x.
- Platforms: web, swift
- Source: [HIG › Images › Resolution](https://developer.apple.com/design/human-interface-guidelines/images)

## IMG-03 (should)

Use vector files for flat artwork, logos and diagrams, keeping bitmaps for photographs and textured art.

- Why: Vectors stay crisp at every size and density from a single file.
- Web: SVG for logos, legends, grade badges and schematic outlines; PDF or SVG assets in the SwiftUI asset catalog.
- Platforms: web, swift
- Source: [HIG › Images › Formats](https://developer.apple.com/design/human-interface-guidelines/images)

## IMG-04 (should)

Choose the file format by content, a lossy format for photos and lossless PNG for flat graphics, with a reduced palette when few colours are needed.

- Why: The right format keeps files small without visible artefacts.
- Web: Photos as JPEG, or WebP or AVIF inside a picture element with a JPEG fallback (AVIF needs iOS 16 or later); HEIC is not supported in Chromium browsers, so do not serve it to the web.
- Platforms: web, swift
- Source: [HIG › Images › Formats](https://developer.apple.com/design/human-interface-guidelines/images)

## IMG-05 (should)

Keep every image at its own aspect ratio and reserve its space before it loads.

- Why: Stretched images look broken, and pictures that pop in and push content down make people lose their place or mis-tap.
- Web: Set width and height attributes (or CSS aspect-ratio) on every img, and use object-fit rather than fixed width and height together; SwiftUI images use aspectRatio with fit or fill.
- Platforms: web, swift
- Source: house rule (related: [HIG › Images › Best practices](https://developer.apple.com/design/human-interface-guidelines/images))

## IMG-06 (should)

Put words in real text rather than baking them into an image, except for logos and source material that cannot be separated.

- Why: Text inside a picture cannot be resized, restyled for contrast, translated, searched or read aloud.
- Web: Titles, captions and labels are HTML laid over or beside the image; scanned guidebook topos are exempt as source material, but the problems they mark are also listed as text.
- Platforms: web, swift
- Source: WCAG 2.2 › 1.4.5 Images of Text (see also [HIG › Images](https://developer.apple.com/design/human-interface-guidelines/images))

## IMG-07 (should)

Try every image on several real devices before shipping it.

- Why: Artwork that looks right in a design tool can come out pixelated, squashed or over-compressed on an actual screen.
- Web: Check images on an iPhone, an Android phone and a desktop browser, in light and dark mode, including in the installed PWA.
- Platforms: web, swift
- Source: [HIG › Images › Best practices](https://developer.apple.com/design/human-interface-guidelines/images)

## IMG-08 (should)

Never send images much larger than they will be displayed, and load the ones off screen only when they are needed.

- Why: Oversized downloads drain data and battery and slow the app on weak mobile signal, such as at a trailhead.
- Web: Resize to the largest displayed width times the device pixel ratio; add loading="lazy" and decoding="async" to images below the fold (Safari has supported lazy images since 15.4) but not to the first image people see.
- Platforms: web
- Source: house rule (related: [HIG › Images › Resolution](https://developer.apple.com/design/human-interface-guidelines/images))

## IMG-09 (should)

Let people zoom into detailed images such as topos and diagrams.

- Why: Marked lines and small numbers are often unreadable at phone width, especially for people with low vision.
- Web: Open detailed images in a full-screen viewer with pinch zoom and visible zoom buttons, served at enough resolution to stay sharp when enlarged; do not block page zoom with user-scalable=no.
- Platforms: web, swift
- Source: house rule (related: [HIG › Images › Resolution](https://developer.apple.com/design/human-interface-guidelines/images))

## IMG-10 (should)

Show a neutral placeholder while an image loads and a clear message if it cannot load.

- Why: Blank gaps or broken-image icons look like bugs, and offline use makes failed loads common.
- Web: Give image boxes the bg.secondary role until they load, handle the img error event with a short text such as Topo not available offline, and keep alt text meaningful for that case too.
- Platforms: web, swift
- Source: house rule (related: [HIG › Images › Best practices](https://developer.apple.com/design/human-interface-guidelines/images))

## IMG-11 (consider)

Request high-density map tiles and imagery on sharp screens where the provider offers them.

- Why: Standard-resolution tiles look soft on phone screens, which hides the detail people zoom in for.
- Web: Use the provider's @2x tile URLs or vector tiles, or Leaflet's detectRetina option, which fetches the next zoom level's tiles at a quarter of the size.
- Platforms: web
- Source: house rule (related: [HIG › Images › Resolution](https://developer.apple.com/design/human-interface-guidelines/images))

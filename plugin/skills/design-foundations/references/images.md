<!-- generated from rules/*.yaml and the base tokens by `design-foundations build` — do not edit -->

# Images

Each line: `ID — rule — what to do on the web`. Details and sources: docs/rules/images.md.

## Must

IMG-01 — Give every informative image a text alternative that conveys its content or purpose, and mark purely decorative images as such. — alt describes what the image shows or does (Topo of the Apron boulders with problems 16 to 21 marked), alt="" on decoration, and never a file name; in SwiftUI use accessibilityLabel or Image(decorative:).

## Should

IMG-02 — Supply every bitmap at the pixel densities of the screens it will appear on, which for iPhone means 2x and 3x. — Use srcset with x descriptors for fixed-size images and w descriptors plus sizes for fluid ones, so the browser picks the right file; photos are usually fine at 2x, small UI bitmaps need 3x.
IMG-03 — Use vector files for flat artwork, logos and diagrams, keeping bitmaps for photographs and textured art. — SVG for logos, legends, grade badges and schematic outlines; PDF or SVG assets in the SwiftUI asset catalog.
IMG-04 — Choose the file format by content, a lossy format for photos and lossless PNG for flat graphics, with a reduced palette when few colours are needed. — Photos as JPEG, or WebP or AVIF inside a picture element with a JPEG fallback (AVIF needs iOS 16 or later); HEIC is not supported in Chromium browsers, so do not serve it to the web.
IMG-05 — Keep every image at its own aspect ratio and reserve its space before it loads. — Set width and height attributes (or CSS aspect-ratio) on every img, and use object-fit rather than fixed width and height together; SwiftUI images use aspectRatio with fit or fill.
IMG-06 — Put words in real text rather than baking them into an image, except for logos and source material that cannot be separated. — Titles, captions and labels are HTML laid over or beside the image; scanned guidebook topos are exempt as source material, but the problems they mark are also listed as text.
IMG-07 — Try every image on several real devices before shipping it. — Check images on an iPhone, an Android phone and a desktop browser, in light and dark mode, including in the installed PWA.
IMG-08 — Never send images much larger than they will be displayed, and load the ones off screen only when they are needed. — Resize to the largest displayed width times the device pixel ratio; add loading="lazy" and decoding="async" to images below the fold (Safari has supported lazy images since 15.4) but not to the first image people see.
IMG-09 — Let people zoom into detailed images such as topos and diagrams. — Open detailed images in a full-screen viewer with pinch zoom and visible zoom buttons, served at enough resolution to stay sharp when enlarged; do not block page zoom with user-scalable=no.
IMG-10 — Show a neutral placeholder while an image loads and a clear message if it cannot load. — Give image boxes the bg.secondary role until they load, handle the img error event with a short text such as Topo not available offline, and keep alt text meaningful for that case too.

## Consider

IMG-11 — Request high-density map tiles and imagery on sharp screens where the provider offers them. — Use the provider's @2x tile URLs or vector tiles, or Leaflet's detectRetina option, which shows half-size tiles from the next zoom level, four per tile.

<!-- generated from rules/*.yaml and the base tokens by `design-foundations build` — do not edit -->

# App Icons

Each line: `ID — rule — what to do on the web`. Details and sources: docs/rules/app-icons.md.

## Must

ICO-01 — List a 192 px and a 512 px PNG icon in the web app manifest, plus a separate 512 px icon marked maskable. — icons in manifest.webmanifest hold {"sizes": "192x192"}, {"sizes": "512x512"} and a second 512 entry with "purpose": "maskable"; keep the maskable artwork in its own file rather than one entry marked "any maskable", which would show the padding wherever the plain icon is used; the icons check runs only when config.manifest is set and verifies that a 192x192 entry, a 512x512 entry and a 512x512 entry whose purpose includes maskable exist and that local src files exist, so it accepts a single any maskable entry and does not test PNG type or real pixel size, which stay manual review.
ICO-02 — Link a 180 px apple-touch-icon PNG with a fully opaque, full-bleed background. — A link element with rel="apple-touch-icon" and href="apple-touch-icon-180.png" in every HTML entry page, saved as RGB with no alpha channel; recent Safari falls back to manifest icons only when no such link exists, so still provide it; the icons check flags only when no HTML file has the link, and for each linked local file verifies that it is a 180x180 PNG with no alpha channel, so a link on every entry page and full-bleed artwork stay manual review.
ICO-03 — Keep the main subject of the icon centred and well inside the edges, so no mask can clip it. — In the maskable icon, keep everything that matters within the central circle whose radius is 40% of the icon width, and fill the rest with background; preview it under circle and squircle masks.
ICO-04 — Never show Apple hardware or other trademarked products in the icon. — No phone, watch or laptop silhouettes in the manifest icons or favicon.

## Should

ICO-05 — Draw the icon as one square master at 1024 px with square, unrounded edges, and let each platform apply its own mask. — Export every manifest, apple-touch-icon and favicon size from the same square source (a small build script can export them all); never bake rounded corners or a circle cut-out into the PNGs.
ICO-06 — Build the icon around one simple idea with few shapes on a plain background. — Check the design at 32 px and 16 px as well as 512 px; a solid colour or gentle gradient behind one mark is enough.
ICO-07 — Leave words out of the icon unless a letter or wordmark is central to the brand, and never add instructions or labels such as New. — Let the manifest short_name (about 12 characters or fewer, so launchers do not truncate it) and apple-mobile-web-app-title carry the name instead of the artwork.
ICO-08 — Use a drawn illustration rather than a photograph or screenshot, and avoid hairline strokes and tiny sharp corners. — The PNGs are rendered from vector artwork with strokes thick enough to survive the 16 px favicon.
ICO-09 — Do not paint drop shadows, glows, bevels, gloss or blur into the icon artwork. — Flat or gently layered artwork only; any depth comes from overlapping solid shapes, not raster effects.
ICO-10 — Show the same icon design wherever the app appears, from the browser tab to the Home Screen. — Favicon, manifest icons, apple-touch-icon and any sign-in or store artwork come from one source; the favicon may drop small details but keeps the same shape and colours.
ICO-11 — Provide an SVG favicon with a small PNG or ICO fallback. — A link with rel="icon", href="favicon.ico" and sizes="32x32", followed by one with rel="icon", href="icon.svg" and type="image/svg+xml"; the sizes attribute stops Chromium preferring the ICO, and Safari support for SVG favicons is new enough that the fallback must stay.

## Consider

ICO-12 — Keep the icon's core features recognisable when the system shows it darkened or tinted. — The manifest has no standard field for dark or tinted variants yet, and iOS may derive them from the web clip icon itself, so give the mark strong shape contrast that survives a single-colour treatment; in SwiftUI apps supply the dark and tinted variants.

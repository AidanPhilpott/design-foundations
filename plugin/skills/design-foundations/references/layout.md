<!-- generated from rules/*.yaml and the base tokens by `design-foundations build` — do not edit -->

# Layout

Each line: `ID — rule — what to do on the web`. Details and sources: docs/rules/layout.md.

## Must

LAY-01 — Keep content and controls inside the safe area, clear of notches, the home indicator, rounded corners and browser bars. — Set viewport-fit=cover in the viewport meta and pad fixed headers, tab bars, bottom sheets and map controls with env(safe-area-inset-top|right|bottom|left, 0px); full-bleed maps and imagery may extend underneath.
LAY-04 — Base layout decisions on the space actually available, never on the device type or its orientation. — Switch layouts with width media or container queries at the regular breakpoint token (700px by default, overridable per project, for example 761px in Pebble Picker); no user-agent sniffing and no orientation queries for layout.
LAY-05 — Offer the same functions at every size, changing only how much of it is visible at once. — A wide screen may show a side panel next to the map where a phone uses a sheet or a More menu, but both reach every action.
LAY-12 — Size full-height panes and sheets by the visible viewport so browser toolbars and the on-screen keyboard never cover their controls. — Use 100dvh (with a 100vh fallback first) for full-height layouts and cap sheets with max-height in dvh; dvh ignores the iOS keyboard, so keep controls above it with window.visualViewport resize and scroll events, and add interactive-widget=resizes-content to the viewport meta for Chromium.

## Should

LAY-02 — Arrange each screen by importance, placing what matters most at the top and on the leading side. — On an area or climb page the name, grade and key action come first; secondary details such as history and sources follow; use logical properties (inline-start) so the leading side flips in right-to-left text.
LAY-03 — Leave about 12 points around controls with a visible bezel and about 24 points around bare icons or text controls. — Separate adjacent bordered buttons and chips by the bezel spacing token and bare icon buttons by the bare spacing token, measured from their visible edges (gap or margin).
LAY-06 — Use the standard side margins, 16 points in compact widths and 20 points in regular widths. — Pad page content inline by the compact margin token below the regular breakpoint and by the regular margin token above it, added to the safe-area inset rather than replacing it.
LAY-07 — Keep spacing on the 4-point grid by taking every gap, padding and margin from the space scale. — Write var(--df-space-*) or the Tailwind spacing keys from the preset instead of arbitrary pixel values.
LAY-08 — Align items to shared edges for easy scanning, and indent only to show that an item belongs beneath the one above. — List rows share one leading text edge; problem variations indent under their parent problem by one step of the space scale.
LAY-09 — Group related items and set unrelated ones apart using whitespace, a shared container or a separator. — Put each wall's problems in one card on bg.secondary, divide rows with the separator role, and leave a larger space step between groups than within them.
LAY-10 — Show the essentials first and reveal detail on request. — Use details and summary, expandable sections or a sheet for long approach notes, full FA history and per-problem variations; the collapsed state still names what is inside.
LAY-11 — Make controls look distinct from content, and let full-screen content run underneath bars and floating controls. — The map fills the viewport under the header and tab bar; buttons over it sit on a material or solid fill with a separator edge (see MAT-02).
LAY-13 — Make the layout work in every orientation and window size, even if one orientation is the main use. — Do not set orientation in the web manifest unless the app truly cannot work otherwise; test a short landscape phone height, where sheets must scroll.
LAY-14 — Test the smallest and largest layouts first, then the sizes, languages and text settings in between. — Check 320 CSS px wide (small iPhone with Display Zoom), a landscape phone, a wide desktop window, 200% text and long translated strings in responsive devtools and on a real phone.
LAY-16 — On wide screens, limit how long a line of running text can get instead of letting it span the whole window. — Give paragraphs and description blocks max-inline-size around 70ch (centred or leading-aligned in the column), while maps, tables and images may still use the full width.

## Consider

LAY-15 — When background art or imagery meets a new aspect ratio, scale it to fill rather than stretching or boxing it. — Give background and hero images object-fit cover (or background-size cover) with a sensible object-position, never a forced width and height alone; images whose edges carry information, such as topos with marked lines, use contain.

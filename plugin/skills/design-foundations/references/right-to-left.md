<!-- generated from rules/*.yaml and the base tokens by `design-foundations build` — do not edit -->

# Right To Left

Each line: `ID — rule — what to do on the web`. Details and sources: docs/rules/right-to-left.md.

## Should

RTL-01 — Build layouts on leading and trailing sides rather than left and right, so the whole interface can mirror for right-to-left languages. — Set dir on the html element and use logical CSS (margin-inline-start, padding-inline-end, inset-inline-start, border-inline-start, text-align start), flexbox and grid, which follow dir; SwiftUI uses leading and trailing.
RTL-02 — Never reverse the digits within a number such as a grade, phone number or distance. — Wrap numbers and codes embedded in mixed-direction text in a bdi element or dir="ltr" so the bidi algorithm keeps them intact, and format with Intl.NumberFormat so the locale picks Western or Eastern Arabic digits.
RTL-03 — Mirror navigation and controls that show progress or order, and reverse any numbered sequence along with them. — Back chevrons point right and next arrows point left under dir="rtl"; native range inputs follow dir, but check custom sliders, steppers, rating stars and progress bars in Safari as well as Chromium.
RTL-04 — Keep controls that point to a real direction or a place on screen exactly as they are. — The map stays north-up and is never mirrored, and approach arrows, compass glyphs and pan controls keep their geographic sense.
RTL-05 — Do not mirror photos, illustrations, logos, universal marks such as the checkmark, or icons of everyday objects. — Photos, maps, imagery, the logo, checkmarks and clock or camera glyphs never get transform scaleX(-1); make a new version of an image only if its content is bound to reading direction.

## Consider

RTL-06 — Align short text with the interface direction, but align a paragraph by the language it is written in. — Use text-align start for labels, and put dir="auto" (or unicode-bidi plaintext) on user-written notes and descriptions so each one aligns to its own script.
RTL-07 — Keep every item in a list on the same alignment, even when an item is in another script. — List rows inherit the page direction for alignment while the text inside each one keeps its own direction with a bdi element or dir="auto".
RTL-08 — Mirror icons that stand for text or for forward and backward movement, and leave the rest alone. — Mark directional SVGs with a class and flip only those with :dir(rtl) .icon-directional or [dir="rtl"] .icon-directional using transform scaleX(-1) (:dir() needs Safari 16.4 or later); keep badges, slashes and tools that imply handedness unflipped where flipping would look wrong.
RTL-09 — Reverse the order of images or cards whose sequence carries meaning, such as a timeline. — Lay such rows out with flexbox or grid, which reverse under dir="rtl" without extra CSS; do not use row-reverse or absolute left positions to fake the order.
RTL-10 — Enlarge Arabic or Hebrew text slightly when it sits beside capitalised Latin text. — Add about 2 CSS px (0.125rem) to :lang(ar) and :lang(he) text in buttons and titles next to uppercase Latin.

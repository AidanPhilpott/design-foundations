<!-- generated from rules/*.yaml by `design-foundations build` — do not edit -->

# Right To Left rules

Our own wording. Rules marked HIG paraphrase the Apple Human Interface Guidelines (https://developer.apple.com/design/human-interface-guidelines/right-to-left);
WCAG, SwiftUI-defaults and house rules come from those sources or from this project.

## RTL-01 (should)

Build layouts on leading and trailing sides rather than left and right, so the whole interface can mirror for right-to-left languages.

- Why: Standard components flip automatically, and layouts written in terms of reading direction then need little extra work.
- Web: Set dir on the html element and use logical CSS (margin-inline-start, padding-inline-end, inset-inline-start, border-inline-start, text-align start), flexbox and grid, which follow dir; SwiftUI uses leading and trailing.
- Platforms: web, swift
- Source: [HIG › Right To Left › Text alignment](https://developer.apple.com/design/human-interface-guidelines/right-to-left)

## RTL-02 (should)

Never reverse the digits within a number such as a grade, phone number or distance.

- Why: A number reads the same in every language, and reordering its digits changes its value.
- Web: Wrap numbers and codes embedded in mixed-direction text in a bdi element or dir="ltr" so the bidi algorithm keeps them intact, and format with Intl.NumberFormat so the locale picks Western or Eastern Arabic digits.
- Platforms: web, swift
- Source: [HIG › Right To Left › Numbers and characters](https://developer.apple.com/design/human-interface-guidelines/right-to-left)

## RTL-03 (should)

Mirror navigation and controls that show progress or order, and reverse any numbered sequence along with them.

- Why: Forward means the reading direction, so a back button or slider that keeps its left-to-right orientation reads backwards.
- Web: Back chevrons point right and next arrows point left under dir="rtl"; native range inputs follow dir, but check custom sliders, steppers, rating stars and progress bars in Safari as well as Chromium.
- Platforms: web, swift
- Source: [HIG › Right To Left › Controls](https://developer.apple.com/design/human-interface-guidelines/right-to-left)

## RTL-04 (should)

Keep controls that point to a real direction or a place on screen exactly as they are.

- Why: A compass arrow or an east marker means the same direction in every language.
- Web: The map stays north-up and is never mirrored, and approach arrows, compass glyphs and pan controls keep their geographic sense.
- Platforms: web, swift
- Source: [HIG › Right To Left › Controls](https://developer.apple.com/design/human-interface-guidelines/right-to-left)

## RTL-05 (should)

Do not mirror photos, illustrations, logos, universal marks such as the checkmark, or icons of everyday objects.

- Why: Flipping can change what an image means, misrepresent real places, or break trademark and copyright rules.
- Web: Photos, maps, imagery, the logo, checkmarks and clock or camera glyphs never get transform scaleX(-1); make a new version of an image only if its content is bound to reading direction.
- Platforms: web, swift
- Source: [HIG › Right To Left › Images](https://developer.apple.com/design/human-interface-guidelines/right-to-left)

## RTL-06 (consider)

Align short text with the interface direction, but align a paragraph by the language it is written in.

- Why: A paragraph aligned against its own script is hard to read because the start of each line is hard to find.
- Web: Use text-align start for labels, and put dir="auto" (or unicode-bidi plaintext) on user-written notes and descriptions so each one aligns to its own script.
- Platforms: web, swift
- Source: [HIG › Right To Left › Text alignment](https://developer.apple.com/design/human-interface-guidelines/right-to-left)

## RTL-07 (consider)

Keep every item in a list on the same alignment, even when an item is in another script.

- Why: A ragged mix of alignments makes a list slow to scan.
- Web: List rows inherit the page direction for alignment while the text inside each one keeps its own direction with a bdi element or dir="auto".
- Platforms: web, swift
- Source: [HIG › Right To Left › Text alignment](https://developer.apple.com/design/human-interface-guidelines/right-to-left)

## RTL-08 (consider)

Mirror icons that stand for text or for forward and backward movement, and leave the rest alone.

- Why: Lines of text and motion read in the reading direction, while most other glyphs have no direction.
- Web: Mark directional SVGs with a class and flip only those with :dir(rtl) .icon-directional or [dir="rtl"] .icon-directional using transform scaleX(-1) (:dir() needs Safari 16.4 or later); keep badges, slashes and tools that imply handedness unflipped where flipping would look wrong.
- Platforms: web, swift
- Source: [HIG › Right To Left › Interface icons](https://developer.apple.com/design/human-interface-guidelines/right-to-left)

## RTL-09 (consider)

Reverse the order of images or cards whose sequence carries meaning, such as a timeline.

- Why: Chronological or ranked order runs in the reading direction.
- Web: Lay such rows out with flexbox or grid, which reverse under dir="rtl" without extra CSS; do not use row-reverse or absolute left positions to fake the order.
- Platforms: web, swift
- Source: [HIG › Right To Left › Images](https://developer.apple.com/design/human-interface-guidelines/right-to-left)

## RTL-10 (consider)

Enlarge Arabic or Hebrew text slightly when it sits beside capitalised Latin text.

- Why: These scripts have no capital letters and look smaller than uppercase Latin of the same size.
- Web: Add about 2 CSS px (0.125rem) to :lang(ar) and :lang(he) text in buttons and titles next to uppercase Latin.
- Platforms: web, swift
- Source: [HIG › Right To Left › Controls](https://developer.apple.com/design/human-interface-guidelines/right-to-left)

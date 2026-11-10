<!-- generated from rules/*.yaml by `design-foundations build` — do not edit -->

# Writing rules

Our own wording. Rules marked HIG paraphrase the Apple Human Interface Guidelines (https://developer.apple.com/design/human-interface-guidelines/writing);
WCAG, SwiftUI-defaults and house rules come from those sources or from this project.

## WRT-01 (should)

Say things plainly and briefly, removing any word that does not earn its place.

- Why: Short, clear copy is read faster and misread less, especially on a phone outdoors.
- Web: Prefer Saved to Your item has been successfully saved; read new strings aloud before shipping them.
- Platforms: web, swift
- Source: [HIG › Writing › Getting started](https://developer.apple.com/design/human-interface-guidelines/writing)

## WRT-02 (should)

Write error messages that sit beside the problem and tell people exactly how to fix it.

- Why: A message far from its cause, or one that only says something failed, leaves people guessing.
- Web: Show field errors under the field and link them with aria-describedby; write Enter a grade from V0 to V17 rather than Invalid grade.
- Platforms: web, swift
- Source: [HIG › Writing › Best practices](https://developer.apple.com/design/human-interface-guidelines/writing)

## WRT-03 (should)

Keep error copy calm and blame-free, with no cute interjections and no bare technical verdicts.

- Why: Errors are already frustrating, and jokes or robotic phrasing make them feel worse.
- Web: No Oops or Uh-oh, no raw status codes or exception text in the UI; explain what happened in plain terms and keep technical detail for the issue report.
- Platforms: web, swift
- Source: [HIG › Writing › Best practices](https://developer.apple.com/design/human-interface-guidelines/writing)

## WRT-04 (should)

Prevent errors before writing messages for them, and redesign any step where many people go wrong.

- Why: The best error message is the one nobody needs to see.
- Web: Use input types, pickers and sensible defaults instead of free text where possible; if issue reports keep naming one error, fix the flow rather than the wording.
- Platforms: web, swift
- Source: [HIG › Writing › Best practices](https://developer.apple.com/design/human-interface-guidelines/writing)

## WRT-05 (should)

Label buttons and links with a verb for what they do, and favour clarity over cleverness.

- Why: People act on labels, and a playful phrase hides what will happen when they tap.
- Web: Save to list, Log send and Report an issue, not Let's go or Sure.
- Platforms: web, swift
- Source: [HIG › Writing › Best practices](https://developer.apple.com/design/human-interface-guidelines/writing)

## WRT-06 (should)

Make link text describe its destination on its own, never a bare click here.

- Why: Screen reader users often move through a page link by link, out of context.
- Web: Write Open the weather forecast or View approach details as the link text itself.
- Platforms: web, swift
- Source: [HIG › Writing › Best practices](https://developer.apple.com/design/human-interface-guidelines/writing)

## WRT-07 (should)

Decide on the app's voice and keep a short list of preferred terms, using the same word for the same thing everywhere.

- Why: Consistent vocabulary makes the app feel coherent and stops people wondering whether two words mean two things.
- Web: Keep a glossary in each project's docs (for example item, collection and area in a map app; In, Watch and Out for a status signal) and use it in code strings too.
- Platforms: web, swift
- Source: [HIG › Writing › Getting started](https://developer.apple.com/design/human-interface-guidelines/writing)

## WRT-08 (should)

Adapt the tone to the moment, straightforward for problems and safety and lighter for successes.

- Why: The same voice can reassure or celebrate, but a cheerful tone during a failure or a hazard feels careless.
- Web: Safety and conditions warnings stay neutral and direct; a first completed goal may get a light touch.
- Platforms: web, swift
- Source: [HIG › Writing › Getting started](https://developer.apple.com/design/human-interface-guidelines/writing)

## WRT-09 (should)

Write in simple, inclusive language that anyone can follow and that translates well, without in-house jargon or gendered terms.

- Why: Plain words reach more people, including those using translation or a screen reader.
- Web: Domain words the user knows (sit start, crimpy, multipitch) are fine; internal ones (objective id, pin, payload) are not; say they or you instead of he or she.
- Platforms: web, swift
- Source: [HIG › Writing › Getting started](https://developer.apple.com/design/human-interface-guidelines/writing)

## WRT-10 (should)

Avoid we in interface copy, and use my or your only where needed, sticking to one perspective.

- Why: It is unclear who we refers to, and needless possessives make labels longer.
- Web: Write Unable to load lists, not We couldn't load your lists; name a tab Lists rather than My Lists.
- Platforms: web, swift
- Source: [HIG › Writing › Best practices](https://developer.apple.com/design/human-interface-guidelines/writing)

## WRT-11 (consider)

Choose one capitalisation style per kind of element and apply it everywhere.

- Why: Mixed casing looks careless and blurs the voice.
- Web: Record the choice in the project glossary (for example sentence case for buttons, headings and alerts) and do not mix it with CSS text-transform on some elements only.
- Platforms: web, swift
- Source: [HIG › Writing › Best practices](https://developer.apple.com/design/human-interface-guidelines/writing)

## WRT-12 (should)

In multi-step flows, label the step buttons consistently and make the end of the flow unmistakable.

- Why: Predictable labels tell people where they are and when they are finished.
- Web: Start with Get started, move on with Next (or a label naming the next step) every time, and close with Done.
- Platforms: web, swift
- Source: [HIG › Writing › Best practices](https://developer.apple.com/design/human-interface-guidelines/writing)

## WRT-13 (should)

Use interaction verbs that suit the device, or neutral ones when the same copy serves touch and pointer.

- Why: Telling a phone user to click, or a desktop user to tap, reads as careless.
- Web: The PWA runs on phones and desktops, so prefer select, choose or open; if a hint must name a gesture, switch the word with the pointer coarse or fine media feature.
- Platforms: web, swift
- Source: [HIG › Writing › Best practices](https://developer.apple.com/design/human-interface-guidelines/writing)

## WRT-14 (should)

Give every empty screen a short explanation of what belongs there and a button or link to take the next step.

- Why: A blank view with no guidance looks broken, and an action turns it into a starting point.
- Web: An empty list says how to add items and offers a Browse map button; keep essential information out of empty states, as they vanish once content exists.
- Platforms: web, swift
- Source: [HIG › Writing › Best practices](https://developer.apple.com/design/human-interface-guidelines/writing)

## WRT-15 (should)

Name settings plainly and, when a name is not enough, say what happens when the setting is on.

- Why: People find settings faster by their effect, and can infer the off state on their own.
- Web: A toggle labelled Offline maps with the note Downloads map tiles for saved areas, rather than an unexplained Cache.
- Platforms: web, swift
- Source: [HIG › Writing › Best practices](https://developer.apple.com/design/human-interface-guidelines/writing)

## WRT-16 (should)

When pointing someone to a setting, take them straight there instead of describing the path.

- Why: Step-by-step directions are easy to lose and go stale when menus change.
- Web: In-app settings get a button that opens the right sheet or anchor; for browser or OS permissions that a page cannot link to, give the shortest accurate path and name the setting exactly.
- Platforms: web, swift
- Source: [HIG › Writing › Best practices](https://developer.apple.com/design/human-interface-guidelines/writing)

## WRT-17 (should)

Label every text field visibly and show the expected format with an example or hint, phrasing any correction as an instruction.

- Why: A hint up front prevents mistakes, and a positive instruction is easier to follow than a list of rules broken.
- Web: Always pair inputs with a label element; placeholder text only shows an example such as name@example.com, never replaces the label; errors read Use letters only rather than No numbers allowed.
- Platforms: web, swift
- Source: [HIG › Writing › Best practices](https://developer.apple.com/design/human-interface-guidelines/writing)

## WRT-18 (should)

Lead each screen with what matters most, and split unrelated ideas into separate steps or screens.

- Why: People skim, and one idea per view is easier to take in.
- Web: Lead a conditions card with the signal and the reason, then details; keep onboarding to one message per screen.
- Platforms: web, swift
- Source: [HIG › Writing › Best practices](https://developer.apple.com/design/human-interface-guidelines/writing)

## WRT-19 (should)

Match how a message is delivered to its urgency, from inline text through banners and dialogs to notifications.

- Why: Interrupting for something minor wears people out, while burying something urgent means it is missed.
- Web: Inline text for field help, a dismissible banner for sync status, a dialog only for a decision that cannot wait, and push notifications only for changes the person asked to hear about, such as a tracked status changing to In.
- Platforms: web, swift
- Source: [HIG › Writing › Best practices](https://developer.apple.com/design/human-interface-guidelines/writing)

<!-- generated from rules/*.yaml and the base tokens by `design-foundations build` — do not edit -->

# Writing

Each line: `ID — rule — what to do on the web`. Details and sources: docs/rules/writing.md.

## Should

WRT-01 — Say things plainly and briefly, removing any word that does not earn its place. — Prefer Saved to Your item has been successfully saved; read new strings aloud before shipping them.
WRT-02 — Write error messages that sit beside the problem and tell people exactly how to fix it. — Show field errors under the field and link them with aria-describedby; write Enter a grade from V0 to V17 rather than Invalid grade.
WRT-03 — Keep error copy calm and blame-free, with no cute interjections and no bare technical verdicts. — No Oops or Uh-oh, no raw status codes or exception text in the UI; explain what happened in plain terms and keep technical detail for the issue report.
WRT-04 — Prevent errors before writing messages for them, and redesign any step where many people go wrong. — Use input types, pickers and sensible defaults instead of free text where possible; if issue reports keep naming one error, fix the flow rather than the wording.
WRT-05 — Label buttons and links with a verb for what they do, and favour clarity over cleverness. — Save to list, Log send and Report an issue, not Let's go or Sure.
WRT-06 — Make link text describe its destination on its own, never a bare click here. — Write Open the weather forecast or View approach details as the link text itself.
WRT-07 — Decide on the app's voice and keep a short list of preferred terms, using the same word for the same thing everywhere. — Keep a glossary in each project's docs (for example item, collection and area in a map app; In, Watch and Out for a status signal) and use it in code strings too.
WRT-08 — Adapt the tone to the moment, straightforward for problems and safety and lighter for successes. — Safety and conditions warnings stay neutral and direct; a first completed goal may get a light touch.
WRT-09 — Write in simple, inclusive language that anyone can follow and that translates well, without in-house jargon or gendered terms. — Domain words the user knows (sit start, crimpy, multipitch) are fine; internal ones (objective id, pin, payload) are not; say they or you instead of he or she.
WRT-10 — Avoid we in interface copy, and use my or your only where needed, sticking to one perspective. — Write Unable to load lists, not We couldn't load your lists; name a tab Lists rather than My Lists.
WRT-12 — In multi-step flows, label the step buttons consistently and make the end of the flow unmistakable. — Start with Get started, move on with Next (or a label naming the next step) every time, and close with Done.
WRT-13 — Use interaction verbs that suit the device, or neutral ones when the same copy serves touch and pointer. — The PWA runs on phones and desktops, so prefer select, choose or open; if a hint must name a gesture, switch the word with the pointer coarse or fine media feature.
WRT-14 — Give every empty screen a short explanation of what belongs there and a button or link to take the next step. — An empty list says how to add items and offers a Browse map button; keep essential information out of empty states, as they vanish once content exists.
WRT-15 — Name settings plainly and, when a name is not enough, say what happens when the setting is on. — A toggle labelled Offline maps with the note Downloads map tiles for saved areas, rather than an unexplained Cache.
WRT-16 — When pointing someone to a setting, take them straight there instead of describing the path. — In-app settings get a button that opens the right sheet or anchor; for browser or OS permissions that a page cannot link to, give the shortest accurate path and name the setting exactly.
WRT-17 — Label every text field visibly and show the expected format with an example or hint, phrasing any correction as an instruction. — Always pair inputs with a label element; placeholder text only shows an example such as name@example.com, never replaces the label; errors read Use letters only rather than No numbers allowed.
WRT-18 — Lead each screen with what matters most, and split unrelated ideas into separate steps or screens. — Lead a conditions card with the signal and the reason, then details; keep onboarding to one message per screen.
WRT-19 — Match how a message is delivered to its urgency, from inline text through banners and dialogs to notifications. — Inline text for field help, a dismissible banner for sync status, a dialog only for a decision that cannot wait, and push notifications only for changes the person asked to hear about, such as a tracked status changing to In.

## Consider

WRT-11 — Choose one capitalisation style per kind of element and apply it everywhere. — Record the choice in the project glossary (for example sentence case for buttons, headings and alerts) and do not mix it with CSS text-transform on some elements only.

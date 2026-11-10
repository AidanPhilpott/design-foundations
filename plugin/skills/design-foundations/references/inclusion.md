<!-- generated from rules/*.yaml and the base tokens by `design-foundations build` — do not edit -->

# Inclusion

Each line: `ID — rule — what to do on the web`. Details and sources: docs/rules/inclusion.md.

## Must

INC-01 — Declare the language of every page, and of any passage written in a different language. — lang="en" on the html element of every entry page, and a lang attribute on quoted text or names in another language; in Next.js write it on the html element in app/layout.tsx.

## Should

INC-02 — Format dates, times, numbers and units according to the person's language and region instead of hard-coding one style. — Use Intl.DateTimeFormat, Intl.NumberFormat and Intl.RelativeTimeFormat with the browser locale, write ISO dates in data, and let people choose metric or imperial where distances and temperatures appear; SwiftUI uses FormatStyle.
INC-03 — Leave out gender wherever it is not needed, using plural or neutral nouns and they in place of he or she. — Write Climbers in this list can add notes, not Each climber can add his or her notes.
INC-04 — Ask for gender only when a feature truly requires it, and then offer inclusive choices and a place to give pronouns. — Neither app needs gender; if a form ever does, offer woman, man, non-binary, self-describe and prefer not to say, and make the field optional.
INC-05 — Show a generic person as a neutral figure, and let people choose how their own avatar looks. — Default avatars use initials or a neutral outline, with an option to upload or pick a different one.
INC-06 — Do not build features or copy on narrow assumptions about people's lives, bodies, families or means. — Do not assume everyone drives to the crag, owns a rack, climbs with a partner or climbs hard; offer transit or walking details where known, and avoid security questions about cars, schools or family.
INC-08 — Explain specialist terms the first time they appear, or use plain words instead. — Climbing terms such as beta, highball or sit start get a short tooltip, legend or glossary entry, and weather terms such as freezing level get a one-line explanation.
INC-09 — Swap idioms and slang for literal language, and retire terms with exclusionary histories. — Write allowlist and blocklist rather than whitelist and blacklist, and It is a good day to climb rather than Conditions are on fire.
INC-10 — Avoid a tone that assumes expertise, and drop minimising words such as just, simply, obviously and easy. — Write Tap Save to add it to a list, not Just tap Save; describe grades and conditions neutrally rather than as easy or soft.
INC-11 — Write about disability with respect, putting the person first or using the term a community prefers, and never use a disability as a figure of speech for something bad. — No lame, crippled, blind to or dumb as casual insults in copy, code comments that ship, or error messages.
INC-12 — Make every feature available to people of all abilities instead of deciding in advance who will want it. — Map content also has a list or search view that works with a screen reader, and no feature is marked as unavailable with assistive technology.

## Consider

INC-07 — When imagery shows people, show a real range of ages, bodies, backgrounds and abilities, without stereotyped roles. — Onboarding, empty-state and marketing illustrations avoid showing only young, slim, able-bodied climbers or only men leading.
INC-13 — Use humour sparingly, if at all, and never where people are stressed or facing risk. — No jokes in errors, warnings, avalanche or hazard copy, or anything people will see many times a day; the HIG warns about humour in general, and singling out stressful or risky moments is house advice.
INC-14 — Make the app usable without prior knowledge, with an optional way to learn it that people can skip. — A short, skippable first-run hint or help sheet, always reachable later from a help link, rather than a mandatory tour.

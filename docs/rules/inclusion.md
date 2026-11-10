<!-- generated from rules/*.yaml by `design-foundations build` — do not edit -->

# Inclusion rules

Our own wording. Rules marked HIG paraphrase the Apple Human Interface Guidelines (https://developer.apple.com/design/human-interface-guidelines/inclusion);
WCAG, SwiftUI-defaults and house rules come from those sources or from this project.

## INC-01 (must)

Declare the language of every page, and of any passage written in a different language.

- Why: Screen readers and translation tools choose pronunciation, hyphenation and voice from the declared language.
- Web: lang="en" on the html element of every entry page, and a lang attribute on quoted text or names in another language; in Next.js write it on the html element in app/layout.tsx.
- Platforms: web, swift
- Source: WCAG 2.2 › 3.1.1 Language of Page (see also [HIG › Inclusion](https://developer.apple.com/design/human-interface-guidelines/inclusion))

## INC-02 (should)

Format dates, times, numbers and units according to the person's language and region instead of hard-coding one style.

- Why: People read 03/04 as March or April depending on where they live, and they expect familiar separators and units.
- Web: Use Intl.DateTimeFormat, Intl.NumberFormat and Intl.RelativeTimeFormat with the browser locale, write ISO dates in data, and let people choose metric or imperial where distances and temperatures appear; SwiftUI uses FormatStyle.
- Platforms: web, swift
- Source: [HIG › Inclusion › Languages](https://developer.apple.com/design/human-interface-guidelines/inclusion)

## INC-03 (should)

Leave out gender wherever it is not needed, using plural or neutral nouns and they in place of he or she.

- Why: Gendered copy shuts out people who do not fit it and is harder to translate into languages with gendered grammar.
- Web: Write Members in this list can add notes, not Each member can add his or her notes.
- Platforms: web, swift
- Source: [HIG › Inclusion › Gender identity](https://developer.apple.com/design/human-interface-guidelines/inclusion)

## INC-04 (should)

Ask for gender only when a feature truly requires it, and then offer inclusive choices and a place to give pronouns.

- Why: Most features have no use for gender, and a forced binary choice tells some people they do not belong.
- Web: Neither app needs gender; if a form ever does, offer woman, man, non-binary, self-describe and prefer not to say, and make the field optional.
- Platforms: web, swift
- Source: [HIG › Inclusion › Gender identity](https://developer.apple.com/design/human-interface-guidelines/inclusion)

## INC-05 (should)

Show a generic person as a neutral figure, and let people choose how their own avatar looks.

- Why: A default human should read as anyone, not as a man or a woman.
- Web: Default avatars use initials or a neutral outline, with an option to upload or pick a different one.
- Platforms: web, swift
- Source: [HIG › Inclusion › Gender identity](https://developer.apple.com/design/human-interface-guidelines/inclusion)

## INC-06 (should)

Do not build features or copy on narrow assumptions about people's lives, bodies, families or means.

- Why: Anyone whose situation differs from the assumed one is shut out, and such assumptions are often hard to notice.
- Web: Do not assume everyone drives to the destination, owns the gear, goes with a partner or is highly experienced; offer transit or walking details where known, and avoid security questions about cars, schools or family.
- Platforms: web, swift
- Source: [HIG › Inclusion › Avoiding stereotypes](https://developer.apple.com/design/human-interface-guidelines/inclusion)

## INC-07 (consider)

When imagery shows people, show a real range of ages, bodies, backgrounds and abilities, without stereotyped roles.

- Why: People who see others like themselves feel the app is meant for them too.
- Web: Onboarding, empty-state and marketing illustrations avoid showing only young, slim, able-bodied people or only men in charge.
- Platforms: web, swift
- Source: [HIG › Inclusion › People and settings](https://developer.apple.com/design/human-interface-guidelines/inclusion)

## INC-08 (should)

Explain specialist terms the first time they appear, or use plain words instead.

- Why: Jargon makes newcomers feel the app is not for them, and plain sentences are easier for everyone to read and translate.
- Web: Trade terms such as latency, provisioning or idempotent get a short tooltip, legend or glossary entry, and weather terms such as freezing level get a one-line explanation.
- Platforms: web, swift
- Source: [HIG › Inclusion › Welcoming language](https://developer.apple.com/design/human-interface-guidelines/inclusion)

## INC-09 (should)

Swap idioms and slang for literal language, and retire terms with exclusionary histories.

- Why: Figures of speech rarely translate, and some carry hurtful meanings their writers never intended.
- Web: Write allowlist and blocklist rather than whitelist and blacklist, and It is a good day to go out rather than Conditions are on fire.
- Platforms: web, swift
- Source: [HIG › Inclusion › Welcoming language](https://developer.apple.com/design/human-interface-guidelines/inclusion)

## INC-10 (should)

Avoid a tone that assumes expertise, and drop minimising words such as just, simply, obviously and easy.

- Why: Copy that implies a task is trivial makes anyone who finds it hard feel unwelcome.
- Web: Write Tap Save to add it to a list, not Just tap Save; describe grades and conditions neutrally rather than as easy or soft.
- Platforms: web, swift
- Source: [HIG › Inclusion › Welcoming language](https://developer.apple.com/design/human-interface-guidelines/inclusion)

## INC-11 (should)

Write about disability with respect, putting the person first or using the term a community prefers, and never use a disability as a figure of speech for something bad.

- Why: Language that treats disability as a flaw excludes and hurts the people it describes.
- Web: No lame, crippled, blind to or dumb as casual insults in copy, code comments that ship, or error messages.
- Platforms: web, swift
- Source: [HIG › Inclusion › Accessibility](https://developer.apple.com/design/human-interface-guidelines/inclusion)

## INC-12 (should)

Make every feature available to people of all abilities instead of deciding in advance who will want it.

- Why: Assuming that a disability rules out an interest locks people out of things they would enjoy.
- Web: Map content also has a list or search view that works with a screen reader, and no feature is marked as unavailable with assistive technology.
- Platforms: web, swift
- Source: [HIG › Inclusion › Accessibility](https://developer.apple.com/design/human-interface-guidelines/inclusion)

## INC-13 (consider)

Use humour sparingly, if at all, and never where people are stressed or facing risk.

- Why: Jokes are understood differently across cultures, wear thin on repetition and can sound dismissive.
- Web: No jokes in errors, warnings, avalanche or hazard copy, or anything people will see many times a day; the HIG warns about humour in general, and singling out stressful or risky moments is house advice.
- Platforms: web, swift
- Source: [HIG › Inclusion › Welcoming language](https://developer.apple.com/design/human-interface-guidelines/inclusion)

## INC-14 (consider)

Make the app usable without prior knowledge, with an optional way to learn it that people can skip.

- Why: Newcomers need a gentle path in, while returning people want to get straight to the content.
- Web: A short, skippable first-run hint or help sheet, always reachable later from a help link, rather than a mandatory tour.
- Platforms: web, swift
- Source: [HIG › Inclusion › Being approachable](https://developer.apple.com/design/human-interface-guidelines/inclusion)

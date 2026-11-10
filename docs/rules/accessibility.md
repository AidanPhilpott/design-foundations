<!-- generated from rules/*.yaml by `design-foundations build` — do not edit -->

# Accessibility rules

Our own wording. Rules marked HIG paraphrase the Apple Human Interface Guidelines (https://developer.apple.com/design/human-interface-guidelines/accessibility);
WCAG, SwiftUI-defaults and house rules come from those sources or from this project.

## ACC-01 (must)

Give every control, icon button and meaningful image a short spoken name, and hide purely decorative graphics from assistive technology.

- Why: Screen reader and Voice Control users can only find, hear and trigger what has a name.
- Web: Icon-only buttons get aria-label, informative img and map markers get alt or title text, form inputs get a label element, and decorative SVGs carry aria-hidden="true".
- Platforms: web, swift
- Source: [HIG › Accessibility › Vision](https://developer.apple.com/design/human-interface-guidelines/accessibility)

## ACC-02 (must)

Let all text grow to at least twice its default size without being cut off, overlapping or forcing sideways scrolling.

- Why: Many people read only with enlarged text, and fixed sizes lock them out of the app.
- Web: Set font sizes in rem through the type tokens (no px font sizes), check the layout at 200% browser zoom, and offer .df-dynamic-type so the iOS text size setting reaches Safari and the installed PWA.
- Platforms: web, swift
- Source: [HIG › Accessibility › Vision](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- Check: `text-floor`
- Tokens: `type.body`, `type.floor.min`, `type.floor.body`

## ACC-03 (must)

Status colours, icons, input borders, focus rings and other meaningful non-text marks need at least 3:1 contrast against what surrounds them.

- Why: A badge or outline that fades into the background carries no information for people with low vision.
- Web: The contrast check holds every status.* role to 3:1 on bg.primary in all four modes; give custom icon, border and ring colours the same margin.
- Platforms: web, swift
- Source: WCAG 2.2 › 1.4.11 Non-text Contrast (see also [HIG › Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility))
- Check: `contrast`

## ACC-04 (must)

Make every tap or click target at least 44 by 44 points, and never smaller than 28 by 28 even in dense toolbars.

- Why: Small targets cause missed and wrong taps, most of all for people with tremors or limited dexterity.
- Web: Buttons, links in lists, chips and map controls reach min-width and min-height of the default target token (padding counts toward it); the minimum token is a floor only for crowded rows.
- Platforms: web, swift
- Source: [HIG › Accessibility › Mobility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- Check: `targets`
- Tokens: `a11y.target.default`, `a11y.target.min`

## ACC-05 (must)

Show a clearly visible focus indicator on whatever element currently has keyboard focus.

- Why: Keyboard, switch and Full Keyboard Access users cannot act on something they cannot locate.
- Web: Keep or restyle the outline under :focus-visible (accent colour, 2px, offset); outline none is acceptable only inside :focus:not(:focus-visible) or alongside a :focus-visible replacement.
- Platforms: web, swift
- Source: WCAG 2.2 › 2.4.7 Focus Visible (see also [HIG › Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility))
- Check: `focus`

## ACC-06 (must)

Every feature must be usable from a keyboard alone, in a sensible order, without overriding the shortcuts the system or browser already defines.

- Why: People who cannot use touch or a pointer depend on keyboards, switches and similar hardware.
- Web: Use real button and a elements, keep the DOM order equal to the visual order, close sheets and dialogs on Escape and return focus to the opener, enable Leaflet keyboard panning, and leave Cmd/Ctrl browser shortcuts alone.
- Platforms: web, swift
- Source: [HIG › Accessibility › Speech](https://developer.apple.com/design/human-interface-guidelines/accessibility)

## ACC-07 (must)

Back every gesture with an on-screen alternative that does the same job.

- Why: Swipes, pinches, drags and long presses are hard or impossible for some people and invisible to others.
- Web: A swipe-down sheet also has a close button, pinch-zoom on the map also has zoom buttons, and long-press menus are reachable from a visible more button.
- Platforms: web, swift
- Source: [HIG › Accessibility › Mobility](https://developer.apple.com/design/human-interface-guidelines/accessibility)

## ACC-08 (should)

Keep the gestures for frequent tasks as simple as possible, such as a single tap or a one-finger swipe.

- Why: Multi-finger or precise gestures are tiring to repeat and easy to forget.
- Web: No custom two-finger or timed gestures for everyday actions; saving to a list, logging a send and opening details each take one tap.
- Platforms: web, swift
- Source: [HIG › Accessibility › Mobility](https://developer.apple.com/design/human-interface-guidelines/accessibility)

## ACC-09 (must)

Audio, video and animated images that start on their own must come with controls to pause or stop them.

- Why: Unwanted sound and movement distract, and can drown out a screen reader.
- Web: Avoid autoplay; where it is used, video is muted with visible controls, and animated GIF or WebP content has a pause button and also plays only when prefers-reduced-motion is no-preference.
- Platforms: web, swift
- Source: WCAG 2.2 › 2.2.2 Pause, Stop, Hide (see also [HIG › Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility))

## ACC-10 (should)

Do not make important messages or controls disappear on a timer; let people dismiss them themselves.

- Why: Readers who need more time, and assistive technology users moving through the screen slowly, can miss them entirely.
- Web: Toasts that carry an error or an undo action stay until dismissed (or pause while hovered or focused), and status changes are also announced through an aria-live region.
- Platforms: web, swift
- Source: [HIG › Accessibility › Cognitive](https://developer.apple.com/design/human-interface-guidelines/accessibility)

## ACC-11 (must)

Never deliver information through sound alone; show it on screen as well.

- Why: People who are deaf, hard of hearing or in a loud place, or whose sound is off, would miss it.
- Web: Any chime or alert sound has a matching visible message or badge; vibration through navigator.vibrate is only an extra, as iOS Safari ignores it.
- Platforms: web, swift
- Source: [HIG › Accessibility › Hearing](https://developer.apple.com/design/human-interface-guidelines/accessibility)

## ACC-12 (should)

Provide captions for spoken video and a transcript for longer audio.

- Why: Text alternatives open media to deaf and hard-of-hearing people and to anyone watching muted.
- Web: Add a track element of kind captions to video with speech, and link a text transcript beside podcasts or long clips.
- Platforms: web, swift
- Source: [HIG › Accessibility › Hearing](https://developer.apple.com/design/human-interface-guidelines/accessibility)

## ACC-13 (should)

Make the visible text of a control part of its accessible name, so saying what you see activates it.

- Why: Voice Control users speak the label they read on screen, and a mismatched name does nothing.
- Web: An aria-label begins with the visible label text (a button showing Save is not named Store item), or drop the aria-label and let the visible text name it.
- Platforms: web, swift
- Source: WCAG 2.2 › 2.5.3 Label in Name (see also [HIG › Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility))

## ACC-14 (should)

Prefer familiar, standard controls and interactions over custom ones people must learn.

- Why: Known patterns lower the mental effort for everyone, and standard controls come with assistive support built in.
- Web: Reach for native select, details, dialog, input type and button elements first; a custom widget follows the matching WAI-ARIA Authoring Practices pattern for roles and keys.
- Platforms: web, swift
- Source: [HIG › Accessibility › Cognitive](https://developer.apple.com/design/human-interface-guidelines/accessibility)

## ACC-15 (should)

Ask for confirmation, or offer an undo, before an action that is hard to reverse, such as deleting a list or a log entry.

- Why: A slip of the finger should never cost someone data they cared about.
- Web: Destructive buttons open a confirm dialog naming what will be lost, or the action runs at once and a toast offers Undo until dismissed.
- Platforms: web, swift
- Source: house rule (related: [HIG › Accessibility › Cognitive](https://developer.apple.com/design/human-interface-guidelines/accessibility))

## ACC-16 (should)

Test each release with the screen reader, keyboard-only use and enlarged text, not only with automated tools.

- Why: Automated audits catch only part of the problems people actually meet.
- Web: Walk the main flows with VoiceOver in iOS Safari, with Tab and Enter alone on desktop, and at 200% zoom; run axe or Lighthouse as a first pass and design-foundations check in CI.
- Platforms: web, swift
- Source: [HIG › Accessibility › Mobility](https://developer.apple.com/design/human-interface-guidelines/accessibility)

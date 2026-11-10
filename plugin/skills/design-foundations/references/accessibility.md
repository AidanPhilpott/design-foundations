<!-- generated from rules/*.yaml and the base tokens by `design-foundations build` — do not edit -->

# Accessibility

Each line: `ID — rule — what to do on the web`. Details and sources: docs/rules/accessibility.md.

## Must

ACC-01 — Give every control, icon button and meaningful image a short spoken name, and hide purely decorative graphics from assistive technology. — Icon-only buttons get aria-label, informative img and map markers get alt or title text, form inputs get a label element, and decorative SVGs carry aria-hidden="true".
ACC-02 — Let all text grow to at least twice its default size without being cut off, overlapping or forcing sideways scrolling. — Set font sizes in rem through the type tokens (no px font sizes), check the layout at 200% browser zoom, and offer .df-dynamic-type so the iOS text size setting reaches Safari and the installed PWA.
ACC-03 — Status colours, icons, input borders, focus rings and other meaningful non-text marks need at least 3:1 contrast against what surrounds them. — The contrast check holds every status.* role to 3:1 on bg.primary in all four modes; give custom icon, border and ring colours the same margin.
ACC-04 — Make every tap or click target at least 44 by 44 points, and never smaller than 28 by 28 even in dense toolbars. — Buttons, links in lists, chips and map controls reach min-width and min-height of the default target token (padding counts toward it); the minimum token is a floor only for crowded rows.
ACC-05 — Show a clearly visible focus indicator on whatever element currently has keyboard focus. — Keep or restyle the outline under :focus-visible (accent colour, 2px, offset); outline none is acceptable only inside :focus:not(:focus-visible) or alongside a :focus-visible replacement.
ACC-06 — Every feature must be usable from a keyboard alone, in a sensible order, without overriding the shortcuts the system or browser already defines. — Use real button and a elements, keep the DOM order equal to the visual order, close sheets and dialogs on Escape and return focus to the opener, enable Leaflet keyboard panning, and leave Cmd/Ctrl browser shortcuts alone.
ACC-07 — Back every gesture with an on-screen alternative that does the same job. — A swipe-down sheet also has a close button, pinch-zoom on the map also has zoom buttons, and long-press menus are reachable from a visible more button.
ACC-09 — Audio, video and animated images that start on their own must come with controls to pause or stop them. — Avoid autoplay; where it is used, video is muted with visible controls, and animated GIF or WebP content has a pause button and also plays only when prefers-reduced-motion is no-preference.
ACC-11 — Never deliver information through sound alone; show it on screen as well. — Any chime or alert sound has a matching visible message or badge; vibration through navigator.vibrate is only an extra, as iOS Safari ignores it.

## Should

ACC-08 — Keep the gestures for frequent tasks as simple as possible, such as a single tap or a one-finger swipe. — No custom two-finger or timed gestures for everyday actions; saving to a list, logging a send and opening details each take one tap.
ACC-10 — Do not make important messages or controls disappear on a timer; let people dismiss them themselves. — Toasts that carry an error or an undo action stay until dismissed (or pause while hovered or focused), and status changes are also announced through an aria-live region.
ACC-12 — Provide captions for spoken video and a transcript for longer audio. — Add a track element of kind captions to video with speech, and link a text transcript beside podcasts or long clips.
ACC-13 — Make the visible text of a control part of its accessible name, so saying what you see activates it. — An aria-label begins with the visible label text (a button showing Save is not named Store item), or drop the aria-label and let the visible text name it.
ACC-14 — Prefer familiar, standard controls and interactions over custom ones people must learn. — Reach for native select, details, dialog, input type and button elements first; a custom widget follows the matching WAI-ARIA Authoring Practices pattern for roles and keys.
ACC-15 — Ask for confirmation, or offer an undo, before an action that is hard to reverse, such as deleting a list or a log entry. — Destructive buttons open a confirm dialog naming what will be lost, or the action runs at once and a toast offers Undo until dismissed.
ACC-16 — Test each release with the screen reader, keyboard-only use and enlarged text, not only with automated tools. — Walk the main flows with VoiceOver in iOS Safari, with Tab and Enter alone on desktop, and at 200% zoom; run axe or Lighthouse as a first pass and design-foundations check in CI.

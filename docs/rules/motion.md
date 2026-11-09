<!-- generated from rules/*.yaml by `design-foundations build` — do not edit -->

# motion rules

Paraphrased from the Apple Human Interface Guidelines page for this topic: https://developer.apple.com/design/human-interface-guidelines/motion

## MOT-01 (should)

Animate a change only when the movement tells people something, such as where content came from or what just happened.

- Why: Decorative movement competes with the content and can leave some people distracted or queasy.
- Web: Before adding a CSS transition or keyframe animation, name the state change it explains; drop it if there is none.
- Platforms: web, swift
- Source: [motion](https://developer.apple.com/design/human-interface-guidelines/motion), "Best practices" (via hig)

## MOT-02 (must)

Never rely on animation alone to convey a state change, result or warning; pair it with a lasting visual cue, text, sound or haptic.

- Why: People who turn motion off, or simply look away, still need to get the message.
- Web: A shake on a bad input also shows an error message, and a pulsing badge also has a static label or count.
- Platforms: web, swift
- Source: [motion](https://developer.apple.com/design/human-interface-guidelines/motion), "Best practices" (via hig)

## MOT-03 (should)

Make motion match the gesture that caused it, so a view leaves along the same path it arrived by.

- Why: Movement that contradicts the user's own hand makes the interface feel unpredictable.
- Web: A sheet that rose from the bottom closes downward (and swipes down to close); a pane pushed in from the right pops back out to the right.
- Platforms: web, swift
- Source: [motion](https://developer.apple.com/design/human-interface-guidelines/motion), "Providing feedback" (via hig)
- Tokens: `motion.transition.push`, `motion.transition.pop`, `motion.transition.rise`, `motion.transition.sheet`

## MOT-04 (should)

Keep feedback animations short and tied precisely to the action they confirm.

- Why: A quick, exact response reads instantly and stays out of the way, while a large one slows people down.
- Web: Press, hover and toggle feedback uses the micro duration and the feedback transition, changing colour or a small scale only.
- Platforms: web, swift
- Source: [motion](https://developer.apple.com/design/human-interface-guidelines/motion), "Providing feedback" (via hig)
- Tokens: `motion.duration.micro`, `motion.transition.feedback`

## MOT-05 (must)

When Reduce Motion is on, swap movement for fades, settle springs without bounce and skip depth or blur animation, yet still show every state change.

- Why: Sliding, zooming and bouncing can trigger dizziness or nausea, but feedback must not vanish along with them.
- Web: Under prefers-reduced-motion use each transition's reduced variant (opacity at the short duration) via tokens.css or motion.js, never a bare duration that ignores the setting.
- Platforms: web, swift
- Source: [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility), "Cognitive" (via hig)
- Check: `reduced-motion`
- Tokens: `motion.transition.push`, `motion.transition.pop`, `motion.transition.rise`, `motion.transition.sheet`, `motion.transition.feedback`

## MOT-06 (should)

Leave controls people use over and over without custom animation, or keep it barely noticeable.

- Why: An effect that is charming once becomes a delay when it plays on every tap.
- Web: Filter chips, list taps and map pans respond immediately; reserve transitions for less frequent changes such as opening a panel.
- Platforms: web, swift
- Source: [motion](https://developer.apple.com/design/human-interface-guidelines/motion), "Providing feedback" (via hig)

## MOT-07 (should)

Never block input until a transition ends; acting during one interrupts or redirects it.

- Why: Forced waits add up quickly, especially for transitions people see many times a day.
- Web: Do not disable buttons or block pointer events for the length of a transition; a second tap reverses or skips it, and Web Animations can be cancelled.
- Platforms: web, swift
- Source: [motion](https://developer.apple.com/design/human-interface-guidelines/motion), "Providing feedback" (via hig)

## MOT-08 (must)

Avoid endless or slowly repeating animation; any loop must stop on its own or on request, and must be static under Reduce Motion.

- Why: Sustained movement, especially a gentle swing near 0.2 Hz, is a known trigger for motion discomfort.
- Web: No animation-iteration-count infinite without a reduced-motion override; pulses and shimmers use the loop transition, which is still when motion is reduced.
- Platforms: web, swift
- Source: [motion](https://developer.apple.com/design/human-interface-guidelines/motion), "visionOS" (via hig)
- Check: `reduced-motion`
- Tokens: `motion.transition.loop`

## MOT-09 (must)

Map flights, zooms and smooth scrolling honour Reduce Motion by jumping straight to the destination.

- Why: Panning or zooming the whole view is the kind of large-field movement most likely to unsettle people.
- Web: Use setView instead of flyTo and scroll behavior auto instead of smooth when prefers-reduced-motion is set; otherwise time camera moves with the camera tokens.
- Platforms: web, swift
- Source: [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility), "Cognitive" (via hig)
- Check: `reduced-motion`
- Tokens: `motion.transition.camera`, `motion.camera.near`, `motion.camera.far`

## MOT-10 (should)

Respond to Reduce Motion by reducing each animation individually, not by switching all animation off at once.

- Why: A global off switch also removes the fades and state feedback that the setting is meant to keep.
- Web: No blanket override such as * { animation: none !important } inside prefers-reduced-motion; rely on the reduced token blocks and motion.js instead.
- Platforms: web, swift
- Source: [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility), "Cognitive" (via hig)
- Check: `reduced-motion`

## MOT-11 (must)

Take every duration, easing curve and spring from the motion tokens rather than writing raw values.

- Why: Shared timing keeps the apps feeling consistent and lets Reduce Motion swap values in one place.
- Web: Write var(--df-motion-...) or motion.js transitions in CSS and JS instead of literals like 0.3s or ease-in-out; springs follow the SwiftUI smooth, snappy and bouncy presets.
- Platforms: web, swift
- Source: [motion](https://developer.apple.com/design/human-interface-guidelines/motion), "Best practices" (via swiftui-defaults)
- Check: `raw-values`
- Tokens: `motion.duration.micro`, `motion.duration.short`, `motion.duration.medium`, `motion.duration.long`, `motion.ease.standard`, `motion.ease.enter`, `motion.ease.exit`, `motion.spring.smooth`, `motion.spring.snappy`, `motion.spring.bouncy`

## MOT-12 (consider)

Let departing elements leave a little faster than they arrived, accelerating out where arrivals slow to a stop.

- Why: People need to follow what is coming in, but anything going away should clear the stage quickly.
- Web: Pair the enter easing with the exit easing on the way out, at roughly 0.7 of the enter duration (for example medium in, short out).
- Platforms: web, swift
- Source: [motion](https://developer.apple.com/design/human-interface-guidelines/motion), "Providing feedback" (via hig)
- Tokens: `motion.ease.enter`, `motion.ease.exit`, `motion.duration.medium`, `motion.duration.short`

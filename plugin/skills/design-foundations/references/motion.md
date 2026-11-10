<!-- generated from rules/*.yaml and the base tokens by `design-foundations build` — do not edit -->

# Motion

Each line: `ID — rule — what to do on the web`. Details and sources: docs/rules/motion.md.

## Must

MOT-02 — Never rely on animation alone to convey a state change, result or warning; pair it with a lasting visual cue, text, sound or haptic. — A shake on a bad input also shows an error message, and a pulsing badge also has a static label or count.
MOT-05 — When Reduce Motion is on, swap movement for fades, settle springs without bounce and skip depth or blur animation, yet still show every state change. — Under prefers-reduced-motion use each named transition's own reduced variant from tokens.css or motion.js (push, pop and rise fade, sheet loses its bounce, feedback keeps colour only), never a bare duration that ignores the setting.
MOT-08 — Avoid endless or slowly repeating animation; any loop must stop on its own or on request, and must be static under Reduce Motion. — No animation-iteration-count infinite without a reduced-motion override; pulses and shimmers use the loop transition, which is still when motion is reduced.
MOT-09 — Map flights, zooms and smooth scrolling honour Reduce Motion by jumping straight to the destination. — Move Leaflet (or an equivalent map) through motion.js camera(), which flies with the camera tokens and calls setView without animation under prefers-reduced-motion; scroll with behavior auto rather than smooth when motion is reduced.
MOT-11 — Take every duration, easing curve and spring from the motion tokens rather than writing raw values. — Write var(--df-motion-...) or motion.js transitions in CSS and JS instead of literals like 0.3s or ease-in-out; springs follow the SwiftUI smooth, snappy and bouncy presets.
MOT-13 — Nothing on screen may flash more than three times in any one second. — Blinking cursors, alert pulses and loading effects stay at three cycles per second or slower, and large bright areas never strobe.

## Should

MOT-01 — Animate a change only when the movement tells people something, such as where content came from or what just happened. — Before adding a CSS transition or keyframe animation, name the state change it explains; drop it if there is none.
MOT-03 — Make motion match the gesture that caused it, so a view leaves along the same path it arrived by. — A sheet that rose from the bottom closes downward (and swipes down to close); a pane pushed in from the right pops back out to the right.
MOT-04 — Keep feedback animations short and tied precisely to the action they confirm. — Press, hover and toggle feedback uses the micro duration and the feedback transition, changing colour or a small scale only.
MOT-06 — Leave controls people use over and over without custom animation, or keep it barely noticeable. — Filter chips, list taps and map pans respond immediately; reserve transitions for less frequent changes such as opening a panel.
MOT-07 — Never block input until a transition ends; acting during one interrupts or redirects it. — Do not disable buttons or block pointer events for the length of a transition; a second tap reverses or skips it, and Web Animations can be cancelled.
MOT-10 — Respond to Reduce Motion by reducing each animation individually, not by switching all animation off at once. — No blanket override such as * { animation: none !important } inside prefers-reduced-motion; rely on the reduced token blocks and motion.js instead.
MOT-14 — Keep parallax and large background or full-screen movement out of the interface, and remove any that remains when Reduce Motion is on. — No scroll-linked parallax, animated full-page backgrounds or auto-panning maps; under prefers-reduced-motion the background stays fixed.

## Consider

MOT-12 — Let departing elements leave a little faster than they arrived, accelerating out where arrivals slow to a stop. — Pair the enter easing with the exit easing on the way out, at roughly 0.7 of the enter duration (for example medium in, short out).

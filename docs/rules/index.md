<!-- generated from rules/*.yaml by `design-foundations build` — do not edit -->

# Rules index

| ID | Severity | Check | Rule |
|---|---|---|---|
| [MOT-01](motion.md#mot-01-should) | should |  | Animate a change only when the movement tells people something, such as where content came from or what just happened. |
| [MOT-02](motion.md#mot-02-must) | must |  | Never rely on animation alone to convey a state change, result or warning; pair it with a lasting visual cue, text, sound or haptic. |
| [MOT-03](motion.md#mot-03-should) | should |  | Make motion match the gesture that caused it, so a view leaves along the same path it arrived by. |
| [MOT-04](motion.md#mot-04-should) | should |  | Keep feedback animations short and tied precisely to the action they confirm. |
| [MOT-05](motion.md#mot-05-must) | must | `reduced-motion` | When Reduce Motion is on, swap movement for fades, settle springs without bounce and skip depth or blur animation, yet still show every state change. |
| [MOT-06](motion.md#mot-06-should) | should |  | Leave controls people use over and over without custom animation, or keep it barely noticeable. |
| [MOT-07](motion.md#mot-07-should) | should |  | Never block input until a transition ends; acting during one interrupts or redirects it. |
| [MOT-08](motion.md#mot-08-must) | must | `reduced-motion` | Avoid endless or slowly repeating animation; any loop must stop on its own or on request, and must be static under Reduce Motion. |
| [MOT-09](motion.md#mot-09-must) | must | `reduced-motion` | Map flights, zooms and smooth scrolling honour Reduce Motion by jumping straight to the destination. |
| [MOT-10](motion.md#mot-10-should) | should | `reduced-motion` | Respond to Reduce Motion by reducing each animation individually, not by switching all animation off at once. |
| [MOT-11](motion.md#mot-11-must) | must | `raw-values` | Take every duration, easing curve and spring from the motion tokens rather than writing raw values. |
| [MOT-12](motion.md#mot-12-consider) | consider |  | Let departing elements leave a little faster than they arrived, accelerating out where arrivals slow to a stop. |

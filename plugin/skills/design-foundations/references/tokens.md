<!-- generated from rules/*.yaml and the base tokens by `design-foundations build` — do not edit -->

# Tokens cheat-sheet

Use these instead of raw values. `dist/tokens.css` is the source; values below are the default (`:root`) ones. Reduce Motion, reduced transparency and Dynamic Type blocks reassign some of them automatically.

## CSS variables

### --df-a11y-*

```css
--df-a11y-spacing-bare: 24px
--df-a11y-spacing-bezel: 12px
--df-a11y-target-default: 44px
--df-a11y-target-min: 28px
```

### --df-layout-*

```css
--df-layout-breakpoint-regular: 700px
--df-layout-margin-compact: 16px
--df-layout-margin-regular: 20px
```

### --df-material-*

```css
--df-material-regular-blur: 30px
--df-material-regular-opacity: 0.75
--df-material-thick-blur: 40px
--df-material-thick-opacity: 0.85
--df-material-thin-blur: 20px
--df-material-thin-opacity: 0.65
--df-material-ultra-thin-blur: 10px
--df-material-ultra-thin-opacity: 0.55
```

### --df-motion-*

```css
--df-motion-camera-far: 800ms
--df-motion-camera-near: 500ms
--df-motion-duration-instant: 0ms
--df-motion-duration-long: 500ms
--df-motion-duration-medium: 300ms
--df-motion-duration-micro: 100ms
--df-motion-duration-short: 200ms
--df-motion-ease-enter: cubic-bezier(0, 0, 0.2, 1)
--df-motion-ease-exit: cubic-bezier(0.4, 0, 1, 1)
--df-motion-ease-standard: cubic-bezier(0.4, 0, 0.2, 1)
--df-motion-spring-bouncy: linear(0, 0.0307, 0.1081, 0.2132, 0.3313, 0.4517, 0.5666, 0.6712, 0.7624, 0.8393, 0.9017, 0.9505, 0.9871, 1.0131, 1.0304, 1.0405, 1.0452, 1.0458, 1.0436, 1.0395, 1.0344, 1.0289, 1.0234, 1.0183, 1.0137, 1.0097, 1.0064, 1.0037, 1.0017, 1.0001, 0.9991, 0.9984, 0.998, 0.9979, 0.9979, 0.998, 0.9983, 0.9985, 0.9988, 1)
--df-motion-spring-bouncy-duration: 819ms
--df-motion-spring-smooth: linear(0, 0.024, 0.0823, 0.1595, 0.2449, 0.3316, 0.4154, 0.4935, 0.5647, 0.6284, 0.6846, 0.7336, 0.776, 0.8123, 0.8433, 0.8695, 0.8917, 0.9103, 0.9259, 0.9389, 0.9497, 0.9587, 0.9661, 0.9722, 0.9773, 0.9814, 0.9848, 0.9876, 0.9899, 0.9918, 0.9933, 0.9946, 0.9956, 0.9964, 0.9971, 0.9977, 0.9981, 0.9985, 0.9988, 1)
--df-motion-spring-smooth-duration: 735ms
--df-motion-spring-snappy: linear(0, 0.0222, 0.0782, 0.1549, 0.2425, 0.334, 0.4242, 0.5099, 0.5888, 0.6598, 0.7225, 0.7769, 0.8234, 0.8624, 0.8948, 0.9214, 0.9428, 0.9597, 0.973, 0.9832, 0.9909, 0.9965, 1.0005, 1.0031, 1.0049, 1.0058, 1.0062, 1.0063, 1.006, 1.0056, 1.0051, 1.0045, 1.0039, 1.0034, 1.0029, 1.0024, 1.002, 1.0016, 1.0013, 1)
--df-motion-spring-snappy-duration: 697ms
--df-motion-transition-camera-duration: 500ms
--df-motion-transition-camera-easing: cubic-bezier(0.4, 0, 0.2, 1)
--df-motion-transition-camera-properties: camera
--df-motion-transition-feedback-duration: 100ms
--df-motion-transition-feedback-easing: cubic-bezier(0.4, 0, 0.2, 1)
--df-motion-transition-feedback-properties: background-color, color, transform
--df-motion-transition-loop-duration: 500ms
--df-motion-transition-loop-easing: cubic-bezier(0.4, 0, 0.2, 1)
--df-motion-transition-loop-properties: opacity
--df-motion-transition-pop-duration: 300ms
--df-motion-transition-pop-easing: var(--df-motion-spring-smooth)
--df-motion-transition-pop-properties: transform, opacity
--df-motion-transition-pop-distance: 28px
--df-motion-transition-push-duration: 300ms
--df-motion-transition-push-easing: var(--df-motion-spring-smooth)
--df-motion-transition-push-properties: transform, opacity
--df-motion-transition-push-distance: 28px
--df-motion-transition-rise-duration: 300ms
--df-motion-transition-rise-easing: cubic-bezier(0, 0, 0.2, 1)
--df-motion-transition-rise-properties: transform, opacity
--df-motion-transition-rise-distance: 16px
--df-motion-transition-sheet-duration: 500ms
--df-motion-transition-sheet-easing: var(--df-motion-spring-smooth)
--df-motion-transition-sheet-properties: transform
```

### --df-radius-*

```css
--df-radius-full: 9999px
--df-radius-lg: 16px
--df-radius-md: 12px
--df-radius-sm: 8px
--df-radius-xl: 24px
--df-radius-xs: 4px
```

### --df-space-*

```css
--df-space-0: 0px
--df-space-0-5: 2px
--df-space-1: 4px
--df-space-10: 40px
--df-space-12: 48px
--df-space-16: 64px
--df-space-2: 8px
--df-space-3: 12px
--df-space-4: 16px
--df-space-5: 20px
--df-space-6: 24px
--df-space-8: 32px
```

### --df-type-*

```css
--df-type-body-size: 1.0625rem
--df-type-body-leading: 1.375rem
--df-type-body-weight: 400
--df-type-body-weight-em: 600
--df-type-callout-size: 1rem
--df-type-callout-leading: 1.3125rem
--df-type-callout-weight: 400
--df-type-callout-weight-em: 600
--df-type-caption1-size: 0.75rem
--df-type-caption1-leading: 1rem
--df-type-caption1-weight: 400
--df-type-caption1-weight-em: 600
--df-type-caption2-size: 0.6875rem
--df-type-caption2-leading: 0.8125rem
--df-type-caption2-weight: 400
--df-type-caption2-weight-em: 600
--df-type-floor-body: 17px
--df-type-floor-min: 11px
--df-type-font-family-default: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif
--df-type-footnote-size: 0.8125rem
--df-type-footnote-leading: 1.125rem
--df-type-footnote-weight: 400
--df-type-footnote-weight-em: 600
--df-type-headline-size: 1.0625rem
--df-type-headline-leading: 1.375rem
--df-type-headline-weight: 600
--df-type-headline-weight-em: 600
--df-type-large-title-size: 2.125rem
--df-type-large-title-leading: 2.5625rem
--df-type-large-title-weight: 400
--df-type-large-title-weight-em: 700
--df-type-role-body: var(--df-type-role-body-weight) var(--df-type-role-body-size)/var(--df-type-role-body-leading) var(--df-type-font-family-default)
--df-type-role-body-size: 0.9375rem
--df-type-role-body-leading: 1.25rem
--df-type-role-body-weight: 400
--df-type-role-body-tracking: 0em
--df-type-role-body-transform: none
--df-type-role-footnote: var(--df-type-role-footnote-weight) var(--df-type-role-footnote-size)/var(--df-type-role-footnote-leading) var(--df-type-font-family-default)
--df-type-role-footnote-size: 0.8125rem
--df-type-role-footnote-leading: 1.125rem
--df-type-role-footnote-weight: 400
--df-type-role-footnote-tracking: 0em
--df-type-role-footnote-transform: none
--df-type-role-headline: var(--df-type-role-headline-weight) var(--df-type-role-headline-size)/var(--df-type-role-headline-leading) var(--df-type-font-family-default)
--df-type-role-headline-size: 1.0625rem
--df-type-role-headline-leading: 1.375rem
--df-type-role-headline-weight: 600
--df-type-role-headline-tracking: 0em
--df-type-role-headline-transform: none
--df-type-role-label: var(--df-type-role-label-weight) var(--df-type-role-label-size)/var(--df-type-role-label-leading) var(--df-type-font-family-default)
--df-type-role-label-size: 0.75rem
--df-type-role-label-leading: 1rem
--df-type-role-label-weight: 600
--df-type-role-label-tracking: 0.06em
--df-type-role-label-transform: uppercase
--df-type-role-title: var(--df-type-role-title-weight) var(--df-type-role-title-size)/var(--df-type-role-title-leading) var(--df-type-font-family-default)
--df-type-role-title-size: 1.75rem
--df-type-role-title-leading: 2.125rem
--df-type-role-title-weight: 700
--df-type-role-title-tracking: 0em
--df-type-role-title-transform: none
--df-type-subhead-size: 0.9375rem
--df-type-subhead-leading: 1.25rem
--df-type-subhead-weight: 400
--df-type-subhead-weight-em: 600
--df-type-title1-size: 1.75rem
--df-type-title1-leading: 2.125rem
--df-type-title1-weight: 400
--df-type-title1-weight-em: 700
--df-type-title2-size: 1.375rem
--df-type-title2-leading: 1.75rem
--df-type-title2-weight: 400
--df-type-title2-weight-em: 700
--df-type-title3-size: 1.25rem
--df-type-title3-leading: 1.5625rem
--df-type-title3-weight: 400
--df-type-title3-weight-em: 600
```

## Colour roles (project-defined)

Colour values come from the project colour file, emitted as `project.css`. Every role is the variable `--df-color-<role>` with dots written as dashes:

```
--df-color-bg-primary
--df-color-bg-secondary
--df-color-bg-tertiary
--df-color-bg-grouped-primary
--df-color-bg-grouped-secondary
--df-color-bg-grouped-tertiary
--df-color-label-primary
--df-color-label-secondary
--df-color-label-tertiary
--df-color-label-quaternary
--df-color-label-placeholder
--df-color-fill-primary
--df-color-fill-secondary
--df-color-fill-tertiary
--df-color-separator
--df-color-separator-opaque
--df-color-link
--df-color-accent
--df-color-accent-on
--df-color-status-success
--df-color-status-warning
--df-color-status-danger
--df-color-status-info
```

## Tailwind preset (`dist/tailwind-preset.cjs`, Tailwind 3)

Add `presets: [require("./vendor/design-foundations/tailwind-preset.cjs")]`. Every value is a `var(--df-*)` reference. Keys by theme section:

- transitionDuration: `100`, `200`, `300`, `500`, `instant`, `long`, `medium`, `micro`, `short`
- transitionTimingFunction: `enter`, `exit`, `standard`, `spring-bouncy`, `spring-smooth`, `spring-snappy`
- spacing: `0`, `1`, `2`, `3`, `4`, `5`, `6`, `8`, `10`, `12`, `16`, `0.5`
- fontSize: `body`, `callout`, `caption1`, `caption2`, `footnote`, `headline`, `large-title`, `subhead`, `title1`, `title2`, `title3`, `role-body`, `role-footnote`, `role-headline`, `role-label`, `role-title`
- borderRadius: `full`, `lg`, `md`, `sm`, `xl`, `xs`
- colors: `bg.primary`, `bg.secondary`, `bg.tertiary`, `bg.grouped.primary`, `bg.grouped.secondary`, `bg.grouped.tertiary`, `label.primary`, `label.secondary`, `label.tertiary`, `label.quaternary`, `label.placeholder`, `fill.primary`, `fill.secondary`, `fill.tertiary`, `separator`, `separator.opaque`, `link`, `accent`, `accent.on`, `status.success`, `status.warning`, `status.danger`, `status.info`
- minWidth: `target`, `target-min`
- minHeight: `target`, `target-min`

## motion.js (`dist/motion.js` module, `dist/motion.global.js` classic script)

Module: `import { transition, animate } from "./motion.js"`. Classic `<script src="motion.global.js">`: the same functions on `DFMotion` (for example `DFMotion.camera(map, [lat, lng], { zoom: 14 })`).

- `prefersReducedMotion()` — true when the user asked for reduced motion (live)
- `onReducedMotionChange(cb)` — cb(reduced) on every change; returns unsubscribe
- `duration(name)` — ms for a duration token name; camera durations are 0 under Reduce Motion
- `transition(name)` — {duration, easing, properties, distance?} for the current Reduce Motion setting
- `camera(map, target, { zoom, far, ...opts })` — flyTo/flyToBounds on a Leaflet-style map; instant under Reduce Motion
- `scrollToTop(el)` — smooth only when motion is allowed
- `animate(el, name, keyframes)` — Web Animations wrapper; push/pop/rise have default keyframes; reduced = fade only

Duration names: `instant`, `micro`, `short`, `medium`, `long`, `cameraNear`, `cameraFar`.
Transition names: `push`, `pop`, `rise`, `sheet`, `feedback`, `camera`, `loop`.

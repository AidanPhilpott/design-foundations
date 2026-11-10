<!-- generated from rules/*.yaml by `design-foundations build` — do not edit -->

# Branding rules

Our own wording. Rules marked HIG paraphrase the Apple Human Interface Guidelines (https://developer.apple.com/design/human-interface-guidelines/branding);
WCAG, SwiftUI-defaults and house rules come from those sources or from this project.

## BRD-01 (must)

Never use Apple trademarks in the app's name or artwork, and never make the app look like an Apple product or system screen.

- Why: Apple's marks and identity are protected, and imitating them misleads people about who made the app.
- Web: No Apple logo, product names or device images in names, icons or splash art, and no screens styled to pass as iOS Settings, alerts or other Apple apps; the HIG covers trademarks, and the ban on imitating Apple products and system screens is house advice.
- Platforms: web, swift
- Source: [HIG › Branding › Best practices](https://developer.apple.com/design/human-interface-guidelines/branding)

## BRD-02 (should)

Let branding step back behind the content, never spending screen space on an element whose only job is to show the brand.

- Why: On a phone every row given to a logo or banner is a row taken from the map, the content or the forecast.
- Web: No persistent brand header or footer on the map or detail screens; the app name lives in the title element, the manifest and the icon.
- Platforms: web, swift
- Source: [HIG › Branding › Best practices](https://developer.apple.com/design/human-interface-guidelines/branding)

## BRD-03 (should)

Use the brand accent colour sparingly, for the primary action, the current selection and status that needs attention.

- Why: An accent that appears everywhere stops pointing at anything and makes the interface feel loud.
- Web: The accent role colours the main button, the active tab or filter and badges; secondary buttons, borders and body text use the label and separator roles.
- Platforms: web, swift
- Source: [HIG › Branding › Best practices](https://developer.apple.com/design/human-interface-guidelines/branding)

## BRD-04 (should)

Express the brand through restyled familiar components, keeping their size, position and behaviour as people expect.

- Why: Recognisable controls feel trustworthy at once, so people can pay attention to what makes the app different.
- Web: Brand colour, typeface and corner radius go on standard buttons, sheets and tab bars built from the tokens; do not invent new control shapes or move controls to unusual places for the sake of style.
- Platforms: web, swift
- Source: [HIG › Branding › Best practices](https://developer.apple.com/design/human-interface-guidelines/branding)

## BRD-05 (should)

Even in a highly styled design, keep standard patterns for layout, symbols, navigation and modal screens.

- Why: Familiar behaviour makes a distinctive look easy to approach.
- Web: Back sits at the top leading corner, sheets close downward and with a button, common actions use the standard icons (ICN-04), and the browser back gesture keeps working.
- Platforms: web, swift
- Source: [HIG › Branding › Best practices](https://developer.apple.com/design/human-interface-guidelines/branding)

## BRD-06 (should)

Show the logo only where it gives context, rather than repeating it across screens.

- Why: People know which app they opened, so a repeated logo is wasted space.
- Web: The logo appears on the sign-in screen and an about page, not on every sheet or in the map chrome.
- Platforms: web, swift
- Source: [HIG › Branding › Best practices](https://developer.apple.com/design/human-interface-guidelines/branding)

## BRD-07 (should)

Do not turn the launch screen into a brand moment; save branding for a welcome or onboarding screen if one is needed.

- Why: A launch screen is gone too fast to say anything, and an artificial delay to show a logo only makes the app feel slower.
- Web: The manifest background_color matches the first screen's background so the splash blends in; no animated logo intro or minimum splash time before the map appears.
- Platforms: web, swift
- Source: [HIG › Branding › Best practices](https://developer.apple.com/design/human-interface-guidelines/branding)

## BRD-08 (consider)

If the brand uses a custom typeface, keep it to headings and use the system font for body text, captions and controls.

- Why: System fonts are tuned for legibility at small sizes, while a display face carries personality best at large ones.
- Web: A brand font loads with font-display swap, is sized in rem through the type tokens like any other text (TYP-14), and never replaces type.fontFamily.default in body styles.
- Platforms: web, swift
- Source: [HIG › Branding › Best practices](https://developer.apple.com/design/human-interface-guidelines/branding)
- Tokens: `type.fontFamily.default`

## BRD-09 (consider)

Keep the brand's voice consistent in all the app's text, from labels to error messages.

- Why: A steady voice makes the app feel like one product and helps people trust what it says.
- Web: Follow the project's voice and terms list (WRT-07) in every string, including notifications, emails and the privacy note.
- Platforms: web, swift
- Source: [HIG › Branding › Best practices](https://developer.apple.com/design/human-interface-guidelines/branding)

## BRD-10 (should)

Do not override platform and browser behaviour for the sake of the brand.

- Why: Custom scrollbars, disabled text selection or replaced native pickers break habits and often accessibility too.
- Web: Keep native date, select and file inputs, normal text selection in content, standard scrolling and the system context menu; style them with accent-color and tokens instead of rebuilding them.
- Platforms: web, swift
- Source: house rule (related: [HIG › Branding › Best practices](https://developer.apple.com/design/human-interface-guidelines/branding))

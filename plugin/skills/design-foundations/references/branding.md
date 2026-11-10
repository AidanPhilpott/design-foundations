<!-- generated from rules/*.yaml and the base tokens by `design-foundations build` — do not edit -->

# Branding

Each line: `ID — rule — what to do on the web`. Details and sources: docs/rules/branding.md.

## Must

BRD-01 — Never use Apple trademarks in the app's name or artwork, and never make the app look like an Apple product or system screen. — No Apple logo, product names or device images in names, icons or splash art, and no screens styled to pass as iOS Settings, alerts or other Apple apps; the HIG covers trademarks, and the ban on imitating Apple products and system screens is house advice.

## Should

BRD-02 — Let branding step back behind the content, never spending screen space on an element whose only job is to show the brand. — No persistent brand header or footer on the map or detail screens; the app name lives in the title element, the manifest and the icon.
BRD-03 — Use the brand accent colour sparingly, for the primary action, the current selection and status that needs attention. — The accent role colours the main button, the active tab or filter and badges; secondary buttons, borders and body text use the label and separator roles.
BRD-04 — Express the brand through restyled familiar components, keeping their size, position and behaviour as people expect. — Brand colour, typeface and corner radius go on standard buttons, sheets and tab bars built from the tokens; do not invent new control shapes or move controls to unusual places for the sake of style.
BRD-05 — Even in a highly styled design, keep standard patterns for layout, symbols, navigation and modal screens. — Back sits at the top leading corner, sheets close downward and with a button, common actions use the standard icons (ICN-04), and the browser back gesture keeps working.
BRD-06 — Show the logo only where it gives context, rather than repeating it across screens. — The logo appears on the sign-in screen and an about page, not on every sheet or in the map chrome.
BRD-07 — Do not turn the launch screen into a brand moment; save branding for a welcome or onboarding screen if one is needed. — The manifest background_color matches the first screen's background so the splash blends in; no animated logo intro or minimum splash time before the map appears.
BRD-10 — Do not override platform and browser behaviour for the sake of the brand. — Keep native date, select and file inputs, normal text selection in content, standard scrolling and the system context menu; style them with accent-color and tokens instead of rebuilding them.

## Consider

BRD-08 — If the brand uses a custom typeface, keep it to headings and use the system font for body text, captions and controls. — A brand font loads with font-display swap, is sized in rem through the type tokens like any other text (TYP-14), and never replaces type.fontFamily.default in body styles.
BRD-09 — Keep the brand's voice consistent in all the app's text, from labels to error messages. — Follow the project's voice and terms list (WRT-07) in every string, including notifications, emails and the privacy note.

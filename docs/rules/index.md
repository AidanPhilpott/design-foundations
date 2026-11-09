<!-- generated from rules/*.yaml by `design-foundations build` — do not edit -->

# Rules index

| ID | Severity | Check | Rule |
|---|---|---|---|
| [ACC-01](accessibility.md#acc-01-must) | must |  | Give every control, icon button and meaningful image a short spoken name, and hide purely decorative graphics from assistive technology. |
| [ACC-02](accessibility.md#acc-02-must) | must | `text-floor` | Let all text grow to at least twice its default size without being cut off, overlapping or forcing sideways scrolling. |
| [ACC-03](accessibility.md#acc-03-must) | must | `contrast` | Status colours, icons, input borders, focus rings and other meaningful non-text marks need at least 3:1 contrast against what surrounds them. |
| [ACC-04](accessibility.md#acc-04-must) | must | `targets` | Make every tap or click target at least 44 by 44 points, and never smaller than 28 by 28 even in dense toolbars. |
| [ACC-05](accessibility.md#acc-05-must) | must | `focus` | Show a clearly visible focus indicator on whatever element currently has keyboard focus. |
| [ACC-06](accessibility.md#acc-06-must) | must |  | Every feature must be usable from a keyboard alone, in a sensible order, without overriding the shortcuts the system or browser already defines. |
| [ACC-07](accessibility.md#acc-07-must) | must |  | Back every gesture with an on-screen alternative that does the same job. |
| [ACC-08](accessibility.md#acc-08-should) | should |  | Keep the gestures for frequent tasks as simple as possible, such as a single tap or a one-finger swipe. |
| [ACC-09](accessibility.md#acc-09-must) | must |  | Audio, video and animated images that start on their own must come with controls to pause or stop them. |
| [ACC-10](accessibility.md#acc-10-should) | should |  | Do not make important messages or controls disappear on a timer; let people dismiss them themselves. |
| [ACC-11](accessibility.md#acc-11-must) | must |  | Never deliver information through sound alone; show it on screen as well. |
| [ACC-12](accessibility.md#acc-12-should) | should |  | Provide captions for spoken video and a transcript for longer audio. |
| [ACC-13](accessibility.md#acc-13-should) | should |  | Make the visible text of a control part of its accessible name, so saying what you see activates it. |
| [ACC-14](accessibility.md#acc-14-should) | should |  | Prefer familiar, standard controls and interactions over custom ones people must learn. |
| [ACC-15](accessibility.md#acc-15-should) | should |  | Ask for confirmation, or offer an undo, before an action that is hard to reverse, such as deleting a list or a log entry. |
| [ACC-16](accessibility.md#acc-16-should) | should |  | Test each release with the screen reader, keyboard-only use and enlarged text, not only with automated tools. |
| [COL-01](color.md#col-01-must) | must | `contrast` | Text needs a contrast ratio of at least 4.5:1 with its background, and only large text, meaning 24 CSS px and up or bold at about 19 CSS px and up, may drop to 3:1. |
| [COL-02](color.md#col-02-must) | must | `raw-values` | Take every colour from a semantic role token instead of writing raw colour values in components. |
| [COL-03](color.md#col-03-must) | must |  | Never let colour be the only way to tell things apart, show that something is interactive, or carry essential information. |
| [COL-04](color.md#col-04-must) | must |  | Give each colour a single meaning across the app, and keep the interactive colour off anything that cannot be tapped. |
| [COL-05](color.md#col-05-should) | should |  | Reserve the status roles for state, each with one fixed meaning in every screen, and never use them as decoration or branding. |
| [COL-06](color.md#col-06-must) | must |  | Give every colour role a light value, a dark value and a stronger increased-contrast version of each. |
| [COL-07](color.md#col-07-should) | should |  | Make the increased-contrast variants clearly stronger than the normal ones, and make sure the high-contrast scheme passes even if the default scheme falls short. |
| [COL-08](color.md#col-08-should) | should |  | Use each role only for the purpose its name states, never borrowing one for a different job because the shade happens to fit. |
| [COL-09](color.md#col-09-should) | should |  | Show layering with the background roles, putting primary behind the whole view, secondary on groups inside it and tertiary on groups within those. |
| [COL-10](color.md#col-10-should) | should |  | Rank text by importance with the label roles, from primary for main content down to tertiary and quaternary for the least important. |
| [COL-11](color.md#col-11-should) | should |  | Check the palette in bright daylight and in the dark, on more than one real device. |
| [COL-12](color.md#col-12-should) | should |  | Adjust the colours of nearby interface when the artwork or imagery behind it changes character. |
| [COL-13](color.md#col-13-consider) | consider |  | Consider how colours read in other cultures before using them to signal good or bad. |
| [COL-14](color.md#col-14-consider) | consider |  | When people can pick a colour, use the platform colour picker. |
| [COL-15](color.md#col-15-consider) | consider |  | Embed an sRGB colour profile in images, and use wide-gamut P3 colour only as an enhancement with an sRGB fallback. |
| [DRK-01](dark-mode.md#drk-01-should) | should |  | Follow the appearance people chose for the whole device and avoid a separate in-app appearance setting, but if one is unavoidable, make System its default. |
| [DRK-02](dark-mode.md#drk-02-must) | must |  | Design and ship both appearances as equals, and switch between them live when the setting changes while the app is open. |
| [DRK-03](dark-mode.md#drk-03-should) | should |  | Treat dark colours as their own considered palette rather than an inversion of the light one. |
| [DRK-04](dark-mode.md#drk-04-should) | should |  | Keep text contrast at 4.5:1 or better in dark appearance too, and aim for about 7:1 for small text in custom colours. |
| [DRK-05](dark-mode.md#drk-05-should) | should |  | Test dark appearance with Reduce Transparency and Increase Contrast turned on, each alone and then both at once. |
| [DRK-06](dark-mode.md#drk-06-should) | should |  | Declare that the page supports both schemes, so built-in form controls, scrollbars and text fields switch along with it. |
| [DRK-07](dark-mode.md#drk-07-should) | should |  | Make sure interface icons and full-colour images look right in both appearances, providing a separate version where one does not. |
| [DRK-08](dark-mode.md#drk-08-consider) | consider |  | Tone down large white areas in images shown in dark appearance. |
| [DRK-09](dark-mode.md#drk-09-should) | should |  | In dark appearance, make surfaces raised above the main view, such as sheets and popovers, a little lighter than the view beneath. |
| [DRK-10](dark-mode.md#drk-10-consider) | consider |  | Use a dark-only interface only in rare cases, such as a screen centred on immersive photos or imagery. |
| [DRK-11](dark-mode.md#drk-11-should) | should |  | Give the browser and installed PWA chrome a theme colour for each appearance. |
| [LAY-01](layout.md#lay-01-must) | must |  | Keep content and controls inside the safe area, clear of notches, the home indicator, rounded corners and browser bars. |
| [LAY-02](layout.md#lay-02-should) | should |  | Arrange each screen by importance, placing what matters most at the top and on the leading side. |
| [LAY-03](layout.md#lay-03-should) | should |  | Leave about 12 points around controls with a visible bezel and about 24 points around bare icons or text controls. |
| [LAY-04](layout.md#lay-04-must) | must |  | Base layout decisions on the space actually available, never on the device type or its orientation. |
| [LAY-05](layout.md#lay-05-must) | must |  | Offer the same functions at every size, changing only how much of it is visible at once. |
| [LAY-06](layout.md#lay-06-should) | should |  | Use the standard side margins, 16 points in compact widths and 20 points in regular widths. |
| [LAY-07](layout.md#lay-07-should) | should |  | Keep spacing on the 4-point grid by taking every gap, padding and margin from the space scale. |
| [LAY-08](layout.md#lay-08-should) | should |  | Align items to shared edges for easy scanning, and indent only to show that an item belongs beneath the one above. |
| [LAY-09](layout.md#lay-09-should) | should |  | Group related items and set unrelated ones apart using whitespace, a shared container or a separator. |
| [LAY-10](layout.md#lay-10-should) | should |  | Show the essentials first and reveal detail on request. |
| [LAY-11](layout.md#lay-11-should) | should |  | Make controls look distinct from content, and let full-screen content run underneath bars and floating controls. |
| [LAY-12](layout.md#lay-12-must) | must |  | Size full-height panes and sheets by the visible viewport so browser toolbars and the on-screen keyboard never cover their controls. |
| [LAY-13](layout.md#lay-13-should) | should |  | Make the layout work in every orientation and window size, even if one orientation is the main use. |
| [LAY-14](layout.md#lay-14-should) | should |  | Test the smallest and largest layouts first, then the sizes, languages and text settings in between. |
| [LAY-15](layout.md#lay-15-consider) | consider |  | When background art or imagery meets a new aspect ratio, scale it to fill rather than stretching or boxing it. |
| [LAY-16](layout.md#lay-16-should) | should |  | On wide screens, limit how long a line of running text can get instead of letting it span the whole window. |
| [MAT-01](materials.md#mat-01-must) | must |  | Turn every translucent surface solid when Reduce Transparency is on or when the browser cannot blur. |
| [MAT-02](materials.md#mat-02-should) | should |  | Use a material for surfaces that float above content, such as bars, map controls and sheets, so the layer below still shows through faintly. |
| [MAT-03](materials.md#mat-03-should) | should |  | Pick a material by its purpose and the legibility it must give, not by the tint it adds. |
| [MAT-04](materials.md#mat-04-should) | should |  | Use thicker materials under text and fine detail, and thinner ones only where keeping the background visible matters more. |
| [MAT-05](materials.md#mat-05-must) | must |  | Put only primary or secondary label colours on a material, never the fainter tertiary or quaternary ones. |
| [MAT-06](materials.md#mat-06-should) | should |  | Draw fills and dividers on a material with the fill and separator roles, which are meant to sit on translucent surfaces. |
| [MAT-07](materials.md#mat-07-should) | should |  | Judge legibility on a material against the brightest and busiest content that can appear behind it. |
| [MAT-08](materials.md#mat-08-should) | should |  | Take blur and opacity from the material tokens, layered over the background role, rather than writing ad-hoc backdrop filters. |
| [MAT-09](materials.md#mat-09-should) | should |  | Under Increase Contrast, give material surfaces a visible edge or make them solid. |
| [MAT-10](materials.md#mat-10-consider) | consider |  | Keep translucent, blurred surfaces to the few places that benefit from them. |
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
| [MOT-13](motion.md#mot-13-must) | must |  | Nothing on screen may flash more than three times in any one second. |
| [MOT-14](motion.md#mot-14-should) | should |  | Keep parallax and large background or full-screen movement out of the interface, and remove any that remains when Reduce Motion is on. |
| [TYP-01](typography.md#typ-01-must) | must | `text-floor` | Set no text smaller than 11 points, and give running text the 17-point body size. |
| [TYP-02](typography.md#typ-02-should) | should |  | Use regular weight or heavier for interface text, and go larger than usual if a typeface is thin. |
| [TYP-03](typography.md#typ-03-must) | must | `raw-values` | Take every font size, line height and weight from the type style tokens instead of writing raw values. |
| [TYP-04](typography.md#typ-04-should) | should |  | Express hierarchy through the named text styles, varying size, weight and label colour, and keep their relative order when text is resized. |
| [TYP-05](typography.md#typ-05-should) | should |  | Stick to one typeface family, with at most one more for a clear purpose. |
| [TYP-06](typography.md#typ-06-should) | should |  | Use the system font through the platform's own font names rather than bundling copies of it. |
| [TYP-07](typography.md#typ-07-must) | must |  | Make the layout adapt to every text size up to the largest accessibility sizes, with containers that grow instead of clipping. |
| [TYP-08](typography.md#typ-08-should) | should |  | Keep truncation to a minimum as text grows, letting labels wrap and offering a way to read anything that is still shortened. |
| [TYP-09](typography.md#typ-09-should) | should |  | At large text sizes, stack side-by-side items vertically and reduce the number of columns. |
| [TYP-10](typography.md#typ-10-should) | should |  | Scale meaningful icons along with the text around them. |
| [TYP-11](typography.md#typ-11-should) | should |  | Keep the order of information the same at every text size, with the most important elements still at the top. |
| [TYP-12](typography.md#typ-12-consider) | consider |  | When text grows, let the content people came for grow first, while compact chrome may grow more modestly. |
| [TYP-13](typography.md#typ-13-should) | should |  | Give long passages roomy line spacing and keep tight leading for one or two lines in height-limited rows. |
| [TYP-14](typography.md#typ-14-should) | should |  | A custom typeface must scale and respond to accessibility settings the same way the system font does. |
| [TYP-15](typography.md#typ-15-should) | should |  | Honour the Bold Text setting by making text weights heavier when it is on. |
| [TYP-16](typography.md#typ-16-should) | should |  | Let the iOS text size setting reach the web app, not only the browser zoom. |
| [TYP-17](typography.md#typ-17-consider) | consider |  | Try text where it will really be read, and fix hard-to-read spots with more size, more contrast or a more legible face. |
| [WRT-01](writing.md#wrt-01-should) | should |  | Say things plainly and briefly, removing any word that does not earn its place. |
| [WRT-02](writing.md#wrt-02-should) | should |  | Write error messages that sit beside the problem and tell people exactly how to fix it. |
| [WRT-03](writing.md#wrt-03-should) | should |  | Keep error copy calm and blame-free, with no cute interjections and no bare technical verdicts. |
| [WRT-04](writing.md#wrt-04-should) | should |  | Prevent errors before writing messages for them, and redesign any step where many people go wrong. |
| [WRT-05](writing.md#wrt-05-should) | should |  | Label buttons and links with a verb for what they do, and favour clarity over cleverness. |
| [WRT-06](writing.md#wrt-06-should) | should |  | Make link text describe its destination on its own, never a bare click here. |
| [WRT-07](writing.md#wrt-07-should) | should |  | Decide on the app's voice and keep a short list of preferred terms, using the same word for the same thing everywhere. |
| [WRT-08](writing.md#wrt-08-should) | should |  | Adapt the tone to the moment, straightforward for problems and safety and lighter for successes. |
| [WRT-09](writing.md#wrt-09-should) | should |  | Write in simple, inclusive language that anyone can follow and that translates well, without in-house jargon or gendered terms. |
| [WRT-10](writing.md#wrt-10-should) | should |  | Avoid we in interface copy, and use my or your only where needed, sticking to one perspective. |
| [WRT-11](writing.md#wrt-11-consider) | consider |  | Choose one capitalisation style per kind of element and apply it everywhere. |
| [WRT-12](writing.md#wrt-12-should) | should |  | In multi-step flows, label the step buttons consistently and make the end of the flow unmistakable. |
| [WRT-13](writing.md#wrt-13-should) | should |  | Use interaction verbs that suit the device, or neutral ones when the same copy serves touch and pointer. |
| [WRT-14](writing.md#wrt-14-should) | should |  | Give every empty screen a short explanation of what belongs there and a button or link to take the next step. |
| [WRT-15](writing.md#wrt-15-should) | should |  | Name settings plainly and, when a name is not enough, say what happens when the setting is on. |
| [WRT-16](writing.md#wrt-16-should) | should |  | When pointing someone to a setting, take them straight there instead of describing the path. |
| [WRT-17](writing.md#wrt-17-should) | should |  | Label every text field visibly and show the expected format with an example or hint, phrasing any correction as an instruction. |
| [WRT-18](writing.md#wrt-18-should) | should |  | Lead each screen with what matters most, and split unrelated ideas into separate steps or screens. |
| [WRT-19](writing.md#wrt-19-should) | should |  | Match how a message is delivered to its urgency, from inline text through banners and dialogs to notifications. |

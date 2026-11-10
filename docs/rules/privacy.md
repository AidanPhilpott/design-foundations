<!-- generated from rules/*.yaml by `design-foundations build` — do not edit -->

# Privacy rules

Our own wording. Rules marked HIG paraphrase the Apple Human Interface Guidelines (https://developer.apple.com/design/human-interface-guidelines/privacy);
WCAG, SwiftUI-defaults and house rules come from those sources or from this project.

## PRV-01 (must)

Ask for a permission at the moment someone uses the feature that needs it, and not at launch unless the app cannot work at all without it.

- Why: A request with no visible reason looks suspicious and is often refused, while one that follows a tap explains itself.
- Web: Call navigator.geolocation only from a tap on Locate me, and Notification.requestPermission only from a tap on Turn on alerts (Safari requires a user gesture); check 'Notification' in window first, because iOS Safari exposes it only in web apps added to the Home Screen (iOS 16.4 or later), and hide or explain the alerts option where it is missing.
- Platforms: web, swift
- Source: [HIG › Privacy › Requesting permission](https://developer.apple.com/design/human-interface-guidelines/privacy)

## PRV-02 (must)

Collect only the data a feature needs, and ask for the narrowest form of access that does the job.

- Why: Every extra piece of data is something people must trust you with and something that can leak.
- Web: Prefer one getCurrentPosition call to watchPosition, leave enableHighAccuracy off unless precision matters, and use a file input for photos, which needs no camera permission; store no more about a person than lists, sends and objectives require.
- Platforms: web, swift
- Source: [HIG › Privacy › Best practices](https://developer.apple.com/design/human-interface-guidelines/privacy)

## PRV-03 (must)

Never imitate, picture or annotate the permission prompt, and never offer rewards for accepting it.

- Why: Fake or decorated prompts trick people who tap quickly into choices they did not mean to make.
- Web: No custom dialog that looks like the browser's own, no arrows pointing at Allow, no screenshots of the prompt and no unlocks in return for permission; the HIG states this for tracking prompts, and applying it to every permission is house advice.
- Platforms: web, swift
- Source: [HIG › Privacy › Tracking requests](https://developer.apple.com/design/human-interface-guidelines/privacy)

## PRV-04 (must)

When people decline a permission, keep the rest of the feature working, explain how to turn it on later, and do not ask again unprompted.

- Why: Refusing access is a legitimate choice, and nagging or a dead end makes people distrust the whole app.
- Web: Browsers usually will not prompt again after a denial and the app cannot force them to, so detect it (the PERMISSION_DENIED error, Notification.permission after checking 'Notification' in window, or permissions.query where supported) and offer area search or a manual location instead, with a short note on where the site setting lives.
- Platforms: web, swift
- Source: house rule (related: [HIG › Privacy › Requesting permission](https://developer.apple.com/design/human-interface-guidelines/privacy))

## PRV-05 (must)

Say plainly what data the app collects, where it is kept and who can see it.

- Why: People share more comfortably when nothing about the handling of their data is hidden.
- Web: A short privacy note reachable from settings or sign-in lists what is stored in the cloud (lists, sends, objectives, issue reports), who can read it, and what stays on the device.
- Platforms: web, swift
- Source: [HIG › Privacy › Best practices](https://developer.apple.com/design/human-interface-guidelines/privacy)

## PRV-06 (must)

Do not load third-party trackers, and share personal data with outside services only as far as a feature needs it.

- Why: Each extra party that receives data is one more place it can be profiled, sold or leaked.
- Web: No ad or cross-site analytics scripts; weather or tile requests carry only the coordinates they must, and the privacy note says that map tile providers see which area is being viewed.
- Platforms: web, swift
- Source: house rule (related: [HIG › Privacy › Best practices](https://developer.apple.com/design/human-interface-guidelines/privacy))

## PRV-07 (must)

Never keep passwords, secret keys or other sensitive values in plain storage or in code that ships to the client.

- Why: Anything in the bundle or in unencrypted storage can be read by anyone who has the device or the files.
- Web: The public site holds only the publishable Supabase key, never the service role key; never put passwords in localStorage or IndexedDB, and keep private data behind row-level security; in SwiftUI use the Keychain.
- Platforms: web, swift
- Source: [HIG › Privacy › Protecting data](https://developer.apple.com/design/human-interface-guidelines/privacy)

## PRV-08 (must)

Use an established sign-in method rather than a home-made scheme, avoiding passwords on their own where possible.

- Why: Proven providers and passkeys resist phishing and reuse far better than custom code.
- Web: Magic links, Google sign-in through the auth provider or WebAuthn passkeys; if passwords are ever needed, require a second factor; in SwiftUI offer Sign in with Apple and passkeys.
- Platforms: web, swift
- Source: [HIG › Privacy › Protecting data](https://developer.apple.com/design/human-interface-guidelines/privacy)

## PRV-09 (should)

Tell people in one plain, specific, active sentence why the app wants access, right where they ask for the feature.

- Why: People agree more readily, and with more confidence, when they understand exactly what the access is for.
- Web: Browser prompts show no custom explanation, so put it on or beside the button (Show boulders near you; your location stays on this phone); in SwiftUI write the usage description string the same way.
- Platforms: web, swift
- Source: [HIG › Privacy › Requesting permission](https://developer.apple.com/design/human-interface-guidelines/privacy)

## PRV-10 (should)

Use an explanation screen before the prompt only when the context does not already explain the request, and give it a single button that leads to the prompt.

- Why: A second, competing button or a label like Allow pushes people toward a choice before they have seen the real one.
- Web: Label that button Continue or Next, never Allow, and add no other actions; build it as a page or a dialog that still closes on Escape and back, skip it when the permission is already granted or denied, call requestPermission synchronously inside the Continue click handler so Safari sees a user gesture, and handle a result that stays default (the prompt was dismissed) as not yet decided.
- Platforms: web, swift
- Source: [HIG › Privacy › Pre-alert screens, windows, or views](https://developer.apple.com/design/human-interface-guidelines/privacy)

## PRV-11 (should)

Process personal data on the device whenever the task allows.

- Why: Data that never leaves the phone cannot be intercepted or leaked from a server.
- Web: Work out distances from the current position to boulders or saved places in the browser, and do not send the person's coordinates to the backend or to analytics.
- Platforms: web, swift
- Source: [HIG › Privacy › Best practices](https://developer.apple.com/design/human-interface-guidelines/privacy)

## PRV-12 (should)

Respect the privacy features people turn on, and do not work around them.

- Why: Choices such as hidden email addresses or mail privacy settings are deliberate, and defeating them breaks trust.
- Web: Accept relay addresses such as privaterelay.appleid.com like any other email, do not rely on email tracking pixels, and do not fingerprint browsers to recognise people who cleared their data.
- Platforms: web, swift
- Source: [HIG › Privacy › Best practices](https://developer.apple.com/design/human-interface-guidelines/privacy)

## PRV-13 (should)

Offer a single, recognisable control for sharing the current location exactly when a task calls for it.

- Why: A clear one-tap way to share location only when wanted is lighter and more trustworthy than standing access.
- Web: A Locate me map button with the standard location-arrow glyph and an accessible name (Show my location); in SwiftUI use LocationButton.
- Platforms: web, swift
- Source: [HIG › Privacy › Location button](https://developer.apple.com/design/human-interface-guidelines/privacy)

## PRV-14 (should)

While the app is following someone's location, make that visible and let them stop it with one tap.

- Why: People should always know when they are being located and be able to end it.
- Web: Show an active state on the locate button while watchPosition runs, call clearWatch when it is tapped again, and stop watching when the page becomes hidden (visibilitychange).
- Platforms: web, swift
- Source: house rule (related: [HIG › Privacy › Location button](https://developer.apple.com/design/human-interface-guidelines/privacy))

## PRV-15 (should)

Let people delete what they have stored, including their account, and remove it from the server rather than just hiding it.

- Why: Holding data people wanted gone keeps the risk without any benefit to them.
- Web: Deleting a list, send, objective or account removes the rows in the database, and the privacy note says how to ask for full deletion.
- Platforms: web, swift
- Source: house rule (related: [HIG › Privacy › Protecting data](https://developer.apple.com/design/human-interface-guidelines/privacy))

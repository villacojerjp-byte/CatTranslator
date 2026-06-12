# Cat Translator — Human to Pet 🐱

A React Native (Expo) app that "translates" between humans and cats:

- **Cat mode** — record your cat's meow and get a human-language translation.
- **People mode** — speak or type a message and the app answers in cat sounds.
- **Soundboard** — 12 synthesized cat vocalizations (meows, purr, hiss, trills) on the home screen.
- **Cat profiles** — add multiple cats with avatars, gender, age, and breed.
- **History** — saved translations grouped by date, filterable by Cat/People.
- Onboarding flow + paywall screen modeled after the reference design.

All cat sounds and app icons are **procedurally generated** (see `scripts/`), so there are no licensed assets to worry about.

## Tech stack

- [Expo SDK 56](https://docs.expo.dev) / React Native 0.85 / TypeScript (strict)
- [expo-router](https://docs.expo.dev/router/introduction/) file-based navigation (3-tab layout + modals)
- [expo-audio](https://docs.expo.dev/versions/latest/sdk/audio/) for recording and playback
- AsyncStorage for local persistence (cats, history, onboarding state)

> **Why no Capacitor?** Capacitor wraps web apps in a native shell; React Native/Expo compiles real native UI directly. They are alternative stacks, not complementary — Expo alone produces the App Store / Play Store binaries via EAS Build.

## Run it (development)

```bash
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app (iOS/Android), or press `a`/`i` to open an emulator/simulator. Recording requires a real device or simulator with mic access.

## Ship to the App Store

1. Create an [Apple Developer account](https://developer.apple.com) ($99/yr) and an [Expo account](https://expo.dev).
2. Install EAS CLI and log in:
   ```bash
   npm install -g eas-cli
   eas login
   eas build:configure
   ```
3. Build a signed iOS binary in the cloud (no Mac needed):
   ```bash
   eas build --platform ios
   ```
4. Submit to App Store Connect:
   ```bash
   eas submit --platform ios
   ```

The bundle identifier is `com.codebp.cattranslator` (change it in [app.json](app.json) if needed). Android: `eas build --platform android` / `eas submit --platform android`.

### Before you submit — checklist

- [ ] **Privacy policy URL** — replace the placeholder in [src/app/settings.tsx](src/app/settings.tsx) and add it to App Store Connect.
- [ ] **Paywall is UI-only** — the "Start" button currently just unlocks the app locally. Wire it to real in-app purchases (e.g. [RevenueCat](https://www.revenuecat.com/) or `expo-iap`) before charging money; Apple rejects subscription UI without working StoreKit purchases and a Restore button.
- [ ] **Entertainment disclaimer** — the translation is for fun; Apple may ask you to state this in the App Store description.

## Regenerating assets

```bash
node scripts/generate-sounds.js   # synthesized cat WAVs → assets/sounds/
node scripts/generate-icons.js    # app icon set → assets/images/
```

## For the backend team

See [docs/BACKEND_NOTES.md](docs/BACKEND_NOTES.md) — what's mocked today, which APIs to adopt (RevenueCat for subscriptions, Claude API for real translations, on-device speech-to-text), and the proposed `/v1/translate` contract.

## Project layout

```
src/
  app/            expo-router routes
    (tabs)/       Home (soundboard), History, Cats
    onboarding    3-page intro → paywall → tabs
    translate     record → translate → save flow (Cat/People)
    cat-form      add/edit cat + avatar picker sheet
    settings      promo banner, terms, privacy
  components/     pill button, segmented toggle, waveforms, play row, tiles
  constants/      theme palette
  lib/            store (persistence), audio, sounds, fake translation engine
```

# Backend Notes — Cat Translator

**Audience:** backend team

## TL;DR — which APIs to use

| Need | Use this API | Priority |
|---|---|---|
| Subscriptions / paywall | **RevenueCat** (`react-native-purchases`) — wraps StoreKit 2 + Play Billing | **Required before charging money** |
| Translation text generation (Cat→Human phrases, People→Cat sound picks) | **Anthropic Claude API** — model `claude-opus-4-8` via `@anthropic-ai/sdk`, called from our own thin proxy endpoint (`POST /v1/translate`); `claude-haiku-4-5` is the cheaper fallback if cost matters at scale | High (the "make it feel real" upgrade) |
| Speech-to-text (People mode voice) | **On-device**: `expo-speech-recognition` (iOS Speech framework / Android SpeechRecognizer) — free, private, no backend. Cloud fallback: OpenAI Whisper or Deepgram | Medium |
| Real meow audio classification | **No suitable public API exists** — would require fine-tuning an audio model (YAMNet / AST); keep the on-device mock until then | Low / research |

One hard rule: **the Anthropic API key must never ship inside the mobile app** — all LLM calls go through our backend proxy. Details for each row below.

---

**Status:** the shipped app currently has **no backend**. Everything runs on-device:

| Feature | Current implementation |
|---|---|
| Cat → Human "translation" | `src/lib/translate.ts` — deterministic phrase pick seeded by recording duration/URI |
| Human → Cat "translation" | `src/lib/translate.ts` — keyword regex → bundled synthesized meow WAVs |
| Speech-to-text | none (voice input is never transcribed; only duration is used) |
| Subscriptions / paywall | UI only — "Start" sets a local `pro` flag in AsyncStorage |
| Storage | all local (AsyncStorage); no accounts, no sync |

This is intentionally shippable as an entertainment app. The sections below are what to build when we want the experience to feel "real", in priority order.

---

## 1. In-app purchases — RevenueCat (required before charging money)

The paywall promises "3 days free, then $7.99/week" but doesn't process payment. **Apple will reject subscription UI without working StoreKit purchases and Restore.**

- **Use [RevenueCat](https://www.revenuecat.com/docs/getting-started/installation/reactnative)** (`react-native-purchases`, works with Expo via a dev build). It wraps StoreKit 2 + Google Play Billing, handles receipt validation server-side, and gives us webhooks for entitlement state — no backend code needed for v1.
- App-side touch points: `src/app/paywall.tsx` (`finish(true)`) and `src/lib/store.tsx` (`setPro`). Replace the local flag with the RevenueCat entitlement check.
- If we later add accounts, mirror entitlements via RevenueCat webhooks into our DB.

## 2. LLM-powered translations — Claude API (the fun upgrade)

Generate the Cat→Human phrases (and pick meow sequences for People→Cat) with an LLM instead of the canned phrase list. This is a single-call classification/short-generation workload — no agent loop needed.

- **API:** Anthropic Claude API, `POST /v1/messages` via the official SDK (`@anthropic-ai/sdk` on Node).
- **Model:** default to **`claude-opus-4-8`** ($5/$25 per MTok). If cost becomes a concern at scale, the team can decide to drop to **`claude-haiku-4-5`** ($1/$5 per MTok, 200K context) — for ~30-token playful outputs either is fast; that tradeoff is a product/cost decision, not a technical one.
- **Never put the Anthropic API key in the mobile app.** Proxy through a thin backend endpoint (Cloudflare Worker / small Node service):

```
POST /v1/translate
{
  "mode": "cat" | "people",
  "text": "are you hungry?",          // people mode, typed
  "durationMs": 2400,                  // voice metadata
  "cat": { "name": "Whiskers", "age": "3 years", "breed": "Tabby" }
}
→ { "phrase": "Feed me this instant, peasant", "soundIds": ["hungry","attention"] }
```

Server-side call (TypeScript):

```ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // ANTHROPIC_API_KEY from env

const response = await client.messages.parse({
  model: "claude-opus-4-8",
  max_tokens: 256,
  system:
    "You write one short, funny line a cat might be 'saying', in the cat's voice. " +
    "Keep it under 12 words, playful, family-friendly. Also pick 1-3 mood tags from: " +
    "hello,hungry,love,angry,sad,sleepy,playful,purr,attention,curious,scared,greeting",
  messages: [{ role: "user", content: JSON.stringify(payload) }],
  output_config: {
    format: {
      type: "json_schema",
      schema: {
        type: "object",
        properties: {
          phrase: { type: "string" },
          soundIds: { type: "array", items: { type: "string" } },
        },
        required: ["phrase", "soundIds"],
        additionalProperties: false,
      },
    },
  },
});
const result = response.parsed_output; // { phrase, soundIds }
```

- The `soundIds` returned must come from the app's bundled sound set (`src/lib/sounds.ts`) so the client can play them offline.
- Add basic rate limiting per device (the app has no auth yet — key off a generated install ID) and cache identical inputs.
- Keep the current on-device logic as the **offline/error fallback** — the app must never hard-fail a translation.

## 3. Speech-to-text for People mode (optional, improves quality)

Today voice input only uses duration. To make People→Cat react to *what was said*, transcribe first:

- **Cheapest path: on-device.** `expo-speech-recognition` (iOS Speech framework / Android SpeechRecognizer) — free, private, no backend. Feed the transcript into the existing keyword logic or the Claude endpoint above. **Recommended first step.**
- Cloud alternative (if on-device quality disappoints): OpenAI Whisper API or Deepgram via the same backend proxy. Adds cost + latency + privacy disclosure requirements in the App Store privacy questionnaire.

## 4. Real meow classification (research-y, lowest priority)

"Translating" actual cat vocalizations is ML, not an API call. There is no good off-the-shelf SaaS for this. Options if we ever want it:

- Fine-tune an audio classifier (YAMNet / Audio Spectrogram Transformer) on labeled cat vocalization datasets to emotion classes (hungry/angry/content/etc.), host it behind the same `/v1/translate` endpoint, and let Claude phrase the result playfully.
- Until then, the deterministic on-device pick is indistinguishable from competitors' behavior.

## Privacy / App Store notes for whatever we build

- Any endpoint receiving audio or transcripts must be declared in the App Store privacy labels; add a real privacy policy URL (placeholder is in `src/app/settings.tsx`).
- Don't store raw audio server-side unless we have a reason; process and discard.
- The mic permission string is already configured in `app.json`.

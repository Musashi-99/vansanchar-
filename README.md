# VanSanchar (front-end-only demo)

Bridging Communities & Wildlife - Sundarbans, West Bengal.
Mobile-first React + Vite + TypeScript + Tailwind app. **No backend**: all data is seeded in `src/lib/seed.ts` and persisted in the browser (localStorage + IndexedDB `VanSancharDB`).

## Run

```
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
```

## Demo logins

| Portal | Credentials |
|---|---|
| Citizen (phone) | 98300 12345, OTP `123456` |
| Citizen (email) | citizen@vansanchar.demo / Demo@1234 |
| Forest Guard | guard@vansanchar.demo / Demo@1234 (cannot verify) |
| Range Officer | range@vansanchar.demo / Demo@1234 |
| DFO | dfo@vansanchar.demo / Demo@1234 |
| Platform Admin | admin@vansanchar.demo / Demo@1234 (/admin/*) |

Profile > "Simulate offline mode" tests the offline queue (reports and SOS saved to IndexedDB, synced on reconnect). Profile > "Reset demo data" restores the seed.

## What is real vs simulated

3D maps: MapLibre GL JS (BSD-3) with OpenFreeMap vector tiles (3D buildings), AWS Terrain Tiles (Terrarium DEM) for terrain, and extruded 3D columns/zones for incidents and risk. Needs internet for tiles.

Real in the browser: routing/permissions per role, report state machine with audit trail, idempotent token ledger, IndexedDB offline queue + sync, image validation (magic bytes) + compression, voice recording (MediaRecorder), GPS with accuracy/staleness, Leaflet map with generalised public projection, haversine search, CSV export with formula-injection guard, SHA-256 attestation hash, `<video>` watch-time tracking, offline guide downloads to IndexedDB, printable certificates, PWA manifest + shell service worker.

Simulated (clearly labelled in the UI): OTP/auth, Gemini vision + chatbot (local rule/keyword logic), weather, predictive model (rule-based baseline), drone feed/telemetry/commands, Stellar Testnet transaction, push, Vapi voice alerts (not configured), SMS.

Translations: English, Bengali and Hindi have core strings; other languages translate navigation only and fall back to English. Urdu switches to RTL. Medical text is not machine-translated.

## Moving to production

The spec in `idea.md` (Firebase Auth/Firestore/Storage/Functions, Gemini, FCM, Stellar, Vapi) is the backend roadmap. Replace `src/lib/store.ts` actions with API calls; the component layer already separates UI from data.

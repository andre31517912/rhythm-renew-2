# Rhythm Renew — Tech Stack & Dependencies

## App Overview

| Property | Value |
|----------|-------|
| App Name | Rhythm Renew |
| Version | 1.0.0 |
| Bundle ID (iOS) | com.rhythmrenew |
| Package (Android) | com.rhythmrenew |
| URL Scheme | rhythmrenew:// |
| Orientation | Portrait only |
| Architecture | New Architecture (Fabric + JSI) enabled |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│              FRONTEND (Expo / React Native)      │
│  Expo SDK 54 + Expo Router 6 (file-based routes) │
│  Runs on port 8081                               │
└────────────────────┬────────────────────────────┘
                     │ REST API (HTTP)
┌────────────────────▼────────────────────────────┐
│              BACKEND (Express / Node.js)         │
│  TypeScript + Express 5                          │
│  Runs on port 5000                               │
└──────┬──────────────────────┬───────────────────┘
       │                      │
┌──────▼──────┐       ┌───────▼──────┐
│  OpenAI API  │       │  Spotify API  │
│  (AI Coach + │       │  (Music       │
│  Recs)       │       │   Previews)   │
└─────────────┘       └──────────────┘

Storage:
└── AsyncStorage (on-device, per user, no cloud sync)
```

---

## Frontend

### Core Framework
| Package | Version | Purpose |
|---------|---------|---------|
| `expo` | ~54.0.27 | Core Expo SDK |
| `react` | 19.1.0 | UI framework |
| `react-native` | 0.81.5 | Native mobile runtime |
| `expo-router` | ~6.0.17 | File-based navigation (like Next.js) |

### Navigation & UI
| Package | Version | Purpose |
|---------|---------|---------|
| `react-native-screens` | ~4.16.0 | Native screen containers |
| `react-native-gesture-handler` | ~2.28.0 | Touch/gesture handling |
| `react-native-safe-area-context` | ~5.6.0 | Notch/Dynamic Island safe areas |
| `expo-symbols` | ~1.0.8 | SF Symbols (iOS native icons) |
| `@expo/vector-icons` | ^15.0.3 | Icon library (Ionicons, etc.) |

### Animations & Visual Effects
| Package | Version | Purpose |
|---------|---------|---------|
| `react-native-reanimated` | ~4.1.1 | Smooth animations (worklet-based) |
| `react-native-worklets` | 0.5.1 | Reanimated worklet runtime |
| `expo-linear-gradient` | ~15.0.8 | Gradient backgrounds |
| `expo-blur` | ~15.0.8 | Blur effects |
| `expo-glass-effect` | ~0.1.4 | iOS 26 liquid glass tab bar |
| `react-native-svg` | 15.12.1 | SVG rendering (wave headers, charts) |

### Fonts
| Package | Version | Purpose |
|---------|---------|---------|
| `@expo-google-fonts/playfair-display` | ^0.4.2 | Serif header font |
| `@expo-google-fonts/poppins` | ^0.4.1 | Body text font |
| `@expo-google-fonts/manrope` | ^0.4.2 | UI font |
| `@expo-google-fonts/pacifico` | ^0.4.1 | Accent font |
| `expo-font` | ~14.0.10 | Font loading |

### Media & Assets
| Package | Version | Purpose |
|---------|---------|---------|
| `expo-image` | ~3.0.11 | Optimized image component (caching) |
| `expo-av` | ^16.0.8 | Audio/video playback |
| `expo-image-picker` | ~17.0.9 | Photo library / camera picker |

### State Management & Data Fetching
| Package | Version | Purpose |
|---------|---------|---------|
| `@tanstack/react-query` | ^5.83.0 | Server state, caching, fetching |
| `@react-native-async-storage/async-storage` | 2.2.0 | On-device persistent storage |

### Device & Native Features
| Package | Version | Purpose |
|---------|---------|---------|
| `expo-haptics` | ~15.0.8 | Haptic feedback |
| `expo-location` | ~19.0.8 | GPS location access |
| `expo-web-browser` | ~15.0.10 | In-app browser |
| `expo-linking` | ~8.0.10 | Deep linking |
| `expo-constants` | ~18.0.11 | Device/environment constants |
| `expo-status-bar` | ~3.0.9 | Status bar control |
| `expo-system-ui` | ~6.0.9 | System UI customization |
| `expo-splash-screen` | ~31.0.12 | Splash screen management |
| `react-native-keyboard-controller` | ^1.20.6 | Keyboard handling for chat |

### Web & Utilities
| Package | Version | Purpose |
|---------|---------|---------|
| `react-native-web` | ^0.21.0 | Web platform support |
| `react-dom` | 19.1.0 | React DOM (web) |
| `@stardazed/streams-text-encoding` | ^1.0.2 | Text stream decoding (AI streaming) |
| `@ungap/structured-clone` | ^1.3.0 | Structured clone polyfill |
| `p-limit` | ^7.3.0 | Concurrency limiting |
| `p-retry` | ^7.1.1 | Retry logic |

---

## Backend

### Core Framework
| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^5.0.1 | HTTP server framework |
| `tsx` | ^4.20.6 | TypeScript execution (dev) |
| `ws` | ^8.18.0 | WebSocket support |

### AI Integration
| Package | Version | Purpose |
|---------|---------|---------|
| `openai` | ^6.25.0 | OpenAI SDK (AI coach + recommendations) |
| Model used | `gpt-5.2` | Replit AI Integrations model (replaced by `gpt-4o` outside Replit) |

### Spotify Integration
| Package | Version | Purpose |
|---------|---------|---------|
| `@spotify/web-api-ts-sdk` | ^1.2.0 | Spotify Web API (track previews) |
| `http-proxy-middleware` | ^3.0.5 | Proxy support |

### Database (available, not yet active)
| Package | Version | Purpose |
|---------|---------|---------|
| `drizzle-orm` | ^0.39.3 | TypeScript ORM |
| `drizzle-zod` | ^0.7.1 | Zod schema generation from Drizzle |
| `pg` | ^8.16.3 | PostgreSQL driver |
| `zod` | ^3.25.76 | Schema validation |
| `zod-validation-error` | ^3.5.4 | Better Zod error messages |

### Dev Tools
| Package | Version | Purpose |
|---------|---------|---------|
| `drizzle-kit` | ^0.31.4 | Database migration tool |
| `typescript` | ~5.9.2 | TypeScript compiler |
| `@types/express` | ^5.0.0 | Express type definitions |
| `@types/react` | ~19.1.10 | React type definitions |
| `@babel/core` | ^7.25.2 | JavaScript transpiler |
| `babel-plugin-react-compiler` | ^19.0.0-beta | React compiler (experimental) |
| `eslint` | ^9.31.0 | Code linting |
| `eslint-config-expo` | ~10.0.0 | Expo ESLint rules |
| `patch-package` | ^8.0.0 | Patch node_modules fixes |
| `@expo/ngrok` | ^4.1.0 | Tunnel for local dev |

---

## Storage

| Layer | Technology | Where data lives | Syncs across devices? |
|-------|-----------|-----------------|----------------------|
| User cycle data | AsyncStorage | On device | ❌ No |
| Onboarding status | AsyncStorage | On device | ❌ No |
| Journal entries | AsyncStorage | On device | ❌ No |
| AI responses | None (live) | Not stored | — |

### AsyncStorage Keys
| Key | Contents |
|-----|----------|
| `rhythm_cycle_data` | Last period date, cycle length, name, goal, phase |
| `rhythm_onboarded` | Boolean — whether onboarding is complete |
| `rhythm_journal_entries` | Array of journal entries |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Streaming AI coach chat (SSE) |
| POST | `/api/recommend` | AI phase-specific recommendations |
| GET | `/api/spotify/preview` | Spotify 30s track preview URL |

---

## Environment Variables

| Variable | Used By | Description |
|----------|---------|-------------|
| `PORT` | Backend | Server port (default 5000) |
| `SESSION_SECRET` | Backend | Session signing key |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | Backend | OpenAI API key |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | Backend | OpenAI base URL |
| `SPOTIFY_CLIENT_ID` | Backend | Spotify app client ID |
| `SPOTIFY_CLIENT_SECRET` | Backend | Spotify app client secret |
| `EXPO_PUBLIC_DOMAIN` | Frontend | Backend domain (e.g. `localhost:5000`) |

---

## App Configuration (app.json)

| Setting | Value |
|---------|-------|
| Splash background | `#3D0A12` (deep wine) |
| iOS tablet support | Disabled |
| Android adaptive icon bg | `#F7D0D5` (blush pink) |
| New Architecture | Enabled (Fabric + JSI) |
| React Compiler | Enabled (experimental) |
| Typed Routes | Enabled |

---

## Hosting & Deployment

| Layer | Platform | URL |
|-------|----------|-----|
| Frontend + Backend | Replit Autoscale | https://rhythm-renew.replit.app |
| Custom domain | rhythmrenew.com | Verifying DNS |
| Plan | Autoscale (2 vCPU / 4 GiB RAM / 3 instances max) | — |
| iOS App Store | Pending (Expo Launch / EAS) | — |

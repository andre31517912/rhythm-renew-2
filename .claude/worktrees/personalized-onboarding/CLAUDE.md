# Rhythm Renew — Claude Desktop Project Guide

## What this app is
A premium iOS wellness app (Expo / React Native) that gives women personalized health recommendations based on their menstrual cycle phase. Backend is Express + TypeScript. Preview runs on Replit.

## Workflow
1. Edit files here using Claude Desktop
2. `git add . && git commit -m "your change" && git push`
3. In Replit: Git panel → Pull → preview updates instantly

> **Do NOT run the app locally.** Use Replit for all previewing.
> Replit has all environment variables and dependencies pre-configured.

---

## Project Structure

```
app/                        ← All screens (Expo Router file-based routing)
  (tabs)/
    index.tsx               ← Home Dashboard (phase display, recommendation cards)
    mind.tsx                ← Mind tab (meditations, Spotify playlists)
    body.tsx                ← Body tab (workouts, nutrition)
    soul.tsx                ← Soul tab (journal, affirmations)
    profile.tsx             ← Profile (settings, cycle calendar, shop)
    coach.tsx               ← AI Chat Coach (streaming GPT)
  onboarding.tsx            ← 4-step onboarding flow
  _layout.tsx               ← Root layout (fonts, providers, tabs)

components/
  WaveHeader.tsx            ← Pink wave header used on every tab
  AIRecommendCard.tsx       ← AI-powered recommendation cards
  CustomTabBar.tsx          ← Bottom tab bar

contexts/
  CycleContext.tsx          ← Phase engine + all user state (AsyncStorage)

server/
  index.ts                  ← Express server entry
  routes.ts                 ← API endpoints (/api/chat, /api/recommend, /api/spotify/preview)
  spotify.ts                ← Spotify integration

constants/
  Colors.ts                 ← All brand colors — edit here, reflects everywhere

lib/
  query-client.ts           ← API fetching utilities
```

---

## Brand Colors (constants/Colors.ts)

| Name | Hex | Used for |
|------|-----|----------|
| hotPink | #D4217A | Logo tint, accents |
| darkWine | #610015 | Page background |
| mediumPink | #C2185B | Wave header bottom layer |
| blushLight | #fce4ec | Wave header top, cards |
| babyPink | #FFB3C6 | Secondary text, icons |
| white | #FFFFFF | Primary text on dark bg |

---

## Key Rules — DO NOT change these

| Rule | Reason |
|------|--------|
| Do NOT edit `package.json` directly | Use `npm install <package>` instead |
| Do NOT create `app.config.ts` or `app.config.js` | Must stay as `app.json` — breaks Replit build |
| Do NOT change `bundleIdentifier` in `app.json` | Breaks iOS App Store submission |
| Do NOT hardcode `localhost` in API URLs | Phone can't reach localhost — use `getApiUrl()` from `lib/query-client.ts` |
| Do NOT change the model name `gpt-5.2` in `server/routes.ts` | Replit AI Integrations model — only works on Replit |
| Do NOT commit `attached_assets/`, `node_modules/`, `*.tar.gz` | Already in `.gitignore` |

---

## API Endpoints (server/routes.ts)

| Method | Endpoint | What it does |
|--------|----------|--------------|
| POST | `/api/chat` | Streaming AI coach (SSE) |
| POST | `/api/recommend` | AI phase recommendations (nutrition/movement/meditation/music) |
| GET | `/api/spotify/preview?title=&artist=` | Returns Spotify 30s preview URL |

---

## Storage
All user data is stored **on-device only** via AsyncStorage. No database, no accounts.

| Key | Contents |
|-----|----------|
| `rhythm_cycle_data` | Name, last period date, cycle length, goal, phase |
| `rhythm_onboarded` | Boolean — onboarding complete |
| `rhythm_journal_entries` | Array of journal entries |

---

## Cycle Phases
The app calculates the user's current phase from their last period date:

| Phase | Days | Energy | Color |
|-------|------|--------|-------|
| Menstrual | 1–5 | Rest | Deep red |
| Follicular | 6–13 | Rising | Soft pink |
| Ovulatory | 14–17 | Peak | Vibrant coral |
| Luteal | 18–28 | Declining | Warm mauve |

Phase logic lives in: `contexts/CycleContext.tsx`

---

## Git Workflow

```bash
# After making changes
git add .
git commit -m "describe your change clearly"
git push

# Then in Replit:
# Git panel → Pull → app auto-reloads
```

---

## Environment Variables (managed by Replit — do not store locally)
- `AI_INTEGRATIONS_OPENAI_API_KEY` — OpenAI key (Replit AI Integrations)
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — OpenAI base URL
- `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` — Spotify API
- `SESSION_SECRET` — Session signing
- `EXPO_PUBLIC_DOMAIN` — Backend URL (auto-set by Replit)

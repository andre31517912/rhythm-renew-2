# Rhythm Renew — Cycle-Aligned Women's Wellness App

A premium iOS wellness app built with Expo Router (React Native) and Express backend.

## Architecture

### Frontend (Expo Router / React Native)
- **Framework**: Expo SDK 54, Expo Router v6 (file-based routing)
- **State**: React Context (`CycleContext`) + AsyncStorage for persistence
- **Fonts**: Poppins (body) + Playfair Display (headers) via @expo-google-fonts
- **Styling**: React Native StyleSheet + expo-linear-gradient
- **Animations**: react-native-reanimated

### Backend (Express / Node.js)
- **Framework**: Express with TypeScript
- **AI**: OpenAI via Replit AI Integrations (gpt-5.2)
- **Port**: 5000

## App Structure

```
app/
  _layout.tsx         # Root layout with providers (QueryClient, CycleProvider)
  index.tsx           # Redirect logic (onboarding or tabs)
  onboarding.tsx      # 4-step onboarding flow
  (tabs)/
    _layout.tsx       # Tab navigation (NativeTabs liquid glass / Classic)
    index.tsx         # Home Dashboard — phase, hormone insight, recommendation cards
    mind.tsx          # Mind — Meditations & Spotify music playlists by phase
    body.tsx          # Body — Phase workouts & nutrition guide
    coach.tsx         # AI Chat Coach — streaming OpenAI with phase context
    profile.tsx       # Profile, Cycle Calendar, Shop (protein + subscription)

contexts/
  CycleContext.tsx    # Phase engine, user data, cycle calculations

server/
  routes.ts           # /api/chat — streaming AI endpoint
```

## Brand Colors
- Hot Pink header: #D4217A (Pantone 214 C)
- Soft Blush background: #F7D0D5 (Pantone 705 C)
- Deep Burgundy text: #5C1A2E (Pantone 7421 C)
- Phase-specific colors for Menstrual/Follicular/Ovulatory/Luteal

## Core Features
1. **Onboarding**: Collects name, last period date, cycle length, primary goal
2. **Phase Engine**: Automatically calculates current phase (Menstrual/Follicular/Ovulatory/Luteal)
3. **Daily Dashboard**: Phase display, hormone insight, 4 recommendation cards (workout, meditation, nutrition, music)
4. **AI Coach**: Streaming chat with phase-aware GPT-5.2 coaching
5. **Mind Tab**: Guided meditations + Spotify playlists by phase
6. **Body Tab**: On-demand workout videos + nutrition phase guide
7. **Profile Tab**: Settings, cycle calendar, shop (protein + $9.99/mo subscription)

## AI Integration
- Uses Replit AI Integrations (OpenAI-compatible, no API key needed from user)
- Billed to Replit credits
- Model: gpt-5.2 (most capable)

## Running
- Backend: `npm run server:dev` (port 5000)
- Frontend: `npm run expo:dev` (port 8081)

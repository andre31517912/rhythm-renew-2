# Rhythm Renew — Local Setup Guide

## What you need before starting

| Tool | Where to get it |
|------|----------------|
| Node.js 20+ | https://nodejs.org |
| Expo Go app | App Store on your iPhone |
| OpenAI API key | https://platform.openai.com/api-keys |
| Spotify app credentials | https://developer.spotify.com/dashboard |

---

## Step 1 — Install dependencies

Open a terminal, navigate to this folder, and run:

```bash
npm install
```

This installs everything the app needs. It will take 1–2 minutes.

---

## Step 2 — Set up environment variables

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` in any text editor and fill in your values:

   - **SESSION_SECRET** → type any random words, e.g. `mysecretkey123`
   - **AI_INTEGRATIONS_OPENAI_API_KEY** → paste your OpenAI API key (starts with `sk-`)
   - **AI_INTEGRATIONS_OPENAI_BASE_URL** → leave as `https://api.openai.com/v1`
   - **SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET** → from your Spotify developer dashboard
   - **EXPO_PUBLIC_DOMAIN** → your computer's local IP + `:5000` (see note below)

   > **Finding your local IP:**
   > - Mac: Open Terminal, type `ipconfig getifaddr en0`
   > - Windows: Open Command Prompt, type `ipconfig`, look for "IPv4 Address"
   > - It looks like: `192.168.1.42` → so set `EXPO_PUBLIC_DOMAIN=192.168.1.42:5000`
   > 
   > ⚠️ Do NOT use `localhost` — your phone can't reach your computer using that name.

---

## Step 3 — Change the AI model name

The Replit version uses a model called `gpt-5.2` which only works inside Replit.
For local use, open `server/routes.ts` and change **both** occurrences of:

```
model: "gpt-5.2",
```

to:

```
model: "gpt-4o",
```

---

## Step 4 — Run the app

You need **two terminal windows open at the same time**:

**Terminal 1 — Start the backend server:**
```bash
npm run server:dev
```
You should see: `Server running on port 5000`

**Terminal 2 — Start the Expo app:**
```bash
npx expo start
```
A QR code will appear in the terminal.

---

## Step 5 — Open on your iPhone

1. Make sure your iPhone is on the **same Wi-Fi network** as your computer
2. Open the **Camera** app and scan the QR code from Terminal 2
3. It will open in **Expo Go**

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Network request failed" | Check EXPO_PUBLIC_DOMAIN — make sure it's your computer's IP, not localhost |
| AI coach not responding | Check your OpenAI API key in `.env` and make sure you changed the model to `gpt-4o` |
| Spotify not working | Check your Spotify client ID and secret — make sure your Spotify app is set up at developer.spotify.com |
| "Cannot find module" errors | Run `npm install` again |
| QR code won't scan | Make sure phone and computer are on the same Wi-Fi network |

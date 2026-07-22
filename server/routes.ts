import type { Express } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";
import { spotifySearch } from "./spotify";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const AI_MODEL = process.env.AI_MODEL || "gpt-4o";

const CATEGORY_PROMPTS: Record<string, (phase: string, cycleDay: number, goal: string) => string> = {
  nutrition: (phase, cycleDay, goal) =>
    `You are a cycle-syncing nutritionist. A woman is on cycle day ${cycleDay} in her ${phase} phase with a goal of ${goal}.

Give her 3 specific, actionable nutrition tips for TODAY. Format each tip as:
- **[Food or nutrient name]**: [1–2 sentence explanation of why it helps her right now and how to incorporate it]

End with one sentence about the key nutritional theme for her ${phase} phase. Be warm, specific, and science-backed. Max 200 words.`,

  movement: (phase, cycleDay, goal) =>
    `You are a cycle-aware fitness coach. A woman is on cycle day ${cycleDay} in her ${phase} phase with a goal of ${goal}.

Give her 3 specific workout recommendations for this phase. Format each as:
- **[Workout Name]**: [Type, ideal duration, intensity, and why her body benefits from this now]

End with one sentence about her energy levels this phase. Be motivating and science-backed. Max 200 words.`,

  meditation: (phase, cycleDay, goal) =>
    `You are a mindfulness coach specializing in women's wellness. A woman is on cycle day ${cycleDay} in her ${phase} phase with a goal of ${goal}.

Give her 2 specific mindfulness practices for this phase. Format each as:
- **[Practice Name]**: [Duration, how to do it, and why it helps her hormonally right now]

End with an affirmation tailored to her ${phase} phase energy. Be warm, grounding, and specific. Max 180 words.`,

  music: (phase, cycleDay, goal) =>
    `You are a music therapist specializing in cycle-syncing. A woman is on cycle day ${cycleDay} in her ${phase} phase.

Recommend 3 specific songs that match her phase energy. Format each as:
- **Artist - Song Title**: [1 sentence on why this song fits her ${phase} phase energy]

End with a short description of the ideal sonic mood for her phase. Max 150 words.`,
};

export async function registerRoutes(app: Express): Promise<Server> {
  // AI chat endpoint (streaming)
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, phase, cycleDay, goal, mood } = req.body;

      const systemPrompt = `You are Rhythm, a supportive AI wellness coach for women who uses cycle-syncing science to provide personalized guidance. 

Current context:
- Cycle Phase: ${phase || "Unknown"}
- Cycle Day: ${cycleDay || "Unknown"}
- Primary Goal: ${goal || "general wellness"}
- Current Mood: ${mood || "not specified"}

Your personality:
- Warm, supportive, and science-backed
- Blend of feminine intuition and high-performance coaching
- Educational without being preachy
- Never make medical diagnoses or claims
- Focus on lifestyle, nutrition, movement, and emotional wellness

Tailor your responses specifically to the ${phase || "current"} phase. Keep responses concise, warm, and actionable (2-4 sentences unless they ask for more detail). Always acknowledge their current phase and how it relates to their question.`;

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
        max_completion_tokens: 1024,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Chat error:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Failed to generate response" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to generate response" });
      }
    }
  });

  // AI personalized recommendations endpoint
  app.post("/api/recommend", async (req, res) => {
    try {
      const { phase, cycleDay, goal, category } = req.body;

      if (!phase || !category || !CATEGORY_PROMPTS[category]) {
        return res.status(400).json({ error: "Missing required fields: phase, category" });
      }

      const prompt = CATEGORY_PROMPTS[category](
        phase || "follicular",
        cycleDay || 1,
        goal || "general wellness"
      );

      const completion = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [{ role: "user", content: prompt }],
        max_completion_tokens: 512,
      });

      const advice = completion.choices[0]?.message?.content || "";
      res.json({ advice, phase, category });
    } catch (error) {
      console.error("Recommend error:", error);
      res.status(500).json({ error: "Failed to generate recommendation" });
    }
  });

  // Spotify track preview endpoint — returns 30s preview_url for a song
  app.get("/api/spotify/preview", async (req, res) => {
    try {
      const { title, artist } = req.query as { title: string; artist: string };
      if (!title || !artist) {
        return res.status(400).json({ error: "Missing title or artist" });
      }

      const results = await spotifySearch(
        `track:${title} artist:${artist}`,
        ["track"],
        3
      );

      const track = results.tracks?.items?.[0];
      if (!track) {
        return res.status(404).json({ error: "Track not found", previewUrl: null });
      }

      res.json({
        previewUrl: track.preview_url,
        trackName: track.name,
        artistName: track.artists?.[0]?.name,
        spotifyUrl: track.external_urls?.spotify,
      });
    } catch (error: any) {
      const msg = error?.message || "";
      if (msg.includes("403") || msg.includes("401") || msg.includes("OAuth") || msg.includes("not be registered")) {
        return res.json({ previewUrl: null, reason: "auth" });
      }
      console.error("Spotify preview error:", error);
      res.json({ previewUrl: null, reason: "error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

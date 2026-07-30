import type { Express } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";
import { spotifySearch } from "./spotify";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const AI_MODEL = process.env.AI_MODEL || "gpt-4o-mini";

function buildDietaryContext(dietaryPreferences: string[], allergies: string[]): string {
  const parts: string[] = [];
  if (dietaryPreferences.length > 0) {
    parts.push(`She follows a ${dietaryPreferences.join(", ")} diet.`);
  }
  if (allergies.length > 0) {
    parts.push(`She has these allergies/intolerances: ${allergies.join(", ")}. NEVER suggest foods containing these allergens.`);
  }
  return parts.length > 0 ? "\n\n" + parts.join(" ") : "";
}

const CATEGORY_PROMPTS: Record<string, (phase: string, cycleDay: number, goal: string, dietaryPreferences: string[], allergies: string[]) => string> = {
  nutrition: (phase, cycleDay, goal, dietaryPreferences, allergies) =>
    `You are a cycle-syncing nutritionist. A woman is on cycle day ${cycleDay} in her ${phase} phase with a goal of ${goal}.${buildDietaryContext(dietaryPreferences, allergies)}

Give her 3 specific, actionable nutrition tips for TODAY that respect her dietary preferences and allergies. Format each tip as:
- **[Food or nutrient name]**: [1–2 sentence explanation of why it helps her right now and how to incorporate it]

End with one sentence about the key nutritional theme for her ${phase} phase. Be warm, specific, and science-backed. Max 200 words.`,

  movement: (phase, cycleDay, goal, dietaryPreferences, allergies) =>
    `You are a cycle-aware fitness coach. A woman is on cycle day ${cycleDay} in her ${phase} phase with a goal of ${goal}.

Give her 3 specific workout recommendations for this phase. Format each as:
- **[Workout Name]**: [Type, ideal duration, intensity, and why her body benefits from this now]

End with one sentence about her energy levels this phase. Be motivating and science-backed. Max 200 words.`,

  meditation: (phase, cycleDay, goal, dietaryPreferences, allergies) =>
    `You are a mindfulness coach specializing in women's wellness. A woman is on cycle day ${cycleDay} in her ${phase} phase with a goal of ${goal}.

Give her 2 specific mindfulness practices for this phase. Format each as:
- **[Practice Name]**: [Duration, how to do it, and why it helps her hormonally right now]

End with an affirmation tailored to her ${phase} phase energy. Be warm, grounding, and specific. Max 180 words.`,

  music: (phase, cycleDay, goal, dietaryPreferences, allergies) =>
    `You are a music therapist specializing in cycle-syncing. A woman is on cycle day ${cycleDay} in her ${phase} phase.

Recommend 3 specific songs that match her phase energy. Format each as:
- **Artist - Song Title**: [1 sentence on why this song fits her ${phase} phase energy]

End with a short description of the ideal sonic mood for her phase. Max 150 words.`,
};

export async function registerRoutes(app: Express): Promise<Server> {
  // AI chat endpoint (streaming)
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, phase, cycleDay, goal, mood, dietaryPreferences, allergies } = req.body;

      const dietContext = (dietaryPreferences?.length || allergies?.length)
        ? `\n- Dietary Preferences: ${dietaryPreferences?.length ? dietaryPreferences.join(", ") : "none specified"}\n- Allergies/Intolerances: ${allergies?.length ? allergies.join(", ") + " — NEVER suggest foods with these allergens" : "none"}`
        : "";

      const systemPrompt = `You are Rhythm, a supportive AI wellness coach for women who uses cycle-syncing science to provide personalized guidance.

Current context:
- Cycle Phase: ${phase || "Unknown"}
- Cycle Day: ${cycleDay || "Unknown"}
- Primary Goal: ${goal || "general wellness"}
- Current Mood: ${mood || "not specified"}${dietContext}

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
      const { phase, cycleDay, goal, category, dietaryPreferences, allergies } = req.body;

      if (!phase || !category || !CATEGORY_PROMPTS[category]) {
        return res.status(400).json({ error: "Missing required fields: phase, category" });
      }

      const prompt = CATEGORY_PROMPTS[category](
        phase || "follicular",
        cycleDay || 1,
        goal || "general wellness",
        dietaryPreferences || [],
        allergies || []
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

  // USDA FoodData Central search — autocomplete with nutrient info
  app.get("/api/food-search", async (req, res) => {
    try {
      const { query } = req.query as { query: string };
      if (!query || query.trim().length < 2) {
        return res.json({ foods: [] });
      }

      const apiKey = process.env.USDA_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "USDA API key not configured" });
      }

      const url = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
      url.searchParams.set("api_key", apiKey);
      url.searchParams.set("query", query.trim());
      url.searchParams.set("dataType", "Foundation,SR Legacy");
      url.searchParams.set("pageSize", "8");

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`USDA API returned ${response.status}`);
      }

      const data = await response.json() as any;
      const KEY_NUTRIENTS = [1003, 1004, 1005, 1008, 1079, 1087, 1089, 1090, 1092, 1093, 1095, 1098, 1104, 1106, 1162, 1165, 1166, 1170, 1175, 1176, 1177, 1178, 1180];
      const NUTRIENT_NAMES: Record<number, string> = {
        1003: "Protein", 1004: "Fat", 1005: "Carbs", 1008: "Calories",
        1079: "Fiber", 1087: "Calcium", 1089: "Iron", 1090: "Magnesium",
        1092: "Potassium", 1093: "Sodium", 1095: "Zinc", 1098: "Phosphorus",
        1104: "Vitamin A", 1106: "Vitamin A (RAE)", 1162: "Vitamin C",
        1165: "Vitamin B1", 1166: "Vitamin B2", 1170: "Vitamin B5",
        1175: "Vitamin B6", 1176: "Folate", 1177: "Vitamin B12",
        1178: "Vitamin K",
      };

      const foods = (data.foods || []).map((food: any) => {
        const nutrients = (food.foodNutrients || [])
          .filter((n: any) => KEY_NUTRIENTS.includes(n.nutrientId) && n.value > 0)
          .map((n: any) => ({
            name: NUTRIENT_NAMES[n.nutrientId] || n.nutrientName,
            value: Math.round(n.value * 10) / 10,
            unit: n.unitName?.toLowerCase() || "",
          }))
          .slice(0, 8);

        return {
          fdcId: food.fdcId,
          name: food.description,
          nutrients,
        };
      });

      res.json({ foods });
    } catch (error) {
      console.error("Food search error:", error);
      res.status(500).json({ error: "Failed to search foods" });
    }
  });

  // AI recipe generation from selected ingredients
  app.post("/api/generate-recipe", async (req, res) => {
    try {
      const { ingredients, phase, dietaryPreferences, allergies } = req.body;

      if (!ingredients || ingredients.length === 0) {
        return res.status(400).json({ error: "No ingredients selected" });
      }

      const dietContext = buildDietaryContext(dietaryPreferences || [], allergies || []);

      const prompt = `You are a cycle-syncing nutritionist and chef. A woman is in her ${phase || "follicular"} phase.${dietContext}

She has selected these ingredients to cook with: ${ingredients.join(", ")}.

Create ONE delicious, healthy recipe using as many of her selected ingredients as possible. The recipe should be optimized for her ${phase || "follicular"} phase nutritional needs.

Respond in this exact JSON format (no markdown, no code fences):
{
  "name": "Recipe Name",
  "prepTime": 25,
  "description": "One sentence about why this recipe is great for her current phase.",
  "phaseWhy": "One sentence about which key nutrients this provides for her phase.",
  "ingredients": ["ingredient 1 with amount", "ingredient 2 with amount"],
  "steps": ["Step 1 instruction", "Step 2 instruction"],
  "tip": "One phase-specific nutrition tip related to this recipe."
}`;

      const completion = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [{ role: "user", content: prompt }],
        max_completion_tokens: 1024,
      });

      const raw = completion.choices[0]?.message?.content || "";
      const recipe = JSON.parse(raw);
      res.json({ recipe });
    } catch (error) {
      console.error("Recipe generation error:", error);
      res.status(500).json({ error: "Failed to generate recipe" });
    }
  });

  // AI phase plan generation — fresh recipes + workouts per cycle
  app.post("/api/generate-phase-plan", async (req, res) => {
    try {
      const { phase, phaseLength, dietaryPreferences, allergies } = req.body;

      if (!phase || !phaseLength) {
        return res.status(400).json({ error: "Missing required fields: phase, phaseLength" });
      }

      const dietContext = buildDietaryContext(dietaryPreferences || [], allergies || []);

      const prompt = `You are a cycle-syncing nutritionist and fitness coach. A woman is entering her ${phase} phase which lasts ${phaseLength} days.${dietContext}

Generate a ${phaseLength}-day meal and workout plan. Each day needs ONE recipe and ONE workout optimized for the ${phase} phase.

Rules:
- Every recipe must be DIFFERENT — no repeats across the ${phaseLength} days
- Recipes should focus on the key nutrients for the ${phase} phase
- Workouts should match the energy level and safe muscle groups for the ${phase} phase
- If she has dietary preferences, ALL recipes must comply. If she has allergies, NEVER include those allergens.
- Vary cuisine styles, cooking methods, and workout types across the days

Respond in this exact JSON format (no markdown, no code fences):
{
  "recipes": [
    {
      "name": "Recipe Name",
      "prepTime": 25,
      "description": "One sentence about why this is great for this phase.",
      "dietTags": ["vegan", "gluten-free"],
      "allergens": [],
      "nutrients": ["iron", "magnesium"],
      "ingredients": ["ingredient 1 with amount", "ingredient 2 with amount"],
      "steps": ["Step 1", "Step 2"]
    }
  ],
  "workouts": [
    {
      "name": "Workout Name",
      "type": "yoga",
      "duration": 30,
      "intensity": "low",
      "description": "One sentence about why this workout fits this phase.",
      "warmup": "3 min warmup description",
      "cooldown": "3 min cooldown description",
      "exercises": [
        { "name": "Exercise Name", "sets": 3, "reps": "12", "notes": "Form tip" }
      ]
    }
  ]
}

Generate exactly ${phaseLength} recipes and ${Math.min(phaseLength, 5)} workouts.`;

      const completion = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [{ role: "user", content: prompt }],
        max_completion_tokens: 4096,
      });

      const raw = completion.choices[0]?.message?.content || "";
      const plan = JSON.parse(raw);
      res.json(plan);
    } catch (error) {
      console.error("Phase plan generation error:", error);
      res.status(500).json({ error: "Failed to generate phase plan" });
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

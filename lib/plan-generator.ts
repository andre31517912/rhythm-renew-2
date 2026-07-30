import { getRecipesForPhase, filterRecipes, getWorkoutsForPhase } from "@/data/phase-content";
import type { PhaseInfo, CycleData } from "@/contexts/CycleContext";
import type { PhasePlan, DailyPlan, DailyRecipe, DailyWorkout } from "@/types/phase-plan";
import { apiRequest } from "@/lib/query-client";

function seededShuffle<T>(arr: T[], seed: string): T[] {
  const copy = [...arr];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  for (let i = copy.length - 1; i > 0; i--) {
    hash = ((hash << 5) - hash + i) | 0;
    const j = Math.abs(hash) % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export async function generateAIPlan(
  phaseInfo: PhaseInfo,
  cycleData: CycleData
): Promise<PhasePlan> {
  const { phase, phaseLength } = phaseInfo;

  const res = await apiRequest("POST", "/api/generate-phase-plan", {
    phase,
    phaseLength,
    dietaryPreferences: cycleData.dietaryPreferences ?? [],
    allergies: cycleData.allergies ?? [],
  });

  const data = await res.json();

  const days: DailyPlan[] = [];
  for (let d = 0; d < phaseLength; d++) {
    const recipe = data.recipes[d];
    const workout = data.workouts[d % data.workouts.length];

    const dailyRecipe: DailyRecipe = {
      id: `ai-recipe-${phase}-${d}`,
      source: "ai",
      name: recipe.name,
      prepTime: recipe.prepTime,
      description: recipe.description,
      dietTags: recipe.dietTags || [],
      allergens: recipe.allergens || [],
      nutrients: recipe.nutrients || [],
      ingredients: recipe.ingredients,
      steps: recipe.steps,
    };

    const dailyWorkout: DailyWorkout = {
      id: `ai-workout-${phase}-${d}`,
      source: "ai",
      name: workout.name,
      type: workout.type,
      duration: workout.duration,
      intensity: workout.intensity,
      description: workout.description,
      warmup: workout.warmup,
      cooldown: workout.cooldown,
      exercises: workout.exercises,
    };

    days.push({ day: d + 1, recipe: dailyRecipe, workout: dailyWorkout, swapped: false });
  }

  return {
    id: `plan-ai-${Date.now()}`,
    phase,
    phaseLength,
    cycleStartDate: cycleData.lastPeriodStart!,
    createdAt: new Date().toISOString(),
    days,
  };
}

export function generateLocalPlan(
  phaseInfo: PhaseInfo,
  cycleData: CycleData
): PhasePlan {
  const { phase, phaseLength } = phaseInfo;
  const seed = `${cycleData.lastPeriodStart}-${phase}`;

  let recipes = getRecipesForPhase(phase);
  recipes = filterRecipes(recipes, cycleData.dietaryPreferences ?? [], cycleData.allergies ?? []);
  if (recipes.length === 0) {
    recipes = getRecipesForPhase(phase);
  }
  recipes = seededShuffle(recipes, seed + "-recipes");

  let workouts = getWorkoutsForPhase(phase);
  workouts = seededShuffle(workouts, seed + "-workouts");

  const days: DailyPlan[] = [];

  for (let d = 0; d < phaseLength; d++) {
    const recipe = recipes[d % recipes.length];
    const workout = workouts[d % workouts.length];

    days.push({
      day: d + 1,
      recipe: {
        id: recipe.id,
        source: "local",
        name: recipe.name,
        prepTime: recipe.prepTime,
        description: recipe.description,
        dietTags: recipe.dietTags,
        allergens: recipe.allergens,
        nutrients: recipe.nutrients,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
      },
      workout: {
        id: workout.id,
        source: "local",
        name: workout.name,
        type: workout.type,
        duration: workout.duration,
        intensity: workout.intensity,
        description: workout.description,
        warmup: workout.warmup,
        cooldown: workout.cooldown,
        exercises: workout.exercises,
      },
      swapped: false,
    });
  }

  return {
    id: `plan-${Date.now()}`,
    phase,
    phaseLength,
    cycleStartDate: cycleData.lastPeriodStart!,
    createdAt: new Date().toISOString(),
    days,
  };
}

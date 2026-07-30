import type { Phase } from "@/contexts/CycleContext";

export interface DailyRecipe {
  id: string;
  source: "local" | "ai";
  name: string;
  prepTime: number;
  description: string;
  dietTags: string[];
  allergens: string[];
  nutrients: string[];
  ingredients: string[];
  steps: string[];
}

export interface DailyWorkout {
  id: string;
  source: "local" | "ai";
  name: string;
  type: string;
  duration: number;
  intensity: string;
  description: string;
  warmup: string;
  cooldown: string;
  exercises: { name: string; sets: number; reps?: string; hold?: string; notes: string }[];
}

export interface DailyPlan {
  day: number;
  recipe: DailyRecipe;
  workout: DailyWorkout;
  swapped: boolean;
}

export interface PhasePlan {
  id: string;
  phase: Phase;
  phaseLength: number;
  cycleStartDate: string;
  createdAt: string;
  days: DailyPlan[];
}

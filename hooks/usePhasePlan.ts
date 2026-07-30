import { useState, useEffect, useMemo, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCycle } from "@/contexts/CycleContext";
import { generateAIPlan, generateLocalPlan } from "@/lib/plan-generator";
import { getRecipesForPhase, filterRecipes, getWorkoutsForPhase } from "@/data/phase-content";
import type { PhasePlan, DailyPlan } from "@/types/phase-plan";

function storageKey(phase: string) {
  return `rhythm_phase_plan_${phase}`;
}

export function usePhasePlan() {
  const { cycleData, phaseInfo } = useCycle();
  const [plan, setPlan] = useState<PhasePlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!phaseInfo || !cycleData.lastPeriodStart) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setIsLoading(true);
      const key = storageKey(phaseInfo.phase);
      const raw = await AsyncStorage.getItem(key);

      if (raw) {
        const cached: PhasePlan = JSON.parse(raw);
        if (
          cached.phase === phaseInfo.phase &&
          cached.cycleStartDate === cycleData.lastPeriodStart &&
          cached.phaseLength === phaseInfo.phaseLength
        ) {
          if (!cancelled) {
            setPlan(cached);
            setIsLoading(false);
          }
          return;
        }
      }

      let newPlan;
      try {
        newPlan = await generateAIPlan(phaseInfo, cycleData);
      } catch {
        newPlan = generateLocalPlan(phaseInfo, cycleData);
      }
      await AsyncStorage.setItem(key, JSON.stringify(newPlan));
      if (!cancelled) {
        setPlan(newPlan);
        setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [phaseInfo?.phase, cycleData.lastPeriodStart, phaseInfo?.phaseLength]);

  const todaysPlan = useMemo<DailyPlan | null>(() => {
    if (!plan || !phaseInfo) return null;
    return plan.days[phaseInfo.phaseDay - 1] ?? null;
  }, [plan, phaseInfo?.phaseDay]);

  const persistPlan = useCallback(async (updated: PhasePlan) => {
    setPlan(updated);
    await AsyncStorage.setItem(storageKey(updated.phase), JSON.stringify(updated));
  }, []);

  const swapRecipe = useCallback(async (dayNumber: number) => {
    if (!plan || !phaseInfo) return;
    const dayIndex = dayNumber - 1;
    const current = plan.days[dayIndex];
    if (!current) return;

    let recipes = getRecipesForPhase(phaseInfo.phase);
    recipes = filterRecipes(recipes, cycleData.dietaryPreferences ?? [], cycleData.allergies ?? []);
    if (recipes.length === 0) recipes = getRecipesForPhase(phaseInfo.phase);

    const usedIds = new Set(plan.days.map((d) => d.recipe.id));
    let next = recipes.find((r) => !usedIds.has(r.id));
    if (!next) {
      next = recipes.find((r) => r.id !== current.recipe.id) ?? recipes[0];
    }

    const updatedDays = [...plan.days];
    updatedDays[dayIndex] = {
      ...current,
      recipe: {
        id: next.id,
        source: "local",
        name: next.name,
        prepTime: next.prepTime,
        description: next.description,
        dietTags: next.dietTags,
        allergens: next.allergens,
        nutrients: next.nutrients,
        ingredients: next.ingredients,
        steps: next.steps,
      },
      swapped: true,
    };

    await persistPlan({ ...plan, days: updatedDays });
  }, [plan, phaseInfo, cycleData]);

  const swapWorkout = useCallback(async (dayNumber: number) => {
    if (!plan || !phaseInfo) return;
    const dayIndex = dayNumber - 1;
    const current = plan.days[dayIndex];
    if (!current) return;

    const workouts = getWorkoutsForPhase(phaseInfo.phase);
    const usedIds = new Set(plan.days.map((d) => d.workout.id));
    let next = workouts.find((w) => !usedIds.has(w.id));
    if (!next) {
      next = workouts.find((w) => w.id !== current.workout.id) ?? workouts[0];
    }

    const updatedDays = [...plan.days];
    updatedDays[dayIndex] = {
      ...current,
      workout: {
        id: next.id,
        source: "local",
        name: next.name,
        type: next.type,
        duration: next.duration,
        intensity: next.intensity,
        description: next.description,
        warmup: next.warmup,
        cooldown: next.cooldown,
        exercises: next.exercises,
      },
      swapped: true,
    };

    await persistPlan({ ...plan, days: updatedDays });
  }, [plan, phaseInfo]);

  return { plan, todaysPlan, isLoading, swapRecipe, swapWorkout };
}

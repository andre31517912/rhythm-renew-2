import { useState, useEffect, useMemo, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCycle } from "@/contexts/CycleContext";
import { generateAIPlan, generateLocalPlan } from "@/lib/plan-generator";
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

      const localPlan = generateLocalPlan(phaseInfo, cycleData);
      if (!cancelled) {
        setPlan(localPlan);
        setIsLoading(false);
      }

      try {
        const aiPlan = await generateAIPlan(phaseInfo, cycleData);
        await AsyncStorage.setItem(key, JSON.stringify(aiPlan));
        if (!cancelled) {
          setPlan(aiPlan);
        }
      } catch {
        await AsyncStorage.setItem(key, JSON.stringify(localPlan));
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

  return { plan, todaysPlan, isLoading, persistPlan };
}

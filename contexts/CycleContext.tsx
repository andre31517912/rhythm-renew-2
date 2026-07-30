import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Phase = "menstrual" | "follicular" | "ovulatory" | "luteal";
export type Goal = "sync" | "fitness" | "hormone-balance" | "emotional-regulation";

export interface CycleData {
  lastPeriodStart: string | null;
  cycleLength: number;
  goal: Goal;
  name: string;
  dietaryPreferences: string[];
  allergies: string[];
  favoriteIngredients: string[];
}

export interface PhaseInfo {
  phase: Phase;
  cycleDay: number;
  phaseName: string;
  phaseDay: number;
  phaseLength: number;
  hormoneInsight: string;
  color: string;
  colorLight: string;
  description: string;
}

interface CycleContextValue {
  cycleData: CycleData;
  phaseInfo: PhaseInfo | null;
  isOnboarded: boolean;
  isLoading: boolean;
  setCycleData: (data: Partial<CycleData>) => Promise<void>;
  completeOnboarding: (data: CycleData) => Promise<void>;
}

const STORAGE_KEY = "rhythm_cycle_data";
const ONBOARDED_KEY = "rhythm_onboarded";

const phaseConfig: Record<Phase, {
  name: string;
  color: string;
  colorLight: string;
  description: string;
  hormoneInsight: string;
}> = {
  menstrual: {
    name: "Menstrual",
    color: "#C0004A",
    colorLight: "#ffd0e4",
    description: "Rest & restore",
    hormoneInsight: "Estrogen and progesterone are at their lowest. Honor your need for rest — your body is doing profound work.",
  },
  follicular: {
    name: "Follicular",
    color: "#D4217A",
    colorLight: "#fce4ec",
    description: "Rise & energize",
    hormoneInsight: "Estrogen is rising, bringing clarity and creativity. Your brain is literally more capable of learning new skills right now.",
  },
  ovulatory: {
    name: "Ovulatory",
    color: "#e8006a",
    colorLight: "#FFD6E3",
    description: "Shine & connect",
    hormoneInsight: "Peak estrogen and a surge of LH and testosterone fuel your confidence and social magnetism. You are at your most magnetic.",
  },
  luteal: {
    name: "Luteal",
    color: "#C2185B",
    colorLight: "#f7c5d5",
    description: "Slow & deepen",
    hormoneInsight: "Progesterone rises to support potential pregnancy. If it doesn't happen, levels drop — this is when PMS symptoms can appear.",
  },
};

function calculatePhase(lastPeriodStart: string, cycleLength: number): PhaseInfo {
  const start = new Date(lastPeriodStart);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const cycleDay = (diffDays % cycleLength) + 1;

  let phase: Phase;
  let phaseDay: number;
  let phaseLength: number;

  if (cycleDay <= 5) {
    phase = "menstrual";
    phaseDay = cycleDay;
    phaseLength = 5;
  } else if (cycleDay <= 13) {
    phase = "follicular";
    phaseDay = cycleDay - 5;
    phaseLength = 8;
  } else if (cycleDay <= 16) {
    phase = "ovulatory";
    phaseDay = cycleDay - 13;
    phaseLength = 3;
  } else {
    phase = "luteal";
    phaseDay = cycleDay - 16;
    phaseLength = cycleLength - 16;
  }

  const config = phaseConfig[phase];
  return {
    phase,
    cycleDay,
    phaseName: config.name,
    phaseDay,
    phaseLength,
    hormoneInsight: config.hormoneInsight,
    color: config.color,
    colorLight: config.colorLight,
    description: config.description,
  };
}

const defaultCycleData: CycleData = {
  lastPeriodStart: null,
  cycleLength: 28,
  goal: "sync",
  name: "",
  dietaryPreferences: [],
  allergies: [],
  favoriteIngredients: [],
};

const CycleContext = createContext<CycleContextValue | null>(null);

export function CycleProvider({ children }: { children: ReactNode }) {
  const [cycleData, setCycleDataState] = useState<CycleData>(defaultCycleData);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [dataStr, onboarded] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(ONBOARDED_KEY),
      ]);
      if (dataStr) {
        setCycleDataState(JSON.parse(dataStr));
      }
      setIsOnboarded(onboarded === "true");
    } catch (e) {
      console.error("Failed to load cycle data:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function setCycleData(data: Partial<CycleData>) {
    const updated = { ...cycleData, ...data };
    setCycleDataState(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  async function completeOnboarding(data: CycleData) {
    setCycleDataState(data);
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)),
      AsyncStorage.setItem(ONBOARDED_KEY, "true"),
    ]);
    setIsOnboarded(true);
  }

  const phaseInfo = useMemo(() => {
    if (!cycleData.lastPeriodStart) return null;
    return calculatePhase(cycleData.lastPeriodStart, cycleData.cycleLength);
  }, [cycleData.lastPeriodStart, cycleData.cycleLength]);

  const value = useMemo(() => ({
    cycleData,
    phaseInfo,
    isOnboarded,
    isLoading,
    setCycleData,
    completeOnboarding,
  }), [cycleData, phaseInfo, isOnboarded, isLoading]);

  return (
    <CycleContext.Provider value={value}>
      {children}
    </CycleContext.Provider>
  );
}

export function useCycle() {
  const context = useContext(CycleContext);
  if (!context) throw new Error("useCycle must be used within CycleProvider");
  return context;
}

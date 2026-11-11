import AsyncStorage from "@react-native-async-storage/async-storage";

const HISTORY_KEY = "rhythm_recipe_history";
const MAX_HISTORY = 50;

export interface RecipeHistoryEntry {
  name: string;
  phase: string;
  date: string;
}

export async function getRecipeHistory(): Promise<RecipeHistoryEntry[]> {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
}

export async function addRecipesToHistory(
  recipes: { name: string; phase: string }[],
): Promise<void> {
  const existing = await getRecipeHistory();
  const date = new Date().toISOString().slice(0, 10);
  const newEntries = recipes.map((r) => ({ ...r, date }));
  const updated = [...newEntries, ...existing].slice(0, MAX_HISTORY);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export async function getRecentRecipeNames(limit = 30): Promise<string[]> {
  const history = await getRecipeHistory();
  return history.slice(0, limit).map((h) => h.name);
}

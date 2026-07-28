import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { useCycle, type Phase } from "@/contexts/CycleContext";
import { AIRecommendCard } from "@/components/AIRecommendCard";
import { PHASE_NUTRIENTS, filterFoodsByDiet, type Nutrient, type NutrientFood } from "@/data/phase-nutrients";
import { getApiUrl } from "@/lib/query-client";

interface FoodSearchResult {
  fdcId: number;
  name: string;
  nutrients: { name: string; value: number; unit: string }[];
}

interface GeneratedRecipe {
  name: string;
  prepTime: number;
  description: string;
  phaseWhy: string;
  ingredients: string[];
  steps: string[];
  tip: string;
}

interface SelectedIngredient {
  name: string;
  source: "suggested" | "search";
}

interface Props {
  phase: Phase;
  phaseColor: string;
  phaseColorLight: string;
  phaseName: string;
  cycleDay: number;
}

function NutrientCard({
  nutrient,
  phaseColor,
  onSelectFood,
  selectedIngredients,
  dietaryPreferences,
  allergies,
}: {
  nutrient: Nutrient;
  phaseColor: string;
  onSelectFood: (name: string) => void;
  selectedIngredients: string[];
  dietaryPreferences: string[];
  allergies: string[];
}) {
  const [expanded, setExpanded] = useState(false);
  const rotation = useSharedValue(0);

  const toggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded((e) => !e);
    rotation.value = withTiming(expanded ? 0 : 1, { duration: 200 });
  };

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 180}deg` }],
  }));

  return (
    <View style={[styles.nutrientCard, { borderColor: phaseColor + "30" }]}>
      <Pressable onPress={toggle} style={styles.nutrientHeader}>
        <View style={[styles.nutrientIcon, { backgroundColor: phaseColor + "18" }]}>
          <Ionicons name={nutrient.icon as any} size={20} color={phaseColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.nutrientName}>{nutrient.name}</Text>
          <Text style={styles.nutrientWhy} numberOfLines={expanded ? undefined : 2}>
            {nutrient.why}
          </Text>
        </View>
        <Animated.View style={chevronStyle}>
          <Ionicons name="chevron-down" size={20} color={Colors.gray} />
        </Animated.View>
      </Pressable>

      {expanded && (
        <Animated.View entering={FadeInDown.duration(200)} style={styles.foodList}>
          <Text style={[styles.foodListLabel, { color: phaseColor }]}>
            Rich sources — tap to add to your recipe
          </Text>
          {filterFoodsByDiet(nutrient.foods, dietaryPreferences, allergies).map((food, i) => {
            const isSelected = selectedIngredients.includes(food.name);
            return (
              <Pressable
                key={i}
                onPress={() => {
                  Haptics.selectionAsync();
                  onSelectFood(food.name);
                }}
                style={({ pressed }) => [
                  styles.foodItem,
                  isSelected && { backgroundColor: phaseColor + "14" },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={styles.foodEmoji}>{food.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.foodName, isSelected && { color: phaseColor }]}>
                    {food.name}
                  </Text>
                  <Text style={styles.foodDetail}>{food.detail}</Text>
                </View>
                <Ionicons
                  name={isSelected ? "checkmark-circle" : "add-circle-outline"}
                  size={22}
                  color={isSelected ? phaseColor : Colors.grayLight}
                />
              </Pressable>
            );
          })}
        </Animated.View>
      )}
    </View>
  );
}

function IngredientSearch({
  phaseColor,
  onSelect,
  selectedIngredients,
}: {
  phaseColor: string;
  onSelect: (name: string) => void;
  selectedIngredients: string[];
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(
    (text: string) => {
      setQuery(text);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (text.trim().length < 2) {
        setResults([]);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const baseUrl = getApiUrl();
          const url = new URL("/api/food-search", baseUrl);
          url.searchParams.set("query", text.trim());
          const res = await fetch(url.toString());
          const data = await res.json();
          setResults(data.foods || []);
        } catch {
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, 350);
    },
    [],
  );

  const topNutrients = (nutrients: FoodSearchResult["nutrients"]) =>
    nutrients
      .filter((n) => !["Calories", "Carbs", "Fat", "Protein", "Sodium"].includes(n.name))
      .slice(0, 3);

  return (
    <View style={styles.searchContainer}>
      <View style={[styles.searchBar, focused && { borderColor: phaseColor }]}>
        <Ionicons name="search" size={18} color={focused ? phaseColor : Colors.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search any ingredient..."
          placeholderTextColor={Colors.grayLight}
          value={query}
          onChangeText={search}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          returnKeyType="search"
        />
        {loading && <ActivityIndicator size="small" color={phaseColor} />}
        {query.length > 0 && !loading && (
          <Pressable
            onPress={() => {
              setQuery("");
              setResults([]);
            }}
          >
            <Ionicons name="close-circle" size={18} color={Colors.gray} />
          </Pressable>
        )}
      </View>

      {results.length > 0 && (
        <Animated.View entering={FadeIn.duration(150)} style={styles.searchResults}>
          {results.map((food) => {
            const isSelected = selectedIngredients.includes(food.name);
            const highlights = topNutrients(food.nutrients);
            return (
              <Pressable
                key={food.fdcId}
                onPress={() => {
                  Haptics.selectionAsync();
                  onSelect(food.name);
                  setQuery("");
                  setResults([]);
                }}
                style={({ pressed }) => [
                  styles.searchResultItem,
                  isSelected && { backgroundColor: phaseColor + "10" },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.searchResultName} numberOfLines={1}>
                    {food.name}
                  </Text>
                  {highlights.length > 0 && (
                    <View style={styles.nutrientBadges}>
                      {highlights.map((n, j) => (
                        <View
                          key={j}
                          style={[styles.nutrientBadge, { backgroundColor: phaseColor + "14" }]}
                        >
                          <Text style={[styles.nutrientBadgeText, { color: phaseColor }]}>
                            {n.name} {n.value}{n.unit}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                <Ionicons
                  name={isSelected ? "checkmark-circle" : "add-circle-outline"}
                  size={20}
                  color={isSelected ? phaseColor : Colors.grayLight}
                />
              </Pressable>
            );
          })}
        </Animated.View>
      )}
    </View>
  );
}

export function NutritionTab({ phase, phaseColor, phaseColorLight, phaseName, cycleDay }: Props) {
  const { cycleData, setCycleData } = useCycle();
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([]);
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const phaseData = PHASE_NUTRIENTS[phase];
  const ingredientNames = selectedIngredients.map((i) => i.name);

  const toggleIngredient = (name: string, source: "suggested" | "search" = "suggested") => {
    setSelectedIngredients((prev) => {
      const exists = prev.find((i) => i.name === name);
      if (exists) return prev.filter((i) => i.name !== name);
      return [...prev, { name, source }];
    });
  };

  const generateRecipe = async () => {
    if (selectedIngredients.length === 0) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setGenerating(true);
    setGenError(null);
    setGeneratedRecipe(null);

    try {
      const baseUrl = getApiUrl();
      const url = new URL("/api/generate-recipe", baseUrl).toString();
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients: ingredientNames,
          phase,
          dietaryPreferences: cycleData.dietaryPreferences || [],
          allergies: cycleData.allergies || [],
        }),
        credentials: "include",
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setGeneratedRecipe(data.recipe);
    } catch {
      setGenError("Couldn't generate recipe. Tap to try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Animated.View entering={FadeInDown.duration(300)} style={styles.content}>
      <AIRecommendCard
        phase={phase}
        cycleDay={cycleDay}
        goal={cycleData?.goal}
        category="nutrition"
        accentColor={phaseColor}
        label={`Personalized nutrition for your ${phaseName} phase`}
        dietaryPreferences={cycleData.dietaryPreferences}
        allergies={cycleData.allergies}
      />

      {/* Nutrient Overview Hero */}
      <View style={[styles.heroCard, { backgroundColor: phaseColorLight }]}>
        <Text style={[styles.heroLabel, { color: phaseColor }]}>What Your Body Needs Now</Text>
        <Text style={styles.heroHeadline}>{phaseData.headline}</Text>
        <Text style={styles.heroDescription}>{phaseData.description}</Text>
        <View style={styles.heroNutrientRow}>
          {phaseData.nutrients.slice(0, 4).map((n) => (
            <View key={n.id} style={[styles.heroNutrientChip, { backgroundColor: phaseColor + "18" }]}>
              <Ionicons name={n.icon as any} size={14} color={phaseColor} />
              <Text style={[styles.heroNutrientText, { color: phaseColor }]}>{n.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Expandable Nutrient Cards */}
      <Text style={styles.sectionTitle}>Key Nutrients</Text>
      <Text style={styles.sectionSub}>
        Tap each nutrient to see foods rich in it — select ingredients to build your recipe
      </Text>

      {phaseData.nutrients.map((nutrient) => (
        <NutrientCard
          key={nutrient.id}
          nutrient={nutrient}
          phaseColor={phaseColor}
          onSelectFood={(name) => toggleIngredient(name, "suggested")}
          selectedIngredients={ingredientNames}
          dietaryPreferences={cycleData.dietaryPreferences || []}
          allergies={cycleData.allergies || []}
        />
      ))}

      {/* Minimize Section */}
      <View style={styles.avoidSection}>
        <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Minimize This Phase</Text>
        <View style={styles.avoidGrid}>
          {phaseData.avoid.map((item, i) => (
            <View key={i} style={styles.avoidChip}>
              <Ionicons name="close-circle" size={14} color="#C0392B" />
              <Text style={styles.avoidText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Build Your Recipe Section */}
      <View style={styles.recipeBuilderSection}>
        <LinearGradient
          colors={[phaseColor + "12", phaseColor + "06"]}
          style={styles.recipeBuilderGradient}
        >
          <View style={styles.recipeBuilderHeader}>
            <View style={[styles.recipeBuilderIcon, { backgroundColor: phaseColor }]}>
              <Ionicons name="restaurant" size={20} color={Colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.recipeBuilderTitle}>Build Your Recipe</Text>
              <Text style={styles.recipeBuilderSub}>
                Pick ingredients from nutrients above or search for any food
              </Text>
            </View>
          </View>

          {/* Search Bar */}
          <IngredientSearch
            phaseColor={phaseColor}
            onSelect={(name) => toggleIngredient(name, "search")}
            selectedIngredients={ingredientNames}
          />

          {/* Selected Ingredients */}
          {selectedIngredients.length > 0 && (
            <View style={styles.selectedSection}>
              <Text style={[styles.selectedLabel, { color: phaseColor }]}>
                Selected ({selectedIngredients.length})
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectedScroll}
              >
                {selectedIngredients.map((ing, i) => (
                  <Pressable
                    key={i}
                    onPress={() => toggleIngredient(ing.name)}
                    style={[styles.selectedChip, { backgroundColor: phaseColor + "18", borderColor: phaseColor + "40" }]}
                  >
                    <Text style={[styles.selectedChipText, { color: phaseColor }]}>{ing.name}</Text>
                    <Ionicons name="close" size={14} color={phaseColor} />
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Generate Button */}
          <Pressable
            onPress={generateRecipe}
            disabled={selectedIngredients.length === 0 || generating}
            style={({ pressed }) => [
              styles.generateBtn,
              {
                backgroundColor: selectedIngredients.length > 0 ? phaseColor : Colors.grayLight,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            {generating ? (
              <>
                <ActivityIndicator size="small" color={Colors.white} />
                <Text style={styles.generateBtnText}>Generating your recipe...</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles" size={18} color={Colors.white} />
                <Text style={styles.generateBtnText}>
                  {selectedIngredients.length === 0
                    ? "Select ingredients first"
                    : `Generate Recipe with ${selectedIngredients.length} ingredient${selectedIngredients.length > 1 ? "s" : ""}`}
                </Text>
              </>
            )}
          </Pressable>

          {genError && (
            <Pressable onPress={generateRecipe} style={styles.errorRow}>
              <Ionicons name="alert-circle" size={16} color="#C0392B" />
              <Text style={styles.errorText}>{genError}</Text>
            </Pressable>
          )}
        </LinearGradient>
      </View>

      {/* Generated Recipe Display */}
      {generatedRecipe && (
        <Animated.View entering={FadeInDown.duration(400)}>
          <View style={[styles.generatedRecipe, { borderLeftColor: phaseColor }]}>
            <View style={styles.generatedHeader}>
              <View style={[styles.generatedIconWrap, { backgroundColor: phaseColor + "18" }]}>
                <Ionicons name="sparkles" size={24} color={phaseColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.generatedLabel}>AI-Generated Recipe</Text>
                <Text style={styles.generatedName}>{generatedRecipe.name}</Text>
                <View style={styles.generatedTimeBadge}>
                  <Ionicons name="time-outline" size={12} color={phaseColor} />
                  <Text style={[styles.generatedTime, { color: phaseColor }]}>
                    {generatedRecipe.prepTime} min
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.generatedDesc}>{generatedRecipe.description}</Text>

            <View style={[styles.phaseWhyBadge, { backgroundColor: phaseColor + "12" }]}>
              <Ionicons name="heart" size={14} color={phaseColor} />
              <Text style={[styles.phaseWhyText, { color: phaseColor }]}>
                {generatedRecipe.phaseWhy}
              </Text>
            </View>

            <View style={[styles.recipeBox, { backgroundColor: phaseColor + "10" }]}>
              <Text style={[styles.recipeBoxLabel, { color: phaseColor }]}>Ingredients</Text>
              {generatedRecipe.ingredients.map((ing, j) => (
                <View key={j} style={styles.recipeBoxRow}>
                  <View style={[styles.recipeBoxDot, { backgroundColor: phaseColor }]} />
                  <Text style={styles.recipeBoxText}>{ing}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.recipeBox, { backgroundColor: phaseColor + "08", marginTop: 8 }]}>
              <Text style={[styles.recipeBoxLabel, { color: phaseColor }]}>Steps</Text>
              {generatedRecipe.steps.map((step, j) => (
                <View key={j} style={styles.recipeBoxRow}>
                  <Text
                    style={[
                      styles.recipeBoxText,
                      { fontFamily: "Manrope_600SemiBold", color: phaseColor, minWidth: 22 },
                    ]}
                  >
                    {j + 1}.
                  </Text>
                  <Text style={[styles.recipeBoxText, { flex: 1 }]}>{step}</Text>
                </View>
              ))}
            </View>

            {generatedRecipe.tip && (
              <View style={styles.tipRow}>
                <Ionicons name="bulb-outline" size={14} color={phaseColor} />
                <Text style={styles.tipText}>{generatedRecipe.tip}</Text>
              </View>
            )}

            <Pressable
              onPress={generateRecipe}
              style={[styles.regenerateBtn, { borderColor: phaseColor + "40" }]}
            >
              <Ionicons name="refresh" size={16} color={phaseColor} />
              <Text style={[styles.regenerateBtnText, { color: phaseColor }]}>
                Generate Another Recipe
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 28 },

  // Hero
  heroCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 22,
    marginBottom: 28,
  },
  heroLabel: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  heroHeadline: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 24,
    color: Colors.burgundy,
    marginBottom: 10,
  },
  heroDescription: {
    fontFamily: "Manrope_400Regular",
    fontSize: 14,
    color: Colors.grayDark,
    lineHeight: 22,
    marginBottom: 16,
  },
  heroNutrientRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  heroNutrientChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 50,
  },
  heroNutrientText: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 12,
  },

  // Section Headers
  sectionTitle: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 17,
    color: "#FFB3C6",
    paddingHorizontal: 20,
    marginBottom: 6,
  },
  sectionSub: {
    fontFamily: "Manrope_400Regular",
    fontSize: 13,
    color: "rgba(252,228,236,0.75)",
    paddingHorizontal: 20,
    marginBottom: 20,
    lineHeight: 20,
  },

  // Nutrient Cards
  nutrientCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: Colors.blushLight,
    borderWidth: 1,
    overflow: "hidden",
  },
  nutrientHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  nutrientIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  nutrientName: {
    fontFamily: "Manrope_700Bold",
    fontSize: 16,
    color: Colors.burgundy,
  },
  nutrientWhy: {
    fontFamily: "Manrope_400Regular",
    fontSize: 12,
    color: Colors.grayDark,
    lineHeight: 18,
    marginTop: 2,
  },

  // Food List (expanded)
  foodList: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.blushMid,
  },
  foodListLabel: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    marginTop: 12,
    marginBottom: 8,
  },
  foodItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 2,
  },
  foodEmoji: { fontSize: 22, width: 30, textAlign: "center" },
  foodName: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 14,
    color: Colors.burgundy,
  },
  foodDetail: {
    fontFamily: "Manrope_400Regular",
    fontSize: 12,
    color: Colors.gray,
    marginTop: 1,
  },

  // Avoid
  avoidSection: { marginTop: 28 },
  avoidGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
  },
  avoidChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.blushLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 50,
  },
  avoidText: {
    fontFamily: "Manrope_500Medium",
    fontSize: 12,
    color: Colors.hotPink,
  },

  // Recipe Builder
  recipeBuilderSection: {
    marginHorizontal: 20,
    marginTop: 32,
    borderRadius: 20,
    overflow: "hidden",
  },
  recipeBuilderGradient: {
    padding: 20,
  },
  recipeBuilderHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  recipeBuilderIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  recipeBuilderTitle: {
    fontFamily: "Manrope_700Bold",
    fontSize: 18,
    color: Colors.blushLight,
  },
  recipeBuilderSub: {
    fontFamily: "Manrope_400Regular",
    fontSize: 12,
    color: Colors.blushMid,
    marginTop: 2,
  },

  // Search
  searchContainer: { marginBottom: 16 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.blushLight,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "web" ? 12 : 10,
    borderWidth: 1.5,
    borderColor: Colors.blushMid,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Manrope_500Medium",
    fontSize: 14,
    color: Colors.burgundy,
    padding: 0,
  },
  searchResults: {
    backgroundColor: Colors.blushLight,
    borderRadius: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.blushMid,
    maxHeight: 280,
    overflow: "hidden",
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.blushMid,
  },
  searchResultName: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 13,
    color: Colors.burgundy,
    textTransform: "capitalize",
  },
  nutrientBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 4,
  },
  nutrientBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  nutrientBadgeText: {
    fontFamily: "Manrope_500Medium",
    fontSize: 10,
  },

  // Selected Ingredients
  selectedSection: { marginBottom: 16 },
  selectedLabel: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 12,
    marginBottom: 8,
  },
  selectedScroll: { gap: 8 },
  selectedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1,
  },
  selectedChipText: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 12,
  },

  // Generate Button
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  generateBtnText: {
    fontFamily: "Manrope_700Bold",
    fontSize: 15,
    color: Colors.white,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    justifyContent: "center",
  },
  errorText: {
    fontFamily: "Manrope_500Medium",
    fontSize: 12,
    color: "#C0392B",
  },

  // Generated Recipe
  generatedRecipe: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
    backgroundColor: Colors.blushLight,
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  generatedHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
  },
  generatedIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  generatedLabel: {
    fontFamily: "Manrope_500Medium",
    fontSize: 11,
    color: Colors.gray,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  generatedName: {
    fontFamily: "Manrope_700Bold",
    fontSize: 18,
    color: Colors.burgundy,
    marginTop: 2,
  },
  generatedTimeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  generatedTime: {
    fontFamily: "Manrope_500Medium",
    fontSize: 12,
  },
  generatedDesc: {
    fontFamily: "Manrope_400Regular",
    fontSize: 13,
    color: Colors.grayDark,
    lineHeight: 20,
    marginBottom: 12,
  },
  phaseWhyBadge: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  phaseWhyText: {
    fontFamily: "Manrope_500Medium",
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  recipeBox: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  recipeBoxLabel: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  recipeBoxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  recipeBoxDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  recipeBoxText: {
    fontFamily: "Manrope_400Regular",
    fontSize: 13,
    color: Colors.grayDark,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#FFF8E7",
    borderRadius: 10,
    padding: 10,
  },
  tipText: {
    fontFamily: "Manrope_400Regular",
    fontSize: 12,
    color: Colors.grayDark,
    lineHeight: 18,
    flex: 1,
  },
  regenerateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  regenerateBtnText: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 13,
  },
});

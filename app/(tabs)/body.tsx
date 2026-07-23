import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Image,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useCycle } from "@/contexts/CycleContext";
import Colors from "@/constants/colors";
import { WaveHeader } from "@/components/WaveHeader";
import { AIRecommendCard } from "@/components/AIRecommendCard";
import { RECIPES, filterRecipes, getRecipesForPhase, type Recipe } from "@/data/phase-content";

type FoodIconDef = { type: "icon"; name: string } | { type: "image"; source: ReturnType<typeof require> } | { type: "emoji"; char: string };

const FOOD_ICON: Record<string, FoodIconDef> = {
  "Dark Leafy Greens": { type: "icon", name: "leaf" },
  "Wild-Caught Salmon": { type: "icon", name: "fish" },
  "Dark Chocolate (70%+)": { type: "emoji", char: "🍫" },
  "Kidney Beans": { type: "icon", name: "heart" },
  "Ginger Tea": { type: "icon", name: "coffee" },
  "Fermented Foods": { type: "icon", name: "flask" },
  "Flaxseeds": { type: "icon", name: "leaf" },
  "Broccoli & Cauliflower": { type: "icon", name: "sprout" },
  "Quinoa": { type: "icon", name: "heart" },
  "Eggs": { type: "icon", name: "egg" },
  "Colorful Vegetables": { type: "icon", name: "food-apple" },
  "Raspberries & Blueberries": { type: "icon", name: "fruit-cherries" },
  "Chickpeas & Lentils": { type: "icon", name: "heart" },
  "Almonds & Walnuts": { type: "icon", name: "star-four-points" },
  "Cucumber & Celery": { type: "icon", name: "sprout" },
  "Sweet Potato": { type: "icon", name: "food-variant" },
  "Pumpkin Seeds": { type: "icon", name: "star" },
  "Banana": { type: "icon", name: "food-apple" },
  "Turkey & Chicken": { type: "icon", name: "food-drumstick" },
  "Chamomile Tea": { type: "icon", name: "coffee" },
};

const RECIPE_ICON: Record<string, FoodIconDef> = {
  "🍲": { type: "icon", name: "food-variant" },
  "🐟": { type: "icon", name: "fish" },
  "🍫": { type: "emoji", char: "🍫" },
  "🥗": { type: "icon", name: "food-variant" },
  "🥚": { type: "icon", name: "egg" },
  "🍜": { type: "icon", name: "food-variant" },
  "🌈": { type: "icon", name: "food-apple" },
  "🫐": { type: "icon", name: "fruit-cherries" },
  "🌿": { type: "icon", name: "leaf" },
  "🍠": { type: "icon", name: "food-variant" },
  "🍌": { type: "icon", name: "food-apple" },
  "☕": { type: "icon", name: "coffee" },
};

const WORKOUTS = {
  menstrual: [
    { title: "Yin Yoga for Rest", type: "Yoga", duration: "30 min", level: "Gentle", link: "https://www.youtube.com/results?search_query=yin+yoga+period+cramps+women+female+influencer" },
    { title: "Gentle Walk & Breathe", type: "Cardio", duration: "20 min", level: "Easy", link: "https://www.youtube.com/results?search_query=gentle+walking+workout+women+female+fitness+influencer" },
    { title: "Restorative Stretching", type: "Flexibility", duration: "25 min", level: "Gentle", link: "https://www.youtube.com/results?search_query=restorative+yoga+stretching+menstrual+phase+women" },
  ],
  follicular: [
    { title: "Full Body Strength", type: "Strength", duration: "40 min", level: "Moderate", link: "https://www.youtube.com/results?search_query=full+body+strength+workout+women+female+fitness+influencer" },
    { title: "HIIT Cardio Blast", type: "HIIT", duration: "25 min", level: "High", link: "https://www.youtube.com/results?search_query=hiit+cardio+workout+women+female+fitness+influencer" },
    { title: "Dance Cardio Flow", type: "Cardio", duration: "30 min", level: "Moderate", link: "https://www.youtube.com/results?search_query=dance+cardio+workout+women+female+fitness+influencer" },
  ],
  ovulatory: [
    { title: "Power HIIT Circuit", type: "HIIT", duration: "35 min", level: "Intense", link: "https://www.youtube.com/results?search_query=power+hiit+circuit+training+women+female+fitness" },
    { title: "Heavy Strength Day", type: "Strength", duration: "45 min", level: "Intense", link: "https://www.youtube.com/results?search_query=heavy+strength+training+women+female+fitness+influencer" },
    { title: "Sprint Intervals", type: "Cardio", duration: "20 min", level: "High", link: "https://www.youtube.com/results?search_query=sprint+interval+cardio+women+female+fitness+influencer" },
  ],
  luteal: [
    { title: "Pilates Core Flow", type: "Pilates", duration: "35 min", level: "Moderate", link: "https://www.youtube.com/results?search_query=pilates+core+workout+women+female+fitness+influencer" },
    { title: "Low-Impact Strength", type: "Strength", duration: "30 min", level: "Moderate", link: "https://www.youtube.com/results?search_query=low+impact+strength+training+women+female+fitness+influencer" },
    { title: "Yoga Flow & Balance", type: "Yoga", duration: "30 min", level: "Gentle", link: "https://www.youtube.com/results?search_query=yoga+flow+balance+women+female+fitness+influencer" },
  ],
};


const NUTRITION = {
  menstrual: {
    focus: "Iron, Omega-3s & Anti-Inflammatory",
    why: "Support blood loss recovery and reduce cramping with nourishing foods.",
    foods: [
      { name: "Dark Leafy Greens", benefit: "Iron replenishment" },
      { name: "Wild-Caught Salmon", benefit: "Omega-3, anti-inflammatory" },
      { name: "Dark Chocolate (70%+)", benefit: "Magnesium & mood support" },
      { name: "Kidney Beans", benefit: "Iron & protein" },
      { name: "Ginger Tea", benefit: "Anti-cramping, warming" },
    ],
    avoid: ["Alcohol", "Excess caffeine", "Processed foods", "Salty snacks"],
    recipes: [
      {
        name: "Warm Lentil & Spinach Soup",
        time: "25 min",
        emoji: "🍲",
        description: "A deeply nourishing iron-rich soup to replenish what your body loses during menstruation.",
        ingredients: ["1 cup red lentils", "2 cups baby spinach", "1 can diced tomatoes", "1 tsp turmeric", "1 tsp cumin", "4 cups veggie broth", "2 garlic cloves", "1 tsp ginger"],
        tip: "Add a squeeze of lemon before serving to boost iron absorption.",
      },
      {
        name: "Salmon & Roasted Beet Bowl",
        time: "30 min",
        emoji: "🐟",
        description: "Omega-3 rich salmon over roasted beets and greens — anti-inflammatory and deeply satisfying.",
        ingredients: ["1 salmon fillet", "2 roasted beets", "1 cup arugula", "¼ avocado", "1 tbsp tahini", "Lemon + olive oil dressing"],
        tip: "Beets support liver detox and blood building — perfect for this phase.",
      },
      {
        name: "Dark Chocolate Chia Pudding",
        time: "5 min + chill",
        emoji: "🍫",
        description: "A magnesium-packed treat that satisfies chocolate cravings while supporting your mood.",
        ingredients: ["3 tbsp chia seeds", "1 cup almond milk", "1 tbsp raw cacao powder", "1 tsp honey", "Pinch of sea salt", "Berries to top"],
        tip: "Make the night before for an easy morning mood booster.",
      },
    ],
  },
  follicular: {
    focus: "Phytoestrogens & Probiotic Foods",
    why: "Support rising estrogen with fermented foods and plant-based compounds.",
    foods: [
      { name: "Fermented Foods", benefit: "Gut health, estrogen metabolism" },
      { name: "Flaxseeds", benefit: "Phytoestrogens & fiber" },
      { name: "Broccoli & Cauliflower", benefit: "Estrogen metabolism support" },
      { name: "Quinoa", benefit: "Complete protein, B vitamins" },
      { name: "Eggs", benefit: "Choline for liver detox" },
    ],
    avoid: ["Processed sugar", "Trans fats", "Excess alcohol"],
    recipes: [
      {
        name: "Spring Quinoa Power Bowl",
        time: "20 min",
        emoji: "🥗",
        description: "A bright, energizing bowl packed with complete proteins and estrogen-supporting plant compounds.",
        ingredients: ["1 cup cooked quinoa", "Handful edamame", "Sliced radish & cucumber", "2 tbsp flaxseeds", "Avocado", "Lemon-tahini dressing"],
        tip: "Flaxseeds are the most potent food source of phytoestrogens — add them daily this phase.",
      },
      {
        name: "Egg & Broccoli Frittata",
        time: "20 min",
        emoji: "🥚",
        description: "An easy skillet frittata loaded with cruciferous veg to support healthy estrogen clearance.",
        ingredients: ["4 eggs", "1 cup broccoli florets", "¼ cup feta", "Handful spinach", "1 shallot", "Olive oil", "Fresh herbs"],
        tip: "Cruciferous vegetables contain DIM, which helps your liver process estrogen efficiently.",
      },
      {
        name: "Miso Soup with Tofu & Seaweed",
        time: "10 min",
        emoji: "🍜",
        description: "A warming probiotic-rich broth that feeds your gut microbiome and supports hormone balance.",
        ingredients: ["2 tbsp white miso paste", "Silken tofu cubes", "Dried wakame seaweed", "2 green onions", "3 cups hot water (not boiling)"],
        tip: "Never boil miso — heat kills the beneficial bacteria. Add it at the end.",
      },
    ],
  },
  ovulatory: {
    focus: "Anti-Inflammatory & Fiber-Rich",
    why: "Support peak energy and assist natural detoxification processes.",
    foods: [
      { name: "Colorful Vegetables", benefit: "Antioxidants, fiber" },
      { name: "Raspberries & Blueberries", benefit: "Anti-inflammatory" },
      { name: "Chickpeas & Lentils", benefit: "Fiber for estrogen clearance" },
      { name: "Almonds & Walnuts", benefit: "Healthy fats, vitamin E" },
      { name: "Cucumber & Celery", benefit: "Hydration & cooling" },
    ],
    avoid: ["Heavy processed foods", "Refined carbs"],
    recipes: [
      {
        name: "Rainbow Chickpea Salad",
        time: "15 min",
        emoji: "🌈",
        description: "A vibrant, fiber-packed salad that supports estrogen clearance at peak ovulation.",
        ingredients: ["1 can chickpeas", "Cherry tomatoes", "Yellow bell pepper", "Cucumber", "Red onion", "Fresh mint", "Lemon-olive oil dressing"],
        tip: "Aim for 5 different colors in this salad — each color provides different antioxidants.",
      },
      {
        name: "Berry & Walnut Smoothie Bowl",
        time: "5 min",
        emoji: "🫐",
        description: "Antioxidant-dense and cooling — perfect for your body's peak energy phase.",
        ingredients: ["1 cup frozen mixed berries", "½ banana", "¼ cup walnuts", "1 tbsp almond butter", "Almond milk", "Coconut flakes & seeds to top"],
        tip: "Walnuts are rich in vitamin E which supports follicle health around ovulation.",
      },
      {
        name: "Zucchini Noodles with Pesto & Lentils",
        time: "25 min",
        emoji: "🌿",
        description: "Light, fresh pasta alternative with plant protein and detox-supporting green herbs.",
        ingredients: ["2 zucchinis spiralized", "½ cup green lentils", "3 tbsp basil pesto", "Cherry tomatoes", "Pine nuts", "Parmesan (optional)"],
        tip: "Basil is rich in vitamin K and anti-inflammatory compounds — use it generously.",
      },
    ],
  },
  luteal: {
    focus: "Magnesium, Complex Carbs & Vitamin B6",
    why: "Ease PMS, stabilize mood, and support progesterone with these key nutrients.",
    foods: [
      { name: "Sweet Potato", benefit: "Complex carbs, mood stabilizer" },
      { name: "Pumpkin Seeds", benefit: "Magnesium & zinc" },
      { name: "Banana", benefit: "B6, mood & serotonin support" },
      { name: "Turkey & Chicken", benefit: "Tryptophan for serotonin" },
      { name: "Chamomile Tea", benefit: "Calming, anti-spasmodic" },
    ],
    avoid: ["Caffeine", "Sugar", "Alcohol", "Excess salt"],
    recipes: [
      {
        name: "Sweet Potato & Turkey Nourish Bowl",
        time: "35 min",
        emoji: "🍠",
        description: "A grounding, serotonin-boosting bowl that eases PMS cravings with stable energy.",
        ingredients: ["1 roasted sweet potato", "150g ground turkey", "1 cup kale", "¼ cup pumpkin seeds", "½ avocado", "Tahini drizzle"],
        tip: "Turkey contains tryptophan which converts to serotonin — your mood-regulating hormone.",
      },
      {
        name: "Banana Oat Energy Balls",
        time: "10 min + chill",
        emoji: "🍌",
        description: "No-bake B6-rich snacks that satisfy sweet cravings and stabilize blood sugar.",
        ingredients: ["1 ripe banana", "1 cup rolled oats", "2 tbsp almond butter", "1 tbsp pumpkin seeds", "1 tsp cinnamon", "Dark chocolate chips"],
        tip: "Cinnamon helps regulate blood sugar spikes — especially important during the luteal phase.",
      },
      {
        name: "Chamomile Golden Milk Latte",
        time: "5 min",
        emoji: "☕",
        description: "A deeply calming anti-inflammatory drink to ease tension and support sleep in your luteal phase.",
        ingredients: ["1 chamomile tea bag", "1 cup oat milk", "½ tsp turmeric", "Pinch black pepper", "1 tsp honey", "¼ tsp cinnamon"],
        tip: "Black pepper increases turmeric absorption by 2000% — always pair them together.",
      },
    ],
  },
};

type Tab = "movement" | "nutrition";

export default function BodyScreen() {
  const insets = useSafeAreaInsets();
  const { phaseInfo, cycleData } = useCycle();
  const [activeTab, setActiveTab] = useState<Tab>("movement");
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const phase = phaseInfo?.phase || "follicular";
  const phaseColor = phaseInfo?.color || Colors.hotPink;
  const phaseColorLight = phaseInfo?.colorLight || Colors.blushLight;
  const workouts = WORKOUTS[phase];
  const nutrition = NUTRITION[phase];

  const phaseRecipes = getRecipesForPhase(phase);
  const filteredRecipes = filterRecipes(
    phaseRecipes,
    cycleData.dietaryPreferences || [],
    cycleData.allergies || [],
  );
  const hasDietaryFilters = (cycleData.dietaryPreferences?.length ?? 0) > 0 || (cycleData.allergies?.length ?? 0) > 0;

  const typeColors: Record<string, string> = {
    Yoga: "#C0004A",
    HIIT: "#B52035",
    Strength: "#D4217A",
    Cardio: "#E8006A",
    Pilates: "#C0206E",
    Flexibility: "#A82030",
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad + 100 }}
      >
        <WaveHeader topPad={topPad} phaseColor={phaseColor} showLogo>
          <Text style={styles.headerPhase}>You're in your {phaseInfo?.phaseName || "Follicular"} Phase</Text>
          <Text style={styles.headerTitle}>Body</Text>
          <Text style={styles.headerSub}>Movement & Nutrition</Text>
        </WaveHeader>

        <View style={styles.tabRow}>
          {(["movement", "nutrition"] as Tab[]).map((t) => (
            <Pressable
              key={t}
              style={[styles.tab, activeTab === t && { ...styles.tabActive, backgroundColor: phaseColor }]}
              onPress={() => {
                setActiveTab(t);
                Haptics.selectionAsync();
              }}
            >
              <Ionicons
                name={t === "movement" ? "fitness" : "nutrition"}
                size={16}
                color={activeTab === t ? Colors.white : Colors.gray}
              />
              <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
                {t === "movement" ? "Movement" : "Nutrition"}
              </Text>
            </Pressable>
          ))}
        </View>

        {activeTab === "movement" ? (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.content}>
            <AIRecommendCard
              phase={phase}
              cycleDay={phaseInfo?.cycleDay ?? 1}
              goal={cycleData?.goal}
              category="movement"
              accentColor={phaseColor}
              label={`Personalized movement for your ${phaseInfo?.phaseName ?? ""} phase`}
              dietaryPreferences={cycleData.dietaryPreferences}
              allergies={cycleData.allergies}
            />
            <Text style={styles.sectionTitle}>On-Demand Workouts</Text>
            <Text style={styles.sectionSub}>
              Curated for your {phaseInfo?.phaseName?.toLowerCase()} phase — when your body thrives with this type of training
            </Text>
            {workouts.map((w, i) => {
              const typeColor = typeColors[w.type] || phaseColor;
              return (
                <Pressable
                  key={i}
                  style={({ pressed }) => [styles.workoutCard, pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    WebBrowser.openBrowserAsync(w.link);
                  }}
                >
                  <LinearGradient
                    colors={["#fce4ec", "#FFD6E3"]}
                    style={styles.workoutCardGradient}
                  >
                    <View style={styles.workoutTop}>
                      <View style={[styles.workoutTypeBadge, { backgroundColor: typeColor }]}>
                        <Text style={styles.workoutTypeText}>{w.type}</Text>
                      </View>
                      <View style={[styles.levelBadge, { backgroundColor: typeColor + "22" }]}>
                        <Text style={[styles.levelText, { color: typeColor }]}>{w.level}</Text>
                      </View>
                    </View>
                    <Text style={styles.workoutTitle}>{w.title}</Text>
                    <View style={styles.workoutMeta}>
                      <Ionicons name="time-outline" size={14} color={Colors.gray} />
                      <Text style={styles.workoutDuration}>{w.duration}</Text>
                      <View style={{ flex: 1 }} />
                      <View style={[styles.watchBtn, { backgroundColor: typeColor }]}>
                        <Ionicons name="play" size={12} color={Colors.white} />
                        <Text style={[styles.watchBtnText, { color: Colors.white }]}>Watch</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </Pressable>
              );
            })}
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.content}>
            <AIRecommendCard
              phase={phase}
              cycleDay={phaseInfo?.cycleDay ?? 1}
              goal={cycleData?.goal}
              category="nutrition"
              accentColor={phaseColor}
              label={`Personalized nutrition for your ${phaseInfo?.phaseName ?? ""} phase`}
              dietaryPreferences={cycleData.dietaryPreferences}
              allergies={cycleData.allergies}
            />

            <View style={[styles.nutritionHero, { backgroundColor: phaseColorLight }]}>
              <Text style={[styles.nutritionFocusLabel, { color: phaseColor }]}>Focus Area</Text>
              <Text style={styles.nutritionFocus}>{nutrition.focus}</Text>
              <Text style={styles.nutritionWhy}>{nutrition.why}</Text>
            </View>

            <Text style={styles.sectionTitle}>Phase Foods</Text>
            {nutrition.foods.map((food, i) => (
              <View key={i} style={styles.foodRow}>
                <View style={[styles.foodIcon, { backgroundColor: Colors.blushLight }]}>
                  {(() => {
                    const def = FOOD_ICON[food.name] ?? { type: "icon" as const, name: "leaf" };
                    if (def.type === "emoji") return <Text style={{ fontSize: 20 }}>{def.char}</Text>;
                    if (def.type === "image") return <Image source={def.source} style={{ width: 22, height: 22 }} resizeMode="contain" />;
                    return <MaterialCommunityIcons name={def.name as any} size={20} color={Colors.hotPink} />;
                  })()}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.foodName}>{food.name}</Text>
                  <Text style={styles.foodBenefit}>{food.benefit}</Text>
                </View>
              </View>
            ))}

            <View style={styles.avoidSection}>
              <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Minimize This Phase</Text>
              <View style={styles.avoidGrid}>
                {nutrition.avoid.map((item, i) => (
                  <View key={i} style={styles.avoidChip}>
                    <Ionicons name="close-circle" size={14} color="#C0392B" />
                    <Text style={styles.avoidText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Phase Recipes</Text>
            <Text style={styles.sectionSub}>
              Nourishing meals crafted for your {phaseInfo?.phaseName?.toLowerCase()} phase
            </Text>
            {nutrition.recipes.map((recipe, i) => (
              <View
                key={i}
                style={[styles.recipeCard, { borderLeftColor: phaseColor }]}
              >
                <View style={styles.recipeHeader}>
                  <View style={[styles.recipeEmojiWrap, { backgroundColor: Colors.blushLight }]}>
                    {(() => {
                      const def = RECIPE_ICON[recipe.emoji] ?? { type: "icon" as const, name: "food-variant" };
                      if (def.type === "emoji") return <Text style={{ fontSize: 28 }}>{def.char}</Text>;
                      if (def.type === "image") return <Image source={def.source} style={{ width: 28, height: 28 }} resizeMode="contain" />;
                      return <MaterialCommunityIcons name={def.name as any} size={28} color={Colors.hotPink} />;
                    })()}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recipeName}>{recipe.name}</Text>
                    <View style={styles.recipeTimeBadge}>
                      <Ionicons name="time-outline" size={12} color={phaseColor} />
                      <Text style={[styles.recipeTime, { color: phaseColor }]}>{recipe.time}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.recipeDesc}>{recipe.description}</Text>
                <View style={[styles.ingredientsBox, { backgroundColor: phaseColor + "10" }]}>
                  <Text style={[styles.ingredientsLabel, { color: phaseColor }]}>Ingredients</Text>
                  <View style={styles.ingredientsList}>
                    {recipe.ingredients.map((ing, j) => (
                      <View key={j} style={styles.ingredientRow}>
                        <View style={[styles.ingredientDot, { backgroundColor: phaseColor }]} />
                        <Text style={styles.ingredientText}>{ing}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View style={styles.recipeTipRow}>
                  <Ionicons name="heart-outline" size={14} color={phaseColor} />
                  <Text style={styles.recipeTip}>{recipe.tip}</Text>
                </View>
              </View>
            ))}

            {/* Curated Recipes — filtered by dietary preferences */}
            {filteredRecipes.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 32 }]}>
                  {hasDietaryFilters ? "Recipes For Your Diet" : "More Phase Recipes"}
                </Text>
                <Text style={styles.sectionSub}>
                  {hasDietaryFilters
                    ? `Filtered for your preferences: ${[...(cycleData.dietaryPreferences || []), ...(cycleData.allergies || []).map(a => `no ${a}`)].join(", ")}`
                    : `${filteredRecipes.length} curated recipes for your ${phaseInfo?.phaseName?.toLowerCase()} phase`}
                </Text>
                {filteredRecipes.map((recipe) => (
                  <View
                    key={recipe.id}
                    style={[styles.recipeCard, { borderLeftColor: phaseColor }]}
                  >
                    <View style={styles.recipeHeader}>
                      <View style={[styles.recipeEmojiWrap, { backgroundColor: Colors.blushLight }]}>
                        <Ionicons name="restaurant" size={24} color={Colors.hotPink} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.recipeName}>{recipe.name}</Text>
                        <View style={styles.recipeTimeBadge}>
                          <Ionicons name="time-outline" size={12} color={phaseColor} />
                          <Text style={[styles.recipeTime, { color: phaseColor }]}>{recipe.prepTime} min</Text>
                        </View>
                      </View>
                    </View>
                    <Text style={styles.recipeDesc}>{recipe.description}</Text>
                    {recipe.dietTags.length > 0 && (
                      <View style={styles.dietTagRow}>
                        {recipe.dietTags.map((tag, j) => (
                          <View key={j} style={[styles.dietTag, { backgroundColor: phaseColor + "18" }]}>
                            <Text style={[styles.dietTagText, { color: phaseColor }]}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    <View style={[styles.ingredientsBox, { backgroundColor: phaseColor + "10" }]}>
                      <Text style={[styles.ingredientsLabel, { color: phaseColor }]}>Ingredients</Text>
                      <View style={styles.ingredientsList}>
                        {recipe.ingredients.map((ing, j) => (
                          <View key={j} style={styles.ingredientRow}>
                            <View style={[styles.ingredientDot, { backgroundColor: phaseColor }]} />
                            <Text style={styles.ingredientText}>{ing}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    <View style={[styles.ingredientsBox, { backgroundColor: phaseColor + "08", marginTop: 8 }]}>
                      <Text style={[styles.ingredientsLabel, { color: phaseColor }]}>Steps</Text>
                      <View style={styles.ingredientsList}>
                        {recipe.steps.map((step, j) => (
                          <View key={j} style={styles.ingredientRow}>
                            <Text style={[styles.ingredientText, { fontFamily: "Manrope_600SemiBold", color: phaseColor, minWidth: 18 }]}>{j + 1}.</Text>
                            <Text style={styles.ingredientText}>{step}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}

            {/* Protein CTA */}
            <Pressable
              style={({ pressed }) => [styles.proteinCta, pressed && { opacity: 0.9 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                WebBrowser.openBrowserAsync("https://www.rhythmrenew.com/product-page/rhythm-vanilla-protein-blend-cycle-supporting-nutrition");
              }}
            >
              <LinearGradient
                colors={[Colors.hotPink, Colors.hotPinkDark]}
                style={styles.proteinCtaGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View>
                  <Text style={styles.proteinCtaLabel}>Cycle-Supporting Nutrition</Text>
                  <Text style={styles.proteinCtaTitle}>Rhythm Vanilla Protein Blend</Text>
                  <Text style={styles.proteinCtaSub}>Formulated for every phase of your cycle</Text>
                </View>
                <View style={styles.proteinCtaBtn}>
                  <Text style={[styles.proteinCtaBtnText, { color: Colors.hotPink }]}>Shop Now</Text>
                  <Ionicons name="arrow-forward" size={14} color={Colors.hotPink} />
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.pageBg },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerPhase: { fontFamily: "Manrope_600SemiBold", fontSize: 18, color: "#610015", marginBottom: 2 },
  headerTitle: { fontFamily: "PlayfairDisplay_900Black", fontSize: 56, color: "#610015", fontStyle: "italic" },
  headerSub: { fontFamily: "Manrope_500Medium", fontSize: 16, color: "rgba(97,0,21,0.65)", marginTop: 4 },
  tabRow: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: Colors.blushLight,
    borderRadius: 50,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 50,
  },
  tabActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: { fontFamily: "Manrope_500Medium", fontSize: 14, color: Colors.gray },
  tabTextActive: { color: Colors.white, fontFamily: "Manrope_600SemiBold" },
  content: { paddingTop: 28 },
  sectionTitle: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 17,
    color: "#FFB3C6",
    paddingHorizontal: 20,
    marginBottom: 6,
  },
  sectionSub: { fontFamily: "Manrope_400Regular", fontSize: 13, color: "rgba(252,228,236,0.75)", paddingHorizontal: 20, marginBottom: 20, lineHeight: 20 },
  workoutCard: { marginHorizontal: 20, borderRadius: 20, overflow: "hidden", marginBottom: 12, borderWidth: 1, borderColor: "#FFB3C6" },
  workoutCardGradient: { padding: 20 },
  workoutTop: { flexDirection: "row", gap: 8, marginBottom: 12 },
  workoutTypeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50 },
  workoutTypeText: { fontFamily: "Manrope_600SemiBold", fontSize: 10, color: Colors.white, letterSpacing: 0.3 },
  levelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50 },
  levelText: { fontFamily: "Manrope_600SemiBold", fontSize: 10, letterSpacing: 0.3 },
  workoutTitle: { fontFamily: "Manrope_600SemiBold", fontSize: 17, color: Colors.burgundy, marginBottom: 12 },
  workoutMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  workoutDuration: { fontFamily: "Manrope_400Regular", fontSize: 13, color: Colors.gray },
  watchBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 50 },
  watchBtnText: { fontFamily: "Manrope_600SemiBold", fontSize: 11, color: Colors.white },
  nutritionHero: { marginHorizontal: 20, borderRadius: 20, padding: 22, marginBottom: 28 },
  nutritionFocusLabel: { fontFamily: "Manrope_600SemiBold", fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 },
  nutritionFocus: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 22, color: Colors.burgundy, marginBottom: 10 },
  nutritionWhy: { fontFamily: "Manrope_400Regular", fontSize: 14, color: Colors.grayDark, lineHeight: 22 },
  foodRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.blushMid },
  foodIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  foodName: { fontFamily: "Manrope_600SemiBold", fontSize: 14, color: Colors.blushLight },
  foodBenefit: { fontFamily: "Manrope_400Regular", fontSize: 12, color: Colors.blushMid, marginTop: 2 },
  avoidSection: { marginTop: 28 },
  avoidGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 20 },
  avoidChip: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: Colors.blushLight, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 50 },
  avoidText: { fontFamily: "Manrope_500Medium", fontSize: 12, color: Colors.hotPink },
  recipeCard: {
    marginHorizontal: 20,
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
  recipeHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 10 },
  recipeEmojiWrap: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  recipeName: { fontFamily: "Manrope_600SemiBold", fontSize: 16, color: Colors.burgundy, flex: 1 },
  recipeTimeBadge: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  recipeTime: { fontFamily: "Manrope_500Medium", fontSize: 12 },
  recipeDesc: { fontFamily: "Manrope_400Regular", fontSize: 13, color: Colors.grayDark, lineHeight: 20, marginBottom: 14 },
  ingredientsBox: { borderRadius: 12, padding: 14, marginBottom: 12 },
  ingredientsLabel: { fontFamily: "Manrope_600SemiBold", fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 10 },
  ingredientsList: { gap: 6 },
  ingredientRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  ingredientDot: { width: 6, height: 6, borderRadius: 3 },
  ingredientText: { fontFamily: "Manrope_400Regular", fontSize: 13, color: Colors.grayDark, flex: 1 },
  recipeTipRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: Colors.blushLight, borderRadius: 10, padding: 10 },
  recipeTip: { fontFamily: "Manrope_400Regular", fontSize: 12, color: Colors.grayDark, lineHeight: 18, flex: 1 },
  proteinCta: { marginHorizontal: 20, marginTop: 8, borderRadius: 20, overflow: "hidden" },
  proteinCtaGradient: { padding: 22, gap: 16 },
  proteinCtaLabel: { fontFamily: "Manrope_600SemiBold", fontSize: 10, color: "rgba(255,255,255,0.75)", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 4 },
  proteinCtaTitle: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 20, color: Colors.white, marginBottom: 4 },
  proteinCtaSub: { fontFamily: "Manrope_400Regular", fontSize: 13, color: "rgba(255,255,255,0.8)" },
  proteinCtaBtn: { backgroundColor: Colors.white, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 50, alignSelf: "flex-start" },
  proteinCtaBtnText: { fontFamily: "Manrope_700Bold", fontSize: 13 },
  dietTagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  dietTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50 },
  dietTagText: { fontFamily: "Manrope_500Medium", fontSize: 11, textTransform: "capitalize" },
});

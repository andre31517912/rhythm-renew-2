import type { Phase } from "@/contexts/CycleContext";

export interface NutrientFood {
  name: string;
  detail: string;
  emoji: string;
  tags?: string[];
  allergens?: string[];
}

export interface Nutrient {
  id: string;
  name: string;
  icon: string;
  why: string;
  foods: NutrientFood[];
}

export interface PhaseNutrientData {
  headline: string;
  description: string;
  avoid: string[];
  nutrients: Nutrient[];
}

export function filterFoodsByDiet(
  foods: NutrientFood[],
  dietaryPreferences: string[],
  allergies: string[],
): NutrientFood[] {
  return foods.filter((food) => {
    if (allergies.length > 0 && food.allergens) {
      const hasAllergen = food.allergens.some((a) =>
        allergies.includes(a.toLowerCase()),
      );
      if (hasAllergen) return false;
    }

    if (dietaryPreferences.length > 0 && food.tags) {
      const isAnimalProduct = !food.tags.some((t) =>
        ["vegan", "vegetarian"].includes(t),
      );
      if (
        isAnimalProduct &&
        dietaryPreferences.some((p) => ["vegan", "vegetarian"].includes(p))
      ) {
        if (dietaryPreferences.includes("vegan") && !food.tags.includes("vegan"))
          return false;
        if (
          dietaryPreferences.includes("vegetarian") &&
          !food.tags.includes("vegetarian") &&
          !food.tags.includes("vegan")
        )
          return false;
      }
    }

    return true;
  });
}

export const PHASE_NUTRIENTS: Record<Phase, PhaseNutrientData> = {
  menstrual: {
    headline: "Replenish & Restore",
    description:
      "Your body is losing iron through menstruation. Focus on replenishing minerals, reducing inflammation, and easing cramps.",
    avoid: ["Excess caffeine", "Alcohol", "Salty processed foods", "Refined sugar", "Cold raw foods"],
    nutrients: [
      {
        id: "iron",
        name: "Iron",
        icon: "water",
        why: "You lose iron through menstrual blood. Replenishing it prevents fatigue, brain fog, and weakness.",
        foods: [
          { name: "Spinach", detail: "2.7mg per cup (raw)", emoji: "🥬" },
          { name: "Lentils", detail: "6.6mg per cup (cooked)", emoji: "🫘" },
          { name: "Dark Chocolate (70%+)", detail: "3.4mg per oz", emoji: "🍫" },
          { name: "Kidney Beans", detail: "3.9mg per cup", emoji: "🫘" },
          { name: "Tofu", detail: "6.6mg per cup", emoji: "🧈", tags: ["vegan", "vegetarian", "gluten-free", "dairy-free"], allergens: ["soy"] },
          { name: "Red Meat", detail: "2.6mg per 3oz serving", emoji: "🥩", tags: ["paleo", "gluten-free", "dairy-free"] },
          { name: "Pumpkin Seeds", detail: "2.5mg per oz", emoji: "🎃" },
        ],
      },
      {
        id: "magnesium",
        name: "Magnesium",
        icon: "flash",
        why: "Relaxes uterine muscles to reduce cramping. Also supports mood and sleep quality during menstruation.",
        foods: [
          { name: "Dark Chocolate", detail: "64mg per oz", emoji: "🍫" },
          { name: "Pumpkin Seeds", detail: "156mg per oz", emoji: "🎃" },
          { name: "Almonds", detail: "80mg per oz", emoji: "🌰" },
          { name: "Avocado", detail: "58mg per avocado", emoji: "🥑" },
          { name: "Banana", detail: "32mg per banana", emoji: "🍌" },
          { name: "Black Beans", detail: "120mg per cup", emoji: "🫘" },
        ],
      },
      {
        id: "omega3",
        name: "Omega-3",
        icon: "fish",
        why: "Powerful anti-inflammatory that reduces period pain by lowering prostaglandin production.",
        foods: [
          { name: "Salmon", detail: "2.2g per 3oz fillet", emoji: "🐟", tags: ["pescatarian", "gluten-free", "dairy-free", "paleo"], allergens: ["fish"] },
          { name: "Walnuts", detail: "2.6g per oz", emoji: "🌰", allergens: ["tree nuts"] },
          { name: "Flaxseeds", detail: "6.7g per 2 tbsp", emoji: "🌱" },
          { name: "Chia Seeds", detail: "5g per oz", emoji: "🌱" },
          { name: "Sardines", detail: "1.4g per can", emoji: "🐟", tags: ["pescatarian", "gluten-free", "dairy-free", "paleo"], allergens: ["fish"] },
        ],
      },
      {
        id: "vitaminc",
        name: "Vitamin C",
        icon: "sunny",
        why: "Boosts iron absorption by up to 67%. Pair vitamin C foods with iron sources for maximum benefit.",
        foods: [
          { name: "Bell Peppers", detail: "152mg per cup", emoji: "🫑" },
          { name: "Strawberries", detail: "89mg per cup", emoji: "🍓" },
          { name: "Oranges", detail: "70mg per orange", emoji: "🍊" },
          { name: "Broccoli", detail: "81mg per cup", emoji: "🥦" },
          { name: "Kiwi", detail: "71mg per fruit", emoji: "🥝" },
        ],
      },
      {
        id: "zinc",
        name: "Zinc",
        icon: "shield-checkmark",
        why: "Supports immune function which dips during menstruation. Also helps with tissue repair.",
        foods: [
          { name: "Pumpkin Seeds", detail: "2.2mg per oz", emoji: "🎃" },
          { name: "Chickpeas", detail: "2.5mg per cup", emoji: "🫘" },
          { name: "Cashews", detail: "1.6mg per oz", emoji: "🌰", allergens: ["tree nuts"] },
          { name: "Quinoa", detail: "2mg per cup", emoji: "🌾" },
          { name: "Oysters", detail: "74mg per 3oz", emoji: "🦪", tags: ["pescatarian", "gluten-free", "dairy-free", "paleo"], allergens: ["shellfish"] },
        ],
      },
    ],
  },

  follicular: {
    headline: "Energize & Build",
    description:
      "Estrogen is rising, bringing energy and creativity. Support hormone metabolism with gut-friendly and estrogen-balancing foods.",
    avoid: ["Heavy greasy foods", "Excess dairy", "Processed sugar", "Trans fats"],
    nutrients: [
      {
        id: "probiotics",
        name: "Probiotics",
        icon: "flask",
        why: "Support the estrobolome — gut bacteria that regulate estrogen metabolism. Crucial as estrogen rises.",
        foods: [
          { name: "Yogurt", detail: "Live active cultures", emoji: "🥛", tags: ["vegetarian"], allergens: ["dairy"] },
          { name: "Kimchi", detail: "Rich in Lactobacillus", emoji: "🥬" },
          { name: "Sauerkraut", detail: "Unpasteurized for live cultures", emoji: "🥬" },
          { name: "Miso", detail: "Add to warm (not boiling) water", emoji: "🍜", allergens: ["soy"] },
          { name: "Kefir", detail: "12+ probiotic strains", emoji: "🥛", tags: ["vegetarian"], allergens: ["dairy"] },
          { name: "Kombucha", detail: "Fermented tea with probiotics", emoji: "🍵" },
        ],
      },
      {
        id: "vitamine",
        name: "Vitamin E",
        icon: "leaf",
        why: "Supports follicle development and protects growing eggs from oxidative stress.",
        foods: [
          { name: "Almonds", detail: "7.3mg per oz", emoji: "🌰", allergens: ["tree nuts"] },
          { name: "Sunflower Seeds", detail: "7.4mg per oz", emoji: "🌻" },
          { name: "Avocado", detail: "2.1mg per avocado", emoji: "🥑" },
          { name: "Olive Oil", detail: "1.9mg per tbsp", emoji: "🫒" },
          { name: "Spinach", detail: "3.7mg per cup (cooked)", emoji: "🥬" },
        ],
      },
      {
        id: "bvitamins",
        name: "B Vitamins",
        icon: "battery-charging",
        why: "Fuel your rising energy. B6 supports serotonin production, B12 aids red blood cell formation.",
        foods: [
          { name: "Eggs", detail: "B2, B5, B12 in one food", emoji: "🥚", tags: ["vegetarian", "paleo", "gluten-free", "dairy-free"], allergens: ["eggs"] },
          { name: "Leafy Greens", detail: "Rich in folate (B9)", emoji: "🥬" },
          { name: "Whole Grains", detail: "B1, B3, B6", emoji: "🌾" },
          { name: "Nutritional Yeast", detail: "Complete B-complex", emoji: "🧀" },
          { name: "Lentils", detail: "High in folate & B6", emoji: "🫘" },
        ],
      },
      {
        id: "folate",
        name: "Folate",
        icon: "rose",
        why: "Essential for cell growth and DNA repair as your body builds new follicles and uterine lining.",
        foods: [
          { name: "Asparagus", detail: "134μg per cup", emoji: "🌿" },
          { name: "Edamame", detail: "482μg per cup", emoji: "🫛" },
          { name: "Brussels Sprouts", detail: "94μg per cup", emoji: "🥬" },
          { name: "Broccoli", detail: "57μg per cup", emoji: "🥦" },
          { name: "Spinach", detail: "263μg per cup (cooked)", emoji: "🥬" },
        ],
      },
    ],
  },

  ovulatory: {
    headline: "Detox & Protect",
    description:
      "Estrogen peaks right now. Support your liver in clearing excess estrogen and fuel your peak energy with antioxidants.",
    avoid: ["Processed foods", "Refined carbs", "Inflammatory oils", "Excess sugar"],
    nutrients: [
      {
        id: "fiber",
        name: "Fiber",
        icon: "nutrition",
        why: "Binds to excess estrogen in the gut and escorts it out. Critical when estrogen is at its highest.",
        foods: [
          { name: "Chickpeas", detail: "12.5g per cup", emoji: "🫘" },
          { name: "Lentils", detail: "15.6g per cup", emoji: "🫘" },
          { name: "Broccoli", detail: "5.1g per cup", emoji: "🥦" },
          { name: "Chia Seeds", detail: "10g per oz", emoji: "🌱" },
          { name: "Oats", detail: "8g per cup", emoji: "🌾" },
          { name: "Quinoa", detail: "5.2g per cup", emoji: "🌾" },
        ],
      },
      {
        id: "antioxidants",
        name: "Antioxidants",
        icon: "color-palette",
        why: "Protect eggs and cells from oxidative damage during ovulation. Eat the rainbow.",
        foods: [
          { name: "Blueberries", detail: "High in anthocyanins", emoji: "🫐" },
          { name: "Raspberries", detail: "Ellagic acid + vitamin C", emoji: "🍇" },
          { name: "Dark Leafy Greens", detail: "Lutein & zeaxanthin", emoji: "🥬" },
          { name: "Bell Peppers", detail: "Vitamin C + carotenoids", emoji: "🫑" },
          { name: "Beets", detail: "Betalains for liver support", emoji: "🟣" },
          { name: "Dark Chocolate", detail: "Flavonoids", emoji: "🍫" },
        ],
      },
      {
        id: "glutathione",
        name: "Glutathione",
        icon: "medkit",
        why: "Your body's master detoxifier. Helps the liver break down and clear peak-level estrogen.",
        foods: [
          { name: "Broccoli", detail: "Sulforaphane boosts glutathione", emoji: "🥦" },
          { name: "Cauliflower", detail: "Contains DIM for estrogen clearance", emoji: "🥬" },
          { name: "Brussels Sprouts", detail: "Cruciferous powerhouse", emoji: "🥬" },
          { name: "Garlic", detail: "Sulfur compounds boost production", emoji: "🧄" },
          { name: "Onions", detail: "Quercetin supports detox", emoji: "🧅" },
        ],
      },
      {
        id: "vitamind",
        name: "Vitamin D",
        icon: "sunny",
        why: "Supports hormone signaling during ovulation. Most women are deficient — food sources help.",
        foods: [
          { name: "Mushrooms (UV-exposed)", detail: "Up to 1,110 IU per cup", emoji: "🍄" },
          { name: "Egg Yolks", detail: "41 IU per yolk", emoji: "🥚", tags: ["vegetarian", "paleo", "gluten-free", "dairy-free"], allergens: ["eggs"] },
          { name: "Salmon", detail: "570 IU per 3oz", emoji: "🐟", tags: ["pescatarian", "gluten-free", "dairy-free", "paleo"], allergens: ["fish"] },
          { name: "Fortified Plant Milk", detail: "~100 IU per cup", emoji: "🥛" },
          { name: "Sardines", detail: "46 IU per can", emoji: "🐟", tags: ["pescatarian", "gluten-free", "dairy-free", "paleo"], allergens: ["fish"] },
        ],
      },
    ],
  },

  luteal: {
    headline: "Soothe & Stabilize",
    description:
      "Progesterone rises then drops, causing PMS. Focus on mood-stabilizing nutrients, complex carbs for serotonin, and minerals to ease symptoms.",
    avoid: ["Excess caffeine", "Alcohol", "Refined sugar", "Excess salt", "Artificial sweeteners"],
    nutrients: [
      {
        id: "magnesium",
        name: "Magnesium",
        icon: "flash",
        why: "Eases PMS cramps, anxiety, and insomnia. Your body's natural muscle relaxer and mood stabilizer.",
        foods: [
          { name: "Pumpkin Seeds", detail: "156mg per oz", emoji: "🎃" },
          { name: "Dark Chocolate", detail: "64mg per oz", emoji: "🍫" },
          { name: "Almonds", detail: "80mg per oz", emoji: "🌰", allergens: ["tree nuts"] },
          { name: "Spinach", detail: "157mg per cup (cooked)", emoji: "🥬" },
          { name: "Black Beans", detail: "120mg per cup", emoji: "🫘" },
          { name: "Avocado", detail: "58mg per avocado", emoji: "🥑" },
        ],
      },
      {
        id: "vitaminb6",
        name: "Vitamin B6",
        icon: "happy",
        why: "Converts tryptophan into serotonin — your mood-regulating hormone. Helps reduce irritability and bloating.",
        foods: [
          { name: "Banana", detail: "0.43mg per banana", emoji: "🍌" },
          { name: "Chickpeas", detail: "1.1mg per cup", emoji: "🫘" },
          { name: "Sweet Potato", detail: "0.57mg per potato", emoji: "🍠" },
          { name: "Turkey", detail: "0.54mg per 3oz", emoji: "🦃", tags: ["paleo", "gluten-free", "dairy-free"] },
          { name: "Salmon", detail: "0.6mg per 3oz", emoji: "🐟", tags: ["pescatarian", "gluten-free", "dairy-free", "paleo"], allergens: ["fish"] },
          { name: "Potatoes", detail: "0.54mg per potato", emoji: "🥔" },
        ],
      },
      {
        id: "tryptophan",
        name: "Tryptophan",
        icon: "moon",
        why: "Precursor to serotonin and melatonin. Boosts mood during the day and improves sleep at night.",
        foods: [
          { name: "Turkey", detail: "Natural tryptophan source", emoji: "🦃", tags: ["paleo", "gluten-free", "dairy-free"] },
          { name: "Chicken", detail: "Lean protein with tryptophan", emoji: "🍗", tags: ["paleo", "gluten-free", "dairy-free"] },
          { name: "Eggs", detail: "Complete amino acid profile", emoji: "🥚", tags: ["vegetarian", "paleo", "gluten-free", "dairy-free"], allergens: ["eggs"] },
          { name: "Cheese", detail: "Tryptophan + calcium combo", emoji: "🧀", tags: ["vegetarian"], allergens: ["dairy"] },
          { name: "Pumpkin Seeds", detail: "Tryptophan + magnesium", emoji: "🎃" },
        ],
      },
      {
        id: "calcium",
        name: "Calcium",
        icon: "fitness",
        why: "Reduces PMS severity by up to 48%. Supports muscle and nerve function as progesterone drops.",
        foods: [
          { name: "Kale", detail: "94mg per cup (cooked)", emoji: "🥬" },
          { name: "Broccoli", detail: "62mg per cup", emoji: "🥦" },
          { name: "Sesame Seeds", detail: "88mg per tbsp", emoji: "🌱" },
          { name: "Almonds", detail: "76mg per oz", emoji: "🌰", allergens: ["tree nuts"] },
          { name: "Fortified Plant Milk", detail: "~300mg per cup", emoji: "🥛" },
        ],
      },
      {
        id: "omega3-luteal",
        name: "Omega-3",
        icon: "fish",
        why: "Anti-inflammatory fatty acids that reduce breast tenderness, bloating, and mood swings.",
        foods: [
          { name: "Salmon", detail: "2.2g per 3oz", emoji: "🐟", tags: ["pescatarian", "gluten-free", "dairy-free", "paleo"], allergens: ["fish"] },
          { name: "Walnuts", detail: "2.6g per oz", emoji: "🌰", allergens: ["tree nuts"] },
          { name: "Flaxseeds", detail: "6.7g per 2 tbsp", emoji: "🌱" },
          { name: "Chia Seeds", detail: "5g per oz", emoji: "🌱" },
          { name: "Hemp Seeds", detail: "1g per tbsp", emoji: "🌿" },
        ],
      },
    ],
  },
};

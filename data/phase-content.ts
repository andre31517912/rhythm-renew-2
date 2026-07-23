import type { Phase } from "@/contexts/CycleContext";

export interface PhaseContent {
  name: string;
  emoji: string;
  dayRange: [number, number];
  color: string;
  description: string;
  energy: string;
  mood: string;
  bodyInfo: string;
  bodyTips: string[];
  symptoms: string[];
  nutrition: {
    focus: string[];
    avoid: string[];
    nutrients: string[];
  };
  movement: {
    recommended: string[];
    avoid: string[];
    intensity: string;
    muscleAvoid: { muscle: string; reason: string }[];
    muscleFocus: { muscle: string; reason: string }[];
  };
  mentalWellness: {
    focus: string[];
    journalPrompts: string[];
    affirmations: string[];
  };
}

export interface Recipe {
  id: string;
  phase: Phase;
  name: string;
  prepTime: number;
  dietTags: string[];
  allergens: string[];
  nutrients: string[];
  ingredients: string[];
  steps: string[];
  description: string;
}

export interface WorkoutExercise {
  name: string;
  sets: number;
  reps?: string;
  hold?: string;
  notes: string;
}

export interface Workout {
  id: string;
  phase: Phase;
  name: string;
  type: string;
  duration: number;
  intensity: string;
  muscleGroups: string[];
  description: string;
  warmup: string;
  cooldown: string;
  exercises: WorkoutExercise[];
}

export interface Meditation {
  id: string;
  name: string;
  duration: number;
  category: string;
  phase: Phase | "all";
  description: string;
}

export const PHASE_CONTENT: Record<Phase, PhaseContent> = {
  menstrual: {
    name: "Menstrual Phase",
    emoji: "\u{1F311}",
    dayRange: [1, 5],
    color: "#B2002D",
    description: "Your body is shedding its uterine lining. Honor your need for rest.",
    energy: "Low",
    mood: "Introspective, tired",
    bodyInfo: "Your uterus is contracting to shed its lining. Prostaglandins cause cramps. Iron levels drop. You may feel fatigued, bloated, and emotionally sensitive.",
    bodyTips: [
      "Use a heating pad on your lower abdomen",
      "Stay hydrated — warm water with lemon helps",
      "Prioritize 8+ hours of sleep",
      "Wear comfortable clothing",
    ],
    symptoms: ["Cramps", "Fatigue", "Bloating", "Lower back pain", "Mood changes", "Headaches"],
    nutrition: {
      focus: ["Iron-rich foods", "Warm comfort foods", "Anti-inflammatory foods", "Magnesium-rich foods", "Vitamin C for iron absorption"],
      avoid: ["Excess caffeine", "Salty foods", "Processed sugar", "Cold/raw foods", "Alcohol"],
      nutrients: ["Iron", "Magnesium", "Omega-3", "Vitamin B12", "Zinc"],
    },
    movement: {
      recommended: ["Gentle yoga", "Walking", "Light stretching", "Restorative poses", "Tai chi"],
      avoid: ["Heavy lifting", "Intense HIIT", "Extreme cardio"],
      intensity: "Low",
      muscleAvoid: [
        { muscle: "Heavy core / deep abdominals", reason: "Your uterus is actively contracting — intense ab work can worsen cramps and increase intra-abdominal pressure." },
        { muscle: "Lower back (heavy load)", reason: "Prostaglandins cause inflammation around the lower back. Heavy deadlifts or back extensions add strain." },
        { muscle: "Pelvic floor (high-impact)", reason: "Jumping and running put downward pressure on the pelvic floor when it’s already under stress." },
      ],
      muscleFocus: [
        { muscle: "Hips & hip flexors", reason: "Gentle hip openers relieve cramping and tension in the pelvic area." },
        { muscle: "Upper back & shoulders (gentle)", reason: "Light stretching counteracts the tendency to curl inward from discomfort." },
        { muscle: "Hamstrings (stretch only)", reason: "Gentle hamstring stretches improve circulation and reduce lower back pull." },
      ],
    },
    mentalWellness: {
      focus: ["Rest and self-compassion", "Journaling about feelings", "Warm baths", "Early bedtime"],
      journalPrompts: ["What does my body need right now?", "What am I ready to release?", "How can I be gentle with myself today?", "What brought me comfort this week?"],
      affirmations: ["I honor my body’s need for rest.", "I am allowed to slow down.", "My cycle is a source of power.", "I am worthy of gentleness."],
    },
  },
  follicular: {
    name: "Follicular Phase",
    emoji: "\u{1F312}",
    dayRange: [6, 13],
    color: "#FF6B9D",
    description: "Estrogen is rising. You’re feeling creative, energized, and ready for new beginnings.",
    energy: "Rising",
    mood: "Optimistic, creative, social",
    bodyInfo: "Your pituitary gland releases FSH, stimulating follicle growth. Estrogen climbs steadily, boosting energy, mood, and skin radiance.",
    bodyTips: [
      "Take advantage of increased energy for challenging tasks",
      "Your skin may be at its clearest — try new skincare",
      "Great time to schedule social events",
      "Experiment with new healthy foods",
    ],
    symptoms: ["Increased energy", "Better mood", "Clearer skin", "Higher libido", "Creativity boost"],
    nutrition: {
      focus: ["Light, fresh foods", "Fermented foods", "Lean proteins", "Sprouted grains", "Colorful vegetables"],
      avoid: ["Heavy, greasy foods", "Excess dairy"],
      nutrients: ["Probiotics", "Vitamin E", "B Vitamins", "Folate"],
    },
    movement: {
      recommended: ["Cardio", "Dancing", "HIIT", "Strength training", "New workout classes", "Running"],
      avoid: [],
      intensity: "Medium to High",
      muscleAvoid: [
        { muscle: "None — this is your power phase!", reason: "Rising estrogen supports muscle repair and recovery. You can safely target all muscle groups." },
      ],
      muscleFocus: [
        { muscle: "Glutes & legs (compound)", reason: "Estrogen promotes muscle protein synthesis — squats, lunges, and deadlifts are most effective now." },
        { muscle: "Core & stability", reason: "Your coordination and balance peak as estrogen rises. Great time for new core challenges." },
        { muscle: "Cardio endurance", reason: "Your heart rate recovery is faster. Push your stamina with intervals and longer runs." },
      ],
    },
    mentalWellness: {
      focus: ["Start new projects", "Brainstorming", "Social connections", "Creative expression"],
      journalPrompts: ["What new project excites me?", "What seeds do I want to plant this cycle?", "Where do I feel most creative?", "What makes me feel alive?"],
      affirmations: ["I am full of creative potential.", "New beginnings flow to me effortlessly.", "I trust the process of growth.", "My ideas have power."],
    },
  },
  ovulatory: {
    name: "Ovulatory Phase",
    emoji: "\u{1F315}",
    dayRange: [14, 17],
    color: "#FF0066",
    description: "Peak energy and confidence. You’re magnetic, communicative, and powerful.",
    energy: "Peak",
    mood: "Confident, social, magnetic",
    bodyInfo: "A surge in luteinizing hormone triggers ovulation. Estrogen peaks, making you feel your most confident. Testosterone briefly rises too.",
    bodyTips: [
      "Channel your confidence into big conversations",
      "Great time for presentations or interviews",
      "Stay cool — your body temperature rises slightly",
      "Support your liver with cruciferous vegetables",
    ],
    symptoms: ["Peak confidence", "Heightened senses", "Slight temperature rise", "Increased social energy", "Cervical mucus changes"],
    nutrition: {
      focus: ["Raw vegetables and fruits", "Light grains like quinoa", "Anti-inflammatory foods", "Cruciferous vegetables", "Fiber-rich foods"],
      avoid: ["Processed foods", "Excess sugar", "Inflammatory oils"],
      nutrients: ["Fiber", "Antioxidants", "Glutathione", "Vitamin D"],
    },
    movement: {
      recommended: ["High-intensity workouts", "Group fitness", "Running", "Power yoga", "Circuit training", "Competitive sports"],
      avoid: [],
      intensity: "High",
      muscleAvoid: [
        { muscle: "Be cautious with joints", reason: "Peak estrogen can increase joint laxity. Warm up thoroughly and avoid maxing out on heavy single-rep lifts." },
      ],
      muscleFocus: [
        { muscle: "Full body — go all out", reason: "Testosterone and estrogen both peak, giving you maximum strength, power, and confidence." },
        { muscle: "Upper body & shoulders", reason: "Take advantage of peak strength for push-ups, overhead press, and pull movements." },
        { muscle: "Explosive legs (plyometrics)", reason: "Jump squats, box jumps, sprints — your fast-twitch fibers fire best right now." },
      ],
    },
    mentalWellness: {
      focus: ["Important conversations", "Presentations", "Date nights", "Networking", "Asking for what you want"],
      journalPrompts: ["What truth am I ready to speak?", "Where am I shining brightest?", "What connections am I nurturing?", "How can I use this energy?"],
      affirmations: ["I radiate confidence and warmth.", "My voice matters.", "I attract what I desire.", "I am magnetic."],
    },
  },
  luteal: {
    name: "Luteal Phase",
    emoji: "\u{1F318}",
    dayRange: [18, 28],
    color: "#D4728C",
    description: "Progesterone rises then falls. Focus on nesting, completing tasks, and winding down.",
    energy: "Declining",
    mood: "Detail-oriented → emotional",
    bodyInfo: "Progesterone rises and your body prepares for a potential pregnancy. As hormones decline, PMS symptoms may appear. Your metabolism speeds up slightly.",
    bodyTips: [
      "You may need 200-300 extra calories per day",
      "Prioritize complex carbs for serotonin support",
      "Practice saying no to overcommitment",
      "Start winding down evening routines earlier",
    ],
    symptoms: ["Breast tenderness", "Mood swings", "Food cravings", "Bloating", "Acne", "Irritability"],
    nutrition: {
      focus: ["Complex carbohydrates", "Magnesium-rich foods", "Serotonin-boosting foods", "Healthy fats", "Root vegetables", "Warm, cooked meals"],
      avoid: ["Excess salt", "Alcohol", "Caffeine", "Refined sugar", "Artificial sweeteners"],
      nutrients: ["Magnesium", "Calcium", "Vitamin B6", "Tryptophan", "Omega-3"],
    },
    movement: {
      recommended: ["Pilates", "Moderate strength training", "Swimming", "Yoga", "Walking in nature"],
      avoid: ["Overtraining", "Extreme endurance"],
      intensity: "Medium → Low",
      muscleAvoid: [
        { muscle: "Heavy core / intense abs", reason: "Progesterone causes bloating. Intense ab work feels uncomfortable and can worsen it." },
        { muscle: "Heavy lower body (max effort)", reason: "Body temperature is higher and recovery is slower. Heavy squats carry more injury risk." },
        { muscle: "High-impact anything", reason: "Rising progesterone makes you more prone to fatigue and overheating." },
      ],
      muscleFocus: [
        { muscle: "Hips & glutes (moderate)", reason: "Controlled movements like Pilates leg lifts and bridges keep strength without straining." },
        { muscle: "Back & posture muscles", reason: "Gentle back work counters the forward slump that bloating and breast tenderness cause." },
        { muscle: "Flexibility / full-body stretch", reason: "Yin yoga and light stretching support your body as it prepares to wind down." },
      ],
    },
    mentalWellness: {
      focus: ["Completing projects", "Nesting and organizing", "Boundary setting", "Self-care rituals"],
      journalPrompts: ["What needs completing before I rest?", "Where do I need better boundaries?", "What comforts me most?", "What am I grateful for today?"],
      affirmations: ["I trust the rhythm of my body.", "It is safe to slow down.", "I release what no longer serves me.", "I am enough, exactly as I am."],
    },
  },
};

export const RECIPES: Recipe[] = [
  { id: "m1", phase: "menstrual", name: "Iron-Boost Lentil Soup", prepTime: 30, dietTags: ["vegan", "gluten-free", "dairy-free"], allergens: [], nutrients: ["iron", "magnesium", "vitamin-c"], ingredients: ["red lentils", "spinach", "tomatoes", "turmeric", "lemon", "garlic", "onion", "cumin"], steps: ["Sauté onion and garlic in olive oil for 3 min.", "Add cumin and turmeric, stir 1 min.", "Add lentils, tomatoes, and 4 cups water.", "Simmer 20 min until lentils are soft.", "Stir in spinach, cook 2 min.", "Squeeze lemon juice, season and serve warm."], description: "Warming and iron-rich to replenish during menstruation." },
  { id: "m2", phase: "menstrual", name: "Dark Chocolate Avocado Mousse", prepTime: 10, dietTags: ["vegan", "gluten-free", "dairy-free"], allergens: [], nutrients: ["magnesium", "iron", "omega-3"], ingredients: ["avocado", "cocoa powder", "maple syrup", "vanilla extract", "almond milk", "sea salt"], steps: ["Blend all ingredients until silky smooth.", "Chill 30 min.", "Top with berries and serve."], description: "Magnesium-rich comfort treat to ease cramps." },
  { id: "m3", phase: "menstrual", name: "Turmeric Ginger Bone Broth", prepTime: 15, dietTags: ["gluten-free", "dairy-free", "paleo"], allergens: [], nutrients: ["iron", "zinc", "magnesium"], ingredients: ["bone broth", "fresh ginger", "turmeric", "black pepper", "garlic", "sea salt", "green onions"], steps: ["Heat broth in a pot.", "Add grated ginger and turmeric.", "Simmer 10 min.", "Add black pepper and garlic.", "Garnish with green onions."], description: "Deeply warming and mineral-rich for restoration." },
  { id: "m4", phase: "menstrual", name: "Spinach & Sweet Potato Hash", prepTime: 25, dietTags: ["vegan", "gluten-free", "dairy-free", "paleo"], allergens: [], nutrients: ["iron", "vitamin-c", "magnesium"], ingredients: ["sweet potato", "spinach", "red onion", "garlic", "paprika", "olive oil", "lemon"], steps: ["Dice sweet potato, roast at 400°F for 15 min.", "Sauté onion and garlic.", "Add sweet potato and paprika.", "Fold in spinach until wilted.", "Drizzle with lemon juice."], description: "Iron and vitamin C combo for maximum absorption." },
  { id: "m5", phase: "menstrual", name: "Warm Beetroot & Black Bean Stew", prepTime: 35, dietTags: ["vegan", "gluten-free", "dairy-free"], allergens: [], nutrients: ["iron", "magnesium", "vitamin-c"], ingredients: ["beetroot", "black beans", "tomatoes", "cumin", "smoked paprika", "garlic", "onion", "vegetable broth", "lime"], steps: ["Sauté onion and garlic until soft.", "Add cumin and smoked paprika, stir 30s.", "Add diced beetroot, beans, tomatoes, and broth.", "Simmer 25 min until beets are tender.", "Squeeze lime and serve."], description: "Earthy, iron-packed stew to rebuild energy during your period." },

  { id: "f1", phase: "follicular", name: "Rainbow Buddha Bowl", prepTime: 25, dietTags: ["vegan", "gluten-free", "dairy-free"], allergens: [], nutrients: ["probiotics", "vitamin-e", "folate"], ingredients: ["quinoa", "purple cabbage", "carrots", "edamame", "avocado", "kimchi", "tahini", "lemon"], steps: ["Cook quinoa and let cool slightly.", "Arrange all vegetables in a bowl.", "Top with kimchi and avocado.", "Drizzle tahini-lemon dressing."], description: "Fresh, colorful, and packed with probiotics for rising energy." },
  { id: "f2", phase: "follicular", name: "Citrus Salmon Salad", prepTime: 20, dietTags: ["gluten-free", "dairy-free", "pescatarian"], allergens: ["fish"], nutrients: ["omega-3", "vitamin-e", "b-vitamins"], ingredients: ["salmon fillet", "mixed greens", "orange segments", "avocado", "pumpkin seeds", "olive oil", "lemon"], steps: ["Pan-sear salmon 4 min each side.", "Arrange greens on plate.", "Top with orange, avocado, pumpkin seeds.", "Flake salmon on top.", "Dress with olive oil and lemon."], description: "Light protein with energizing citrus for your rising phase." },
  { id: "f3", phase: "follicular", name: "Green Goddess Smoothie", prepTime: 5, dietTags: ["vegan", "gluten-free", "dairy-free"], allergens: [], nutrients: ["folate", "b-vitamins", "probiotics"], ingredients: ["banana", "spinach", "coconut yogurt", "mango", "chia seeds", "fresh mint"], steps: ["Blend all ingredients until smooth.", "Pour and enjoy immediately."], description: "Probiotic-rich smoothie to fuel your creative phase." },
  { id: "f4", phase: "follicular", name: "Sprouted Grain Toast with Egg", prepTime: 10, dietTags: ["vegetarian"], allergens: ["eggs", "gluten"], nutrients: ["folate", "vitamin-e", "b-vitamins"], ingredients: ["sprouted grain bread", "eggs", "avocado", "microgreens", "everything seasoning", "lemon"], steps: ["Toast bread until crispy.", "Fry or poach egg.", "Mash avocado on toast.", "Top with egg and microgreens.", "Season and squeeze lemon."], description: "Quick energy with sprouted grains perfect for the follicular phase." },
  { id: "f5", phase: "follicular", name: "Miso Soba Noodle Bowl", prepTime: 20, dietTags: ["vegan", "dairy-free"], allergens: ["gluten", "soy"], nutrients: ["probiotics", "b-vitamins", "folate"], ingredients: ["soba noodles", "white miso paste", "tofu", "edamame", "nori", "green onions", "sesame seeds", "fresh ginger"], steps: ["Cook soba noodles, rinse with cold water.", "Dissolve miso in 3 cups warm water (don’t boil).", "Cube tofu and pan-fry until golden.", "Assemble noodles in bowls, pour miso broth over.", "Top with tofu, edamame, nori, green onions, and sesame seeds."], description: "Probiotic miso and energizing noodles to match your rising momentum." },
  { id: "f6", phase: "follicular", name: "Spinach & Feta Stuffed Chicken", prepTime: 30, dietTags: ["gluten-free"], allergens: ["dairy"], nutrients: ["b-vitamins", "vitamin-e", "folate"], ingredients: ["chicken breast", "fresh spinach", "feta cheese", "sun-dried tomatoes", "garlic", "olive oil", "oregano", "lemon"], steps: ["Preheat oven to 400°F.", "Cut a pocket in each chicken breast.", "Sauté spinach and garlic, cool slightly.", "Mix spinach with crumbled feta and sun-dried tomatoes.", "Stuff chicken, secure with toothpick.", "Season with oregano, bake 22-25 min."], description: "High-protein with folate-rich spinach to fuel your building energy." },
  { id: "f7", phase: "follicular", name: "Tropical Probiotic Parfait", prepTime: 10, dietTags: ["vegetarian", "gluten-free"], allergens: ["dairy"], nutrients: ["probiotics", "vitamin-e", "b-vitamins"], ingredients: ["Greek yogurt or coconut yogurt", "mango", "pineapple", "passionfruit", "granola", "coconut flakes", "honey"], steps: ["Layer yogurt in a glass or bowl.", "Add diced mango and pineapple.", "Scoop passionfruit over fruit.", "Top with granola and coconut flakes.", "Drizzle with honey."], description: "Bright tropical flavors with gut-friendly probiotics for your creative phase." },
  { id: "f8", phase: "follicular", name: "Lemon Herb Shrimp & Asparagus", prepTime: 15, dietTags: ["gluten-free", "dairy-free", "pescatarian"], allergens: ["shellfish"], nutrients: ["folate", "b-vitamins", "vitamin-e"], ingredients: ["shrimp", "asparagus", "lemon", "garlic", "olive oil", "fresh dill", "cherry tomatoes", "red pepper flakes"], steps: ["Heat olive oil in a pan over medium-high heat.", "Add garlic and red pepper flakes, cook 30s.", "Add shrimp, cook 2 min per side until pink.", "Add asparagus and cherry tomatoes, cook 3 min.", "Squeeze lemon, toss with fresh dill, serve immediately."], description: "Light, quick, and loaded with folate from asparagus." },

  { id: "o1", phase: "ovulatory", name: "Thai Crunch Salad", prepTime: 15, dietTags: ["vegan", "gluten-free", "dairy-free"], allergens: ["soy"], nutrients: ["fiber", "antioxidants", "vitamin-d"], ingredients: ["purple cabbage", "carrots", "cucumber", "bell pepper", "cilantro", "lime", "tamari", "sesame oil", "chili flakes"], steps: ["Shred cabbage, julienne carrots and pepper.", "Dice cucumber, chop cilantro.", "Whisk lime, tamari, sesame oil, chili.", "Toss everything together.", "Let sit 5 min before serving."], description: "Crunchy, raw, and fiber-rich for your peak phase." },
  { id: "o2", phase: "ovulatory", name: "Quinoa Stuffed Bell Peppers", prepTime: 35, dietTags: ["vegan", "gluten-free", "dairy-free"], allergens: [], nutrients: ["fiber", "antioxidants", "glutathione"], ingredients: ["bell peppers", "quinoa", "black beans", "corn", "tomatoes", "cumin", "cilantro", "lime"], steps: ["Cook quinoa.", "Mix quinoa with beans, corn, tomatoes, spices.", "Halve peppers and remove seeds.", "Fill with quinoa mixture.", "Bake at 375°F for 20 min.", "Garnish with cilantro and lime."], description: "Fiber-packed and satisfying during your most energetic phase." },
  { id: "o3", phase: "ovulatory", name: "Berry Antioxidant Acai Bowl", prepTime: 10, dietTags: ["vegan", "gluten-free", "dairy-free"], allergens: [], nutrients: ["antioxidants", "fiber", "vitamin-d"], ingredients: ["acai packets", "banana", "mixed berries", "granola", "coconut flakes", "hemp seeds", "honey or agave"], steps: ["Blend acai, banana, and half the berries.", "Pour into bowl.", "Top with remaining berries, granola, coconut, hemp seeds.", "Drizzle with honey."], description: "Antioxidant powerhouse for your peak energy days." },
  { id: "o4", phase: "ovulatory", name: "Grilled Veggie & Hummus Wrap", prepTime: 20, dietTags: ["vegan", "dairy-free"], allergens: ["gluten"], nutrients: ["fiber", "antioxidants", "glutathione"], ingredients: ["whole wheat tortilla", "hummus", "zucchini", "eggplant", "red pepper", "arugula", "balsamic glaze"], steps: ["Grill sliced vegetables until charred.", "Warm tortilla.", "Spread hummus generously.", "Layer grilled veggies and arugula.", "Drizzle balsamic, roll and serve."], description: "Light yet satisfying wrap for your confident phase." },
  { id: "o5", phase: "ovulatory", name: "Broccoli & Cauliflower Detox Soup", prepTime: 25, dietTags: ["vegan", "gluten-free", "dairy-free"], allergens: [], nutrients: ["glutathione", "fiber", "antioxidants"], ingredients: ["broccoli", "cauliflower", "onion", "garlic", "vegetable broth", "nutritional yeast", "lemon", "olive oil"], steps: ["Sauté onion and garlic in olive oil.", "Add chopped broccoli and cauliflower.", "Pour in broth, simmer 15 min until tender.", "Blend until creamy.", "Stir in nutritional yeast and lemon juice."], description: "Cruciferous vegetables support liver detox during estrogen peak." },
  { id: "o6", phase: "ovulatory", name: "Mediterranean Chickpea Power Plate", prepTime: 20, dietTags: ["vegan", "gluten-free", "dairy-free"], allergens: [], nutrients: ["fiber", "antioxidants", "glutathione"], ingredients: ["chickpeas", "cucumber", "cherry tomatoes", "red onion", "kalamata olives", "parsley", "lemon", "olive oil", "sumac"], steps: ["Drain and rinse chickpeas, pat dry.", "Dice cucumber, halve tomatoes, slice onion thinly.", "Combine all vegetables with chickpeas.", "Whisk lemon, olive oil, and sumac into dressing.", "Toss salad, garnish with parsley and extra olives."], description: "Light, fiber-rich plate packed with antioxidants for your peak phase." },

  { id: "l1", phase: "luteal", name: "Warm Sweet Potato & Kale Bowl", prepTime: 30, dietTags: ["vegan", "gluten-free", "dairy-free"], allergens: [], nutrients: ["magnesium", "calcium", "vitamin-b6", "tryptophan"], ingredients: ["sweet potato", "kale", "chickpeas", "tahini", "lemon", "garlic", "cumin", "pumpkin seeds"], steps: ["Roast cubed sweet potato and chickpeas at 400°F for 25 min.", "Massage kale with lemon and olive oil.", "Make tahini dressing with garlic and cumin.", "Assemble bowl.", "Top with pumpkin seeds."], description: "Complex carbs and magnesium to soothe PMS symptoms." },
  { id: "l2", phase: "luteal", name: "Banana Oat Pancakes", prepTime: 15, dietTags: ["vegetarian", "dairy-free"], allergens: ["eggs", "gluten"], nutrients: ["tryptophan", "magnesium", "vitamin-b6"], ingredients: ["oats", "banana", "eggs", "cinnamon", "vanilla extract", "maple syrup", "blueberries"], steps: ["Blend oats, banana, eggs, cinnamon, vanilla.", "Heat pan with coconut oil.", "Pour batter to make small pancakes.", "Cook 2 min each side.", "Top with blueberries and maple syrup."], description: "Serotonin-boosting comfort food for the luteal phase." },
  { id: "l3", phase: "luteal", name: "Dark Chocolate Chia Pudding", prepTime: 10, dietTags: ["vegan", "gluten-free", "dairy-free"], allergens: [], nutrients: ["magnesium", "calcium", "omega-3"], ingredients: ["chia seeds", "cocoa powder", "oat milk", "maple syrup", "vanilla extract", "dark chocolate chips"], steps: ["Mix chia seeds, cocoa, oat milk, maple syrup, vanilla.", "Stir well and refrigerate 4+ hours.", "Top with dark chocolate chips.", "Enjoy cold or gently warmed."], description: "Satisfy chocolate cravings while loading up on magnesium." },
  { id: "l4", phase: "luteal", name: "Turkey & Root Veggie Stew", prepTime: 40, dietTags: ["gluten-free", "dairy-free", "paleo"], allergens: [], nutrients: ["tryptophan", "vitamin-b6", "magnesium", "calcium"], ingredients: ["ground turkey", "carrots", "parsnips", "celery", "potatoes", "thyme", "rosemary", "garlic", "bone broth"], steps: ["Brown turkey in a large pot.", "Add diced root vegetables and garlic.", "Pour in bone broth.", "Add herbs and simmer 30 min.", "Season and serve warm."], description: "Warm, grounding stew packed with tryptophan for better sleep." },
  { id: "l5", phase: "luteal", name: "Pumpkin Spice Overnight Oats", prepTime: 10, dietTags: ["vegan", "dairy-free"], allergens: ["gluten"], nutrients: ["magnesium", "tryptophan", "vitamin-b6"], ingredients: ["rolled oats", "pumpkin puree", "oat milk", "maple syrup", "cinnamon", "nutmeg", "chia seeds", "pecans"], steps: ["Mix oats, pumpkin puree, oat milk, maple syrup, and spices.", "Stir in chia seeds.", "Refrigerate overnight.", "Top with pecans and extra maple syrup."], description: "Prep the night before and wake up to cozy, serotonin-boosting comfort." },
  { id: "l6", phase: "luteal", name: "Creamy Butternut Squash Mac & Cheese", prepTime: 35, dietTags: ["vegetarian"], allergens: ["dairy", "gluten"], nutrients: ["calcium", "magnesium", "vitamin-b6"], ingredients: ["butternut squash", "pasta", "cheddar cheese", "milk", "garlic", "nutmeg", "breadcrumbs", "olive oil"], steps: ["Roast cubed butternut squash at 400°F for 20 min.", "Cook pasta al dente.", "Blend squash with milk, garlic, and nutmeg.", "Melt cheese into sauce.", "Toss with pasta, top with breadcrumbs, broil 3 min."], description: "Ultimate craving-satisfying comfort food with hidden veggies and calcium." },
  { id: "l7", phase: "luteal", name: "Salmon & Brown Rice Teriyaki Bowl", prepTime: 25, dietTags: ["gluten-free", "dairy-free", "pescatarian"], allergens: ["fish", "soy"], nutrients: ["omega-3", "tryptophan", "magnesium"], ingredients: ["salmon fillet", "brown rice", "broccoli", "carrots", "tamari", "honey", "ginger", "sesame seeds", "green onions"], steps: ["Cook brown rice.", "Whisk tamari, honey, and ginger for glaze.", "Pan-sear salmon 4 min each side, brush with glaze.", "Steam broccoli and carrots.", "Assemble bowl, drizzle remaining glaze, top with sesame seeds."], description: "Omega-3 rich salmon with complex carbs to stabilize mood swings." },
  { id: "l8", phase: "luteal", name: "Comforting Lentil Shepherd’s Pie", prepTime: 45, dietTags: ["vegan", "gluten-free", "dairy-free"], allergens: [], nutrients: ["magnesium", "calcium", "tryptophan", "vitamin-b6"], ingredients: ["green lentils", "carrots", "celery", "onion", "garlic", "tomato paste", "vegetable broth", "potatoes", "olive oil", "thyme"], steps: ["Cook lentils until just tender.", "Sauté onion, carrots, celery, and garlic.", "Add tomato paste and broth, simmer 15 min.", "Boil and mash potatoes with olive oil.", "Layer lentil mix in baking dish, top with mash, bake at 375°F for 20 min."], description: "Warm, hearty, and loaded with magnesium and complex carbs for PMS relief." },
  { id: "l9", phase: "luteal", name: "Warm Cinnamon Apple & Walnut Bowl", prepTime: 15, dietTags: ["vegan", "gluten-free", "dairy-free"], allergens: ["tree nuts"], nutrients: ["magnesium", "omega-3", "calcium"], ingredients: ["apples", "walnuts", "oat milk", "cinnamon", "maple syrup", "almond butter", "flaxseed"], steps: ["Dice apples and warm in a pan with cinnamon.", "Cook 5 min until softened.", "Spoon into a bowl.", "Top with walnuts, almond butter, and flaxseed.", "Add warm oat milk and maple syrup."], description: "Like a warm hug in a bowl — magnesium-rich walnuts and omega-3 from flax." },
  { id: "l10", phase: "luteal", name: "Chickpea & Spinach Coconut Curry", prepTime: 25, dietTags: ["vegan", "gluten-free", "dairy-free"], allergens: [], nutrients: ["magnesium", "calcium", "vitamin-b6"], ingredients: ["chickpeas", "spinach", "coconut milk", "tomatoes", "onion", "garlic", "ginger", "curry powder", "turmeric", "rice"], steps: ["Sauté onion, garlic, and ginger.", "Add curry powder and turmeric, stir 1 min.", "Add tomatoes and coconut milk, simmer 10 min.", "Add chickpeas, cook 5 min.", "Fold in spinach until wilted.", "Serve over rice."], description: "Creamy, warming curry that soothes cravings and delivers steady energy." },
  { id: "l11", phase: "luteal", name: "Stuffed Baked Sweet Potatoes", prepTime: 40, dietTags: ["vegan", "gluten-free", "dairy-free"], allergens: [], nutrients: ["tryptophan", "magnesium", "vitamin-b6", "calcium"], ingredients: ["sweet potatoes", "black beans", "corn", "avocado", "lime", "cilantro", "cumin", "salsa", "pumpkin seeds"], steps: ["Bake sweet potatoes at 400°F for 35-40 min.", "Heat black beans with cumin.", "Split sweet potatoes open, fluff with a fork.", "Fill with beans and corn.", "Top with avocado, salsa, pumpkin seeds, and cilantro.", "Squeeze lime over the top."], description: "Satisfying complex carbs with tryptophan to help with sleep and mood." },
];

export const WORKOUTS: Workout[] = [
  { id: "mw1", phase: "menstrual", name: "Gentle Restorative Flow", type: "yoga", duration: 20, intensity: "low", muscleGroups: ["hips", "lower back"], description: "Slow, supported poses to ease cramps and calm your nervous system.", warmup: "3 min seated deep breathing, gentle neck rolls and shoulder shrugs.", cooldown: "2 min savasana with a pillow under your knees.", exercises: [{ name: "Child’s Pose", sets: 1, hold: "60s", notes: "Knees wide, arms extended, forehead on mat" }, { name: "Supine Spinal Twist", sets: 2, hold: "45s each side", notes: "Knees together, let gravity do the work" }, { name: "Cat-Cow Stretch", sets: 1, reps: "10 slow cycles", notes: "Sync breath—inhale cow, exhale cat" }, { name: "Reclined Butterfly", sets: 1, hold: "90s", notes: "Place blocks or pillows under knees for support" }, { name: "Legs Up the Wall", sets: 1, hold: "3 min", notes: "Reduces bloating and eases lower back tension" }, { name: "Supported Bridge with Block", sets: 1, hold: "60s", notes: "Block under sacrum on lowest setting" }] },
  { id: "mw2", phase: "menstrual", name: "Sunset Walk", type: "walking", duration: 30, intensity: "low", muscleGroups: ["legs", "glutes"], description: "A peaceful walk to gently move your body without strain.", warmup: "2 min standing hip circles and ankle rolls.", cooldown: "3 min standing quad stretch and calf stretch.", exercises: [{ name: "Flat-terrain easy walk", sets: 1, reps: "10 min", notes: "Keep a conversational pace, focus on breathing" }, { name: "Gentle arm swings while walking", sets: 1, reps: "5 min", notes: "Loosen shoulders, swing arms naturally" }, { name: "Mindful slow walk", sets: 1, reps: "10 min", notes: "Notice each step, connect with surroundings" }, { name: "Standing side stretch", sets: 2, hold: "30s each side", notes: "Pause mid-walk, reach one arm overhead and lean" }] },
  { id: "mw3", phase: "menstrual", name: "Bedtime Stretch Routine", type: "stretching", duration: 15, intensity: "low", muscleGroups: ["back", "hips", "hamstrings"], description: "Release tension in your lower back and hips before sleep.", warmup: "1 min seated deep belly breathing.", cooldown: "2 min lying flat, eyes closed, body scan.", exercises: [{ name: "Seated Forward Fold", sets: 1, hold: "60s", notes: "Bend from hips, use a strap if needed" }, { name: "Figure-Four Stretch", sets: 2, hold: "45s each side", notes: "Opens deep hip rotators, great for cramp relief" }, { name: "Knee-to-Chest Hug", sets: 2, hold: "30s each side", notes: "Gently rock side to side to massage lower back" }, { name: "Thread the Needle", sets: 2, hold: "30s each side", notes: "Opens thoracic spine and shoulders" }, { name: "Happy Baby Pose", sets: 1, hold: "60s", notes: "Hold outer feet, gently rock side to side" }] },
  { id: "mw4", phase: "menstrual", name: "Gentle Floor Mobility", type: "stretching", duration: 20, intensity: "low", muscleGroups: ["hips", "spine", "shoulders"], description: "All floor-based movements to relieve cramps and stiffness.", warmup: "2 min diaphragmatic breathing on your back.", cooldown: "2 min savasana with hand on belly.", exercises: [{ name: "Pelvic Tilts", sets: 2, reps: "12", notes: "Lying on back, gently tilt pelvis to flatten and arch lower back" }, { name: "Windshield Wipers", sets: 2, reps: "10 each side", notes: "Knees bent, feet wide, drop knees side to side" }, { name: "90/90 Hip Switch", sets: 2, reps: "8 each side", notes: "Seated, rotate legs slowly between positions" }, { name: "Sphinx Pose", sets: 1, hold: "45s", notes: "Gentle backbend, elbows under shoulders" }, { name: "Supine Pigeon Stretch", sets: 2, hold: "45s each side", notes: "Ankle over opposite knee, pull thigh toward chest" }] },

  { id: "fw1", phase: "follicular", name: "Energizing Vinyasa", type: "yoga", duration: 45, intensity: "medium", muscleGroups: ["full-body", "core", "arms"], description: "Dynamic flow to match your rising energy and creativity.", warmup: "5 min Sun Salutation A × 3 rounds.", cooldown: "5 min pigeon pose each side + seated meditation.", exercises: [{ name: "Sun Salutation B", sets: 3, reps: "full flow", notes: "Hold Warrior I for 3 breaths each side" }, { name: "Warrior II → Reverse Warrior → Extended Side Angle", sets: 2, reps: "flow each side", notes: "Build heat in legs, open chest" }, { name: "Chair Pose", sets: 3, hold: "30s", notes: "Sit deep, arms overhead, engage core" }, { name: "Chaturanga → Updog → Downdog", sets: 5, reps: "flow", notes: "Build upper body and core strength" }, { name: "Boat Pose", sets: 3, hold: "20s", notes: "Straight legs if possible, modify with bent knees" }, { name: "Crow Pose", sets: 3, hold: "10-15s", notes: "Optional — practice with a block or skip if not ready" }] },
  { id: "fw2", phase: "follicular", name: "Dance Cardio Party", type: "dancing", duration: 30, intensity: "medium", muscleGroups: ["full-body", "cardio", "core"], description: "Let loose and have fun with upbeat dance cardio.", warmup: "3 min light march in place + arm circles.", cooldown: "3 min slow swaying + standing forward fold.", exercises: [{ name: "Grapevine + Clap", sets: 3, reps: "1 min each direction", notes: "Step-together-step, add arm movements" }, { name: "Body Roll + Squat Combo", sets: 3, reps: "45s", notes: "Roll torso, drop into half squat, pop up" }, { name: "Kick-Ball-Change", sets: 4, reps: "30s each lead", notes: "Classic dance move, keep it bouncy" }, { name: "Side Shuffle + Jump", sets: 3, reps: "1 min", notes: "Shuffle 4 steps right, jump, shuffle left" }, { name: "Hip Circles + Arm Waves", sets: 2, reps: "1 min", notes: "Isolate hips, add flowing arm work" }, { name: "Free Dance Burnout", sets: 1, reps: "3 min", notes: "Put on your favorite song, go all out!" }] },
  { id: "fw3", phase: "follicular", name: "Full Body Strength", type: "strength training", duration: 40, intensity: "medium", muscleGroups: ["glutes", "legs", "arms", "core"], description: "Build strength with compound movements while estrogen supports muscle recovery.", warmup: "5 min jumping jacks + bodyweight squats + arm circles.", cooldown: "5 min full-body stretch.", exercises: [{ name: "Goblet Squats", sets: 3, reps: "12", notes: "Hold weight at chest, sit deep, drive through heels" }, { name: "Dumbbell Romanian Deadlift", sets: 3, reps: "10", notes: "Hinge at hips, slight knee bend" }, { name: "Push-Ups", sets: 3, reps: "10-12", notes: "Full range of motion, core tight" }, { name: "Bent-Over Dumbbell Rows", sets: 3, reps: "12 each arm", notes: "Pull elbow to hip, squeeze shoulder blade" }, { name: "Glute Bridges", sets: 3, reps: "15", notes: "Pause and squeeze at the top for 2s" }, { name: "Plank Hold", sets: 3, hold: "30-45s", notes: "Keep hips level, breathe steadily" }] },
  { id: "fw4", phase: "follicular", name: "Interval Run", type: "running", duration: 25, intensity: "high", muscleGroups: ["legs", "cardio", "core"], description: "Sprint intervals to channel your building energy.", warmup: "5 min easy jog + dynamic leg swings.", cooldown: "3 min walk + standing quad and calf stretch.", exercises: [{ name: "Easy Jog", sets: 1, reps: "3 min", notes: "Warm up your pace, find your rhythm" }, { name: "Sprint Interval", sets: 6, reps: "30s sprint / 60s walk", notes: "80-90% effort on sprints, fully recover on walks" }, { name: "Tempo Run", sets: 1, reps: "5 min", notes: "Comfortably hard pace" }, { name: "Hill Sprints", sets: 4, reps: "20s", notes: "If available, otherwise increase sprint effort" }, { name: "Cool-Down Jog", sets: 1, reps: "3 min", notes: "Gradually slow to a walk" }] },

  { id: "ow1", phase: "ovulatory", name: "Power HIIT Circuit", type: "hiit", duration: 30, intensity: "high", muscleGroups: ["full-body", "cardio", "core"], description: "Maximum intensity to match your peak energy and testosterone boost.", warmup: "4 min skaters + high knees + arm swings.", cooldown: "4 min child’s pose + standing forward fold + deep breathing.", exercises: [{ name: "Burpees", sets: 4, reps: "10", notes: "Full burpee with push-up and jump" }, { name: "Jump Squats", sets: 4, reps: "15", notes: "Explode up, land soft, sit low" }, { name: "Mountain Climbers", sets: 4, reps: "20 each leg", notes: "Fast pace, keep hips low and core tight" }, { name: "Box Jumps", sets: 3, reps: "10", notes: "Use a sturdy box or bench" }, { name: "Plank Jacks", sets: 3, reps: "20", notes: "Feet jump out and in, hold plank position" }, { name: "Bicycle Crunches", sets: 3, reps: "20 each side", notes: "Slow and controlled" }] },
  { id: "ow2", phase: "ovulatory", name: "Power Yoga Flow", type: "yoga", duration: 50, intensity: "high", muscleGroups: ["full-body", "core", "arms", "shoulders"], description: "Challenging arm balances and inversions for your strongest days.", warmup: "5 min Sun Salutation A × 4 + core warm-up.", cooldown: "5 min pigeon pose + reclined twist + savasana.", exercises: [{ name: "Warrior III", sets: 3, hold: "20s each side", notes: "Strong standing leg, reach arms forward" }, { name: "Side Plank", sets: 3, hold: "20s each side", notes: "Stack feet or stagger, reach top arm up" }, { name: "Crow Pose", sets: 4, hold: "15s", notes: "Lean forward, knees on triceps, lift feet" }, { name: "Headstand Prep", sets: 3, hold: "20-30s", notes: "Against a wall if needed" }, { name: "Wheel Pose", sets: 2, hold: "15s", notes: "Press up from bridge, straighten arms and legs" }, { name: "Firefly Pose", sets: 3, hold: "10s", notes: "Advanced — use blocks or substitute with boat pose" }] },
  { id: "ow3", phase: "ovulatory", name: "Outdoor Run", type: "running", duration: 40, intensity: "high", muscleGroups: ["legs", "cardio", "glutes"], description: "Push your pace during your highest-energy phase.", warmup: "5 min easy jog + dynamic lunges.", cooldown: "5 min walk + hip flexor and hamstring stretch.", exercises: [{ name: "Easy Warm-Up Jog", sets: 1, reps: "5 min", notes: "Gradually build pace" }, { name: "Tempo Run", sets: 1, reps: "15 min", notes: "Push to 70-80% effort, steady pace" }, { name: "Fartlek Intervals", sets: 6, reps: "1 min fast / 1 min easy", notes: "Unstructured speed play" }, { name: "Hill Repeats", sets: 3, reps: "45s uphill, walk down", notes: "Find a hill or use treadmill incline" }, { name: "Negative Split Finish", sets: 1, reps: "5 min", notes: "Run the last stretch faster than you started" }] },
  { id: "ow4", phase: "ovulatory", name: "Upper Body Power", type: "strength training", duration: 35, intensity: "high", muscleGroups: ["chest", "shoulders", "arms", "core"], description: "Capitalize on peak strength for upper body gains.", warmup: "4 min band pull-aparts + arm circles + light push-ups.", cooldown: "4 min chest stretch + tricep stretch + child’s pose.", exercises: [{ name: "Push-Up Variations", sets: 3, reps: "8-10 each", notes: "Pick 2-3 variations, go to near failure" }, { name: "Dumbbell Shoulder Press", sets: 3, reps: "10", notes: "Seated or standing, full range overhead" }, { name: "Bent-Over Rows", sets: 3, reps: "12", notes: "Both arms or alternating, squeeze at top" }, { name: "Tricep Dips", sets: 3, reps: "12", notes: "Keep elbows close, don’t flare" }, { name: "Bicep Curls → Hammer Curls superset", sets: 3, reps: "10 + 10", notes: "No rest between the two" }, { name: "Dead Bug", sets: 3, reps: "10 each side", notes: "Lower opposite arm and leg, keep back flat" }] },

  { id: "lw1", phase: "luteal", name: "Pilates Core & Stretch", type: "pilates", duration: 35, intensity: "medium", muscleGroups: ["core", "back", "hips"], description: "Controlled movements to maintain strength as energy shifts.", warmup: "3 min pelvic tilts + breathing + gentle roll-down.", cooldown: "4 min seated spinal twist + figure-four stretch.", exercises: [{ name: "The Hundred", sets: 1, reps: "100 pumps (10 breaths)", notes: "Legs at 45° or tabletop for modification" }, { name: "Single Leg Stretch", sets: 2, reps: "10 each side", notes: "Alternate pulling knee to chest" }, { name: "Pilates Roll-Up", sets: 2, reps: "8", notes: "Articulate through spine, use a band if needed" }, { name: "Side-Lying Leg Lifts", sets: 2, reps: "15 each side", notes: "Keep hips stacked, slow and controlled" }, { name: "Swimming (Prone)", sets: 2, reps: "10 each side", notes: "Alternate arm and leg lifts on belly" }, { name: "Spine Stretch Forward", sets: 2, reps: "6", notes: "Seated, round forward over legs" }] },
  { id: "lw2", phase: "luteal", name: "Nature Walk", type: "walking", duration: 40, intensity: "low", muscleGroups: ["legs", "glutes"], description: "Connect with nature as you wind down. Walking helps ease PMS bloating.", warmup: "2 min hip circles + calf raises.", cooldown: "3 min standing figure-four + quad stretch.", exercises: [{ name: "Steady-pace flat walk", sets: 1, reps: "15 min", notes: "Moderate pace, arms swinging naturally" }, { name: "Walk with deep breathing intervals", sets: 4, reps: "2 min each", notes: "Inhale 4 counts, exhale 6 counts while walking" }, { name: "Gentle incline walk", sets: 1, reps: "10 min", notes: "Find a slight hill or set treadmill to 3-4% incline" }, { name: "Standing balance check", sets: 2, hold: "30s each leg", notes: "Pause trail-side, stand on one foot" }] },
  { id: "lw3", phase: "luteal", name: "Yin Yoga", type: "yoga", duration: 45, intensity: "low", muscleGroups: ["hips", "back", "hamstrings"], description: "Long-held poses to release deep tension and prepare for rest.", warmup: "2 min cross-legged deep breathing + neck rolls.", cooldown: "3 min savasana with blanket.", exercises: [{ name: "Butterfly", sets: 1, hold: "3 min", notes: "Fold forward, let head hang, use a bolster" }, { name: "Dragon Pose (Low Lunge)", sets: 2, hold: "2 min each side", notes: "Deep hip flexor stretch, use blocks under hands" }, { name: "Sleeping Swan (Pigeon)", sets: 2, hold: "3 min each side", notes: "Fold forward over front shin, breathe into hips" }, { name: "Caterpillar (Seated Forward Fold)", sets: 1, hold: "3 min", notes: "Let spine round, gravity does the work" }, { name: "Reclined Spinal Twist", sets: 2, hold: "2 min each side", notes: "Keep both shoulders grounded" }] },
  { id: "lw4", phase: "luteal", name: "Swimming Laps", type: "swimming", duration: 30, intensity: "medium", muscleGroups: ["full-body", "cardio", "shoulders"], description: "Low-impact full-body movement that feels weightless.", warmup: "3 min easy freestyle + 2 min kicking with board.", cooldown: "3 min backstroke + in-water stretching.", exercises: [{ name: "Freestyle Laps", sets: 4, reps: "50m", notes: "Steady pace, focus on long strokes" }, { name: "Backstroke Laps", sets: 3, reps: "50m", notes: "Opens chest, great for posture" }, { name: "Kickboard Laps", sets: 3, reps: "25m", notes: "Isolate legs, flutter kick, core engaged" }, { name: "Pull Buoy Laps", sets: 2, reps: "50m", notes: "Isolate arms without taxing legs" }, { name: "Treading Water", sets: 2, hold: "60s", notes: "Gentle full-body engagement" }] },
];

export const MEDITATIONS: Meditation[] = [
  { id: "med1", name: "Body Scan for Cramps", duration: 10, category: "cycle-specific", phase: "menstrual", description: "Gently release tension throughout your body." },
  { id: "med2", name: "Sleep Wind-Down", duration: 15, category: "sleep", phase: "all", description: "Drift into restful sleep with guided relaxation." },
  { id: "med3", name: "Morning Energy Boost", duration: 7, category: "focus", phase: "follicular", description: "Start your day with intention and clarity." },
  { id: "med4", name: "Confidence Visualization", duration: 10, category: "focus", phase: "ovulatory", description: "Step into your most confident, magnetic self." },
  { id: "med5", name: "Stress Release", duration: 12, category: "stress", phase: "luteal", description: "Let go of tension and find your center." },
  { id: "med6", name: "Gratitude Practice", duration: 8, category: "stress", phase: "all", description: "Cultivate thankfulness and inner peace." },
  { id: "med7", name: "Breath of Calm", duration: 5, category: "stress", phase: "all", description: "Quick breathing exercise for instant relief." },
  { id: "med8", name: "Self-Love Meditation", duration: 15, category: "cycle-specific", phase: "menstrual", description: "Wrap yourself in compassion and warmth." },
];

export function getRecipesForPhase(phase: Phase): Recipe[] {
  return RECIPES.filter((r) => r.phase === phase);
}

export function filterRecipes(
  recipes: Recipe[],
  dietaryPreferences: string[],
  allergies: string[],
): Recipe[] {
  return recipes.filter((recipe) => {
    if (allergies.length > 0) {
      const hasAllergen = recipe.allergens.some((a) =>
        allergies.includes(a.toLowerCase()),
      );
      if (hasAllergen) return false;
    }

    if (dietaryPreferences.length > 0) {
      const matchesDiet = dietaryPreferences.some((pref) =>
        recipe.dietTags.map((t) => t.toLowerCase()).includes(pref.toLowerCase()),
      );
      if (!matchesDiet) return false;
    }

    return true;
  });
}

export function getWorkoutsForPhase(phase: Phase): Workout[] {
  return WORKOUTS.filter((w) => w.phase === phase);
}

export function getMeditationsForPhase(phase: Phase): Meditation[] {
  return MEDITATIONS.filter((m) => m.phase === phase || m.phase === "all");
}

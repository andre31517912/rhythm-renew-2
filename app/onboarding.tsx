import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Platform,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useCycle, type Goal } from "@/contexts/CycleContext";
import Colors from "@/constants/colors";

const { width, height } = Dimensions.get("window");

const GOALS: { id: Goal; label: string; description: string }[] = [
  { id: "sync", label: "Cycle Sync", description: "Align life with your natural rhythm" },
  { id: "fitness", label: "Fitness", description: "Train smarter with your cycle" },
  { id: "hormone-balance", label: "Hormone Balance", description: "Support your hormonal health" },
  { id: "emotional-regulation", label: "Emotional Wellness", description: "Navigate moods with ease" },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useCycle();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [lastPeriodDate, setLastPeriodDate] = useState("");
  const [cycleLength, setCycleLength] = useState("28");
  const [goal, setGoal] = useState<Goal>("sync");
  const [dateError, setDateError] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  function validateDate(dateStr: string): boolean {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateStr.match(regex);
    if (!match) return false;
    const [, month, day, year] = match;
    const m = parseInt(month);
    const d = parseInt(day);
    const y = parseInt(year);
    if (m < 1 || m > 12) return false;
    if (d < 1 || d > 31) return false;
    if (y < 1990 || y > 2100) return false;
    const date = new Date(y, m - 1, d);
    return (
      date.getFullYear() === y &&
      date.getMonth() === m - 1 &&
      date.getDate() === d
    );
  }

  function parseDateInput(dateStr: string): string {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateStr.match(regex);
    if (!match) return dateStr;
    const [, month, day, year] = match;
    return `${year}-${month}-${day}`;
  }

  async function handleNext() {
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 2) {
      if (!validateDate(lastPeriodDate)) {
        setDateError("Enter a valid past date (MM/DD/YYYY)");
        return;
      }
      setDateError("");
    }
    if (step < 4) {
      setStep(step + 1);
    } else {
      await completeOnboarding({
        name: name.trim() || "there",
        lastPeriodStart: parseDateInput(lastPeriodDate),
        cycleLength: parseInt(cycleLength) || 28,
        goal,
      });
      router.replace("/(tabs)");
    }
  }

  const steps = [
    <IntroStep />,
    <WelcomeStep name={name} setName={setName} />,
    <DateStep
      date={lastPeriodDate}
      setDate={(d) => { setLastPeriodDate(d); setDateError(""); }}
      error={dateError}
      cycleLength={cycleLength}
      setCycleLength={setCycleLength}
    />,
    <GoalStep goal={goal} setGoal={setGoal} />,
    <ReadyStep name={name} />,
  ];

  const isIntro = step === 0;

  return (
    <View style={[styles.container, { paddingTop: topPad, backgroundColor: Colors.cream }]}>
      {isIntro ? (
        <View style={[styles.introContainer, { paddingBottom: insets.bottom + 24 }]}>
          <Animated.View entering={FadeInDown.duration(500)} style={styles.introContent}>
            <Image
              source={require("@/assets/images/rhythm-wordmark.png")}
              style={styles.introLogoImg}
              resizeMode="contain"
            />
            <Image
              source={require("@/assets/images/rhythm-ladies.png")}
              style={styles.ladiesImg}
              resizeMode="contain"
            />
            <Text style={styles.introWelcome}>Welcome to Rhythm Renew</Text>
            <Text style={styles.introSub}>
              Recharge, renew, and restore your natural rhythm
            </Text>
          </Animated.View>
          <Pressable
            style={({ pressed }) => [styles.introBtn, pressed && { opacity: 0.88 }]}
            onPress={handleNext}
          >
            <Text style={styles.introBtnText}>Get Started</Text>
          </Pressable>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.logoRow}>
            <Image
              source={require("@/assets/images/rhythm-logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.stepsIndicator}>
            {[1, 2, 3, 4].map((i) => (
              <View
                key={i}
                style={[
                  styles.stepDot,
                  i <= step ? styles.stepDotActive : styles.stepDotInactive,
                ]}
              />
            ))}
          </View>

          <Animated.View
            key={step}
            entering={FadeInDown.duration(400)}
            style={styles.stepContainer}
          >
            {steps[step]}
          </Animated.View>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 32 }]}>
            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              onPress={handleNext}
            >
              <LinearGradient
                colors={["#E8388F", "#C0206E"]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.buttonText}>
                  {step === 4 ? "Begin Your Journey" : "Continue"}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

function IntroStep() {
  return null;
}

function WelcomeStep({ name, setName }: { name: string; setName: (n: string) => void }) {
  return (
    <View style={styles.step}>
      <Text style={styles.stepSubtitle}>
        Your cycle-aligned wellness companion. Let's personalize your experience.
      </Text>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>What's your name?</Text>
        <TextInput
          style={styles.input}
          placeholder="Your name"
          placeholderTextColor={Colors.grayLight}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          returnKeyType="done"
        />
      </View>
    </View>
  );
}

function DateStep({
  date,
  setDate,
  error,
  cycleLength,
  setCycleLength,
}: {
  date: string;
  setDate: (d: string) => void;
  error: string;
  cycleLength: string;
  setCycleLength: (l: string) => void;
}) {
  function formatDateInput(text: string): string {
    const digits = text.replace(/\D/g, "");
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
  }

  return (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>Your Cycle</Text>
      <Text style={styles.stepSubtitle}>
        This helps us calculate your current phase and tailor your daily plan.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>First day of your last period</Text>
        <TextInput
          style={[styles.input, error ? styles.inputError : null]}
          placeholder="MM/DD/YYYY"
          placeholderTextColor={Colors.grayLight}
          value={date}
          onChangeText={(t) => setDate(formatDateInput(t))}
          keyboardType="numeric"
          maxLength={10}
          returnKeyType="done"
        />
        {!!error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Average cycle length (days)</Text>
        <View style={styles.cycleLengthRow}>
          {["21", "24", "28", "30", "35"].map((len) => (
            <Pressable
              key={len}
              style={[
                styles.cycleChip,
                cycleLength === len && styles.cycleChipSelected,
              ]}
              onPress={() => {
                setCycleLength(len);
                Haptics.selectionAsync();
              }}
            >
              <Text style={[
                styles.cycleChipText,
                cycleLength === len && styles.cycleChipTextSelected,
              ]}>{len}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

function GoalStep({ goal, setGoal }: { goal: Goal; setGoal: (g: Goal) => void }) {
  return (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>Your Primary Goal</Text>
      <Text style={styles.stepSubtitle}>
        We'll customize your recommendations to support what matters most to you.
      </Text>
      <View style={styles.goalsGrid}>
        {GOALS.map((g) => (
          <Pressable
            key={g.id}
            style={[styles.goalCard, goal === g.id && styles.goalCardSelected]}
            onPress={() => {
              setGoal(g.id);
              Haptics.selectionAsync();
            }}
          >
            <Text style={[styles.goalLabel, goal === g.id && styles.goalLabelSelected]}>
              {g.label}
            </Text>
            <Text style={[styles.goalDesc, goal === g.id && styles.goalDescSelected]}>
              {g.description}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function ReadyStep({ name }: { name: string }) {
  return (
    <View style={[styles.step, { alignItems: "center" }]}>
      <View style={styles.readyIconWrap}>
        <Ionicons name="heart" size={72} color={Colors.burgundy} />
      </View>
      <Text style={[styles.stepTitle, { textAlign: "center" }]}>
        You're ready,{"\n"}{name || "beautiful"}
      </Text>
      <Text style={[styles.stepSubtitle, { textAlign: "center" }]}>
        Your personalized cycle dashboard, AI coach, and daily rituals are waiting. Let's align.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  introContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingTop: 8,
  },
  introContent: {
    alignItems: "center",
  },
  introLogoImg: {
    width: width - 48,
    height: 260,
    alignSelf: "center",
    marginBottom: -90,
  },
  ladiesImg: {
    width: width,
    height: 340,
    alignSelf: "center",
    marginBottom: 8,
    marginTop: -16,
  },
  introWelcome: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 26,
    color: Colors.burgundy,
    textAlign: "center",
    marginBottom: 6,
  },
  introSub: {
    fontFamily: "Manrope_700Bold",
    fontSize: 17,
    color: Colors.burgundy,
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 12,
  },
  introBtn: {
    backgroundColor: Colors.burgundy,
    borderRadius: 50,
    paddingVertical: 20,
    alignItems: "center",
  },
  introBtnText: {
    fontFamily: "Manrope_700Bold",
    fontSize: 18,
    color: Colors.hotPink,
    letterSpacing: 0.3,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
  },
  logoRow: {
    alignItems: "flex-start",
    marginTop: 20,
  },
  logoImage: {
    width: 190,
    height: 190,
  },
  stepsIndicator: {
    flexDirection: "row",
    gap: 8,
    marginTop: 24,
    marginBottom: 8,
  },
  stepDot: {
    height: 4,
    borderRadius: 2,
    flex: 1,
  },
  stepDotActive: {
    backgroundColor: Colors.hotPink,
  },
  stepDotInactive: {
    backgroundColor: Colors.blushMid,
  },
  stepContainer: {
    flex: 1,
    minHeight: 360,
  },
  step: {
    paddingTop: 32,
  },
  stepTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 32,
    color: Colors.burgundy,
    lineHeight: 42,
    marginBottom: 12,
  },
  stepSubtitle: {
    fontFamily: "Manrope_400Regular",
    fontSize: 15,
    color: Colors.gray,
    lineHeight: 24,
    marginBottom: 36,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontFamily: "Manrope_500Medium",
    fontSize: 13,
    color: Colors.burgundy,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: Colors.blushLight,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontFamily: "Manrope_400Regular",
    fontSize: 16,
    color: Colors.burgundy,
    borderWidth: 1.5,
    borderColor: Colors.blushMid,
  },
  inputError: {
    borderColor: "#C0392B",
  },
  errorText: {
    fontFamily: "Manrope_400Regular",
    fontSize: 12,
    color: "#C0392B",
    marginTop: 6,
  },
  cycleLengthRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  cycleChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 50,
    backgroundColor: Colors.blushLight,
    borderWidth: 1.5,
    borderColor: Colors.blushMid,
  },
  cycleChipSelected: {
    backgroundColor: Colors.hotPink,
    borderColor: Colors.hotPink,
  },
  cycleChipText: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 15,
    color: Colors.gray,
  },
  cycleChipTextSelected: {
    color: Colors.white,
  },
  goalsGrid: {
    gap: 12,
  },
  goalCard: {
    backgroundColor: Colors.blushLight,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: Colors.blushMid,
  },
  goalCardSelected: {
    backgroundColor: Colors.blushLight,
    borderColor: Colors.hotPink,
  },
  goalLabel: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 15,
    color: Colors.burgundy,
    marginBottom: 4,
  },
  goalLabelSelected: {
    color: Colors.hotPink,
  },
  goalDesc: {
    fontFamily: "Manrope_400Regular",
    fontSize: 13,
    color: Colors.gray,
  },
  goalDescSelected: {
    color: Colors.burgundyLight,
  },
  readyIconWrap: {
    marginBottom: 28,
    marginTop: 20,
  },
  footer: {
    paddingTop: 32,
  },
  button: {
    borderRadius: 50,
    overflow: "hidden",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: "center",
  },
  buttonText: {
    fontFamily: "Manrope_700Bold",
    fontSize: 16,
    color: Colors.white,
    letterSpacing: 0.3,
  },
});

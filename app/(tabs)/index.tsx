import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Dimensions,
  Image,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useCycle } from "@/contexts/CycleContext";
import Colors from "@/constants/colors";
import { WaveHeader } from "@/components/WaveHeader";
import { useRouter } from "expo-router";
import { getApiUrl } from "@/lib/query-client";
import { usePhasePlan } from "@/hooks/usePhasePlan";

const getEbookUrl = () => new URL("/assets/downloads/rhythm-renew-guide.pdf", getApiUrl()).toString();
const PHASE_COLORS: Record<string, string> = {
  menstrual: Colors.menstrual,
  follicular: Colors.follicular,
  ovulatory: Colors.ovulatory,
  luteal: Colors.luteal,
};

function getDayPhase(dayNum: number): string {
  if (dayNum <= 5) return "menstrual";
  if (dayNum <= 13) return "follicular";
  if (dayNum <= 16) return "ovulatory";
  return "luteal";
}

const { width } = Dimensions.get("window");

const PHASE_RECOMMENDATIONS = {
  menstrual: {
    workout: { title: "Yin Yoga & Gentle Flow" },
    journal: { title: "Rest & Release Reflection", prompt: "What does your body need most right now?" },
    nutrition: { title: "Iron & Omega-3 Rich Foods", detail: "Dark leafy greens, salmon, dark chocolate" },
    protein: { title: "Rhythm Vanilla Protein Blend", detail: "Supports hormone balance during your bleed phase" },
    music: { title: "Slow & Grounding Instrumental", mood: "Ethereal · Piano · Ambient" },
  },
  follicular: {
    workout: { title: "HIIT & Strength Training" },
    journal: { title: "Creative Intention Setting", prompt: "What new chapter am I ready to begin?" },
    nutrition: { title: "Probiotic & Phytoestrogen Foods", detail: "Fermented foods, seeds, cruciferous vegetables" },
    protein: { title: "Rhythm Vanilla Protein Blend", detail: "Fuels your rising energy and muscle repair" },
    music: { title: "Upbeat Light Pop Energy", mood: "Pop · Indie · Uplifting" },
  },
  ovulatory: {
    workout: { title: "High-Intensity & Cardio Power" },
    journal: { title: "Peak Power Gratitude", prompt: "What am I most magnetic and confident about today?" },
    nutrition: { title: "Anti-Inflammatory Focus", detail: "Colorful vegetables, fiber, whole grains" },
    protein: { title: "Rhythm Vanilla Protein Blend", detail: "Recover stronger at peak performance" },
    music: { title: "Confident High-Energy Anthems", mood: "Dance · R&B · High Energy" },
  },
  luteal: {
    workout: { title: "Pilates & Low-Impact Flow" },
    journal: { title: "Emotional Processing & Softness", prompt: "What feelings am I ready to honor and release?" },
    nutrition: { title: "Magnesium & Complex Carbs", detail: "Sweet potato, nuts, pumpkin seeds, dark chocolate" },
    protein: { title: "Rhythm Vanilla Protein Blend", detail: "Stabilizes mood and reduces PMS symptoms" },
    music: { title: "Deep Emotional & Calming R&B", mood: "R&B · Calm · Soulful" },
  },
};

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cycleData, phaseInfo } = useCycle();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const recs = phaseInfo ? PHASE_RECOMMENDATIONS[phaseInfo.phase] : PHASE_RECOMMENDATIONS.follicular;
  const phaseColor = phaseInfo?.color || Colors.hotPink;
  const phaseColorLight = phaseInfo?.colorLight || Colors.blushLight;
  const { todaysPlan } = usePhasePlan();

  return (
    <View style={[styles.container]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad + 100 }}
      >
        {/* Header */}
        <WaveHeader topPad={topPad} phaseColor={phaseColor} showLogo>
          <Animated.View entering={FadeInDown.duration(500)}>
            <Text style={styles.greeting}>
              Hey, {cycleData.name || "beautiful"} ✦
            </Text>
            <Text style={styles.greetingSub}>You're in your</Text>
            <Text style={styles.phaseName}>
              {phaseInfo?.phaseName || "Follicular"} Phase
            </Text>
            <Text style={styles.phaseDay}>
              Cycle Day {phaseInfo?.cycleDay ?? "—"} · Day {phaseInfo?.phaseDay ?? "—"} of {phaseInfo?.phaseLength ?? "—"}
            </Text>
          </Animated.View>

          {/* Cycle Phase Segments */}
          <View style={styles.progressRow}>
            {[0, 1, 2, 3].map((i) => {
              const phases = ["menstrual", "follicular", "ovulatory", "luteal"];
              const labels = ["Menstrual", "Follicular", "Ovulatory", "Luteal"];
              const isActive = phaseInfo?.phase === phases[i];
              return (
                <View key={i} style={styles.phaseSegCol}>
                  <View
                    style={[
                      styles.phaseSegment,
                      { backgroundColor: isActive ? "#610015" : "rgba(97,0,21,0.25)" },
                      isActive && { transform: [{ scaleY: 1.5 }] },
                    ]}
                  />
                  <Text style={[styles.phaseSegLabel, isActive && styles.phaseSegLabelActive]}>
                    {labels[i]}
                  </Text>
                </View>
              );
            })}
          </View>
        </WaveHeader>

        {/* Hormone Insight Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.section}>
          <View style={[styles.insightCard, { backgroundColor: phaseColorLight }]}>
            <View style={[styles.insightIcon, { backgroundColor: phaseColor }]}>
              <Ionicons name="flask" size={18} color={Colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.insightTitle}>Hormone Insight</Text>
              <Text style={styles.insightText}>{phaseInfo?.hormoneInsight}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Today's Recommendations */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Recommendations</Text>
          <View style={styles.cardsGrid}>
            <RecommendationCard
              icon="restaurant"
              label="Today's Recipe"
              title={todaysPlan?.recipe.name ?? recs.nutrition.title}
              subtitle={todaysPlan ? `${todaysPlan.recipe.prepTime} min prep` : recs.nutrition.detail}
              accent={phaseColor}
              onPress={() => router.push("/(tabs)/body")}
              cta="View Recipe"
            />
            <RecommendationCard
              icon="barbell"
              label="Today's Workout"
              title={todaysPlan?.workout.name ?? recs.workout.title}
              subtitle={todaysPlan ? `${todaysPlan.workout.duration} min · ${todaysPlan.workout.intensity}` : undefined}
              accent={phaseColor}
              onPress={() => router.push("/(tabs)/body")}
              cta="Start Workout"
            />
            <RecommendationCard
              icon="create"
              label="Journal"
              title={recs.journal.title}
              subtitle={recs.journal.prompt}
              accent={phaseColor}
              onPress={() => router.push("/(tabs)/soul")}
              cta="Write Today"
            />
            <RecommendationCard
              icon="musical-notes"
              label="Music Vibe"
              title={recs.music.title}
              subtitle={recs.music.mood}
              accent={phaseColor}
              onPress={() => WebBrowser.openBrowserAsync("https://open.spotify.com/user/31am3sxmcjkix34wtbt5gogoi6li")}
              cta="Open Music"
            />
          </View>

          {/* Phase Plan Progress */}
          {phaseInfo && todaysPlan && (
            <Pressable
              style={[styles.planProgress, { borderColor: phaseColor + "40" }]}
              onPress={() => router.push("/(tabs)/body")}
            >
              <View style={styles.planProgressRow}>
                <Ionicons name="calendar" size={16} color={phaseColor} />
                <Text style={styles.planProgressText}>
                  Day {phaseInfo.phaseDay} of {phaseInfo.phaseLength} · {phaseInfo.phaseName} Plan
                </Text>
                <View style={{ flex: 1 }} />
                <Text style={[styles.planProgressLink, { color: phaseColor }]}>View Full Plan</Text>
                <Ionicons name="chevron-forward" size={14} color={phaseColor} />
              </View>
              <View style={styles.planProgressBar}>
                <View
                  style={[
                    styles.planProgressFill,
                    {
                      width: `${(phaseInfo.phaseDay / phaseInfo.phaseLength) * 100}%`,
                      backgroundColor: phaseColor,
                    },
                  ]}
                />
              </View>
            </Pressable>
          )}
        </Animated.View>

        {/* Phase Description */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={[styles.section, { paddingHorizontal: 20 }]}>
          <LinearGradient
            colors={[phaseColor + "22", phaseColor + "11"]}
            style={styles.phaseDescCard}
          >
            <Text style={styles.phaseDescLabel}>
              {phaseInfo?.phaseName || "Follicular"} Phase Energy
            </Text>
            <Text style={styles.phaseDescText}>{phaseInfo?.description || "Rise & energize"}</Text>
            <Text style={styles.phaseDescSub}>
              Use this time to start new projects, socialize, and push your physical limits. Your body is primed for action.
            </Text>
          </LinearGradient>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function RecommendationCard({
  icon,
  label,
  title,
  subtitle,
  accent,
  onPress,
  cta,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  title: string;
  subtitle?: string;
  accent: string;
  onPress?: () => void;
  cta?: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.recCard,
        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
      ]}
      onPress={() => {
        if (onPress) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }
      }}
    >
      <View style={[styles.recIconBg, { backgroundColor: accent + "18" }]}>
        <Ionicons name={icon} size={20} color={accent} />
      </View>
      <Text style={[styles.recLabel, { color: accent }]}>{label}</Text>
      <Text style={styles.recTitle} numberOfLines={2}>{title}</Text>
      {subtitle ? <Text style={styles.recSubtitle} numberOfLines={2}>{subtitle}</Text> : null}
      {cta ? (
        <View style={[styles.recCta, { backgroundColor: accent }]}>
          <Text style={styles.recCtaText}>{cta}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pageBg,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  greeting: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontStyle: "italic",
    fontSize: 34,
    color: "#610015",
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  greetingSub: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 18,
    color: "#850020",
    marginTop: 4,
  },
  phaseName: {
    fontFamily: "PlayfairDisplay_900Black",
    fontSize: 56,
    color: "#610015",
    lineHeight: 62,
    fontStyle: "italic",
  },
  phaseDay: {
    fontFamily: "Manrope_500Medium",
    fontSize: 15,
    color: "#610015",
    marginTop: 4,
  },
  progressRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 20,
    overflow: "visible",
  },
  phaseSegCol: {
    flex: 1,
    alignItems: "center",
    gap: 5,
  },
  phaseSegment: {
    width: "100%",
    height: 6,
    borderRadius: 3,
  },
  phaseSegLabel: {
    fontFamily: "Manrope_500Medium",
    fontSize: 9,
    color: "rgba(97,0,21,0.5)",
    letterSpacing: 0.2,
    textAlign: "center",
  },
  phaseSegLabelActive: {
    color: "#610015",
    fontFamily: "Manrope_700Bold",
  },
  section: {
    marginTop: 24,
  },
  insightCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  insightIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  insightTitle: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 12,
    color: Colors.burgundy,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  insightText: {
    fontFamily: "Manrope_400Regular",
    fontSize: 14,
    color: Colors.burgundy,
    lineHeight: 22,
  },
  sectionTitle: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 17,
    color: "#FFB3C6",
    marginBottom: 14,
    paddingHorizontal: 20,
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 20,
  },
  recCard: {
    backgroundColor: Colors.blushLight,
    borderRadius: 20,
    padding: 16,
    width: (width - 52) / 2,
    minHeight: 140,
    shadowColor: Colors.hotPink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  recIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  recLabel: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  recTitle: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 13,
    color: Colors.burgundy,
    lineHeight: 19,
  },
  recSubtitle: {
    fontFamily: "Manrope_400Regular",
    fontSize: 11,
    color: Colors.gray,
    marginTop: 4,
    lineHeight: 16,
  },
  recCta: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 50,
    alignSelf: "flex-start",
  },
  recCtaText: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 10,
    color: Colors.white,
  },
  planProgress: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    backgroundColor: "rgba(252,228,236,0.08)",
  },
  planProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  planProgressText: {
    fontFamily: "Manrope_500Medium",
    fontSize: 13,
    color: "#FFB3C6",
  },
  planProgressLink: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 12,
  },
  planProgressBar: {
    height: 4,
    backgroundColor: "rgba(255,179,198,0.2)",
    borderRadius: 2,
    marginTop: 10,
    overflow: "hidden",
  },
  planProgressFill: {
    height: "100%",
    borderRadius: 2,
  },
  phaseDescCard: {
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: "#FFB3C6",
  },
  phaseDescLabel: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 4,
    color: "#FFB3C6",
  },
  phaseDescText: {
    fontFamily: "PlayfairDisplay_900Black",
    fontStyle: "italic",
    fontSize: 30,
    color: "#FFB3C6",
    marginBottom: 10,
  },
  phaseDescSub: {
    fontFamily: "Manrope_400Regular",
    fontSize: 14,
    color: "#FFB3C6",
    lineHeight: 22,
  },
});

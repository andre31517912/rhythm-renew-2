import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useCycle } from "@/contexts/CycleContext";
import Colors from "@/constants/colors";
import { WaveHeader } from "@/components/WaveHeader";
import { AIRecommendCard } from "@/components/AIRecommendCard";
import { NutritionTab } from "@/components/NutritionTab";


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
          <NutritionTab
            phase={phase}
            phaseColor={phaseColor}
            phaseColorLight={phaseColorLight}
            phaseName={phaseInfo?.phaseName || "Follicular"}
            cycleDay={phaseInfo?.cycleDay ?? 1}
          />
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
});

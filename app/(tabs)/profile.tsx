import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCycle, type Goal } from "@/contexts/CycleContext";
import Colors from "@/constants/colors";
import { WaveHeader } from "@/components/WaveHeader";
import { getApiUrl } from "@/lib/query-client";

const getEbookUrl = () => new URL("/assets/downloads/rhythm-renew-guide.pdf", getApiUrl()).toString();

const GOAL_LABELS: Record<Goal, string> = {
  sync: "Cycle Sync",
  fitness: "Fitness",
  "hormone-balance": "Hormone Balance",
  "emotional-regulation": "Emotional Wellness",
};

const PHASE_COLORS: Record<string, string> = {
  menstrual: Colors.menstrual,
  follicular: Colors.follicular,
  ovulatory: Colors.ovulatory,
  luteal: Colors.luteal,
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { cycleData, phaseInfo, setCycleData } = useCycle();
  const [activeSection, setActiveSection] = useState<"profile" | "shop" | "calendar">("profile");
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const phaseColor = phaseInfo?.color || Colors.hotPink;

  async function handleReset() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Reset App",
      "This will clear all your data and restart the onboarding. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.clear();
            router.replace("/onboarding");
          },
        },
      ]
    );
  }

  // Simple calendar for current cycle
  const today = new Date();
  const cycleStart = cycleData.lastPeriodStart ? new Date(cycleData.lastPeriodStart) : null;

  const getDayPhase = (dayNum: number): string => {
    if (dayNum <= 5) return "menstrual";
    if (dayNum <= 13) return "follicular";
    if (dayNum <= 16) return "ovulatory";
    return "luteal";
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad + 100 }}
      >
        {/* Header */}
        <WaveHeader topPad={topPad} phaseColor={phaseColor} showLogo>
          <View style={styles.avatarRow}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {cycleData.name?.charAt(0)?.toUpperCase() || "R"}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{cycleData.name || "Rhythm User"}</Text>
              <Text style={styles.profileGoal}>{GOAL_LABELS[cycleData.goal]}</Text>
            </View>
          </View>

          {/* Phase Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{phaseInfo?.cycleDay ?? "—"}</Text>
              <Text style={styles.statLabel}>Cycle Day</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{cycleData.cycleLength}</Text>
              <Text style={styles.statLabel}>Cycle Length</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { fontSize: 16 }]} adjustsFontSizeToFit numberOfLines={1}>{phaseInfo?.phaseName ?? "—"}</Text>
              <Text style={styles.statLabel}>Phase</Text>
            </View>
          </View>
        </WaveHeader>

        {/* Section Toggle */}
        <View style={styles.sectionTabs}>
          {(["profile", "calendar", "shop"] as const).map((s) => (
            <Pressable
              key={s}
              style={[styles.sectionTab, activeSection === s && { borderBottomColor: phaseColor, borderBottomWidth: 2 }]}
              onPress={() => {
                setActiveSection(s);
                Haptics.selectionAsync();
              }}
            >
              <Text style={[
                styles.sectionTabText,
                activeSection === s && { color: phaseColor, fontFamily: "Manrope_600SemiBold" },
              ]}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {activeSection === "profile" && (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.content}>
            <Text style={styles.sectionTitle}>My Profile</Text>

            <SettingRow icon="person-outline" label="Name" value={cycleData.name || "—"} color={phaseColor} />
            <SettingRow icon="calendar-outline" label="Cycle Length" value={`${cycleData.cycleLength} days`} color={phaseColor} />
            <SettingRow icon="trophy-outline" label="Primary Goal" value={GOAL_LABELS[cycleData.goal]} color={phaseColor} />

            <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Settings</Text>

            <Pressable
              style={({ pressed }) => [styles.settingCard, pressed && { opacity: 0.8 }]}
              onPress={() => WebBrowser.openBrowserAsync("https://www.rhythmrenew.com")}
            >
              <View style={[styles.settingIcon, { backgroundColor: phaseColor + "18" }]}>
                <Ionicons name="globe-outline" size={20} color={phaseColor} />
              </View>
              <Text style={styles.settingLabel}>Visit Rhythm Renew Website</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.grayLight} />
            </Pressable>

            <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Legal & Wellness</Text>

            <DisclaimerCard color={phaseColor} />

            <Pressable
              style={({ pressed }) => [styles.resetBtn, pressed && { opacity: 0.8 }]}
              onPress={handleReset}
            >
              <Ionicons name="refresh-outline" size={16} color={Colors.hotPink} />
              <Text style={styles.resetText}>Reset & Restart Onboarding</Text>
            </Pressable>
          </Animated.View>
        )}

        {activeSection === "calendar" && (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.content}>
            <Text style={styles.sectionTitle}>Cycle Calendar</Text>
            <Text style={styles.sectionSub}>Your {cycleData.cycleLength}-day cycle phase overview</Text>

            {/* Phase legend */}
            <View style={styles.legendRow}>
              {(["menstrual", "follicular", "ovulatory", "luteal"] as const).map((p) => {
                const names = { menstrual: "Menstrual", follicular: "Follicular", ovulatory: "Ovulatory", luteal: "Luteal" };
                return (
                  <View key={p} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: PHASE_COLORS[p] }]} />
                    <Text style={styles.legendText}>{names[p]}</Text>
                  </View>
                );
              })}
            </View>

            {/* Day Grid */}
            <View style={styles.dayGrid}>
              {Array.from({ length: cycleData.cycleLength }, (_, i) => i + 1).map((day) => {
                const phase = getDayPhase(day);
                const isToday = day === phaseInfo?.cycleDay;
                return (
                  <View
                    key={day}
                    style={[
                      styles.dayCell,
                      { backgroundColor: isToday ? PHASE_COLORS[phase] : Colors.blushLight },
                      isToday && styles.dayCellToday,
                    ]}
                  >
                    <Text style={[
                      styles.dayCellText,
                      { color: isToday ? Colors.white : PHASE_COLORS[phase] },
                    ]}>{day}</Text>
                  </View>
                );
              })}
            </View>

            {/* Phase key */}
            <View style={styles.phaseKeyGrid}>
              {(["menstrual", "follicular", "ovulatory", "luteal"] as const).map((p) => {
                const ranges: Record<string, string> = {
                  menstrual: "Days 1–5",
                  follicular: "Days 6–13",
                  ovulatory: "Days 14–16",
                  luteal: `Days 17–${cycleData.cycleLength}`,
                };
                const names: Record<string, string> = {
                  menstrual: "Menstrual",
                  follicular: "Follicular",
                  ovulatory: "Ovulatory",
                  luteal: "Luteal",
                };
                const isActive = phaseInfo?.phase === p;
                return (
                  <View key={p} style={[styles.phaseKeyCard, isActive && { borderColor: PHASE_COLORS[p], borderWidth: 2 }]}>
                    <View style={[styles.phaseKeyDot, { backgroundColor: PHASE_COLORS[p] }]} />
                    <View>
                      <Text style={[styles.phaseKeyName, { color: PHASE_COLORS[p] }]}>{names[p]}</Text>
                      <Text style={styles.phaseKeyRange}>{ranges[p]}</Text>
                    </View>
                    {isActive && (
                      <View style={[styles.currentBadge, { backgroundColor: PHASE_COLORS[p] }]}>
                        <Text style={styles.currentBadgeText}>Now</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </Animated.View>
        )}

        {activeSection === "shop" && (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.content}>
            <Text style={styles.sectionTitle}>Rhythm Renew Shop</Text>

            {/* Protein Product */}
            <Pressable
              style={({ pressed }) => [styles.productCard, pressed && { opacity: 0.95 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                WebBrowser.openBrowserAsync("https://www.rhythmrenew.com/product-page/rhythm-vanilla-protein-blend-cycle-supporting-nutrition");
              }}
            >
              <View style={styles.productImgClip}>
                <Image
                  source={require("../../assets/images/protein-product.png")}
                  style={styles.productImageBg}
                  contentFit="cover"
                  contentPosition="center"
                  cachePolicy="memory-disk"
                  transition={0}
                />
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productBadge}>Featured Product</Text>
                <Text style={styles.productName}>Rhythm Vanilla Protein Blend</Text>
                <Text style={styles.productDesc}>
                  Cycle-supporting nutrition formulated with ingredients that work with your hormones, not against them.
                </Text>
                <View style={styles.productActions}>
                  <Pressable
                    style={[styles.buyBtn, { backgroundColor: phaseColor }]}
                    onPress={() => WebBrowser.openBrowserAsync("https://www.rhythmrenew.com/product-page/rhythm-vanilla-protein-blend-cycle-supporting-nutrition")}
                  >
                    <Text style={styles.buyBtnText}>Shop Now</Text>
                    <Ionicons name="arrow-forward" size={14} color={Colors.white} />
                  </Pressable>
                  <Pressable
                    style={styles.saveBtn}
                    onPress={() => WebBrowser.openBrowserAsync("https://www.rhythmrenew.com/product-page/rhythm-vanilla-protein-blend-cycle-supporting-nutrition")}
                  >
                    <Ionicons name="heart-outline" size={14} color={phaseColor} />
                    <Text style={[styles.saveBtnText, { color: phaseColor }]}>Subscribe & Save</Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>

            {/* E-Book */}
            <Pressable
              style={({ pressed }) => [styles.ebookCard, pressed && { opacity: 0.9 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                WebBrowser.openBrowserAsync(getEbookUrl());
              }}
            >
              <View style={styles.ebookGradient}>
                <View style={styles.ebookLeft}>
                  <Image
                    source={require("@/assets/images/ebook-cover.jpeg")}
                    style={styles.ebookCoverImg}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={0}
                  />
                </View>
                <View style={styles.ebookBody}>
                  <View style={styles.ebookBadgeRow}>
                    <View style={styles.ebookBadge}>
                      <Text style={styles.ebookBadgeText}>FREE DOWNLOAD</Text>
                    </View>
                  </View>
                  <Text style={styles.ebookTitle}>Ultimate Wellness{"\n"}Guide</Text>
                  <Text style={styles.ebookSub}>Cycle-syncing, fertility & menopause — every stage of life</Text>
                  <View style={styles.ebookBtn}>
                    <Ionicons name="download-outline" size={14} color={Colors.white} />
                    <Text style={styles.ebookBtnText}>Download PDF</Text>
                  </View>
                </View>
              </View>
            </Pressable>

          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

function SettingRow({ icon, label, value, color }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; color: string }) {
  return (
    <View style={styles.settingCard}>
      <View style={[styles.settingIcon, { backgroundColor: color + "18" }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.settingValue}>{value}</Text>
    </View>
  );
}

function DisclaimerCard({ color }: { color: string }) {
  return (
    <View style={[styles.disclaimerCard, { borderLeftColor: color }]}>
      <Text style={styles.disclaimerTitle}>Wellness Disclaimer</Text>
      <Text style={styles.disclaimerText}>
        Rhythm Renew is a wellness education app. Information provided is for educational purposes only and does not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical concerns. Individual experiences vary.
      </Text>
      <Pressable onPress={() => WebBrowser.openBrowserAsync("https://www.rhythmrenew.com/privacy-policy")}>
        <Text style={[styles.privacyLink, { color }]}>View Privacy Policy</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.pageBg },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 24 },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(97,0,21,0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(97,0,21,0.35)",
  },
  profileAvatarText: { fontFamily: "PlayfairDisplay_900Black", fontSize: 28, color: "#610015" },
  profileName: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 22, color: "#610015" },
  profileGoal: { fontFamily: "Manrope_400Regular", fontSize: 13, color: "rgba(97,0,21,0.65)", marginTop: 2 },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(97,0,21,0.08)",
    borderRadius: 16,
    padding: 16,
  },
  statBox: { flex: 1, alignItems: "center" },
  statValue: { fontFamily: "Manrope_700Bold", fontSize: 24, color: "#610015" },
  statLabel: { fontFamily: "Manrope_400Regular", fontSize: 11, color: "rgba(97,0,21,0.6)", marginTop: 2 },
  statDivider: { width: 1, backgroundColor: "rgba(97,0,21,0.2)", marginVertical: 4 },
  sectionTabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.blushMid,
    backgroundColor: Colors.blushLight,
  },
  sectionTab: { flex: 1, alignItems: "center", paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: "transparent" },
  sectionTabText: { fontFamily: "Manrope_500Medium", fontSize: 14, color: Colors.gray },
  content: { paddingTop: 24 },
  sectionTitle: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 17,
    color: "#FFB3C6",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionSub: {
    fontFamily: "Manrope_400Regular",
    fontSize: 13,
    color: "rgba(252,228,236,0.75)",
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: -8,
  },
  settingCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.blushMid,
    backgroundColor: Colors.blushLight,
  },
  settingIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  settingLabel: { fontFamily: "Manrope_500Medium", fontSize: 15, color: Colors.burgundy, flex: 1 },
  settingValue: { fontFamily: "Manrope_400Regular", fontSize: 14, color: Colors.gray },
  disclaimerCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.blushLight,
    borderRadius: 16,
    padding: 18,
    borderLeftWidth: 4,
  },
  disclaimerTitle: { fontFamily: "Manrope_600SemiBold", fontSize: 14, color: Colors.burgundy, marginBottom: 8 },
  disclaimerText: { fontFamily: "Manrope_400Regular", fontSize: 13, color: Colors.grayDark, lineHeight: 20 },
  privacyLink: { fontFamily: "Manrope_600SemiBold", fontSize: 13, marginTop: 12 },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginTop: 28,
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: Colors.blushLight,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.hotPink,
  },
  resetText: { fontFamily: "Manrope_500Medium", fontSize: 14, color: Colors.hotPink },
  legendRow: { flexDirection: "row", flexWrap: "wrap", columnGap: 16, rowGap: 8, paddingHorizontal: 20, marginBottom: 20 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontFamily: "Manrope_400Regular", fontSize: 12, color: Colors.gray },
  dayGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  dayCell: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCellToday: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  dayCellText: { fontFamily: "Manrope_600SemiBold", fontSize: 12 },
  phaseKeyGrid: { gap: 10, paddingHorizontal: 20 },
  phaseKeyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.blushLight,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.blushMid,
  },
  phaseKeyDot: { width: 12, height: 12, borderRadius: 6, flexShrink: 0 },
  phaseKeyName: { fontFamily: "Manrope_600SemiBold", fontSize: 14 },
  phaseKeyRange: { fontFamily: "Manrope_400Regular", fontSize: 12, color: Colors.gray },
  currentBadge: { marginLeft: "auto", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 50 },
  currentBadgeText: { fontFamily: "Manrope_600SemiBold", fontSize: 10, color: Colors.white },
  productCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.blushLight,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: Colors.hotPink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  productImgClip: {
    height: 240,
    overflow: "hidden",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  productImageBg: {
    height: 240,
    width: "100%",
  },
  productInfo: { padding: 20 },
  productBadge: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 10,
    color: Colors.hotPink,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  productName: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 20, color: Colors.burgundy, marginBottom: 8 },
  productDesc: { fontFamily: "Manrope_400Regular", fontSize: 13, color: Colors.gray, lineHeight: 20, marginBottom: 16 },
  productActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  buyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 50,
  },
  buyBtnText: { fontFamily: "Manrope_700Bold", fontSize: 13, color: Colors.white },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: Colors.blushMid,
  },
  saveBtnText: { fontFamily: "Manrope_600SemiBold", fontSize: 12 },
  ebookCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.blushMid,
    shadowColor: Colors.hotPink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  ebookGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 18,
    backgroundColor: Colors.blushLight,
  },
  ebookLeft: {
    alignItems: "center",
    justifyContent: "center",
  },
  ebookCoverImg: {
    width: 110,
    height: 145,
    borderRadius: 10,
    overflow: "hidden",
  },
  ebookIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.blushMid,
    alignItems: "center",
    justifyContent: "center",
  },
  ebookBody: {
    flex: 1,
    gap: 4,
  },
  ebookBadgeRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  ebookBadge: {
    backgroundColor: Colors.hotPink,
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  ebookBadgeText: {
    fontFamily: "Manrope_700Bold",
    fontSize: 9,
    color: Colors.white,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  ebookTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 18,
    color: Colors.burgundy,
    lineHeight: 24,
  },
  ebookSub: {
    fontFamily: "Manrope_400Regular",
    fontSize: 11,
    color: Colors.gray,
    marginTop: 4,
    lineHeight: 16,
  },
  ebookBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 12,
    backgroundColor: Colors.hotPink,
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  ebookBtnText: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 12,
    color: Colors.white,
  },
  ebookDecor: {
    alignItems: "center",
    justifyContent: "center",
  },
  ebookDecorText: {
    fontSize: 36,
  },
  subscriptionCard: { marginHorizontal: 20, borderRadius: 24, overflow: "hidden", marginBottom: 20 },
  subscriptionGradient: { padding: 24 },
  subHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  subBadge: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 50,
  },
  subPrice: { fontFamily: "Manrope_700Bold", fontSize: 28, color: Colors.white },
  subPricePeriod: { fontFamily: "Manrope_400Regular", fontSize: 14, color: "rgba(255,255,255,0.7)" },
  subTitle: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 22, color: Colors.white, marginBottom: 20 },
  subFeatures: { gap: 10, marginBottom: 24 },
  subFeatureRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  subFeatureText: { fontFamily: "Manrope_400Regular", fontSize: 14, color: "rgba(255,255,255,0.9)" },
  subBtn: {
    backgroundColor: Colors.white,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  subBtnText: { fontFamily: "Manrope_700Bold", fontSize: 16, color: Colors.hotPink },
  subDisclaimer: { fontFamily: "Manrope_400Regular", fontSize: 11, color: "rgba(255,255,255,0.5)", textAlign: "center" },
});

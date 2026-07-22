import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCycle } from "@/contexts/CycleContext";
import Colors from "@/constants/colors";
import { WaveHeader, WAVE_HEIGHT } from "@/components/WaveHeader";
import { AIRecommendCard } from "@/components/AIRecommendCard";

const JOURNAL_KEY = "rhythm_journal_entries";

const PHASE_PROMPTS: Record<string, string[]> = {
  menstrual: [
    "What requires closure?",
    "How do I want to feel?",
    "I am grateful for?",
    "How do I call in flow?",
  ],
  follicular: [
    "What am I excited to begin?",
    "What new ideas am I exploring?",
    "I am calling in?",
    "What feels light & possible?",
  ],
  ovulatory: [
    "What am I most confident about?",
    "Who do I want to connect with?",
    "I am shining brightest at?",
    "What do I want to express?",
  ],
  luteal: [
    "What needs to be released?",
    "How am I caring for myself?",
    "I am honoring my needs by?",
    "What patterns do I notice?",
  ],
};

const AFFIRMATIONS: Record<string, string[]> = {
  menstrual: [
    "I honor my body's need for rest.",
    "I release what no longer serves me.",
    "My sensitivity is my superpower.",
    "I am renewed with every cycle.",
  ],
  follicular: [
    "I am full of possibility and light.",
    "I welcome new beginnings with joy.",
    "My creativity flows effortlessly.",
    "I trust my instincts and ideas.",
  ],
  ovulatory: [
    "I radiate confidence and warmth.",
    "I attract abundance with my energy.",
    "I am magnetic and fully expressed.",
    "My voice matters and is heard.",
  ],
  luteal: [
    "I am allowed to slow down.",
    "My emotions are valid and wise.",
    "I nurture myself with gentleness.",
    "Rest is a form of strength.",
  ],
};

interface JournalEntry {
  id: string;
  prompt: string;
  text: string;
  phase: string;
  date: string;
}

type ActiveTab = "journal" | "affirmations";

export default function SoulScreen() {
  const insets = useSafeAreaInsets();
  const { phaseInfo, cycleData } = useCycle();
  const [activeTab, setActiveTab] = useState<ActiveTab>("journal");
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [journalText, setJournalText] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const phase = phaseInfo?.phase || "follicular";
  const phaseColor = phaseInfo?.color || Colors.hotPink;
  const prompts = PHASE_PROMPTS[phase];
  const affirmations = AFFIRMATIONS[phase];

  async function loadEntries() {
    try {
      const raw = await AsyncStorage.getItem(JOURNAL_KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch {}
  }

  async function saveEntry() {
    if (!journalText.trim() || !selectedPrompt) return;
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      prompt: selectedPrompt,
      text: journalText.trim(),
      phase,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
    const updated = [newEntry, ...entries];
    setEntries(updated);
    await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(updated));
    setSelectedPrompt(null);
    setJournalText("");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function openPrompt(prompt: string) {
    setSelectedPrompt(prompt);
    setJournalText("");
    loadEntries();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad + 100 }}
      >
        <WaveHeader topPad={topPad} showLogo>
          <Text style={styles.headerPhase}>
            You're in your {phaseInfo?.phaseName || "Follicular"} Phase
          </Text>
          <Text style={styles.headerTitle}>Soul</Text>
          <Text style={styles.headerSub}>Reflect · Affirm · Grow</Text>
        </WaveHeader>

        {/* Tab Toggle */}
        <View style={styles.tabRow}>
          {(["journal", "affirmations"] as ActiveTab[]).map((t) => (
            <Pressable
              key={t}
              style={[styles.tab, activeTab === t && { ...styles.tabActive, backgroundColor: phaseColor }]}
              onPress={() => {
                setActiveTab(t);
                Haptics.selectionAsync();
              }}
            >
              <Ionicons
                name={t === "journal" ? "book-outline" : "sparkles-outline"}
                size={16}
                color={activeTab === t ? Colors.white : Colors.gray}
              />
              <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
                {t === "journal" ? "Journal" : "Affirmations"}
              </Text>
            </Pressable>
          ))}
        </View>

        {activeTab === "journal" ? (
          <Animated.View entering={FadeInDown.duration(300)}>
            <View style={[styles.section, { paddingBottom: 0 }]}>
              <AIRecommendCard
                phase={phase}
                cycleDay={phaseInfo?.cycleDay ?? 1}
                goal={cycleData?.goal}
                category="meditation"
                accentColor={phaseColor}
                label={`Soul guidance for your ${phaseInfo?.phaseName ?? ""} phase`}
              />
            </View>
            <View style={styles.section}>
              <Text style={styles.journalTitle}>Journal</Text>
              <Text style={styles.journalSub}>Prompts to reflect on during this stage</Text>

              <View style={styles.promptsGrid}>
                {prompts.map((prompt, i) => (
                  <Pressable
                    key={i}
                    style={({ pressed }) => [
                      styles.promptCard,
                      pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
                    ]}
                    onPress={() => openPrompt(prompt)}
                  >
                    <Text style={styles.promptText}>{prompt}</Text>
                    <View style={styles.promptWriteIcon}>
                      <Ionicons name="pencil" size={14} color={Colors.burgundy} />
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            {entries.length > 0 && (
              <View style={[styles.section, { marginTop: 8 }]}>
                <Pressable
                  style={styles.historyToggle}
                  onPress={() => {
                    setShowHistory(!showHistory);
                    loadEntries();
                    Haptics.selectionAsync();
                  }}
                >
                  <Text style={[styles.historyToggleText, { color: phaseColor }]}>
                    {showHistory ? "Hide" : "View"} Past Entries ({entries.length})
                  </Text>
                  <Ionicons
                    name={showHistory ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={phaseColor}
                  />
                </Pressable>

                {showHistory && entries.slice(0, 5).map((entry, i) => (
                  <Animated.View
                    key={entry.id}
                    entering={FadeInDown.delay(i * 60).duration(300)}
                    style={styles.entryCard}
                  >
                    <View style={[styles.entryPhaseTag, { backgroundColor: phaseColor + "22" }]}>
                      <Text style={[styles.entryPhaseText, { color: phaseColor }]}>
                        {entry.phase} · {entry.date}
                      </Text>
                    </View>
                    <Text style={styles.entryPrompt}>{entry.prompt}</Text>
                    <Text style={styles.entryText}>{entry.text}</Text>
                  </Animated.View>
                ))}
              </View>
            )}
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.section}>
            <Text style={styles.journalTitle}>Daily Affirmations</Text>
            <Text style={styles.journalSub}>Rooted in your {phaseInfo?.phaseName?.toLowerCase()} phase energy</Text>

            {affirmations.map((aff, i) => (
              <Animated.View
                key={i}
                entering={FadeInDown.delay(i * 80).duration(400)}
                style={[styles.affirmationCard, { borderLeftColor: phaseColor }]}
              >
                <View style={[styles.affirmationNum, { backgroundColor: phaseColor }]}>
                  <Text style={styles.affirmationNumText}>{i + 1}</Text>
                </View>
                <Text style={styles.affirmationText}>{aff}</Text>
              </Animated.View>
            ))}

            <View style={[styles.affirmationHero, { backgroundColor: phaseColor }]}>
              <Ionicons name="heart" size={24} color="rgba(255,255,255,0.6)" />
              <Text style={styles.affirmationHeroText}>
                Speak these to yourself each morning. Your words shape your reality.
              </Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Journal Write Modal */}
      <Modal
        visible={!!selectedPrompt}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedPrompt(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Pressable
              onPress={() => setSelectedPrompt(null)}
              style={styles.modalClose}
            >
              <Ionicons name="close" size={22} color={Colors.burgundy} />
            </Pressable>
            <Text style={styles.modalTitle}>Journal Entry</Text>
            <Pressable
              onPress={saveEntry}
              style={[styles.modalSave, { backgroundColor: phaseColor }]}
            >
              <Text style={styles.modalSaveText}>Save</Text>
            </Pressable>
          </View>

          <View style={[styles.modalPromptBox, { backgroundColor: phaseColor + "18" }]}>
            <Text style={[styles.modalPromptLabel, { color: phaseColor }]}>Your Prompt</Text>
            <Text style={styles.modalPromptText}>{selectedPrompt}</Text>
          </View>

          <TextInput
            style={styles.journalInput}
            placeholder="Write freely... there are no wrong answers."
            placeholderTextColor={Colors.grayLight}
            multiline
            autoFocus
            value={journalText}
            onChangeText={setJournalText}
            textAlignVertical="top"
          />
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pageBg,
  },
  headerPhase: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 18,
    color: "#610015",
    marginBottom: 2,
  },
  headerTitle: {
    fontFamily: "PlayfairDisplay_900Black",
    fontSize: 56,
    color: "#610015",
    fontStyle: "italic",
  },
  headerSub: {
    fontFamily: "Manrope_400Regular",
    fontSize: 16,
    color: "rgba(97,0,21,0.65)",
    marginTop: 4,
  },
  tabRow: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: Colors.blushMid + "55",
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
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontFamily: "Manrope_500Medium",
    fontSize: 14,
    color: "#FFB3C6",
  },
  tabTextActive: {
    color: Colors.white,
    fontFamily: "Manrope_600SemiBold",
  },
  section: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  journalTitle: {
    fontFamily: "PlayfairDisplay_900Black",
    fontStyle: "italic",
    fontSize: 64,
    color: Colors.hotPink,
    marginBottom: 4,
    lineHeight: 70,
  },
  journalSub: {
    fontFamily: "Manrope_400Regular",
    fontSize: 14,
    color: "#FFB3C6",
    marginBottom: 24,
  },
  promptsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  promptCard: {
    width: "47%",
    backgroundColor: "#d4a0b0",
    borderRadius: 20,
    padding: 20,
    minHeight: 110,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  promptText: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontStyle: "italic",
    fontSize: 16,
    color: Colors.burgundy,
    lineHeight: 22,
    flex: 1,
  },
  promptWriteIcon: {
    alignSelf: "flex-end",
    marginTop: 8,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 20,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  historyToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  historyToggleText: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 14,
  },
  entryCard: {
    backgroundColor: Colors.blushLight,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: Colors.hotPink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 1,
  },
  entryPhaseTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 50,
    marginBottom: 8,
  },
  entryPhaseText: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 10,
    letterSpacing: 0.3,
    textTransform: "capitalize",
  },
  entryPrompt: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 13,
    color: Colors.burgundy,
    marginBottom: 6,
  },
  entryText: {
    fontFamily: "Manrope_400Regular",
    fontSize: 14,
    color: Colors.grayDark,
    lineHeight: 22,
  },
  affirmationCard: {
    backgroundColor: Colors.blushLight,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: Colors.blushMid,
    shadowColor: Colors.hotPink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 1,
  },
  affirmationNum: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  affirmationNumText: {
    fontFamily: "Manrope_700Bold",
    fontSize: 14,
    color: Colors.white,
  },
  affirmationText: {
    fontFamily: "Manrope_500Medium",
    fontSize: 15,
    color: Colors.burgundy,
    lineHeight: 22,
    flex: 1,
  },
  affirmationHero: {
    borderRadius: 20,
    padding: 24,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  affirmationHeroText: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 16,
    color: Colors.white,
    lineHeight: 26,
    flex: 1,
    fontStyle: "italic",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.pageBg,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 20 : 40,
    borderBottomWidth: 1,
    borderBottomColor: Colors.blushMid,
  },
  modalClose: {
    padding: 4,
  },
  modalTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 18,
    color: Colors.burgundy,
    fontStyle: "italic",
  },
  modalSave: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 50,
  },
  modalSaveText: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 13,
    color: Colors.white,
  },
  modalPromptBox: {
    margin: 20,
    borderRadius: 16,
    padding: 18,
  },
  modalPromptLabel: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  modalPromptText: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 20,
    color: Colors.burgundy,
    fontStyle: "italic",
    lineHeight: 28,
  },
  journalInput: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 20,
    fontFamily: "Manrope_400Regular",
    fontSize: 16,
    color: Colors.burgundy,
    lineHeight: 26,
    textAlignVertical: "top",
  },
});

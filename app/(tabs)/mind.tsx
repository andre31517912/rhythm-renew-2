import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Audio } from "expo-av";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useCycle } from "@/contexts/CycleContext";
import Colors from "@/constants/colors";
import { WaveHeader } from "@/components/WaveHeader";
import { AIRecommendCard } from "@/components/AIRecommendCard";

const MEDITATIONS: Record<string, { title: string; duration: string; level: string; steps: string[] }[]> = {
  menstrual: [
    {
      title: "Body Scan for Rest",
      duration: "10 min",
      level: "Beginner",
      steps: [
        "Find a comfortable position lying down. Close your eyes.",
        "Take 3 deep breaths, releasing tension with each exhale.",
        "Bring awareness to your feet. Notice any sensations without judgment.",
        "Slowly move attention up through your legs, hips, belly.",
        "Allow your womb space to soften. Place a hand there if it feels right.",
        "Continue up through chest, shoulders, arms, neck, and face.",
        "Rest in full-body awareness for as long as you need.",
      ],
    },
    {
      title: "Womb Healing Meditation",
      duration: "15 min",
      level: "All Levels",
      steps: [
        "Sit or lie comfortably. Place both hands on your lower belly.",
        "Breathe deeply into your womb space, expanding on the inhale.",
        "Visualize warm crimson light filling your pelvis with each breath.",
        "Silently say: 'I honor my body's natural cycle.'",
        "If you feel discomfort, breathe into it — not away from it.",
        "Let tears or emotions arise freely. This is sacred space.",
        "Close with gratitude for your body's wisdom.",
      ],
    },
    {
      title: "Release & Let Go",
      duration: "8 min",
      level: "Beginner",
      steps: [
        "Sit comfortably, spine tall, eyes closed.",
        "Inhale for 4 counts, hold for 4, exhale for 6. Repeat 5 times.",
        "Think of one thing you're ready to release this cycle.",
        "Visualize it as a cloud drifting away from you.",
        "Feel the lightness as the burden leaves.",
        "Breathe naturally and rest in the present moment.",
      ],
    },
  ],
  follicular: [
    {
      title: "Creative Visualization",
      duration: "8 min",
      level: "All Levels",
      steps: [
        "Sit up straight. Take 3 energizing breaths, inhaling fully.",
        "Visualize a bright golden light at the center of your chest.",
        "See it expanding with each breath, filling you with possibility.",
        "Picture something new you want to create or begin this cycle.",
        "Feel the excitement and curiosity in your body — where do you feel it?",
        "Smile gently and anchor this feeling with a hand on your heart.",
        "Set one clear intention for the coming days.",
      ],
    },
    {
      title: "Morning Intention Setting",
      duration: "6 min",
      level: "Beginner",
      steps: [
        "Before getting up, take 5 slow, deep breaths.",
        "Ask yourself: 'What do I want to invite into today?'",
        "Choose one word that represents your intention (joy, focus, ease…).",
        "Repeat that word silently 10 times as you breathe.",
        "Visualize your day unfolding with that quality present throughout.",
        "Open your eyes slowly, carry this intention with you.",
      ],
    },
    {
      title: "Energy Activation",
      duration: "10 min",
      level: "All Levels",
      steps: [
        "Stand or sit tall. Shake out your hands and shoulders.",
        "Take 5 powerful breaths: inhale sharply through nose, exhale fully.",
        "Tap your chest lightly to awaken energy.",
        "Visualize vibrant green light flowing up from the earth into your body.",
        "Feel aliveness in your limbs, your eyes, your mind.",
        "Affirm: 'I am ready. I am capable. I am rising.'",
        "Close with two slow breaths and a gentle smile.",
      ],
    },
  ],
  ovulatory: [
    {
      title: "Confidence & Power",
      duration: "7 min",
      level: "All Levels",
      steps: [
        "Stand tall or sit in a powerful posture, chin up.",
        "Breathe deeply into your belly 5 times, expanding fully.",
        "Feel the warmth and confidence already living inside you.",
        "Recall a moment when you felt completely yourself — hold it.",
        "Affirm: 'I am magnetic. I am seen. I am powerful.'",
        "Visualize golden light radiating outward from your heart.",
        "Carry this energy into your day.",
      ],
    },
    {
      title: "Heart-Opening Flow",
      duration: "12 min",
      level: "All Levels",
      steps: [
        "Sit cross-legged, hands on knees, palms up.",
        "With each inhale, gently open your chest and roll shoulders back.",
        "With each exhale, soften and release.",
        "Bring to mind someone or something you love deeply.",
        "Let that feeling of love expand beyond them — to yourself.",
        "Breathe into your heart center for 5 full minutes.",
        "Place hands on heart. Say: 'I am love. I give love. I receive love.'",
      ],
    },
    {
      title: "Manifestation Meditation",
      duration: "10 min",
      level: "Intermediate",
      steps: [
        "Sit comfortably and close your eyes.",
        "Ground yourself with 5 deep breaths into the earth.",
        "Clearly picture your most desired goal as if it's already real.",
        "Engage all senses: what do you see, hear, feel in that reality?",
        "Feel genuine gratitude as if it has already happened.",
        "Hold this feeling for 5 minutes, breathing slowly.",
        "Release the image and trust the process. Open your eyes gently.",
      ],
    },
  ],
  luteal: [
    {
      title: "Self-Compassion Practice",
      duration: "12 min",
      level: "All Levels",
      steps: [
        "Place one hand on your heart, one on your belly.",
        "Take 3 slow breaths, feeling your hands rise and fall.",
        "Acknowledge honestly: 'This time of month is harder for me.'",
        "Say gently: 'I am not alone in feeling this way.'",
        "Breathe the phrase: 'May I be kind to myself in this moment.'",
        "Repeat for 8 breaths, meaning every word.",
        "Rest in stillness, offering yourself the same care you'd give a friend.",
      ],
    },
    {
      title: "Stress Relief & Grounding",
      duration: "15 min",
      level: "Beginner",
      steps: [
        "Sit or lie down. Feel the ground supporting you completely.",
        "Press your feet firmly into the floor — notice the contact.",
        "Breathe in slowly for 5, hold for 2, out for 7. Repeat 6 times.",
        "Name 5 things you can see, 4 you can touch, 3 you can hear.",
        "Place both hands on your belly. Feel its warmth.",
        "Say: 'I am safe. I am held. I am enough right now.'",
        "Rest for as long as you need.",
      ],
    },
    {
      title: "Emotional Release Breathing",
      duration: "10 min",
      level: "All Levels",
      steps: [
        "Lie down. Uncross your arms and legs.",
        "Take a full, deep breath in through your mouth.",
        "Exhale with an audible sigh — let sound out.",
        "Continue for 10 rounds, allowing emotion to surface.",
        "If tears come, let them flow. If laughter, let it out.",
        "Return to natural breathing and rest quietly.",
        "Place a hand on your heart and thank yourself.",
      ],
    },
  ],
};

const TRACKS: Record<string, { title: string; artist: string; duration: string }[]> = {
  menstrual: [
    { title: "Weightless", artist: "Marconi Union", duration: "8:09" },
    { title: "Clair de Lune", artist: "Debussy", duration: "5:22" },
    { title: "Experience", artist: "Ludovico Einaudi", duration: "5:47" },
  ],
  follicular: [
    { title: "Good Days", artist: "SZA", duration: "4:38" },
    { title: "Sunrise", artist: "Norah Jones", duration: "3:55" },
    { title: "Golden", artist: "Harry Styles", duration: "3:28" },
  ],
  ovulatory: [
    { title: "Run the World (Girls)", artist: "Beyoncé", duration: "3:57" },
    { title: "POWER", artist: "Kanye West", duration: "4:52" },
    { title: "Levitating", artist: "Dua Lipa", duration: "3:23" },
  ],
  luteal: [
    { title: "Butterflies", artist: "Kacey Musgraves", duration: "3:53" },
    { title: "Hold On", artist: "Chord Overstreet", duration: "3:34" },
    { title: "Woman", artist: "Rihanna", duration: "3:41" },
  ],
};

const PLAYLIST_INFO: Record<string, { mood: string; description: string }> = {
  menstrual: { mood: "Slow · Grounding · Instrumental", description: "Ethereal ambient and piano pieces to honor your rest and inner journey." },
  follicular: { mood: "Upbeat · Light Pop · Fresh", description: "Light and energizing melodies to match your rising curiosity and creativity." },
  ovulatory: { mood: "Confident · High-Energy · Bold", description: "Anthems that match your peak confidence and social magnetism." },
  luteal: { mood: "Deep · Emotional · Calming R&B", description: "Soulful and introspective sounds to honor your feelings and support rest." },
};

type Tab = "listen" | "meditate";

async function fetchItunesPreview(title: string, artist: string): Promise<string | null> {
  try {
    const term = encodeURIComponent(`${title} ${artist}`);
    const res = await fetch(`https://itunes.apple.com/search?term=${term}&limit=1&media=music`);
    const data = await res.json();
    return data.results?.[0]?.previewUrl ?? null;
  } catch {
    return null;
  }
}

export default function MindScreen() {
  const insets = useSafeAreaInsets();
  const { phaseInfo, cycleData } = useCycle();
  const [activeTab, setActiveTab] = useState<Tab>("listen");
  const [activeMeditation, setActiveMeditation] = useState<number | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  async function handleTrackPress(i: number, track: { title: string; artist: string }) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (playingIndex === i) {
      await soundRef.current?.pauseAsync();
      setPlayingIndex(null);
      return;
    }
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setPlayingIndex(null);
    setLoadingIndex(i);
    const previewUrl = await fetchItunesPreview(track.title, track.artist);
    if (!previewUrl) {
      setLoadingIndex(null);
      return;
    }
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: previewUrl },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      setLoadingIndex(null);
      setPlayingIndex(i);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingIndex(null);
        }
      });
    } catch {
      setLoadingIndex(null);
    }
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const phase = phaseInfo?.phase || "follicular";
  const phaseColor = phaseInfo?.color || Colors.hotPink;
  const phaseColorLight = phaseInfo?.colorLight || Colors.blushLight;
  const meditations = MEDITATIONS[phase];
  const tracks = TRACKS[phase];
  const playlistInfo = PLAYLIST_INFO[phase];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad + 100 }}
      >
        <WaveHeader topPad={topPad} phaseColor={phaseColor} showLogo>
          <Text style={styles.headerPhase}>You're in your {phaseInfo?.phaseName || "Follicular"} Phase</Text>
          <Text style={styles.headerTitle}>Mind</Text>
          <Text style={styles.headerSub}>Mindfulness & Music</Text>
        </WaveHeader>

        <View style={styles.tabRow}>
          {(["listen", "meditate"] as Tab[]).map((t) => (
            <Pressable
              key={t}
              style={[styles.tab, activeTab === t && { ...styles.tabActive, backgroundColor: phaseColor }]}
              onPress={() => { setActiveTab(t); Haptics.selectionAsync(); }}
            >
              <Ionicons
                name={t === "meditate" ? "leaf" : "musical-notes"}
                size={16}
                color={activeTab === t ? Colors.white : Colors.gray}
              />
              <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
                {t === "meditate" ? "Meditate" : "Listen"}
              </Text>
            </Pressable>
          ))}
        </View>

        {activeTab === "meditate" ? (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.content}>
            <AIRecommendCard
              phase={phase}
              cycleDay={phaseInfo?.cycleDay ?? 1}
              goal={cycleData?.goal}
              category="meditation"
              accentColor={phaseColor}
              label={`Mindfulness for your ${phaseInfo?.phaseName ?? ""} phase`}
            />
            <Text style={styles.sectionTitle}>Guided Meditations</Text>
            <Text style={styles.sectionSub}>Tap any session to begin — all in-app, no links needed</Text>
            {meditations.map((med, i) => (
              <View key={i}>
                <Pressable
                  style={({ pressed }) => [styles.meditationCard, pressed && { opacity: 0.9 }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setActiveMeditation(activeMeditation === i ? null : i);
                  }}
                >
                  <View style={[styles.medIcon, { backgroundColor: phaseColor + "18" }]}>
                    <Ionicons
                      name={activeMeditation === i ? "chevron-up" : "play-circle"}
                      size={32}
                      color={phaseColor}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.medTitle}>{med.title}</Text>
                    <View style={styles.medMeta}>
                      <Text style={styles.medDuration}>{med.duration}</Text>
                      <View style={[styles.levelBadge, { backgroundColor: phaseColorLight }]}>
                        <Text style={[styles.levelText, { color: phaseColor }]}>{med.level}</Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons
                    name={activeMeditation === i ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={Colors.grayLight}
                  />
                </Pressable>
                {activeMeditation === i && (
                  <Animated.View entering={FadeInDown.duration(200)} style={[styles.stepsCard, { borderLeftColor: phaseColor }]}>
                    {med.steps.map((step, si) => (
                      <View key={si} style={styles.stepRow}>
                        <View style={[styles.stepNum, { backgroundColor: phaseColor }]}>
                          <Text style={styles.stepNumText}>{si + 1}</Text>
                        </View>
                        <Text style={styles.stepText}>{step}</Text>
                      </View>
                    ))}
                  </Animated.View>
                )}
              </View>
            ))}
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.content}>
            <AIRecommendCard
              phase={phase}
              cycleDay={phaseInfo?.cycleDay ?? 1}
              goal={cycleData?.goal}
              category="music"
              accentColor={phaseColor}
              label={`Music for your ${phaseInfo?.phaseName ?? ""} phase energy`}
            />
            <View style={[styles.playlistHero, { backgroundColor: phaseColor }]}>
              <Text style={styles.playlistMood}>{playlistInfo.mood}</Text>
              <Text style={styles.playlistDesc}>{playlistInfo.description}</Text>
            </View>
            <Text style={styles.sectionTitle}>Phase Playlist</Text>
            <Text style={styles.sectionSub}>Tap any track to play a preview</Text>
            {tracks.map((track, i) => {
              const isPlaying = playingIndex === i;
              const isLoading = loadingIndex === i;
              return (
                <Pressable
                  key={i}
                  style={({ pressed }) => [
                    styles.trackRow,
                    isPlaying && { borderColor: phaseColor, borderWidth: 1.5 },
                    pressed && { opacity: 0.75 },
                  ]}
                  onPress={() => handleTrackPress(i, track)}
                >
                  <View style={[styles.trackNum, { backgroundColor: isPlaying ? phaseColor : phaseColorLight }]}>
                    <Text style={[styles.trackNumText, { color: isPlaying ? Colors.white : phaseColor }]}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.trackTitle, isPlaying && { color: phaseColor }]}>{track.title}</Text>
                    <Text style={styles.trackArtist}>{track.artist}</Text>
                    {isPlaying && (
                      <Text style={[styles.trackArtist, { color: phaseColor, marginTop: 2 }]}>▶ Playing preview</Text>
                    )}
                  </View>
                  <View style={{ alignItems: "center", justifyContent: "center", width: 32 }}>
                    {isLoading ? (
                      <ActivityIndicator size="small" color={phaseColor} />
                    ) : (
                      <Ionicons
                        name={isPlaying ? "pause-circle" : "play-circle-outline"}
                        size={28}
                        color={isPlaying ? phaseColor : Colors.gray}
                      />
                    )}
                  </View>
                </Pressable>
              );
            })}
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
    marginTop: 20,
    backgroundColor: Colors.blushLight,
    borderRadius: 50,
    padding: 4,
    shadowColor: "#610015",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
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
  tabActive: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabText: { fontFamily: "Manrope_500Medium", fontSize: 14, color: Colors.gray },
  tabTextActive: { color: Colors.white, fontFamily: "Manrope_600SemiBold" },
  content: { paddingTop: 20 },
  sectionTitle: { fontFamily: "Manrope_600SemiBold", fontSize: 17, color: "#FFB3C6", paddingHorizontal: 20, marginBottom: 4, marginTop: 16 },
  sectionSub: { fontFamily: "Manrope_400Regular", fontSize: 13, color: "rgba(252,228,236,0.75)", paddingHorizontal: 20, marginBottom: 12 },
  meditationCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: Colors.blushLight,
    borderRadius: 16,
    padding: 14,
    shadowColor: "#610015",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  medIcon: { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  medTitle: { fontFamily: "Manrope_600SemiBold", fontSize: 14, color: Colors.burgundy, marginBottom: 6 },
  medMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  medDuration: { fontFamily: "Manrope_400Regular", fontSize: 12, color: Colors.gray },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 50 },
  levelText: { fontFamily: "Manrope_500Medium", fontSize: 11 },
  stepsCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: Colors.blushLight,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 3,
    gap: 12,
  },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  stepNum: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", marginTop: 1, flexShrink: 0 },
  stepNumText: { fontFamily: "Manrope_700Bold", fontSize: 11, color: Colors.white },
  stepText: { fontFamily: "Manrope_400Regular", fontSize: 14, color: Colors.grayDark, lineHeight: 20, flex: 1 },
  playlistHero: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 4,
  },
  playlistMood: { fontFamily: "Manrope_600SemiBold", fontSize: 13, color: "rgba(255,255,255,0.85)", marginBottom: 6 },
  playlistDesc: { fontFamily: "Manrope_400Regular", fontSize: 14, color: Colors.white, lineHeight: 20 },
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: Colors.blushLight,
    borderRadius: 14,
    padding: 14,
  },
  trackNum: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  trackNumText: { fontFamily: "Manrope_700Bold", fontSize: 13 },
  trackTitle: { fontFamily: "Manrope_600SemiBold", fontSize: 14, color: Colors.burgundy },
  trackArtist: { fontFamily: "Manrope_400Regular", fontSize: 12, color: Colors.gray, marginTop: 2 },
  trackDuration: { fontFamily: "Manrope_400Regular", fontSize: 12, color: Colors.gray },
});

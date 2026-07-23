import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { getApiUrl } from "@/lib/query-client";
import Colors from "@/constants/colors";

interface Props {
  phase: string;
  cycleDay: number;
  goal?: string;
  category: "nutrition" | "movement" | "meditation" | "music";
  accentColor: string;
  label?: string;
  dietaryPreferences?: string[];
  allergies?: string[];
}

function FormattedLine({ text, baseStyle }: { text: string; baseStyle: object }) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <Text>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <Text key={i} style={[baseStyle, { fontFamily: "Manrope_700Bold" }]}>
            {part}
          </Text>
        ) : (
          <Text key={i} style={baseStyle}>
            {part}
          </Text>
        )
      )}
    </Text>
  );
}

export function AIRecommendCard({ phase, cycleDay, goal, category, accentColor, label, dietaryPreferences, allergies }: Props) {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const getAdvice = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    const timeoutId = setTimeout(() => controller.abort(), 25000);

    setLoading(true);
    setError(null);

    try {
      const baseUrl = getApiUrl();
      const url = new URL("/api/recommend", baseUrl).toString();

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase,
          cycleDay: cycleDay || 1,
          goal: goal || "general wellness",
          category,
          dietaryPreferences: dietaryPreferences || [],
          allergies: allergies || [],
        }),
        signal: controller.signal,
        credentials: "include",
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Server error ${res.status}`);
      }

      const text = await res.text();
      const data = JSON.parse(text);
      setAdvice(data.advice || "");
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err?.name === "AbortError") {
        setError("Request timed out. Tap to try again.");
      } else {
        setError("Couldn't connect. Tap to try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const lines = advice
    ? advice.split("\n").map((l) => l.trim()).filter((l) => l.length > 0)
    : [];

  return (
    <View style={[styles.card, { borderColor: accentColor + "40" }]}>
      <View style={[styles.cardHeader, { backgroundColor: accentColor + "14" }]}>
        <View style={[styles.iconWrap, { backgroundColor: accentColor }]}>
          <Ionicons name="sparkles" size={15} color={Colors.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, { color: accentColor }]}>AI Personalized Advice</Text>
          <Text style={styles.cardSub}>{label ?? `Tailored for your ${phase} phase`}</Text>
        </View>
        {advice && !loading && (
          <Pressable onPress={getAdvice} style={styles.refreshBtn}>
            <Ionicons name="refresh-outline" size={18} color={accentColor} />
          </Pressable>
        )}
      </View>

      {!advice && !loading && !error && (
        <Pressable
          style={({ pressed }) => [styles.ctaBtn, { backgroundColor: accentColor }, pressed && { opacity: 0.85 }]}
          onPress={getAdvice}
        >
          <Ionicons name="sparkles" size={16} color={Colors.white} />
          <Text style={styles.ctaText}>Get My Personalized Advice</Text>
        </Pressable>
      )}

      {loading && (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={accentColor} />
          <Text style={[styles.loadingText, { color: accentColor }]}>
            Crafting your personalized advice...
          </Text>
        </View>
      )}

      {!!error && !loading && (
        <Pressable
          style={({ pressed }) => [styles.ctaBtn, { backgroundColor: "#C0392B" }, pressed && { opacity: 0.85 }]}
          onPress={getAdvice}
        >
          <Ionicons name="refresh-outline" size={16} color={Colors.white} />
          <Text style={styles.ctaText}>{error}</Text>
        </Pressable>
      )}

      {!!advice && !loading && (
        <View style={styles.adviceBody}>
          {lines.map((line, i) => {
            const isBullet = line.startsWith("- ");
            const content = isBullet ? line.slice(2) : line;
            const isLast = i === lines.length - 1;
            return (
              <View key={i} style={[styles.lineWrap, isBullet && styles.bulletWrap]}>
                {isBullet && (
                  <View style={[styles.bullet, { backgroundColor: accentColor }]} />
                )}
                <FormattedLine
                  text={content}
                  baseStyle={
                    isBullet
                      ? styles.bulletText
                      : isLast && !isBullet
                      ? styles.closingText
                      : styles.adviceText
                  }
                />
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: Colors.blushLight,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontFamily: "Manrope_700Bold",
    fontSize: 14,
  },
  cardSub: {
    fontFamily: "Manrope_400Regular",
    fontSize: 12,
    color: Colors.gray,
    marginTop: 1,
  },
  refreshBtn: {
    padding: 4,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 14,
    borderRadius: 14,
  },
  ctaText: {
    fontFamily: "Manrope_700Bold",
    fontSize: 14,
    color: Colors.white,
  },
  loadingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 20,
  },
  loadingText: {
    fontFamily: "Manrope_500Medium",
    fontSize: 13,
  },
  adviceBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  lineWrap: {
    marginBottom: 2,
  },
  bulletWrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingLeft: 4,
  },
  bullet: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginTop: 6,
    flexShrink: 0,
  },
  adviceText: {
    fontFamily: "Manrope_400Regular",
    fontSize: 13,
    color: Colors.grayDark,
    lineHeight: 20,
  },
  bulletText: {
    fontFamily: "Manrope_400Regular",
    fontSize: 13,
    color: Colors.grayDark,
    lineHeight: 20,
    flex: 1,
  },
  closingText: {
    fontFamily: "Manrope_500Medium",
    fontSize: 13,
    color: Colors.gray,
    lineHeight: 20,
    fontStyle: "italic",
    marginTop: 4,
  },
});

import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { fetch } from "expo/fetch";
import { useCycle } from "@/contexts/CycleContext";
import Colors from "@/constants/colors";
import { getApiUrl } from "@/lib/query-client";
import { WaveHeader } from "@/components/WaveHeader";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTED_PROMPTS = [
  "What should I eat today?",
  "Why do I feel bloated?",
  "Best workout for my phase",
  "How to boost my energy",
];

export default function CoachScreen() {
  const insets = useSafeAreaInsets();
  const { cycleData, phaseInfo } = useCycle();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = insets.bottom;

  const phaseColor = phaseInfo?.color || Colors.hotPink;

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isSending) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [userMsg, ...prev]);
    setInput("");
    setIsSending(true);
    setStreamingContent("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const msgHistory = messages.map((m) => ({
      role: m.role,
      content: m.content,
    })).reverse();

    msgHistory.push({ role: "user", content: text.trim() });

    try {
      const baseUrl = getApiUrl();
      const url = new URL("/api/chat", baseUrl);
      const response = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: msgHistory,
          phase: phaseInfo?.phaseName,
          cycleDay: phaseInfo?.cycleDay,
          goal: cycleData.goal,
          dietaryPreferences: cycleData.dietaryPreferences,
          allergies: cycleData.allergies,
        }),
      });

      if (!response.ok) throw new Error("Failed to send");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              fullContent += data.content;
              setStreamingContent(fullContent);
            }
            if (data.done) {
              const assistantMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: fullContent,
                timestamp: new Date(),
              };
              setMessages((prev) => [assistantMsg, ...prev]);
              setStreamingContent("");
            }
          } catch {}
        }
      }
    } catch (error) {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [errMsg, ...prev]);
      setStreamingContent("");
    } finally {
      setIsSending(false);
    }
  }, [messages, isSending, phaseInfo, cycleData]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAssistant]}>
        {!isUser && (
          <View style={[styles.avatar, { backgroundColor: phaseColor }]}>
            <Text style={styles.avatarText}>R</Text>
          </View>
        )}
        <View style={[
          styles.bubble,
          isUser ? [styles.bubbleUser, { backgroundColor: phaseColor }] : styles.bubbleAssistant,
        ]}>
          <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextAssistant]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  const showStreamingMsg = !!streamingContent;

  return (
    <View style={styles.container}>
      {/* Header */}
      <WaveHeader topPad={topPad} phaseColor={phaseColor}>
        <View style={styles.headerInner}>
          <View style={[styles.coachAvatar, { backgroundColor: "rgba(97,0,21,0.12)" }]}>
            <Text style={styles.coachAvatarText}>R</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Rhythm Coach</Text>
            <Text style={styles.headerSub}>
              {phaseInfo?.phaseName} Phase · Day {phaseInfo?.cycleDay ?? "—"}
            </Text>
          </View>
          <View style={[styles.onlineDot]} />
        </View>
      </WaveHeader>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          inverted
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.messageList,
            { paddingBottom: showStreamingMsg ? 0 : 16 },
          ]}
          ListHeaderComponent={
            showStreamingMsg ? (
              <View style={styles.msgRowAssistant}>
                <View style={[styles.avatar, { backgroundColor: phaseColor }]}>
                  <Text style={styles.avatarText}>R</Text>
                </View>
                <View style={styles.bubbleAssistant}>
                  <Text style={styles.bubbleTextAssistant}>{streamingContent}</Text>
                </View>
              </View>
            ) : null
          }
          ListFooterComponent={
            messages.length === 0 && !showStreamingMsg ? (
              <View style={styles.emptyState}>
                <View style={[styles.emptyOrb, { backgroundColor: phaseColor + "22" }]}>
                  <Ionicons name="sparkles" size={32} color={phaseColor} />
                </View>
                <Text style={styles.emptyTitle}>Your AI Wellness Coach</Text>
                <Text style={styles.emptyText}>
                  Ask me anything about your {phaseInfo?.phaseName?.toLowerCase()} phase — nutrition, workouts, mood, or hormones.
                </Text>
                <View style={styles.promptsGrid}>
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <Pressable
                      key={prompt}
                      style={[styles.promptChip, { borderColor: phaseColor + "40" }]}
                      onPress={() => sendMessage(prompt)}
                    >
                      <Text style={[styles.promptText, { color: phaseColor }]}>{prompt}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null
          }
        />

        {/* Input */}
        <View style={[styles.inputContainer, { paddingBottom: bottomInset + 8 }]}>
          <TextInput
            style={styles.input}
            placeholder={`Ask about your ${phaseInfo?.phaseName?.toLowerCase() || "current"} phase...`}
            placeholderTextColor={Colors.grayLight}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage(input)}
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendBtn,
              { backgroundColor: input.trim() && !isSending ? phaseColor : Colors.blushMid },
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || isSending}
          >
            <Ionicons
              name={isSending ? "ellipsis-horizontal" : "arrow-up"}
              size={18}
              color={Colors.white}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.pageBg },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  coachAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  coachAvatarText: {
    fontFamily: "PlayfairDisplay_900Black",
    fontSize: 20,
    color: "#610015",
  },
  headerTitle: {
    fontFamily: "Manrope_700Bold",
    fontSize: 16,
    color: "#610015",
  },
  headerSub: {
    fontFamily: "Manrope_400Regular",
    fontSize: 12,
    color: "rgba(97,0,21,0.65)",
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2ECC71",
    marginLeft: "auto",
    marginRight: 4,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  msgRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 12,
  },
  msgRowUser: {
    justifyContent: "flex-end",
  },
  msgRowAssistant: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 14,
    color: Colors.white,
  },
  bubble: {
    maxWidth: "78%",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleUser: {
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  bubbleTextUser: {
    fontFamily: "Manrope_400Regular",
    color: Colors.white,
  },
  bubbleTextAssistant: {
    fontFamily: "Manrope_400Regular",
    color: Colors.burgundy,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  emptyOrb: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 22,
    color: Colors.burgundy,
    marginBottom: 10,
    textAlign: "center",
  },
  emptyText: {
    fontFamily: "Manrope_400Regular",
    fontSize: 14,
    color: Colors.gray,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  promptsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  promptChip: {
    borderWidth: 1.5,
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: Colors.white,
  },
  promptText: {
    fontFamily: "Manrope_500Medium",
    fontSize: 13,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.blushMid,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    fontFamily: "Manrope_400Regular",
    fontSize: 15,
    color: Colors.burgundy,
    maxHeight: 120,
    borderWidth: 1.5,
    borderColor: Colors.blushMid,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});

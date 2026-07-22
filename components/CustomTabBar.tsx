import React from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import * as Haptics from "expo-haptics";
import Svg, { Path, Circle } from "react-native-svg";

const ICON_SIZE = 24;

function SmileyIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" fill="none" />
      <Circle cx="9" cy="10.5" r="1.3" fill={color} />
      <Circle cx="15" cy="10.5" r="1.3" fill={color} />
      <Path
        d="M8.5 14.5 Q12 18.5 15.5 14.5"
        stroke={color}
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function TabIcon({ routeName, color }: { routeName: string; color: string }) {
  switch (routeName) {
    case "index":
      return <Ionicons name="home" size={ICON_SIZE} color={color} />;
    case "mind":
      return <Ionicons name="star" size={ICON_SIZE} color={color} />;
    case "body":
      return <SmileyIcon color={color} size={ICON_SIZE} />;
    case "soul":
      return <Ionicons name="heart" size={ICON_SIZE} color={color} />;
    case "profile":
      return <Ionicons name="person" size={ICON_SIZE} color={color} />;
    default:
      return <Ionicons name="ellipse" size={ICON_SIZE} color={color} />;
  }
}

const LABELS: Record<string, string> = {
  index: "Home",
  mind: "Mind",
  body: "Body",
  soul: "Soul",
  profile: "Profile",
};

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const bottomInset = isWeb ? 34 : insets.bottom;
  const visibleRoutes = state.routes.filter((r) => LABELS[r.name]);

  return (
    <View style={[styles.wrapper, { paddingBottom: bottomInset, marginBottom: isWeb ? 0 : 8 }]}>
      <View style={styles.pill}>
        {visibleRoutes.map((route, index) => {
          const globalIndex = state.routes.findIndex((r) => r.key === route.key);
          const isFocused = state.index === globalIndex;
          const color = isFocused ? Colors.burgundy : "#C9607A";

          return (
            <Pressable
              key={route.key}
              style={styles.tab}
              onPress={() => {
                Haptics.selectionAsync();
                navigation.navigate(route.name);
              }}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
            >
              <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
                <TabIcon routeName={route.name} color={color} />
              </View>
              <Text style={[styles.label, { color }]}>{LABELS[route.name]}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 16,
    right: 16,
  },
  pill: {
    flexDirection: "row",
    backgroundColor: "#fce4ec",
    borderRadius: 28,
    paddingVertical: 8,
    shadowColor: "#610015",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    gap: 3,
  },
  iconWrap: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  iconWrapActive: {
    backgroundColor: "rgba(137,24,40,0.1)",
  },
  label: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 10,
    letterSpacing: 0.2,
    textDecorationLine: "none",
  },
});

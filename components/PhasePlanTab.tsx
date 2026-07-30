import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { usePhasePlan } from "@/hooks/usePhasePlan";
import { DayPlanCard } from "./DayPlanCard";
import type { Phase } from "@/contexts/CycleContext";

interface PhasePlanTabProps {
  phase: Phase;
  phaseColor: string;
  phaseColorLight: string;
  phaseName: string;
  phaseDay: number;
  phaseLength: number;
}

export function PhasePlanTab({
  phase,
  phaseColor,
  phaseColorLight,
  phaseName,
  phaseDay,
  phaseLength,
}: PhasePlanTabProps) {
  const { plan, isLoading, swapRecipe, swapWorkout } = usePhasePlan();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={phaseColor} />
        <Text style={styles.loadingText}>Building your plan...</Text>
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.loading}>
        <Ionicons name="calendar-outline" size={48} color={Colors.grayLight} />
        <Text style={styles.loadingText}>No plan available</Text>
        <Text style={styles.loadingSub}>Set your cycle dates to generate a plan</Text>
      </View>
    );
  }

  const progress = phaseDay / phaseLength;

  return (
    <View style={styles.contentContainer}>
      {/* Phase Plan Header */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.headerCard}>
        <View style={[styles.headerBadge, { backgroundColor: phaseColor }]}>
          <Ionicons name="calendar" size={16} color={Colors.white} />
        </View>
        <Text style={styles.headerTitle}>Your {phaseName} Phase Plan</Text>
        <Text style={styles.headerSub}>
          Day {phaseDay} of {phaseLength}
        </Text>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress * 100}%`, backgroundColor: phaseColor },
            ]}
          />
        </View>
      </Animated.View>

      {/* Day List */}
      {plan.days.map((dayPlan) => {
        const isToday = dayPlan.day === phaseDay;
        const isPast = dayPlan.day < phaseDay;

        return (
          <Animated.View
            key={dayPlan.day}
            entering={FadeInDown.delay(dayPlan.day * 50).duration(400)}
            style={[
              styles.dayContainer,
              isToday && { borderLeftColor: phaseColor, borderLeftWidth: 3 },
              isPast && styles.pastDay,
            ]}
          >
            <View style={styles.dayHeader}>
              <View style={styles.dayLabelRow}>
                {isPast && (
                  <Ionicons name="checkmark-circle" size={16} color={Colors.grayLight} />
                )}
                {isToday && (
                  <View style={[styles.todayDot, { backgroundColor: phaseColor }]} />
                )}
                <Text
                  style={[
                    styles.dayLabel,
                    isToday && { color: phaseColor, fontFamily: "Manrope_700Bold" },
                  ]}
                >
                  Day {dayPlan.day}
                </Text>
                {isToday && (
                  <View style={[styles.todayBadge, { backgroundColor: phaseColor }]}>
                    <Text style={styles.todayBadgeText}>Today</Text>
                  </View>
                )}
              </View>
              {dayPlan.swapped && (
                <Text style={styles.swappedLabel}>Customized</Text>
              )}
            </View>

            <DayPlanCard
              type="recipe"
              data={dayPlan.recipe}
              phaseColor={phaseColor}
              showSwap={false}
            />
            <DayPlanCard
              type="workout"
              data={dayPlan.workout}
              phaseColor={phaseColor}
              showSwap={false}
            />
          </Animated.View>
        );
      })}

      <View style={{ height: 40 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  loadingText: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 16,
    color: Colors.grayDark,
  },
  loadingSub: {
    fontFamily: "Manrope_400Regular",
    fontSize: 13,
    color: Colors.gray,
  },
  headerCard: {
    backgroundColor: Colors.blushLight,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  headerBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  headerTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 22,
    color: Colors.burgundy,
    textAlign: "center",
  },
  headerSub: {
    fontFamily: "Manrope_500Medium",
    fontSize: 14,
    color: Colors.gray,
    marginTop: 4,
  },
  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(155,123,130,0.15)",
    borderRadius: 3,
    marginTop: 14,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  dayContainer: {
    marginBottom: 24,
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(155,123,130,0.2)",
  },
  pastDay: {
    opacity: 0.55,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  dayLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dayLabel: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 15,
    color: Colors.grayDark,
  },
  todayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  todayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  todayBadgeText: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 10,
    color: Colors.white,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  swappedLabel: {
    fontFamily: "Manrope_500Medium",
    fontSize: 10,
    color: Colors.grayLight,
    fontStyle: "italic",
  },
});

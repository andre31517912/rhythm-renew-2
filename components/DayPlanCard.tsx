import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import type { DailyRecipe, DailyWorkout } from "@/types/phase-plan";

interface RecipeCardProps {
  type: "recipe";
  data: DailyRecipe;
  phaseColor: string;
  onSwap: () => void;
}

interface WorkoutCardProps {
  type: "workout";
  data: DailyWorkout;
  phaseColor: string;
  onSwap: () => void;
}

type DayPlanCardProps = RecipeCardProps | WorkoutCardProps;

export function DayPlanCard(props: DayPlanCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { type, phaseColor, onSwap } = props;

  const isRecipe = type === "recipe";
  const data = props.data;
  const icon: keyof typeof Ionicons.glyphMap = isRecipe ? "restaurant" : "barbell";
  const label = isRecipe ? "Recipe" : "Workout";
  const duration = isRecipe
    ? `${(data as DailyRecipe).prepTime} min`
    : `${(data as DailyWorkout).duration} min`;
  const badge = isRecipe ? null : (data as DailyWorkout).intensity;

  return (
    <Pressable
      style={[styles.card, expanded && styles.cardExpanded]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setExpanded(!expanded);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconCircle, { backgroundColor: phaseColor + "18" }]}>
          <Ionicons name={icon} size={16} color={phaseColor} />
        </View>
        <View style={styles.cardHeaderText}>
          <Text style={[styles.cardLabel, { color: phaseColor }]}>{label}</Text>
          <Text style={styles.cardTitle} numberOfLines={expanded ? undefined : 1}>
            {data.name}
          </Text>
        </View>
        <Pressable
          style={styles.swapBtn}
          hitSlop={12}
          onPress={(e) => {
            e.stopPropagation();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onSwap();
          }}
        >
          <Ionicons name="shuffle" size={18} color={Colors.gray} />
        </Pressable>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaBadge}>
          <Ionicons name="time-outline" size={12} color={Colors.grayDark} />
          <Text style={styles.metaText}>{duration}</Text>
        </View>
        {badge && (
          <View style={[styles.metaBadge, { backgroundColor: phaseColor + "15" }]}>
            <Text style={[styles.metaText, { color: phaseColor }]}>{badge}</Text>
          </View>
        )}
        {isRecipe && (data as DailyRecipe).nutrients.length > 0 && (
          <View style={[styles.metaBadge, { backgroundColor: phaseColor + "15" }]}>
            <Text style={[styles.metaText, { color: phaseColor }]} numberOfLines={1}>
              {(data as DailyRecipe).nutrients.slice(0, 2).join(", ")}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.description} numberOfLines={expanded ? undefined : 2}>
        {data.description}
      </Text>

      {expanded && isRecipe && (
        <View style={styles.detailSection}>
          <Text style={styles.detailHeading}>Ingredients</Text>
          {(data as DailyRecipe).ingredients.map((ing, i) => (
            <Text key={i} style={styles.detailItem}>  {ing}</Text>
          ))}
          <Text style={[styles.detailHeading, { marginTop: 12 }]}>Steps</Text>
          {(data as DailyRecipe).steps.map((step, i) => (
            <Text key={i} style={styles.detailItem}>
              {i + 1}. {step}
            </Text>
          ))}
        </View>
      )}

      {expanded && !isRecipe && (
        <View style={styles.detailSection}>
          <Text style={styles.detailHeading}>Warm-up</Text>
          <Text style={styles.detailItem}>{(data as DailyWorkout).warmup}</Text>

          <Text style={[styles.detailHeading, { marginTop: 12 }]}>Exercises</Text>
          {(data as DailyWorkout).exercises.map((ex, i) => (
            <View key={i} style={styles.exerciseRow}>
              <Text style={styles.exerciseName}>{ex.name}</Text>
              <Text style={styles.exerciseMeta}>
                {ex.sets} sets {ex.reps ? `x ${ex.reps}` : ""}{ex.hold ? ` (${ex.hold})` : ""}
              </Text>
              {ex.notes ? <Text style={styles.exerciseNotes}>{ex.notes}</Text> : null}
            </View>
          ))}

          <Text style={[styles.detailHeading, { marginTop: 12 }]}>Cool-down</Text>
          <Text style={styles.detailItem}>{(data as DailyWorkout).cooldown}</Text>
        </View>
      )}

      <View style={styles.expandHint}>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={14}
          color={Colors.grayLight}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.blushLight,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  cardExpanded: {
    paddingBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardHeaderText: {
    flex: 1,
  },
  cardLabel: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 9,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 1,
  },
  cardTitle: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 14,
    color: Colors.burgundy,
    lineHeight: 19,
  },
  swapBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(155,123,130,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    flexWrap: "wrap",
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(155,123,130,0.08)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  metaText: {
    fontFamily: "Manrope_500Medium",
    fontSize: 11,
    color: Colors.grayDark,
  },
  description: {
    fontFamily: "Manrope_400Regular",
    fontSize: 12,
    color: Colors.gray,
    lineHeight: 18,
    marginTop: 8,
  },
  detailSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(155,123,130,0.12)",
  },
  detailHeading: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 12,
    color: Colors.burgundy,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailItem: {
    fontFamily: "Manrope_400Regular",
    fontSize: 13,
    color: Colors.grayDark,
    lineHeight: 20,
    marginBottom: 2,
  },
  exerciseRow: {
    marginBottom: 8,
  },
  exerciseName: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 13,
    color: Colors.burgundy,
  },
  exerciseMeta: {
    fontFamily: "Manrope_400Regular",
    fontSize: 12,
    color: Colors.gray,
  },
  exerciseNotes: {
    fontFamily: "Manrope_400Regular",
    fontSize: 11,
    color: Colors.grayLight,
    fontStyle: "italic",
    marginTop: 2,
  },
  expandHint: {
    alignItems: "center",
    marginTop: 6,
  },
});

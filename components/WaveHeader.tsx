import React from "react";
import { View, Dimensions } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import Colors from "@/constants/colors";

const { width } = Dimensions.get("window");

export const WAVE_HEIGHT = 190;

const mediumPinkPath = `
  M0,0
  L${width},0
  L${width},18
  C${width * 0.82},18 ${width * 0.66},172 ${width * 0.46},172
  C${width * 0.3},172 ${width * 0.15},70 0,70
  Z
`;

const lightPinkPath = `
  M0,0
  L${width},0
  L${width},6
  C${width * 0.82},6 ${width * 0.66},158 ${width * 0.46},158
  C${width * 0.3},158 ${width * 0.15},56 0,56
  Z
`;

const TOP_WAVE_H = 190;

const topMediumPinkPath = `
  M0,0
  L${width},0
  L${width},32
  C${width * 0.82},32 ${width * 0.66},184 ${width * 0.46},184
  C${width * 0.3},184 ${width * 0.15},84 0,84
  Z
`;

const topDarkWinePath = `
  M0,0
  L${width},0
  L${width},18
  C${width * 0.82},18 ${width * 0.66},172 ${width * 0.46},172
  C${width * 0.3},172 ${width * 0.15},70 0,70
  Z
`;

interface WaveHeaderProps {
  topPad: number;
  phaseColor?: string;
  children: React.ReactNode;
  bgColor?: string;
  showLogo?: boolean;
}

export function WaveHeader({
  topPad,
  phaseColor,
  children,
  bgColor = Colors.pageBg,
  showLogo = false,
}: WaveHeaderProps) {
  return (
    <View>
      <LinearGradient
        colors={[Colors.blushLight, Colors.blushLight]}
        style={{
          paddingTop: topPad + 18,
          paddingBottom: 12,
          paddingHorizontal: 24,
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 1 }}
      >
        <Svg
          width={width}
          height={TOP_WAVE_H}
          viewBox={`0 0 ${width} ${TOP_WAVE_H}`}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <Path d={topMediumPinkPath} fill={Colors.blushMid} />
          <Path d={topDarkWinePath} fill={Colors.pageBg} />
        </Svg>
        {showLogo && (
          <Image
            source={require("@/assets/images/rhythm-logo.png")}
            style={{ width: width - 48, height: 340, marginTop: 90, marginBottom: 0 }}
            contentFit="contain"
            tintColor={Colors.hotPink}
            cachePolicy="memory-disk"
            transition={0}
          />
        )}
        <View style={{ marginTop: -30 }}>
          {children}
        </View>
      </LinearGradient>

      <View style={{ height: WAVE_HEIGHT, backgroundColor: bgColor }}>
        <Svg
          width={width}
          height={WAVE_HEIGHT}
          viewBox={`0 0 ${width} ${WAVE_HEIGHT}`}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <Path d={mediumPinkPath} fill={Colors.blushMid} />
          <Path d={lightPinkPath} fill={Colors.blushLight} />
        </Svg>
      </View>
    </View>
  );
}

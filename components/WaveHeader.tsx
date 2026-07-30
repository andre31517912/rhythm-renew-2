import React from "react";
import { View, Dimensions } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import Colors from "@/constants/colors";

const { width } = Dimensions.get("window");

export const WAVE_HEIGHT = 80;

const mediumPinkPath = `
  M0,0
  L${width},0
  L${width},8
  C${width * 0.82},8 ${width * 0.66},72 ${width * 0.46},72
  C${width * 0.3},72 ${width * 0.15},28 0,28
  Z
`;

const lightPinkPath = `
  M0,0
  L${width},0
  L${width},3
  C${width * 0.82},3 ${width * 0.66},64 ${width * 0.46},64
  C${width * 0.3},64 ${width * 0.15},22 0,22
  Z
`;

const TOP_WAVE_H = 100;

const topMediumPinkPath = `
  M0,0
  L${width},0
  L${width},14
  C${width * 0.82},14 ${width * 0.66},92 ${width * 0.46},92
  C${width * 0.3},92 ${width * 0.15},40 0,40
  Z
`;

const topDarkWinePath = `
  M0,0
  L${width},0
  L${width},8
  C${width * 0.82},8 ${width * 0.66},82 ${width * 0.46},82
  C${width * 0.3},82 ${width * 0.15},32 0,32
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
          paddingTop: topPad + 12,
          paddingBottom: 10,
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
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
            <Image
              source={require("@/assets/images/rhythm-logo.png")}
              style={{ width: 38, height: 38, marginRight: 10 }}
              contentFit="contain"
              tintColor={Colors.hotPink}
              cachePolicy="memory-disk"
              transition={0}
            />
          </View>
        )}
        {children}
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

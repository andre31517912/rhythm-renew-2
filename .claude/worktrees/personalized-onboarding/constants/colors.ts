const COLORS = {
  hotPink: "#e8006a",
  hotPinkLight: "#ff4d9e",
  hotPinkDark: "#b80050",
  blush: "#f7c5d5",
  blushLight: "#fce4ec",
  blushMid: "#E8B0C0",
  burgundy: "#8B1520",
  burgundyLight: "#A82030",
  cream: "#fce4ec",
  white: "#FFFFFF",
  offWhite: "#fff0f5",
  gray: "#9B7B82",
  grayLight: "#C9A8B0",
  grayDark: "#6B4A52",

  pageBg: "#610015",
  headerDark: "#fce4ec",
  headerMid: "#f5d6e4",
  headerAccent: "#fce4ec",

  menstrual: "#C0004A",
  menstrualLight: "#ffd0e4",
  follicular: "#e8006a",
  follicularLight: "#FFB3D4",
  ovulatory: "#e8006a",
  ovulatoryLight: "#FFB3D4",
  luteal: "#A01850",
  lutealLight: "#f5c0d8",
};

export default {
  light: {
    text: COLORS.burgundy,
    background: COLORS.cream,
    tint: COLORS.hotPink,
    tabIconDefault: COLORS.grayLight,
    tabIconSelected: COLORS.hotPink,
  },
  ...COLORS,
};

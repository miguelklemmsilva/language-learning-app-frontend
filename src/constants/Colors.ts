const accentLightMode = "#db78ff";
const accentDarkMode = "#db78ff";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#ffffff",
    primary: accentLightMode,
    tint: accentLightMode,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: accentLightMode,
    card: "#F9F9F9",
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    primary: accentDarkMode,
    tint: accentDarkMode,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: accentDarkMode,
    card: "#1C1C1E",
  },
};

export type ColorScheme = keyof typeof Colors;
export type ThemeColorName = keyof typeof Colors.light & keyof typeof Colors.dark;

const accent = "#db78ff";

export const Colors = {
  light: {
    text: "#11181C",
    muted: "#687076",
    background: "#ffffff",
    primary: accent,
    tint: accent,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: accent,
    card: "#F6F7F8",
    border: "#E6E8EB",
    success: "#2F9E44",
    danger: "#E03131",
    warning: "#F08C00",
  },
  dark: {
    text: "#ECEDEE",
    muted: "#9BA1A6",
    background: "#151718",
    primary: accent,
    tint: accent,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: accent,
    card: "#1C1C1E",
    border: "#2C2F33",
    success: "#51CF66",
    danger: "#FF6B6B",
    warning: "#FFD43B",
  },
};

export type ColorScheme = keyof typeof Colors;
export type AppColors = (typeof Colors)["light"];
export type ThemeColorName = keyof AppColors;

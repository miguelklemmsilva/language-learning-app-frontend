import { ColorScheme, Colors } from "../constants/Colors";

export function getSystemColorScheme(): ColorScheme {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function hexToHslChannels(hex: string): string {
  const normalized = hex.replace("#", "");
  const red = parseInt(normalized.slice(0, 2), 16) / 255;
  const green = parseInt(normalized.slice(2, 4), 16) / 255;
  const blue = parseInt(normalized.slice(4, 6), 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  let hue = 0;
  let saturation = 0;

  if (max !== min) {
    const delta = max - min;
    saturation =
      lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    switch (max) {
      case red:
        hue = (green - blue) / delta + (green < blue ? 6 : 0);
        break;
      case green:
        hue = (blue - red) / delta + 2;
        break;
      default:
        hue = (red - green) / delta + 4;
    }
    hue /= 6;
  }

  return `${Math.round(hue * 360)} ${Math.round(saturation * 100)}% ${Math.round(
    lightness * 100
  )}%`;
}

export function applyTheme(scheme: ColorScheme) {
  if (typeof document === "undefined") return;

  const colors = Colors[scheme];
  const border = scheme === "dark" ? "#333333" : "#e6e6e6";
  const hover = scheme === "dark" ? "#2c2c2e" : "#f1f1f1";
  const primaryForeground = scheme === "dark" ? "#000000" : "#ffffff";
  const root = document.documentElement;

  root.dataset.theme = scheme;
  root.classList.toggle("dark", scheme === "dark");

  const variables: Record<string, string> = {
    "--app-background": colors.background,
    "--app-text": colors.text,
    "--app-primary": colors.primary,
    "--app-icon": colors.icon,
    "--app-card": colors.card,
    "--app-border": border,
    "--app-hover": hover,
    "--app-primary-foreground": primaryForeground,
    "--background": hexToHslChannels(colors.background),
    "--foreground": hexToHslChannels(colors.text),
    "--card": hexToHslChannels(colors.card),
    "--card-foreground": hexToHslChannels(colors.text),
    "--primary": hexToHslChannels(colors.primary),
    "--primary-foreground": hexToHslChannels(primaryForeground),
    "--secondary": hexToHslChannels(colors.card),
    "--secondary-foreground": hexToHslChannels(colors.text),
    "--muted": hexToHslChannels(hover),
    "--muted-foreground": hexToHslChannels(colors.icon),
    "--accent": hexToHslChannels(hover),
    "--accent-foreground": hexToHslChannels(colors.text),
    "--border": hexToHslChannels(border),
    "--input": hexToHslChannels(border),
    "--ring": hexToHslChannels(colors.primary),
    "--popover": hexToHslChannels(colors.card),
    "--popover-foreground": hexToHslChannels(colors.text),
  };

  for (const [name, value] of Object.entries(variables)) {
    root.style.setProperty(name, value);
  }
}

applyTheme(getSystemColorScheme());

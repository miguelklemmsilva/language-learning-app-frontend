import { ColorScheme, Colors } from "../constants/Colors";

export function getSystemColorScheme(): ColorScheme {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(scheme: ColorScheme) {
  if (typeof document === "undefined") return;

  const colors = Colors[scheme];
  const root = document.documentElement;
  root.dataset.theme = scheme;

  const variables: Record<string, string> = {
    "--background": colors.background,
    "--text": colors.text,
    "--muted": colors.muted,
    "--primary": colors.primary,
    "--icon": colors.icon,
    "--card": colors.card,
    "--border": colors.border,
    "--success": colors.success,
    "--danger": colors.danger,
    "--warning": colors.warning,
  };

  for (const [name, value] of Object.entries(variables)) {
    root.style.setProperty(name, value);
  }
}

applyTheme(getSystemColorScheme());

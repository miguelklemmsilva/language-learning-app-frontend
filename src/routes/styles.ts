import { CSSProperties } from "react";
import { ColorScheme, Colors } from "../constants/Colors";

export function createAuthStyles(scheme: ColorScheme) {
  const colors = Colors[scheme];

  return {
    page: {
      minHeight: "100vh",
      backgroundColor: colors.background,
      color: colors.text,
    } as CSSProperties,
    signIn: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    } as CSSProperties,
  };
}

export function createAppStyles(scheme: ColorScheme) {
  const colors = Colors[scheme];

  return {
    shell: {
      display: "flex",
      height: "100vh",
      backgroundColor: colors.background,
      color: colors.text,
    } as CSSProperties,
    column: {
      display: "flex",
      flexDirection: "column",
      flexGrow: 1,
      minWidth: 0,
    } as CSSProperties,
    main: {
      flexGrow: 1,
      overflow: "auto",
      padding: 24,
    } as CSSProperties,
  };
}

export function createOnboardingStyles(scheme: ColorScheme) {
  const colors = Colors[scheme];
  const border = scheme === "dark" ? "#333333" : "#e3e3e3";

  return {
    page: {
      minHeight: "100vh",
      backgroundColor: colors.background,
      color: colors.text,
    } as CSSProperties,
    signOut: {
      position: "fixed",
      right: 16,
      bottom: 16,
      backgroundColor: colors.card,
      color: colors.text,
      border: `1px solid ${border}`,
      borderRadius: 12,
      padding: "12px 18px",
      fontWeight: 600,
      cursor: "pointer",
    } as CSSProperties,
  };
}

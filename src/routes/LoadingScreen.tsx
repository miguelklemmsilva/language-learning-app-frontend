import { Loader2 } from "lucide-react";
import { Colors } from "../constants/Colors";
import { ThemedText } from "../components/theme/ThemedText";
import { ThemedView } from "../components/theme/ThemedView";
import { useColorScheme } from "../hooks/useColorScheme";
import { useSignOut } from "../hooks/useSignOut";

export function LoadingScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  return (
    <ThemedView
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: colors.text,
      }}
    >
      <Loader2 className="h-8 w-8 animate-spin" color={colors.primary} />
    </ThemedView>
  );
}

export function AccountError() {
  const signOut = useSignOut();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  return (
    <ThemedView
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
    >
      <ThemedText type="subtitle">Couldn't load your account.</ThemedText>
      <button
        type="button"
        onClick={signOut}
        style={{
          backgroundColor: colors.primary,
          color: scheme === "dark" ? "#000000" : "#ffffff",
          border: "none",
          borderRadius: 12,
          padding: "12px 18px",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Sign out
      </button>
    </ThemedView>
  );
}

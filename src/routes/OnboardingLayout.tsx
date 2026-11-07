import { useMemo } from "react";
import { Outlet } from "react-router-dom";
import { useColorScheme } from "../hooks/useColorScheme";
import { useSignOut } from "../hooks/useSignOut";
import { createOnboardingStyles } from "./styles";

export default function OnboardingLayout() {
  const scheme = useColorScheme();
  const styles = useMemo(() => createOnboardingStyles(scheme), [scheme]);
  const signOut = useSignOut();

  return (
    <div className="onboarding-shell" style={styles.page}>
      <Outlet />
      <button type="button" style={styles.signOut} onClick={signOut}>
        Sign Out
      </button>
    </div>
  );
}

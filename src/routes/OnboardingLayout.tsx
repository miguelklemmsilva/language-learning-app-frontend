import { Outlet } from "react-router-dom";
import { useSignOut } from "../hooks/useSignOut";

export default function OnboardingLayout() {
  const signOut = useSignOut();

  return (
    <div className="onboarding-shell">
      <Outlet />
      <button type="button" className="text-button danger onboarding-sign-out" onClick={signOut}>
        Sign out
      </button>
    </div>
  );
}

import { useLayoutEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/userStore";
import { UserResponse } from "../types/api";

export function useRequireLanguage(data: UserResponse | undefined, isLoading: boolean) {
  const setUserData = useUserStore((state) => state.setUserData);
  const navigate = useNavigate();
  const location = useLocation();

  useLayoutEffect(() => {
    if (!data) return;
    setUserData(data);
  }, [data, setUserData]);

  useLayoutEffect(() => {
    if (isLoading || !data) return;

    const hasLanguage = data.user.activeLanguage != null;
    const onOnboarding = location.pathname.startsWith("/onboarding");

    if (!hasLanguage && !onOnboarding) {
      navigate("/onboarding", { replace: true });
    } else if (hasLanguage && onOnboarding) {
      navigate("/home", { replace: true });
    }
  }, [data, isLoading, location.pathname, navigate]);
}

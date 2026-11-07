import { useLayoutEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toLanguageOptions } from "../constants/languages";
import { useLanguageStore } from "../stores/languageStore";
import { useUserStore } from "../stores/userStore";
import { UserResponse } from "../types/api";

export function useRequireLanguage(
  data: UserResponse | undefined,
  isLoading: boolean
) {
  const setUserData = useUserStore((state) => state.setUserData);
  const hydrate = useLanguageStore((state) => state.hydrate);
  const navigate = useNavigate();
  const location = useLocation();

  useLayoutEffect(() => {
    if (!data) return;
    setUserData(data);
    hydrate(data.user.userId, toLanguageOptions(data.userLanguages));
  }, [data, hydrate, setUserData]);

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

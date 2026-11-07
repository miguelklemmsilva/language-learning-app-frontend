import { useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useCategories, useVocabulary } from "../api/vocabularyService";
import { useUserData } from "../api/userService";
import { useLanguageStore } from "../stores/languageStore";
import { useRequireLanguage } from "../hooks/useRequireLanguage";
import { AccountError, LoadingScreen } from "./LoadingScreen";

export default function AuthenticatedLayout() {
  const userQuery = useUserData();
  const vocabularyQuery = useVocabulary();
  const categoriesQuery = useCategories();
  const location = useLocation();
  const hydratedForUser = useLanguageStore((state) => state.hydratedForUser);

  useRequireLanguage(userQuery.data, userQuery.isLoading);

  if (userQuery.isLoading) return <LoadingScreen />;
  if (userQuery.isError || !userQuery.data) return <AccountError />;

  const hasLanguage = userQuery.data.user.activeLanguage != null;
  const onOnboarding = location.pathname.startsWith("/onboarding");
  const redirecting =
    (!hasLanguage && !onOnboarding) || (hasLanguage && onOnboarding);

  if (redirecting || hydratedForUser !== userQuery.data.user.userId) {
    return <LoadingScreen />;
  }

  if (hasLanguage && (vocabularyQuery.isLoading || categoriesQuery.isLoading)) {
    return <LoadingScreen />;
  }

  return <Outlet />;
}

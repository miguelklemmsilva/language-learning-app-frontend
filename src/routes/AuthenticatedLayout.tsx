import { useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useUserData } from "../api/userService";
import { useRequireLanguage } from "../hooks/useRequireLanguage";
import { AccountError, LoadingScreen } from "./LoadingScreen";

export default function AuthenticatedLayout() {
  const userQuery = useUserData();
  const location = useLocation();

  useRequireLanguage(userQuery.data, userQuery.isLoading);

  if (userQuery.isLoading) return <LoadingScreen />;
  if (userQuery.isError || !userQuery.data) return <AccountError />;

  const hasLanguage = userQuery.data.user.activeLanguage != null;
  const onOnboarding = location.pathname.startsWith("/onboarding");
  const redirecting = (!hasLanguage && !onOnboarding) || (hasLanguage && onOnboarding);

  if (redirecting) return <LoadingScreen />;

  return <Outlet />;
}

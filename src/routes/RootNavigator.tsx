import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuthenticator } from "@aws-amplify/ui-react";
import LandingPage from "../components/LandingPage";
import Home from "../components/HomePages/Home/Home";
import Practice from "../components/Practice/Practice/Practice";
import Settings from "../components/HomePages/Settings/Settings";
import WordsPage from "../components/words/WordsPage";
import { OnboardingCountry, OnboardingLanguage, OnboardingLevel } from "../components/onboarding/Onboarding";
import AppLayout from "./AppLayout";
import AuthLayout from "./AuthLayout";
import AuthenticatedLayout from "./AuthenticatedLayout";
import OnboardingLayout from "./OnboardingLayout";
import SignInPage from "./SignInPage";
import { LoadingScreen } from "./LoadingScreen";

export default function RootNavigator() {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route
          path="/"
          element={authStatus === "authenticated" ? <Navigate to="/home" replace /> : <LandingPage />}
        />
        <Route
          path="/sign-in"
          element={authStatus === "authenticated" ? <Navigate to="/home" replace /> : <SignInPage />}
        />
      </Route>
      <Route element={<RequireAuth authStatus={authStatus} />}>
        <Route element={<AuthenticatedLayout />}>
          <Route element={<OnboardingLayout />}>
            <Route path="/onboarding" element={<OnboardingLanguage />} />
            <Route path="/onboarding/level" element={<OnboardingLevel />} />
            <Route path="/onboarding/country" element={<OnboardingCountry />} />
          </Route>
          <Route element={<AppLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/vocabulary" element={<WordsPage />} />
            <Route path="/vocabularytable" element={<Navigate to="/vocabulary" replace />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="/practice" element={<Practice />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={authStatus === "authenticated" ? "/home" : "/"} replace />} />
    </Routes>
  );
}

function RequireAuth({ authStatus }: { authStatus: string }) {
  if (authStatus === "configuring") return <LoadingScreen />;
  if (authStatus !== "authenticated") return <Navigate to="/sign-in" replace />;
  return <Outlet />;
}

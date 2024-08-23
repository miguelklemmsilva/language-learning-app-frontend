import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Home from "./components/HomePages/Home/Home";
import Practice from "./components/Practice/Practice/Practice";
import VocabularyTablePage from "./components/HomePages/VocabularyTable/VocabularyTablePage";
import Settings from "./components/HomePages/Settings/Settings";
import LandingPage from "./components/LandingPage";
import HomeRoute from "./components/HomePages/HomeRoute";
import { HomeRouteProvider } from "./contexts/HomeRouteContext";
import ScrollToTop from "./ScrollToTop";
import { Amplify } from "aws-amplify";
import type { WithAuthenticatorProps } from "@aws-amplify/ui-react";
import { withAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

const userPoolId = "eu-west-2_RIZsiBQTD";
const userPoolClientId = "6oqt0poampv75tagretkn6prib";
const domain = "https://poly-bara.auth.eu-west-2.amazoncognito.com";
const identityPoolId = "eu-west-2:5661328e-c0d9-4db0-927b-8a1d2a48723e";

Amplify.configure({
  Auth: {
    Cognito: {
      //  Amazon Cognito User Pool ID
      userPoolId,
      // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
      userPoolClientId,
      // OPTIONAL - Set to true to use your identity pool's unauthenticated role when user is not logged in
      allowGuestAccess: true,
      identityPoolId,
      // OPTIONAL - This is used when autoSignIn is enabled for Auth.signUp
      // 'code' is used for Auth.confirmSignUp, 'link' is used for email link verification
      signUpVerificationMethod: "code", // 'code' | 'link'
      loginWith: {
        // OPTIONAL - Hosted UI configuration
        oauth: {
          domain: domain,
          scopes: [
            "phone",
            "email",
            "profile",
            "openid",
            "aws.cognito.signin.user.admin",
          ],
          redirectSignIn: ["http://localhost:3000/"],
          redirectSignOut: ["http://localhost:3000/"],
          responseType: "code", // or 'token', note that REFRESH token will only be generated when the responseType is code
        },
      },
    },
  },
});

function App({ signOut, user }: WithAuthenticatorProps) {
  return <div>{user?.signInDetails?.loginId}</div>;

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/home"
          element={
            <HomeRoute>
              <Home />
            </HomeRoute>
          }
        />
        <Route
          path="/vocabularytable"
          element={
            <HomeRoute>
              <VocabularyTablePage />
            </HomeRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <HomeRoute>
              <Settings />
            </HomeRoute>
          }
        />
        <Route
          path="/practice"
          element={
            <HomeRouteProvider>
              <Practice />
            </HomeRouteProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default withAuthenticator(App);

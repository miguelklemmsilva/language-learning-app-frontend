import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/HomePages/Home/Home";
import Practice from "./components/Practice/Practice/Practice";
import VocabularyTablePage from "./components/HomePages/VocabularyTable/VocabularyTablePage";
import Settings from "./components/HomePages/Settings/Settings";
import LandingPage from "./components/LandingPage";
import HomeRoute from "./components/HomePages/HomeRoute";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";

const userPoolId = "eu-west-2_RIZsiBQTD";
const userPoolClientId = "6oqt0poampv75tagretkn6prib";
const domain = "https://poly-bara.auth.eu-west-2.amazoncognito.com";
const identityPoolId = "eu-west-2:ec40ba46-ed92-4570-abf5-e19b036e1bd6";
const region = "eu-west-2";

Amplify.configure({
  Auth: {
    Cognito: {
      //  Amazon Cognito User Pool ID
      userPoolId,
      // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
      userPoolClientId,
      // OPTIONAL - Set to true to use your identity pool's unauthenticated role when user is not logged in
      allowGuestAccess: true,
      identityPoolId: "",
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
  API: {
    REST: {
      LanguageLearningApp: {
        endpoint: "https://93lmq6rvx4.execute-api.eu-west-2.amazonaws.com/prod",
        region,
      },
    },
  },
});

function App() {
  return (
    <BrowserRouter>
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
            <HomeRoute>
              <Practice />
            </HomeRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

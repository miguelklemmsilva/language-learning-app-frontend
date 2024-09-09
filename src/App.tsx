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
const region = "eu-west-2";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId,
      userPoolClientId,
      loginWith: {
        oauth: {
          redirectSignIn: [
            "http://localhost:3000/home",
            "https://miguelklemmsilva.com/home",
          ],
          redirectSignOut: [
            "http://localhost:3000",
            "https://miguelklemmsilva.com",
          ],
          domain: "poly-bara.auth.eu-west-2.amazoncognito.com",
          scopes: ["email", "openid"],
          responseType: "code",
          providers: ["Google"],
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

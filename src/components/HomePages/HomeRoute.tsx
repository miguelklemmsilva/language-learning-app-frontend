import React, { useEffect, useState, ReactNode } from "react";
import { get } from "aws-amplify/api";
import { fetchAuthSession } from "aws-amplify/auth";
import { AuthUser } from "@aws-amplify/ui";
import Sidebar from "./Navbar/Navbar";
import { HomeRouteProvider } from "../../contexts/HomeRouteContext";
import Settings from "./Settings/Settings";
import Footer from "./Footer";
import CustomAuth from "../CustomAuth";

interface HomeRouteProps {
  children: ReactNode;
}

interface SignOutFunction {
  (): void;
}

const HomeRoute: React.FC<HomeRouteProps> = ({ children }) => {
  const [activeLanguage, setActiveLanguage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  async function checkActiveLanguage() {
    const authToken =
      (await fetchAuthSession()).tokens?.idToken?.toString() ?? "";
    try {
      const request = get({
        apiName: "LanguageLearningApp",
        path: "/user",
        options: {
          headers: {
            Authorization: authToken,
            "Content-Type": "application/json",
          },
        },
      });
      const response = await request.response;
      const { body } = response;
      const json = await body.json();
      setActiveLanguage(json.activeLanguage);
    } catch (e) {
      console.log(
        "POST call failed: ",
        JSON.parse((await e.response.body) as string)
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkActiveLanguage();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <CustomAuth>
      {({ signOut, user }: { signOut: SignOutFunction; user: AuthUser }) => (
        <HomeRouteProvider
          activeLanguage={activeLanguage}
          setActiveLanguage={setActiveLanguage}
          signOut={signOut}
          user={user}
        >
          {activeLanguage ? (
            <>
              <Sidebar />
              {children}
              <Footer />
            </>
          ) : (
            <Settings />
          )}
        </HomeRouteProvider>
      )}
    </CustomAuth>
  );
};

export default HomeRoute;

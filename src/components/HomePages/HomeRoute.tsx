import React, { useContext } from "react";
import Sidebar from "./Navbar/Navbar";
import Footer from "./Footer";
import Settings from "./Settings/Settings";
import {
  HomeRouteProvider,
  HomeRouteContext,
} from "../../contexts/HomeRouteContext";
import CustomAuth from "../Auth/CustomAuth";

interface HomeRouteProps {
  children: React.ReactNode;
}

const HomeRoute: React.FC<HomeRouteProps> = ({ children }) => {
  return (
    <CustomAuth>
      {({ signOut, user }) => (
        <HomeRouteProvider signOut={signOut} user={user}>
          <HomeRouteContent>{children}</HomeRouteContent>
        </HomeRouteProvider>
      )}
    </CustomAuth>
  );
};

const HomeRouteContent: React.FC<HomeRouteProps> = ({ children }) => {
  const context = useContext(HomeRouteContext);

  // Check if context is undefined or if activeLanguage is not set
  if (!context || !context.activeLanguage) {
    return <Settings />;
  }

  console.log(context.activeLanguage);

  return (
    <>
      <Sidebar />
      {children}
      <Footer />
    </>
  );
};

export default HomeRoute;

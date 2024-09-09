import React, { useContext } from "react";
import {
  HomeRouteProvider,
  HomeRouteContext,
} from "../../contexts/HomeRouteContext";
import CustomAuth from "../Auth/CustomAuth";
import Sidebar from "./Navbar/Navbar";
import Footer from "./Footer";
import Settings from "./Settings/Settings";
import { Button } from "../../components/ui/button";
import { Loader2 } from "lucide-react";

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

  if (!context) {
    return <LoadingState />;
  }

  const { activeLanguage, isLoading, signOut } = context;

  if (isLoading) {
    return <LoadingState />;
  }

  if (!activeLanguage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Settings />
        <SignOutButton signOut={signOut} />
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-grow">
        <main className="flex-grow overflow-auto p-6">{children}</main>
        <Footer />
      </div>
    </div>
  );
};

const LoadingState: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

const SignOutButton: React.FC<{ signOut?: () => void }> = ({ signOut }) => {
  if (!signOut) return null;
  return (
    <Button
      onClick={signOut}
      variant="destructive"
      className="fixed bottom-4 right-4"
    >
      Sign Out
    </Button>
  );
};

export default HomeRoute;

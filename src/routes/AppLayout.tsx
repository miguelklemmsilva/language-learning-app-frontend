import { useMemo } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/HomePages/Navbar/Navbar";
import { useColorScheme } from "../hooks/useColorScheme";
import { createAppStyles } from "./styles";

export default function AppLayout() {
  const scheme = useColorScheme();
  const styles = useMemo(() => createAppStyles(scheme), [scheme]);

  return (
    <div style={styles.shell}>
      <Navbar />
      <div style={styles.column}>
        <main style={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

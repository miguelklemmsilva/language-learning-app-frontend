import { useMemo } from "react";
import { Outlet } from "react-router-dom";
import { useColorScheme } from "../hooks/useColorScheme";
import { createAuthStyles } from "./styles";

export default function AuthLayout() {
  const scheme = useColorScheme();
  const styles = useMemo(() => createAuthStyles(scheme), [scheme]);

  return (
    <div style={styles.page}>
      <Outlet />
    </div>
  );
}

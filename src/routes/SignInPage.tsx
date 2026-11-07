import { useMemo } from "react";
import { Navigate } from "react-router-dom";
import CustomAuth from "../components/Auth/CustomAuth";
import { useColorScheme } from "../hooks/useColorScheme";
import { createAuthStyles } from "./styles";

export default function SignInPage() {
  const scheme = useColorScheme();
  const styles = useMemo(() => createAuthStyles(scheme), [scheme]);

  return (
    <div style={styles.signIn}>
      <CustomAuth>
        <Navigate to="/home" replace />
      </CustomAuth>
    </div>
  );
}

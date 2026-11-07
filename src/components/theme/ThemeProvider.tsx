import { ReactNode, useLayoutEffect } from "react";
import { useColorScheme } from "../../hooks/useColorScheme";
import { applyTheme } from "../../theme/applyTheme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();

  useLayoutEffect(() => {
    applyTheme(scheme);
  }, [scheme]);

  return children;
}

import { useEffect, useState } from "react";
import { ColorScheme } from "../constants/Colors";
import { getSystemColorScheme } from "../theme/applyTheme";

export function useColorScheme(): ColorScheme {
  const [scheme, setScheme] = useState<ColorScheme>(getSystemColorScheme);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setScheme(getSystemColorScheme());
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return scheme;
}

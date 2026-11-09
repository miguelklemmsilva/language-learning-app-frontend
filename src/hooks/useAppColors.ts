import { Colors } from "../constants/Colors";
import { useColorScheme } from "./useColorScheme";

export function useAppColors() {
  const scheme = useColorScheme();
  return { scheme, colors: Colors[scheme] };
}

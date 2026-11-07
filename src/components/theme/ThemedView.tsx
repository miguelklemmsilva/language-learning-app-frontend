import { CSSProperties, HTMLAttributes } from "react";
import { useThemeColor } from "../../hooks/useThemeColor";

export type ThemedViewProps = HTMLAttributes<HTMLDivElement> & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );

  return (
    <div
      style={{ backgroundColor, ...(style as CSSProperties) }}
      {...otherProps}
    />
  );
}

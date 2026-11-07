import { CSSProperties, HTMLAttributes } from "react";
import { useThemeColor } from "../../hooks/useThemeColor";

const textStyles: Record<string, CSSProperties> = {
  default: {
    fontSize: 16,
    lineHeight: "24px",
    margin: 0,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: "24px",
    fontWeight: 600,
    margin: 0,
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    lineHeight: "32px",
    margin: 0,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 700,
    margin: 0,
  },
  link: {
    lineHeight: "30px",
    fontSize: 16,
    color: "#0a7ea4",
    margin: 0,
  },
};

export type ThemedTextProps = HTMLAttributes<HTMLParagraphElement> & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <p
      style={{
        color,
        ...textStyles[type],
        ...style,
      }}
      {...rest}
    />
  );
}

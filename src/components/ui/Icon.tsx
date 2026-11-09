import { ReactNode } from "react";

export type IconName =
  | "home"
  | "book"
  | "settings"
  | "close"
  | "add"
  | "check"
  | "trash"
  | "volume"
  | "mic"
  | "stop"
  | "play"
  | "headset"
  | "language"
  | "alert"
  | "help"
  | "refresh";

export function Icon({ name, size = 24 }: { name: IconName; size?: number }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {glyph(name)}
    </svg>
  );
}

function glyph(name: IconName): ReactNode {
  switch (name) {
    case "home":
      return <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />;
    case "book":
      return (
        <>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5V5.5Z" />
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        </>
      );
    case "settings":
      return (
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.5 1.1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
        </>
      );
    case "close":
      return (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6 6 18" />
        </>
      );
    case "add":
      return (
        <>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </>
      );
    case "check":
      return <path d="m5 12 5 5L20 7" />;
    case "trash":
      return (
        <>
          <path d="M4 7h16" />
          <path d="M9 7V5h6v2" />
          <path d="M7 7l1 13h8l1-13" />
        </>
      );
    case "volume":
      return (
        <>
          <path d="M4 10h3l5-4v12l-5-4H4v-4Z" />
          <path d="M16 9a4 4 0 0 1 0 6" />
          <path d="M18.5 7a7 7 0 0 1 0 10" />
        </>
      );
    case "mic":
      return (
        <>
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M6 11a6 6 0 0 0 12 0" />
          <path d="M12 17v4" />
        </>
      );
    case "stop":
      return <rect x="7" y="7" width="10" height="10" rx="1" fill="currentColor" stroke="none" />;
    case "play":
      return <path d="m8 6 11 6-11 6V6Z" fill="currentColor" stroke="none" />;
    case "headset":
      return (
        <>
          <path d="M4 13a8 8 0 0 1 16 0" />
          <rect x="3" y="13" width="4" height="7" rx="1" />
          <rect x="17" y="13" width="4" height="7" rx="1" />
        </>
      );
    case "language":
      return (
        <>
          <path d="m5 8 6 12" />
          <path d="m11 8-6 12" />
          <path d="M7 15h4" />
          <path d="M14 19h6" />
          <path d="M15 8h5" />
          <path d="M19 8c-1 4-3 7-6 9" />
        </>
      );
    case "alert":
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5" />
          <path d="M12 16h.01" />
        </>
      );
    case "help":
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9a2.5 2.5 0 1 1 3.4 2.3c-.8.4-1.4 1-1.4 1.9" />
          <path d="M12 17h.01" />
        </>
      );
    case "refresh":
      return (
        <>
          <path d="M20 12a8 8 0 1 1-2.3-5.7" />
          <path d="M20 5v5h-5" />
        </>
      );
    default:
      return null;
  }
}

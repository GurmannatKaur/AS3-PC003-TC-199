import type { ReactNode, SVGProps } from "react";

export type IconName =
  | "overview"
  | "network"
  | "clients"
  | "training"
  | "predictions"
  | "settings"
  | "menu"
  | "close"
  | "location"
  | "sparkle"
  | "clock"
  | "arrow"
  | "plus"
  | "minus"
  | "ambulance"
  | "fire"
  | "police"
  | "disaster"
  | "route"
  | "clear"
  | "pin"
  | "car";

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
};

const paths: Record<IconName, ReactNode> = {
  overview: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>,
  network: <><circle cx="5" cy="6" r="2" /><circle cx="19" cy="18" r="2" /><path d="M7 6h4a3 3 0 0 1 3 3v6a3 3 0 0 0 3 3h0M5 8v9a3 3 0 0 0 3 3h9" /></>,
  clients: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-1a6 6 0 0 1 12 0v1M16 5.5a3 3 0 0 1 0 5.8M18 14a5 5 0 0 1 3 4.5V20" /></>,
  training: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.5 9a7 7 0 0 1 12-2L20 12M4 12l2.5 5a7 7 0 0 0 12-2" /></>,
  predictions: <><path d="M3 17 9 11l4 4 8-9" /><path d="M15 6h6v6" /></>,
  settings: <><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.6.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.6-.9l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-1.9l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.6-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.6.9l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 0 1.8Z" transform="translate(-1 -1)" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  sparkle: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  minus: <path d="M5 12h14" />,
  ambulance: <><path d="M3 7h11v11H3zM14 11h4l3 3v4h-7" /><path d="M7 10v5M4.5 12.5h5M17 11v3h4M7 18.5h.01M18 18.5h.01" /></>,
  fire: <><path d="M12 22c4.2 0 7-2.9 7-6.7 0-3.1-1.7-5-3.4-7.3-.1 2-1.1 3.2-2.2 3.8.2-4-1.7-7.5-5-9.8.3 4.2-1.3 6.4-3 9-1 1.5-1.4 2.9-1.4 4.3C4 19.1 7 22 12 22Z" /><path d="M12 18c1.4 0 2.3-.9 2.3-2.1 0-.9-.5-1.5-1.2-2.2-.1.8-.5 1.2-1.1 1.4.1-1.2-.5-2.1-1.4-2.7.1 1.3-.9 2.1-.9 3.4 0 1.3.9 2.2 2.3 2.2Z" /></>,
  police: <><path d="m12 22 6-3V8l-6-4-6 4v11l6 3Z" /><path d="m9 13 2 2 4-4M9 3h6" /></>,
  disaster: <><path d="M3 20h18M5 20V9l7-5 7 5v11M9 20v-5h6v5" /><path d="M12 8v3M12 13h.01" /></>,
  route: <><circle cx="6" cy="18" r="2" /><circle cx="18" cy="6" r="2" /><path d="M8 18h2a3 3 0 0 0 3-3v-3a3 3 0 0 1 3-3h0" /></>,
  clear: <><path d="m5 5 14 14M19 5 5 19" /><circle cx="12" cy="12" r="9" /></>,
  pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  car: <><path d="m5 11 1.5-4h11L19 11M3 11h18v7H3z" /><path d="M6 18v2M18 18v2M7 14h.01M17 14h.01" /></>,
};

export default function Icon({ name, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}

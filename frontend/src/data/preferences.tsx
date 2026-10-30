import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type SpeedUnit = "km/h" | "mph";
export type ForecastHorizon = 5 | 10 | 15;

type Preferences = {
  speedUnit: SpeedUnit;
  setSpeedUnit: (unit: SpeedUnit) => void;
  defaultHorizon: ForecastHorizon;
  setDefaultHorizon: (horizon: ForecastHorizon) => void;
  compactMapLabels: boolean;
  setCompactMapLabels: (enabled: boolean) => void;
  reduceMotion: boolean;
  setReduceMotion: (enabled: boolean) => void;
  congestionAlerts: boolean;
  setCongestionAlerts: (enabled: boolean) => void;
};

const PreferencesContext = createContext<Preferences | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [speedUnit, setSpeedUnit] = useState<SpeedUnit>("km/h");
  const [defaultHorizon, setDefaultHorizon] = useState<ForecastHorizon>(15);
  const [compactMapLabels, setCompactMapLabels] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [congestionAlerts, setCongestionAlerts] = useState(true);

  useEffect(() => {
    document.documentElement.dataset.reduceMotion = String(reduceMotion);
  }, [reduceMotion]);

  return (
    <PreferencesContext.Provider
      value={{
        speedUnit,
        setSpeedUnit,
        defaultHorizon,
        setDefaultHorizon,
        compactMapLabels,
        setCompactMapLabels,
        reduceMotion,
        setReduceMotion,
        congestionAlerts,
        setCongestionAlerts,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const preferences = useContext(PreferencesContext);
  if (!preferences) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return preferences;
}

export function formatSpeed(kilometersPerHour: number, unit: SpeedUnit) {
  if (unit === "mph") {
    return `${Math.round(kilometersPerHour * 0.621371)} mph`;
  }
  return `${kilometersPerHour} km/h`;
}

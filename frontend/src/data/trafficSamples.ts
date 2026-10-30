export type CongestionLevel = "High" | "Moderate" | "Low";

export interface TrafficRoad {
  id: string;
  name: string;
  junction: string;
  position: [number, number];
  congestion: CongestionLevel;
  averageSpeed: number;
  flow: number;
}

export const roads: TrafficRoad[] = [
  {
    id: "dakshin-marg",
    name: "Dakshin Marg",
    junction: "Sector 35 Junction",
    position: [30.7245, 76.7645],
    congestion: "Low",
    averageSpeed: 38,
    flow: 420,
  },
  {
    id: "madhya-marg",
    name: "Madhya Marg",
    junction: "Sector 17 Junction",
    position: [30.7415, 76.7821],
    congestion: "Moderate",
    averageSpeed: 24,
    flow: 860,
  },
  {
    id: "uttar-marg",
    name: "Uttar Marg",
    junction: "Sector 22 Junction",
    position: [30.7333, 76.7725],
    congestion: "High",
    averageSpeed: 12,
    flow: 1240,
  },
];

export const forecasts: Record<
  string,
  Record<number, { label: string; value: number; level: CongestionLevel }[]>
> = {
  "dakshin-marg": {
    15: [
      { label: "Now", value: 420, level: "Low" },
      { label: "+5 min", value: 450, level: "Low" },
      { label: "+10 min", value: 480, level: "Low" },
      { label: "+15 min", value: 460, level: "Low" },
    ],
    30: [
      { label: "Now", value: 420, level: "Low" },
      { label: "+10 min", value: 480, level: "Low" },
      { label: "+20 min", value: 510, level: "Moderate" },
      { label: "+30 min", value: 490, level: "Moderate" },
    ],
    60: [
      { label: "Now", value: 420, level: "Low" },
      { label: "+15 min", value: 460, level: "Low" },
      { label: "+30 min", value: 490, level: "Moderate" },
      { label: "+60 min", value: 470, level: "Low" },
    ],
  },
  "madhya-marg": {
    15: [
      { label: "Now", value: 860, level: "Moderate" },
      { label: "+5 min", value: 900, level: "Moderate" },
      { label: "+10 min", value: 940, level: "Moderate" },
      { label: "+15 min", value: 910, level: "Moderate" },
    ],
    30: [
      { label: "Now", value: 860, level: "Moderate" },
      { label: "+10 min", value: 940, level: "Moderate" },
      { label: "+20 min", value: 1020, level: "High" },
      { label: "+30 min", value: 980, level: "Moderate" },
    ],
    60: [
      { label: "Now", value: 860, level: "Moderate" },
      { label: "+15 min", value: 910, level: "Moderate" },
      { label: "+30 min", value: 980, level: "Moderate" },
      { label: "+60 min", value: 920, level: "Moderate" },
    ],
  },
  "uttar-marg": {
    15: [
      { label: "Now", value: 1240, level: "High" },
      { label: "+5 min", value: 1160, level: "High" },
      { label: "+10 min", value: 1080, level: "Moderate" },
      { label: "+15 min", value: 1020, level: "Moderate" },
    ],
    30: [
      { label: "Now", value: 1240, level: "High" },
      { label: "+10 min", value: 1080, level: "Moderate" },
      { label: "+20 min", value: 990, level: "Moderate" },
      { label: "+30 min", value: 940, level: "Moderate" },
    ],
    60: [
      { label: "Now", value: 1240, level: "High" },
      { label: "+15 min", value: 1020, level: "Moderate" },
      { label: "+30 min", value: 940, level: "Moderate" },
      { label: "+60 min", value: 880, level: "Moderate" },
    ],
  },
};

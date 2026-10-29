export type Coordinates = [latitude: number, longitude: number];
export type EmergencyService = "ambulance" | "fire" | "police" | "disaster";
export type RoutePreference = "fastest" | "shortest";

export interface RoutingLocation {
  id: string;
  name: string;
  coordinates: Coordinates;
}

export interface RouteOption {
  id: string;
  coordinates: Coordinates[];
  distanceMeters: number;
  durationSeconds: number;
  roadNames: string[];
}

export interface RoutePlan {
  provider: "OpenStreetMap OSRM";
  service: EmergencyService;
  origin: RoutingLocation;
  destination: RoutingLocation;
  preference: RoutePreference;
  options: RouteOption[];
  selectedOptionId: string;
  calculatedAt: string;
}

export class RoutingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RoutingError";
  }
}

interface OsrmStep {
  name: string;
}

interface OsrmRoute {
  distance: number;
  duration: number;
  geometry: { coordinates: [number, number][] };
  legs: { steps: OsrmStep[] }[];
}

interface OsrmResponse {
  code: string;
  message?: string;
  routes?: OsrmRoute[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseOsrmResponse(value: unknown): OsrmResponse {
  if (!isRecord(value) || typeof value.code !== "string") {
    throw new RoutingError("The routing service returned an unexpected response.");
  }

  if (value.code !== "Ok") {
    const message = typeof value.message === "string" ? value.message : "No drivable route was found.";
    throw new RoutingError(message);
  }

  if (!Array.isArray(value.routes)) {
    throw new RoutingError("The routing service did not return route options.");
  }

  const routes = value.routes.map((route, index): OsrmRoute => {
    if (
      !isRecord(route)
      || typeof route.distance !== "number"
      || typeof route.duration !== "number"
      || !isRecord(route.geometry)
      || !Array.isArray(route.geometry.coordinates)
      || !Array.isArray(route.legs)
    ) {
      throw new RoutingError(`Route option ${index + 1} was incomplete.`);
    }

    const coordinates = route.geometry.coordinates.map((point) => {
      if (
        !Array.isArray(point)
        || typeof point[0] !== "number"
        || typeof point[1] !== "number"
      ) {
        throw new RoutingError(`Route option ${index + 1} contained invalid geometry.`);
      }
      return [point[0], point[1]] as [number, number];
    });

    const legs = route.legs.map((leg) => {
      if (!isRecord(leg) || !Array.isArray(leg.steps)) {
        throw new RoutingError(`Route option ${index + 1} contained invalid road details.`);
      }
      const steps = leg.steps.map((step) => {
        if (!isRecord(step) || typeof step.name !== "string") {
          throw new RoutingError(`Route option ${index + 1} contained invalid road details.`);
        }
        return { name: step.name };
      });
      return { steps };
    });

    return {
      distance: route.distance,
      duration: route.duration,
      geometry: { coordinates },
      legs,
    };
  });

  return { code: value.code, routes };
}

function getRoutingEndpoint() {
  const configured = import.meta.env.VITE_ROUTING_BASE_URL?.trim();
  return (configured || "https://router.project-osrm.org").replace(/\/+$/, "");
}

export async function findEmergencyRoutes({
  origin,
  destination,
  service,
  preference,
  signal,
}: {
  origin: RoutingLocation;
  destination: RoutingLocation;
  service: EmergencyService;
  preference: RoutePreference;
  signal?: AbortSignal;
}): Promise<RoutePlan> {
  const [originLat, originLon] = origin.coordinates;
  const [destinationLat, destinationLon] = destination.coordinates;
  const url = new URL(
    `${getRoutingEndpoint()}/route/v1/driving/${originLon},${originLat};${destinationLon},${destinationLat}`,
  );
  url.searchParams.set("alternatives", "true");
  url.searchParams.set("overview", "full");
  url.searchParams.set("steps", "true");
  url.searchParams.set("geometries", "geojson");

  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new RoutingError("Could not reach the route service. Check your connection and try again.");
  }

  if (!response.ok) {
    throw new RoutingError(`The route service returned HTTP ${response.status}. Try again later.`);
  }

  let raw: unknown;
  try {
    raw = await response.json();
  } catch {
    throw new RoutingError("The route service returned unreadable route data.");
  }

  const payload = parseOsrmResponse(raw);
  const options = (payload.routes ?? []).map((route, index): RouteOption => ({
    id: `route-${index + 1}`,
    coordinates: route.geometry.coordinates.map(([longitude, latitude]) => [latitude, longitude]),
    distanceMeters: route.distance,
    durationSeconds: route.duration,
    roadNames: [...new Set(route.legs.flatMap((leg) => leg.steps.map((step) => step.name).filter(Boolean)))],
  }));

  if (options.length === 0) {
    throw new RoutingError("No drivable route was found between those locations.");
  }

  const sortedOptions = [...options].sort((a, b) => (
    preference === "fastest"
      ? a.durationSeconds - b.durationSeconds
      : a.distanceMeters - b.distanceMeters
  ));

  return {
    provider: "OpenStreetMap OSRM",
    service,
    origin,
    destination,
    preference,
    options,
    selectedOptionId: sortedOptions[0].id,
    calculatedAt: new Date().toISOString(),
  };
}

export function getPreferredOption(plan: RoutePlan, preference: RoutePreference) {
  const sorted = [...plan.options].sort((a, b) => (
    preference === "fastest"
      ? a.durationSeconds - b.durationSeconds
      : a.distanceMeters - b.distanceMeters
  ));
  return sorted[0];
}

export function formatDistance(meters: number) {
  return meters >= 1000
    ? `${(meters / 1000).toFixed(1)} km`
    : `${Math.round(meters)} m`;
}

export function formatDuration(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes === 0 ? `${hours} hr` : `${hours} hr ${remainingMinutes} min`;
}

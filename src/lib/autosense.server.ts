// Server-only Google Maps Platform access through the Lovable connector gateway.
import type { AqiResult, PlaceResult, RouteOption } from "./autosense-types";
import { decodePolyline } from "./autosense-types";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";

export class MapsConfigError extends Error {}

function credentials() {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const mapsKey = process.env["GOOGLE_MAPS_API_KEY"];
  if (!lovableKey || !mapsKey) {
    throw new MapsConfigError(
      "Google Maps isn't connected yet. Link the Google Maps Platform connector to enable search, routing and air-quality data.",
    );
  }
  return { lovableKey, mapsKey };
}

async function gateway(
  path: string,
  init: { method?: string; body?: unknown; headers?: Record<string, string> } = {},
) {
  const { lovableKey, mapsKey } = credentials();
  const response = await fetch(`${GATEWAY_URL}${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": mapsKey,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    body: init.body ? JSON.stringify(init.body) : null,
  });

  if (response.status === 403) {
    const body = await response.text();
    console.error(`Google Maps gateway 403: ${body}`);
    throw new Error(
      "Google Maps denied the request (403). Check the API key restrictions in Google Cloud Console.",
    );
  }
  if (!response.ok) {
    const body = await response.text();
    console.error(`Google Maps gateway failed [${response.status}]: ${body}`);
    throw new Error(`Map services returned an error (${response.status}).`);
  }
  return response.json();
}

/* ---------------------------------- places --------------------------------- */

type TextSearchResponse = {
  places?: {
    id: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    location?: { latitude: number; longitude: number };
  }[];
};

export async function searchPlaces(query: string, limit = 5): Promise<PlaceResult[]> {
  const data = (await gateway("/places/v1/places:searchText", {
    method: "POST",
    headers: {
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.location",
    },
    body: { textQuery: query, maxResultCount: limit },
  })) as TextSearchResponse;

  return (data.places ?? [])
    .filter((p) => p.location)
    .map((p) => ({
      id: p.id,
      name: p.displayName?.text ?? p.formattedAddress ?? query,
      address: p.formattedAddress ?? "",
      lat: p.location!.latitude,
      lng: p.location!.longitude,
    }));
}

export async function reverseGeocode(lat: number, lng: number): Promise<PlaceResult> {
  const data = (await gateway(
    `/maps/api/geocode/json?latlng=${lat},${lng}`,
  )) as { results?: { place_id: string; formatted_address: string }[] };
  const first = data.results?.[0];
  return {
    id: first?.place_id ?? `${lat},${lng}`,
    name: first?.formatted_address?.split(",")[0] ?? "Current location",
    address: first?.formatted_address ?? "",
    lat,
    lng,
  };
}

/* ----------------------------------- aqi ----------------------------------- */

type AirQualityResponse = {
  dateTime?: string;
  indexes?: { code: string; displayName?: string; aqi?: number; category?: string }[];
  pollutants?: { code: string; concentration?: { value?: number } }[];
};

const aqiCache = new Map<string, AqiResult>();

/**
 * Provider-agnostic entry point for air quality. Swap the body of this function
 * to change providers; the UI only depends on the AqiResult shape.
 */
export async function getAQI(lat: number, lng: number, withWeather = false): Promise<AqiResult> {
  const cacheKey = `${lat.toFixed(2)},${lng.toFixed(2)},${withWeather}`;
  const cached = aqiCache.get(cacheKey);
  if (cached) return cached;

  const data = (await gateway("/airquality/v1/currentConditions:lookup", {
    method: "POST",
    body: {
      location: { latitude: lat, longitude: lng },
      extraComputations: ["LOCAL_AQI", "POLLUTANT_CONCENTRATION"],
      languageCode: "en",
    },
  })) as AirQualityResponse;

  const local = data.indexes?.find((i) => i.code !== "uaqi") ?? data.indexes?.[0];
  if (!local || typeof local.aqi !== "number") {
    throw new Error("Air-quality data isn't available for this location right now.");
  }

  const pollutant = (code: string) =>
    data.pollutants?.find((p) => p.code === code)?.concentration?.value ?? null;

  let temperature: number | null = null;
  let humidity: number | null = null;
  if (withWeather) {
    try {
      const weather = (await gateway(
        `/weather/v1/currentConditions:lookup?location.latitude=${lat}&location.longitude=${lng}`,
      )) as { temperature?: { degrees?: number }; relativeHumidity?: number };
      temperature = weather.temperature?.degrees ?? null;
      humidity = weather.relativeHumidity ?? null;
    } catch (error) {
      console.error("Weather lookup failed", error);
    }
  }

  const result: AqiResult = {
    aqi: Math.round(local.aqi),
    category: (local.category ?? "").replace(/ air quality$/i, "").toUpperCase() || "MEASURED",
    standard: local.displayName ?? "Local AQI",
    pm25: pollutant("pm25"),
    pm10: pollutant("pm10"),
    temperature,
    humidity,
    updatedAt: data.dateTime ?? new Date().toISOString(),
    lat,
    lng,
    demo: false,
  };
  aqiCache.set(cacheKey, result);
  return result;
}

/* ---------------------------------- routes --------------------------------- */

type ComputeRoutesResponse = {
  routes?: {
    duration?: string;
    distanceMeters?: number;
    polyline?: { encodedPolyline?: string };
  }[];
};

function severity(aqi: number) {
  // Simple transparent severity weighting used by the exposure estimate.
  return Math.max(1, aqi) / 50;
}

function sampleAlong(points: { lat: number; lng: number }[], count: number) {
  if (points.length <= count) return points;
  const step = (points.length - 1) / (count - 1);
  return Array.from({ length: count }, (_, i) => points[Math.round(i * step)]!);
}

export async function computeRouteOptions(
  origin: PlaceResult,
  destination: PlaceResult,
): Promise<RouteOption[]> {
  const data = (await gateway("/routes/directions/v2:computeRoutes", {
    method: "POST",
    headers: {
      "X-Goog-FieldMask":
        "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
    },
    body: {
      origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
      destination: {
        location: { latLng: { latitude: destination.lat, longitude: destination.lng } },
      },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
      computeAlternativeRoutes: true,
    },
  })) as ComputeRoutesResponse;

  const routes = (data.routes ?? []).filter((r) => r.polyline?.encodedPolyline);
  if (routes.length === 0) {
    throw new Error("No driving route was found between those two places.");
  }

  const options: RouteOption[] = [];
  for (const [index, route] of routes.slice(0, 3).entries()) {
    const encodedPolyline = route.polyline!.encodedPolyline!;
    const points = decodePolyline(encodedPolyline);
    const durationMin = Math.max(1, Math.round(parseInt(route.duration ?? "0", 10) / 60));
    const distanceKm = (route.distanceMeters ?? 0) / 1000;

    const samplePoints = sampleAlong(points, 5);
    const readings = await Promise.all(
      samplePoints.map(async (point) => {
        try {
          const aqi = await getAQI(point.lat, point.lng);
          return { lat: point.lat, lng: point.lng, aqi: aqi.aqi };
        } catch {
          return null;
        }
      }),
    );
    const samples = readings.filter((r): r is { lat: number; lng: number; aqi: number } => !!r);
    if (samples.length === 0) {
      throw new Error("Air-quality data isn't available along this route right now.");
    }

    const averageAqi = Math.round(samples.reduce((sum, s) => sum + s.aqi, 0) / samples.length);
    // Estimated exposure = travel minutes x AQI severity along the route.
    const exposureScore = Math.round(durationMin * severity(averageAqi) * 10) / 10;

    options.push({
      id: `route-${index}`,
      label: index === 0 ? "Primary" : `Alternative ${index}`,
      distanceKm: Math.round(distanceKm * 10) / 10,
      durationMin,
      averageAqi,
      exposureScore,
      encodedPolyline,
      samples,
      recommended: false,
    });
  }
  return options;
}

// Browser-safe shared types + AQI helpers for AutoSense.

export type PlaceResult = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
};

export type AqiResult = {
  aqi: number;
  category: string;
  standard: string;
  pm25: number | null;
  pm10: number | null;
  temperature: number | null;
  humidity: number | null;
  updatedAt: string;
  lat: number;
  lng: number;
  demo: boolean;
};

export type RouteOption = {
  id: string;
  label: string;
  distanceKm: number;
  durationMin: number;
  averageAqi: number;
  exposureScore: number;
  encodedPolyline: string;
  samples: { lat: number; lng: number; aqi: number }[];
  recommended: boolean;
};

export type RouteAnalysis = {
  origin: PlaceResult;
  destination: PlaceResult;
  fastest: RouteOption;
  cleanest: RouteOption;
  identical: boolean;
  demo: boolean;
};

export type AqiBand = {
  key: "good" | "moderate" | "sensitive" | "unhealthy" | "severe";
  label: string;
  color: string;
  soft: string;
};

export function aqiBand(aqi: number): AqiBand {
  if (aqi <= 50)
    return { key: "good", label: "GOOD", color: "var(--aqi-good)", soft: "var(--aqi-good-soft)" };
  if (aqi <= 100)
    return {
      key: "moderate",
      label: "MODERATE",
      color: "var(--aqi-moderate)",
      soft: "var(--aqi-moderate-soft)",
    };
  if (aqi <= 150)
    return {
      key: "sensitive",
      label: "UNHEALTHY FOR SENSITIVE GROUPS",
      color: "var(--aqi-poor)",
      soft: "var(--aqi-poor-soft)",
    };
  if (aqi <= 200)
    return {
      key: "unhealthy",
      label: "UNHEALTHY",
      color: "var(--aqi-unhealthy)",
      soft: "var(--aqi-unhealthy-soft)",
    };
  return {
    key: "severe",
    label: "VERY UNHEALTHY",
    color: "var(--aqi-unhealthy)",
    soft: "var(--aqi-unhealthy-soft)",
  };
}

/** Decode a Google encoded polyline into lat/lng pairs. */
export function decodePolyline(encoded: string): { lat: number; lng: number }[] {
  const points: { lat: number; lng: number }[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    result = 0;
    shift = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return points;
}

export function formatCoords(lat: number, lng: number) {
  return `${lat.toFixed(5)}°, ${lng.toFixed(5)}°`;
}

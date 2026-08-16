// Browser-safe re-exports + display helpers for device UI components.
export * from "./types";
import { aqiBand } from "@/lib/autosense-types";

const HEX: Record<string, string> = {
  good: "#3fa66b",
  moderate: "#e7b84b",
  sensitive: "#e77b3c",
  unhealthy: "#d9534f",
  severe: "#d9534f",
};

export function aqiColorOf(aqi: number) {
  return HEX[aqiBand(aqi).key] ?? "#3fa66b";
}

export function aqiLabelOf(aqi: number) {
  return aqiBand(aqi).label;
}

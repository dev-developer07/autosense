// Frontend-facing device service. UI components use this module only — never
// the simulation. When real hardware feeds the backend, nothing here changes.
import {
  getAllDeviceLocationsFn,
  getDeviceLocationFn,
  getDeviceTrendFn,
  getLocationInsightsFn,
  getNetworkSnapshotFn,
} from "@/lib/devices.functions";
import type { NetworkSnapshot, TrendPoint } from "./types";

export const deviceService = {
  getNetworkSnapshot: (): Promise<NetworkSnapshot> => getNetworkSnapshotFn(),
  getDeviceTrend: (deviceId: string): Promise<TrendPoint[]> =>
    getDeviceTrendFn({ data: { deviceId } }),
  getDeviceLocation: (deviceId: string) => getDeviceLocationFn({ data: { deviceId } }),
  getAllDeviceLocations: () => getAllDeviceLocationsFn(),
};

export const aqiService = {
  /** 6-hour trend + nearby AutoSense sensors for a searched coordinate. */
  getLocationInsights: (lat: number, lng: number, aqi?: number) =>
    getLocationInsightsFn({ data: { lat, lng, ...(aqi !== undefined ? { aqi } : {}) } }),
};

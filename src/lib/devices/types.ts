// Browser-safe device/network types shared by the backend services and the UI.

export type DeviceStatus = "active" | "inactive" | "faulted";
export type DeviceHealth = "good" | "warning" | "fault";
export type ConnectionStatus = "online" | "offline";
export type VehicleStatus = "moving" | "stopped" | "none";

/** A single sensor reading as a physical AutoSense device would report it. */
export type DeviceReading = {
  deviceId: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  aqi: number;
  pm25: number;
  pm10: number;
  temperature: number;
  humidity: number;
  batteryPercentage: number;
  speed: number;
};

export type Device = {
  deviceId: string;
  deviceName: string;
  status: DeviceStatus;
  batteryPercentage: number;
  latitude: number;
  longitude: number;
  aqi: number;
  pm25: number;
  pm10: number;
  temperature: number;
  humidity: number;
  lastUpdated: string;
  isMoving: boolean;
  speed: number;
  vehicleId: string | null;
  vehicleStatus: VehicleStatus;
  locationName: string;
  deviceHealth: DeviceHealth;
  connectionStatus: ConnectionStatus;
  /** true while the device is served by the simulation service. */
  simulated: boolean;
};

export type TrendPoint = { time: string; aqi: number; pm25?: number };

export type NetworkStats = {
  total: number;
  active: number;
  inactive: number;
  faulted: number;
  moving: number;
  onVehicles: number;
  vehiclesStopped: number;
  lowBattery: number;
  healthy: number;
  warning: number;
  fault: number;
  averageAqi: number;
};

export type NetworkEvent = {
  id: string;
  deviceId: string;
  message: string;
  kind: "info" | "warning" | "fault" | "success";
  at: string;
};

export type NetworkSnapshot = {
  devices: Device[];
  stats: NetworkStats;
  events: NetworkEvent[];
  networkTrend: TrendPoint[];
  syncedAt: string;
  simulation: boolean;
};

export type NearbySensor = {
  deviceId: string;
  deviceName: string;
  distanceKm: number;
  aqi: number;
  pm25: number;
  batteryPercentage: number;
  latitude: number;
  longitude: number;
  lastUpdated: string;
  locationName: string;
  status: DeviceStatus;
  isMoving: boolean;
};

export function batteryTone(pct: number): "high" | "medium" | "low" | "critical" {
  if (pct >= 60) return "high";
  if (pct >= 35) return "medium";
  if (pct >= 15) return "low";
  return "critical";
}

export function relativeTime(iso: string, now = Date.now()) {
  const diff = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (diff < 60) return `${diff} sec ago`;
  if (diff < 3600) return `${Math.round(diff / 60)} min ago`;
  return `${Math.round(diff / 3600)} hr ago`;
}

export const STATUS_COLOR: Record<DeviceStatus, string> = {
  active: "#19a974",
  inactive: "#8b9794",
  faulted: "#d9534f",
};

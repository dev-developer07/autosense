// Device backend service.
//
// Architecture:  Device source (simulation today, real hardware later)
//                   -> deviceStore  -> server functions -> frontend
//
// Real AutoSense hardware will POST readings to /api/public/devices/ingest,
// which calls ingestReading(). Any device that has reported at least one real
// reading is served from the live store; every other device falls back to the
// simulation service. The frontend never touches the simulation directly.
import type {
  Device,
  DeviceReading,
  NearbySensor,
  NetworkEvent,
  NetworkSnapshot,
  NetworkStats,
  TrendPoint,
} from "./types";
import {
  deviceProfiles,
  simulatedHistory,
  simulatedLocationTrend,
  simulatedNetwork,
  simulatedNetworkTrend,
} from "./simulation.server";

/** Latest reading per device coming from real hardware. */
const liveLatest = new Map<string, DeviceReading>();
/** Rolling historical readings per device (capped, 6h+ window). */
const liveHistory = new Map<string, DeviceReading[]>();

const HISTORY_LIMIT = 720;

/* ------------------------------ ingestion API ----------------------------- */

export function ingestReading(reading: DeviceReading) {
  liveLatest.set(reading.deviceId, reading);
  const history = liveHistory.get(reading.deviceId) ?? [];
  history.push(reading);
  if (history.length > HISTORY_LIMIT) history.splice(0, history.length - HISTORY_LIMIT);
  liveHistory.set(reading.deviceId, history);
  return reading;
}

export function updateDeviceLocation(
  deviceId: string,
  latitude: number,
  longitude: number,
  extra: Partial<DeviceReading> = {},
) {
  const previous = liveLatest.get(deviceId);
  return ingestReading({
    deviceId,
    timestamp: new Date().toISOString(),
    latitude,
    longitude,
    aqi: extra.aqi ?? previous?.aqi ?? 0,
    pm25: extra.pm25 ?? previous?.pm25 ?? 0,
    pm10: extra.pm10 ?? previous?.pm10 ?? 0,
    temperature: extra.temperature ?? previous?.temperature ?? 0,
    humidity: extra.humidity ?? previous?.humidity ?? 0,
    batteryPercentage: extra.batteryPercentage ?? previous?.batteryPercentage ?? 100,
    speed: extra.speed ?? previous?.speed ?? 0,
  });
}

export function getDeviceLocation(deviceId: string) {
  const device = getDevice(deviceId);
  if (!device) return null;
  return { deviceId, latitude: device.latitude, longitude: device.longitude, at: device.lastUpdated };
}

export function getAllDeviceLocations() {
  return getAllDevices().map((d) => ({
    deviceId: d.deviceId,
    latitude: d.latitude,
    longitude: d.longitude,
    at: d.lastUpdated,
  }));
}

/* -------------------------------- read API -------------------------------- */

function mergeLive(device: Device): Device {
  const live = liveLatest.get(device.deviceId);
  if (!live) return device;
  return {
    ...device,
    latitude: live.latitude,
    longitude: live.longitude,
    aqi: live.aqi,
    pm25: live.pm25,
    pm10: live.pm10,
    temperature: live.temperature,
    humidity: live.humidity,
    batteryPercentage: live.batteryPercentage,
    speed: live.speed,
    isMoving: live.speed > 2,
    vehicleStatus: device.vehicleId ? (live.speed > 2 ? "moving" : "stopped") : "none",
    lastUpdated: live.timestamp,
    connectionStatus: "online",
    simulated: false,
  };
}

export function getAllDevices(at = Date.now()): Device[] {
  return simulatedNetwork(at).map(mergeLive);
}

export function getDevice(deviceId: string, at = Date.now()): Device | null {
  return getAllDevices(at).find((d) => d.deviceId === deviceId) ?? null;
}

export function getDeviceHistory(deviceId: string, at = Date.now()): DeviceReading[] {
  const live = liveHistory.get(deviceId);
  if (live && live.length > 3) {
    const cutoff = at - 6 * 3_600_000;
    return live.filter((r) => new Date(r.timestamp).getTime() >= cutoff);
  }
  return simulatedHistory(deviceId, at);
}

export function getDeviceTrend(deviceId: string, at = Date.now()): TrendPoint[] {
  return getDeviceHistory(deviceId, at).map((r) => ({
    time: r.timestamp,
    aqi: r.aqi,
    pm25: r.pm25,
  }));
}

export function getNetworkTrend(at = Date.now()): TrendPoint[] {
  return simulatedNetworkTrend(at);
}

export function getLocationTrend(lat: number, lng: number, currentAqi: number, at = Date.now()) {
  return simulatedLocationTrend(lat, lng, currentAqi, at);
}

/* --------------------------------- stats ---------------------------------- */

export function computeStats(devices: Device[]): NetworkStats {
  const active = devices.filter((d) => d.status === "active");
  const onVehicles = devices.filter((d) => d.vehicleId);
  return {
    total: devices.length,
    active: active.length,
    inactive: devices.filter((d) => d.status === "inactive").length,
    faulted: devices.filter((d) => d.status === "faulted").length,
    moving: devices.filter((d) => d.isMoving).length,
    onVehicles: onVehicles.length,
    vehiclesStopped: onVehicles.filter((d) => !d.isMoving).length,
    lowBattery: devices.filter((d) => d.batteryPercentage < 20).length,
    healthy: devices.filter((d) => d.deviceHealth === "good").length,
    warning: devices.filter((d) => d.deviceHealth === "warning").length,
    fault: devices.filter((d) => d.deviceHealth === "fault").length,
    averageAqi: Math.round(
      active.reduce((sum, d) => sum + d.aqi, 0) / Math.max(1, active.length),
    ),
  };
}

/* --------------------------------- events --------------------------------- */

export function recentEvents(devices: Device[], at = Date.now()): NetworkEvent[] {
  const events: NetworkEvent[] = [];
  const push = (device: Device, message: string, kind: NetworkEvent["kind"], ago: number) => {
    events.push({
      id: `${device.deviceId}-${kind}-${ago}`,
      deviceId: device.deviceId,
      message,
      kind,
      at: new Date(at - ago).toISOString(),
    });
  };

  const moving = devices.filter((d) => d.isMoving).slice(0, 3);
  moving.forEach((d, i) => push(d, `${d.deviceId} started moving in ${d.locationName}`, "info", 20_000 + i * 47_000));
  devices
    .filter((d) => d.batteryPercentage < 20)
    .slice(0, 3)
    .forEach((d, i) =>
      push(d, `${d.deviceId} battery below 20% (${d.batteryPercentage}%)`, "warning", 95_000 + i * 61_000),
    );
  devices
    .filter((d) => d.status === "faulted")
    .forEach((d, i) => push(d, `${d.deviceId} reported a sensor fault`, "fault", 150_000 + i * 73_000));
  devices
    .filter((d) => d.status === "active" && d.connectionStatus === "online")
    .slice(3, 6)
    .forEach((d, i) => push(d, `${d.deviceId} connection restored`, "success", 240_000 + i * 88_000));
  devices
    .filter((d) => d.isMoving)
    .slice(4, 7)
    .forEach((d, i) => push(d, `${d.deviceId} entered ${d.locationName}`, "info", 300_000 + i * 96_000));

  return events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 12);
}

export function getSnapshot(at = Date.now()): NetworkSnapshot {
  const devices = getAllDevices(at);
  return {
    devices,
    stats: computeStats(devices),
    events: recentEvents(devices, at),
    networkTrend: getNetworkTrend(at),
    syncedAt: new Date(at).toISOString(),
    simulation: devices.every((d) => d.simulated),
  };
}

/* ------------------------------ nearby sensors ----------------------------- */

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function getNearbySensors(
  lat: number,
  lng: number,
  radiusKm = 15,
  limit = 3,
  at = Date.now(),
): NearbySensor[] {
  return getAllDevices(at)
    .filter((d) => d.status === "active")
    .map((d) => ({
      deviceId: d.deviceId,
      deviceName: d.deviceName,
      distanceKm: Math.round(haversineKm(lat, lng, d.latitude, d.longitude) * 10) / 10,
      aqi: d.aqi,
      pm25: d.pm25,
      batteryPercentage: d.batteryPercentage,
      latitude: d.latitude,
      longitude: d.longitude,
      lastUpdated: d.lastUpdated,
      locationName: d.locationName,
      status: d.status,
      isMoving: d.isMoving,
    }))
    .filter((d) => d.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

export { deviceProfiles };

// Deterministic AutoSense device-network simulation.
//
// This module is the ONLY place that fabricates device data. It implements the
// same contract the real IoT ingestion path will implement, so replacing it
// with hardware-sourced readings is a drop-in swap (see store.server.ts).
import type {
  Device,
  DeviceHealth,
  DeviceReading,
  DeviceStatus,
  TrendPoint,
} from "./types";

const TOTAL = 50;
const ACTIVE = 42;
const INACTIVE = 5; // remaining 3 are faulted
const ON_VEHICLE = 35;
const MOVING = 27; // subset of active AND of on-vehicle devices

type Region = { name: string; lat: number; lng: number };

const REGIONS: Region[] = [
  { name: "Delhi", lat: 28.6448, lng: 77.2167 },
  { name: "Noida", lat: 28.5355, lng: 77.391 },
  { name: "Greater Noida", lat: 28.4744, lng: 77.504 },
  { name: "Ghaziabad", lat: 28.6692, lng: 77.4538 },
  { name: "Faridabad", lat: 28.4089, lng: 77.3178 },
  { name: "Gurugram", lat: 28.4595, lng: 77.0266 },
];

/** Deterministic hash -> [0,1) PRNG so every server instance agrees. */
function rand(seed: string, salt = 0) {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 15;
  return ((h >>> 0) % 100000) / 100000;
}

function deviceIndex(i: number) {
  return `AS-${String(i + 1).padStart(3, "0")}`;
}

type Profile = {
  index: number;
  deviceId: string;
  status: DeviceStatus;
  onVehicle: boolean;
  isMoving: boolean;
  region: Region;
  homeLat: number;
  homeLng: number;
  baseAqi: number;
  baseBattery: number;
  batteryDrain: number;
  baseTemp: number;
  baseHumidity: number;
  baseSpeed: number;
  heading: number;
};

let profileCache: Profile[] | null = null;

export function deviceProfiles(): Profile[] {
  if (profileCache) return profileCache;
  const profiles: Profile[] = [];
  for (let i = 0; i < TOTAL; i++) {
    const deviceId = deviceIndex(i);
    const status: DeviceStatus =
      i < ACTIVE ? "active" : i < ACTIVE + INACTIVE ? "inactive" : "faulted";
    const onVehicle = i < ON_VEHICLE;
    const isMoving = i < MOVING;
    const region = REGIONS[i % REGIONS.length]!;
    const lowBattery = i % 8 === 3; // ~6 devices below 20%
    profiles.push({
      index: i,
      deviceId,
      status,
      onVehicle,
      isMoving,
      region,
      homeLat: region.lat + (rand(deviceId, 1) - 0.5) * 0.14,
      homeLng: region.lng + (rand(deviceId, 2) - 0.5) * 0.14,
      baseAqi: 58 + Math.round(rand(deviceId, 3) * 120),
      baseBattery: lowBattery ? 8 + rand(deviceId, 4) * 11 : 34 + rand(deviceId, 4) * 62,
      batteryDrain: 0.4 + rand(deviceId, 5) * 1.4,
      baseTemp: 27 + rand(deviceId, 6) * 9,
      baseHumidity: 38 + rand(deviceId, 7) * 40,
      baseSpeed: 18 + rand(deviceId, 8) * 40,
      heading: rand(deviceId, 9) * Math.PI * 2,
    });
  }
  profileCache = profiles;
  return profiles;
}

function aqiAt(p: Profile, tMs: number) {
  const hours = tMs / 3_600_000;
  const daily = Math.sin((hours + p.index) / 3.4) * 18;
  const jitter = (rand(p.deviceId, Math.floor(tMs / 300_000)) - 0.5) * 10;
  return Math.max(18, Math.round(p.baseAqi + daily + jitter));
}

function positionAt(p: Profile, tMs: number) {
  if (!p.isMoving) return { lat: p.homeLat, lng: p.homeLng };
  // Smooth loop around the home point: gradual, never teleporting.
  const period = 2_400_000 + p.index * 9000; // ~40 min loop
  const angle = p.heading + (tMs % period) / period * Math.PI * 2;
  const radius = 0.02 + rand(p.deviceId, 11) * 0.03;
  return {
    lat: p.homeLat + Math.sin(angle) * radius,
    lng: p.homeLng + Math.cos(angle) * radius * 1.4,
  };
}

function speedAt(p: Profile, tMs: number) {
  if (!p.isMoving) return 0;
  const wobble = Math.sin(tMs / 120_000 + p.index) * 12;
  return Math.max(4, Math.round(p.baseSpeed + wobble));
}

function batteryAt(p: Profile, tMs: number) {
  const hours = (tMs % 86_400_000) / 3_600_000;
  const pct = p.baseBattery - hours * p.batteryDrain * 0.35;
  return Math.max(3, Math.min(100, Math.round(pct)));
}

function healthOf(p: Profile, battery: number): DeviceHealth {
  if (p.status === "faulted") return "fault";
  if (battery < 20 || p.status === "inactive") return "warning";
  return "good";
}

/** A simulated reading exactly as a physical device would POST it. */
export function simulatedReading(p: Profile, at = Date.now()): DeviceReading {
  const pos = positionAt(p, at);
  const aqi = aqiAt(p, at);
  const battery = batteryAt(p, at);
  return {
    deviceId: p.deviceId,
    timestamp: new Date(at).toISOString(),
    latitude: Number(pos.lat.toFixed(5)),
    longitude: Number(pos.lng.toFixed(5)),
    aqi,
    pm25: Math.round(aqi * 0.48 + rand(p.deviceId, 21) * 6),
    pm10: Math.round(aqi * 0.79 + rand(p.deviceId, 22) * 10),
    temperature: Math.round(p.baseTemp + Math.sin(at / 7_200_000 + p.index) * 3),
    humidity: Math.round(p.baseHumidity + Math.cos(at / 9_000_000 + p.index) * 6),
    batteryPercentage: battery,
    speed: speedAt(p, at),
  };
}

export function simulatedDevice(p: Profile, at = Date.now()): Device {
  const r = simulatedReading(p, at);
  const offline = p.status !== "active";
  return {
    deviceId: p.deviceId,
    deviceName: `AutoSense Node ${p.deviceId.slice(3)}`,
    status: p.status,
    batteryPercentage: r.batteryPercentage,
    latitude: r.latitude,
    longitude: r.longitude,
    aqi: r.aqi,
    pm25: r.pm25,
    pm10: r.pm10,
    temperature: r.temperature,
    humidity: r.humidity,
    lastUpdated: offline
      ? new Date(at - (600_000 + p.index * 9_000)).toISOString()
      : new Date(at - Math.floor(rand(p.deviceId, Math.floor(at / 10_000)) * 45_000)).toISOString(),
    isMoving: p.isMoving,
    speed: r.speed,
    vehicleId: p.onVehicle ? `VH-${p.deviceId.slice(3)}` : null,
    vehicleStatus: p.onVehicle ? (p.isMoving ? "moving" : "stopped") : "none",
    locationName: p.region.name,
    deviceHealth: healthOf(p, r.batteryPercentage),
    connectionStatus: p.status === "active" ? "online" : "offline",
    simulated: true,
  };
}

export function simulatedNetwork(at = Date.now()): Device[] {
  return deviceProfiles().map((p) => simulatedDevice(p, at));
}

/** 6 hours of history at 30-minute resolution. */
export function simulatedHistory(deviceId: string, at = Date.now()): DeviceReading[] {
  const p = deviceProfiles().find((d) => d.deviceId === deviceId);
  if (!p) return [];
  const out: DeviceReading[] = [];
  for (let i = 12; i >= 0; i--) {
    out.push(simulatedReading(p, at - i * 30 * 60_000));
  }
  return out;
}

/** Average AQI across active devices for the past 6 hours. */
export function simulatedNetworkTrend(at = Date.now()): TrendPoint[] {
  const active = deviceProfiles().filter((p) => p.status === "active");
  const points: TrendPoint[] = [];
  for (let i = 12; i >= 0; i--) {
    const t = at - i * 30 * 60_000;
    const avg = active.reduce((sum, p) => sum + aqiAt(p, t), 0) / active.length;
    points.push({ time: new Date(t).toISOString(), aqi: Math.round(avg) });
  }
  return points;
}

/**
 * Demo 6-hour trend for an arbitrary coordinate (used by the public site when
 * no physical sensor covers the searched location).
 */
export function simulatedLocationTrend(
  lat: number,
  lng: number,
  currentAqi: number,
  at = Date.now(),
): TrendPoint[] {
  const seed = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const points: TrendPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const t = at - i * 60 * 60_000;
    const drift = Math.sin((t / 3_600_000 + lat) / 2.6) * 12;
    const jitter = (rand(seed, i + 1) - 0.5) * 12;
    const value = i === 0 ? currentAqi : Math.max(15, Math.round(currentAqi + drift + jitter));
    points.push({
      time: new Date(t).toISOString(),
      aqi: value,
      pm25: Math.round(value * 0.48),
    });
  }
  return points;
}

export const SIMULATION_META = { total: TOTAL, active: ACTIVE, onVehicle: ON_VEHICLE, moving: MOVING };

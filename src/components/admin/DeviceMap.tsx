import { useMemo } from "react";
import { MapPanel } from "@/components/autosense/MapPanel";
import type { MapMarker } from "@/components/autosense/MapCanvas";
import { relativeTime, STATUS_COLOR, type Device } from "@/lib/devices/types";

function popupHtml(device: Device) {
  const color = STATUS_COLOR[device.status];
  const row = (label: string, value: string) =>
    `<div style="display:flex;justify-content:space-between;gap:16px;font-size:12px;padding:2px 0">
       <span style="color:#65716e">${label}</span><span style="color:#101817;font-weight:600">${value}</span>
     </div>`;
  return `<div style="font-family:Inter,sans-serif;min-width:210px;padding:2px 4px">
    <div style="display:flex;align-items:center;gap:8px">
      <span style="width:8px;height:8px;border-radius:99px;background:${color};display:inline-block"></span>
      <strong style="font-size:14px;color:#101817">${device.deviceId}</strong>
      <span style="font-size:10px;letter-spacing:.12em;color:${color};font-weight:700">${device.status.toUpperCase()}</span>
    </div>
    <div style="margin-top:6px;border-top:1px solid #dce3e0;padding-top:6px">
      ${row("AQI", String(device.aqi))}
      ${row("PM2.5", `${device.pm25} µg/m³`)}
      ${row("Battery", `${device.batteryPercentage}%`)}
      ${row("Location", device.locationName)}
      ${row("Vehicle", device.vehicleId ?? "—")}
      ${row("Movement", device.isMoving ? "MOVING" : "STOPPED")}
      ${row("Speed", `${device.speed} km/h`)}
      ${row("Updated", relativeTime(device.lastUpdated))}
    </div>
  </div>`;
}

export function DeviceMap({
  devices,
  className = "",
  center,
  zoom = 10,
}: {
  devices: Device[];
  className?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
}) {
  const markers = useMemo<MapMarker[]>(
    () =>
      devices.map((d) => ({
        lat: d.latitude,
        lng: d.longitude,
        kind: "device" as const,
        color: STATUS_COLOR[d.status],
        pulse: d.isMoving && d.status === "active",
        title: d.deviceId,
        html: popupHtml(d),
      })),
    [devices],
  );

  const mapCenter = useMemo(() => center ?? { lat: 28.58, lng: 77.3 }, [center]);

  return (
    <div className={className}>
      <MapPanel markers={markers} routes={[]} center={mapCenter} zoom={zoom} className="h-full w-full" />
    </div>
  );
}

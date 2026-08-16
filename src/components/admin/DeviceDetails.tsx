import { X } from "lucide-react";
import { AQITrendChart } from "./AQITrendChart";
import { BatteryIndicator } from "./BatteryIndicator";
import { ConnectionBadge, DeviceStatusBadge, HealthBadge, MovementBadge } from "./DeviceStatusBadge";
import { useDeviceTrend } from "@/hooks/useNetworkSnapshot";
import { relativeTime, aqiColorOf, type Device } from "@/lib/devices/ui";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-admin-border/60 py-2 text-[13px] last:border-0">
      <span className="text-admin-muted">{label}</span>
      <span className="font-medium text-admin-fg">{children}</span>
    </div>
  );
}

export function DeviceDetails({ device, onClose }: { device: Device; onClose: () => void }) {
  const { data: trend } = useDeviceTrend(device.deviceId);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}>
      <aside
        className="animate-rise h-full w-full max-w-[440px] overflow-y-auto border-l border-admin-border bg-admin-bg p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-[24px] font-bold text-admin-fg">{device.deviceId}</h2>
            <p className="text-[13px] text-admin-muted">{device.deviceName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close device details"
            className="rounded-[6px] border border-admin-border p-2 text-admin-muted hover:text-admin-fg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <DeviceStatusBadge status={device.status} />
          <HealthBadge health={device.deviceHealth} />
          <ConnectionBadge connection={device.connectionStatus} />
          <BatteryIndicator percentage={device.batteryPercentage} />
        </div>

        <div className="mt-4 flex items-end gap-4 rounded-[8px] border border-admin-border bg-admin-surface p-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-admin-muted">Current AQI</div>
            <div
              className="font-display text-[48px] font-bold leading-none"
              style={{ color: aqiColorOf(device.aqi) }}
            >
              {device.aqi}
            </div>
          </div>
          <div className="mb-1 grid flex-1 grid-cols-2 gap-x-4 gap-y-1 text-[12px] text-admin-muted">
            <span>PM2.5 <b className="text-admin-fg">{device.pm25}</b></span>
            <span>PM10 <b className="text-admin-fg">{device.pm10}</b></span>
            <span>Temp <b className="text-admin-fg">{device.temperature}°C</b></span>
            <span>Humidity <b className="text-admin-fg">{device.humidity}%</b></span>
          </div>
        </div>

        <div className="mt-4 rounded-[8px] border border-admin-border bg-admin-surface p-4">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-admin-muted">
            AQI history — last 6 hours
          </h3>
          <AQITrendChart data={trend ?? []} variant="dark" height={170} color={aqiColorOf(device.aqi)} />
        </div>

        <div className="mt-4 rounded-[8px] border border-admin-border bg-admin-surface px-4">
          <Row label="GPS coordinates">
            {device.latitude.toFixed(5)}°, {device.longitude.toFixed(5)}°
          </Row>
          <Row label="Location">{device.locationName}</Row>
          <Row label="Vehicle">{device.vehicleId ?? "—"}</Row>
          <Row label="Movement">
            <MovementBadge isMoving={device.isMoving} vehicleStatus={device.vehicleStatus} />
          </Row>
          <Row label="Speed">{device.speed} km/h</Row>
          <Row label="Last update">{relativeTime(device.lastUpdated)}</Row>
          <Row label="Data source">{device.simulated ? "Simulation" : "Live device"}</Row>
        </div>
      </aside>
    </div>
  );
}

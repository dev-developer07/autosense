import { relativeTime, aqiColorOf, type Device } from "@/lib/devices/ui";
import { BatteryIndicator } from "./BatteryIndicator";
import { DeviceStatusBadge, HealthBadge, MovementBadge } from "./DeviceStatusBadge";

const COLUMNS = [
  "Device ID",
  "Status",
  "AQI",
  "Battery",
  "Location",
  "Vehicle",
  "Movement",
  "Speed",
  "Health",
  "Last updated",
];

export function DeviceTable({
  devices,
  onSelect,
}: {
  devices: Device[];
  onSelect: (device: Device) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-[8px] border border-admin-border bg-admin-surface">
      <table className="w-full min-w-[900px] border-collapse text-left">
        <thead>
          <tr className="border-b border-admin-border">
            {COLUMNS.map((c) => (
              <th
                key={c}
                className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-admin-muted"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {devices.map((d) => (
            <tr
              key={d.deviceId}
              onClick={() => onSelect(d)}
              className="cursor-pointer border-b border-admin-border/60 transition-colors last:border-0 hover:bg-admin-surface-2"
            >
              <td className="px-4 py-3 text-[13px] font-semibold text-admin-fg">{d.deviceId}</td>
              <td className="px-4 py-3">
                <DeviceStatusBadge status={d.status} />
              </td>
              <td className="px-4 py-3 text-[14px] font-semibold tabular-nums" style={{ color: aqiColorOf(d.aqi) }}>
                {d.aqi}
              </td>
              <td className="px-4 py-3">
                <BatteryIndicator percentage={d.batteryPercentage} />
              </td>
              <td className="px-4 py-3 text-[13px] text-admin-fg">{d.locationName}</td>
              <td className="px-4 py-3 text-[13px] text-admin-muted">{d.vehicleId ?? "—"}</td>
              <td className="px-4 py-3">
                <MovementBadge isMoving={d.isMoving} vehicleStatus={d.vehicleStatus} />
              </td>
              <td className="px-4 py-3 text-[13px] tabular-nums text-admin-fg">{d.speed} km/h</td>
              <td className="px-4 py-3">
                <HealthBadge health={d.deviceHealth} />
              </td>
              <td className="px-4 py-3 text-[13px] text-admin-muted">{relativeTime(d.lastUpdated)}</td>
            </tr>
          ))}
          {devices.length === 0 && (
            <tr>
              <td colSpan={COLUMNS.length} className="px-4 py-10 text-center text-[13px] text-admin-muted">
                No devices match the current filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

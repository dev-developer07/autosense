import { useState } from "react";
import { AQITrendChart } from "./AQITrendChart";
import { useDeviceTrend } from "@/hooks/useNetworkSnapshot";
import type { Device, TrendPoint } from "@/lib/devices/ui";

export function NetworkAQIChart({
  trend,
  devices,
}: {
  trend: TrendPoint[];
  devices: Device[];
}) {
  const [deviceId, setDeviceId] = useState<string>("network");
  const { data: deviceTrend } = useDeviceTrend(deviceId === "network" ? null : deviceId);
  const data = deviceId === "network" ? trend : (deviceTrend ?? []);
  const average = data.length ? Math.round(data.reduce((s, p) => s + p.aqi, 0) / data.length) : 0;

  return (
    <div className="rounded-[8px] border border-admin-border bg-admin-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-[18px] font-bold text-admin-fg">Network AQI trends</h3>
          <p className="text-[12px] text-admin-muted">
            {deviceId === "network" ? "Average across active devices" : `Device ${deviceId}`} · last 6 hours
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-admin-muted">Average</div>
            <div className="font-display text-[24px] font-bold leading-none text-admin-fg tabular-nums">{average}</div>
          </div>
          <select
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            aria-label="Select device for AQI trend"
            className="h-9 rounded-[6px] border border-admin-border bg-admin-surface-2 px-2 text-[13px] text-admin-fg outline-none focus:border-primary"
          >
            <option value="network">Whole network</option>
            {devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.deviceId}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-3">
        <AQITrendChart data={data} variant="dark" height={200} color="var(--teal)" />
      </div>
      <p className="mt-1 text-[11px] text-admin-muted">Simulation data — pending sensor hardware integration.</p>
    </div>
  );
}

import type { NetworkStats } from "@/lib/devices/ui";
import type { DeviceFilter } from "./DeviceFilters";

export function DeviceHealthPanel({
  stats,
  onSelect,
}: {
  stats: NetworkStats;
  onSelect?: (filter: DeviceFilter) => void;
}) {
  const rows: { label: string; value: number; color: string; filter: DeviceFilter }[] = [
    { label: "Healthy", value: stats.healthy, color: "var(--aqi-good)", filter: "healthy" },
    { label: "Warning", value: stats.warning, color: "var(--aqi-moderate)", filter: "warning" },
    { label: "Faulted", value: stats.fault, color: "var(--aqi-unhealthy)", filter: "fault" },
  ];
  const total = Math.max(1, stats.total);

  return (
    <div className="rounded-[8px] border border-admin-border bg-admin-surface p-4">
      <h3 className="font-display text-[18px] font-bold text-admin-fg">Device health</h3>
      <div className="mt-3 space-y-3">
        {rows.map((r) => (
          <button
            key={r.label}
            type="button"
            onClick={() => onSelect?.(r.filter)}
            className="w-full text-left"
          >
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-admin-fg">{r.label}</span>
              <span className="font-semibold tabular-nums" style={{ color: r.color }}>
                {r.value}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-admin-surface-2">
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{ width: `${(r.value / total) * 100}%`, backgroundColor: r.color }}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

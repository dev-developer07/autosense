import type { NetworkStats } from "@/lib/devices/types";

type Card = {
  key: string;
  label: string;
  value: number;
  accent?: string;
  hint?: string;
  filter?: string;
};

export function DeviceStats({
  stats,
  onSelect,
  activeFilter,
}: {
  stats: NetworkStats;
  onSelect?: (filter: string) => void;
  activeFilter?: string;
}) {
  const cards: Card[] = [
    { key: "total", label: "Total devices", value: stats.total, filter: "all" },
    { key: "active", label: "Active devices", value: stats.active, accent: "var(--aqi-good)", filter: "active" },
    { key: "inactive", label: "Inactive devices", value: stats.inactive, accent: "var(--admin-muted)", filter: "inactive" },
    { key: "faulted", label: "Damaged / faulted", value: stats.faulted, accent: "var(--aqi-unhealthy)", filter: "faulted" },
    { key: "moving", label: "Moving devices", value: stats.moving, accent: "var(--teal)", filter: "moving" },
    { key: "onVehicles", label: "Devices on vehicles", value: stats.onVehicles, filter: "vehicles" },
    { key: "stopped", label: "Vehicles stopped", value: stats.vehiclesStopped, filter: "stopped" },
    {
      key: "lowBattery",
      label: "Low battery devices",
      value: stats.lowBattery,
      accent: "var(--aqi-poor)",
      hint: "below 20%",
      filter: "lowBattery",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {cards.map((card) => {
        const selected = activeFilter && card.filter === activeFilter;
        return (
          <button
            key={card.key}
            type="button"
            onClick={() => card.filter && onSelect?.(card.filter)}
            className={`animate-rise rounded-[8px] border bg-admin-surface p-4 text-left transition-colors hover:bg-admin-surface-2 ${
              selected ? "border-primary" : "border-admin-border"
            }`}
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-admin-muted">
              {card.label}
            </div>
            <div
              className="mt-2 font-display text-[32px] font-bold leading-none tabular-nums"
              style={{ color: card.accent ?? "var(--admin-fg)" }}
            >
              {card.value}
            </div>
            <div className="mt-1 text-[11px] text-admin-muted">{card.hint ?? "\u00A0"}</div>
          </button>
        );
      })}
    </div>
  );
}

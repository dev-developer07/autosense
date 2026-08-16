import { Search } from "lucide-react";

export type DeviceFilter =
  | "all"
  | "active"
  | "inactive"
  | "faulted"
  | "moving"
  | "stopped"
  | "vehicles"
  | "lowBattery"
  | "healthy"
  | "warning"
  | "fault";

export type DeviceSort = "deviceId" | "battery" | "aqi" | "lastUpdated";

const FILTERS: { key: DeviceFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
  { key: "faulted", label: "Faulted" },
  { key: "moving", label: "Moving" },
  { key: "stopped", label: "Stopped" },
  { key: "lowBattery", label: "Low battery" },
];

export function DeviceSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="relative flex h-9 min-w-[200px] flex-1 items-center">
      <Search className="pointer-events-none absolute left-3 h-4 w-4 text-admin-muted" strokeWidth={1.8} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search devices, vehicles, locations…"
        aria-label="Search devices"
        className="h-full w-full rounded-[6px] border border-admin-border bg-admin-surface-2 pl-9 pr-3 text-[14px] text-admin-fg outline-none placeholder:text-admin-muted focus:border-primary"
      />
    </label>
  );
}

export function DeviceFilters({
  filter,
  onFilter,
  sort,
  onSort,
}: {
  filter: DeviceFilter;
  onFilter: (f: DeviceFilter) => void;
  sort: DeviceSort;
  onSort: (s: DeviceSort) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          type="button"
          onClick={() => onFilter(f.key)}
          className={`h-9 rounded-[6px] border px-3 text-[13px] font-medium transition-colors ${
            filter === f.key
              ? "border-primary bg-primary/15 text-admin-fg"
              : "border-admin-border bg-admin-surface-2 text-admin-muted hover:text-admin-fg"
          }`}
        >
          {f.label}
        </button>
      ))}
      <select
        value={sort}
        onChange={(e) => onSort(e.target.value as DeviceSort)}
        aria-label="Sort devices"
        className="ml-auto h-9 rounded-[6px] border border-admin-border bg-admin-surface-2 px-2 text-[13px] text-admin-fg outline-none focus:border-primary"
      >
        <option value="deviceId">Sort: Device ID</option>
        <option value="battery">Sort: Battery</option>
        <option value="aqi">Sort: AQI</option>
        <option value="lastUpdated">Sort: Last updated</option>
      </select>
    </div>
  );
}

export function applyDeviceFilter<
  T extends {
    deviceId: string;
    status: string;
    isMoving: boolean;
    vehicleId: string | null;
    batteryPercentage: number;
    deviceHealth: string;
    locationName: string;
  },
>(devices: T[], filter: DeviceFilter, query: string) {
  const q = query.trim().toLowerCase();
  return devices.filter((d) => {
    const matchQuery =
      !q ||
      d.deviceId.toLowerCase().includes(q) ||
      d.locationName.toLowerCase().includes(q) ||
      (d.vehicleId ?? "").toLowerCase().includes(q);
    if (!matchQuery) return false;
    switch (filter) {
      case "active":
      case "inactive":
      case "faulted":
        return d.status === filter;
      case "moving":
        return d.isMoving;
      case "stopped":
        return !!d.vehicleId && !d.isMoving;
      case "vehicles":
        return !!d.vehicleId;
      case "lowBattery":
        return d.batteryPercentage < 20;
      case "healthy":
        return d.deviceHealth === "good";
      case "warning":
        return d.deviceHealth === "warning";
      case "fault":
        return d.deviceHealth === "fault";
      default:
        return true;
    }
  });
}

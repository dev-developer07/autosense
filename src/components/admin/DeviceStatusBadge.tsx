import type { ConnectionStatus, DeviceHealth, DeviceStatus, VehicleStatus } from "@/lib/devices/types";

const STATUS_STYLE: Record<DeviceStatus, { label: string; color: string; soft: string }> = {
  active: { label: "ACTIVE", color: "var(--aqi-good)", soft: "rgba(63,166,107,0.14)" },
  inactive: { label: "INACTIVE", color: "var(--admin-muted)", soft: "rgba(142,163,157,0.14)" },
  faulted: { label: "FAULTED", color: "var(--aqi-unhealthy)", soft: "rgba(217,83,79,0.16)" },
};

const HEALTH_STYLE: Record<DeviceHealth, { label: string; color: string }> = {
  good: { label: "GOOD", color: "var(--aqi-good)" },
  warning: { label: "WARNING", color: "var(--aqi-moderate)" },
  fault: { label: "FAULT", color: "var(--aqi-unhealthy)" },
};

export function DeviceStatusBadge({ status }: { status: DeviceStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-[4px] px-2 py-1 text-[10px] font-semibold tracking-[0.12em]"
      style={{ color: s.color, backgroundColor: s.soft }}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${status === "active" ? "pulse-dot" : ""}`}
        style={{ backgroundColor: s.color, color: s.color }}
      />
      {s.label}
    </span>
  );
}

export function HealthBadge({ health }: { health: DeviceHealth }) {
  const h = HEALTH_STYLE[health];
  return (
    <span className="text-[11px] font-semibold tracking-[0.1em]" style={{ color: h.color }}>
      {h.label}
    </span>
  );
}

export function ConnectionBadge({ connection }: { connection: ConnectionStatus }) {
  return (
    <span
      className="text-[11px] font-semibold tracking-[0.1em]"
      style={{ color: connection === "online" ? "var(--teal)" : "var(--admin-muted)" }}
    >
      {connection.toUpperCase()}
    </span>
  );
}

export function MovementBadge({
  isMoving,
  vehicleStatus,
}: {
  isMoving: boolean;
  vehicleStatus?: VehicleStatus;
}) {
  const label = isMoving ? "MOVING" : vehicleStatus === "stopped" ? "STOPPED" : "STATIC";
  return (
    <span
      className="text-[11px] font-semibold tracking-[0.1em]"
      style={{ color: isMoving ? "var(--primary)" : "var(--admin-muted)" }}
    >
      {label}
    </span>
  );
}

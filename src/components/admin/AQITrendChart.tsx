import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendPoint } from "@/lib/devices/types";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/**
 * Reusable 6-hour AQI trend chart. Used on the public site (light surface) and
 * inside the admin command center (dark surface).
 */
export function AQITrendChart({
  data,
  variant = "light",
  height = 180,
  color = "var(--primary)",
}: {
  data: TrendPoint[];
  variant?: "light" | "dark";
  height?: number;
  color?: string;
}) {
  const axis = variant === "dark" ? "var(--admin-muted)" : "var(--muted-foreground)";
  const grid = variant === "dark" ? "var(--admin-border)" : "var(--border)";
  const surface = variant === "dark" ? "var(--admin-surface-2)" : "var(--card)";
  const text = variant === "dark" ? "var(--admin-fg)" : "var(--foreground)";
  const points = data.map((p) => ({ ...p, label: formatTime(p.time) }));

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id={`aqi-fill-${variant}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: axis }}
            tickLine={false}
            axisLine={{ stroke: grid }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: axis }}
            tickLine={false}
            axisLine={false}
            width={44}
            domain={["dataMin - 12", "dataMax + 12"]}
          />
          <Tooltip
            contentStyle={{
              background: surface,
              border: `1px solid ${grid}`,
              borderRadius: 6,
              fontSize: 12,
              color: text,
            }}
            labelStyle={{ color: axis, fontSize: 11 }}
            formatter={(value: number) => [`${value}`, "AQI"]}
          />
          <Area
            type="monotone"
            dataKey="aqi"
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#aqi-fill-${variant})`}
            dot={{ r: 2.5, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 4 }}
            isAnimationActive
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

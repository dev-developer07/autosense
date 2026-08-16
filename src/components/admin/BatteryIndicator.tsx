import { batteryTone } from "@/lib/devices/types";

const TONE_COLOR: Record<ReturnType<typeof batteryTone>, string> = {
  high: "var(--aqi-good)",
  medium: "var(--aqi-moderate)",
  low: "var(--aqi-poor)",
  critical: "var(--aqi-unhealthy)",
};

export function BatteryIndicator({
  percentage,
  showLabel = true,
  className = "",
}: {
  percentage: number;
  showLabel?: boolean;
  className?: string;
}) {
  const color = TONE_COLOR[batteryTone(percentage)];
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className="relative inline-flex h-[13px] w-[26px] items-center rounded-[3px] border p-[2px]"
        style={{ borderColor: color }}
        aria-hidden
      >
        <span
          className="block h-full rounded-[1px] transition-[width] duration-500"
          style={{ width: `${Math.max(4, percentage)}%`, backgroundColor: color }}
        />
        <span
          className="absolute -right-[3px] top-1/2 h-[5px] w-[2px] -translate-y-1/2 rounded-r-[1px]"
          style={{ backgroundColor: color }}
        />
      </span>
      {showLabel && (
        <span className="text-[13px] font-medium tabular-nums" style={{ color }}>
          {percentage}%
        </span>
      )}
    </span>
  );
}

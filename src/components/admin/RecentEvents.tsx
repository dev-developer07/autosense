import { relativeTime, type NetworkEvent } from "@/lib/devices/ui";

const KIND_COLOR: Record<NetworkEvent["kind"], string> = {
  info: "var(--teal)",
  warning: "var(--aqi-moderate)",
  fault: "var(--aqi-unhealthy)",
  success: "var(--aqi-good)",
};

export function RecentEvents({ events }: { events: NetworkEvent[] }) {
  return (
    <div className="rounded-[8px] border border-admin-border bg-admin-surface p-4">
      <h3 className="font-display text-[18px] font-bold text-admin-fg">Recent device events</h3>
      <ul className="mt-3 space-y-2">
        {events.map((e) => (
          <li key={e.id} className="flex items-start gap-3 border-b border-admin-border/60 pb-2 last:border-0">
            <span
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: KIND_COLOR[e.kind] }}
            />
            <span className="flex-1 text-[13px] text-admin-fg">{e.message}</span>
            <span className="shrink-0 text-[11px] text-admin-muted">{relativeTime(e.at)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

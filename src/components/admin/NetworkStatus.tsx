export function NetworkStatus({ simulation, label }: { simulation: boolean; label?: string }) {
  const color = simulation ? "var(--teal)" : "var(--primary)";
  return (
    <span className="inline-flex items-center gap-2 rounded-[5px] border border-admin-border bg-admin-surface-2 px-2.5 py-1.5">
      <span
        className="h-2 w-2 rounded-full pulse-dot"
        style={{ backgroundColor: color, color }}
        aria-hidden
      />
      <span className="text-[11px] font-semibold tracking-[0.14em] text-admin-fg">
        {label ?? (simulation ? "SIMULATION ACTIVE" : "LIVE DEVICE NETWORK")}
      </span>
    </span>
  );
}

export function DemoNetworkNote({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[12px] text-admin-muted ${className}`}>
      Demo Network — sensor hardware integration pending. All 50 devices report simulated readings.
    </p>
  );
}

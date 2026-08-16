import { AlertCircle, Clock, RefreshCw } from "lucide-react";
import { aqiBand, formatCoords, type AqiResult, type PlaceResult } from "@/lib/autosense-types";

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-border py-3">
      <div className="label-caps">{label}</div>
      <div className="mt-1 font-display text-[20px] font-semibold text-foreground">{value}</div>
    </div>
  );
}

export function AqiSkeleton({ message }: { message: string }) {
  return (
    <div className="animate-pulse p-5">
      <div className="h-3 w-32 rounded bg-muted" />
      <div className="mt-4 h-14 w-28 rounded bg-muted" />
      <div className="mt-6 grid grid-cols-2 gap-x-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="border-t border-border py-3">
            <div className="h-2.5 w-16 rounded bg-muted" />
            <div className="mt-2 h-5 w-20 rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="mt-4 text-[13px] text-muted-foreground">{message}</div>
    </div>
  );
}

export function AqiEmpty({ message }: { message: string }) {
  return (
    <div className="flex h-full min-h-[240px] flex-col items-center justify-center px-6 py-10 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-[6px] border border-border">
        <AlertCircle className="h-5 w-5 text-muted-foreground" strokeWidth={1.6} />
      </div>
      <p className="mt-3 max-w-[260px] text-[14px] text-muted-foreground">{message}</p>
    </div>
  );
}

export function AqiError({ message, onRetry }: { message: string; onRetry?: (() => void) | undefined }) {
  return (
    <div className="flex h-full min-h-[240px] flex-col items-center justify-center px-6 py-10 text-center">
      <p className="max-w-[300px] text-[14px] text-foreground">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 rounded-[6px] border border-border px-3 py-2 text-[14px] font-medium text-foreground transition-colors hover:bg-muted"
        >
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
      )}
    </div>
  );
}

export function AqiPanel({ place, data }: { place: PlaceResult; data: AqiResult }) {
  const band = aqiBand(data.aqi);
  return (
    <div className="animate-rise p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-[22px] font-bold text-foreground">
            {place.name}
          </h3>
          <p className="mt-0.5 line-clamp-2 text-[14px] text-muted-foreground">{place.address}</p>
        </div>
        {data.demo && (
          <span className="shrink-0 rounded-[4px] border border-border px-2 py-1 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground">
            DEMO DATA
          </span>
        )}
      </div>

      <div className="mt-5 flex items-end gap-4">
        <div>
          <div className="label-caps">AQI</div>
          <div
            className="font-display text-[64px] font-bold leading-[0.9]"
            style={{ color: band.color }}
          >
            {data.aqi}
          </div>
        </div>
        <div
          className="mb-2 rounded-[4px] px-2.5 py-1 text-[12px] font-semibold tracking-[0.1em]"
          style={{ backgroundColor: band.soft, color: band.color }}
        >
          {band.label}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-6">
        <Metric label="PM2.5" value={data.pm25 != null ? `${data.pm25.toFixed(1)} µg/m³` : "—"} />
        <Metric label="PM10" value={data.pm10 != null ? `${data.pm10.toFixed(1)} µg/m³` : "—"} />
        <Metric
          label="Temperature"
          value={data.temperature != null ? `${Math.round(data.temperature)}°C` : "—"}
        />
        <Metric
          label="Humidity"
          value={data.humidity != null ? `${Math.round(data.humidity)}%` : "—"}
        />
      </div>

      <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-[13px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" strokeWidth={1.8} />
          Last updated {new Date(data.updatedAt).toLocaleString()}
        </div>
        <div>Coordinates {formatCoords(data.lat, data.lng)}</div>
        <div>Standard: {data.standard}</div>
      </div>
    </div>
  );
}

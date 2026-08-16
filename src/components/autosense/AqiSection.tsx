import { useCallback, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Crosshair } from "lucide-react";
import { PlaceSearchInput } from "./PlaceSearchInput";
import { MapPanel } from "./MapPanel";
import { AqiEmpty, AqiError, AqiPanel, AqiSkeleton } from "./AqiPanel";
import { getAqiFn, reverseGeocodeFn } from "@/lib/autosense.functions";
import type { AqiResult, PlaceResult } from "@/lib/autosense-types";
import type { MapMarker } from "./MapCanvas";

export function AqiSection() {
  const getAqi = useServerFn(getAqiFn);
  const reverseGeocode = useServerFn(reverseGeocodeFn);

  const [query, setQuery] = useState("");
  const [place, setPlace] = useState<PlaceResult | null>(null);
  const [aqi, setAqi] = useState<AqiResult | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">("idle");
  const [error, setError] = useState("");

  const load = useCallback(
    async (target: PlaceResult) => {
      setPlace(target);
      setAqi(null);
      setStatus("loading");
      setError("");
      try {
        const result = await getAqi({ data: { lat: target.lat, lng: target.lng } });
        setAqi(result);
        setStatus("done");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Air-quality data isn't available for this location right now.",
        );
        setStatus("error");
      }
    },
    [getAqi],
  );

  const useMyLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const resolved = await reverseGeocode({
            data: { lat: position.coords.latitude, lng: position.coords.longitude },
          });
          setQuery(resolved.name);
          await load(resolved);
        } catch {
          setError("We couldn't resolve your current location.");
          setStatus("error");
        }
      },
      () => {
        setError("Location permission was denied.");
        setStatus("error");
      },
    );
  };

  const markers: MapMarker[] =
    place && aqi
      ? [
          {
            lat: place.lat,
            lng: place.lng,
            kind: "aqi",
            aqi: aqi.aqi,
            title: `AQI ${aqi.aqi} · ${aqi.category}`,
            detail: `PM2.5: ${aqi.pm25 != null ? `${aqi.pm25.toFixed(1)} µg/m³` : "—"}`,
          },
        ]
      : place
        ? [{ lat: place.lat, lng: place.lng, kind: "place", title: place.name }]
        : [];

  return (
    <section id="aqi-map" className="border-t border-border bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
        <div className="max-w-2xl">
          <span className="label-caps">Air quality lookup</span>
          <h2 className="mt-3 font-display text-[34px] font-bold leading-[1.05] tracking-tight text-foreground sm:text-[44px] lg:text-[52px]">
            Check the air before you choose the road.
          </h2>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
              <PlaceSearchInput
                value={query}
                onValueChange={setQuery}
                onSelect={load}
                placeholder="Search a location..."
                ariaLabel="Search a location to check its air quality"
              />
              <button
                type="button"
                onClick={useMyLocation}
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-[6px] border border-border bg-card px-4 text-[15px] font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Crosshair className="h-4 w-4" strokeWidth={1.8} /> Use my location
              </button>
            </div>

            <div className="min-h-[300px] rounded-[10px] border border-border bg-card">
              {status === "idle" && <AqiEmpty message="Search a location to check its air quality." />}
              {status === "loading" && (
                <AqiSkeleton message={place ? "Fetching air-quality data…" : "Finding location…"} />
              )}
              {status === "error" && (
                <AqiError
                  message={error}
                  onRetry={place ? () => void load(place) : undefined}
                />
              )}
              {status === "done" && place && aqi && <AqiPanel place={place} data={aqi} />}
            </div>
          </div>

          <MapPanel
            className="h-[380px] overflow-hidden rounded-[10px] border border-border bg-card sm:h-[480px] lg:h-auto lg:min-h-[560px]"
            markers={markers}
            routes={[]}
            center={place ? { lat: place.lat, lng: place.lng } : undefined}
            zoom={place ? 13 : 11}
          />
        </div>

        <p className="mt-3 text-[13px] text-muted-foreground">
          Air-quality data: Google Air Quality API, local AQI standard for the searched region.
        </p>
      </div>
    </section>
  );
}

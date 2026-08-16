import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Info, Loader2 } from "lucide-react";
import { MapPanel } from "./MapPanel";
import { PlaceSearchInput } from "./PlaceSearchInput";
import { analyzeRouteFn } from "@/lib/autosense.functions";
import { aqiBand, type RouteAnalysis, type RouteOption } from "@/lib/autosense-types";
import type { MapMarker, MapRoute } from "./MapCanvas";

function RouteCard({ route, recommended }: { route: RouteOption; recommended: boolean }) {
  const band = aqiBand(route.averageAqi);
  return (
    <div
      className="animate-rise rounded-[10px] border bg-card p-5"
      style={{ borderColor: recommended ? "var(--teal)" : "var(--border)" }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="label-caps">{route.label}</span>
        {recommended && (
          <span
            className="rounded-[4px] px-2 py-0.5 text-[10px] font-semibold tracking-[0.12em] text-white"
            style={{ backgroundColor: "var(--teal)" }}
          >
            RECOMMENDED
          </span>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-5">
        <div>
          <div className="font-display text-[36px] font-bold leading-none text-foreground">
            {route.durationMin}
            <span className="ml-1 text-[16px] font-medium text-muted-foreground">min</span>
          </div>
        </div>
        <div className="text-[18px] font-medium text-muted-foreground">
          {route.distanceKm.toFixed(1)} km
        </div>
      </div>

      <div className="mt-5 space-y-2.5 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <span className="text-[14px] text-muted-foreground">Average AQI</span>
          <span className="flex items-center gap-2 text-[15px] font-semibold" style={{ color: band.color }}>
            {route.averageAqi}
            <span className="text-[11px] tracking-[0.1em]">{band.label}</span>
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[14px] text-muted-foreground">Estimated exposure</span>
          <span className="text-[15px] font-semibold text-foreground">{route.exposureScore}</span>
        </div>
      </div>
    </div>
  );
}

export function RouteSection() {
  const analyze = useServerFn(analyzeRouteFn);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">("idle");
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<RouteAnalysis | null>(null);

  const run = async () => {
    if (from.trim().length < 3 || to.trim().length < 3) {
      setError("Enter both a starting point and a destination.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const result = await analyze({ data: { origin: from.trim(), destination: to.trim() } });
      setAnalysis(result);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't analyze that route.");
      setStatus("error");
    }
  };

  const routes: MapRoute[] = analysis
    ? [
        {
          encodedPolyline: analysis.fastest.encodedPolyline,
          color: "#101817",
          recommended: false,
          badge: `${analysis.fastest.durationMin} min · ${analysis.fastest.distanceKm.toFixed(1)} km`,
        },
        ...(analysis.identical
          ? []
          : [
              {
                encodedPolyline: analysis.cleanest.encodedPolyline,
                color: "#16b8a6",
                recommended: true,
                badge: `${analysis.cleanest.durationMin} min · ${analysis.cleanest.distanceKm.toFixed(1)} km`,
              },
            ]),
      ]
    : [];

  const markers: MapMarker[] = analysis
    ? [
        {
          lat: analysis.origin.lat,
          lng: analysis.origin.lng,
          kind: "origin",
          title: "ORIGIN",
          detail: analysis.origin.name,
        },
        {
          lat: analysis.destination.lat,
          lng: analysis.destination.lng,
          kind: "destination",
          title: "DESTINATION",
          detail: analysis.destination.name,
        },
        ...analysis.cleanest.samples.map((sample) => ({
          lat: sample.lat,
          lng: sample.lng,
          kind: "aqi" as const,
          aqi: sample.aqi,
          title: `AQI ${sample.aqi} · ${aqiBand(sample.aqi).label}`,
          detail: "Sampled along the AutoSense route",
        })),
      ]
    : [];

  const minuteDelta = analysis ? analysis.cleanest.durationMin - analysis.fastest.durationMin : 0;

  return (
    <section id="safest-route" className="border-t border-border bg-card py-16 sm:py-24">
      <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
        <div className="max-w-2xl">
          <span className="label-caps">Route comparison</span>
          <h2 className="mt-3 font-display text-[34px] font-bold leading-[1.05] tracking-tight text-foreground sm:text-[44px] lg:text-[52px]">
            Find a Cleaner Route
          </h2>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
          <div className="flex flex-col gap-4">
            <div className="rounded-[10px] border border-border bg-background p-4">
              <div className="label-caps">From</div>
              <div className="mt-1.5">
                <PlaceSearchInput
                  value={from}
                  onValueChange={setFrom}
                  onSelect={(place) => setFrom(place.name)}
                  placeholder="Enter starting point"
                  icon="pin"
                  ariaLabel="Starting point"
                />
              </div>
              <div className="label-caps mt-4">To</div>
              <div className="mt-1.5">
                <PlaceSearchInput
                  value={to}
                  onValueChange={setTo}
                  onSelect={(place) => setTo(place.name)}
                  placeholder="Enter destination"
                  icon="pin"
                  ariaLabel="Destination"
                />
              </div>
              <button
                type="button"
                onClick={() => void run()}
                disabled={status === "loading"}
                className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-primary text-[16px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Analyzing route…
                  </>
                ) : (
                  <>
                    Analyze Route <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            {status === "idle" && (
              <div className="rounded-[10px] border border-border bg-background px-5 py-8 text-center text-[14px] text-muted-foreground">
                Enter a starting point and destination to compare routes.
              </div>
            )}

            {status === "loading" && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {[0, 1].map((i) => (
                  <div key={i} className="animate-pulse rounded-[10px] border border-border p-5">
                    <div className="h-2.5 w-24 rounded bg-muted" />
                    <div className="mt-4 h-8 w-32 rounded bg-muted" />
                    <div className="mt-5 h-4 w-full rounded bg-muted" />
                    <div className="mt-2 h-4 w-2/3 rounded bg-muted" />
                  </div>
                ))}
              </div>
            )}

            {status === "error" && (
              <div className="rounded-[10px] border border-border bg-background px-5 py-6 text-center">
                <p className="text-[14px] text-foreground">{error}</p>
                <button
                  type="button"
                  onClick={() => void run()}
                  className="mt-3 rounded-[6px] border border-border px-3 py-2 text-[14px] font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Try again
                </button>
              </div>
            )}

            {status === "done" && analysis && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <RouteCard route={analysis.fastest} recommended={analysis.identical} />
                {!analysis.identical && <RouteCard route={analysis.cleanest} recommended />}
                <div className="rounded-[10px] border border-border bg-background p-4">
                  {analysis.identical ? (
                    <p className="text-[14px] text-foreground">
                      The fastest route also carries the lowest estimated exposure on this trip.
                    </p>
                  ) : (
                    <p className="text-[14px] text-foreground">
                      <span className="font-semibold">
                        {minuteDelta > 0 ? `${minuteDelta} extra minute${minuteDelta === 1 ? "" : "s"}` : "No extra time"}
                      </span>{" "}
                      · Lower estimated pollution exposure
                    </p>
                  )}
                  <p className="mt-2 flex items-start gap-1.5 text-[12px] text-muted-foreground">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
                    AutoSense estimates route exposure using available air-quality data across the
                    route. This is an indicative metric and not a medical exposure measurement.
                  </p>
                </div>
              </div>
            )}
          </div>

          <MapPanel
            className="h-[380px] overflow-hidden rounded-[10px] border border-border bg-background sm:h-[480px] lg:h-auto lg:min-h-[620px]"
            markers={markers}
            routes={routes}
            zoom={12}
          />
        </div>
      </div>
    </section>
  );
}

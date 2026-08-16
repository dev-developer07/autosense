import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import type { MapMarker, MapRoute } from "./MapCanvas";

const MapCanvas = lazy(() => import("./MapCanvas"));

function MapSkeleton() {
  return (
    <div className="h-full w-full animate-pulse bg-muted">
      <div className="flex h-full items-center justify-center">
        <span className="label-caps">Loading map…</span>
      </div>
    </div>
  );
}

export function MapPanel(props: {
  markers: MapMarker[];
  routes: MapRoute[];
  center?: { lat: number; lng: number } | undefined;
  zoom?: number;
  className?: string;
}) {
  const { className, ...rest } = props;
  return (
    <div className={className}>
      <ClientOnly fallback={<MapSkeleton />}>
        <Suspense fallback={<MapSkeleton />}>
          <MapCanvas {...rest} />
        </Suspense>
      </ClientOnly>
    </div>
  );
}

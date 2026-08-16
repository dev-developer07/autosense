/// <reference types="google.maps" />
import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps, MAP_STYLES } from "@/lib/google-maps-loader";
import { aqiBand, decodePolyline } from "@/lib/autosense-types";

export type MapMarker = {
  lat: number;
  lng: number;
  kind: "origin" | "destination" | "place" | "aqi" | "device" | "sensor";
  aqi?: number;
  title?: string;
  detail?: string;
  /** device markers: explicit colour + pulsing (moving) state + rich popup */
  color?: string;
  pulse?: boolean;
  html?: string;
};


export type MapRoute = {
  encodedPolyline: string;
  color: string;
  recommended: boolean;
  badge: string;
};

type Props = {
  markers: MapMarker[];
  routes: MapRoute[];
  center?: { lat: number; lng: number } | undefined;
  zoom?: number;
};

const HEX: Record<string, string> = {
  good: "#3fa66b",
  moderate: "#e7b84b",
  sensitive: "#e77b3c",
  unhealthy: "#d9534f",
  severe: "#d9534f",
};

function pinIcon(color: string, ring = "#ffffff") {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: ring,
    strokeWeight: 3,
    scale: 9,
  } satisfies google.maps.Symbol;
}

/** Device marker: solid dot; moving devices get an animated pulse ring. */
function deviceMarkerIcon(color: string, pulse: boolean) {
  const size = 40;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 40 40">
    ${
      pulse
        ? `<circle cx="20" cy="20" r="8" fill="${color}" opacity="0.35">
             <animate attributeName="r" values="8;17;8" dur="1.8s" repeatCount="indefinite"/>
             <animate attributeName="opacity" values="0.4;0;0.4" dur="1.8s" repeatCount="indefinite"/>
           </circle>`
        : ""
    }
    <circle cx="20" cy="20" r="7" fill="${color}" stroke="#ffffff" stroke-width="2.5"/>
  </svg>`;
  return {
    url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
    anchor: new google.maps.Point(size / 2, size / 2),
    scaledSize: new google.maps.Size(size, size),
  } satisfies google.maps.Icon;
}

export default function MapCanvas({ markers, routes, center, zoom = 12 }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const overlaysRef = useRef<(google.maps.Marker | google.maps.Polyline)[]>([]);
  const infoRef = useRef<google.maps.InfoWindow | null>(null);
  const centerRef = useRef<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);


  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !containerRef.current) return;
        mapRef.current = new maps.Map(containerRef.current, {
          center: center ?? { lat: 28.6692, lng: 77.4538 },
          zoom,
          styles: MAP_STYLES,
          disableDefaultUI: true,
          zoomControl: true,
          fullscreenControl: true,
          clickableIcons: false,
        });
        infoRef.current = new maps.InfoWindow();
        setReady(true);
      })
      .catch((err: Error) => setError(err.message));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = [];

    const bounds = new google.maps.LatLngBounds();
    let hasBounds = false;

    routes.forEach((route) => {
      const path = decodePolyline(route.encodedPolyline);
      const line = new google.maps.Polyline({
        path,
        map,
        strokeColor: route.color,
        strokeOpacity: route.recommended ? 1 : 0.7,
        strokeWeight: route.recommended ? 6 : 4,
        zIndex: route.recommended ? 3 : 2,
      });
      overlaysRef.current.push(line);
      path.forEach((p) => {
        bounds.extend(p);
        hasBounds = true;
      });

      const mid = path[Math.floor(path.length / 2)];
      if (mid) {
        const width = route.badge.length * 7.5 + 20;
        const badge = new google.maps.Marker({
          position: mid,
          map,
          zIndex: route.recommended ? 5 : 4,
          icon: {
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="26"><rect x="0.5" y="0.5" rx="5" width="${width - 1}" height="25" fill="#ffffff" stroke="${route.color}"/></svg>`,
              ),
            anchor: new google.maps.Point(width / 2, 13),
            scaledSize: new google.maps.Size(width, 26),
          },
          label: {
            text: route.badge,
            color: "#101817",
            fontSize: "12px",
            fontWeight: "600",
            fontFamily: "Inter, sans-serif",
          },
        });
        overlaysRef.current.push(badge);
      }
    });

    markers.forEach((marker) => {
      const position = { lat: marker.lat, lng: marker.lng };
      const band = marker.aqi !== undefined ? aqiBand(marker.aqi) : null;
      const isDevice = marker.kind === "device" || marker.kind === "sensor";
      const color =
        marker.color ??
        (marker.kind === "origin"
          ? "#101817"
          : marker.kind === "destination"
            ? "#19a974"
            : band
              ? (HEX[band.key] ?? "#19a974")
              : "#16b8a6");

      const deviceIcon = isDevice ? deviceMarkerIcon(color, marker.pulse === true) : null;

      const mapMarker = new google.maps.Marker({
        position,
        map,
        zIndex: isDevice ? (marker.pulse ? 7 : 6) : 6,
        ...(isDevice ? {} : { animation: google.maps.Animation.DROP }),
        icon:
          deviceIcon ??
          (marker.kind === "aqi" && marker.aqi !== undefined
            ? {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: color,
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 3,
                scale: 16,
              }
            : pinIcon(color)),
        label:
          !isDevice && marker.kind === "aqi" && marker.aqi !== undefined
            ? {
                text: String(marker.aqi),
                color: band?.key === "moderate" ? "#101817" : "#ffffff",
                fontSize: "12px",
                fontWeight: "700",
                fontFamily: "Inter, sans-serif",
              }
            : null,
      });

      if (marker.title || marker.detail || marker.html) {
        mapMarker.addListener("click", () => {
          infoRef.current?.setContent(
            marker.html ??
              `<div style="font-family:Inter,sans-serif;min-width:150px;padding:2px 4px">
               <div style="font-size:11px;letter-spacing:.14em;color:#65716e;font-weight:600">${marker.title ?? "LOCATION"}</div>
               <div style="margin-top:4px;font-size:13px;color:#101817">${marker.detail ?? ""}</div>
             </div>`,
          );
          infoRef.current?.open({ map, anchor: mapMarker });
        });
      }

      overlaysRef.current.push(mapMarker);
      bounds.extend(position);
      hasBounds = true;
    });

    if (routes.length > 0 && hasBounds) {
      map.fitBounds(bounds, 60);
    } else if (center && (centerRef.current?.lat !== center.lat || centerRef.current?.lng !== center.lng)) {
      centerRef.current = center;
      map.setCenter(center);
      map.setZoom(zoom);

    }
  }, [markers, routes, center, zoom, ready]);

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted p-6 text-center">
        <p className="max-w-sm text-[14px] text-muted-foreground">{error}</p>
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full" />;
}

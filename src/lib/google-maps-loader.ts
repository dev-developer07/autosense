/// <reference types="google.maps" />
// Browser-only loader for the Google Maps JavaScript API.
let loadPromise: Promise<typeof google.maps> | null = null;

export const BROWSER_KEY = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"] as
  | string
  | undefined;

const TRACKING_ID = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"] as
  | string
  | undefined;

export function loadGoogleMaps(): Promise<typeof google.maps> {
  if (typeof window === "undefined") return Promise.reject(new Error("Not in a browser"));
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (!BROWSER_KEY) {
      reject(
        new Error(
          "Google Maps API key required. Connect the Google Maps Platform connector to enable maps.",
        ),
      );
      return;
    }
    const w = window as unknown as Record<string, unknown>;
    if (w["google"] && (w["google"] as typeof google).maps?.Map) {
      resolve((w["google"] as typeof google).maps);
      return;
    }

    const callbackName = "__autosenseMapsReady";
    w[callbackName] = () => resolve((window as unknown as { google: typeof google }).google.maps);

    const script = document.createElement("script");
    const params = new URLSearchParams({
      key: BROWSER_KEY,
      loading: "async",
      callback: callbackName,
      libraries: "places",
    });
    if (TRACKING_ID) params.set("channel", TRACKING_ID);
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.onerror = () => reject(new Error("Map services are currently unavailable."));
    document.head.appendChild(script);
  });

  return loadPromise;
}

export const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#f1f4f3" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#65716e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f7f6" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#dce3e0" }] },
  { featureType: "poi", stylers: [{ visibility: "simplified" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e6efe9" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#e9edeb" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#dfe9e8" }] },
];

# AutoSense — environment-aware navigation demo

A single-page product demo: search a location to see its air quality, and compare a fastest route against a lower-exposure route on a live Google Map. No marketing filler sections.

## Setup step (first, and it needs you)

I'll open the Google Maps connect card in chat. One click links the managed key, which gives:
- Maps JavaScript API + Places Autocomplete in the browser
- Geocoding, Routes, and Air Quality through a secure server-side gateway (no key in the frontend)

If the connection isn't linked, every surface shows a clear setup state instead of breaking.

## Page structure

1. **Sticky navbar** — AutoSense wordmark left, "AQI Map" / "Safest Route" center, "Launch AutoSense →" right. Hamburger sheet on mobile.
2. **Hero** — eyebrow ENVIRONMENT-AWARE NAVIGATION, headline "THE ROAD ISN'T JUST A ROUTE.", supporting copy, two buttons. Right side: a styled map panel with origin/destination markers, two route polylines, AQI chips and floating cards (AQI 42 GOOD · 18 min · 7.4 km · Exposure ↓ 31%), explicitly badged as sample.
3. **AQI Map section** — "Check the air before you choose the road." Places Autocomplete search ("Search a location…"), a full Google Map, and a result panel: place name, region, big AQI number + category, PM2.5 / PM10 / temperature / humidity, last updated, coordinates, data-source label. Clicking an AQI marker opens a compact popup (AQI + category + PM2.5). "Use my location" button when geolocation is permitted.
4. **Find a Cleaner Route** — FROM / TO autocomplete inputs, "Analyze Route →". Draws all returned routes on the map: fastest in dark neutral, recommended in teal/green, each with a small time + distance badge.
5. **Route comparison** — two cards side by side (FASTEST ROUTE vs AUTO-SENSE ROUTE) with distance, duration, average AQI, exposure label; RECOMMENDED badge on the winner plus a delta line ("3 extra minutes · Lower estimated pollution exposure"). Info tooltip explains the estimate is indicative, not medical.
6. **Final CTA** — "YOUR ROUTE. YOUR AIR. YOUR CHOICE." + supporting line + "Launch AutoSense →".

## How the data works

- **Location search** → Places Autocomplete (new API) in the browser for suggestions; place details/geocoding resolved server-side.
- **AQI** → Google Air Quality API `currentConditions:lookup` behind a provider interface `getAQI(lat, lng)`, so the source can be swapped without touching UI. Returns AQI, category, PM2.5, PM10, and weather values where available.
- **Routes** → Routes API `computeRoutes` with alternatives enabled.
- **Exposure model** → sample points along each route polyline, fetch AQI for the samples (deduped and cached), then `exposure = Σ(segment minutes × AQI severity)`. Lowest-exposure route wins the RECOMMENDED badge. Always labelled "Estimated exposure".
- If AQI is unavailable, the app switches to a visibly labelled **DEMO DATA** mode rather than faking live values.

## Design system

Palette locked to your spec: `#F5F7F6` background, `#101817` text, `#65716E` secondary, `#19A974` primary, `#16B8A6` teal, `#DCE3E0` borders, AQI colors used only for air-quality status. Space Grotesk headings / Inter body, hero 64–80px desktop. Thin borders, near-flat cards, precise spacing, restrained motion (marker pop, card fade-slide, route draw-in, hover states).

## States

Skeleton loaders with contextual copy ("Finding location…", "Fetching air-quality data…", "Analyzing route…"). Designed empty states before search and before route analysis. Error states with retry for invalid location, no results, API/gateway failures, and network loss. Missing connection shows the setup message.

## Technical notes

- TanStack Start. Single route `/` with anchor scrolling to the map and route sections.
- Maps JS loaded async with the connector's browser key via `callback`, `google.maps.Marker` (no mapId), rendered only on the client behind `ClientOnly` + lazy import so SSR stays clean.
- Air Quality, Routes, and Geocoding calls run in `createServerFn` handlers through the connector gateway; secrets never reach the browser. Autocomplete is debounced and results cached to keep Maps usage bounded.
- Route-level `head()` metadata for title/description/OG/Twitter.

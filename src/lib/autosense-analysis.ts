import type { PlaceResult, RouteAnalysis, RouteOption } from "./autosense-types";

/** Pick the fastest route and the lowest estimated-exposure route from the options. */
export function buildAnalysis(
  origin: PlaceResult,
  destination: PlaceResult,
  options: RouteOption[],
): RouteAnalysis {
  const sortedByTime = [...options].sort((a, b) => a.durationMin - b.durationMin);
  const fastest = sortedByTime[0]!;
  const sortedByExposure = [...options].sort((a, b) => a.exposureScore - b.exposureScore);
  const cleanest = sortedByExposure[0]!;

  return {
    origin,
    destination,
    fastest: { ...fastest, label: "FASTEST ROUTE", recommended: cleanest.id === fastest.id },
    cleanest: { ...cleanest, label: "AUTOSENSE ROUTE", recommended: true },
    identical: cleanest.id === fastest.id,
    demo: false,
  };
}

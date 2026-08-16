import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const searchSchema = z.object({ query: z.string().min(2).max(200) });
const pointSchema = z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) });
const routeSchema = z.object({ origin: z.string().min(2).max(200), destination: z.string().min(2).max(200) });

export const searchPlacesFn = createServerFn({ method: "POST" })
  .inputValidator((data) => searchSchema.parse(data))
  .handler(async ({ data }) => {
    const { searchPlaces } = await import("./autosense.server");
    return searchPlaces(data.query);
  });

export const getAqiFn = createServerFn({ method: "POST" })
  .inputValidator((data) => pointSchema.parse(data))
  .handler(async ({ data }) => {
    const { getAQI } = await import("./autosense.server");
    return getAQI(data.lat, data.lng, true);
  });

export const reverseGeocodeFn = createServerFn({ method: "POST" })
  .inputValidator((data) => pointSchema.parse(data))
  .handler(async ({ data }) => {
    const { reverseGeocode } = await import("./autosense.server");
    return reverseGeocode(data.lat, data.lng);
  });

export const analyzeRouteFn = createServerFn({ method: "POST" })
  .inputValidator((data) => routeSchema.parse(data))
  .handler(async ({ data }) => {
    const { searchPlaces, computeRouteOptions } = await import("./autosense.server");
    const { buildAnalysis } = await import("./autosense-analysis");

    const [originResults, destinationResults] = await Promise.all([
      searchPlaces(data.origin, 1),
      searchPlaces(data.destination, 1),
    ]);
    const origin = originResults[0];
    const destination = destinationResults[0];
    if (!origin) throw new Error(`We couldn't find a place matching "${data.origin}".`);
    if (!destination) throw new Error(`We couldn't find a place matching "${data.destination}".`);

    const options = await computeRouteOptions(origin, destination);
    return buildAnalysis(origin, destination, options);
  });

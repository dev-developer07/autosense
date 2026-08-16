import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const deviceIdSchema = z.object({ deviceId: z.string().regex(/^AS-\d{3}$/) });
const pointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  aqi: z.number().min(0).max(1000).optional(),
});

export const getNetworkSnapshotFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getSnapshot } = await import("./devices/store.server");
  return getSnapshot();
});

export const getDeviceTrendFn = createServerFn({ method: "POST" })
  .inputValidator((data) => deviceIdSchema.parse(data))
  .handler(async ({ data }) => {
    const { getDeviceTrend } = await import("./devices/store.server");
    return getDeviceTrend(data.deviceId);
  });

export const getDeviceLocationFn = createServerFn({ method: "POST" })
  .inputValidator((data) => deviceIdSchema.parse(data))
  .handler(async ({ data }) => {
    const { getDeviceLocation } = await import("./devices/store.server");
    return getDeviceLocation(data.deviceId);
  });

export const getAllDeviceLocationsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getAllDeviceLocations } = await import("./devices/store.server");
  return getAllDeviceLocations();
});

export const getLocationInsightsFn = createServerFn({ method: "POST" })
  .inputValidator((data) => pointSchema.parse(data))
  .handler(async ({ data }) => {
    const { getLocationTrend, getNearbySensors } = await import("./devices/store.server");
    return {
      trend: getLocationTrend(data.lat, data.lng, data.aqi ?? 90),
      sensors: getNearbySensors(data.lat, data.lng),
      simulated: true,
    };
  });

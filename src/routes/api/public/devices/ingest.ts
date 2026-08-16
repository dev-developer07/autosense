// Ingestion endpoint for physical AutoSense devices.
//
// A device POSTs its own GPS coordinates and sensor readings here; the reading
// replaces the simulated value for that device across the admin panel and the
// public site. Secure with DEVICE_INGEST_TOKEN (Bearer header).
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const readingSchema = z.object({
  deviceId: z.string().regex(/^AS-\d{3}$/),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  aqi: z.number().min(0).max(1000),
  pm25: z.number().min(0).max(2000),
  pm10: z.number().min(0).max(2000),
  temperature: z.number().min(-60).max(80).optional(),
  humidity: z.number().min(0).max(100).optional(),
  batteryPercentage: z.number().min(0).max(100),
  speed: z.number().min(0).max(300).optional(),
  timestamp: z.string().datetime().optional(),
});

export const Route = createFileRoute("/api/public/devices/ingest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env["DEVICE_INGEST_TOKEN"];
        if (expected) {
          const auth = request.headers.get("authorization");
          if (auth !== `Bearer ${expected}`) {
            return new Response("Unauthorized", { status: 401 });
          }
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
        }

        const parsed = readingSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json({ ok: false, error: "Invalid payload" }, { status: 400 });
        }

        const { ingestReading } = await import("@/lib/devices/store.server");
        const d = parsed.data;
        ingestReading({
          deviceId: d.deviceId,
          timestamp: d.timestamp ?? new Date().toISOString(),
          latitude: d.latitude,
          longitude: d.longitude,
          aqi: d.aqi,
          pm25: d.pm25,
          pm10: d.pm10,
          temperature: d.temperature ?? 0,
          humidity: d.humidity ?? 0,
          batteryPercentage: d.batteryPercentage,
          speed: d.speed ?? 0,
        });

        return Response.json({ ok: true, deviceId: d.deviceId });
      },
    },
  },
});

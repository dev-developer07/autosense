import { useQuery } from "@tanstack/react-query";
import { deviceService } from "@/lib/devices/deviceService";

/** Polls the backend so the command center always shows fresh device state. */
export function useNetworkSnapshot(intervalMs = 7000) {
  return useQuery({
    queryKey: ["network-snapshot"],
    queryFn: () => deviceService.getNetworkSnapshot(),
    refetchInterval: intervalMs,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}

export function useDeviceTrend(deviceId: string | null) {
  return useQuery({
    queryKey: ["device-trend", deviceId],
    queryFn: () => deviceService.getDeviceTrend(deviceId!),
    enabled: !!deviceId,
    refetchInterval: 30_000,
  });
}

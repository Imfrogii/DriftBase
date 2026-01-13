import { useQuery } from "@tanstack/react-query";
import api from "../utils/request";

export function useReverseGeocode({
  enabled = true,
  lat,
  lon,
}: {
  enabled?: boolean;
  lat: number;
  lon: number;
}) {
  return useQuery({
    enabled,
    queryKey: ["reverseGeocode", lat, lon],
    queryFn: async () => {
      const { data } = await api.get(`/api/locations/reverse`, {
        params: {
          longitude: lon,
          latitude: lat,
        },
      });

      return data.locationInfo;
    },
  });
}

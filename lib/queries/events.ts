import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "../utils/request";

export function useBulkEvents(events: string[]) {
  return useQuery({
    enabled: events.length > 0,
    queryKey: ["events_bulk", events],
    queryFn: async () => {
      const { data } = await api.post(`/api/events/bulk`, events);

      return data;
    },
  });
}

export function useMyEvents(filters?: {
  level?: string;
  priceMin?: number;
  priceMax?: number;
  dateFrom?: string;
  dateTo?: string;
}) {
  return useQuery({
    queryKey: ["my-events", filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters?.level) params.append("level", filters.level);
      if (filters?.priceMin !== undefined)
        params.append("priceMin", filters.priceMin.toString());
      if (filters?.priceMax !== undefined)
        params.append("priceMax", filters.priceMax.toString());
      if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters?.dateTo) params.append("dateTo", filters.dateTo);

      const { data } = await api.get(`/api/events/my-events?${params}`);

      return data.events;
    },
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventData: FormData) => {
      const { data } = await api.post(`/api/events`, eventData);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["my-events"] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventData: FormData) => {
      const { data } = await api.put(
        `/api/events/${eventData.get("id")}`,
        eventData
      );

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["my-events"] });
    },
  });
}

export function useCancelEvent(handleClose: () => void) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      eventId,
      image_url,
    }: {
      eventId: string;
      image_url: string | null;
    }) => {
      const { data } = await api.put(`/api/events/${eventId}/cancel`, {
        image_url,
        id: eventId,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["my-events"] });
      handleClose();
      router.refresh();
    },
  });
}

export function useDeleteEvent(redirectUrl: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      eventId,
      image_url,
    }: {
      eventId: string;
      image_url: string | null;
    }) => {
      const { data } = await api.put(`/api/events/${eventId}/delete`, {
        image_url,
        id: eventId,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["my-events"] });
      router.replace(decodeURIComponent(redirectUrl));
    },
  });
}

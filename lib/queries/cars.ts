import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/request";
import { useRouter } from "next/navigation";
import { enqueueSnackbar } from "notistack";
import { useTranslations } from "next-intl";
import { ApiError } from "../types";
import { CarLevel } from "../supabase/types";
import { CarFormData } from "@/components/forms/CarModalForm/CarModalForm";

export function useCars({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    enabled,
    queryKey: ["cars"],
    queryFn: async () => {
      const { data } = await api.get(`/api/cars`);

      return data.cars;
    },
  });
}

export function useCreateCar(onClose: () => void) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const t = useTranslations();

  return useMutation({
    mutationFn: async (carData: CarFormData) => {
      const { data } = await api.post(`/api/cars`, carData);

      return data;
    },
    onSuccess: () => {
      enqueueSnackbar("Car created successfully", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      onClose();
      router.refresh();
    },
    onError: (error: ApiError) => {
      enqueueSnackbar(t(error.error), { variant: "error" });
      onClose();
    },
  });
}

export function useUpdateCar(onClose: () => void) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const t = useTranslations();

  return useMutation({
    mutationFn: async ({ id, ...carData }: CarFormData & { id: string }) => {
      const { data } = await api.put(`/api/cars/${id}`, carData);

      return data;
    },
    onSuccess: () => {
      enqueueSnackbar("Car updated successfully", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      onClose();
      router.refresh();
    },
    onError: (error: ApiError) => {
      enqueueSnackbar(t(error.error), { variant: "error" });
      onClose();
    },
  });
}

export function useDeleteCar(setDeletingCar: (id: string | null) => void) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/api/cars/${id}`);
      return data;
    },
    onSuccess: () => {
      enqueueSnackbar("Car deleted successfully", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      setDeletingCar(null);
      router.refresh();
    },
    onError: (error: ApiError) => {
      enqueueSnackbar(t(error.error), { variant: "error" });
      setDeletingCar(null);
    },
  });
}

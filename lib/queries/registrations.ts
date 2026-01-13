import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "../utils/request";
import { enqueueSnackbar, useSnackbar } from "notistack";
import { useLocale, useTranslations } from "next-intl";
import { UseFormReset } from "react-hook-form";
import { Registration } from "../supabase/types";
import { getErrorTranslation } from "../helpers/getErrorTranslation";

export function useCreateCashRegistration() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (registrationData: {
      event_id: string;
      car_id: string;
    }) => {
      const { data } = await api.post(
        `/api/registrations/cash`,
        registrationData
      );

      return data;
    },
    onSuccess: () => {
      enqueueSnackbar("Registered successfully", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      router.refresh();
    },
  });
}

export function useCreateOnlineRegistration() {
  const queryClient = useQueryClient();
  const locale = useLocale();
  const router = useRouter();

  return useMutation({
    mutationFn: async (registrationData: {
      event_id: string;
      car_id: string;
    }) => {
      const { data } = await api.post(`/api/registrations/online`, {
        ...registrationData,
        locale,
      });

      return data;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      router.push(response.url);
    },
    onError: () => {
      enqueueSnackbar("Failed to register", {
        variant: "error",
      });
    },
  });
}

export function useUnregister(handleClose: () => void) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (registration_id: string) => {
      const { data } = await api.put(
        `/api/registrations/${registration_id}/unregister`
      );

      return data;
    },
    onSuccess: () => {
      enqueueSnackbar("Unregistered successfully", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      handleClose();
      router.refresh();
    },
  });
}

export type RegistrationCode = {
  registration_code: number;
  expires_at: string;
  event_id: string;
};

export function useGenerateCheckInCode(
  setRegistrationCode: (registrationCode: RegistrationCode) => void
) {
  return useMutation({
    mutationFn: async (registration_id: string) => {
      const { data } = await api.post<RegistrationCode>(
        `/api/registration-code`,
        {
          registration_id,
        }
      );

      return data;
    },
    onSuccess: (response) => {
      setRegistrationCode(response);
    },
    onError: () => {
      enqueueSnackbar("Failed to create check-in code", {
        variant: "error",
      });
    },
  });
}

export function useRegistrationCodeCheck(
  reset: UseFormReset<{
    code: string;
  }>,
  setIsScanLoading: (isLoading: boolean) => void
) {
  const t = useTranslations();
  return useMutation<Registration, { message: string }, string>({
    mutationFn: async (code: string) => {
      const { data } = await api.put("/api/registration-code/verify", {
        code,
      });

      return data;
    },
    onSuccess: () => {
      reset();
      enqueueSnackbar(t("scanner.success"), {
        variant: "success",
        autoHideDuration: 5000,
        preventDuplicate: false,
      });
    },
    onError: (error) => {
      enqueueSnackbar(getErrorTranslation(t, error.message, "scanner"), {
        variant: "error",
        autoHideDuration: 5000,
        preventDuplicate: false,
      });
    },
    onSettled: () => {
      setIsScanLoading(false);
    },
  });
}

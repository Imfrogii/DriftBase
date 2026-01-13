import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/request";
import { UseFormReset } from "react-hook-form";
import { ProfileFormData } from "@/components/forms/ProfileForm/ProfileForm";

export function useUpdateProfile(reset: UseFormReset<ProfileFormData>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      display_name,
      instagram,
      org_name,
    }: {
      display_name: string;
      instagram?: string;
      org_name?: string;
    }) => {
      const { data } = await api.put(`/api/profile`, {
        display_name,
        instagram,
        org_name,
      });

      return data;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      reset({
        display_name: response.profile.display_name,
        email: response.profile.email,
      });
    },
  });
}

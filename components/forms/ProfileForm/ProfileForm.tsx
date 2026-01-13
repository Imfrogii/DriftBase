"use client";
import { Paper, Typography, Box, TextField, Button } from "@mui/material";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import styles from "./ProfileForm.module.scss";
import { useUpdateProfile } from "@/lib/queries/profile";
import { User } from "@/lib/supabase/types";
import { OrganizationField } from "@/components/common/OrganizationField/OrganizationField";

export type ProfileFormData = {
  display_name: string;
  email: string;
  instagram?: string;
  org_name?: string;
};

type ProfileFormProps = {
  user: User;
};

export function ProfileForm({ user }: ProfileFormProps) {
  const t = useTranslations();
  const { register, handleSubmit, formState, reset } = useForm<ProfileFormData>(
    {
      defaultValues: {
        display_name: user.display_name || "",
        org_name: user.org_name || "",
        email: user.email || "",
        instagram: user.instagram || "",
      },
    }
  );
  const updateProfileMutation = useUpdateProfile(reset);

  const onProfileSubmit = async ({
    display_name,
    instagram,
    org_name,
  }: ProfileFormData) => {
    updateProfileMutation.mutate({
      display_name: display_name,
      instagram: instagram || "",
      org_name: org_name || "",
    });
  };

  return (
    <Paper className={styles.section} elevation={1}>
      <Typography variant="h5" gutterBottom>
        Profile Information
      </Typography>
      <Box component="form" onSubmit={handleSubmit(onProfileSubmit)}>
        <TextField
          fullWidth
          label="Display Name"
          {...register("display_name")}
          required
          margin="normal"
        />
        {/* <TextField
          fullWidth
          label="Organization Name"
          {...register("org_name")}
          margin="normal"
          helperText="This name will be displayed in your created events"
        /> */}

        <TextField
          fullWidth
          label="Instagram Profile"
          placeholder="@profileName"
          {...register("instagram")}
          margin="normal"
        />
        <OrganizationField
          organizationName={user.org_name || ""}
          isVerified={false} // You might want to replace this with actual verification status
          onNameChange={(value) => {
            // Handle organization name change if needed
          }}
          platformInstagram={user.instagram || ""}
        />
        <TextField
          fullWidth
          label="Email"
          {...register("email")}
          disabled
          margin="normal"
        />
        <Button
          type="submit"
          variant="contained"
          sx={{ mt: 2 }}
          disabled={formState.isSubmitting || !formState.isDirty}
        >
          Update Profile
        </Button>
      </Box>
    </Paper>
  );
}

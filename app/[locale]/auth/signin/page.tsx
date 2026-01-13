import type { Metadata } from "next";
import { AuthForm } from "@/components/forms/AuthForm/AuthForm";
import { redirect } from "next/navigation";
import { Container, Box, Typography } from "@mui/material";
import styles from "./page.module.scss";
import Image from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAuthWithRedirect } from "@/lib/helpers/isAuthWithRedirect";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your DriftBase account",
};

export default async function SignInPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: Promise<{ redirect?: string }>;
}) {
  const urlParams = await searchParams;
  const redirectUrl = urlParams.redirect;
  const supabase = await createServerSupabaseClient();
  let user = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    user = data.user;
  } catch (err) {}

  if (user) {
    redirect(
      redirectUrl ? decodeURIComponent(redirectUrl) : `/${params.locale}`
    );
  }

  return (
    <Box className={styles.container}>
      <Box className={styles.formContainer}>
        <Box className={styles.header}>
          <Typography variant="body1" color="text.secondary">
            Накопилась резина?
          </Typography>
          <Typography variant="h2" className={styles.title}>
            Войди в DriftBase
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Пора её сжечь
          </Typography>
        </Box>

        <AuthForm mode="signin" />
      </Box>
      <Box className={styles.videoContainer}>
        <Image
          src="/poster.png"
          alt="Drift video"
          layout="fill"
          objectFit="cover"
          quality={50}
          priority={false}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </Box>
    </Box>
  );
}

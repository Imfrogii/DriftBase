import type { Metadata } from "next";
import { AuthForm } from "@/components/forms/AuthForm/AuthForm";
import { Box, Typography } from "@mui/material";
import styles from "./page.module.scss";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your DriftBase account",
};

export default async function SignUpPage({
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
        <Typography variant="h2" className={styles.title}>
          Весь дрифт в одном месте
        </Typography>
        <Box className={styles.featuresList} color={"text.secondary"}>
          <Typography variant="body1">
            <span className={styles.featureIcon}>🎯</span>
            Регистрируйся на заезды одним кликом
          </Typography>
          <Typography variant="body1">
            <span className={styles.featureIcon}>🚀</span>
            Создавай и продвигай свои ивенты
          </Typography>
          <Typography variant="body1">
            <span className={styles.featureIcon}>💡</span>
            Управляй всем в одном месте
          </Typography>
        </Box>

        <AuthForm mode="signup" />
      </Box>
      <Box className={styles.videoContainer}>
        <video
          autoPlay
          playsInline
          loop
          muted
          poster="/poster.png"
          preload="metadata"
          className={styles.video}
        >
          <source src="/1.webm" type="video/webm" />
        </video>
      </Box>
    </Box>
  );
}

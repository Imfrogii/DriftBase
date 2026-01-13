"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  TextField,
  Typography,
  Alert,
  Link as MuiLink,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { Button } from "@/components/common/Button/Button";
import { createClient } from "@/lib/supabase/client";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import styles from "./AuthForm.module.scss";
import { useRouter, useSearchParams } from "next/navigation";
import { enqueueSnackbar } from "notistack";
import { AuthError } from "@/lib/types/errors";
import { getErrorTranslation } from "@/lib/helpers/getErrorTranslation";

interface AuthFormData {
  email: string;
  password: string;
  displayName?: string;
}

interface AuthFormProps {
  mode: "signin" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const supabase = createClient();
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const t = useTranslations();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>();

  const onSubmit = async (data: AuthFormData) => {
    setLoading(true);
    // TODO if link from email expired - there is no way to resend it
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              display_name: data.displayName,
              emailRedirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/callback`,
            },
          },
        });

        if (error) throw error;

        enqueueSnackbar(t("checkEmailForConfirmation"), { variant: "success" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (error) throw error;

        enqueueSnackbar(t("signInSuccess"), { variant: "success" });

        router.replace(
          redirectUrl ? decodeURIComponent(redirectUrl) : `/${locale}`
        );
      }
    } catch (error) {
      const { code } = error as { code: string };
      enqueueSnackbar(
        getErrorTranslation(
          t,
          AuthError[code.toUpperCase() as AuthError]
            ? code.toUpperCase()
            : "UNKNOWN",
          "auth"
        ),
        {
          variant: "error",
          preventDuplicate: false,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        className={styles.form}
      >
        {mode === "signup" && (
          <TextField
            fullWidth
            label={t("displayName")}
            {...register("displayName")}
            error={!!errors.displayName}
            helperText={errors.displayName?.message}
          />
        )}

        <TextField
          fullWidth
          label={t("email")}
          type="email"
          {...register("email", {
            required: t("emailRequired"),
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: t("emailInvalid"),
            },
          })}
          error={!!errors.email}
          helperText={errors.email?.message}
        />

        <TextField
          fullWidth
          label={t("password")}
          type="password"
          {...register("password", {
            required: t("passwordRequired"),
            minLength: {
              value: 6,
              message: t("passwordMinLength"),
            },
          })}
          error={!!errors.password}
          helperText={errors.password?.message}
        />

        {mode === "signup" && (
          <FormControlLabel
            control={<Checkbox />}
            label={
              <Typography>
                I agree to the{" "}
                <Typography
                  component={Link}
                  href={`/${locale}/terms`}
                  color="primary"
                >
                  <Typography component={"span"}>
                    {t("terms and conditions")}
                  </Typography>
                </Typography>
              </Typography>
            }
          />
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          loading={loading}
          className={styles.submitButton}
        >
          {mode === "signin" ? t("signIn") : t("signUp")}
        </Button>

        <Box className={styles.links}>
          {mode === "signin" ? (
            <Typography variant="body2">
              {t("noAccount")}{" "}
              <Link href={`/${locale}/auth/signup`} passHref>
                <Typography component={"span"}>{t("signUp")}</Typography>
              </Link>
            </Typography>
          ) : (
            <Typography variant="body2">
              {t("haveAccount")}{" "}
              <Link href={`/${locale}/auth/signin`} passHref>
                <Typography component={"span"}>{t("signIn")}</Typography>
              </Link>
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

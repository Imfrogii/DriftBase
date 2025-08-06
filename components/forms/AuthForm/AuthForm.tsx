"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Box, TextField, Typography, Paper, Alert, Link as MuiLink } from "@mui/material"
import { Button } from "@/components/common/Button/Button"
import { supabase } from "@/lib/supabase/client"
import { useTranslations } from "next-intl"
import Link from "next/link"
import styles from "./AuthForm.module.scss"

interface AuthFormData {
  email: string
  password: string
  displayName?: string
}

interface AuthFormProps {
  mode: "signin" | "signup"
  onSuccess?: () => void
}

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const t = useTranslations("auth")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>()

  const onSubmit = async (data: AuthFormData) => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              display_name: data.displayName,
            },
          },
        })

        if (error) throw error
        setSuccess(t("signupSuccess"))
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        })

        if (error) throw error
        onSuccess?.()
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper className={styles.container}>
      <Typography variant="h4" component="h1" className={styles.title}>
        {mode === "signin" ? t("signIn") : t("signUp")}
      </Typography>

      {error && (
        <Alert severity="error" className={styles.alert}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" className={styles.alert}>
          {success}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} className={styles.form}>
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
              <Link href="/auth/signup" passHref>
                <MuiLink>{t("signUp")}</MuiLink>
              </Link>
            </Typography>
          ) : (
            <Typography variant="body2">
              {t("haveAccount")}{" "}
              <Link href="/auth/signin" passHref>
                <MuiLink>{t("signIn")}</MuiLink>
              </Link>
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  )
}

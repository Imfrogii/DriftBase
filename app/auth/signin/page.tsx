import type { Metadata } from "next"
import { AuthForm } from "@/components/forms/AuthForm/AuthForm"
import { Container } from "@mui/material"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your DriftBase account",
}

export default function SignInPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <AuthForm mode="signin" />
    </Container>
  )
}

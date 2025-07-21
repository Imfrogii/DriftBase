import type { Metadata } from "next"
import { AuthForm } from "@/components/forms/AuthForm/AuthForm"
import { Container } from "@mui/material"

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your DriftBase account",
}

export default function SignUpPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <AuthForm mode="signup" />
    </Container>
  )
}

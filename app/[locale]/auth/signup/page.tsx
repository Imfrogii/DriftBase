import type { Metadata } from "next";
import { AuthForm } from "@/components/forms/AuthForm/AuthForm";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your DriftBase account",
};

export default function SignUpPage() {
  return <AuthForm mode="signup" />;
}

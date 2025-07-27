import type { Metadata } from "next";
import { AuthForm } from "@/components/forms/AuthForm/AuthForm";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your DriftBase account",
};

export default function SignInPage() {
  return <AuthForm mode="signin" />;
}

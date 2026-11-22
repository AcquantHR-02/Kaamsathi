import type { Metadata } from "next";
import AuthShell from "@/features/auth/components/AuthShell";
import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell fitHeight={700}>
      <ForgotPasswordForm />
    </AuthShell>
  );
}

import type { Metadata } from "next";
import AuthShell from "@/features/auth/components/AuthShell";
import RegisterFlow from "@/features/auth/components/RegisterFlow";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <AuthShell width={520}>
      <RegisterFlow />
    </AuthShell>
  );
}

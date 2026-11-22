import type { Metadata } from "next";
import AuthShell from "@/features/auth/components/AuthShell";
import ResetPasswordForm from "@/features/auth/components/ResetPasswordForm";

// The token is a secret: keep it out of search engines and other sites' Referer headers.
export const metadata: Metadata = { title: "Set a new password", robots: { index: false }, referrer: "no-referrer" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token } = await searchParams;
  return (
    <AuthShell fitHeight={700}>
      <ResetPasswordForm token={typeof token === "string" && token ? token : null} />
    </AuthShell>
  );
}

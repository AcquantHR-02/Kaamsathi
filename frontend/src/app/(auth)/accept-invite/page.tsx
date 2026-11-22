import type { Metadata } from "next";
import AuthShell from "@/features/auth/components/AuthShell";
import AcceptInviteForm from "@/features/auth/components/AcceptInviteForm";

// The token is a secret: keep it out of search engines and other sites' Referer headers.
export const metadata: Metadata = { title: "Join your team", robots: { index: false }, referrer: "no-referrer" };

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token } = await searchParams;
  return (
    <AuthShell fitHeight={760}>
      <AcceptInviteForm token={typeof token === "string" && token ? token : null} />
    </AuthShell>
  );
}

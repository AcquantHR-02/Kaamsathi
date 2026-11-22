import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Applicants" };

// Placeholder so the sidebar link works; replaced by the real screen (Step 6).
export default function ApplicantsPage() {
  return <PageHeader title="Applicants" subtitle="Coming soon." />;
}

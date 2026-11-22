import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Companies" };

// Placeholder so the sidebar link works; replaced by the real screen (Step 7).
export default function CompaniesPage() {
  return <PageHeader title="Companies" subtitle="Coming soon." />;
}

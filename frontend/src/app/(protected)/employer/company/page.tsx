import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Company" };

// Placeholder so the sidebar link works; replaced by the real screen (Step 6).
export default function CompanyPage() {
  return <PageHeader title="Company" subtitle="Coming soon." />;
}

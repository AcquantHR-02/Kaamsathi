import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Audit log" };

// Placeholder so the sidebar link works; replaced by the real screen (Step 7).
export default function AuditlogPage() {
  return <PageHeader title="Audit log" subtitle="Coming soon." />;
}

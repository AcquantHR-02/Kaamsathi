import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Jobs" };

// Placeholder so the sidebar link works; replaced by the real screen (Step 6).
export default function JobsPage() {
  return <PageHeader title="Jobs" subtitle="Coming soon." />;
}

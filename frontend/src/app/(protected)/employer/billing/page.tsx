import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Plans & billing" };

// Placeholder so the sidebar link works; replaced by the real screen (Step 6).
export default function PlansbillingPage() {
  return <PageHeader title="Plans & billing" subtitle="Coming soon." />;
}

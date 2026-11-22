import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Payments" };

// Placeholder so the sidebar link works; replaced by the real screen (Step 7).
export default function PaymentsPage() {
  return <PageHeader title="Payments" subtitle="Coming soon." />;
}

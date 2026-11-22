import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Team" };

// Placeholder so the sidebar link works; replaced by the real screen (Step 6).
export default function TeamPage() {
  return <PageHeader title="Team" subtitle="Coming soon." />;
}

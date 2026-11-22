import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Admin dashboard" };

// Placeholder: the dashboard is built last in Step 7 (AdminDashboard in features/admin is ready, untested).
export default function AdminHomePage() {
  return <PageHeader title="Dashboard" subtitle="Coming soon." />;
}

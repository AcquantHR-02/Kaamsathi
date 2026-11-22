import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Dashboard" };

// Temporary until Step 6 (EmployerDashboard).
export default function EmployerHomePage() {
  return <PageHeader title="Dashboard" subtitle="Your hiring at a glance. Coming soon." />;
}

import type { Metadata } from "next";
import { AdminPlans } from "@/features/payment";

export const metadata: Metadata = { title: "Plans" };

export default function AdminPlansPage() {
  return <AdminPlans />;
}

import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminUsers } from "@/features/admin";

export const metadata: Metadata = { title: "Users" };

// Suspense: filters and page are read from the URL with useSearchParams.
export default function AdminUsersPage() {
  return (
    <Suspense>
      <AdminUsers />
    </Suspense>
  );
}

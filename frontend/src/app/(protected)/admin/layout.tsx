"use client";

import RoleGuard from "@/components/layout/RoleGuard";
import SidebarShell from "@/components/layout/SidebarShell";
import { ADMIN_NAV } from "@/config/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard roles={["ADMIN"]}>
      {(user) => (
        <SidebarShell label="Admin" items={ADMIN_NAV} user={user}>
          {children}
        </SidebarShell>
      )}
    </RoleGuard>
  );
}

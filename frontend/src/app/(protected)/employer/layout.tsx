"use client";

import RoleGuard from "@/components/layout/RoleGuard";
import SidebarShell from "@/components/layout/SidebarShell";
import { EMPLOYER_NAV } from "@/config/navigation";

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard roles={["COMPANY_OWNER", "RECRUITER"]}>
      {(user) => (
        <SidebarShell label="Employer" items={EMPLOYER_NAV} user={user}>
          {children}
        </SidebarShell>
      )}
    </RoleGuard>
  );
}

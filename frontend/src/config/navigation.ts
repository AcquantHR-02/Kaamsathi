import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Building2,
  CreditCard,
  Database,
  LayoutDashboard,
  Package,
  ScrollText,
  Users,
  UsersRound,
  Wallet,
} from "lucide-react";
import type { Role } from "@/types";
import { ROUTES } from "./constants";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Only these roles see the link (default: everyone in the area). */
  roles?: Role[];
}

// Sidebar links per area (templates 03-company/EmployerDashboard, 11-admin/AdminDashboard).
// Team, company and billing endpoints are COMPANY_OWNER only, so recruiters don't get those links.
export const EMPLOYER_NAV: NavItem[] = [
  { label: "Dashboard", href: ROUTES.EMPLOYER_HOME, icon: LayoutDashboard },
  { label: "Jobs", href: `${ROUTES.EMPLOYER_HOME}/jobs`, icon: Briefcase },
  { label: "Applicants", href: `${ROUTES.EMPLOYER_HOME}/applicants`, icon: UsersRound },
  { label: "Team", href: `${ROUTES.EMPLOYER_HOME}/team`, icon: Users, roles: ["COMPANY_OWNER"] },
  { label: "Company", href: `${ROUTES.EMPLOYER_HOME}/company`, icon: Building2, roles: ["COMPANY_OWNER"] },
  { label: "Plans & billing", href: `${ROUTES.EMPLOYER_HOME}/billing`, icon: CreditCard, roles: ["COMPANY_OWNER"] },
];

export const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: ROUTES.ADMIN_HOME, icon: LayoutDashboard },
  { label: "Companies", href: `${ROUTES.ADMIN_HOME}/companies`, icon: Building2 },
  { label: "Payments", href: `${ROUTES.ADMIN_HOME}/payments`, icon: Wallet },
  { label: "Plans", href: `${ROUTES.ADMIN_HOME}/plans`, icon: Package },
  { label: "Users", href: `${ROUTES.ADMIN_HOME}/users`, icon: Users },
  { label: "Jobs", href: `${ROUTES.ADMIN_HOME}/jobs`, icon: Briefcase },
  { label: "Master data", href: `${ROUTES.ADMIN_HOME}/master-data`, icon: Database },
  { label: "Audit log", href: `${ROUTES.ADMIN_HOME}/audit-log`, icon: ScrollText },
];

export const ROLE_LABEL: Record<Role, string> = {
  SEEKER: "Job seeker",
  COMPANY_OWNER: "Owner",
  RECRUITER: "Recruiter",
  ADMIN: "Admin",
};

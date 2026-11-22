import type { BadgeTone } from "@/components/ui/StatusBadge";
import type { Role, UserStatus } from "@/types";

// Admin wording (template AdminUsers). The shell's ROLE_LABEL is shorter ("Owner") on purpose.

export const USER_ROLE_LABEL: Record<Role, string> = {
  SEEKER: "Seeker",
  COMPANY_OWNER: "Company owner",
  RECRUITER: "Recruiter",
  ADMIN: "Admin",
};

export const USER_STATUS: Record<UserStatus, { label: string; tone: BadgeTone }> = {
  ACTIVE: { label: "Active", tone: "ok" },
  UNVERIFIED: { label: "Unverified", tone: "warn" },
  SUSPENDED: { label: "Suspended", tone: "bad" },
};

export const isRole = (v: string | null): v is Role => !!v && v in USER_ROLE_LABEL;
export const isUserStatus = (v: string | null): v is UserStatus => !!v && v in USER_STATUS;

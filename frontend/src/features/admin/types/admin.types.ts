import type { CurrentUser, NamedRef, Role, UserStatus } from "@/types";

// Mirrors backend admin DTOs (admin/dto).

export interface Dashboard {
  users: { seekers: number; companyOwners: number; recruiters: number; admins: number; suspended: number };
  companies: { pending: number; verified: number; rejected: number };
  jobs: { live: number };
  applications: { total: number; last30Days: number };
  payments: { pendingApproval: number; approved: number; approvedRupees: number };
  generatedAt: string;
}

/** One successful admin write (method + path; no request bodies are stored). */
export interface AuditLogEntry {
  id: string;
  adminId: string | null;
  /** null if that admin was deleted. */
  adminEmail: string | null;
  method: string;
  path: string;
  targetId: string | null;
  /** e.g. COMPANY_VERIFIED; null on rows recorded before the backend update. */
  action: string | null;
  /** e.g. COMPANY, USER, JOB. */
  targetType: string | null;
  /** Name at the time of the action, e.g. "TechNova Labs". */
  targetLabel: string | null;
  status: number;
  createdAt: string;
}

export interface AuditLogParams {
  adminId?: string;
  targetId?: string;
  page?: number;
  size?: number;
}

/** AdminUserSummaryResponse (users list + admins list). */
export interface AdminUser extends CurrentUser {
  /** Owner's / recruiter's company; null for seekers, admins, owners without one. */
  company: NamedRef | null;
  /** Owner who still owns a company: Delete would be refused (409). */
  ownsCompany: boolean;
  /** The ADMIN_EMAIL account: can't be changed. */
  mainAdmin: boolean;
}

/** AdminUserDetailResponse (GET /admin/users/{id}). Activity fields depend on the role. */
export interface AdminUserDetail extends AdminUser {
  emailVerified: boolean;
  consentGivenAt: string | null;
  security: { failedLogins: number; maxFailedLogins: number; lockedUntil: string | null; activeSessions: number };
  activity: {
    applications?: number;
    activeApplications?: number;
    savedJobs?: number;
    resumes?: number;
    jobsPosted?: number;
    adminActions?: number;
  };
}

export interface UsersParams {
  /** Email contains (backend). */
  q?: string;
  /** Leave the calling admin out (default false; we show the own row tagged ME). */
  excludeSelf?: boolean;
  role?: Role;
  status?: UserStatus;
  page?: number;
  size?: number;
}

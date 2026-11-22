import type { Role } from "@/types";

export const APP_NAME = "Kaamsathi";

/** Same-origin path; our BFF route handlers (app/api) forward /api/* to the backend (BACKEND_URL). */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password", // backend emails `${frontendUrl}/reset-password?token=…`
  ACCEPT_INVITE: "/accept-invite", // backend emails `${frontendUrl}/accept-invite?token=…`
  SEEKER_HOME: "/seeker",
  EMPLOYER_HOME: "/employer",
  ADMIN_HOME: "/admin",
} as const;

export const SUPPORT_EMAIL = "support@kaamsathi.in";

/** Where each role lands after sign-in. Owner and recruiter share the employer area. */
export const ROLE_HOME: Record<Role, string> = {
  SEEKER: ROUTES.SEEKER_HOME,
  COMPANY_OWNER: ROUTES.EMPLOYER_HOME,
  RECRUITER: ROUTES.EMPLOYER_HOME,
  ADMIN: ROUTES.ADMIN_HOME,
};

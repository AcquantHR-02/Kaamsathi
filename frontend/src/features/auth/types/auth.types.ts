// Request bodies of the auth endpoints, matching backend auth/dto records (rules noted per field).
// Responses: login / signup / accept-invite return CurrentUser (types/index.ts); the rest are 204.

/** POST /api/auth/login. */
export interface LoginRequest {
  email: string; // required, valid email
  password: string; // required (no length rule on login)
}

/** POST /api/auth/signup/seeker and /signup/company (same fields). */
export interface SignupRequest {
  email: string; // required, valid email, ≤ 254
  password: string; // 8–72 characters
  consent: boolean; // must be true (DPDP)
}

/** Which register button the user picked. Admins never register. */
export type SignupKind = "seeker" | "company";

/** The register form (step 1): the account type + the signup body. */
export interface RegisterFormValues extends SignupRequest {
  kind: SignupKind;
}

/** POST /api/auth/verify-email: the email typed at register + the 6-digit code. */
export interface VerifyEmailRequest {
  email: string;
  otp: string; // exactly 6 digits; 10 min, 5 tries
}

/** POST /api/auth/resend-otp (429 if asked again within 60 s). */
export interface ResendOtpRequest {
  email: string;
}

/** POST /api/auth/forgot-password: always 204, whether or not the email exists. */
export interface ForgotPasswordRequest {
  email: string;
}

/** POST /api/auth/reset-password: token from the emailed link (30 min, single use). */
export interface ResetPasswordRequest {
  token: string;
  newPassword: string; // 8–72 characters
}

/** POST /api/auth/invites/accept: no email field, it comes from the invite. */
export interface AcceptInviteRequest {
  token: string;
  password: string; // 8–72 characters
  consent: boolean; // must be true
}

/** Backend error codes the auth screens react to (common/exception/ErrorCode). */
export const AUTH_ERROR = {
  VALIDATION_FAILED: "VALIDATION_FAILED", // 400
  EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS", // 409 signup
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS", // 401 login
  ACCOUNT_LOCKED: "ACCOUNT_LOCKED", // 429 login (5 fails → 15 min)
  ACCOUNT_SUSPENDED: "ACCOUNT_SUSPENDED", // 403 login
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED", // 403 login → show OTP step
  INVALID_OTP: "INVALID_OTP", // 400 verify
  OTP_RESEND_TOO_SOON: "OTP_RESEND_TOO_SOON", // 429 resend
  INVALID_LINK: "INVALID_LINK", // 400 reset / accept invite
  OPERATION_NOT_ALLOWED: "OPERATION_NOT_ALLOWED", // 409 e.g. email already verified
} as const;

/** Same rules as the backend, so the form catches them before a round trip. */
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72;
export const OTP_LENGTH = 6;
export const OTP_RESEND_SECONDS = 60;

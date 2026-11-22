import { baseApi } from "@/store/baseApi";
import type { CurrentUser } from "@/types";
import type {
  AcceptInviteRequest,
  ForgotPasswordRequest,
  LoginRequest,
  ResendOtpRequest,
  ResetPasswordRequest,
  SignupKind,
  SignupRequest,
  VerifyEmailRequest,
} from "../types/auth.types";

// login / logout hit our own BFF routes (app/api/auth/login|logout), which set / clear the httpOnly
// cookies. Everything else goes through the /api forwarder to the backend unchanged.
// Who is signed in lives in lib/session.ts, not in the RTK cache, so no tags here.
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Sets the session cookies; returns the user (never a token). */
    login: builder.mutation<CurrentUser, LoginRequest>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    /** Revokes the refresh token and clears the cookies. Always 204. */
    logout: builder.mutation<void, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),
    /** 201 with the new UNVERIFIED user; a 6-digit code is emailed. */
    signup: builder.mutation<CurrentUser, { kind: SignupKind; body: SignupRequest }>({
      query: ({ kind, body }) => ({ url: `/auth/signup/${kind}`, method: "POST", body }),
    }),
    /** 204: account is ACTIVE, the user can sign in. */
    verifyEmail: builder.mutation<void, VerifyEmailRequest>({
      query: (body) => ({ url: "/auth/verify-email", method: "POST", body }),
    }),
    /** 204 (also for unknown / verified emails); 429 within 60 s of the last code. */
    resendOtp: builder.mutation<void, ResendOtpRequest>({
      query: (body) => ({ url: "/auth/resend-otp", method: "POST", body }),
    }),
    /** Always 204, so nobody can test which emails have accounts. */
    forgotPassword: builder.mutation<void, ForgotPasswordRequest>({
      query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }),
    }),
    /** 204; signs the user out everywhere (all refresh tokens revoked). */
    resetPassword: builder.mutation<void, ResetPasswordRequest>({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
    }),
    /** 201 with the new ACTIVE RECRUITER; then they sign in. */
    acceptInvite: builder.mutation<CurrentUser, AcceptInviteRequest>({
      query: (body) => ({ url: "/auth/invites/accept", method: "POST", body }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useSignupMutation,
  useVerifyEmailMutation,
  useResendOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useAcceptInviteMutation,
} = authApi;

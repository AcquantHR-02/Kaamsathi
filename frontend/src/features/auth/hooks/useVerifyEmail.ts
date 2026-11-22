"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { App } from "antd";
import { ROUTES } from "@/config/constants";
import { getErrorCode, parseApiError } from "@/lib/parseApiError";
import { useResendOtpMutation, useVerifyEmailMutation } from "../api/authApi";
import { AUTH_ERROR, OTP_RESEND_SECONDS } from "../types/auth.types";
import { useCountdown } from "./useCountdown";

/**
 * Register step 2: check the 6-digit code, resend it, count down to the next resend.
 * `sendOnStart`: arrived from Sign in ("Enter code"); the signup code has most likely expired,
 * so a fresh one is sent right away.
 */
export function useVerifyEmail(email: string, sendOnStart: boolean) {
  const router = useRouter();
  const { message } = App.useApp();
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();
  const [error, setError] = useState<string | null>(null);
  const countdown = useCountdown(OTP_RESEND_SECONDS);

  const goToLogin = (text: string) => {
    message.success(text);
    router.push(ROUTES.LOGIN);
  };

  /** Resolves false when the code was refused (the step clears the boxes). */
  const verify = async (otp: string): Promise<boolean> => {
    setError(null);
    try {
      await verifyEmail({ email, otp }).unwrap();
      goToLogin("Email confirmed. Sign in to continue.");
      return true;
    } catch (err) {
      if (getErrorCode(err) === AUTH_ERROR.OPERATION_NOT_ALLOWED) {
        goToLogin("This email is already confirmed. Sign in to continue.");
        return true;
      }
      setError(parseApiError(err, "Couldn't check the code. Try again."));
      return false;
    }
  };

  const resend = async (atStart = false): Promise<boolean> => {
    setError(null);
    try {
      await resendOtp({ email }).unwrap();
      countdown.restart();
      message.success(`We sent a new code to ${email}.`);
      return true;
    } catch (err) {
      // At start a 429 only means a code went out under a minute ago: it's still valid.
      if (!(atStart && getErrorCode(err) === AUTH_ERROR.OTP_RESEND_TOO_SOON)) {
        setError(parseApiError(err, "Couldn't send a new code. Try again."));
      }
      return false;
    }
  };

  // Ref guard: dev Strict Mode runs effects twice, and each run would email another code.
  const sentAtStart = useRef(false);
  useEffect(() => {
    if (!sendOnStart || sentAtStart.current) return;
    sentAtStart.current = true;
    void resend(true);
  });

  return {
    verify,
    resend: () => resend(),
    isVerifying,
    isResending,
    error,
    clearError: () => setError(null),
    secondsLeft: countdown.secondsLeft,
  };
}

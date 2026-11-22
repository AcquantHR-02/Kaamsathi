"use client";

import { useState } from "react";
import { getErrorCode, parseApiError } from "@/lib/parseApiError";
import { useResetPasswordMutation } from "../api/authApi";
import { AUTH_ERROR } from "../types/auth.types";

export type ResetStage = "form" | "done" | "invalid";

/** `token` comes from the emailed link; without one there is nothing to submit. */
export function useResetPassword(token: string | null) {
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<ResetStage>(() => (token ? "form" : "invalid"));

  const handleSubmit = async ({ newPassword }: { newPassword: string }) => {
    if (!token) return;
    setError(null);
    try {
      await resetPassword({ token, newPassword }).unwrap();
      setStage("done");
    } catch (err) {
      // Unknown, used and expired links share one code on purpose; all need a fresh link.
      if (getErrorCode(err) === AUTH_ERROR.INVALID_LINK) setStage("invalid");
      else setError(parseApiError(err, "Couldn't save the password. Try again."));
    }
  };

  return { handleSubmit, isLoading, error, clearError: () => setError(null), stage };
}

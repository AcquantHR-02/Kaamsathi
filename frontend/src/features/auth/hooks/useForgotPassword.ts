"use client";

import { useState } from "react";
import { parseApiError } from "@/lib/parseApiError";
import { useForgotPasswordMutation } from "../api/authApi";
import type { ForgotPasswordRequest } from "../types/auth.types";

export function useForgotPassword() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async ({ email }: ForgotPasswordRequest) => {
    setError(null);
    try {
      // Backend answers 204 for known and unknown emails alike, so "sent" never reveals an account.
      await forgotPassword({ email: email.trim() }).unwrap();
      setSent(true);
    } catch (err) {
      setError(parseApiError(err, "Couldn't send the link. Try again."));
    }
  };

  return {
    handleSubmit,
    isLoading,
    error,
    clearError: () => setError(null),
    sent,
    tryAgain: () => setSent(false),
  };
}

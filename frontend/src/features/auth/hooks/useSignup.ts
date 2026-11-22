"use client";

import { useState } from "react";
import { parseApiError } from "@/lib/parseApiError";
import { useSignupMutation } from "../api/authApi";
import { AUTH_ERROR, type RegisterFormValues } from "../types/auth.types";

const SIGNUP_ERRORS = {
  [AUTH_ERROR.EMAIL_ALREADY_EXISTS]:
    "An account with this email already exists. Sign in, or reset your password if you forgot it.",
};

/** Register step 1. On success the backend has emailed a 6-digit code; `onCreated` moves to step 2. */
export function useSignup(onCreated: (email: string) => void) {
  const [signup, { isLoading }] = useSignupMutation();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async ({ kind, email, password, consent }: RegisterFormValues) => {
    setError(null);
    const cleanEmail = email.trim();
    try {
      await signup({ kind, body: { email: cleanEmail, password, consent } }).unwrap();
      onCreated(cleanEmail);
    } catch (err) {
      setError(parseApiError(err, "Couldn't create your account. Try again.", SIGNUP_ERRORS));
    }
  };

  return { handleSubmit, isLoading, error, clearError: () => setError(null) };
}

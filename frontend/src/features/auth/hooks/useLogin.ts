"use client";

import { useState } from "react";
import { getErrorCode, parseApiError } from "@/lib/parseApiError";
import { useLoginMutation } from "../api/authApi";
import { completeSignIn } from "../utils/completeSignIn";
import { AUTH_ERROR, type LoginRequest } from "../types/auth.types";

/** Errors that aren't "try again": the card swaps to a notice with one next step (template AuthStates). */
export type LoginProblem = "locked" | "unverified" | "suspended";

const PROBLEMS: Record<string, LoginProblem> = {
  [AUTH_ERROR.ACCOUNT_LOCKED]: "locked",
  [AUTH_ERROR.EMAIL_NOT_VERIFIED]: "unverified",
  [AUTH_ERROR.ACCOUNT_SUSPENDED]: "suspended",
};

const LOGIN_ERRORS = {
  [AUTH_ERROR.INVALID_CREDENTIALS]:
    "Email or password is wrong. After 5 wrong tries, sign-in is paused for 15 minutes.",
};

/** `?next=/seeker/applications` set by the route guard (Step 3). Only same-site paths, never "//evil.com". */
function safeNext(): string | null {
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : null;
}

export function useLogin() {
  const [login, { isLoading }] = useLoginMutation();
  const [error, setError] = useState<string | null>(null);
  const [problem, setProblem] = useState<{ kind: LoginProblem; email: string } | null>(null);
  // Stays true until the page unloads, so the button doesn't flash back to "Sign in" before the reload.
  const [redirecting, setRedirecting] = useState(false);

  const handleSubmit = async ({ email, password }: LoginRequest) => {
    setError(null);
    const cleanEmail = email.trim();
    try {
      const user = await login({ email: cleanEmail, password }).unwrap();
      setRedirecting(true);
      completeSignIn(user, safeNext());
    } catch (err) {
      const kind = PROBLEMS[getErrorCode(err) ?? ""];
      if (kind) setProblem({ kind, email: cleanEmail });
      else setError(parseApiError(err, "Couldn't sign in. Try again.", LOGIN_ERRORS));
    }
  };

  return {
    handleSubmit,
    isLoading: isLoading || redirecting,
    error,
    clearError: () => setError(null),
    problem,
    clearProblem: () => setProblem(null),
  };
}

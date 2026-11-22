"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { App } from "antd";
import { ROUTES } from "@/config/constants";
import { getErrorCode, parseApiError } from "@/lib/parseApiError";
import { useAcceptInviteMutation, useLoginMutation } from "../api/authApi";
import { AUTH_ERROR } from "../types/auth.types";
import { completeSignIn } from "../utils/completeSignIn";

type AcceptFields = { password: string; consent: boolean };

/** `token` comes from the emailed link (7 days, single use). */
export function useAcceptInvite(token: string | null) {
  const router = useRouter();
  const { message } = App.useApp();
  const [acceptInvite] = useAcceptInviteMutation();
  const [login] = useLoginMutation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(() => !token);

  const handleSubmit = async ({ password, consent }: AcceptFields) => {
    if (!token) return;
    setError(null);
    setBusy(true);
    let email: string;
    try {
      email = (await acceptInvite({ token, password, consent }).unwrap()).email;
    } catch (err) {
      setBusy(false);
      if (getErrorCode(err) === AUTH_ERROR.INVALID_LINK) setInvalid(true);
      else setError(parseApiError(err, "Couldn't join. Try again."));
      return;
    }
    // The account exists now; signing in with the password just typed saves a trip to the login page.
    try {
      completeSignIn(await login({ email, password }).unwrap());
    } catch {
      message.success("You've joined. Sign in to continue.");
      router.push(ROUTES.LOGIN);
    }
  };

  return { handleSubmit, isLoading: busy, error, clearError: () => setError(null), invalid };
}

"use client";

import { useCallback, useSyncExternalStore } from "react";
import { ROUTES } from "@/config/constants";
import { getSession, signalOtherTabs, subscribeSession } from "@/lib/session";
import { useLogoutMutation } from "../api/authApi";

// The server render can't see the httpOnly cookies' owner, so its snapshot is `undefined`
// ("not known yet"). Guards wait for isReady instead of wrongly redirecting to login.
const getServerSnapshot = () => undefined;

export function useAuth() {
  const session = useSyncExternalStore(subscribeSession, getSession, getServerSnapshot);
  const [signOut] = useLogoutMutation();

  const logout = useCallback(async () => {
    // Always 204; if the call fails anyway, still leave this tab signed out.
    await signOut()
      .unwrap()
      .catch(() => undefined);
    signalOtherTabs();
    // Full page load: drops every cached record, and the browser keeps this page on screen
    // until the sign-in page is ready, so there's no blank in between.
    window.location.replace(ROUTES.LOGIN);
  }, [signOut]);

  return { user: session ?? null, isReady: session !== undefined, logout };
}

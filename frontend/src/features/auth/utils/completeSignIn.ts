import { ROLE_HOME } from "@/config/constants";
import { handOffSession, setSession } from "@/lib/session";
import type { CurrentUser } from "@/types";

/** After the session cookies are set: share the user with other tabs, then open their area. */
export function completeSignIn(user: CurrentUser, target?: string | null) {
  setSession(user);
  handOffSession(user);
  // Full load (not router.replace): the new area starts clean, with the signed-in layout.
  window.location.replace(target ?? ROLE_HOME[user.role]);
}

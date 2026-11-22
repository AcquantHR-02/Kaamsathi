import { API_BASE_URL } from "@/config/constants";
import type { CurrentUser } from "@/types";

// Who is signed in (same pattern as the Audit app). The sign-in itself is two httpOnly cookies set
// by our Next.js server (lib/server/session.ts); this page can't read them. Who they belong to is
// asked once per page load (GET /api/auth/me) and kept in memory only.
// `undefined` = not asked yet / asking, `null` = signed out.

type SessionState = CurrentUser | null | undefined;

/** Another tab signed in or out: written with a fresh value so its "storage" event fires here. */
const SIGNAL_KEY = "kaamsathi.auth-signal";
/** Sign-in reloads the page: the user rides along once, so the new page needn't wait for /me. */
const HANDOFF_KEY = "kaamsathi.handoff";

let state: SessionState = undefined;
let checking: Promise<void> | null = null;
const listeners = new Set<() => void>();

function set(next: SessionState): void {
  state = next;
  listeners.forEach((listener) => listener());
}

/** Asks who the cookies belong to. Any failure counts as signed out (login shows). */
function check(): Promise<void> {
  checking ??= fetch(`${API_BASE_URL}/auth/me`, { cache: "no-store" })
    .then(async (res) => set(res.ok ? ((await res.json()) as CurrentUser) : null))
    .catch(() => set(null))
    .finally(() => {
      checking = null;
    });
  return checking;
}

export function getSession(): SessionState {
  return state;
}

/** After sign-in / sign-out, or when the user changed (photo, role after transfer). */
export function setSession(user: CurrentUser | null): void {
  set(user);
  signalOtherTabs();
}

/** Asks /me again (e.g. after registering a company or accepting an invite). */
export function refreshSession(): Promise<void> {
  return check();
}

/** Tells other tabs to re-check who is signed in. */
export function signalOtherTabs(): void {
  try {
    localStorage.setItem(SIGNAL_KEY, String(Date.now()));
  } catch {
    // Storage blocked: other tabs notice on their next request instead (401).
  }
}

/** Call right before the post-sign-in reload. Read once and removed. */
export function handOffSession(user: CurrentUser): void {
  try {
    sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(user));
  } catch {
    // Storage blocked: the new page just asks /me.
  }
}

function takeHandoff(): CurrentUser | null {
  try {
    const raw = sessionStorage.getItem(HANDOFF_KEY);
    sessionStorage.removeItem(HANDOFF_KEY);
    return raw ? (JSON.parse(raw) as CurrentUser) : null;
  } catch {
    return null;
  }
}

function onStorage(event: StorageEvent): void {
  if (event.key === SIGNAL_KEY) void check();
}

/** First subscriber starts the /me check; other tabs' sign-in/out re-checks it. */
export function subscribeSession(onChange: () => void): () => void {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(onChange);
  if (state === undefined) {
    const handoff = takeHandoff();
    if (handoff) set(handoff);
    else void check();
  }
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

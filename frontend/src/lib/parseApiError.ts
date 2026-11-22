import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { ApiError } from "@/types";

const OFFLINE_ERROR = "You're offline. Check your internet connection and try again.";
const SERVER_DOWN_ERROR = "Can't reach the server. It may be down or restarting. Try again in a minute.";

const asError = (error: unknown) => error as Partial<FetchBaseQueryError> & { data?: unknown; error?: string };

/** The backend's error code (e.g. "EMAIL_NOT_VERIFIED"), or undefined for network errors. */
export function getErrorCode(error: unknown): string | undefined {
  return (asError(error)?.data as Partial<ApiError> | undefined)?.code;
}

/**
 * Turns any RTK Query error into a message a user can act on.
 * codeMap overrides the backend message for specific error codes, e.g. { ACCOUNT_LOCKED: "…" }.
 */
export function parseApiError(error: unknown, fallback: string, codeMap?: Record<string, string>): string {
  const err = asError(error);
  if (!err) return fallback;

  if (typeof err.status === "number") {
    const body = err.data as Partial<ApiError> | undefined;
    if (body?.code && codeMap?.[body.code]) return codeMap[body.code];
    return body?.message ?? fallback;
  }

  // PARSING_ERROR = got HTML instead of JSON (proxy error page while the backend is down).
  if (err.status === "FETCH_ERROR" || err.status === "TIMEOUT_ERROR" || err.status === "PARSING_ERROR") {
    return typeof navigator !== "undefined" && !navigator.onLine ? OFFLINE_ERROR : SERVER_DOWN_ERROR;
  }

  return err.error ?? fallback;
}

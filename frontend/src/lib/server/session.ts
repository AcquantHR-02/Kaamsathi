import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { ROLE_HOME } from "@/config/constants";
import type { ApiError, Role } from "@/types";

// Backend-for-Frontend session: the backend's tokens live ONLY in httpOnly cookies set by our
// Next.js server. Browser code never sees a token; it just calls /api/* on this site.

export const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

const ACCESS_COOKIE = "ks_at"; // 15-min access JWT
const REFRESH_COOKIE = "ks_rt"; // 7-day refresh token (rotated on every refresh)
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;
/** Drop the access cookie a little before the JWT expires, so we refresh before the backend says 401. */
const ACCESS_EARLY_EXPIRY = 30;

/** Backend TokenResponse (POST /api/auth/login and /refresh). */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

const cookieBase = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function readTokens(request: NextRequest) {
  return {
    access: request.cookies.get(ACCESS_COOKIE)?.value,
    refresh: request.cookies.get(REFRESH_COOKIE)?.value,
  };
}

/**
 * Role claim of the access JWT, read WITHOUT checking the signature. Only for optimistic UX
 * redirects (proxy.ts); every API call is still verified by the backend.
 */
export function unverifiedRole(accessToken: string | undefined): Role | null {
  try {
    const payload = JSON.parse(Buffer.from(accessToken?.split(".")[1] ?? "", "base64url").toString());
    return typeof payload.role === "string" && Object.hasOwn(ROLE_HOME, payload.role) ? (payload.role as Role) : null;
  } catch {
    return null;
  }
}

export function setSessionCookies(response: NextResponse, tokens: TokenResponse): void {
  response.cookies.set(ACCESS_COOKIE, tokens.accessToken, {
    ...cookieBase,
    maxAge: Math.max(tokens.expiresIn - ACCESS_EARLY_EXPIRY, 1),
  });
  response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, { ...cookieBase, maxAge: REFRESH_MAX_AGE });
}

export function clearSessionCookies(response: NextResponse): void {
  response.cookies.set(ACCESS_COOKIE, "", { ...cookieBase, maxAge: 0 });
  response.cookies.set(REFRESH_COOKIE, "", { ...cookieBase, maxAge: 0 });
}

/** Thrown when the backend can't be reached (down / restarting): never treated as "signed out". */
export class BackendUnavailable extends Error {}

// One refresh per refresh token. The backend rotates the token, so a second refresh with the same
// (now revoked) token would fail and sign the user out. Requests that arrive together share one
// call; the result is kept briefly for requests that were already on their way with the old cookie.
const refreshes = new Map<string, Promise<TokenResponse | null>>();
const KEEP_RESULT_MS = 10_000;

/** New tokens, or null when the refresh token is no longer valid (expired, revoked, user suspended). */
export function refreshTokens(refreshToken: string): Promise<TokenResponse | null> {
  let pending = refreshes.get(refreshToken);
  if (!pending) {
    pending = fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    })
      .then(async (res) => {
        if (res.ok) return (await res.json()) as TokenResponse;
        if (res.status >= 500) throw new BackendUnavailable();
        return null;
      })
      .catch((error: unknown) => {
        refreshes.delete(refreshToken); // let the next request try again
        throw error instanceof BackendUnavailable ? error : new BackendUnavailable();
      });
    refreshes.set(refreshToken, pending);
    pending.then(
      () => setTimeout(() => refreshes.delete(refreshToken), KEEP_RESULT_MS),
      () => undefined,
    );
  }
  return pending;
}

/** Same shape as the backend's ApiError, so the frontend handles it like any other error. */
export function backendUnavailable(path: string): NextResponse<ApiError> {
  return NextResponse.json(
    {
      timestamp: new Date().toISOString(),
      status: 502,
      code: "BACKEND_UNAVAILABLE",
      message: "Can't reach the server. It may be down or restarting. Try again in a minute.",
      path,
    },
    { status: 502 },
  );
}

// Response headers the browser may see. Everything else (Set-Cookie, server info) stays behind.
const PASSED_HEADERS = [
  "content-type",
  "content-disposition",
  "cache-control",
  "x-dev-verify-token",
  "x-dev-reset-token",
  "x-dev-invite-token",
];

/** Streams the backend's answer to the browser unchanged (status, body, safe headers). */
export function passThrough(upstream: Response): NextResponse {
  const headers = new Headers();
  for (const name of PASSED_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  const hasBody = upstream.status !== 204 && upstream.status !== 304;
  return new NextResponse(hasBody ? upstream.body : null, { status: upstream.status, headers });
}

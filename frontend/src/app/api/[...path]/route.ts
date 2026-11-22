import type { NextRequest } from "next/server";
import {
  BACKEND_URL,
  BackendUnavailable,
  backendUnavailable,
  clearSessionCookies,
  passThrough,
  readTokens,
  refreshTokens,
  setSessionCookies,
  type TokenResponse,
} from "@/lib/server/session";

// Forwards every /api/* call (except the login/logout routes, which are more specific) to the
// backend, adding the access token from the httpOnly cookie. The destination is ALWAYS our backend:
// only the path comes from the request, so a caller can't send the token anywhere else.

/** Token endpoints the browser must not call directly: the session routes own them. */
const BLOCKED = new Set(["auth/refresh"]);

// Request headers worth forwarding. Cookies are never sent to the backend.
const FORWARDED_HEADERS = ["content-type", "accept"];

async function forward(request: NextRequest, ctx: RouteContext<"/api/[...path]">) {
  const { path } = await ctx.params;
  const joined = path.join("/");
  if (BLOCKED.has(joined)) return new Response(null, { status: 404 });

  const target = new URL(`${BACKEND_URL}/api/${path.map(encodeURIComponent).join("/")}`);
  target.search = request.nextUrl.search;

  // Read once and keep it: after a refresh the same body (JSON or multipart) is sent again.
  const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer();

  const send = (accessToken?: string) => {
    const headers = new Headers();
    for (const name of FORWARDED_HEADERS) {
      const value = request.headers.get(name);
      if (value) headers.set(name, value);
    }
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
    return fetch(target, { method: request.method, headers, body, cache: "no-store", redirect: "manual" });
  };

  const { access, refresh } = readTokens(request);
  let fresh: TokenResponse | null = null;
  let signedOut = false;

  try {
    let token = access;
    // Access cookie already gone (expired): refresh before calling, saving a 401 round trip.
    if (!token && refresh) {
      fresh = await refreshTokens(refresh);
      signedOut = !fresh;
      token = fresh?.accessToken;
    }

    let upstream = await send(token);

    // Token refused anyway (e.g. backend restarted with other keys): one refresh, one retry.
    if (upstream.status === 401 && refresh && !fresh && !signedOut) {
      fresh = await refreshTokens(refresh);
      signedOut = !fresh;
      if (fresh) upstream = await send(fresh.accessToken);
    }

    const response = passThrough(upstream);
    const accountDeleted = joined === "auth/me" && request.method === "DELETE" && upstream.status === 204;
    if (signedOut || accountDeleted) clearSessionCookies(response);
    else if (fresh) setSessionCookies(response, fresh);
    return response;
  } catch (error) {
    if (error instanceof BackendUnavailable || error instanceof TypeError) {
      return backendUnavailable(request.nextUrl.pathname);
    }
    throw error;
  }
}

export { forward as GET, forward as POST, forward as PUT, forward as PATCH, forward as DELETE };

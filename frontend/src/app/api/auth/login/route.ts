import { NextResponse, type NextRequest } from "next/server";
import {
  BACKEND_URL,
  backendUnavailable,
  passThrough,
  setSessionCookies,
  type TokenResponse,
} from "@/lib/server/session";

// POST /api/auth/login {email, password}
// Backend login → tokens go into httpOnly cookies → the browser gets only the user (GET /api/auth/me).
// Backend errors (401 wrong password, 403 not verified / suspended, 429 locked, 400) pass through as-is.
export async function POST(request: NextRequest) {
  const path = request.nextUrl.pathname;

  try {
    const login = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: await request.text(),
      cache: "no-store",
    });
    if (!login.ok) return passThrough(login);

    const tokens = (await login.json()) as TokenResponse;
    const me = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
      cache: "no-store",
    });
    if (!me.ok) return passThrough(me);

    const response = NextResponse.json(await me.json());
    setSessionCookies(response, tokens);
    return response;
  } catch {
    return backendUnavailable(path);
  }
}

import { NextResponse, type NextRequest } from "next/server";
import { BACKEND_URL, clearSessionCookies, readTokens } from "@/lib/server/session";

// POST /api/auth/logout → revokes the refresh token at the backend, then clears both cookies.
// Always 204: even if the backend is down, this browser is signed out.
export async function POST(request: NextRequest) {
  const { refresh } = readTokens(request);

  if (refresh) {
    await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
      cache: "no-store",
    }).catch(() => undefined);
  }

  const response = new NextResponse(null, { status: 204 });
  clearSessionCookies(response);
  return response;
}

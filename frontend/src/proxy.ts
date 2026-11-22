import { NextResponse, type NextRequest } from "next/server";
import { ROLE_HOME, ROUTES } from "@/config/constants";
import { readTokens, unverifiedRole } from "@/lib/server/session";

// Optimistic route guard (no session logic, no backend calls): sends signed-out visitors to sign in
// and other roles to their own area before the page loads. The (protected) layout and the backend
// still decide for real. Auth pages are never redirected, so a revoked cookie can't cause a loop.

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const { access, refresh } = readTokens(request);

  if (!access && !refresh) {
    const login = new URL(ROUTES.LOGIN, request.url);
    login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }

  // No access cookie (expired) → role unknown; the layout refreshes and checks it.
  const role = unverifiedRole(access);
  if (role && !isInside(pathname, ROLE_HOME[role])) {
    return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
  }

  return NextResponse.next();
}

/** "/employer" and "/employer/jobs", but not "/employers". */
const isInside = (pathname: string, area: string) => pathname === area || pathname.startsWith(`${area}/`);

export const config = {
  matcher: ["/seeker/:path*", "/employer/:path*", "/admin/:path*"],
};

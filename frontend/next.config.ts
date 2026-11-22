import type { NextConfig } from "next";

// The browser always calls /api/* on this site. Route handlers in app/api/ forward it to the backend
// (BACKEND_URL) and keep the tokens in httpOnly cookies (lib/server/session.ts). No CORS, no tokens in JS.

// Sent with every page. The backend's own headers only cover API responses, not these pages.
const SECURITY_HEADERS = [
  // No other site may show our pages in a frame (clickjacking on the sign-in form).
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

// No cacheComponents: AntD + styled-components create random ids while rendering, which
// Cache Components refuses to prerender. Our screens are client-fetched anyway (RTK Query).
const nextConfig: NextConfig = {
  reactCompiler: true,
  compiler: {
    styledComponents: true,
  },
  devIndicators: false,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;

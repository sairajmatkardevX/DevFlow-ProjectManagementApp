// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Debug logs
    console.log("🔍 Middleware Check:");
    console.log("  - Path:", pathname);
    console.log("  - Token exists:", !!token);
    console.log("  - Token role:", token?.role);

    // If no token, redirect to login with callbackUrl
    if (!token) {
      console.log("❌ No token - redirecting to login");
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Restrict admin routes
    if (pathname.startsWith("/dashboard/admin") && token?.role !== "admin") {
      console.log("⚠️ Non-admin trying to access admin route");
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    console.log("✅ Access granted");
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Only protect dashboard routes
        const isDashboardRoute = req.nextUrl.pathname.startsWith("/dashboard");
        console.log("📋 Authorized check:", { 
          path: req.nextUrl.pathname, 
          isDashboardRoute,
          hasToken: !!token 
        });
        
        // If it's a dashboard route, require auth
        // If it's not a dashboard route, allow access
        return !isDashboardRoute || !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Debug logs (will show in Vercel logs)
    console.log("🔍 Middleware Check:");
    console.log("  - Path:", pathname);
    console.log("  - Token exists:", !!token);
    console.log("  - Token role:", token?.role);
    console.log("  - Token id:", token?.id);

    // If no token, redirect to login
    if (!token) {
      console.log("❌ No token - redirecting to login");
      return NextResponse.redirect(new URL("/auth/login", req.url));
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
      authorized: ({ token }) => {
        console.log("📋 Authorized callback - Token exists:", !!token);
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
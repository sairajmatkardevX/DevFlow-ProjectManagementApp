// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    console.log("🔍 Middleware:", {
      path: pathname,
      hasToken: !!token,
      email: token?.email || "none",
      role: token?.role || "none"
    });

    // Restrict admin routes
    if (pathname.startsWith("/dashboard/admin") && token?.role !== "admin") {
      console.log("⚠️ Non-admin blocked from admin route");
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    console.log("✅ Access granted");
    return NextResponse.next();
  },
  {
    callbacks: {
      // CRITICAL FIX: This determines if request should even reach middleware
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        
        // Allow public routes (home, auth pages)
        if (pathname === "/" || pathname.startsWith("/auth/")) {
          return true;
        }
        
        // For dashboard routes, require authentication
        if (pathname.startsWith("/dashboard")) {
          const hasToken = !!token;
          console.log("🔐 Auth check for dashboard:", { hasToken, email: token?.email });
          return hasToken;
        }
        
        // Allow all other routes
        return true;
      },
    },
    pages: {
      signIn: "/auth/login",
    },
  }
);

export const config = {
  // Protect dashboard and handle redirects for home/auth
  matcher: [
    "/",
    "/dashboard/:path*",
    "/auth/:path*",
  ],
};
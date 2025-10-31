import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    console.log("🛡️ Middleware Check:", {
      path: pathname,
      hasToken: !!token,
      email: token?.email || "no-email",
      role: token?.role || "no-role",
    });

    // If authenticated and trying to access auth pages, redirect to dashboard
    if (pathname.startsWith("/auth/") && token) {
      console.log("✅ Already logged in - redirecting to dashboard");
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // If not authenticated and trying to access protected routes
    if (pathname.startsWith("/dashboard") && !token) {
      console.log("🔒 No token - redirecting to login");
      return NextResponse.redirect(new URL("/auth/login?callbackUrl=" + pathname, req.url));
    }

    // Role-based access control
    if (pathname.startsWith("/dashboard/admin") && token?.role !== "admin") {
      console.log("⛔ Admin access denied");
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    console.log("✅ Access granted");
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // Let our middleware function handle authorization
    },
    pages: {
      signIn: "/auth/login",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/:path*",
  ],
};
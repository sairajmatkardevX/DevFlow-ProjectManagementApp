import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default withAuth(
  async function middleware(req) {
    const pathname = req.nextUrl.pathname;
    
    // Use getToken for more reliable token access
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production"
    });

    console.log("🛡️ Middleware Check:", {
      path: pathname,
      hasToken: !!token,
      email: token?.email || "no-email",
      role: token?.role || "no-role",
      // Debug cookie info
      cookies: req.cookies.getAll().map(c => c.name)
    });

    // If authenticated and trying to access auth pages, redirect to dashboard
    if (pathname.startsWith("/auth/") && token) {
      console.log("✅ Already logged in - redirecting to dashboard");
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // If not authenticated and trying to access protected routes
    if (pathname.startsWith("/dashboard") && !token) {
      console.log("🔒 No token - redirecting to login");
      const callbackUrl = encodeURIComponent(pathname);
      return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${callbackUrl}`, req.url));
    }

    // Role-based access control
    if (pathname.startsWith("/dashboard/admin") && token?.role !== "admin") {
      console.log("⛔ Admin access denied");
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    console.log("✅ Access granted to:", pathname);
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // Let our middleware function handle authorization
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/:path*",
  ],
};
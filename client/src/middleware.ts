import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const ADMIN_ROLE = "admin";

export default withAuth(
  async function middleware(req) {
    const pathname = req.nextUrl.pathname;
    
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production"
    });

    // If authenticated and trying to access auth pages, redirect to dashboard
    if (pathname.startsWith("/auth/") && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // If not authenticated and trying to access protected routes
    // EXCLUDE NextAuth API routes to prevent loops
    if (pathname.startsWith("/dashboard") && !token && !pathname.startsWith("/api/auth/")) {
      const callbackUrl = encodeURIComponent(pathname);
      return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${callbackUrl}`, req.url));
    }

    // Role-based access control
    if (pathname.startsWith("/dashboard/admin") && token?.role !== ADMIN_ROLE) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/:path*",
    "/api/users/:path*",
    "/api/tasks/:path*",
    "/api/projects/:path*",
  ],
};
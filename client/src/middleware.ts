import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Read the JWT session token created by NextAuth
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production", // Important for Vercel
  });

  console.log("🛡️ Middleware Check:", {
    path: pathname,
    hasToken: !!token,
    email: token?.email || "no-email",
    role: token?.role || "no-role",
    cookies: request.cookies.getAll().map(c => c.name), // Log cookie names
  });

  // 🚪 Public routes (no auth needed)
  const isPublicRoute = pathname === "/" || pathname.startsWith("/auth/");
  
  // 🔐 Protected routes
  const isProtectedRoute = pathname.startsWith("/dashboard");

  // If user is authenticated and tries to access auth pages, redirect to dashboard
  if (isPublicRoute && token && pathname.startsWith("/auth/")) {
    console.log("✅ Already logged in - redirecting to dashboard");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user is not authenticated and tries to access protected routes
  if (isProtectedRoute && !token) {
    console.log("🔒 No token - redirecting to login");
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 🧭 Role-based access control (optional)
  if (pathname.startsWith("/dashboard/admin") && token?.role !== "admin") {
    console.log("⛔ Admin access denied - redirecting to dashboard");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isProtectedRoute && token) {
    console.log("✅ Dashboard access granted");
  }

  return NextResponse.next();
}

// ✅ Run middleware on both auth and protected routes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/:path*",
    // Add other protected routes here
  ],
};
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Get token using getToken (more reliable for JWT)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  console.log("🛡️ Middleware Check:", {
    path: pathname,
    hasToken: !!token,
    email: token?.email || "no-email",
    role: token?.role || "no-role"
  });

  // Public routes - always allow
  if (pathname === "/" || pathname.startsWith("/auth/")) {
    return NextResponse.next();
  }

  // Protected dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      console.log("🔒 No token - redirecting to login");
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Admin route protection
    if (pathname.startsWith("/dashboard/admin") && token.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    console.log("✅ Dashboard access granted");
    return NextResponse.next();
  }

  // Allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/auth/:path*",
  ],
};
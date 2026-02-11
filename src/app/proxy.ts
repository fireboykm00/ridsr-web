// src/app/proxy.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { USER_ROLES } from "@/types";

// Get redirect path based on user role
async function getRedirectPath(userRole?: string): Promise<string> {
  if (!userRole) return "/dashboard";

  switch (userRole) {
    case USER_ROLES.ADMIN:
    case USER_ROLES.NATIONAL_OFFICER:
      return "/dashboard";
    case USER_ROLES.DISTRICT_OFFICER:
      return "/dashboard";
    case USER_ROLES.HEALTH_WORKER:
    case USER_ROLES.LAB_TECHNICIAN:
      return "/dashboard";
    default:
      return "/dashboard";
  }
}

// This function protects routes that require authentication
export default auth(async (req) => {
  // Get the pathname of the request
  const pathname = req.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/faq") ||
    pathname.startsWith("/privacy-policy") ||
    pathname.startsWith("/auth/error"); // Allow access to error page

  // If the user is not authenticated and trying to access a protected route
  if (!req.auth && !isPublicPath) {
    // Redirect to login page with a callback URL
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(url);
  }

  // If user is authenticated and tries to access login page, redirect to appropriate dashboard
  if (req.auth && pathname === "/login") {
    const redirectPath = await getRedirectPath(req.auth.user?.role);
    return NextResponse.redirect(new URL(redirectPath, req.url));
  }

  // If user is authenticated and accesses root path, redirect to appropriate dashboard
  if (req.auth && pathname === "/") {
    const redirectPath = await getRedirectPath(req.auth.user?.role);
    return NextResponse.redirect(new URL(redirectPath, req.url));
  }

  // If user is not authenticated and accesses dashboard or other protected routes, redirect to login
  if (!req.auth && (pathname === "/dashboard" || pathname.startsWith("/dashboard"))) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

// Define which routes the middleware should run for
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
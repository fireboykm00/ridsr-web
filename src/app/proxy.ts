// src/proxy.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// This function protects routes that require authentication
export default auth((req) => {
  // Get the pathname of the request
  const pathname = req.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const isPublicPath = 
    pathname === "/" ||
    pathname === "/login" || 
    pathname === "/register" || 
    pathname.startsWith("/about") ||
    pathname.startsWith("/faq") || 
    pathname.startsWith("/privacy-policy");

  // If the user is not authenticated and trying to access a protected route
  if (!req.auth && !isPublicPath) {
    // Redirect to login page with a callback URL
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(url);
  }

  // If user is authenticated and tries to access login page, redirect to dashboard
  if (req.auth && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // If user is authenticated and accesses root path, redirect to dashboard
  if (req.auth && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // If user is not authenticated and accesses dashboard or other protected routes, redirect to login
  if (!req.auth && (pathname === "/dashboard" || pathname.startsWith("/dashboard"))) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(url);
  }

  // For admin routes, check if user has admin role
  if (pathname.startsWith("/admin") && req.auth?.user?.role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/";
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
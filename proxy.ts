// middleware.ts (root directory)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

const publicRoutes = ["/login", "/signup"];
const protectedRoutes = ["/dashboard"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Get token from cookies
  const token = request.cookies.get("auth_token")?.value;
  
  // Verify token
  let isValidToken = false;
  if (token) {
    const payload = verifyToken(token);
    isValidToken = !!payload;
  }
  
  // Redirect logic
  if (isProtectedRoute && !isValidToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  if (isPublicRoute && isValidToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/signup", "/dashboard/:path*"],
};
// middleware.ts (root directory)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { eq } from "drizzle-orm";

const publicRoutes = ["/login", "/signup", "/create-company"];
const protectedRoutes = ["/dashboard"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isCreateCompanyRoute = pathname === "/dashboard/create-company";
  
  // Get token from cookies
  const token = request.cookies.get("auth_token")?.value;
  
  // Verify token
  let isValidToken = false;
  let userId = null;
  
  if (token) {
    const payload = verifyToken(token);
    isValidToken = !!payload;
    if (payload) {
      userId = payload.id;
    }
  }
  
  // Check if user has company
  let hasCompany = false;
  if (userId) {
    const userCompanies = await db
      .select()
      .from(companies)
      .where(eq(companies.userId, userId))
      .limit(1);
    hasCompany = userCompanies.length > 0;
  }
  
  // Redirect logic for authenticated users without company
  if (isValidToken && !hasCompany && !isCreateCompanyRoute && pathname !== "/logout") {
    // Redirect to create company page if trying to access any other page
    return NextResponse.redirect(new URL("/create-company", request.url));
  }
  
  // Redirect logic for protected routes without authentication
  if (isProtectedRoute && !isValidToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Redirect logic for public routes when authenticated and has company
  if ((isPublicRoute || pathname === "/") && isValidToken && hasCompany && !isCreateCompanyRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  // Redirect to dashboard if already has company and trying to access create-company
  if (isCreateCompanyRoute && isValidToken && hasCompany) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login", 
    "/signup", 
    "/create-company",
    "/dashboard/:path*",
  ],
};
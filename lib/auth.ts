// lib/auth.ts
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cache } from "react";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";
const JWT_EXPIRES_IN = "7d";

export interface TokenPayload {
  id: number;
  email: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value || null;
}

// Updated: Using db.select() instead of db.query for latest Drizzle
export const getCurrentUser = cache(async () => {
  const token = await getAuthToken();
  
  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  
  if (!payload) {
    return null;
  }

  // Use select() instead of query for better type safety
  const usersList = await db.select({
    id: users.id,
    fname: users.fname,
    lname: users.lname,
    email: users.email,
    createdAt: users.createdAt,
  })
  .from(users)
  .where(eq(users.id, payload.id))
  .limit(1);

  if (usersList.length === 0) {
    return null;
  }

  return usersList[0];
});

export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect("/login");
  }
  
  return user;
}

// Optional: Helper to get user with company relation
export async function getCurrentUserWithCompany() {
  const token = await getAuthToken();
  
  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  
  if (!payload) {
    return null;
  }

  // Import companies schema dynamically to avoid circular imports
  const { companies } = await import("@/db/schema");
  
  const usersList = await db.select({
    id: users.id,
    fname: users.fname,
    lname: users.lname,
    email: users.email,
    createdAt: users.createdAt,
    company: {
      id: companies.id,
      name: companies.name,
      rollPrefix: companies.rollPrefix,
      rollInfix: companies.rollInfix,
    },
  })
  .from(users)
  .leftJoin(companies, eq(users.id, companies.userId))
  .where(eq(users.id, payload.id))
  .limit(1);

  if (usersList.length === 0) {
    return null;
  }

  return usersList[0];
}
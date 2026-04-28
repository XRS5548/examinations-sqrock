// app/actions/user.ts
"use server";

import { db } from "@/db";
import { users, companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { cache } from "react";

// Cache the user data to avoid multiple DB calls
export const getUserProfile = cache(async () => {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || !currentUser.id) {
      return null;
    }

    // currentUser.id is already a string from JWT, convert to number
    const userId = Number(currentUser.id);
    if (isNaN(userId)) {
      return null;
    }

    // Fetch user using standard select
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userResult || userResult.length === 0) {
      return null;
    }

    const user = userResult[0];

    // Fetch all companies (users are linked to companies through a different mechanism)
    // Since your schema doesn't have companyId in users table, we need to fetch companies separately
    // For now, return user without company
    // You'll need to determine how users are linked to companies in your schema
    
    return {
      id: user.id,
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      company: null, // Update this based on your relationship logic
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
});

// Helper function to check if user is authenticated
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

// Get user's company ID (useful for data filtering)
export async function getUserCompanyId() {
  // You need to implement logic to get user's company
  // This might come from a session or from a company_users table
  return null;
}
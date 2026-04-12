// actions/auth.ts
"use server";

import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { generateToken, setAuthCookie, clearAuthCookie } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const signupSchema = z.object({
  fname: z.string().min(1, "First name is required"),
  lname: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function signupUser(formData: FormData) {
  try {
    const rawData = {
      fname: formData.get("fname") as string,
      lname: formData.get("lname") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const validated = signupSchema.parse(rawData);

    // Check if user already exists using Drizzle's findFirst
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.email, validated.email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      return { success: false, error: "User with this email already exists" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    // Create user with Drizzle insert
    const newUser = await db.insert(users).values({
      fname: validated.fname,
      lname: validated.lname,
      email: validated.email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date(),
    }).returning();

    if (!newUser || newUser.length === 0) {
      return { success: false, error: "Failed to create user" };
    }

    const user = newUser[0];

    // Generate JWT
    const token = generateToken({ id: user.id, email: user.email });
    
    // Set cookie
    await setAuthCookie(token);

    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error};
    }
    return { success: false, error: "Failed to create account. Please try again." };
  }
}

export async function loginUser(formData: FormData) {
  try {
    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const validated = loginSchema.parse(rawData);

    // Find user using Drizzle's select
    const usersList = await db.select()
      .from(users)
      .where(eq(users.email, validated.email.toLowerCase()))
      .limit(1);

    if (usersList.length === 0) {
      return { success: false, error: "Invalid email or password" };
    }

    const user = usersList[0];

    // Verify password
    const isValid = await bcrypt.compare(validated.password, user.password);
    
    if (!isValid) {
      return { success: false, error: "Invalid email or password" };
    }

    // Generate JWT
    const token = generateToken({ id: user.id, email: user.email });
    
    // Set cookie
    await setAuthCookie(token);

    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error };
    }
    return { success: false, error: "Failed to login. Please try again." };
  }
}

export async function logoutUser() {
  await clearAuthCookie();
  revalidatePath("/login");
  redirect("/login");
}

export async function getSession() {
  const { getCurrentUser } = await import("@/lib/auth");
  return await getCurrentUser();
}
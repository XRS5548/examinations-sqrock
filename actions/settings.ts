// actions/settings.ts
"use server";

import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users, companies } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getUserCompany } from "./company";

const profileSchema = z.object({
  fname: z.string().min(1),
  lname: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6).optional(),
});

const companySchema = z.object({
  companyId: z.string(),
  name: z.string().min(1),
  website: z.string().url().optional().nullable(),
  industry: z.string().optional().nullable(),
  rollPrefix: z.string().min(1).max(10),
  rollInfix: z.string().max(10).optional().nullable(),
  tagline: z.string().max(200).optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
});

export async function updateUserProfile(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const rawData = {
      fname: formData.get("fname") as string,
      lname: formData.get("lname") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const validated = profileSchema.parse(rawData);

    const updateData: any = {
      fname: validated.fname,
      lname: validated.lname,
      email: validated.email.toLowerCase(),
    };

    // Hash password if provided
    if (validated.password && validated.password.length >= 6) {
      updateData.password = await bcrypt.hash(validated.password, 10);
    }

    // Update user
    const [updatedUser] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, user.id))
      .returning();

    if (!updatedUser) {
      return { success: false, error: "Failed to update profile" };
    }

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Update profile error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error};
    }
    return { success: false, error: "Failed to update profile" };
  }
}

export async function updateCompany(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const company = await getUserCompany();
    if (!company) {
      return { success: false, error: "No company found" };
    }

    const rawData = {
      companyId: formData.get("companyId") as string,
      name: formData.get("name") as string,
      website: formData.get("website") as string,
      industry: formData.get("industry") as string,
      rollPrefix: formData.get("rollPrefix") as string,
      rollInfix: formData.get("rollInfix") as string,
      tagline: formData.get("tagline") as string,
      logoUrl: formData.get("logoUrl") as string,
    };

    const validated = companySchema.parse(rawData);
    const companyId = parseInt(validated.companyId);

    // Verify company belongs to user
    if (company.id !== companyId) {
      return { success: false, error: "Unauthorized" };
    }

    // Update company
    const [updatedCompany] = await db.update(companies)
      .set({
        name: validated.name,
        website: validated.website || null,
        industry: validated.industry || null,
        rollPrefix: validated.rollPrefix.toUpperCase(),
        rollInfix: validated.rollInfix || null,
        tagline: validated.tagline || null,
        logoUrl: validated.logoUrl || null,
      })
      .where(eq(companies.id, companyId))
      .returning();

    if (!updatedCompany) {
      return { success: false, error: "Failed to update company" };
    }

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");

    return { success: true, company: updatedCompany };
  } catch (error) {
    console.error("Update company error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error };
    }
    return { success: false, error: "Failed to update company" };
  }
}
// actions/company.ts
"use server";

import { db } from "@/db";
import { companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";

const createCompanySchema = z.object({
  name: z.string().min(1).max(100),
  website: z.string().url().optional().nullable(),
  industry: z.string().optional().nullable(),
  rollPrefix: z.string().min(1).max(10),
  rollInfix: z.string().max(10).optional().nullable(),
  tagline: z.string().max(200).optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
});

export async function createCompany(formData: FormData) {
  try {
    // Get current authenticated user
    const user = await getCurrentUser();
    
    if (!user) {
      return { success: false, error: "You must be logged in to create a company" };
    }

    // Check if user already has a company
    const existingCompanies = await db.select()
      .from(companies)
      .where(eq(companies.userId, user.id))
      .limit(1);

    if (existingCompanies.length > 0) {
      return { success: false, error: "You already have a company registered" };
    }

    const rawData = {
      name: formData.get("name") as string,
      website: formData.get("website") as string,
      industry: formData.get("industry") as string,
      rollPrefix: formData.get("rollPrefix") as string,
      rollInfix: formData.get("rollInfix") as string,
      tagline: formData.get("tagline") as string,
      logoUrl: formData.get("logoUrl") as string,
    };

    const validated = createCompanySchema.parse(rawData);

    // Insert company using Drizzle
    const newCompany = await db.insert(companies).values({
      userId: user.id,
      name: validated.name,
      website: validated.website || null,
      industry: validated.industry || null,
      rollPrefix: validated.rollPrefix.toUpperCase(),
      rollInfix: validated.rollInfix || null,
      tagline: validated.tagline || null,
      logoUrl: validated.logoUrl || null,
      createdAt: new Date(),
    }).returning();

    if (!newCompany || newCompany.length === 0) {
      return { success: false, error: "Failed to create company" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/create-company");
    
    return { success: true, company: newCompany[0] };
  } catch (error) {
    console.error("Create company error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error};
    }
    return { success: false, error: "Failed to create company. Please try again." };
  }
}

export async function checkUserHasCompany() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return { hasCompany: false, error: "Not authenticated" };
    }

    const existingCompanies = await db.select()
      .from(companies)
      .where(eq(companies.userId, user.id))
      .limit(1);

    return { hasCompany: existingCompanies.length > 0 };
  } catch (error) {
    console.error("Check company error:", error);
    return { hasCompany: false, error: "Failed to check company status" };
  }
}

export async function getUserCompany() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return null;
    }

    const companiesList = await db.select()
      .from(companies)
      .where(eq(companies.userId, user.id))
      .limit(1);

    if (companiesList.length === 0) {
      return null;
    }

    return companiesList[0];
  } catch (error) {
    console.error("Get user company error:", error);
    return null;
  }
}
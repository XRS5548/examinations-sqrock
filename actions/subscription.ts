// actions/subscription.ts
"use server";

import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getUserCompany } from "./company";

const subscriptionSchema = z.object({
  planName: z.string(),
  price: z.number(),
  examLimit: z.number(),
  studentLimit: z.number(),
});

export async function createOrUpdateSubscription(data: {
  planName: string;
  price: number;
  examLimit: number;
  studentLimit: number;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const company = await getUserCompany();
    if (!company) {
      return { success: false, error: "No company found. Please create a company first." };
    }

    const validated = subscriptionSchema.parse(data);

    // Get current active subscription
    const currentSubscription = await db.select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.companyId, company.id),
          eq(subscriptions.status, "active")
        )
      )
      .limit(1);

    // Expire current subscription if exists
    if (currentSubscription.length > 0) {
      await db.update(subscriptions)
        .set({ status: "expired" })
        .where(eq(subscriptions.id, currentSubscription[0].id));
    }

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

    // Create new subscription
    const [newSubscription] = await db.insert(subscriptions).values({
      companyId: company.id,
      planName: validated.planName,
      price: validated.price,
      examLimit: validated.examLimit,
      studentLimit: validated.studentLimit,
      startDate: startDate,
      endDate: endDate,
      status: "active",
      createdAt: new Date(),
    }).returning();

    if (!newSubscription) {
      return { success: false, error: "Failed to create subscription" };
    }

    revalidatePath("/dashboard/subscription");
    
    return { success: true, subscription: newSubscription };
  } catch (error) {
    console.error("Create subscription error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error };
    }
    return { success: false, error: "Failed to create subscription" };
  }
}

export async function cancelSubscription(subscriptionId: number) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const company = await getUserCompany();
    if (!company) {
      return { success: false, error: "No company found" };
    }

    // Verify subscription belongs to company
    const existingSubscription = await db.select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.id, subscriptionId),
          eq(subscriptions.companyId, company.id)
        )
      )
      .limit(1);

    if (existingSubscription.length === 0) {
      return { success: false, error: "Subscription not found" };
    }

    // Update subscription status to cancelled
    await db.update(subscriptions)
      .set({ status: "cancelled" })
      .where(eq(subscriptions.id, subscriptionId));

    revalidatePath("/dashboard/subscription");
    
    return { success: true };
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return { success: false, error: "Failed to cancel subscription" };
  }
}

export async function getCurrentSubscription() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return null;
    }

    const company = await getUserCompany();
    if (!company) {
      return null;
    }

    const subscription = await db.select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.companyId, company.id),
          eq(subscriptions.status, "active")
        )
      )
      .limit(1);

    return subscription[0] || null;
  } catch (error) {
    console.error("Get subscription error:", error);
    return null;
  }
}

export async function checkSubscriptionLimits() {
  try {
    const subscription = await getCurrentSubscription();
    
    if (!subscription) {
      return {
        hasActiveSubscription: false,
        examLimit: 0,
        studentLimit: 0,
        examCount: 0,
        studentCount: 0,
        canCreateExam: false,
        canAddStudent: false,
      };
    }

    // Get current exam and student counts
    const { exams, students } = await import("@/db/schema");
    const company = await getUserCompany();
    
    if (!company) {
      return {
        hasActiveSubscription: false,
        examLimit: 0,
        studentLimit: 0,
        examCount: 0,
        studentCount: 0,
        canCreateExam: false,
        canAddStudent: false,
      };
    }

    const examCount = await db.select({ count: sql<number>`count(*)` })
      .from(exams)
      .where(eq(exams.companyId, company.id));

    const studentCount = await db.select({ count: sql<number>`count(*)` })
      .from(students)
      .where(eq(students.companyId, company.id));

    const examLimit = subscription.examLimit === -1 ? Infinity : (subscription.examLimit || 0);
    const studentLimit = subscription.studentLimit === -1 ? Infinity : (subscription.studentLimit || 0);

    return {
      hasActiveSubscription: true,
      examLimit: subscription.examLimit,
      studentLimit: subscription.studentLimit,
      examCount: examCount[0]?.count || 0,
      studentCount: studentCount[0]?.count || 0,
      canCreateExam: (examCount[0]?.count || 0) < examLimit,
      canAddStudent: (studentCount[0]?.count || 0) < studentLimit,
    };
  } catch (error) {
    console.error("Check subscription limits error:", error);
    return {
      hasActiveSubscription: false,
      examLimit: 0,
      studentLimit: 0,
      examCount: 0,
      studentCount: 0,
      canCreateExam: false,
      canAddStudent: false,
    };
  }
}

// Add missing import
import { sql } from "drizzle-orm";
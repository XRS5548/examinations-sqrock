// actions/announcements.ts (updated)
"use server";

import { db } from "@/db";
import { announcements, exams } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getUserCompany } from "./company";

const createAnnouncementSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  examId: z.string().optional(),
});

const updateAnnouncementSchema = z.object({
  announcementId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  examId: z.string().optional(),
});

export async function createAnnouncement(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const company = await getUserCompany();
    if (!company) {
      return { success: false, error: "No company found. Please create a company first." };
    }

    const rawData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      examId: formData.get("examId") as string,
    };

    const validated = createAnnouncementSchema.parse(rawData);

    // Insert announcement with optional exam_id
    const [newAnnouncement] = await db.insert(announcements).values({
      companyId: company.id,
      examId: validated.examId && validated.examId !== "none" ? parseInt(validated.examId) : null,
      title: validated.title,
      description: validated.description,
      createdAt: new Date(),
    }).returning();

    if (!newAnnouncement) {
      return { success: false, error: "Failed to create announcement" };
    }

    revalidatePath("/dashboard/announcements");
    
    return { success: true, announcement: newAnnouncement };
  } catch (error) {
    console.error("Create announcement error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error };
    }
    return { success: false, error: "Failed to create announcement" };
  }
}

export async function updateAnnouncement(formData: FormData) {
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
      announcementId: formData.get("announcementId") as string,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      examId: formData.get("examId") as string,
    };

    const validated = updateAnnouncementSchema.parse(rawData);
    const announcementId = parseInt(validated.announcementId);

    // Check if announcement exists and belongs to company
    const existingAnnouncement = await db.select()
      .from(announcements)
      .where(
        and(
          eq(announcements.id, announcementId),
          eq(announcements.companyId, company.id)
        )
      )
      .limit(1);

    if (existingAnnouncement.length === 0) {
      return { success: false, error: "Announcement not found" };
    }

    // Update announcement
    const [updatedAnnouncement] = await db.update(announcements)
      .set({
        title: validated.title,
        description: validated.description,
        examId: validated.examId && validated.examId !== "none" ? parseInt(validated.examId) : null,
      })
      .where(eq(announcements.id, announcementId))
      .returning();

    if (!updatedAnnouncement) {
      return { success: false, error: "Failed to update announcement" };
    }

    revalidatePath("/dashboard/announcements");
    
    return { success: true, announcement: updatedAnnouncement };
  } catch (error) {
    console.error("Update announcement error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error};
    }
    return { success: false, error: "Failed to update announcement" };
  }
}

export async function deleteAnnouncement(id: number) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const company = await getUserCompany();
    if (!company) {
      return { success: false, error: "No company found" };
    }

    // Check if announcement exists and belongs to company
    const existingAnnouncement = await db.select()
      .from(announcements)
      .where(
        and(
          eq(announcements.id, id),
          eq(announcements.companyId, company.id)
        )
      )
      .limit(1);

    if (existingAnnouncement.length === 0) {
      return { success: false, error: "Announcement not found" };
    }

    // Delete announcement
    await db.delete(announcements).where(eq(announcements.id, id));

    revalidatePath("/dashboard/announcements");
    
    return { success: true };
  } catch (error) {
    console.error("Delete announcement error:", error);
    return { success: false, error: "Failed to delete announcement" };
  }
}

export async function getAnnouncementsByCompany() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return [];
    }

    const company = await getUserCompany();
    if (!company) {
      return [];
    }

    const announcementsList = await db.select({
      id: announcements.id,
      companyId: announcements.companyId,
      examId: announcements.examId,
      title: announcements.title,
      description: announcements.description,
      createdAt: announcements.createdAt,
    })
    .from(announcements)
    .where(eq(announcements.companyId, company.id))
    .orderBy(announcements.createdAt);

    return announcementsList;
  } catch (error) {
    console.error("Get announcements error:", error);
    return [];
  }
}

export async function getAnnouncementWithExam(id: number) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return null;
    }

    const company = await getUserCompany();
    if (!company) {
      return null;
    }

    const result = await db.select({
      id: announcements.id,
      companyId: announcements.companyId,
      examId: announcements.examId,
      title: announcements.title,
      description: announcements.description,
      createdAt: announcements.createdAt,
      examName: exams.name,
    })
    .from(announcements)
    .leftJoin(exams, eq(announcements.examId, exams.id))
    .where(
      and(
        eq(announcements.id, id),
        eq(announcements.companyId, company.id)
      )
    )
    .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Get announcement with exam error:", error);
    return null;
  }
}
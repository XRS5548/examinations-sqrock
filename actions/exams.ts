// actions/exams.ts
"use server";

import { db } from "@/db";
import { exams, companies } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";

const createExamSchema = z.object({
  name: z.string().min(1, "Exam name is required"),
  description: z.string().optional(),
  examDate: z.string().optional(),
  durationMinutes: z.string().optional(),
  totalMarks: z.string().optional(),
  syllabusPdf: z.string().url("Must be a valid URL").optional().nullable(),
  coverImage: z.string().url("Must be a valid URL").optional().nullable(),
});

const updateExamSchema = z.object({
  name: z.string().min(1, "Exam name is required"),
  description: z.string().optional().nullable(),
  examDate: z.string().optional().nullable(),
  durationMinutes: z.string().optional().nullable(),
  totalMarks: z.string().optional().nullable(),
  syllabusPdf: z.string().url("Must be a valid URL").optional().nullable(),
  coverImage: z.string().url("Must be a valid URL").optional().nullable(),
});

// Helper function to get user's company
async function getUserCompany() {
  const user = await getCurrentUser();
  if (!user) return null;

  const userCompanies = await db.select()
    .from(companies)
    .where(eq(companies.userId, user.id))
    .limit(1);

  return userCompanies[0] || null;
}

export async function createExam(formData: FormData) {
  try {
    // Get current authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get user's company
    const company = await getUserCompany();
    if (!company) {
      return { success: false, error: "No company found. Please create a company first." };
    }

    const companyId = company.id;
    
    const rawData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      examDate: formData.get("examDate") as string,
      durationMinutes: formData.get("durationMinutes") as string,
      totalMarks: formData.get("totalMarks") as string,
      syllabusPdf: formData.get("syllabusPdf") as string,
      coverImage: formData.get("coverImage") as string,
    };

    const validated = createExamSchema.parse(rawData);

    // Insert exam using Drizzle
    const newExam = await db.insert(exams).values({
      companyId: companyId,
      name: validated.name,
      description: validated.description || null,
      syllabusPdf: validated.syllabusPdf || null,
      coverImage: validated.coverImage || null,
      examDate: validated.examDate ? new Date(validated.examDate) : null,
      durationMinutes: validated.durationMinutes ? parseInt(validated.durationMinutes) : null,
      totalMarks: validated.totalMarks ? parseInt(validated.totalMarks) : null,
      isLive: false,
      resultAnnounced: false,
      createdAt: new Date(),
    }).returning();

    if (!newExam || newExam.length === 0) {
      return { success: false, error: "Failed to create exam" };
    }

    revalidatePath("/dashboard/exams");
    revalidatePath("/dashboard");
    
    return { success: true, exam: newExam[0] };
  } catch (error) {
    console.error("Create exam error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error };
    }
    return { success: false, error: "Failed to create exam" };
  }
}

export async function updateExam(id: number, formData: FormData) {
  try {
    // Get current authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get user's company
    const company = await getUserCompany();
    if (!company) {
      return { success: false, error: "No company found" };
    }

    // Check if exam exists and belongs to user's company
    const existingExams = await db.select()
      .from(exams)
      .where(eq(exams.id, id))
      .limit(1);

    if (existingExams.length === 0) {
      return { success: false, error: "Exam not found" };
    }

    const exam = existingExams[0];
    if (exam.companyId !== company.id) {
      return { success: false, error: "Unauthorized: Exam does not belong to your company" };
    }

    const rawData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      examDate: formData.get("examDate") as string,
      durationMinutes: formData.get("durationMinutes") as string,
      totalMarks: formData.get("totalMarks") as string,
      syllabusPdf: formData.get("syllabusPdf") as string,
      coverImage: formData.get("coverImage") as string,
    };

    const validated = updateExamSchema.parse(rawData);

    // Update exam using Drizzle
    const updatedExam = await db.update(exams)
      .set({
        name: validated.name,
        description: validated.description || null,
        syllabusPdf: validated.syllabusPdf || null,
        coverImage: validated.coverImage || null,
        examDate: validated.examDate ? new Date(validated.examDate) : null,
        durationMinutes: validated.durationMinutes ? parseInt(validated.durationMinutes) : null,
        totalMarks: validated.totalMarks ? parseInt(validated.totalMarks) : null,
      })
      .where(eq(exams.id, id))
      .returning();

    if (!updatedExam || updatedExam.length === 0) {
      return { success: false, error: "Failed to update exam" };
    }

    revalidatePath("/dashboard/exams");
    revalidatePath(`/dashboard/exams/${id}`);
    
    return { success: true, exam: updatedExam[0] };
  } catch (error) {
    console.error("Update exam error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error };
    }
    return { success: false, error: "Failed to update exam" };
  }
}

// actions/exams.ts (add these helper functions)
export async function getExamName(examId: number) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return null;
    }

    const company = await getUserCompany();
    if (!company) {
      return null;
    }

    const examList = await db.select({
      id: exams.id,
      name: exams.name,
    })
    .from(exams)
    .where(
      and(
        eq(exams.id, examId),
        eq(exams.companyId, company.id)
      )
    )
    .limit(1);

    return examList[0]?.name || null;
  } catch (error) {
    console.error("Get exam name error:", error);
    return null;
  }
}


// actions/exams.ts (add this function)
export async function getCompanyExams() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return [];
    }

    const company = await getUserCompany();
    if (!company) {
      return [];
    }

    const examsList = await db.select({
      id: exams.id,
      name: exams.name,
    })
    .from(exams)
    .where(eq(exams.companyId, company.id))
    .orderBy(exams.createdAt);

    return examsList;
  } catch (error) {
    console.error("Get company exams error:", error);
    return [];
  }
}

export async function deleteExam(id: number) {
  try {
    // Get current authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get user's company
    const company = await getUserCompany();
    if (!company) {
      return { success: false, error: "No company found" };
    }

    // Check if exam exists and belongs to user's company
    const existingExams = await db.select()
      .from(exams)
      .where(eq(exams.id, id))
      .limit(1);

    if (existingExams.length === 0) {
      return { success: false, error: "Exam not found" };
    }

    const exam = existingExams[0];
    if (exam.companyId !== company.id) {
      return { success: false, error: "Unauthorized: Exam does not belong to your company" };
    }

    // Delete exam using Drizzle
    await db.delete(exams).where(eq(exams.id, id));
    
    revalidatePath("/dashboard/exams");
    
    return { success: true };
  } catch (error) {
    console.error("Delete exam error:", error);
    return { success: false, error: "Failed to delete exam" };
  }
}

export async function toggleExamLive(id: number, isLive: boolean) {
  try {
    // Get current authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get user's company
    const company = await getUserCompany();
    if (!company) {
      return { success: false, error: "No company found" };
    }

    // Check if exam exists and belongs to user's company
    const existingExams = await db.select()
      .from(exams)
      .where(eq(exams.id, id))
      .limit(1);

    if (existingExams.length === 0) {
      return { success: false, error: "Exam not found" };
    }

    const exam = existingExams[0];
    if (exam.companyId !== company.id) {
      return { success: false, error: "Unauthorized: Exam does not belong to your company" };
    }

    // Toggle exam live status using Drizzle
    const updatedExam = await db.update(exams)
      .set({ 
        isLive: isLive,
      })
      .where(eq(exams.id, id))
      .returning();

    if (!updatedExam || updatedExam.length === 0) {
      return { success: false, error: "Failed to update exam status" };
    }

    revalidatePath("/dashboard/exams");
    revalidatePath(`/dashboard/exams/${id}`);
    
    return { success: true, exam: updatedExam[0] };
  } catch (error) {
    console.error("Toggle exam live error:", error);
    return { success: false, error: "Failed to toggle exam status" };
  }
}

export async function getExamById(id: number) {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const company = await getUserCompany();
    if (!company) return null;

    const examsList = await db.select()
      .from(exams)
      .where(eq(exams.id, id))
      .limit(1);

    if (examsList.length === 0) return null;
    
    const exam = examsList[0];
    
    // Check if exam belongs to user's company
    if (exam.companyId !== company.id) return null;
    
    return exam;
  } catch (error) {
    console.error("Get exam error:", error);
    return null;
  }
}

export async function getAllExams() {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const company = await getUserCompany();
    if (!company) return [];
    
    const allExams = await db.select()
      .from(exams)
      .where(eq(exams.companyId, company.id))
      .orderBy(exams.createdAt);

    return allExams;
  } catch (error) {
    console.error("Get all exams error:", error);
    return [];
  }
}

// Optional: Get company info for the current user
export async function getCurrentCompany() {
  try {
    const company = await getUserCompany();
    return company;
  } catch (error) {
    console.error("Get current company error:", error);
    return null;
  }
}


// actions/exams.ts (add this function)
// actions/exams.ts (fixed toggleResultAnnounced function)
export async function toggleResultAnnounced(id: number, resultAnnounced: boolean) {
  try {
    // Get current authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get user's company
    const company = await getUserCompany();
    if (!company) {
      return { success: false, error: "No company found" };
    }

    // Check if exam exists and belongs to user's company
    const existingExams = await db.select()
      .from(exams)
      .where(eq(exams.id, id))
      .limit(1);

    if (existingExams.length === 0) {
      return { success: false, error: "Exam not found" };
    }

    const exam = existingExams[0];
    if (exam.companyId !== company.id) {
      return { success: false, error: "Unauthorized: Exam does not belong to your company" };
    }

    // Toggle result announced status
    const updatedExams = await db.update(exams)
      .set({ 
        resultAnnounced: resultAnnounced,
      })
      .where(eq(exams.id, id))
      .returning();

    if (!updatedExams || updatedExams.length === 0) {
      return { success: false, error: "Failed to update result status" };
    }

    revalidatePath("/dashboard/exams");
    revalidatePath(`/dashboard/exams/results/${id}`);
    
    return { success: true, exam: updatedExams[0] };
  } catch (error) {
    console.error("Toggle result announced error:", error);
    return { success: false, error: "Failed to toggle result status" };
  }
}



// actions/exams.ts - Add this function
export async function toggleExamClosed(id: number, isClosed: boolean) {
  try {
    // Get current authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get user's company
    const company = await getUserCompany();
    if (!company) {
      return { success: false, error: "No company found" };
    }

    // Check if exam exists and belongs to user's company
    const existingExams = await db.select()
      .from(exams)
      .where(eq(exams.id, id))
      .limit(1);

    if (existingExams.length === 0) {
      return { success: false, error: "Exam not found" };
    }

    const exam = existingExams[0];
    if (exam.companyId !== company.id) {
      return { success: false, error: "Unauthorized: Exam does not belong to your company" };
    }

    // Toggle exam closed status
    const updatedExam = await db.update(exams)
      .set({ 
        isClosed: isClosed,
      })
      .where(eq(exams.id, id))
      .returning();

    if (!updatedExam || updatedExam.length === 0) {
      return { success: false, error: "Failed to update exam closed status" };
    }

    revalidatePath("/dashboard/exams");
    revalidatePath(`/dashboard/exams/${id}`);
    
    return { success: true, exam: updatedExam[0] };
  } catch (error) {
    console.error("Toggle exam closed error:", error);
    return { success: false, error: "Failed to toggle exam closed status" };
  }
}
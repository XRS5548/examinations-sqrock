// actions/students.ts
"use server";

import { db } from "@/db";
import { students } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getUserCompany } from "./company";

const createStudentSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  dob: z.string().optional().nullable(),
});

const updateStudentSchema = z.object({
  studentId: z.string(),
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  dob: z.string().optional().nullable(),
});

export async function createStudent(formData: FormData) {
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
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      dob: formData.get("dob") as string,
    };

    const validated = createStudentSchema.parse(rawData);

    // Check for duplicate email within the same company
    if (validated.email) {
      const existingStudent = await db.select()
        .from(students)
        .where(
          and(
            eq(students.email, validated.email),
            eq(students.companyId, company.id)
          )
        )
        .limit(1);

      if (existingStudent.length > 0) {
        return { success: false, error: "Student with this email already exists in your company" };
      }
    }

    // Insert student
    const [newStudent] = await db.insert(students).values({
      companyId: company.id,
      name: validated.name,
      email: validated.email || null,
      phone: validated.phone || null,
      dob: validated.dob || null,
      createdAt: new Date(),
    }).returning();

    if (!newStudent) {
      return { success: false, error: "Failed to create student" };
    }

    revalidatePath("/dashboard/students");
    
    return { success: true, student: newStudent };
  } catch (error) {
    console.error("Create student error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error};
    }
    return { success: false, error: "Failed to create student" };
  }
}

export async function updateStudent(formData: FormData) {
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
      studentId: formData.get("studentId") as string,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      dob: formData.get("dob") as string,
    };

    const validated = updateStudentSchema.parse(rawData);
    const studentId = parseInt(validated.studentId);

    // Check if student exists and belongs to company
    const existingStudent = await db.select()
      .from(students)
      .where(
        and(
          eq(students.id, studentId),
          eq(students.companyId, company.id)
        )
      )
      .limit(1);

    if (existingStudent.length === 0) {
      return { success: false, error: "Student not found" };
    }

    // Check for duplicate email within the same company (excluding current student)
    if (validated.email) {
      const duplicateStudent = await db.select()
        .from(students)
        .where(
          and(
            eq(students.email, validated.email),
            eq(students.companyId, company.id),
            eq(students.id, studentId)
          )
        )
        .limit(1);

      if (duplicateStudent.length > 0) {
        return { success: false, error: "Student with this email already exists in your company" };
      }
    }

    // Update student
    const [updatedStudent] = await db.update(students)
      .set({
        name: validated.name,
        email: validated.email || null,
        phone: validated.phone || null,
        dob: validated.dob || null,
      })
      .where(eq(students.id, studentId))
      .returning();

    if (!updatedStudent) {
      return { success: false, error: "Failed to update student" };
    }

    revalidatePath("/dashboard/students");
    
    return { success: true, student: updatedStudent };
  } catch (error) {
    console.error("Update student error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error };
    }
    return { success: false, error: "Failed to update student" };
  }
}

export async function deleteStudent(id: number) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const company = await getUserCompany();
    if (!company) {
      return { success: false, error: "No company found" };
    }

    // Check if student exists and belongs to company
    const existingStudent = await db.select()
      .from(students)
      .where(
        and(
          eq(students.id, id),
          eq(students.companyId, company.id)
        )
      )
      .limit(1);

    if (existingStudent.length === 0) {
      return { success: false, error: "Student not found" };
    }

    // Delete student (exam registrations will cascade due to ON DELETE CASCADE)
    await db.delete(students).where(eq(students.id, id));

    revalidatePath("/dashboard/students");
    
    return { success: true };
  } catch (error) {
    console.error("Delete student error:", error);
    return { success: false, error: "Failed to delete student" };
  }
}

export async function getStudentsByCompany() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return [];
    }

    const company = await getUserCompany();
    if (!company) {
      return [];
    }

    const studentsList = await db.select()
      .from(students)
      .where(eq(students.companyId, company.id))
      .orderBy(students.createdAt);

    return studentsList;
  } catch (error) {
    console.error("Get students error:", error);
    return [];
  }
}
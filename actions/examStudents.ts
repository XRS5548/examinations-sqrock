// actions/examStudents.ts
"use server";

import { db } from "@/db";
import { examRegistrations, students, exams } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getUserCompany } from "./company";

const assignSchema = z.object({
  studentIds: z.array(z.number()),
  examId: z.number(),
  companyPrefix: z.string(),
  companyInfix: z.string().nullable(),
});

export async function assignStudentsToExam(
  studentIds: number[],
  examId: number,
  companyPrefix: string,
  companyInfix: string | null
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const company = await getUserCompany();
    if (!company) {
      return { success: false, error: "No company found" };
    }

    // Verify exam belongs to company
    const examList = await db.select()
      .from(exams)
      .where(eq(exams.id, examId))
      .limit(1);

    if (examList.length === 0) {
      return { success: false, error: "Exam not found" };
    }

    const exam = examList[0];
    if (exam.companyId !== company.id) {
      return { success: false, error: "Unauthorized: Exam does not belong to your company" };
    }

    // Verify all students belong to company
    const studentsList = await db.select()
      .from(students)
      .where(
        and(
          inArray(students.id, studentIds),
          eq(students.companyId, company.id)
        )
      );

    if (studentsList.length !== studentIds.length) {
      return { success: false, error: "Some students do not belong to your company" };
    }

    // Check for already assigned students
    const existingRegistrations = await db.select()
      .from(examRegistrations)
      .where(
        and(
          eq(examRegistrations.examId, examId),
          inArray(examRegistrations.studentId, studentIds)
        )
      );

    if (existingRegistrations.length > 0) {
      const alreadyAssigned = existingRegistrations.map(r => r.studentId);
      return { 
        success: false, 
        error: `Some students are already assigned to this exam. Student IDs: ${alreadyAssigned.join(", ")}` 
      };
    }

    // Generate roll numbers and insert registrations
    const year = new Date().getFullYear().toString();
    const registrations = [];

    for (const studentId of studentIds) {
      const student = studentsList.find(s => s.id === studentId);
      if (!student) continue;

      // Generate roll number: [studentId][PREFIX][YEAR]
      let rollNumber = `${studentId}${companyPrefix}${year}`;
      if (companyInfix) {
        rollNumber = `${studentId}${companyPrefix}${companyInfix}${year}`;
      }

      // Ensure uniqueness by adding suffix if needed
      let isUnique = false;
      let suffix = 0;
      let finalRollNumber = rollNumber;

      while (!isUnique) {
        const existing = await db.select()
          .from(examRegistrations)
          .where(eq(examRegistrations.rollNumber, finalRollNumber))
          .limit(1);

        if (existing.length === 0) {
          isUnique = true;
        } else {
          suffix++;
          finalRollNumber = `${rollNumber}${suffix}`;
        }
      }

      const [registration] = await db.insert(examRegistrations).values({
        examId: examId,
        studentId: studentId,
        rollNumber: finalRollNumber,
        status: "not_started",
        cheating: false,
        score: 0,
      }).returning();

      registrations.push(registration);
    }

    revalidatePath(`/dashboard/exams/students/${examId}`);
    revalidatePath(`/dashboard/exams`);

    return { success: true, registrations };
  } catch (error) {
    console.error("Assign students error:", error);
    return { success: false, error: "Failed to assign students" };
  }
}

export async function removeStudentFromExam(registrationId: number) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const company = await getUserCompany();
    if (!company) {
      return { success: false, error: "No company found" };
    }

    // Get registration details
    const registrationList = await db.select()
      .from(examRegistrations)
      .where(eq(examRegistrations.id, registrationId))
      .limit(1);

    if (registrationList.length === 0) {
      return { success: false, error: "Registration not found" };
    }

    const registration = registrationList[0];

    // Verify exam belongs to company
    if (!registration.examId) {
      return { success: false, error: "Invalid registration" };
    }

    const examList = await db.select()
      .from(exams)
      .where(eq(exams.id, registration.examId))
      .limit(1);

    if (examList.length === 0) {
      return { success: false, error: "Exam not found" };
    }

    const exam = examList[0];
    if (exam.companyId !== company.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Delete registration (cascade will handle related data)
    await db.delete(examRegistrations).where(eq(examRegistrations.id, registrationId));

    revalidatePath(`/dashboard/exams/students/${registration.examId}`);
    revalidatePath(`/dashboard/exams`);

    return { success: true };
  } catch (error) {
    console.error("Remove student error:", error);
    return { success: false, error: "Failed to remove student" };
  }
}

export async function getExamRegistrations(examId: number) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return [];
    }

    const company = await getUserCompany();
    if (!company) {
      return [];
    }

    // Verify exam belongs to company
    const examList = await db.select()
      .from(exams)
      .where(eq(exams.id, examId))
      .limit(1);

    if (examList.length === 0 || examList[0].companyId !== company.id) {
      return [];
    }

    const registrations = await db.select()
      .from(examRegistrations)
      .where(eq(examRegistrations.examId, examId));

    // Fetch student details
    const studentIds = registrations.map(r => r.studentId);
    if (studentIds.length === 0) return [];

    const studentsList = await db.select()
      .from(students)
      .where(inArray(students.id, studentIds as number[]));

    // Combine data
    return registrations.map(reg => ({
      ...reg,
      student: studentsList.find(s => s.id === reg.studentId),
    }));
  } catch (error) {
    console.error("Get exam registrations error:", error);
    return [];
  }
}
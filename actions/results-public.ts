// actions/results-public.ts
"use server";

import { db } from "@/db";
import { examRegistrations, students, exams, announcements, articles, companies } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { z } from "zod";

const searchSchema = z.object({
  rollNumber: z.string().min(1),
  email: z.string().email("Invalid email address"),
});

export async function searchStudentResult(formData: FormData) {
  try {
    const rawData = {
      rollNumber: formData.get("rollNumber") as string,
      email: formData.get("email") as string,
    };

    const validated = searchSchema.parse(rawData);

    // Find registration by roll number
    const registrationList = await db
      .select()
      .from(examRegistrations)
      .where(eq(examRegistrations.rollNumber, validated.rollNumber))
      .limit(1);

    if (registrationList.length === 0) {
      return { success: false, error: "Invalid roll number" };
    }

    const registration = registrationList[0];

    // Check if studentId exists
    if (!registration.studentId) {
      return { success: false, error: "Student not associated with this registration" };
    }

    // Get student details
    const studentList = await db
      .select()
      .from(students)
      .where(eq(students.id, registration.studentId))
      .limit(1);

    if (studentList.length === 0) {
      return { success: false, error: "Student not found" };
    }

    const student = studentList[0];

    // Verify email (case insensitive)
    if (student.email?.toLowerCase() !== validated.email.toLowerCase()) {
      return { success: false, error: "Invalid email address" };
    }

    // Check if examId exists
    if (!registration.examId) {
      return { success: false, error: "Exam not associated with this registration" };
    }

    // Get exam details
    const examList = await db
      .select()
      .from(exams)
      .where(eq(exams.id, registration.examId))
      .limit(1);

    if (examList.length === 0) {
      return { success: false, error: "Exam not found" };
    }

    const exam = examList[0];

    // Check if results are announced
    if (!exam.resultAnnounced) {
      return { success: false, error: "Results not announced yet. Please check back later." };
    }

    const score = registration.score ?? 0;
    const totalMarks = exam.totalMarks ?? 0;
    const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;

    return {
      success: true,
      result: {
        id: registration.id,
        rollNumber: registration.rollNumber,
        studentName: student.name,
        studentEmail: student.email,
        examName: exam.name,
        examTotalMarks: totalMarks,
        score: score,
        percentage,
        cheating: registration.cheating ?? false,
        submittedAt: registration.submittedAt,
        rank: null,
      },
    };
  } catch (error) {
    console.error("Search result error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error };
    }
    return { success: false, error: "Failed to search result" };
  }
}

export async function getLatestDeclaredResults(limit: number = 10) {
  try {
    const results = await db
      .select({
        id: exams.id,
        examName: exams.name,
        companyName: companies.name,
        resultAnnounced: exams.resultAnnounced,
        declaredAt: exams.createdAt,
      })
      .from(exams)
      .leftJoin(companies, eq(exams.companyId, companies.id))
      .where(eq(exams.resultAnnounced, true))
      .orderBy(desc(exams.createdAt))
      .limit(limit);

    return results;
  } catch (error) {
    console.error("Get latest declared results error:", error);
    return [];
  }
}

export async function getResultStats() {
  try {
    const declaredResults = await db
      .select({ count: sql<number>`count(*)` })
      .from(exams)
      .where(eq(exams.resultAnnounced, true));

    const evaluatedStudents = await db
      .select({ count: sql<number>`count(*)` })
      .from(examRegistrations)
      .where(eq(examRegistrations.status, "completed"));

    const activeExams = await db
      .select({ count: sql<number>`count(*)` })
      .from(exams)
      .where(eq(exams.isLive, true));

    return {
      totalDeclared: Number(declaredResults[0]?.count || 0),
      evaluatedStudents: Number(evaluatedStudents[0]?.count || 0),
      activeExams: Number(activeExams[0]?.count || 0),
    };
  } catch (error) {
    console.error("Get result stats error:", error);
    return { totalDeclared: 0, evaluatedStudents: 0, activeExams: 0 };
  }
}

export async function getSidebarData() {
  try {
    const [announcementsList, liveExamsList, articlesList] = await Promise.all([
      db.select().from(announcements).orderBy(desc(announcements.createdAt)).limit(5),
      db.select().from(exams).where(eq(exams.isLive, true)).orderBy(desc(exams.examDate)).limit(5),
      db.select().from(articles).orderBy(desc(articles.createdAt)).limit(5),
    ]);

    return {
      announcements: announcementsList,
      liveExams: liveExamsList,
      articles: articlesList,
    };
  } catch (error) {
    console.error("Get sidebar data error:", error);
    return { announcements: [], liveExams: [], articles: [] };
  }
}
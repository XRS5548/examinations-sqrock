// actions/exam.ts (complete file with all imports and functions)
"use server";

import { db } from "@/db";
import { examRegistrations, students, studentAnswers, questions, exams, cheatingLogs, examAttemptLogs } from "@/db/schema";
import { and, count, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// actions/exam.ts (updated verifyStudent function)
const verifySchema = z.object({
  rollNumber: z.string().min(1),
  email: z.string().email("Invalid email address"),
});

export async function verifyStudent(formData: FormData) {
  try {
    const rawData = {
      rollNumber: formData.get("rollNumber") as string,
      email: formData.get("email") as string,
    };

    const validated = verifySchema.parse(rawData);

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

    // Check if examId exists
    if (!registration.examId) {
      return { success: false, error: "Exam not associated with this registration" };
    }

    // Check if exam is live
    const examList = await db
      .select()
      .from(exams)
      .where(eq(exams.id, registration.examId))
      .limit(1);

    if (examList.length === 0) {
      return { success: false, error: "Exam not found" };
    }

    const exam = examList[0];

    if (!exam.isLive) {
      return { success: false, error: "This exam is not currently live. Please check back later." };
    }

    // Check if exam date has passed
    if (exam.examDate && new Date(exam.examDate) < new Date()) {
      return { success: false, error: "This exam date has passed. Cannot start the exam." };
    }

    // Check if already completed
    if (registration.status === "completed") {
      return { success: false, error: "You have already completed this exam" };
    }

    // Check if studentId exists
    if (!registration.studentId) {
      return { success: false, error: "Student not associated with this registration" };
    }

    // Find student and verify email
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

    // Update registration status to in_progress
    await db
      .update(examRegistrations)
      .set({
        status: "in_progress",
        startedAt: new Date(),
      })
      .where(eq(examRegistrations.id, registration.id));

    return {
      success: true,
      examId: registration.examId,
      registrationId: registration.id,
    };
  } catch (error) {
    console.error("Verify student error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error };
    }
    return { success: false, error: "Failed to verify student" };
  }
}
export async function submitExam(formData: FormData) {
  try {
    const registrationId = parseInt(formData.get("registrationId") as string);
    const answersJson = formData.get("answers") as string;
    const answers = JSON.parse(answersJson) as Record<number, string>;

    if (isNaN(registrationId)) {
      return { success: false, error: "Invalid registration ID" };
    }

    // Get registration to verify it exists
    const registrationList = await db
      .select()
      .from(examRegistrations)
      .where(eq(examRegistrations.id, registrationId))
      .limit(1);

    if (registrationList.length === 0) {
      return { success: false, error: "Registration not found" };
    }

    const registration = registrationList[0];

    if (registration.status === "completed") {
      return { success: false, error: "Exam already submitted" };
    }

    // Save each answer
    for (const [questionId, answer] of Object.entries(answers)) {
      const qId = parseInt(questionId);
      
      if (isNaN(qId)) continue;

      // Get question to check type
      const questionList = await db
        .select()
        .from(questions)
        .where(eq(questions.id, qId))
        .limit(1);

      if (questionList.length === 0) continue;

      const question = questionList[0];

      if (question.questionType === "mcq") {
        // For MCQ, store selected option ID
        const selectedOptionId = parseInt(answer);
        await db.insert(studentAnswers).values({
          registrationId: registrationId,
          questionId: qId,
          selectedOptionId: isNaN(selectedOptionId) ? null : selectedOptionId,
          answerText: null,
        });
      } else {
        // For subjective, store text answer
        await db.insert(studentAnswers).values({
          registrationId: registrationId,
          questionId: qId,
          selectedOptionId: null,
          answerText: answer,
        });
      }
    }

    // Update registration status to completed
    await db
      .update(examRegistrations)
      .set({
        status: "completed",
        submittedAt: new Date(),
      })
      .where(eq(examRegistrations.id, registrationId));

    revalidatePath(`/start`);
    revalidatePath(`/dashboard/exams/results/${registration.examId}`);

    return { success: true };
  } catch (error) {
    console.error("Submit exam error:", error);
    return { success: false, error: "Failed to submit exam" };
  }
}

export async function getExamQuestions(examId: number) {
  try {
    const questionsList = await db
      .select()
      .from(questions)
      .where(eq(questions.examId, examId))
      .orderBy(questions.createdAt);

    return questionsList;
  } catch (error) {
    console.error("Get exam questions error:", error);
    return [];
  }
}

export async function checkExamStatus(registrationId: number) {
  try {
    const registrationList = await db
      .select()
      .from(examRegistrations)
      .where(eq(examRegistrations.id, registrationId))
      .limit(1);

    if (registrationList.length === 0) {
      return { exists: false, status: null };
    }

    return {
      exists: true,
      status: registrationList[0].status,
      examId: registrationList[0].examId,
    };
  } catch (error) {
    console.error("Check exam status error:", error);
    return { exists: false, status: null };
  }
}

// actions/exam.ts (add cheating log function)
export async function logCheatingEvent(registrationId: number, eventType: string) {
  try {
    await db.insert(cheatingLogs).values({
      registrationId: registrationId,
      eventType: eventType,
      createdAt: new Date(),
    });

    // Also update exam_registrations cheating flag if multiple events
    const cheatingCount = await db
      .select()
      .from(cheatingLogs)
      .where(eq(cheatingLogs.registrationId, registrationId));

    if (cheatingCount.length >= 3) {
      await db
        .update(examRegistrations)
        .set({ cheating: true })
        .where(eq(examRegistrations.id, registrationId));
    }

    return { success: true };
  } catch (error) {
    console.error("Log cheating event error:", error);
    return { success: false };
  }
}




import { NextRequest, NextResponse } from "next/server";


// Schema for batch validation
const batchCheatingLogSchema = z.object({
  registrationId: z.number(),
  violations: z.array(z.object({
    type: z.string(),
    timestamp: z.number(),
  })),
});

export async function batchCheatingLogs(formData: FormData) {
  try {
    const data = JSON.parse(formData.get("data") as string);
    const validated = batchCheatingLogSchema.parse(data);
    
    const { registrationId, violations } = validated;

    if (!violations || violations.length === 0) {
      return { success: true, message: "No violations to log" };
    }

    // Check if registration exists and exam is still active
    const registration = await db
      .select({
        id: examRegistrations.id,
        status: examRegistrations.status,
      })
      .from(examRegistrations)
      .where(eq(examRegistrations.id, registrationId))
      .limit(1);

    if (registration.length === 0) {
      return { success: false, error: "Registration not found" };
    }

    // Don't log if exam is already completed
    if (registration[0].status === "completed") {
      return { success: false, error: "Exam already completed" };
    }

    // Rate limiting - prevent abuse
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentLogs = await db
      .select({ count: count() })
      .from(cheatingLogs)
      .where(
        and(
          eq(cheatingLogs.registrationId, registrationId),
          sql`${cheatingLogs.createdAt} >= ${oneMinuteAgo}`
        )
      );

    const recentCount = Number(recentLogs[0]?.count) || 0;
    
    // Max 20 violations per minute
    if (recentCount + violations.length > 20) {
      return { 
        success: false, 
        error: "Rate limit exceeded",
        limit: 20,
        current: recentCount 
      };
    }

    // Batch insert all violations
    const insertedLogs = await db.insert(cheatingLogs).values(
      violations.map(v => ({
        registrationId: registrationId,
        eventType: v.type,
        createdAt: new Date(v.timestamp),
      }))
    ).returning({ id: cheatingLogs.id });

    // Get total violation count after batch insert
    const totalViolationsResult = await db
      .select({ count: count() })
      .from(cheatingLogs)
      .where(eq(cheatingLogs.registrationId, registrationId));

    const totalViolations = Number(totalViolationsResult[0]?.count) || 0;

    // Flag exam if too many violations
    let flagged = false;
    if (totalViolations >= 10) {
      await db
        .update(examRegistrations)
        .set({ 
          cheating: true,
        })
        .where(eq(examRegistrations.id, registrationId));
      flagged = true;
    }

    // Log batch event for audit
    await db.insert(examAttemptLogs).values({
      registrationId: registrationId,
      action: "batch_cheating_events",
      data: {
        count: violations.length,
        types: [...new Set(violations.map(v => v.type))],
        totalViolations: totalViolations,
        flagged: flagged,
      },
      createdAt: new Date(),
    });

    return { 
      success: true, 
      logged: violations.length,
      totalViolations: totalViolations,
      flagged: flagged,
      message: flagged ? "Exam flagged for review" : "Violations logged successfully"
    };
    
  } catch (error) {
    console.error("Batch cheating logs error:", error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: "Invalid data format",
        details: error 
      };
    }
    
    return { 
      success: false, 
      error: "Failed to log cheating events" 
    };
  }
}









// actions/examstart.ts
// Add this new function for logging exam activity

export async function logExamActivity(
  registrationId: number,
  action: string,
  data?: any
) {
  try {
    await db.insert(examAttemptLogs).values({
      registrationId,
      action,
      data: data || {},
      createdAt: new Date(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error logging exam activity:", error);
    return { success: false, error: "Failed to log activity" };
  }
}

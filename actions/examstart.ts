// actions/exam.ts (complete file with all imports and functions)
"use server";

import { db } from "@/db";
import { examRegistrations, students, studentAnswers, questions, exams, cheatingLogs } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
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
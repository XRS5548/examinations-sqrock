// actions/examstart.ts (complete file with all imports and functions)
"use server";

import { db } from "@/db";
import { examRegistrations, students, studentAnswers, questions, exams, cheatingLogs, examAttemptLogs, options } from "@/db/schema";
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

    // Check if exam exists
    const examList = await db
      .select()
      .from(exams)
      .where(eq(exams.id, registration.examId))
      .limit(1);

    if (examList.length === 0) {
      return { success: false, error: "Exam not found" };
    }

    const exam = examList[0];

    // 👇 OPTIONAL: Skip isLive check for testing (comment out for production)
    // if (!exam.isLive) {
    //   return { success: false, error: "This exam is not currently live. Please check back later." };
    // }

    // 👇 OPTIONAL: Skip date checks for testing (comment out for production)
    // For production, uncomment these checks
    const now = new Date();
    const examDate = exam.examDate ? new Date(exam.examDate) : null;
    const examCloseDate = exam.examCloseDate ? new Date(exam.examCloseDate) : null;

    // 👇 COMMENT OUT OR REMOVE THESE CHECKS FOR TESTING
    /*
    // Check if exam has started
    if (examDate && examDate > now) {
      const timeUntilStart = Math.floor((examDate.getTime() - now.getTime()) / (1000 * 60));
      const hours = Math.floor(timeUntilStart / 60);
      const minutes = timeUntilStart % 60;
      
      let timeMessage = "";
      if (hours > 0) {
        timeMessage = `${hours} hour${hours > 1 ? 's' : ''}`;
        if (minutes > 0) {
          timeMessage += ` and ${minutes} minute${minutes > 1 ? 's' : ''}`;
        }
      } else {
        timeMessage = `${minutes} minute${minutes > 1 ? 's' : ''}`;
      }
      
      return { 
        success: false, 
        error: `This exam hasn't started yet. It will begin in ${timeMessage}.` 
      };
    }

    // Check if exam close date has passed
    if (examCloseDate && examCloseDate < now) {
      return { 
        success: false, 
        error: "This exam submission window has closed. You can no longer take this exam." 
      };
    }

    // If no close date is set, check if exam date + duration has passed
    if (!examCloseDate && examDate && exam.durationMinutes) {
      const examEndTime = new Date(examDate.getTime() + (exam.durationMinutes * 60 * 1000));
      if (examEndTime < now) {
        return { 
          success: false, 
          error: "This exam duration has expired. You can no longer take this exam." 
        };
      }
    }
    */

    // 👇 OPTIONAL: Add bypass for development environment
    // This allows access if NODE_ENV is development, regardless of dates
    const isDev = process.env.NODE_ENV === "development";
    
    if (!isDev) {
      // Production checks - uncomment for production
      /*
      if (!exam.isLive) {
        return { success: false, error: "This exam is not currently live. Please check back later." };
      }
      
      if (examDate && examDate > now) {
        // ... date not started check
      }
      
      if (examCloseDate && examCloseDate < now) {
        return { 
          success: false, 
          error: "This exam submission window has closed. You can no longer take this exam." 
        };
      }
      */
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

// actions/examstart.ts (updated submitExam function with auto-evaluation)

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

    // Get all questions for this exam
    const examQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.examId, registration.examId!));

    // Get all options for these questions (to check correct answers)
    const questionIds = examQuestions.map(q => q.id);
    let allOptions: any[] = [];
    if (questionIds.length > 0) {
      allOptions = await db
        .select()
        .from(options)
        .where(inArray(options.questionId, questionIds));
    }

    // Create a map of questionId -> correct option IDs
    const correctOptionsMap: Record<number, number[]> = {};
    allOptions.forEach(opt => {
      if (opt.isCorrect) {
        if (!correctOptionsMap[opt.questionId]) {
          correctOptionsMap[opt.questionId] = [];
        }
        correctOptionsMap[opt.questionId].push(opt.id);
      }
    });

    // Track total marks
    let totalMarks = 0;

    // Save each answer and evaluate MCQs
    for (const [questionId, answer] of Object.entries(answers)) {
      const qId = parseInt(questionId);
      
      if (isNaN(qId)) continue;

      // Find the question
      const question = examQuestions.find(q => q.id === qId);
      if (!question) continue;

      let isCorrect = null;
      let marksAwarded = 0;

      if (question.questionType === "mcq") {
        // For MCQ, check if the selected option is correct
        const selectedOptionId = parseInt(answer);
        
        // Check if selected option is in the correct options list
        const correctOptions = correctOptionsMap[qId] || [];
        isCorrect = correctOptions.includes(selectedOptionId);
        
        // Award marks if correct
        if (isCorrect) {
          marksAwarded = question.marks || 1;
          totalMarks += marksAwarded;
        }

        // Save the answer
        await db.insert(studentAnswers).values({
          registrationId: registrationId,
          questionId: qId,
          selectedOptionId: isNaN(selectedOptionId) ? null : selectedOptionId,
          answerText: null,
          isCorrect: isCorrect,
          marksAwarded: marksAwarded,
        });
      } else {
        // For subjective, store text answer (not auto-evaluated)
        await db.insert(studentAnswers).values({
          registrationId: registrationId,
          questionId: qId,
          selectedOptionId: null,
          answerText: answer,
          isCorrect: null, // Will be evaluated manually
          marksAwarded: 0, // Will be awarded manually
        });
      }
    }

    // Update registration status to completed and set score
    await db
      .update(examRegistrations)
      .set({
        status: "completed",
        submittedAt: new Date(),
        score: totalMarks, // Auto-calculated score for MCQs
      })
      .where(eq(examRegistrations.id, registrationId));

    // Log the submission
    await db.insert(examAttemptLogs).values({
      registrationId: registrationId,
      action: "exam_submitted",
      data: {
        totalMarks: totalMarks,
        questionsAnswered: Object.keys(answers).length,
        timestamp: new Date().toISOString(),
      },
      createdAt: new Date(),
    });

    revalidatePath(`/start`);
    revalidatePath(`/dashboard/exams/results/${registration.examId}`);

    return { 
      success: true, 
      score: totalMarks,
      message: `Exam submitted successfully! You scored ${totalMarks} marks.`
    };
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

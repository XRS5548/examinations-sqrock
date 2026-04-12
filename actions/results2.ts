// actions/results.ts
"use server";

import { db } from "@/db";
import { 
  examRegistrations, 
  studentAnswers, 
  questions, 
  options,
  exams 
} from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { getUserCompany } from "./company";

export async function getStudentAnswers(registrationId: number) {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const answers = await db.select({
      id: studentAnswers.id,
      questionId: studentAnswers.questionId,
      selectedOptionId: studentAnswers.selectedOptionId,
      answerText: studentAnswers.answerText,
      isCorrect: studentAnswers.isCorrect,
      marksAwarded: studentAnswers.marksAwarded,
      questionText: questions.question,
      questionType: questions.questionType,
      marks: questions.marks,
    })
    .from(studentAnswers)
    .leftJoin(questions, eq(studentAnswers.questionId, questions.id))
    .where(eq(studentAnswers.registrationId, registrationId));

    // Fetch option details for MCQ questions
    const answersWithOptions = await Promise.all(
      answers.map(async (answer) => {
        let selectedOptionText = null;
        let correctOptionText = null;

        if (answer.questionType === "mcq" && answer.selectedOptionId && answer.questionId) {
          const selectedOption = await db.select()
            .from(options)
            .where(eq(options.id, answer.selectedOptionId))
            .limit(1);
          selectedOptionText = selectedOption[0]?.optionText || null;

          const correctOption = await db.select()
            .from(options)
            .where(and(eq(options.questionId, answer.questionId), eq(options.isCorrect, true)))
            .limit(1);
          correctOptionText = correctOption[0]?.optionText || null;
        }

        return {
          ...answer,
          selectedOptionText,
          correctOptionText,
        };
      })
    );

    return answersWithOptions;
  } catch (error) {
    console.error("Get student answers error:", error);
    return [];
  }
}

export async function evaluateMCQForRegistration(registrationId: number) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get all answers for this registration
    const answers = await db.select()
      .from(studentAnswers)
      .where(eq(studentAnswers.registrationId, registrationId));

    let totalScore = 0;

    for (const answer of answers) {
      if (!answer.questionId) continue;
      
      const question = await db.select()
        .from(questions)
        .where(eq(questions.id, answer.questionId))
        .limit(1);

      if (question.length === 0) continue;
      const currentQuestion = question[0];

      if (currentQuestion.questionType === "mcq" && answer.selectedOptionId) {
        const option = await db.select()
          .from(options)
          .where(eq(options.id, answer.selectedOptionId))
          .limit(1);

        const isCorrect = option.length > 0 && option[0].isCorrect;
        const marksAwarded = isCorrect ? (currentQuestion.marks || 0) : 0;

        await db.update(studentAnswers)
          .set({
            isCorrect: isCorrect,
            marksAwarded: marksAwarded,
          })
          .where(eq(studentAnswers.id, answer.id));

        totalScore += marksAwarded;
      } else if (currentQuestion.questionType === "subjective" && answer.marksAwarded) {
        totalScore += answer.marksAwarded;
      }
    }

    // Update registration score
    await db.update(examRegistrations)
      .set({ score: totalScore })
      .where(eq(examRegistrations.id, registrationId));

    revalidatePath("/dashboard/results");
    
    return { success: true };
  } catch (error) {
    console.error("Evaluate MCQ error:", error);
    return { success: false, error: "Failed to evaluate MCQ answers" };
  }
}

export async function submitManualMarks(answerId: number, marks: number) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Update the answer with manual marks
    const [updatedAnswer] = await db.update(studentAnswers)
      .set({ marksAwarded: marks })
      .where(eq(studentAnswers.id, answerId))
      .returning();

    if (!updatedAnswer) {
      return { success: false, error: "Answer not found" };
    }

    // Get registration ID from answer
    const registration = await db.select()
      .from(studentAnswers)
      .where(eq(studentAnswers.id, answerId))
      .limit(1);

    revalidatePath("/dashboard/results");
    
    return { 
      success: true, 
      registrationId: registration[0]?.registrationId 
    };
  } catch (error) {
    console.error("Submit manual marks error:", error);
    return { success: false, error: "Failed to submit marks" };
  }
}

export async function calculateFinalScore(registrationId: number) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get all answers for this registration
    const answers = await db.select()
      .from(studentAnswers)
      .where(eq(studentAnswers.registrationId, registrationId));

    let totalScore = 0;
    for (const answer of answers) {
      totalScore += answer.marksAwarded || 0;
    }

    // Update registration score
    await db.update(examRegistrations)
      .set({ score: totalScore })
      .where(eq(examRegistrations.id, registrationId));

    revalidatePath("/dashboard/results");
    
    return { success: true, score: totalScore };
  } catch (error) {
    console.error("Calculate final score error:", error);
    return { success: false, error: "Failed to calculate score" };
  }
}

export async function getPendingManualChecks(companyId: number) {
  try {
    // Get all registrations for the company
    const registrations = await db.select({
      id: examRegistrations.id,
    })
    .from(examRegistrations)
    .leftJoin(exams, eq(examRegistrations.examId, exams.id))
    .where(eq(exams.companyId, companyId));

    const registrationIds = registrations.map(r => r.id);

    if (registrationIds.length === 0) return [];

    // Get answers that need manual checking (subjective with no marks awarded)
    const pendingAnswers = await db.select()
      .from(studentAnswers)
      .leftJoin(questions, eq(studentAnswers.questionId, questions.id))
      .where(
        and(
          eq(questions.questionType, "subjective"),
          isNull(studentAnswers.marksAwarded)
        )
      );

    return pendingAnswers;
  } catch (error) {
    console.error("Get pending manual checks error:", error);
    return [];
  }
}
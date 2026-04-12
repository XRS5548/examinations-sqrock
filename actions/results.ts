// actions/results.ts
"use server";

import { db } from "@/db";
import { exams, examRegistrations, studentAnswers, questions, options, students } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { getUserCompany } from "./company";

export async function calculateResults(examId: number) {
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
      return { success: false, error: "Unauthorized" };
    }

    // Get all registrations for this exam
    const registrations = await db.select()
      .from(examRegistrations)
      .where(eq(examRegistrations.examId, examId));

    // Get all questions for this exam
    const questionsList = await db.select()
      .from(questions)
      .where(eq(questions.examId, examId));

    // For each registration, calculate score
    for (const registration of registrations) {
      // Skip if cheating detected
      if (registration.cheating) {
        await db.update(examRegistrations)
          .set({ score: 0 })
          .where(eq(examRegistrations.id, registration.id));
        continue;
      }

      // Get all answers for this registration
      const answers = await db.select()
        .from(studentAnswers)
        .where(eq(studentAnswers.registrationId, registration.id));

      let totalScore = 0;

      // Calculate score based on answers
      for (const answer of answers) {
        const question = questionsList.find(q => q.id === answer.questionId);
        if (!question) continue;

        if (question.questionType === "mcq" && answer.selectedOptionId) {
          // For MCQ, check if selected option is correct
          const option = await db.select()
            .from(options)
            .where(eq(options.id, answer.selectedOptionId))
            .limit(1);

          if (option.length > 0 && option[0].isCorrect) {
            totalScore += question.marks || 0;
            await db.update(studentAnswers)
              .set({ isCorrect: true, marksAwarded: question.marks || 0 })
              .where(eq(studentAnswers.id, answer.id));
          } else {
            await db.update(studentAnswers)
              .set({ isCorrect: false, marksAwarded: 0 })
              .where(eq(studentAnswers.id, answer.id));
          }
        } else if (question.questionType === "subjective") {
          // For subjective, keep existing marks (set by evaluator)
          totalScore += answer.marksAwarded || 0;
        }
      }

      // Update registration score
      await db.update(examRegistrations)
        .set({ score: totalScore })
        .where(eq(examRegistrations.id, registration.id));
    }

    revalidatePath(`/dashboard/exams/results/${examId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Calculate results error:", error);
    return { success: false, error: "Failed to calculate results" };
  }
}

export async function publishResults(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const company = await getUserCompany();
    if (!company) {
      return { success: false, error: "No company found" };
    }

    const examId = parseInt(formData.get("examId") as string);

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
      return { success: false, error: "Unauthorized" };
    }

    // Update exam to published
    await db.update(exams)
      .set({ resultAnnounced: true })
      .where(eq(exams.id, examId));

    revalidatePath(`/dashboard/exams/results/${examId}`);
    revalidatePath(`/dashboard/exams`);
    
    return { success: true };
  } catch (error) {
    console.error("Publish results error:", error);
    return { success: false, error: "Failed to publish results" };
  }
}

export async function getExamResults(examId: number) {
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

    const results = await db.select({
      id: examRegistrations.id,
      rollNumber: examRegistrations.rollNumber,
      score: examRegistrations.score,
      cheating: examRegistrations.cheating,
      submittedAt: examRegistrations.submittedAt,
      studentName: students.name,
      studentEmail: students.email,
      studentPhone: students.phone,
      studentDob: students.dob,
    })
    .from(examRegistrations)
    .leftJoin(students, eq(examRegistrations.studentId, students.id))
    .where(eq(examRegistrations.examId, examId))
    .orderBy(examRegistrations.score);

    return results;
  } catch (error) {
    console.error("Get exam results error:", error);
    return [];
  }
}

export async function updateStudentScore(registrationId: number, newScore: number) {
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

    if (!registration.examId) {
      return { success: false, error: "Invalid registration" };
    }

    // Get exam details
    const examList = await db.select()
      .from(exams)
      .where(eq(exams.id, registration.examId))
      .limit(1);

    if (examList.length === 0 || examList[0].companyId !== company.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Update score
    await db.update(examRegistrations)
      .set({ score: newScore })
      .where(eq(examRegistrations.id, registrationId));

    revalidatePath(`/dashboard/exams/results/${registration.examId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Update student score error:", error);
    return { success: false, error: "Failed to update score" };
  }
}

export async function markCheating(registrationId: number, isCheating: boolean) {
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

    // Get exam details
    if (!registration.examId) {
      return { success: false, error: "Invalid registration" };
    }

    const examList = await db.select()
      .from(exams)
      .where(eq(exams.id, registration.examId))
      .limit(1);

    if (examList.length === 0 || examList[0].companyId !== company.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Update cheating status
    await db.update(examRegistrations)
      .set({ 
        cheating: isCheating,
        score: isCheating ? 0 : registration.score
      })
      .where(eq(examRegistrations.id, registrationId));

    revalidatePath(`/dashboard/exams/results/${registration.examId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Mark cheating error:", error);
    return { success: false, error: "Failed to update cheating status" };
  }
}
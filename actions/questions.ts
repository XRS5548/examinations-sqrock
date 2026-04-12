"use server";

import { db } from "@/db";
import { questions, options } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getUserCompany } from "./company";

/* ================= VALIDATION ================= */

const createQuestionSchema = z.object({
  examId: z.string(),
  question: z.string().min(1, "Question is required"),
  questionType: z.enum(["mcq", "subjective"]),
  marks: z.string().min(1),
  options: z.string().optional(),
  correctOption: z.string().optional(),
});

/* ================= CREATE ================= */

export async function createQuestion(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const company = await getUserCompany();
    if (!company) return { success: false, error: "No company found" };

    /* 🔥 SAFE DATA EXTRACTION */
    const rawData = {
      examId: formData.get("examId")?.toString() || "",
      question: formData.get("question")?.toString() || "",
      questionType: formData.get("questionType") as "mcq" | "subjective",
      marks: formData.get("marks")?.toString() || "",
      options: formData.get("options")?.toString() || "",
      correctOption: formData.get("correctOption")?.toString() || "",
    };

    const validated = createQuestionSchema.parse(rawData);

    /* 🔥 MCQ VALIDATION */
    if (validated.questionType === "mcq") {
      if (!validated.options) {
        return { success: false, error: "Options required for MCQ" };
      }
    }

    /* 🔥 INSERT QUESTION */
    const [newQuestion] = await db
      .insert(questions)
      .values({
        examId: parseInt(validated.examId),
        question: validated.question,
        questionType: validated.questionType,
        marks: parseInt(validated.marks),
        createdAt: new Date(),
      })
      .returning();

    if (!newQuestion) {
      return { success: false, error: "Failed to create question" };
    }

    /* 🔥 INSERT OPTIONS (ONLY MCQ) */
    if (validated.questionType === "mcq") {
      const optionsData = JSON.parse(validated.options || "[]") as Array<{ text: string }>;
      const correctOptionIndex = parseInt(validated.correctOption || "0");

      for (let i = 0; i < optionsData.length; i++) {
        await db.insert(options).values({
          questionId: newQuestion.id,
          optionText: optionsData[i].text,
          isCorrect: i === correctOptionIndex,
        });
      }
    }

    revalidatePath(`/dashboard/exams/questions/${validated.examId}`);

    return { success: true, question: newQuestion };
  } catch (error) {
    console.error("Create question error:", error);

    if (error instanceof z.ZodError) {
      return { success: false, error: error };
    }

    return { success: false, error: "Failed to create question" };
  }
}

/* ================= UPDATE ================= */

export async function updateQuestion(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const questionId = parseInt(formData.get("questionId")?.toString() || "0");
    const questionText = formData.get("question")?.toString() || "";
    const questionType = formData.get("questionType") as "mcq" | "subjective";
    const marks = parseInt(formData.get("marks")?.toString() || "0");

    const optionsData = formData.get("options")?.toString() || "";
    const correctOption = formData.get("correctOption")?.toString() || "0";

    /* 🔥 UPDATE QUESTION */
    const [updatedQuestion] = await db
      .update(questions)
      .set({
        question: questionText,
        questionType: questionType,
        marks: marks,
      })
      .where(eq(questions.id, questionId))
      .returning();

    if (!updatedQuestion) {
      return { success: false, error: "Failed to update question" };
    }

    /* 🔥 HANDLE MCQ */
    if (questionType === "mcq") {
      await db.delete(options).where(eq(options.questionId, questionId));

      const parsedOptions = JSON.parse(optionsData || "[]") as Array<{ text: string }>;
      const correctIndex = parseInt(correctOption);

      for (let i = 0; i < parsedOptions.length; i++) {
        await db.insert(options).values({
          questionId: questionId,
          optionText: parsedOptions[i].text,
          isCorrect: i === correctIndex,
        });
      }
    }

    revalidatePath(`/dashboard/exams/questions/${updatedQuestion.examId}`);

    return { success: true, question: updatedQuestion };
  } catch (error) {
    console.error("Update question error:", error);
    return { success: false, error: "Failed to update question" };
  }
}

/* ================= DELETE ================= */

export async function deleteQuestion(id: number) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const questionData = await db
      .select()
      .from(questions)
      .where(eq(questions.id, id))
      .limit(1);

    if (!questionData.length) {
      return { success: false, error: "Question not found" };
    }

    const examId = questionData[0].examId;

    await db.delete(questions).where(eq(questions.id, id));

    revalidatePath(`/dashboard/exams/questions/${examId}`);

    return { success: true };
  } catch (error) {
    console.error("Delete question error:", error);
    return { success: false, error: "Failed to delete question" };
  }
}